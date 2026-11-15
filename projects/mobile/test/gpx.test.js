import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGPX} from '../src/gpx.ts';
test('native GPX validation preserves segment/point counts and accepts namespaces',()=>{
 const data='<gpx xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg><trkpt lat="50.1" lon="-120.1"/></trkseg><trkseg><trkpt lat="50.2" lon="-120.2"/></trkseg></trk></gpx>';
 assert.deepEqual(validateGPX(data),{points:2,segments:2});
});
test('native GPX rejects invalid coordinates, unrelated XML, and entity declarations',()=>{
 assert.throws(()=>validateGPX('<gpx><wpt lat="100" lon="0"/></gpx>'));
 assert.throws(()=>validateGPX('<html/>'));
 assert.throws(()=>validateGPX('<!DOCTYPE gpx [<!ENTITY x "secret">]><gpx><wpt lat="1" lon="2"/></gpx>'));
});
