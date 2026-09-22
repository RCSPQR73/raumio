import * as THREE from './vendor/three.module.js';
import {furniture,euro} from './data.js';
import {t} from './locale.js';

const ROOM_REFERENCE='./assets/hotel-room-reference.jpeg';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function createPlacement(container,notify){
 container.innerHTML=`<div id="placement-canvas">
   <div class="placement-room-reference" aria-hidden="true">
     <img src="${ROOM_REFERENCE}" alt="">
     <div class="placement-room-shade"></div>
   </div>
   <span class="placement-badge">SAME ROOM · EXPLORE VIEW · FURNITURE OVERLAY</span>
   <span class="placement-context">Same hotel room as Explore · placement preview</span>
   <div class="placement-help">Drag furniture · Or use the sliders</div>
 </div>
 <aside class="placement-panel" aria-label="Place furniture">
   <div class="furniture-choices"><button data-furniture="chair" class="active" aria-pressed="true">Lounge chair</button><button data-furniture="table" aria-pressed="false">Side table</button></div>
   <h3 id="furniture-name">Lounge chair 01</h3>
   <p id="furniture-size" class="product-meta">78 × 82 × 86 cm · sample furniture</p>
   <div class="furniture-price" id="furniture-price">249 € <small>demo new price</small></div>
   <fieldset class="color-field"><legend>Material colour</legend><div class="color-options">
     <button data-color="#769c7c" style="--swatch:#769c7c" class="active" aria-label="Forest green" aria-pressed="true"></button>
     <button data-color="#c1936d" style="--swatch:#c1936d" aria-label="Caramel" aria-pressed="false"></button>
     <button data-color="#d6d4c8" style="--swatch:#d6d4c8" aria-label="Chalk" aria-pressed="false"></button>
   </div></fieldset>
   <div class="range-field"><label for="furniture-x">Left / right <output id="furniture-x-value">0.00 m</output></label><input type="range" min="-1.4" max="1.4" step=".05" value="0" id="furniture-x"></div>
   <div class="range-field"><label for="furniture-z">Front / back <output id="furniture-z-value">0.00 m</output></label><input type="range" min="-.85" max=".85" step=".05" value="0" id="furniture-z"></div>
   <div class="range-field"><label for="furniture-rotation">Rotation <output id="furniture-rotation-value">0°</output></label><input type="range" min="0" max="360" step="5" value="0" id="furniture-rotation"></div>
   <div class="placement-actions"><button id="animate-furniture">▷ Play demo</button><button id="reset-furniture">Reset</button></div>
   <a class="placement-shop" id="furniture-shop" target="_blank" rel="noopener noreferrer" href="https://www.ikea.com/de/de/search/?q=Sessel">Find similar lounge chairs ↗</a>
   <p class="placement-shop-note">Sample furniture layered into the same Explore room. External product search; no affiliate link.</p>
 </aside>`;

 const localizePlacement=()=>{
   container.querySelector('.placement-badge').textContent=t('placementBadge');
   container.querySelector('.placement-context').textContent=t('placementContext');
   container.querySelector('.placement-help').textContent=t('placementHelp');
   container.querySelector('.placement-panel').setAttribute('aria-label',t('placementPanel'));
   container.querySelector('[data-furniture="chair"]').textContent=t('chair');
   container.querySelector('[data-furniture="table"]').textContent=t('table');
   container.querySelector('.color-field legend').textContent=t('material');
   container.querySelector('[data-color="#769c7c"]').setAttribute('aria-label',t('forest'));
   container.querySelector('[data-color="#c1936d"]').setAttribute('aria-label',t('caramel'));
   container.querySelector('[data-color="#d6d4c8"]').setAttribute('aria-label',t('chalk'));
   container.querySelector('label[for="furniture-x"]').firstChild.textContent=t('leftRight')+' ';
   container.querySelector('label[for="furniture-z"]').firstChild.textContent=t('frontBack')+' ';
   container.querySelector('label[for="furniture-rotation"]').firstChild.textContent=t('rotation')+' ';
   container.querySelector('#animate-furniture').textContent=t('playDemo');
   container.querySelector('#reset-furniture').textContent=t('reset');
   container.querySelector('.placement-shop-note').textContent=t('placementNote');
 };
 localizePlacement();

 const host=container.querySelector('#placement-canvas');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:false});}
 catch{
   host.innerHTML=`<div class="viewer-error"><strong>${t('webgl')}</strong><p>${t('webglBody')}</p></div>`;
   container.querySelectorAll('input,button').forEach(b=>b.disabled=true);
   return {stop(){},play(){notify(t('webglToast'));},dispose(){}};
 }
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 host.append(renderer.domElement);
 renderer.domElement.setAttribute('aria-label',t('placementAria'));
 renderer.domElement.setAttribute('role','img');

 const scene=new THREE.Scene();
 const camera=new THREE.OrthographicCamera(-2.2,2.2,1.7,-1.7,.1,40);
 camera.position.set(0,8,0);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0x3d5143,2.8));
 const sun=new THREE.DirectionalLight(0xfff9ed,3.1);sun.position.set(-3,7,5);sun.castShadow=true;scene.add(sun);

 const objectGroup=new THREE.Group();scene.add(objectGroup);
 const shadowMat=new THREE.MeshBasicMaterial({color:0x17271c,transparent:true,opacity:.18,depthWrite:false});
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.58,48),shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.y=.008;scene.add(shadow);
 const selection=new THREE.Mesh(new THREE.RingGeometry(.57,.59,64),new THREE.MeshBasicMaterial({color:0xcff4d6,transparent:true,opacity:.95,side:THREE.DoubleSide}));
 selection.rotation.x=-Math.PI/2;selection.position.y=.012;scene.add(selection);
 let kind='chair',animation=0,raf=0,active=true,dragging=false,dragOffset=new THREE.Vector3(),selectedColor='#769c7c';
 let cloth=new THREE.MeshStandardMaterial({color:selectedColor,roughness:1,transparent:true,opacity:.98});
 const wood=new THREE.MeshStandardMaterial({color:'#84694f',roughness:.7});
 const clampPosition=(x,z)=>({x:clamp(x,-1.4,1.4),z:clamp(z,-.85,.85)});
 const box=(w,h,d,x,y,z,mat,parent=objectGroup)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const cylinder=(radius,h,x,y,z,mat,parent=objectGroup)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,h,32),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const cushion=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,32,16),cloth);m.scale.set(w/2,h/2,d/2);m.position.set(x,y,z);m.castShadow=true;objectGroup.add(m);};
 const clear=()=>{while(objectGroup.children.length){const child=objectGroup.children.pop();child.traverse(n=>{n.geometry?.dispose();});}};
 const updateFurnitureMeta=()=>{
   const spec=furniture[kind];
   container.querySelector('#furniture-name').textContent=(kind==='chair'?t('chair'):t('table'))+' '+(kind==='chair'?'01':'02');
   container.querySelector('#furniture-size').textContent=spec.size+' · '+t('exampleFurniture');
   container.querySelector('#furniture-price').textContent=euro(spec.price)+' · '+t('newPrice');
   container.querySelectorAll('[data-furniture]').forEach(b=>{b.classList.toggle('active',b.dataset.furniture===kind);b.setAttribute('aria-pressed',String(b.dataset.furniture===kind));});
   const shop=container.querySelector('#furniture-shop');
   shop.textContent=kind==='chair'?t('similarSearchChair'):t('similarSearchTable');
   shop.href=`https://www.ikea.com/de/de/search/?q=${kind==='chair'?'Sessel':'Beistelltisch'}`;
 };
 const create=(next)=>{
   clear();kind=next;
   if(kind==='chair'){
     for(const x of [-.28,.28])for(const z of [-.28,.28])cylinder(.029,.29,x,.145,z,wood);
     box(.68,.12,.69,0,.31,0,cloth);cushion(.7,.23,.72,0,.415,.035);
     box(.66,.36,.16,0,.61,-.3,cloth);cushion(.7,.47,.25,0,.64,-.29);
     box(.09,.22,.69,-.345,.52,.015,cloth);box(.09,.22,.69,.345,.52,.015,cloth);
   }else{
     cylinder(.3,.065,0,.4175,0,cloth);
     for(let a=0;a<3;a++){const angle=a*Math.PI*2/3;cylinder(.025,.39,Math.cos(angle)*.2,.195,Math.sin(angle)*.2,wood);}
   }
   updateFurnitureMeta();render();
 };
 const render=()=>renderer.render(scene,camera);
 const controls={x:container.querySelector('#furniture-x'),z:container.querySelector('#furniture-z'),rotation:container.querySelector('#furniture-rotation')};
 const update=()=>{
   const p=clampPosition(Number(controls.x.value),Number(controls.z.value));
   objectGroup.position.set(p.x,0,p.z);objectGroup.rotation.y=Number(controls.rotation.value)*Math.PI/180;
   shadow.position.x=p.x;shadow.position.z=p.z;selection.position.x=p.x;selection.position.z=p.z;
   for(const key of ['x','z'])container.querySelector(`#furniture-${key}-value`).textContent=Number(controls[key].value).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})+' m';
   container.querySelector('#furniture-rotation-value').textContent=controls.rotation.value+'°';render();
 };
 const stop=()=>{cancelAnimationFrame(raf);animation=0;container.querySelector('#animate-furniture').textContent=t('playDemo');};
 const play=()=>{if(animation){stop();return;}animation=performance.now();container.querySelector('#animate-furniture').textContent=t('stopDemo');const tick=now=>{if(!active){stop();return;}const progress=Math.min((now-animation)/6500,1);controls.x.value=String(-1.15+2.05*(progress*progress*(3-2*progress)));controls.z.value=String(-.45+.82*Math.sin(progress*Math.PI/2));controls.rotation.value=String(Math.round(progress*90/5)*5);update();if(progress<1)raf=requestAnimationFrame(tick);else{stop();notify(t('placementDone'));}};raf=requestAnimationFrame(tick);};
 Object.values(controls).forEach(input=>input.addEventListener('input',()=>{stop();update();}));
 container.querySelectorAll('[data-furniture]').forEach(button=>button.addEventListener('click',()=>{stop();create(button.dataset.furniture);}));
 container.querySelectorAll('[data-color]').forEach(button=>button.addEventListener('click',()=>{selectedColor=button.dataset.color;cloth.color.set(selectedColor);container.querySelectorAll('[data-color]').forEach(color=>{color.classList.toggle('active',color===button);color.setAttribute('aria-pressed',String(color===button));});render();}));
 container.querySelector('#animate-furniture').addEventListener('click',play);
 container.querySelector('#reset-furniture').addEventListener('click',()=>{stop();Object.values(controls).forEach(input=>input.value='0');selectedColor='#769c7c';cloth.color.set(selectedColor);container.querySelectorAll('[data-color]').forEach(color=>{color.classList.toggle('active',color.dataset.color===selectedColor);color.setAttribute('aria-pressed',String(color.dataset.color===selectedColor));});create('chair');update();notify(t('resetDone'));});

 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),point=new THREE.Vector3();
 const ray=event=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);};
 renderer.domElement.addEventListener('pointerdown',event=>{ray(event);if(!raycaster.intersectObjects(objectGroup.children,true).length)return;stop();dragging=true;renderer.domElement.setPointerCapture(event.pointerId);raycaster.ray.intersectPlane(plane,point);dragOffset.copy(objectGroup.position).sub(point);renderer.domElement.style.cursor='grabbing';});
 renderer.domElement.addEventListener('pointermove',event=>{ray(event);if(!dragging){renderer.domElement.style.cursor=raycaster.intersectObjects(objectGroup.children,true).length?'grab':'default';return;}if(raycaster.ray.intersectPlane(plane,point)){const p=clampPosition(point.x+dragOffset.x,point.z+dragOffset.z);controls.x.value=String(p.x);controls.z.value=String(p.z);update();}});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,()=>{dragging=false;renderer.domElement.style.cursor='default';});
 const observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,halfH=1.72,halfW=halfH*aspect;camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();render();});
 observer.observe(host);
 create('chair');update();
 renderer.domElement.setAttribute('aria-label',t('placementAria'));
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();notify(t('graphicsPaused'));});
 return {stop,play,setLanguage(){localizePlacement();updateFurnitureMeta();render();},setActive(value){active=value;if(!value)stop();else render();},dispose(){stop();observer.disconnect();scene.traverse(object=>{object.geometry?.dispose();if(object.material){for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose();}});renderer.dispose();}};
}
