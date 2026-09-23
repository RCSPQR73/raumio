import * as THREE from './vendor/three.module.js';
import {furniture,objects,euro} from './data.js?v=20260923ab';
import {t} from './locale.js?v=20260923ab';
import {CLEARANCE,FOOTPRINTS,isValidPlacement,nearestValidPlacement,validateMeshPlacement} from './placement-geometry.mjs?v=20260923ab';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const BASE={x:-10.2,y:14.0};
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
 let active=false,animation=0,raf=0,kind='chair',drag=null,renderer,lastValid={x:1.81,z:.01},lastVerifiedRotation=0,meshRequired=false,meshProbe=null,validationSequence=0,probeCache=new Map(),validationTimer=0,lastVerified=false,
     bounds={x:[-4.05,3.55],z:[-3.65,2.85]};
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
 const cloth=new THREE.MeshStandardMaterial({color:'#c4b8a8',roughness:.92,metalness:0});
 const cushionCloth=new THREE.MeshStandardMaterial({color:'#dfd4c5',roughness:.96,metalness:0});
 const wood=new THREE.MeshStandardMaterial({color:'#704632',roughness:.42,metalness:0});
 const woodLight=new THREE.MeshStandardMaterial({color:'#956747',roughness:.44,metalness:0});
 const metal=new THREE.MeshStandardMaterial({color:'#b28b57',roughness:.28,metalness:.72});
 const poufFabric=new THREE.MeshStandardMaterial({color:'#777e64',roughness:.97,metalness:0});
 const poufTop=new THREE.MeshStandardMaterial({color:'#8a9174',roughness:.97,metalness:0});
 const poufPiping=new THREE.MeshStandardMaterial({color:'#c4bda4',roughness:.78,metalness:0});
 const poufWood=new THREE.MeshStandardMaterial({color:'#493629',roughness:.42,metalness:0});
 const shadowMaterial=new THREE.MeshBasicMaterial({color:'#17241d',transparent:true,opacity:.17,depthWrite:false});
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.52,48),shadowMaterial);shadow.position.z=.025;scene.add(shadow);
 const zoneGroup=new THREE.Group();scene.add(zoneGroup);
 const footprintGroup=new THREE.Group();scene.add(footprintGroup);let footprintFill,footprintOutline,footprintFillMaterial,footprintOutlineMaterial;
 const roundedPrism=(w,d,h,r,x,y,z,material)=>{
  const shape=new THREE.Shape(),q=Math.min(r,w/2,d/2);shape.moveTo(-w/2+q,-d/2);shape.lineTo(w/2-q,-d/2);shape.absarc(w/2-q,-d/2+q,q,-Math.PI/2,0,false);shape.lineTo(w/2,d/2-q);shape.absarc(w/2-q,d/2-q,q,0,Math.PI/2,false);shape.lineTo(-w/2+q,d/2);shape.absarc(-w/2+q,d/2-q,q,Math.PI/2,Math.PI,false);shape.lineTo(-w/2,-d/2+q);shape.absarc(-w/2+q,-d/2+q,q,Math.PI,Math.PI*1.5,false);
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:Math.min(.018,h*.22),bevelThickness:Math.min(.018,h*.22),curveSegments:8});geometry.translate(0,0,-h/2);
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;object.add(mesh);return mesh;
 };
 const tube=(points,radius,material,segments=28)=>{const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,radius,10,false),material);mesh.castShadow=true;mesh.receiveShadow=true;object.add(mesh);return mesh;};
 const leg=(x,y,height,radius,material)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius*.62,radius,height,16),material);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,height/2+.018);mesh.castShadow=true;mesh.receiveShadow=true;object.add(mesh);return mesh;};
 const cylinder=(radiusTop,radiusBottom,height,segments,x,y,z,material)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radiusTop,radiusBottom,height,segments),material);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;object.add(mesh);return mesh;};
 const disposeGroup=group=>{for(const child of [...group.children]){child.traverse?.(node=>node.geometry?.dispose());child.geometry?.dispose();group.remove(child);}};
 const rebuildFootprint=()=>{
  footprintFillMaterial?.dispose();footprintOutlineMaterial?.dispose();disposeGroup(footprintGroup);const {width,depth}=FOOTPRINTS[kind],w=width/2+CLEARANCE/2,d=depth/2+CLEARANCE/2;
  const shape=new THREE.Shape();shape.moveTo(-w,-d);shape.lineTo(w,-d);shape.lineTo(w,d);shape.lineTo(-w,d);shape.closePath();
  footprintFillMaterial=new THREE.MeshBasicMaterial({color:'#7fbd94',transparent:true,opacity:.19,depthWrite:false,side:THREE.DoubleSide});footprintFill=new THREE.Mesh(new THREE.ShapeGeometry(shape),footprintFillMaterial);footprintFill.position.z=.012;footprintFill.renderOrder=2;footprintGroup.add(footprintFill);
  footprintOutlineMaterial=new THREE.MeshBasicMaterial({color:'#7fbd94',transparent:true,opacity:.96,depthWrite:false});footprintOutline=new THREE.Group();footprintOutline.renderOrder=4;
  for(const [edgeWidth,edgeDepth,edgeX,edgeY] of [[w*2+.018,.018,0,-d],[w*2+.018,.018,0,d],[.018,d*2+.018,-w,0],[.018,d*2+.018,w,0]]){const edge=new THREE.Mesh(new THREE.BoxGeometry(edgeWidth,edgeDepth,.006),footprintOutlineMaterial);edge.position.set(edgeX,edgeY,.019);footprintOutline.add(edge);}
  footprintGroup.add(footprintOutline);
 };
 const setFootprint=(x,z,rotation,state='checking')=>{
  const colors={checking:'#d8b578',clear:'#7fbd94',blocked:'#d88976',unavailable:'#a7b1aa'};
  const color=colors[state]??colors.checking;footprintGroup.position.set(BASE.x+x,BASE.y-z,.008);footprintGroup.rotation.z=rotation*Math.PI/180;footprintGroup.visible=active;
  if(footprintFillMaterial){footprintFillMaterial.color.set(color);footprintFillMaterial.opacity=state==='blocked'?.24:.16;footprintOutlineMaterial.color.set(color);footprintOutlineMaterial.opacity=state==='blocked'?1:.92;}
 };
 const setZone=()=>{
  for(const axis of ['x','z']){controls[axis].min=String(bounds[axis][0]);controls[axis].max=String(bounds[axis][1]);controls[axis].step='.02';}
  controlsHost.querySelector('.placement-zone-label').textContent=meshRequired?t('placementMeshScanning'):`✓ ${t('placementMeshReady')}`;
 };
 const makePouf=()=>{
  // Tailored low pouf with a recessed wood base, shaped upholstery and fine welt.
  cylinder(.292,.305,.075,64,0,0,.075,poufWood);
  const profile=[[.265,.105],[.305,.115],[.326,.145],[.337,.20],[.34,.30],[.333,.365],[.316,.405],[.286,.422],[0,.422]];
  const bodyGeometry=new THREE.LatheGeometry(profile.map(([radius,height])=>new THREE.Vector2(radius,height)),64);bodyGeometry.rotateX(Math.PI/2);
  const body=new THREE.Mesh(bodyGeometry,poufFabric);body.castShadow=true;body.receiveShadow=true;object.add(body);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1,48,28),poufTop);crown.scale.set(.323,.323,.105);crown.position.z=.415;crown.castShadow=true;object.add(crown);
  const welt=new THREE.Mesh(new THREE.TorusGeometry(.317,.012,10,64),poufPiping);welt.position.z=.43;welt.castShadow=true;object.add(welt);
  const stitchMaterial=new THREE.MeshStandardMaterial({color:'#d3cbb4',roughness:.8});
  for(let i=0;i<24;i++){const a=(i/24)*Math.PI*2,stitch=new THREE.Mesh(new THREE.SphereGeometry(.0045,8,6),stitchMaterial);stitch.position.set(Math.cos(a)*.318,Math.sin(a)*.318,.29);object.add(stitch);}
  const tuft=new THREE.Mesh(new THREE.SphereGeometry(.014,18,12),poufPiping);tuft.scale.set(1,1,.38);tuft.position.z=.512;object.add(tuft);
  object.userData.detailMaterials=[stitchMaterial];shadow.scale.set(.72,.72,1);
 };
 const rebuild=()=>{
  for(const mesh of [...object.children]){object.remove(mesh);mesh.geometry?.dispose();}
  for(const material of object.userData.detailMaterials||[])material.dispose();object.userData.detailMaterials=[];
  object.scale.set(1,1,1);
  if(kind==='chair'){
   // Scandinavian lounge chair: thick tailored cushions inside a warm walnut frame.
   roundedPrism(.68,.61,.115,.09,0,-.015,.465,wood);
   roundedPrism(.635,.59,.125,.11,0,-.045,.55,cushionCloth);
   const back=roundedPrism(.64,.16,.59,.12,0,.245,.835,wood);back.rotation.x=Math.PI/2-.10;
   const backPad=roundedPrism(.57,.115,.49,.105,0,.196,.86,cloth);backPad.rotation.x=Math.PI/2-.10;
   // Tapered walnut legs and continuous arms create a recognizable, usable silhouette.
   for(const x of [-.31,.31]){
    leg(x,-.245,.36,.027,wood);leg(x,.255,.43,.026,wood);
    tube([[x,-.27,.65],[x,-.20,.68],[x,.03,.68],[x,.25,.72],[x,.31,.77]],.031,woodLight,24);
    tube([[x,-.26,.39],[x,-.12,.41],[x,.16,.49],[x,.25,.61]],.026,wood,20);
   }
   tube([[-.31,.26,.73],[-.16,.26,.75],[0,.26,.76],[.16,.26,.75],[.31,.26,.73]],.023,wood,28);
   // Fine upholstery piping and two restrained seams add scale and finish.
   tube([[-.27,-.045,.618],[0,-.045,.619],[.27,-.045,.618]],.006,woodLight,20);
   shadow.scale.set(1.08,1.10,1);
  }else if(kind==='table'){
   // Sculpted oak-and-brass pedestal table, with a softly finished round top.
   cylinder(.285,.30,.042,72,0,0,.431,wood);
   cylinder(.267,.28,.012,72,0,0,.454,woodLight);
   cylinder(.235,.235,.012,72,0,0,.463,wood);
   const profile=[[.085,.08],[.10,.10],[.105,.15],[.083,.22],[.078,.33],[.12,.37],[.18,.382]];
   const pedestalGeo=new THREE.LatheGeometry(profile.map(([r,h])=>new THREE.Vector2(r,h)),48);pedestalGeo.rotateX(Math.PI/2);
   const pedestal=new THREE.Mesh(pedestalGeo,wood);pedestal.castShadow=true;pedestal.receiveShadow=true;object.add(pedestal);
   cylinder(.105,.105,.018,48,0,0,.13,metal);
   cylinder(.082,.082,.014,48,0,0,.345,metal);
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3,x=Math.cos(a)*.19,y=Math.sin(a)*.19;leg(x,y,.115,.018,wood);}
   shadow.scale.set(.76,.76,1);
  }else{makePouf();object.scale.set(.78,.78,.85);}
  controlsHost.querySelectorAll('[data-furniture]').forEach(button=>{const selected=button.dataset.furniture===kind;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  controlsHost.querySelector('.placement-demo-price').textContent=`${euro(furniture[kind].price)} · ${t('newPrice')}`;
  controlsHost.querySelector('.placement-demo-size').textContent=furniture[kind].size;
  controlsHost.querySelector('.placement-name').textContent=t(NAME_KEYS[kind]);
  rebuildFootprint();setFootprint(Number(controls.x.value),Number(controls.z.value),Number(controls.rotation.value),'checking');
  render();
 };
 const render=()=>renderer.render(scene,camera);
 const applyPosition=(x,z,rotation)=>{
  object.position.set(BASE.x+x,BASE.y-z,0);object.rotation.z=rotation*Math.PI/180;
  shadow.position.x=object.position.x;shadow.position.y=object.position.y;
  for(const key of ['x','z'])controlsHost.querySelector(`#furniture-${key}-value`).textContent=Number(controls[key].value).toLocaleString(document.documentElement.lang==='de'?'de-DE':'en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})+' m';
  controlsHost.querySelector('#furniture-rotation-value').textContent=Number(controls.rotation.value)+'°';
  render();
 };
 const update=()=>{
  const rotation=Number(controls.rotation.value),requested={x:clamp(Number(controls.x.value),...bounds.x),z:clamp(Number(controls.z.value),...bounds.z)};
  if(!meshRequired){const snapped=nearestValidPlacement(kind,requested.x,requested.z,rotation,lastValid);const x=snapped?.x??lastValid.x,z=snapped?.z??lastValid.z;controls.x.value=String(x);controls.z.value=String(z);applyPosition(x,z,rotation);const changed=Math.hypot(x-requested.x,z-requested.z)>.025;setFootprint(x,z,rotation,changed?'blocked':'clear');const status=controlsHost.querySelector('.placement-zone-label');status.textContent=changed?t('placementSnapped'):t('placementClearance');status.classList.toggle('is-adjusted',changed);status.classList.toggle('is-blocked',false);return;}
  clearTimeout(validationTimer);const sequence=++validationSequence;
  if(!meshProbe){object.visible=false;setFootprint(requested.x,requested.z,rotation,'unavailable');controlsHost.querySelector('.placement-zone-label').textContent=t('placementMeshUnavailable');return;}
  setFootprint(requested.x,requested.z,rotation,'checking');
  controlsHost.querySelector('.placement-zone-label').textContent=t('placementMeshChecking');
  controlsHost.querySelector('.placement-zone-label').classList.remove('is-adjusted');
  controlsHost.querySelector('.placement-zone-label').classList.remove('is-blocked');
  validationTimer=setTimeout(async()=>{
   const result=await validateMeshPlacement(meshProbe,kind,requested.x,requested.z,rotation,{cache:probeCache,isCurrent:()=>sequence===validationSequence&&active,onProgress:(done,total)=>{
    if(sequence===validationSequence&&total)controlsHost.querySelector('.placement-zone-label').textContent=`${t('placementMeshChecking')} ${Math.round(done/total*100)}%`;
   }});
   if(sequence!==validationSequence||!active)return;
   const status=controlsHost.querySelector('.placement-zone-label');
   const isValid=result===true||result?.valid===true;
   if(isValid){controls.x.value=String(requested.x);controls.z.value=String(requested.z);lastValid={x:requested.x,z:requested.z};lastVerifiedRotation=rotation;lastVerified=true;object.visible=true;applyPosition(requested.x,requested.z,rotation);setFootprint(requested.x,requested.z,rotation,'clear');status.textContent=t('placementClearance');status.classList.remove('is-adjusted','is-blocked');}
   else{applyPosition(lastValid.x,lastValid.z,lastVerified?lastVerifiedRotation:rotation);object.visible=lastVerified;setFootprint(requested.x,requested.z,rotation,result===null?'unavailable':'blocked');const blockerIds=Array.isArray(result?.blockedBy)?result.blockedBy:[];const blockerNames=[...new Set(blockerIds.map(id=>objects.find(item=>item.id===id)?.name).filter(Boolean))].slice(0,2);status.textContent=result===null?t('placementMeshUnavailable'):blockerNames.length?`${t('placementBlockedBy').replace('{items}',blockerNames.join(' · '))}`:t('placementBlocked');status.classList.toggle('is-adjusted',result===null);status.classList.toggle('is-blocked',result!==null);}
  },100);
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
  animation=performance.now();let lastProbe=0;controlsHost.querySelector('#animate-furniture').textContent=t('stopDemo');
  const tick=now=>{if(!active){stop();return;}const p=Math.min((now-animation)/5200,1);if(now-lastProbe>620||p===1){lastProbe=now;const x=-3.2+6.0*p,z=-.18+Math.sin(p*Math.PI*2)*.62;controls.x.value=String(x);controls.z.value=String(z);controls.rotation.value=String(Math.round(p*85/5)*5);update();}if(p<1)raf=requestAnimationFrame(tick);else{stop();notify(t('placementDone'));}};
  raf=requestAnimationFrame(tick);
 };
 Object.values(controls).forEach(input=>input.addEventListener('input',()=>{stop();update();}));
 controlsHost.querySelectorAll('[data-furniture]').forEach(button=>button.addEventListener('click',()=>{stop();kind=button.dataset.furniture;lastVerified=false;object.visible=false;setZone();controls.x.value='1.81';controls.z.value='.01';controls.rotation.value='0';rebuild();update();}));
 controlsHost.querySelector('#animate-furniture').addEventListener('click',play);
 controlsHost.querySelector('#reset-furniture').addEventListener('click',()=>{stop();controls.x.value='1.81';controls.z.value='.01';controls.rotation.value='0';update();notify(t('resetDone'));});
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),floor=new THREE.Plane(new THREE.Vector3(0,0,1),0),point=new THREE.Vector3();
 const pointAt=event=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.ray.intersectPlane(floor,point)?point.clone():null;};
 renderer.domElement.addEventListener('pointerdown',event=>{if(!active)return;const p=pointAt(event);if(!p)return;stop();drag={dx:object.position.x-p.x,dy:object.position.y-p.y};renderer.domElement.setPointerCapture(event.pointerId);renderer.domElement.classList.add('dragging');});
 renderer.domElement.addEventListener('pointermove',event=>{if(!drag)return;const p=pointAt(event);if(!p)return;controls.x.value=String(clamp(p.x+drag.dx-BASE.x,...bounds.x));controls.z.value=String(clamp(BASE.y-(p.y+drag.dy),...bounds.z));update();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,()=>{const wasDragging=Boolean(drag);drag=null;renderer.domElement.classList.remove('dragging');if(wasDragging)update();});
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();notify(t('graphicsPaused'));});
 const observer=new ResizeObserver(()=>{const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();});observer.observe(canvas);
 localize();controls.x.value='1.81';controls.z.value='.01';update();
 return{play,stop,requireMesh(){meshRequired=true;lastVerified=false;object.visible=false;setZone();update();},setMeshProbe(sample){meshRequired=true;meshProbe=sample;lastVerified=false;object.visible=false;probeCache.clear();setZone();update();},setCameraFov(value){if(Number.isFinite(value)&&value>10&&value<120){camera.fov=value;camera.updateProjectionMatrix();render();}},setLanguage(){localize();update();},setActive(value){active=value;footprintGroup.visible=value&&Boolean(meshProbe);if(!value){stop();validationSequence++;clearTimeout(validationTimer);}else render();},dispose(){validationSequence++;clearTimeout(validationTimer);stop();observer.disconnect();for(const mesh of object.children)mesh.geometry?.dispose();for(const material of object.userData.detailMaterials||[])material.dispose();disposeGroup(zoneGroup);disposeGroup(footprintGroup);footprintFillMaterial?.dispose();footprintOutlineMaterial?.dispose();cloth.dispose();cushionCloth.dispose();wood.dispose();woodLight.dispose();metal.dispose();poufFabric.dispose();poufTop.dispose();poufPiping.dispose();poufWood.dispose();shadow.geometry.dispose();shadow.material.dispose();renderer.dispose();}};
}
