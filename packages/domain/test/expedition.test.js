import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyCommunity, emptyUser, makeEvent, applyCommunity, applyUser, replay, dayKey, datesBetween, briefingPlans, planLabel, reorderPlans} from '@open-mountain/domain';
const context = {actorId: 'user-1', scopeId: 'community-1', now: '2026-11-14T10:00:00.000Z'};
function fixture() {
  let state = emptyCommunity(); const events = [];
  const send = (type, payload) => { const event = makeEvent(state, {type, payload}, {...context, eventId: `event-${events.length + 1}`}); state = applyCommunity(state, event); events.push(event); return state; };
  send('CommunityCreated', {name: 'Mountain friends'});
  send('TripCreated', {id: 'trip-1', title: 'Traverse', startDate: '2026-11-14', endDate: '2026-11-16', timeZone: 'America/Vancouver'});
  return {send, events, get state() {return state;}, dayId: dayKey('trip-1','2026-11-14')};
}
const briefing = {objective: 'Explore', planA: 'Ridge', hazardsA: 'Wind', planB: 'Forest', hazardsB: 'Trees', triggers: 'New loading: switch to forest', assessment: 'Uncertainty remains', mindset: 'Assessment', problems: []};
const debrief = {expected: 'Wind', actual: 'Forest route', humanFactors: 'Time pressure discussed', good: 'Turned back early', change: 'Start earlier'};
test('a multi-day trip owns exactly one day per local date, including DST boundaries', () => {
  const f = fixture(); assert.equal(Object.keys(f.state.days).length, 3);
  assert.equal(new Set(Object.values(f.state.days).map(d => `${d.tripId}:${d.date}`)).size, 3);
  assert.throws(() => f.send('TripCreated', {id:'trip-1',title:'Duplicate',startDate:'2026-11-14',endDate:'2026-11-14',timeZone:'UTC'}));
  assert.deepEqual(datesBetween('2026-11-01','2026-11-02'), ['2026-11-01','2026-11-02']);
  assert.throws(() => datesBetween('2026-02-30','2026-03-01'));
  assert.throws(() => datesBetween('2026-12-01','2026-11-01'));
});
test('plan approval is versioned, edits invalidate it, and decisions retain authority', () => {
  const f = fixture(), dayId = f.dayId;
  f.send('BriefingSaved',{...briefing,dayId});
  assert.throws(() => f.send('PlanApproved',{dayId,planVersion:0}));
  f.send('PlanApproved',{dayId,planVersion:1});
  f.send('FieldDecisionRecorded',{dayId,authority:'within',action:'Switch to Plan B',rationale:'Loading observed',trigger:'New loading',soloApproval:false});
  assert.throws(() => f.send('FieldDecisionRecorded',{dayId,authority:'departure',action:'New route',rationale:'Alternative',trigger:'',soloApproval:false}));
  f.send('BriefingSaved',{...briefing,dayId}); assert.equal(f.state.days[dayId].approval,null);
  assert.throws(() => f.send('FieldDecisionRecorded',{dayId,authority:'within',action:'Continue',rationale:'Test',trigger:'Test'}));
});
test('closing needs submission and debrief, late correction amends report without reopening', () => {
  const f=fixture(),dayId=f.dayId;
  assert.throws(() => f.send('DayClosed',{dayId}));
  f.send('ObservationRecorded',{dayId,id:'obs-1',title:'Wind',notes:'Loading',location:'Ridge',observedAt:'2026-11-14T08:00:00Z'});
  f.send('ReportSubmitted',{dayId,observationVersion:1,nothingToAdd:false});
  assert.throws(() => f.send('DayClosed',{dayId}));
  f.send('DebriefSaved',{...debrief,dayId});f.send('DayClosed',{dayId});
  const closed=f.state.days[dayId].closedAt;
  f.send('ObservationCorrected',{dayId,id:'obs-1',title:'Strong wind',notes:'Corrected strength',location:'Ridge',observedAt:'2026-11-14T08:00:00Z'});
  assert.equal(f.state.days[dayId].closedAt,closed);
  assert.equal(f.state.days[dayId].submission.observationVersion,2);
  assert.equal(f.events.find(e=>e.type==='ObservationRecorded').payload.title,'Wind');
  assert.equal(f.state.days[dayId].observations['obs-1'].title,'Strong wind');
  assert.deepEqual(replay([...f.events,f.events.at(-1)]),f.state);
  assert.throws(()=>f.send('DayClosed',{dayId}));
});
test('saving observations after submission requires fresh submission before closing',()=>{
  const f=fixture(),dayId=f.dayId;
  f.send('ReportSubmitted',{dayId,observationVersion:0,nothingToAdd:true});
  f.send('ObservationRecorded',{dayId,id:'obs-1',title:'Snow',notes:'Fresh',observedAt:context.now});
  f.send('DebriefSaved',{...debrief,dayId});assert.throws(()=>f.send('DayClosed',{dayId}));
});
test('private human factors cannot enter a public event or another user scope',()=>{
  const f=fixture();assert.throws(()=>f.send('ReflectionSaved',{dayId:f.dayId,communityId:'community-1',text:'Private'}));
  assert.throws(()=>f.send('BriefingSaved',{...briefing,dayId:f.dayId,privateText:'Secret'}));
  let user=emptyUser();
  const profile=makeEvent(user,{type:'ProfileConfigured',payload:{username:'Alex'}},{...context,scopeId:'user-1',eventId:'personal-1'});
  user=applyUser(user,profile);
  const reflection=makeEvent(user,{type:'ReflectionSaved',payload:{dayId:f.dayId,communityId:'community-1',text:'Private fatigue'}},{...context,scopeId:'user-1',eventId:'personal-2'});
  user=applyUser(user,reflection);assert.equal(Object.values(user.reflections)[0].text,'Private fatigue');
  assert.throws(()=>makeEvent(user,{type:'ReflectionSaved',payload:reflection.payload},{...context,actorId:'user-2',scopeId:'user-1',eventId:'personal-3'}));
  assert.ok(!JSON.stringify(f.events).includes('Private fatigue'));
});
test('a conflicting day move is coming soon and neither trip changes',()=>{
  const f=fixture();f.send('TripCreated',{id:'single-1',title:'Day trip',startDate:'2026-11-14',endDate:'2026-11-14',timeZone:'UTC'});
  const before=structuredClone(f.state);
  assert.throws(()=>f.send('TripMoved',{sourceId:'single-1',targetId:'trip-1',confirmed:true}),/Merge — Coming soon/);
  assert.deepEqual(f.state,before);
});
test('malformed IDs, unknown commands, and reversed size ranges are rejected',()=>{
  const f=fixture();assert.throws(()=>f.send('Unknown',{}));
  assert.throws(()=>f.send('TripCreated',{id:'__proto__',title:'Bad',startDate:'2026-11-14',endDate:'2026-11-14',timeZone:'UTC'}));
  assert.throws(()=>f.send('BriefingSaved',{...briefing,dayId:f.dayId,problems:[{type:'Wind Slab',terrain:'Alpine',likelihood:'Uncertain',evidence:'Wind',minSize:'3',maxSize:'1'}]}));
});
test('a confirmed non-conflicting move preserves the day identity and extends the destination itinerary',()=>{
  const f=fixture();f.send('TripCreated',{id:'single-1',title:'Day trip',startDate:'2026-11-17',endDate:'2026-11-17',timeZone:'UTC'});
  const dayId=dayKey('single-1','2026-11-17');
  f.send('ObservationRecorded',{dayId,id:'obs-move',title:'Route note',notes:'Keep me',observedAt:context.now});
  assert.throws(()=>f.send('TripMoved',{sourceId:'single-1',targetId:'trip-1',confirmed:false}));
  f.send('TripMoved',{sourceId:'single-1',targetId:'trip-1',confirmed:true});
  assert.equal(f.state.days[dayId].tripId,'trip-1');assert.equal(f.state.days[dayId].observations['obs-move'].notes,'Keep me');
  assert.equal(f.state.trips['trip-1'].endDate,'2026-11-17');assert.equal(f.state.trips['single-1'].movedTo,'trip-1');
  assert.deepEqual(replay(f.events),f.state);
});

