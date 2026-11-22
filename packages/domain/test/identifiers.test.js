import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeIdentifier, validateIdentifier, makeEvent, replay, emptyUser, emptyCommunity} from '@open-mountain/domain';
const context={actorId:'user-1',scopeId:'user-1',eventId:'event-1',now:'2026-11-22T10:00:00Z'};
test('handles normalize live typing, pasted text and accented letters consistently',()=>{
 assert.equal(normalizeIdentifier('ALEx Smith! @ 12'),'alex-smith--12');
 assert.equal(normalizeIdentifier('André Ski Crew'),'andre-ski-crew');
 assert.equal(normalizeIdentifier('Alex '),'alex-');
 assert.equal(normalizeIdentifier('a_b.c'),'abc');
 for(const value of ['', 'UPPER', 'has space', 'has_underscore','---']) assert.throws(()=>validateIdentifier(value,'ID'));
 validateIdentifier('my-crew-12','ID');
});
test('new commands validate username and community ID, while legacy names remain readable',()=>{
 assert.throws(()=>makeEvent(emptyUser(),{type:'ProfileConfigured',payload:{username:'Alex Smith'}},context));
 const saved=makeEvent(emptyUser(),{type:'ProfileConfigured',payload:{username:'alex-smith'}},context);
 assert.equal(saved.version,2);
 assert.equal(replay([saved],'user').profile.username,'alex-smith');
 const legacy={...saved,version:1,payload:{username:'Alex Smith'}};
 assert.equal(replay([legacy],'user').profile.username,'Alex Smith');
 assert.throws(()=>makeEvent(emptyCommunity(),{type:'CommunityCreated',payload:{name:'Alpine Club'}},{...context,scopeId:'Bad ID'}));
 const community=makeEvent(emptyCommunity(),{type:'CommunityCreated',payload:{name:'Alpine Club'}},{...context,scopeId:'alpine-club'});
 assert.equal(replay([community]).community.name,'Alpine Club');
 assert.equal(replay([community]).community.id,'alpine-club');
 assert.equal(legacy.payload.username,'Alex Smith');
});
