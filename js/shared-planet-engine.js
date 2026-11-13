/**
 * Beyond Atlas - Shared 3D Earth, Moon & Mars Engine
 * NASA Space Apps Challenge
 */

/* ==========================================================================
   Part #17: ba-shared-3d-earth-moon-mars-engine
   ========================================================================== */
(function(){
 let renderer,scene,camera,earthGroup,globe,clouds,moon,raf,resizeObserver;
 let earthSpeed=0.042,moonSpin=0.18;
 let earthRunning=true,moonRunning=true;
 let orbitAngle=0,dragging=false,lastX=0,lastY=0;
 const base='https://threejs.org/examples/textures/planets/';
 function init(){
  const canvas=document.getElementById('baTrueEarthCanvas');
  const host=canvas&&canvas.parentElement;
  if(!canvas||!host||!window.THREE||renderer)return;
  const T=window.THREE;
  try{
   scene=new T.Scene();
   camera=new T.PerspectiveCamera(34,Math.max(1,host.clientWidth)/Math.max(1,host.clientHeight),.1,100);
   camera.position.set(0,-.55,8.1);
   renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
   renderer.setSize(host.clientWidth,host.clientHeight,false);
   if('outputColorSpace' in renderer)renderer.outputColorSpace=T.SRGBColorSpace;else renderer.outputEncoding=T.sRGBEncoding;
   renderer.setClearColor(0x000000,0);
   scene.add(new T.AmbientLight(0x9bbce8,.72));
   const sun=new T.DirectionalLight(0xffffff,2.25);sun.position.set(-4.5,3.2,6);scene.add(sun);
   const rim=new T.DirectionalLight(0x3a9cff,.72);rim.position.set(4,-1.5,-4);scene.add(rim);

   earthGroup=new T.Group();earthGroup.position.set(-1.55,-1.02,0);scene.add(earthGroup);
   const loader=new T.TextureLoader();loader.setCrossOrigin('anonymous');
   const earthMat=new T.MeshPhongMaterial({color:0xffffff,shininess:9,specular:0x182c48});
   globe=new T.Mesh(new T.SphereGeometry(2.72,96,96),earthMat);
   globe.rotation.z=-23.5*Math.PI/180;earthGroup.add(globe);
   loader.load(base+'earth_atmos_2048.jpg',t=>{if('colorSpace'in t)t.colorSpace=T.SRGBColorSpace;else t.encoding=T.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy();earthMat.map=t;earthMat.needsUpdate=true;},undefined,()=>{});
   const cloudMat=new T.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:.24,depthWrite:false});
   clouds=new T.Mesh(new T.SphereGeometry(2.745,96,96),cloudMat);earthGroup.add(clouds);
   loader.load(base+'earth_clouds_1024.png',t=>{if('colorSpace'in t)t.colorSpace=T.SRGBColorSpace;else t.encoding=T.sRGBEncoding;cloudMat.map=t;cloudMat.alphaMap=t;cloudMat.needsUpdate=true;},undefined,()=>{cloudMat.opacity=0;});
   earthGroup.add(new T.Mesh(new T.SphereGeometry(2.81,96,96),new T.MeshBasicMaterial({color:0x168cff,transparent:true,opacity:.075,side:T.BackSide})));

   function makePlanet(radius,texture,color,shininess){
    const mat=new T.MeshPhongMaterial({color,shininess});
    const mesh=new T.Mesh(new T.SphereGeometry(radius,72,72),mat);
    loader.load(base+texture,t=>{if('colorSpace'in t)t.colorSpace=T.SRGBColorSpace;else t.encoding=T.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy();mat.map=t;mat.needsUpdate=true;},undefined,()=>{mat.color.set(color);});
    scene.add(mesh);return mesh;
   }
   moon=makePlanet(.48,'moon_1024.jpg',0xc8cbd1,4);

   // Orbit paths are centered on Earth and share one angular direction.
   function orbit(rx,ry,color,opacity){
    const pts=[];
    for(let i=0;i<=240;i++){const a=i/240*Math.PI*2;pts.push(new T.Vector3(-1.55+Math.cos(a)*rx,-1.02+Math.sin(a)*ry,-.08));}
    const geo=new T.BufferGeometry().setFromPoints(pts);
    scene.add(new T.LineLoop(geo,new T.LineBasicMaterial({color,transparent:true,opacity})));
   }
   orbit(4.05,2.45,0xb7d7ff,.22);

   const starPositions=[];
   for(let i=0;i<650;i++)starPositions.push((Math.random()-.5)*22,(Math.random()-.5)*12,-3-Math.random()*13);
   const starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.Float32BufferAttribute(starPositions,3));
   scene.add(new T.Points(starGeo,new T.PointsMaterial({color:0xe4f2ff,size:.018,transparent:true,opacity:.8})));

   function resize(){
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
   }
   if(window.ResizeObserver){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);}else window.addEventListener('resize',resize);
   resize();

   // Dragging the Earth changes its own orientation and advances the orbital phase
   // in the same direction, so the Moon and Mars follow the user's hand movement.
   canvas.addEventListener('pointerdown',e=>{
    const rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width*2-1;
    const y=-((e.clientY-rect.top)/rect.height*2-1);
    const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(x,y),camera);
    if(ray.intersectObject(globe,false).length){
     dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.classList.add('ba-dragging');
     try{canvas.setPointerCapture(e.pointerId);}catch(_){}
    }
   });
   canvas.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
    const delta=dx*.006;
    globe.rotation.y+=delta;
    globe.rotation.x=Math.max(-.55,Math.min(.55,globe.rotation.x+dy*.004));
    if(clouds){clouds.rotation.y+=delta*.92;clouds.rotation.x=globe.rotation.x;}
    orbitAngle+=delta;
   });
   const stopDrag=()=>{dragging=false;canvas.classList.remove('ba-dragging');};
   canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);canvas.addEventListener('lostpointercapture',stopDrag);

   let previous=0;
   function animate(now){
    raf=requestAnimationFrame(animate);
    const dt=Math.min((now-previous)/1000||0,.05);previous=now;
    if(!document.hidden){
     if(earthRunning&&!dragging){
      const d=earthSpeed*dt;
      globe.rotation.y+=d;
      if(clouds)clouds.rotation.y+=d*.92;
      orbitAngle+=d;
     }
     if(moonRunning)moon.rotation.y+=moonSpin*dt;
     const a=orbitAngle;
     // Orbit phase is shared: both bodies travel in the same angular direction.
     moon.position.set(-1.55+Math.cos(a)*4.05,-1.02+Math.sin(a)*2.45,.1);
     renderer.render(scene,camera);
    }
   }
   raf=requestAnimationFrame(animate);
   setupControls();
  }catch(err){console.error('Shared 3D planetary scene failed:',err);}
 }
 function setupControls(){
  document.querySelectorAll('#baPlanetControls [data-ba-planet-control]').forEach(panel=>{
   const id=panel.dataset.baPlanetControl,slider=panel.querySelector('input'),output=panel.querySelector('output'),button=panel.querySelector('button');
   const getSpeed=()=>id==='earth'?earthSpeed:id==='moon'?moonSpin:marsSpin;
   const setSpeed=v=>{if(id==='earth')earthSpeed=v;else if(id==='moon')moonSpin=v;else marsSpin=v;};
   const isRunning=()=>id==='earth'?earthRunning:id==='moon'?moonRunning:marsRunning;
   const setRunning=v=>{if(id==='earth')earthRunning=v;else if(id==='moon')moonRunning=v;else marsRunning=v;};
   slider.value=getSpeed();output.textContent=Number(slider.value).toFixed(2)+'×';
   slider.addEventListener('input',()=>{setSpeed(Number(slider.value));output.textContent=Number(slider.value).toFixed(2)+'×';});
   button.addEventListener('click',()=>{setRunning(!isRunning());button.textContent=isRunning()?'Pause':'Play';});
  });
 }
 function wait(){
  if(window.THREE){init();return;}
  let tries=0;const timer=setInterval(()=>{tries++;if(window.THREE){clearInterval(timer);init();}else if(tries>120)clearInterval(timer);},100);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait,{once:true});else wait();
 window.addEventListener('load',wait,{once:true});
 window.addEventListener('beforeunload',()=>{if(raf)cancelAnimationFrame(raf);if(resizeObserver)resizeObserver.disconnect();if(renderer)renderer.dispose();});
})();

