// Approximate room-plan geometry for the furniture overlay. Coordinates are
// metres relative to the placement origin; the Z axis here is floor depth.
export const FLOOR = [
  [-4.05,-3.65],[3.55,-3.65],[3.55,2.85],[-4.05,2.85]
];

// Conservative footprints for fixed pieces visible in the supplied room.
// Furniture preview hides the ottoman model group, so it is intentionally omitted.
export const OBSTACLES = [
  {name:'beds', polygon:[[-3.55,-3.15],[-.35,-3.15],[-.35,-1.12],[-3.55,-1.12]]},
  {name:'nightstand', polygon:[[-.58,-3.55],[.58,-3.55],[.58,-2.45],[-.58,-2.45]]},
  {name:'desk', polygon:[[-1.20,.42],[1.10,.42],[1.10,1.63],[-1.20,1.63]]},
  {name:'chair', polygon:[[2.48,.27],[3.48,.27],[3.48,1.72],[2.48,1.72]]},
  {name:'wall-clearance', polygon:[[-4.05,2.55],[3.55,2.55],[3.55,2.85],[-4.05,2.85]]}
];

export const FOOTPRINTS = {
  chair:{width:.78,depth:.82,height:.86},
  table:{width:.60,depth:.60,height:.45},
  pouf:{width:.52,depth:.52,height:.44}
};
export const CLEARANCE = .09;

const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const onSegment=(p,a,b)=>Math.abs(cross(a,b,p))<1e-8&&p[0]>=Math.min(a[0],b[0])-1e-8&&p[0]<=Math.max(a[0],b[0])+1e-8&&p[1]>=Math.min(a[1],b[1])-1e-8&&p[1]<=Math.max(a[1],b[1])+1e-8;
const segmentsIntersect=(a,b,c,d)=>{
  const abC=cross(a,b,c),abD=cross(a,b,d),cdA=cross(c,d,a),cdB=cross(c,d,b);
  return (abC*abD<0&&cdA*cdB<0)||onSegment(c,a,b)||onSegment(d,a,b)||onSegment(a,c,d)||onSegment(b,c,d);
};
export function pointInPolygon(point,polygon){
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if(onSegment(point,a,b))return true;
    if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function polygonsIntersect(a,b){
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)if(segmentsIntersect(a[i],a[(i+1)%a.length],b[j],b[(j+1)%b.length]))return true;
  return pointInPolygon(a[0],b)||pointInPolygon(b[0],a);
}
export function furnitureFootprint(kind,x,z,rotation=0){
  const {width,depth}=FOOTPRINTS[kind],w=width/2+CLEARANCE/2,d=depth/2+CLEARANCE/2,a=rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  return [[-w,-d],[w,-d],[w,d],[-w,d]].map(([px,pz])=>[x+px*c-pz*s,z+px*s+pz*c]);
}
export function isValidPlacement(kind,x,z,rotation=0){
  const footprint=furnitureFootprint(kind,x,z,rotation);
  return footprint.every(point=>pointInPolygon(point,FLOOR))&&OBSTACLES.every(obstacle=>!polygonsIntersect(footprint,obstacle.polygon));
}

const pointOnSegmentDistance=(p,a,b)=>{
  const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
  const t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)):0;
  return Math.hypot(p[0]-(a[0]+t*dx),p[1]-(a[1]+t*dy));
};
export function placementProbePoints(kind,x,z,rotation=0,spacing=.095){
  const footprint=furnitureFootprint(kind,x,z,rotation),xs=footprint.map(p=>p[0]),zs=footprint.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs),points=[];
  const cols=Math.ceil((maxX-minX)/spacing),rows=Math.ceil((maxZ-minZ)/spacing);
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
    const p=[minX+(maxX-minX)*col/Math.max(1,cols),minZ+(maxZ-minZ)*row/Math.max(1,rows)];
    if(pointInPolygon(p,footprint)||footprint.some((a,i)=>pointOnSegmentDistance(p,a,footprint[(i+1)%footprint.length])<=spacing*.55))points.push(p);
  }
  for(const corner of footprint)points.push(corner);
  const seen=new Set();return points.filter(([px,pz])=>{const k=`${px.toFixed(3)}:${pz.toFixed(3)}`;if(seen.has(k))return false;seen.add(k);return true;});
}

// Validate the complete padded footprint against live, vertical rays through
// the supplied scene. Cached hit samples keep nearby drag positions responsive.
export async function validateMeshPlacement(sample,kind,x,z,rotation=0,{cache=new Map(),originX=-10.2,originY=14,concurrency=8,step=.04,onProgress=()=>{},isCurrent=()=>true}={}){
  const points=placementProbePoints(kind,x,z,rotation,.075),height=FOOTPRINTS[kind].height,pending=[];
  const blockerIds=new Set();
  for(const [px,pz] of points){
    const key=`${(Math.round(px/step)*step).toFixed(2)}:${(Math.round(pz/step)*step).toFixed(2)}:${height.toFixed(2)}`;
    const known=cache.get(key);
    if(known?.valid===false){if(known.blockedBy)blockerIds.add(known.blockedBy);return{valid:false,blockedBy:[...blockerIds]};}
    if(!cache.has(key))pending.push({key,x:Math.round(px/step)*step,z:Math.round(pz/step)*step});
  }
  let complete=0,failed=0,blocked=false;
  for(let i=0;i<pending.length;i+=concurrency){
    if(!isCurrent())return false;
    const batch=pending.slice(i,i+concurrency);
    await Promise.all(batch.map(async point=>{
      let result;
      try{result=await sample(originX+point.x,originY-point.z,height);}
      catch{failed++;return;}
      if(['timeout','ray-error','no-position','clearance-timeout','clearance-error'].includes(result?.reason)){failed++;return;}
      const valid=Boolean(result?.floor&&result?.clear);cache.set(point.key,{valid,blockedBy:result?.blockedBy??null});if(!valid){blocked=true;if(result?.blockedBy)blockerIds.add(result.blockedBy);}
      if(cache.size>6000)cache.delete(cache.keys().next().value);
    }));
    complete+=batch.length;onProgress(complete,pending.length);
    if(!isCurrent())return false;
    if(failed>0)return null;
    if(blocked)return{valid:false,blockedBy:[...blockerIds]};
  }
  const valid=points.every(([px,pz])=>{
    const key=`${(Math.round(px/step)*step).toFixed(2)}:${(Math.round(pz/step)*step).toFixed(2)}:${height.toFixed(2)}`;
    const value=cache.get(key);if(value?.blockedBy)blockerIds.add(value.blockedBy);return value?.valid===true;
  });
  return valid?true:{valid:false,blockedBy:[...blockerIds]};
}
export function nearestValidPlacement(kind,x,z,rotation=0,origin={x,z}){
  const valid=(px,pz)=>isValidPlacement(kind,px,pz,rotation);
  if(valid(x,z))return{x,z};
  // A small deterministic spiral keeps drag/slider motion responsive while it
  // finds the closest valid point around an occupied corner or boundary.
  const step=.08,max=1.44;
  for(let radius=step;radius<=max;radius+=step){
    const count=Math.max(12,Math.ceil(2*Math.PI*radius/step));
    for(let i=0;i<count;i++){
      const angle=i*2*Math.PI/count,candidate={x:x+Math.cos(angle)*radius,z:z+Math.sin(angle)*radius};
      if(valid(candidate.x,candidate.z))return candidate;
    }
  }
  return valid(origin.x,origin.z)?{x:origin.x,z:origin.z}:null;
}
