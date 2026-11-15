import test from 'node:test';
import assert from 'node:assert/strict';
import {createDraftSession} from '@open-mountain/application';
function adapter(){const records=new Map();return{records,fail:false,async readDraft(user,key){return records.get(`${user}:${key}`)||null;},async writeDraft(user,key,value,revision){if(this.fail)throw new Error('Quota exceeded');const previous=records.get(`${user}:${key}`);if((previous?.revision||0)!==revision)throw new Error('Conflict');const record={revision:revision+1,value,updatedAt:'2026-11-15T10:00:00Z'};records.set(`${user}:${key}`,record);return record;}};}
test('draft survives remount, is user scoped, and clears only after explicit save',async()=>{
 const storage=adapter(),first=createDraftSession(storage,'u1','day-1','');await first.ready;
 first.set('Unsaved text');await first.flush();
 const recovered=createDraftSession(storage,'u1','day-1','');await recovered.ready;
 assert.equal(recovered.getSnapshot().value,'Unsaved text');assert.equal(recovered.getSnapshot().recovered,true);
 const other=createDraftSession(storage,'u2','day-1','');await other.ready;assert.equal(other.getSnapshot().value,'');
 await recovered.clear();const fresh=createDraftSession(storage,'u1','day-1','');await fresh.ready;assert.equal(fresh.getSnapshot().value,'');
});
test('rapid edits persist the latest value and reset does not overwrite a newer edit',async()=>{
 const storage=adapter(),session=createDraftSession(storage,'u1','day-1','');await session.ready;
 session.set('A');session.set('AB');session.set('ABC');await session.flush();
 assert.equal((await storage.readDraft('u1','day-1')).value,'ABC');
 const clearing=session.clear();session.set('After clear started');await clearing;await session.flush();
 assert.equal((await storage.readDraft('u1','day-1')).value,'After clear started');
});
test('write failure retains entered text and makes failure explicit',async()=>{
 const storage=adapter(),session=createDraftSession(storage,'u1','day-1','');await session.ready;storage.fail=true;
 session.set('Keep this text');await session.flush();assert.equal(session.getSnapshot().value,'Keep this text');assert.equal(session.getSnapshot().status,'error');
 storage.fail=false;session.set('Recovered write');await session.flush();assert.equal(session.getSnapshot().status,'saved');
});
test('edits during hydration are not overwritten by an older saved draft',async()=>{
 let finish;const storage=adapter();storage.readDraft=()=>new Promise(resolve=>{finish=resolve;});
 const session=createDraftSession(storage,'u1','day-1','');session.set('New text');finish({revision:0,value:'Old text',updatedAt:''});await session.ready;await session.flush();assert.equal(session.getSnapshot().value,'New text');
});
test('failed hydration never overwrites an unread existing draft',async()=>{
 const storage=adapter();storage.readDraft=async()=>{throw new Error('Cannot read');};const session=createDraftSession(storage,'u1','day-1','');await assert.rejects(session.ready);session.set('New');await session.flush();assert.equal(storage.records.size,0);
});
