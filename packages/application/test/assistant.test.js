import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,proposeAssistantUpdate} from '@open-mountain/application';
class Memory {
 docs=new Map(); count=0; failAt=Infinity;
 async readJournal(scope,id){return structuredClone(this.docs.get(`${scope}:${id}`)||null);}
 async append(scope,id,journal,event){if(++this.count===this.failAt)throw new Error('disk full');const key=`${scope}:${id}`,old=this.docs.get(key);if(old?._rev!==journal?._rev)throw new Error('conflict');this.docs.set(key,{_id:'journal',version:2,_rev:String(this.count),events:[...(journal?.events||[]),event]});}
}
async function fixture(){
 const storage=new Memory(),service=createWorkspace(storage,{now:()=> '2026-11-22T10:00:00Z'});
 await service.dispatch('user','user-1','user-1',{type:'ProfileConfigured',payload:{username:'alex'}});
 await service.dispatch('community','club','user-1',{type:'CommunityCreated',payload:{name:'Club'}});
 await service.dispatch('community','club','user-1',{type:'TripCreated',payload:{id:'trip',title:'Tour',startDate:'2026-11-22',endDate:'2026-11-22',timeZone:'UTC'}});
 let sequence=0;
 const context={userId:'user-1',communityId:'club',dayId:'trip:2026-11-22'};
 const propose=async(text)=>proposeAssistantUpdate({...context,text,state:(await service.read('community','club')).state,personal:(await service.read('user','user-1')).state,now:'2026-11-22T10:00:00Z',createId:()=>`proposal-${++sequence}`,timeZone:'UTC'});
 return {service,storage,context,propose};
}
test('sentences produce reviewable offline changes without writing, and private notes stay personal',async()=>{
 const f=await fixture(),before=f.storage.count;
 const p=await f.propose('Our objective is to explore the ridge. Plan A is the ridge. Hazards for plan A: wind slabs. Observation: New loading. Visibility is low. Private reflection: I am tired.');
 assert.equal(p.error,'');assert.equal(f.storage.count,before);assert.equal(p.actions.length,3);
 await f.service.applyAssistantProposal(p,f.context);
 const community=await f.service.read('community','club'),personal=await f.service.read('user','user-1');
 assert.equal(community.state.days[f.context.dayId].briefing.objective,'to explore the ridge');
 assert.equal(community.state.days[f.context.dayId].approval,null);
 assert.ok(!JSON.stringify(community).includes('I am tired'));
 assert.equal(personal.state.reflections[`club:${f.context.dayId}`].text,'I am tired.');
 assert.match(Object.values(community.state.days[f.context.dayId].observations)[0].notes,/Visibility is low/);
});
test('unrecognized or ambiguous text, incomplete debrief and invalid context never write',async()=>{
 const f=await fixture(),before=f.storage.count;
 for(const text of ['I think we should do something.', 'Approve the plan.', 'Close the day.', 'Expected conditions: Wind.']){
  const p=await f.propose(text);assert.ok(p.error);assert.equal(p.actions.length,0);await assert.rejects(f.service.applyAssistantProposal(p,f.context));
 }
 const p=await f.propose('Observation: Wind.');await assert.rejects(f.service.applyAssistantProposal(p,{...f.context,dayId:'different'}));
 assert.equal(f.storage.count,before);
});
test('stale proposals reject before writing, and interrupted multi-record saves retry without duplicates',async()=>{
 const f=await fixture();let p=await f.propose('Observation: Wind. Private reflection: Concern.');
 await f.service.dispatch('community','club','user-1',{type:'ObservationRecorded',payload:{dayId:f.context.dayId,id:'other',title:'Other',notes:'Other',location:'',observedAt:'2026-11-22T10:00:00Z'}});
 await assert.rejects(f.service.applyAssistantProposal(p,f.context),/Data changed/);
 p=await f.propose('Observation: Wind. Private reflection: Concern.');
 f.storage.failAt=f.storage.count+2;
 await assert.rejects(f.service.applyAssistantProposal(p,f.context),/disk full/);
 await f.service.applyAssistantProposal(p,f.context);
 await f.service.applyAssistantProposal(p,f.context);
 const community=await f.service.read('community','club');
 assert.equal(Object.values(community.state.days[f.context.dayId].observations).filter(o=>o.notes==='Wind.').length,1);
 assert.equal((await f.service.read('user','user-1')).journal.events.filter(e=>e.type==='ReflectionSaved').length,1);
});
test('trip creation uses explicit dates, and complete debriefs retain all five topics',async()=>{
 const f=await fixture();const p=await f.propose('Create a trip called Traverse from 2026-11-24 to 2026-11-26.');
 assert.equal(p.error,'');await f.service.applyAssistantProposal(p,f.context);
 const created=(await f.service.read('community','club')).state;
 assert.equal(Object.values(created.days).filter(d=>d.tripId!=='trip').length,3);
 const debrief=await f.propose('Expected conditions: Wind; Actual activity: Returned early; Public human factors: Discussed timing; What went well: Clear communication; Next time: Earlier start');
 assert.equal(debrief.error,'');await f.service.applyAssistantProposal(debrief,f.context);
 assert.equal((await f.service.read('community','club')).state.days[f.context.dayId].debrief.change,'Earlier start');
});

