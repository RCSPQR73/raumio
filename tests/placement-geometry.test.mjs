import test from 'node:test';
import assert from 'node:assert/strict';
import {FLOOR,OBSTACLES,isValidPlacement,nearestValidPlacement,furnitureFootprint,pointInPolygon,polygonsIntersect,placementProbePoints,validateMeshPlacement} from '../dist/placement-geometry.mjs';

test('every furniture type fits on the open center floor with its clearance margin',()=>{
  for(const kind of ['chair','table','pouf'])assert.equal(isValidPlacement(kind,0,-.2,0),true,`${kind} should fit on clear floor`);
});

test('rotated furniture corners stay inside the complete floor outline',()=>{
  assert.equal(isValidPlacement('chair',3.48,2.78,45),false);
  assert.equal(isValidPlacement('chair',-2,-.2,45),true);
  for(const point of furnitureFootprint('chair',-2,-.2,45))assert.equal(pointInPolygon(point,FLOOR),true);
});

test('furniture footprints cannot overlap a fixed object, including edge contact',()=>{
  for(const obstacle of OBSTACLES)assert.equal(polygonsIntersect(obstacle.polygon,obstacle.polygon),true);
  assert.equal(isValidPlacement('chair',0,.9,0),false,'desk footprint blocks the chair');
  assert.equal(isValidPlacement('pouf',-1.8,-2.2,90),false,'bed footprint blocks the pouf');
});

test('nearest valid placement moves an invalid request into nearby free floor',()=>{
  const result=nearestValidPlacement('chair',0,.9,0,{x:0,z:-.2});
  assert.ok(result);
  assert.equal(isValidPlacement('chair',result.x,result.z,0),true);
  assert.ok(Math.hypot(result.x,result.z-.9)<1.1);
});

test('live mesh-ray validation samples the whole footprint and caches nearby rays',async()=>{
  const cache=new Map();let calls=0,requestedHeight=0;
  const sample=async(x,y,height)=>{calls++;requestedHeight=height;const planX=x+10.2,planZ=14-y;return{floor:planX>-.7&&planX<.7&&planZ>-.7&&planZ<.7,clear:true};};
  assert.equal(await validateMeshPlacement(sample,'pouf',0,0,45,{cache}),true);
  const firstCalls=calls;assert.ok(firstCalls>20);assert.equal(requestedHeight,.44);
  assert.equal(await validateMeshPlacement(sample,'pouf',0,0,45,{cache}),true);assert.equal(calls,firstCalls);
  assert.equal((await validateMeshPlacement(sample,'chair',0,.55,0,{cache})).valid,false);
});

test('live mesh-ray validation rejects an elevated obstruction or an incomplete probe',async()=>{
  const blocked=async(x,y,height)=>{const planX=x+10.2,planZ=14-y,blockedBy=planX>-.35&&planX<.35&&planZ>-.35&&planZ<.35?'bed':null;return{floor:true,clear:!blockedBy,blockedBy,checkedHeight:height};};
  const result=await validateMeshPlacement(blocked,'table',0,0,0);
  assert.equal(result.valid,false,'a hit anywhere through the object height blocks placement');
  assert.ok(result.blockedBy.includes('bed'),'the intersected model object is retained for clear user feedback');
  const unknown=async()=>({floor:true,clear:false,reason:'clearance-timeout'});
  assert.equal(await validateMeshPlacement(unknown,'pouf',0,0,0),null,'unverified space must fail closed without being mislabeled as a collision');
});

test('clearance cache is height-specific when furniture changes',async()=>{
  const cache=new Map();let calls=0;
  const sample=async(x,y,height)=>{calls++;return{floor:true,clear:height<=.5};};
  assert.equal(await validateMeshPlacement(sample,'pouf',0,-.2,0,{cache}),true);
  const shortItemCalls=calls;assert.ok(shortItemCalls>0);
  const chair=await validateMeshPlacement(sample,'chair',0,-.2,0,{cache});
  assert.equal(chair.valid,false,'a shorter furniture check cannot certify clearance for a taller item');
  assert.ok(calls>shortItemCalls,'taller furniture must query the extra clearance above the pouf');
});

test('an interrupted drag abandons obsolete ray batches before starting more probes',async()=>{
  let current=true,calls=0;
  const sample=async()=>{calls++;current=false;return{floor:true,clear:true};};
  const result=await validateMeshPlacement(sample,'chair',0,-.2,0,{concurrency:3,isCurrent:()=>current});
  assert.equal(result,false);
  assert.equal(calls,3,'only the already-started batch should finish');
});
