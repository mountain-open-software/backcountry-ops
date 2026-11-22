import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace} from '@open-mountain/application';
class MemoryJournal {
  docs=new Map(); fail=false;
  async readJournal(scope,id){return structuredClone(this.docs.get(`${scope}:${id}`)||null);}
  async append(scope,id,journal,event){
    if(this.fail)throw new Error('Storage unavailable');
    const key=`${scope}:${id}`,current=this.docs.get(key);
    if(current?._rev!==journal?._rev)throw new Error('Conflict');
    this.docs.set(key,{_id:'journal',_rev:String(Number(current?._rev||0)+1),version:2,events:[...(journal?.events||[]),event]});
  }
}
test('durable event append is idempotent and reconstructs state after reopening',async()=>{
  const storage=new MemoryJournal(),first=createWorkspace(storage);
  const command={type:'CommunityCreated',payload:{name:'Local'}};
  await first.dispatch('community','community-1','user-1',command,'create-once');
  await first.dispatch('community','community-1','user-1',command,'create-once');
  const recovered=await createWorkspace(storage).read('community','community-1');
  assert.equal(recovered.journal.events.length,1);assert.equal(recovered.state.community.name,'Local');
});
test('failed writes never show an accepted projected change',async()=>{
  const storage=new MemoryJournal(),service=createWorkspace(storage);storage.fail=true;
  await assert.rejects(service.dispatch('community','community-1','user-1',{type:'CommunityCreated',payload:{name:'Local'}}));
  assert.equal((await service.read('community','community-1')).state.community,null);
});
test('private journal and community journal stay separate',async()=>{
  const storage=new MemoryJournal(),service=createWorkspace(storage);
  await service.dispatch('user','user-1','user-1',{type:'ProfileConfigured',payload:{username:'alex'}});
  await service.dispatch('user','user-1','user-1',{type:'ReflectionSaved',payload:{dayId:'day-1',communityId:'community-1',text:'Personal'}});
  await service.dispatch('community','community-1','user-1',{type:'CommunityCreated',payload:{name:'Local'}});
  assert.ok(!JSON.stringify(await service.read('community','community-1')).includes('Personal'));
});
test('an idempotency key cannot be reused for another action',async()=>{
  const service=createWorkspace(new MemoryJournal());
  await service.dispatch('community','community-1','user-1',{type:'CommunityCreated',payload:{name:'Original'}},'fixed-id');
  await assert.rejects(service.dispatch('community','community-1','user-1',{type:'CommunityCreated',payload:{name:'Changed'}},'fixed-id'),/different action/);
});
async function managedCommunity() {
 const storage=new MemoryJournal(),service=createWorkspace(storage);
 await service.dispatch('user','user-1','user-1',{type:'ProfileConfigured',payload:{username:'alex'}});
 await service.dispatch('user','user-1','user-1',{type:'CommunityAdded',payload:{id:'alpine-club',name:'Alpine Club'}});
 await service.dispatch('community','alpine-club','user-1',{type:'CommunityCreated',payload:{name:'Alpine Club'}});
 await service.dispatch('community','alpine-club','user-1',{type:'TripCreated',payload:{id:'trip-1',title:'Ski Day',startDate:'2026-11-22',endDate:'2026-11-22',timeZone:'UTC'}});
 return {storage,service};
}
test('community rename updates the name without moving trips or changing the ID',async()=>{
 const {service}=await managedCommunity();
 await service.renameCommunity('user-1','alpine-club','North Alpine Club');
 const c=await service.read('community','alpine-club');
 assert.equal(c.state.community.id,'alpine-club');assert.equal(c.state.community.name,'North Alpine Club');
 assert.equal(c.state.trips['trip-1'].title,'Ski Day');
 assert.equal((await service.read('user','user-1')).state.communities[0].name,'North Alpine Club');
 await assert.rejects(service.renameCommunity('other-user','alpine-club','Hijacked'));
});
test('community deletion hides membership and blocks new work while retaining journal history',async()=>{
 const {storage,service}=await managedCommunity();
 await service.deleteCommunity('user-1','alpine-club');
 const c=await createWorkspace(storage).read('community','alpine-club');
 assert.ok(c.state.community.deletedAt); assert.equal(c.state.trips['trip-1'].title,'Ski Day');
 assert.ok((await service.read('user','user-1')).state.communities[0].removedAt);
 await assert.rejects(service.renameCommunity('user-1','alpine-club','Revived'));
 await assert.rejects(service.dispatch('community','alpine-club','user-1',{type:'TripCreated',payload:{id:'trip-2',title:'Other',startDate:'2026-11-23',endDate:'2026-11-23',timeZone:'UTC'}}));
});
test('refresh reconciles a rename or deletion interrupted between community and personal writes',async()=>{
 const {service}=await managedCommunity();
 await service.dispatch('community','alpine-club','user-1',{type:'CommunityRenamed',payload:{name:'Changed'}});
 assert.equal((await service.reconcileCommunities('user-1')).state.communities[0].name,'Changed');
 await service.dispatch('community','alpine-club','user-1',{type:'CommunityDeleted',payload:{}});
 assert.ok((await service.reconcileCommunities('user-1')).state.communities[0].removedAt);
 assert.equal((await service.reconcileCommunities('user-1')).state.communities.length,1);
});
