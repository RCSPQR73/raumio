import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {objects,total} from '../dist/data.js';
import {FIXED_EYE,directionFor} from '../dist/camera.js';
test('price totals count quantities and exclude unsupported categories',()=>{
 const valued=objects.filter(o=>o.min!==null);
 assert.equal(valued.length,5);
 assert.equal(total(objects).count,6);
 for(const o of valued){assert.equal(o.min,Math.min(...o.comparables.map(c=>c.price)));assert.equal(o.max,Math.max(...o.comparables.map(c=>c.price)));}
 const expected=valued.reduce((a,o)=>({min:a.min+o.min*o.quantity,max:a.max+o.max*o.quantity}),{min:0,max:0});
 assert.equal(total(objects).min,expected.min);assert.equal(total(objects).max,expected.max);
 assert.deepEqual(total(objects.filter(o=>o.state==='unknown')),{min:0,max:0,count:0});
});
test('all sources are real structured individual listings and unique per group',()=>{for(const o of objects){const ids=new Set();for(const c of o.comparables){const u=new URL(c.url);assert.equal(u.hostname,'www.kleinanzeigen.de');assert.ok(u.pathname.startsWith('/s-anzeige/'));assert.ok(c.price>0);assert.ok(c.similarity.length>35);assert.ok(!ids.has(c.url));ids.add(c.url);}}});
test('expanded market sample keeps normalized prices transparent',()=>{const sourceCount=objects.reduce((sum,o)=>sum+o.comparables.length,0);assert.ok(sourceCount>=32);const pair=objects.find(o=>o.id==='nightstand').comparables.find(c=>c.location==='Neuss');assert.equal(pair.price,35);assert.match(pair.similarity,/70 € für das Paar/);const lamp=objects.find(o=>o.id==='lamp').comparables.find(c=>c.location==='Duderstadt');assert.equal(lamp.price,15);assert.match(lamp.similarity,/pro Lampe/);});
test('additional model groups have distinct mesh targets and cautious pricing',()=>{assert.equal(objects.length,12);for(const id of ['desk','curtain','vase','ceiling','cabinet','plant']){const o=objects.find(row=>row.id===id);assert.ok(o,`missing ${id}`);assert.ok(o.nodes.length>=3);assert.equal(o.min,null);assert.ok(o.query.length>0);}assert.deepEqual(objects.find(o=>o.id==='unknown').nodes,[440,441,442]);assert.deepEqual(total(objects),{min:190,max:525,count:6});});
test('vertical drag maps upward swipe to upward pitch',()=>{const source=readFileSync(new URL('../dist/camera.js',import.meta.url),'utf8');assert.match(source,/turn\(-dx\*\.004,-dy\*\.003\)/);assert.match(source,/target-marker/);});
test('full look rotation changes direction but never camera eye',()=>{const eye=[...FIXED_EYE];assert.ok(Object.isFrozen(FIXED_EYE));for(let yaw=-Math.PI*4;yaw<Math.PI*4;yaw+=.15){for(const pitch of [-1,0,1]){const d=directionFor(yaw,pitch);assert.ok(Math.abs(Math.hypot(...d)-1)<1e-10);const target=eye.map((v,i)=>v+d[i]*10);assert.ok(Math.abs(Math.hypot(...target.map((v,i)=>v-eye[i]))-10)<1e-10);}}assert.deepEqual(FIXED_EYE,eye);});
test('each curated mesh belongs to one category only',()=>{const seen=new Set();for(const o of objects){assert.equal(o.anchor.length,3);for(const id of o.nodes){assert.ok(!seen.has(id));seen.add(id);}}});
