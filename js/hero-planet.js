/**
 * Beyond Atlas - Hero 3D Interactive Mars & Mission Flow
 * NASA Space Apps Challenge
 */

/* ==========================================================================
   Part #2: script-2
   ========================================================================== */
(function(){
 let renderer,scene,camera,mars,host,drag=false,lastX=0,lastY=0,zoom=4.65,frame=0,autoRotate=true;
 function initAtlasWorlds(){
  const canvas=document.getElementById('heroPlanetCanvas');
  host=canvas&&canvas.parentElement;
  if(!canvas||!host||!window.THREE||renderer)return;
  try{
   scene=new THREE.Scene();
   camera=new THREE.PerspectiveCamera(38,Math.max(1,host.clientWidth)/Math.max(1,host.clientHeight),.1,120);
   camera.position.set(0,0,zoom);
   renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
   renderer.setSize(host.clientWidth,host.clientHeight,false);
   if('outputColorSpace' in renderer)renderer.outputColorSpace=THREE.SRGBColorSpace;
   else renderer.outputEncoding=THREE.sRGBEncoding;

   scene.add(new THREE.AmbientLight(0xffd5bd,.48));
   const sunlight=new THREE.DirectionalLight(0xffd0ad,2.65);
   sunlight.position.set(-4.5,3.5,6);scene.add(sunlight);
   const fill=new THREE.DirectionalLight(0xe98762,.42);
   fill.position.set(3,-2,4);scene.add(fill);
   const rim=new THREE.DirectionalLight(0x9c3e27,.48);
   rim.position.set(3,-1,-4);scene.add(rim);

   const material=new THREE.MeshPhongMaterial({
    color:0xffffff,shininess:5,specular:0x28100a
   });
   mars=new THREE.Mesh(new THREE.SphereGeometry(1.06,192,192),material);
   mars.rotation.z=-.12;
   scene.add(mars);

   const loader=new THREE.TextureLoader();
   loader.setCrossOrigin('anonymous');
   loader.load('https://www.solarsystemscope.com/textures/download/2k_mars.jpg',texture=>{
    if('colorSpace' in texture)texture.colorSpace=THREE.SRGBColorSpace;
    else texture.encoding=THREE.sRGBEncoding;
    texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
    texture.wrapS=THREE.RepeatWrapping;
    material.map=texture;
    material.needsUpdate=true;
   },undefined,()=>{
    // Warm, detailed-looking fallback if the color map host is unavailable.
    material.color.set(0xc96b45);
    material.needsUpdate=true;
   });

   const atmosphere=new THREE.Mesh(
    new THREE.SphereGeometry(1.075,96,96),
    new THREE.MeshBasicMaterial({color:0xe8754f,transparent:true,opacity:.045,side:THREE.BackSide})
   );
   scene.add(atmosphere);

   const starPositions=[];
   for(let i=0;i<420;i++)starPositions.push((Math.random()-.5)*12,(Math.random()-.5)*7,-2-Math.random()*9);
   const starGeometry=new THREE.BufferGeometry();
   starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
   scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xdcecff,size:.016,transparent:true,opacity:.75})));

   const resize=()=>{
    if(!renderer||!host.clientWidth||!host.clientHeight)return;
    camera.aspect=host.clientWidth/host.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth,host.clientHeight,false);
   };
   if(window.ResizeObserver)new ResizeObserver(resize).observe(host);
   else window.addEventListener('resize',resize);

   canvas.style.touchAction='none';
   canvas.style.cursor='grab';
   canvas.addEventListener('pointerdown',e=>{
    drag=true;lastX=e.clientX;lastY=e.clientY;
    canvas.style.cursor='grabbing';
    try{canvas.setPointerCapture(e.pointerId);}catch(_){}
   });
   canvas.addEventListener('pointermove',e=>{
    if(!drag)return;
    const dx=e.clientX-lastX,dy=e.clientY-lastY;
    lastX=e.clientX;lastY=e.clientY;
    mars.rotation.y+=dx*.008;
    mars.rotation.x=Math.max(-1.15,Math.min(1.15,mars.rotation.x+dy*.008));
   });
   const stop=()=>{drag=false;canvas.style.cursor='grab';};
   canvas.addEventListener('pointerup',stop);
   canvas.addEventListener('pointercancel',stop);
   canvas.addEventListener('lostpointercapture',stop);
   canvas.addEventListener('wheel',e=>{
    e.preventDefault();
    zoom=Math.max(3.3,Math.min(7.5,zoom+e.deltaY*.004));
    camera.position.z=zoom;
   },{passive:false});


   window.__baHeroMarsControls={
    toggleRotation:function(){autoRotate=!autoRotate;return autoRotate;},
    zoomIn:function(){zoom=Math.max(3.25,zoom-.35);camera.position.z=zoom;},
    zoomOut:function(){zoom=Math.min(7.2,zoom+.35);camera.position.z=zoom;},
    reset:function(){mars.rotation.set(0,-.12,0);zoom=4.65;camera.position.z=zoom;autoRotate=true;}
   };
   function animate(){
    frame=requestAnimationFrame(animate);
    if(!document.hidden){
     if(autoRotate&&!drag)mars.rotation.y+=.0038;
     renderer.render(scene,camera);
    }
   }
   animate();
  }catch(e){console.warn('Homepage Mars 3D scene unavailable:',e);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAtlasWorlds);
 else initAtlasWorlds();
 window.addEventListener('load',initAtlasWorlds);
})();

/* ==========================================================================
   Part #4: BA-MISSION-CLICK-AND-VIDEO-FLOW
   ========================================================================== */
(() => {
  const init = () => {
    const btn = document.getElementById('openBothMissionGames');
    const grid = document.getElementById('missionGamesGrid');
    if (!btn || !grid || btn.dataset.launcherBound === '1') return;
    btn.dataset.launcherBound = '1';

    const closeGame = () => {
      grid.classList.remove('games-opened');
      btn.setAttribute('aria-expanded', 'false');
      const video = grid.querySelector('.ba-mission-video');
      if (video) video.pause();
    };

    closeGame();
    btn.addEventListener('click', () => {
      const open = !grid.classList.contains('games-opened');
      grid.classList.toggle('games-opened', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        const video = grid.querySelector('.ba-mission-video');
        if (video) video.play().catch(() => {});
        window.setTimeout(() => grid.scrollIntoView({behavior: 'smooth', block: 'start'}), 60);
      } else {
        const video = grid.querySelector('.ba-mission-video');
        if (video) video.pause();
      }
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once: true});
  } else {
    init();
  }
})();

