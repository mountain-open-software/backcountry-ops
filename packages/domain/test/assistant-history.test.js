import test from 'node:test';import assert from 'node:assert/strict';
import {emptyUser,makeEvent,applyUser,replay} from '@open-mountain/domain';
test('full private note history and status transitions replay without the old 12-message cap',()=>{
 let state=emptyUser(),i=0;const events=[];const send=(type,payload)=>{const event=makeEvent(state,{type,payload},{actorId:'user-1',scopeId:'user-1',eventId:`event-${++i}`,now:'2026-11-22T10:00:00Z'});const previous=JSON.stringify(state);const next=applyUser(state,event);assert.equal(JSON.stringify(state),previous);state=next;events.push(event);};
 send('ProfileConfigured',{username:'alex'});assert.equal(state.localAI.enabled,false);
 for(let j=0;j<25;j++){send('AssistantNoteRecorded',{id:`note-${j}`,text:`Original note ${j}`,communityId:'club',context:'Club · planning'});send('AssistantNoteUpdated',{id:`note-${j}`,status:'processing'});send('AssistantNoteUpdated',{id:`note-${j}`,status:'review',response:'Review it'});}
 const raw=JSON.stringify(events);assert.equal(Object.keys(state.assistantNotes).length,25);assert.equal(state.assistantNotes['note-0'].text,'Original note 0');assert.equal(state.assistantNotes['note-0'].transitions.length,3);
 assert.deepEqual(replay(events,'user'),state);assert.equal(JSON.stringify(events),raw);
 send('LocalAIConfigured',{enabled:true});assert.equal(state.localAI.enabled,true);
 assert.throws(()=>makeEvent(state,{type:'AssistantNoteUpdated',payload:{id:'missing',status:'saved'}},{actorId:'user-1',scopeId:'user-1',eventId:'bad',now:'2026-11-22T10:00:00Z'}));
});
