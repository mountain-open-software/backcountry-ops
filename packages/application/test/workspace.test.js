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
  await service.dispatch('user','user-1','user-1',{type:'ProfileConfigured',payload:{username:'Alex'}});
  await service.dispatch('user','user-1','user-1',{type:'ReflectionSaved',payload:{dayId:'day-1',communityId:'community-1',text:'Personal'}});
  await service.dispatch('community','community-1','user-1',{type:'CommunityCreated',payload:{name:'Local'}});
  assert.ok(!JSON.stringify(await service.read('community','community-1')).includes('Personal'));
});
test('an idempotency key cannot be reused for another action',async()=>{
  const service=createWorkspace(new MemoryJournal());
  await service.dispatch('community','community-1','user-1',{type:'CommunityCreated',payload:{name:'Original'}},'fixed-id');
  await assert.rejects(service.dispatch('community','community-1','user-1',{type:'CommunityCreated',payload:{name:'Changed'}},'fixed-id'),/different action/);
});
