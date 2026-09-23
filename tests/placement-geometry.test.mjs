import test from 'node:test';
import assert from 'node:assert/strict';
import {FLOOR,OBSTACLES,isValidPlacement,nearestValidPlacement,furnitureFootprint,pointInPolygon,polygonsIntersect} from '../dist/placement-geometry.mjs';

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