test('the first added plan fills the empty A slot and subsequent plans retain their order',async()=>{
 const f=await fixture();const p=await f.propose('Add a plan: Ridge; Add a plan: Forest; Hazards for plan A: Wind; Hazards for plan B: Trees; Move plan B before plan A');
 assert.equal(p.error,'');await f.service.applyAssistantProposal(p,f.context);
 const plans=(await f.service.read('community','club')).state.days[f.context.dayId].briefing.plans;
 assert.deepEqual(plans.map(p=>p.description),['Forest','Ridge']);
 assert.deepEqual(plans.map(p=>p.hazards),['Trees','Wind']);
});

test('private note-status events do not make a reviewed proposal stale or enter community data',async()=>{
 const f=await fixture(),proposal=await f.propose('Observation: Snow.');
 await f.service.dispatch('user','user-1','user-1',{type:'AssistantNoteRecorded',payload:{id:'note-1',text:'Private original note',communityId:'club',dayId:f.context.dayId,context:'Club · Tour'}});
 await f.service.dispatch('user','user-1','user-1',{type:'AssistantNoteUpdated',payload:{id:'note-1',status:'saving'}});
 await f.service.applyAssistantProposal(proposal,f.context);
 assert.ok(!JSON.stringify(await f.service.read('community','club')).includes('Private original note'));
});

test('legacy conversation migration creates stable IDs without dropping available notes',async()=>{
 const {legacyAssistantNotes}=await import('@open-mountain/application');
 const history=[{role:'You',text:'Older note'},{role:'Assistant',text:'Response'},{role:'You',text:'Second note'}];
 const notes=legacyAssistantNotes(history,'club','day','Club · Day');
 assert.equal(notes.length,2);assert.deepEqual(notes,legacyAssistantNotes(history,'club','day','Club · Day'));assert.notEqual(notes[0].id,notes[1].id);assert.equal(notes[0].text,'Older note');
});

test('local model classification preserves full original notes and cannot turn embedded text into actions',async()=>{
 const {proposeClassifiedNote}=await import('@open-mountain/application');const f=await fixture();
 const text='Wind was strong.\nPlan A is a phrase mentioned in my note.\nOriginal second paragraph.';
 const proposal=proposeClassifiedNote({...f.context,text,classified:`Observation: ${text}`,state:(await f.service.read('community','club')).state,personal:(await f.service.read('user','user-1')).state,now:'2026-11-22T10:00:00Z',createId:(()=>{let i=0;return()=>`model-${++i}`;})()});
 assert.equal(proposal.error,'');assert.equal(proposal.actions.length,1);assert.equal(proposal.actions[0].command.type,'ObservationRecorded');assert.equal(proposal.actions[0].command.payload.notes,text);
 await f.service.applyAssistantProposal(proposal,f.context);assert.equal((await f.service.read('community','club')).state.days[f.context.dayId].briefing,null);
});
