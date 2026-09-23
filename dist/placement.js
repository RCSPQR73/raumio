import * as THREE from './vendor/three.module.js';
import {furniture,euro} from './data.js?v=20260923u';
import {t} from './locale.js?v=20260923u';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const BASE={x:-10.2,y:14.0};
// Slider coordinates are metres relative to the aligned room-plan origin.
// The bounded areas keep each sample on a plausible, unobstructed part of the floor.
const ZONES={
 chair:{x:[-1.12,-.05],z:[-.18,.78],label:'placementZoneChair'},
 table:{x:[.12,1.24],z:[-.16,.72],label:'placementZoneTable'},
 pouf:{x:[-.92,.92],z:[-1.20,.08],label:'placementZonePouf'}
};
const NAME_KEYS={chair:'placementChairName',table:'placementTableName',pouf:'placementPoufName'};

export function createPlacement(stage,controlsHost,notify){
 stage.innerHTML=`<div id="placement-canvas" role="group"><span class="placement-badge"></span><span class="placement-help"></span></div>`;
 controlsHost.innerHTML=`<div class="placement-panel" aria-label="Place furniture">
   <div class="placement-identity"><span class="placement-kicker"></span><h3 class="placement-name"></h3><p class="placement-explanation"></p><span class="placement-zone-label" aria-live="polite"></span></div>
   <div class="placement-fields">
     <div class="range-field"><label for="furniture-x"><span class="axis-x"></span><output id="furniture-x-value">0.00 m</output></label><input type="range" min="-1.12" max="-.05" step=".02" value="-.59" id="furniture-x"></div>
     <div class="range-field"><label for="furniture-z"><span class="axis-z"></span><output id="furniture-z-value">0.00 m</output></label><input type="range" min="-.18" max=".78" step=".02" value=".30" id="furniture-z"></div>
     <div class="range-field"><label for="furniture-rotation"><span class="axis-rotation"></span><output id="furniture-rotation-value">0°</output></label><input type="range" min="-180" max="180" step="5" value="0" id="furniture-rotation"></div>
   </div>
   <div class="placement-actions"><button id="animate-furniture" type="button"></button><button id="reset-furniture" type="button"></button></div>
   <div class="placement-extra"><div class="furniture-choices" role="group"><button type="button" data-furniture="chair" class="active" aria-pressed="true"></button><button type="button" data-furniture="table" aria-pressed="false"></button><button type="button" data-furniture="pouf" aria-pressed="false"></button></div><div class="placement-product-meta"><span class="placement-demo-price"></span><span class="placement-demo-size"></span></div><p class="placement-shop-note"></p></div>
 </div>`;
 const canvas=stage.querySelector('#placement-canvas');
 const controls={x:controlsHost.querySelector('#furniture-x'),z:controlsHost.querySelector('#furniture-z'),rotation:controlsHost.querySelector('#furniture-rotation')};
 let active=false,animation=0,raf=0,kind='chair',drag=null,renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,premultipliedAlpha:false});}
 catch{canvas.insertAdjacentHTML('beforeend',`<div class="placement-failure">${t('webgl')}</div>`);controlsHost.querySelectorAll('button,input').forEach(control=>control.disabled=true);return{play(){notify(t('webglToast'));},stop(){},setLanguage(){},setActive(){},dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 canvas.append(renderer.domElement);renderer.domElement.setAttribute('aria-label',t('placementAria'));
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff4e7,0x566a62,2.1));
 const light=new THREE.DirectionalLight(0xffe9cf,2.3);light.position.set(-13,16,9);light.castShadow=true;light.shadow.mapSize.set(512,512);scene.add(light);
 const fill=new THREE.DirectionalLight(0xd9ebdc,.85);fill.position.set(-8,12,-7);scene.add(fill);
 const camera=new THREE.PerspectiveCamera(60,1,.1,50);camera.up.set(0,1,0);camera.position.set(-10.2,13.1,6.4);camera.lookAt(-10.2,14.35,0);
 const object=new THREE.Group();scene.add(object);
 const cloth=new THREE.MeshStandardMaterial({color:'#b8ad9f',roughness:.95,metalness:0});
 const wood=new THREE.MeshStandardMaterial({color:'#86644d',roughness:.7});
 const metal=new THREE.MeshStandardMaterial({color:'#283830',roughness:.6});
 const poufFabric=new THREE.MeshStandardMaterial({color:'#87735f',roughness:.94,metalness:0});
 const poufTop=new THREE.MeshStandardMaterial({color:'#a28c73',roughness:.92,metalness:0});
 const poufPiping=new THREE.MeshStandardMaterial({color:'#d8c1a2',roughness:.78,metalness:0});
 const poufWood=new THREE.MeshStandardMaterial({color:'#443126',roughness:.48,metalness:.02});
 const shadowMaterial=new THREE.MeshBasicMaterial({color:'#17241d',transparent:true,opacity:.17,depthWrite:false});
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.52,48),shadowMaterial);shadow.position.z=.025;scene.add(shadow);
 const zoneFill=new THREE.MeshBasicMaterial({color:'#c1eccb',transparent:true,opacity:.19,depthWrite:false,side:THREE.DoubleSide});
 const zoneLine=new THREE.LineBasicMaterial({color:'#d2f1d8',transparent:true,opacity:.92});
 const zoneGroup=new THREE.Group();scene.add(zoneGroup);
 const box=(w,d,h,x,y,z,material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,d,h),material);mesh.position.set(x,y,z);mesh.castShadow=true;object.add(mesh);return mesh;};
 const cushion=(w,d,h,x,y,z,material=cloth)=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),material);mesh.scale.set(w/2,d/2,h/2);mesh.position.set(x,y,z);mesh.castShadow=true;object.add(mesh);return mesh;};
 const cylinder=(radiusTop,radiusBottom,height,segments,x,y,z,material)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radiusTop,radiusBottom,height,segments),material);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;object.add(mesh);return mesh;};
 const disposeGroup=group=>{for(const child of [...group.children]){group.remove(child);child.geometry?.dispose();}};
 const setZone=()=>{
  const zone=ZONES[kind];
  for(const axis of ['x','z']){controls[axis].min=String(zone[axis][0]);controls[axis].max=String(zone[axis][1]);controls[axis].step='.02';controls[axis].value=String(clamp(Number(controls[axis].value),...zone[axis]));}
  disposeGroup(zoneGroup);
  const x1=BASE.x+zone.x[0],x2=BASE.x+zone.x[1],y1=BASE.y-zone.z[1],y2=BASE.y-zone.z[0],r=Math.min(.11,(x2-x1)/4,(y2-y1)/4);
  const shape=new THREE.Shape();shape.moveTo(x1+r,y1);shape.lineTo(x2-r,y1);shape.quadraticCurveTo(x2,y1,x2,y1+r);shape.lineTo(x2,y2-r);shape.quadraticCurveTo(x2,y2,x2-r,y2);shape.lineTo(x1+r,y2);shape.quadraticCurveTo(x1,y2,x1,y2-r);shape.lineTo(x1,y1+r);shape.quadraticCurveTo(x1,y1,x1+r,y1);
  const footprint=new THREE.Mesh(new THREE.ShapeGeometry(shape,8),zoneFill);footprint.position.z=.012;footprint.renderOrder=2;zoneGroup.add(footprint);
  const outline=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1+r,y1,.02),new THREE.Vector3(x2-r,y1,.02),new THREE.Vector3(x2,y1+r,.02),new THREE.Vector3(x2,y2-r,.02),new THREE.Vector3(x2-r,y2,.02),new THREE.Vector3(x1+r,y2,.02),new THREE.Vector3(x1,y2-r,.02),new THREE.Vector3(x1,y1+r,.02)]),zoneLine);outline.renderOrder=3;zoneGroup.add(outline);
  controlsHost.querySelector('.placement-zone-label').textContent=`✓ ${t('placementZonePrefix')} · ${t(zone.label)}`;
 };
 const makePouf=()=>{
  // A tailored, softly rounded body with a dark inset plinth, rolled piping and stitched crown.
  cylinder(.292,.305,.075,64,0,0,.075,poufWood);
  const profile=[[.265,.105],[.305,.115],[.326,.145],[.337,.20],[.34,.30],[.333,.365],[.316,.405],[.286,.422],[0,.422]];
  const bodyGeometry=new THREE.LatheGeometry(profile.map(([radius,height])=>new THREE.Vector2(radius,height)),64);bodyGeometry.rotateX(Math.PI/2);
  const body=new THREE.Mesh(bodyGeometry,poufFabric);body.castShadow=true;body.receiveShadow=true;object.add(body);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1,48,28),poufTop);crown.scale.set(.323,.323,.105);crown.position.z=.415;crown.castShadow=true;object.add(crown);
  const welt=new THREE.Mesh(new THREE.TorusGeometry(.317,.012,10,64),poufPiping);welt.position.z=.43;welt.castShadow=true;object.add(welt);
  // Fine vertical channels give the upholstery a crafted, upholstered finish.
  const channelMaterial=new THREE.MeshStandardMaterial({color:'#6d5a48',roughness:.9});
  for(let i=0;i<20;i++){
   const a=(i/20)*Math.PI*2,channel=new THREE.Mesh(new THREE.CylinderGeometry(.006,.008,.232,8),channelMaterial);
   channel.rotation.x=Math.PI/2;channel.position.set(Math.cos(a)*.334,Math.sin(a)*.334,.276);object.add(channel);
  }
  const stitchGeometry=new THREE.SphereGeometry(.006,8,6);
  for(let i=0;i<32;i++){const a=(i/32)*Math.PI*2,stitch=new THREE.Mesh(stitchGeometry,poufPiping);stitch.position.set(Math.cos(a)*.29,Math.sin(a)*.29,.487);object.add(stitch);}
  const tuft=new THREE.Mesh(new THREE.SphereGeometry(.018,18,12),poufPiping);tuft.scale.set(1,1,.45);tuft.position.z=.515;object.add(tuft);
  // Materials created for the pinstripe channels are kept on a private array for disposal.
  object.userData.detailMaterials=[channelMaterial];shadow.scale.set(.72,.72,1);
 };
 const rebuild=()=>{
  for(const mesh of [...object.children]){object.remove(mesh);mesh.geometry?.dispose();}
  for(const material of object.userData.detailMaterials||[])material.dispose();object.userData.detailMaterials=[];
  object.scale.set(1,1,1);
  if(kind==='chair'){
   for(const x of [-.27,.27])for(const y of [-.26,.26])box(.045,.045,.35,x,y,.175,wood);
   box(.70,.68,.10,0,0,.40,cloth);cushion(.67,.64,.18,0,-.01,.49);
   box(.70,.12,.44,0,.31,.72,cloth);cushion(.68,.16,.45,0,.31,.72);
   for(const x of [-.34,.34])box(.095,.66,.18,x,0,.60,cloth);
   shadow.scale.set(1,1,1);
  }else if(kind==='table'){
   const top=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.065,48),wood);top.rotation.x=Math.PI/2;top.position.z=.50;top.castShadow=true;object.add(top);
   for(let i=0;i<3;i++){const angle=i*Math.PI*2/3;box(.045,.045,.46,Math.cos(angle)*.23,Math.sin(angle)*.23,.23,metal);}
   shadow.scale.set(.7,.7,1);
  }else{makePouf();object.scale.set(.78,.78,.85);}
  controlsHost.querySelectorAll('[data-furniture]').forEach(button=>{const selected=button.dataset.furniture===kind;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  controlsHost.querySelector('.placement-demo-price').textContent=`${euro(furniture[kind].price)} · ${t('newPrice')}`;
  controlsHost.querySelector('.placement-demo-size').textContent=furniture[kind].size;
  controlsHost.querySelector('.placement-name').textContent=t(NAME_KEYS[kind]);
  render();
 };
 const render=()=>renderer.render(scene,camera);
 const update=()=>{
  const zone=ZONES[kind],x=clamp(Number(controls.x.value),...zone.x),z=clamp(Number(controls.z.value),...zone.z),rotation=Number(controls.rotation.value);
  controls.x.value=String(x);controls.z.value=String(z);
  object.position.set(BASE.x+x,BASE.y-z,0);object.rotation.z=rotation*Math.PI/180;
  shadow.position.x=object.position.x;shadow.position.y=object.position.y;
  for(const key of ['x','z'])controlsHost.querySelector(`#furniture-${key}-value`).textContent=Number(controls[key].value).toLocaleString(document.documentElement.lang==='de'?'de-DE':'en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})+' m';
  controlsHost.querySelector('#furniture-rotation-value').textContent=rotation+'°';render();
 };
 const localize=()=>{
  stage.querySelector('.placement-badge').textContent=t('placementBadge');stage.querySelector('.placement-help').textContent=t('placementHelp');
  controlsHost.querySelector('.placement-panel').setAttribute('aria-label',t('placementPanel'));
  controlsHost.querySelector('.placement-kicker').textContent=t('placementKicker');controlsHost.querySelector('.placement-explanation').textContent=t('placementExplanation');
  controlsHost.querySelector('.axis-x').textContent=t('leftRight');controlsHost.querySelector('.axis-z').textContent=t('frontBack');controlsHost.querySelector('.axis-rotation').textContent=t('rotation');
  controlsHost.querySelector('#animate-furniture').textContent=animation?t('stopDemo'):t('playDemo');controlsHost.querySelector('#reset-furniture').textContent=t('reset');
  controlsHost.querySelector('[data-furniture="chair"]').textContent=t('placementChairName');controlsHost.querySelector('[data-furniture="table"]').textContent=t('placementTableName');controlsHost.querySelector('[data-furniture="pouf"]').textContent=t('placementPoufName');
  controlsHost.querySelector('.placement-shop-note').textContent=t('placementNote');renderer.domElement.setAttribute('aria-label',t('placementAria'));
  setZone();rebuild();
 };
 const stop=()=>{cancelAnimationFrame(raf);animation=0;controlsHost.querySelector('#animate-furniture').textContent=t('playDemo');};
 const play=()=>{
  if(animation){stop();return;}
  animation=performance.now();controlsHost.querySelector('#animate-furniture').textContent=t('stopDemo');const zone=ZONES[kind];
  const tick=now=>{if(!active){stop();return;}const p=Math.min((now-animation)/5200,1),x=zone.x[0]+(zone.x[1]-zone.x[0])*(.24+.52*p),z=(zone.z[0]+zone.z[1])/2+Math.sin(p*Math.PI*2)*((zone.z[1]-zone.z[0])*.18);controls.x.value=String(x);controls.z.value=String(z);controls.rotation.value=String(Math.round(p*85/5)*5);update();if(p<1)raf=requestAnimationFrame(tick);else{stop();notify(t('placementDone'));}};
  raf=requestAnimationFrame(tick);
 };
 Object.values(controls).forEach(input=>input.addEventListener('input',()=>{stop();update();}));
 controlsHost.querySelectorAll('[data-furniture]').forEach(button=>button.addEventListener('click',()=>{stop();kind=button.dataset.furniture;setZone();controls.x.value=String((ZONES[kind].x[0]+ZONES[kind].x[1])/2);controls.z.value=String((ZONES[kind].z[0]+ZONES[kind].z[1])/2);controls.rotation.value='0';rebuild();update();}));
 controlsHost.querySelector('#animate-furniture').addEventListener('click',play);
 controlsHost.querySelector('#reset-furniture').addEventListener('click',()=>{stop();controls.x.value=String((ZONES[kind].x[0]+ZONES[kind].x[1])/2);controls.z.value=String((ZONES[kind].z[0]+ZONES[kind].z[1])/2);controls.rotation.value='0';update();notify(t('resetDone'));});
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),floor=new THREE.Plane(new THREE.Vector3(0,0,1),0),point=new THREE.Vector3();
 const pointAt=event=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.ray.intersectPlane(floor,point)?point.clone():null;};
 renderer.domElement.addEventListener('pointerdown',event=>{if(!active)return;const p=pointAt(event);if(!p)return;stop();drag={dx:object.position.x-p.x,dy:object.position.y-p.y};renderer.domElement.setPointerCapture(event.pointerId);renderer.domElement.classList.add('dragging');});
 renderer.domElement.addEventListener('pointermove',event=>{if(!drag)return;const p=pointAt(event);if(!p)return;const zone=ZONES[kind];controls.x.value=String(clamp(p.x+drag.dx-BASE.x,...zone.x));controls.z.value=String(clamp(BASE.y-(p.y+drag.dy),...zone.z));update();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,()=>{drag=null;renderer.domElement.classList.remove('dragging');});
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();notify(t('graphicsPaused'));});
 const observer=new ResizeObserver(()=>{const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();});observer.observe(canvas);
 localize();update();
 return{play,stop,setLanguage(){localize();update();},setActive(value){active=value;if(!value)stop();else render();},dispose(){stop();observer.disconnect();for(const mesh of object.children)mesh.geometry?.dispose();for(const material of object.userData.detailMaterials||[])material.dispose();disposeGroup(zoneGroup);cloth.dispose();wood.dispose();metal.dispose();poufFabric.dispose();poufTop.dispose();poufPiping.dispose();poufWood.dispose();zoneFill.dispose();zoneLine.dispose();shadow.geometry.dispose();shadow.material.dispose();renderer.dispose();}};
}
