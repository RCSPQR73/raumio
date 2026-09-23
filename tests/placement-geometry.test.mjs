import test from 'node:test';
import assert from 'node:assert/strict';
import {FLOOR,OBSTACLES,isValidPlacement,nearestValidPlacement,furnitureFootprint,pointInPolygon,polygonsIntersect,buildMeshFloorMap,isMeshPlacementValid,placementProbePoints} from '../dist/placement-geometry.mjs';

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

test('mesh sampler builds a bounded map from room-surface ray results',async()=>{
  let calls=0;
  const map=await buildMeshFloorMap(async(x,y)=>{calls++;return{floor:x>-10.5&&x<-9.5&&y>13.5&&y<14.5,height:0,vertical:1};},{step:.5,batchSize:7});
  assert.equal(calls,map.cells.length);assert.ok(map.cells.some(cell=>cell.floor));assert.ok(map.cells.some(cell=>!cell.floor));assert.equal(map.source,'sketchfab-mesh-rays');
});

test('mesh sampler fails quickly when the live viewer cannot return hitboxes',async()=>{
  let calls=0;await assert.rejects(buildMeshFloorMap(async()=>{calls++;return{floor:false,reason:'timeout'};},{step:.2,batchSize:12}),/unavailable/);assert.equal(calls,24);
});

test('mesh placement checks rotated corners, the full footprint and clearance',()=>{
  const map={minX:-4,minZ:-4,step:.1,cols:80,rows:80,cells:Array.from({length:6400},(_,i)=>{const col=i%80,row=Math.floor(i/80),x=-4+(col+.5)*.1,z=-4+(row+.5)*.1;return{x,z,floor:!(x>-.18&&x<.18&&z>-.6&&z<.6)};})};
  assert.ok(placementProbePoints('pouf',2,2,45).length>20);assert.equal(isMeshPlacementValid('pouf',2,2,45,map),true);assert.equal(isMeshPlacementValid('pouf',0,0,0,map),false);assert.equal(isMeshPlacementValid('pouf',5,5,0,map),false);
});