test('ordered plans retain identities and hazards, invalidate approval, and replay in priority order', () => {
 const f = fixture(), dayId = f.dayId;
 const plans = [{id:'ridge',description:'Ridge',hazards:'Wind'}, {id:'forest',description:'Forest',hazards:'Trees'}, {id:'valley',description:'Valley',hazards:'Overhead exposure'}];
 f.send('BriefingSaved', {...briefing, plans, dayId});
 f.send('PlanApproved', {dayId,planVersion:1});
 const reordered = reorderPlans(plans, 2, 0);
 f.send('BriefingSaved', {...briefing, plans:reordered, dayId});
 assert.equal(f.state.days[dayId].approval, null);
 assert.deepEqual(f.state.days[dayId].briefing.plans, [plans[2],plans[0],plans[1]]);
 assert.deepEqual(plans.map(p=>p.id), ['ridge','forest','valley']);
 assert.deepEqual(replay(f.events),f.state);
 assert.equal(planLabel(0),'A'); assert.equal(planLabel(25),'Z'); assert.equal(planLabel(26),'AA');
 assert.equal(planLabel(99),'CV');
});
test('legacy A/B events and drafts retain their original content with deterministic plan IDs', () => {
 const f=fixture(), dayId=f.dayId;
 const legacy={id:'legacy-event',version:1,type:'BriefingSaved',scopeId:context.scopeId,actorId:context.actorId,recordedAt:context.now,occurredAt:context.now,payload:{...briefing,dayId}};
 const restored=applyCommunity(f.state,legacy);
 assert.deepEqual(restored.days[dayId].briefing.plans, briefingPlans(briefing));
 assert.equal(restored.days[dayId].briefing.plans[1].hazards, 'Trees');
 assert.equal(legacy.payload.plans, undefined);
 const approved=makeEvent(restored,{type:'PlanApproved',payload:{dayId,planVersion:1}},{...context,eventId:'approve-legacy'});
 assert.equal(approved.type,'PlanApproved');
});
test('plans require a nonempty list, unique IDs, supported fields and complete content for approval', () => {
 const f=fixture(), dayId=f.dayId;
 const valid={id:'one',description:'Ridge',hazards:'Unknown'};
 for(const plans of [[],null,'invalid',[valid,valid],[{...valid,privateReflection:'secret'}],[{...valid,description:42}]])
   assert.throws(()=>f.send('BriefingSaved',{...briefing,plans,dayId}));
 f.send('BriefingSaved',{...briefing,plans:[{...valid,hazards:''}],dayId});
 assert.throws(()=>f.send('PlanApproved',{dayId,planVersion:1}));
 f.send('BriefingSaved',{...briefing,plans:[valid],dayId});
 f.send('PlanApproved',{dayId,planVersion:2});
 assert.equal(f.state.days[dayId].approval.planVersion,2);
});
