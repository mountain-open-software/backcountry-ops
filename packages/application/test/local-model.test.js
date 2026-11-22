import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalModelController,classifiedNote} from '@open-mountain/application';
function fixture(overrides={}){let downloads=0,loads=0,stored=false;const adapter={hasModel:async()=>stored,checkResources:async()=>{},download:async()=>{downloads++;stored=true;},remove:async()=>{stored=false;},classify:async()=>{loads++;return 'OBSERVATION';},unload:async()=>{},...overrides};return {controller:createLocalModelController(adapter),counts:()=>({downloads,loads}),adapter};}
test('local model is off by default, never downloads on enable and needs explicit download',async()=>{
 const f=fixture();assert.equal(f.controller.getSnapshot().enabled,false);await f.controller.inspect();assert.deepEqual(f.counts(),{downloads:0,loads:0});
 await assert.rejects(f.controller.download(),/Enable/);await f.controller.configure(true);assert.equal(f.counts().downloads,0);
 await f.controller.download();assert.equal(f.counts().downloads,1);assert.equal(await f.controller.classify('Wind loading on the ridge.'),'Observation: Wind loading on the ridge.');
 await f.controller.configure(false);await assert.rejects(f.controller.classify('Wind'),/enable/);assert.equal(f.counts().loads,1);
 await f.controller.remove();assert.equal(f.controller.getSnapshot().available,false);
});
test('disabling during preflight prevents a late download from starting',async()=>{
 let release;const wait=new Promise(resolve=>{release=resolve;});const f=fixture({checkResources:async()=>wait});await f.controller.configure(true);
 const download=f.controller.download();const rejected=assert.rejects(download,/cancelled/);await f.controller.configure(false);release();await rejected;assert.equal(f.counts().downloads,0);
});
test('resource failures do not download, and cancellation preserves the source',async()=>{
 const f=fixture({checkResources:async()=>{throw new Error('Low battery');}});await f.controller.configure(true);await assert.rejects(f.controller.download(),/Low battery/);assert.equal(f.counts().downloads,0);
 const g=fixture({classify:async()=>new Promise(()=>{})});await g.controller.configure(true);await g.controller.download();const pending=g.controller.classify('Wind');const rejected=assert.rejects(pending,/stopped/);await Promise.resolve();g.controller.stop();await rejected;
});
test('classification never rewrites evidence and private wording cannot become public',()=>{
 assert.equal(classifiedNote('I am tired.','OBSERVATION'),'Private reflection: I am tired.');
 assert.equal(classifiedNote('Fresh snow.','OBSERVATION'),'Observation: Fresh snow.');
 assert.throws(()=>classifiedNote('Uncertain','Looks safe, continue'));
});

test('constrained JSON labels are accepted without rewriting the original note',()=>{
 assert.equal(classifiedNote('Fresh snow.','{"label":"OBSERVATION"}'),'Observation: Fresh snow.');
 assert.equal(classifiedNote('I am tired.','{"label":"OBSERVATION"}'),'Private reflection: I am tired.');
});
