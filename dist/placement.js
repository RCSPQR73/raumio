import * as THREE from './vendor/three.module.js';
import {furniture,euro} from './data.js?v=20260923i';
import {t} from './locale.js?v=20260923i';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const BASE={x:-10.2,y:14.0};

export function createPlacement(stage,controlsHost,notify){
 stage.innerHTML=`<div id="placement-canvas" role="group">
   <span class="placement-badge"></span><span class="placement-help"></span>
 </div>`;
 controlsHost.innerHTML=`<div class="placement-panel" aria-label="Place furniture">
   <div class="placement-identity"><span class="placement-kicker"></span><h3 class="placement-name"></h3><p class="placement-explanation"></p></div>
   <div class="placement-fields">
     <div class="range-field"><label for="furniture-x"><span class="axis-x"></span><output id="furniture-x-value">0.00 m</output></label><input type="range" min="-1.4" max="1.4" step=".05" value="0" id="furniture-x"></div>
     <div class="range-field"><label for="furniture-z"><span class="axis-z"></span><output id="furniture-z-value">0.00 m</output></label><input type="range" min="-1.15" max="1.15" step=".05" value="0" id="furniture-z"></div>
     <div class="range-field"><label for="furniture-rotation"><span class="axis-rotation"></span><output id="furniture-rotation-value">0°</output></label><input type="range" min="-180" max="180" step="5" value="0" id="furniture-rotation"></div>
   </div>
   <div class="placement-actions"><button id="animate-furniture" type="button"></button><button id="reset-furniture" type="button"></button></div>
   <div class="placement-extra"><div class="furniture-choices" role="group"><button type="button" data-furniture="chair" class="active" aria-pressed="true"></button><button type="button" data-furniture="table" aria-pressed="false"></button></div><span class="placement-demo-price"></span><p class="placement-shop-note"></p></div>
 </div>`;
 const canvas=stage.querySelector('#placement-canvas');
 const controls={x:controlsHost.querySelector('#furniture-x'),z:controlsHost.querySelector('#furniture-z'),rotation:controlsHost.querySelector('#furniture-rotation')};
 let active=false,animation=0,raf=0,kind='chair',drag=null;
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,premultipliedAlpha:false});}
 catch{canvas.insertAdjacentHTML('beforeend',`<div class="placement-failure">${t('webgl')}</div>`);controlsHost.querySelectorAll('button,input').forEach(control=>control.disabled=true);return{play(){notify(t('webglToast'));},stop(){},setLanguage(){},setActive(){},dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 canvas.append(renderer.domElement);renderer.domElement.setAttribute('aria-label',t('placementAria'));
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff4e7,0x566a62,2.4));
 const light=new THREE.DirectionalLight(0xffe9cf,2.5);light.position.set(-13,16,9);light.castShadow=true;light.shadow.mapSize.set(512,512);scene.add(light);
 const camera=new THREE.PerspectiveCamera(60,1,.1,50);camera.up.set(0,1,0);camera.position.set(-10.2,13.1,6.4);camera.lookAt(-10.2,14.35,0);
 const object=new THREE.Group();scene.add(object);
 const cloth=new THREE.MeshStandardMaterial({color:'#b8ad9f',roughness:.95,metalness:0});
 const wood=new THREE.MeshStandardMaterial({color:'#86644d',roughness:.7});
 const metal=new THREE.MeshStandardMaterial({color:'#283830',roughness:.6});
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.52,40),new THREE.MeshBasicMaterial({color:'#17241d',transparent:true,opacity:.18,depthWrite:false}));shadow.position.z=.015;scene.add(shadow);
 const box=(w,d,h,x,y,z,material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,d,h),material);mesh.position.set(x,y,z);mesh.castShadow=true;object.add(mesh);return mesh;};
 const cushion=(w,d,h,x,y,z)=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),cloth);mesh.scale.set(w/2,d/2,h/2);mesh.position.set(x,y,z);mesh.castShadow=true;object.add(mesh);return mesh;};
 const rebuild=()=>{
  for(const mesh of [...object.children]){object.remove(mesh);mesh.geometry.dispose();}
  if(kind==='chair'){
   for(const x of [-.27,.27])for(const y of [-.26,.26])box(.045,.045,.35,x,y,.175,wood);
   box(.70,.68,.10,0,0,.40,cloth);cushion(.67,.64,.18,0,-.01,.49);
   box(.70,.12,.44,0,.31,.72,cloth);cushion(.68,.16,.45,0,.31,.72);
   for(const x of [-.34,.34])box(.095,.66,.18,x,0,.60,cloth);
   shadow.scale.set(1,1,1);
  }else{
   const top=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.065,40),wood);top.rotation.x=Math.PI/2;top.position.z=.50;top.castShadow=true;object.add(top);
   for(let i=0;i<3;i++){const angle=i*Math.PI*2/3;box(.045,.045,.46,Math.cos(angle)*.23,Math.sin(angle)*.23,.23,metal);}
   shadow.scale.set(.7,.7,1);
  }
  controlsHost.querySelectorAll('[data-furniture]').forEach(button=>{const selected=button.dataset.furniture===kind;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  controlsHost.querySelector('.placement-demo-price').textContent=`${euro(furniture[kind].price)} · ${t('newPrice')}`;
  controlsHost.querySelector('.placement-name').textContent=kind==='chair'?t('placementChairName'):t('placementTableName');
  render();
 };
 const render=()=>renderer.render(scene,camera);
 const update=()=>{
  const x=clamp(Number(controls.x.value),-1.4,1.4),z=clamp(Number(controls.z.value),-1.15,1.15),rotation=Number(controls.rotation.value);
  object.position.set(BASE.x+x,BASE.y-z,0);object.rotation.z=rotation*Math.PI/180;
  shadow.position.x=object.position.x;shadow.position.y=object.position.y;
  for(const key of ['x','z'])controlsHost.querySelector(`#furniture-${key}-value`).textContent=Number(controls[key].value).toLocaleString(document.documentElement.lang==='de'?'de-DE':'en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})+' m';
  controlsHost.querySelector('#furniture-rotation-value').textContent=rotation+'°';
  render();
 };
 const localize=()=>{
  stage.querySelector('.placement-badge').textContent=t('placementBadge');stage.querySelector('.placement-help').textContent=t('placementHelp');
  controlsHost.querySelector('.placement-panel').setAttribute('aria-label',t('placementPanel'));
  controlsHost.querySelector('.placement-kicker').textContent=t('placementKicker');
  controlsHost.querySelector('.placement-explanation').textContent=t('placementExplanation');
  controlsHost.querySelector('.axis-x').textContent=t('leftRight');controlsHost.querySelector('.axis-z').textContent=t('frontBack');controlsHost.querySelector('.axis-rotation').textContent=t('rotation');
  controlsHost.querySelector('#animate-furniture').textContent=animation?t('stopDemo'):t('playDemo');controlsHost.querySelector('#reset-furniture').textContent=t('reset');
  controlsHost.querySelector('[data-furniture="chair"]').textContent=t('chair');controlsHost.querySelector('[data-furniture="table"]').textContent=t('table');
  controlsHost.querySelector('.placement-shop-note').textContent=t('placementNote');renderer.domElement.setAttribute('aria-label',t('placementAria'));
  rebuild();
 };
 const stop=()=>{cancelAnimationFrame(raf);animation=0;controlsHost.querySelector('#animate-furniture').textContent=t('playDemo');};
 const play=()=>{if(animation){stop();return;}animation=performance.now();controlsHost.querySelector('#animate-furniture').textContent=t('stopDemo');const tick=now=>{if(!active){stop();return;}const p=Math.min((now-animation)/5200,1);controls.x.value=String(-.65+1.2*p);controls.z.value=String(.45-.7*Math.sin(p*Math.PI/2));controls.rotation.value=String(Math.round(p*85/5)*5);update();if(p<1)raf=requestAnimationFrame(tick);else{stop();notify(t('placementDone'));}};raf=requestAnimationFrame(tick);};
 Object.values(controls).forEach(input=>input.addEventListener('input',()=>{stop();update();}));
 controlsHost.querySelectorAll('[data-furniture]').forEach(button=>button.addEventListener('click',()=>{stop();kind=button.dataset.furniture;rebuild();}));
 controlsHost.querySelector('#animate-furniture').addEventListener('click',play);
 controlsHost.querySelector('#reset-furniture').addEventListener('click',()=>{stop();Object.values(controls).forEach(input=>input.value='0');kind='chair';rebuild();update();notify(t('resetDone'));});
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),floor=new THREE.Plane(new THREE.Vector3(0,0,1),0),point=new THREE.Vector3();
 const pointAt=event=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.ray.intersectPlane(floor,point)?point.clone():null;};
 renderer.domElement.addEventListener('pointerdown',event=>{if(!active)return;const p=pointAt(event);if(!p)return;stop();drag={dx:object.position.x-p.x,dz:object.position.y-p.y};renderer.domElement.setPointerCapture(event.pointerId);renderer.domElement.classList.add('dragging');});
 renderer.domElement.addEventListener('pointermove',event=>{if(!drag)return;const p=pointAt(event);if(!p)return;controls.x.value=String(clamp(p.x+drag.dx-BASE.x,-1.4,1.4));controls.z.value=String(clamp(BASE.y-(p.y+drag.dz),-1.15,1.15));update();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,()=>{drag=null;renderer.domElement.classList.remove('dragging');});
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();notify(t('graphicsPaused'));});
 const observer=new ResizeObserver(()=>{const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();});observer.observe(canvas);
 localize();update();
 return{play,stop,setLanguage(){localize();update();},setActive(value){active=value;if(!value)stop();else render();},dispose(){stop();observer.disconnect();for(const mesh of object.children)mesh.geometry?.dispose();cloth.dispose();wood.dispose();metal.dispose();shadow.geometry.dispose();shadow.material.dispose();renderer.dispose();}};
}
