/**
 * Beyond Atlas - 3D Celestial Body Viewers (Moon & Mars)
 * NASA Space Apps Challenge
 */

/* ==========================================================================
   Part #6: script-6
   ========================================================================== */
(function(){
 const details={
  moon:{title:'THE MOON',desc:'Our nearest celestial neighbour. Explore lunar landscapes and discover the machines, experiments and landing systems that helped humans study the Moon.',facts:[['WORLD TYPE','Rocky natural satellite'],['EXPLORATION','Apollo · Lunar missions'],['WHAT TO LEARN','Landers, rovers & science'],['LEGACY','Experiments left on the surface']],texture:'https://threejs.org/examples/textures/planets/moon_1024.jpg',target:'moon'},
  mars:{title:'MARS',desc:'A cold, dusty world that challenges every mission. Meet the rovers and engineering systems built to land, move and investigate the Red Planet.',facts:[['WORLD TYPE','Rocky planet'],['EXPLORATION','Robotic rover missions'],['WHAT TO LEARN','Rovers, entry & landing'],['LEGACY','Robotic science on Mars']],texture:'https://threejs.org/examples/textures/planets/mars_1k_color.jpg',target:'mars'}
 };
 window.openPlanetViewer=function(which){const d=details[which];if(!d)return;const v=document.getElementById('planetViewer'),g=document.getElementById('planetViewerGlobe');v.className='planet-viewer open '+(which==='mars'?'mars-theme':'moon-theme');v.setAttribute('aria-hidden','false');document.getElementById('planetViewerTitle').textContent=d.title;document.getElementById('planetViewerDesc').textContent=d.desc;document.getElementById('planetViewerFacts').innerHTML=d.facts.map(f=>'<div class="planet-fact"><small>'+f[0]+'</small><strong>'+f[1]+'</strong></div>').join('');g.className='planet-viewer-globe '+(which==='mars'?'mars':'moon');g.style.backgroundImage='url("'+d.texture+'"),radial-gradient(circle at 30% 30%,#ddd,#555)';g.style.backgroundColor=which==='mars'?'#b64a2d':'#9298a2';document.getElementById('planetViewerExplore').dataset.target=d.target;document.body.style.overflow='hidden';};
 window.closePlanetViewer=function(){const v=document.getElementById('planetViewer');v.classList.remove('open');v.setAttribute('aria-hidden','true');document.body.style.overflow='';};
 window.explorePlanetHardware=function(){const target=document.getElementById('planetViewerExplore').dataset.target;window.closePlanetViewer();setTimeout(()=>{const section=document.getElementById(target);if(section)section.scrollIntoView({behavior:'smooth',block:'start'});},150);};
 document.addEventListener('keydown',e=>{if(e.key==='Escape')window.closePlanetViewer();});
 document.getElementById('planetViewer')?.addEventListener('click',e=>{if(e.target.id==='planetViewer')window.closePlanetViewer();});
})();

/* ==========================================================================
   Part #7: beyond-atlas-true-webgl-planets
   ========================================================================== */
(function(){
 const textureURLs={moon:'https://threejs.org/examples/textures/planets/moon_1024.jpg',mars:'https://threejs.org/examples/textures/planets/mars_1k_color.jpg'};
 let planetRenderer=null,planetScene=null,planetCamera=null,planetMesh=null,planetRAF=0,planetResize=null;
 function makeStars(scene){const n=850,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*34;a[i*3+1]=(Math.random()-.5)*24;a[i*3+2]=(Math.random()-.5)*24-3;}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(a,3));scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xd9efff,size:.035,transparent:true,opacity:.8})));}
 function disposePlanet(){if(planetRAF)cancelAnimationFrame(planetRAF);planetRAF=0;if(planetRenderer){planetRenderer.dispose();planetRenderer.domElement.remove();}planetRenderer=planetScene=planetCamera=planetMesh=null;if(planetResize)removeEventListener('resize',planetResize);planetResize=null;}
 function startPlanet(which){if(!window.THREE)return;disposePlanet();const host=document.getElementById('planetViewerGlobe');if(!host)return;host.innerHTML='';const w=Math.max(220,host.clientWidth||520),h=Math.max(220,host.clientHeight||520);planetScene=new THREE.Scene();planetCamera=new THREE.PerspectiveCamera(34,w/h,.1,100);planetCamera.position.set(0,0,4.05);planetRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});planetRenderer.setPixelRatio(Math.min(devicePixelRatio||1,2));planetRenderer.setSize(w,h);planetRenderer.outputEncoding=THREE.sRGBEncoding;host.appendChild(planetRenderer.domElement);makeStars(planetScene);planetScene.add(new THREE.AmbientLight(0xffffff,.85));const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(-3,2,5);planetScene.add(key);const rim=new THREE.DirectionalLight(which==='mars'?0xff7948:0x78cfff,1.1);rim.position.set(4,-2,-3);planetScene.add(rim);const fallback=new THREE.MeshStandardMaterial({color:which==='mars'?0xb94f30:0x858b96,roughness:1});planetMesh=new THREE.Mesh(new THREE.SphereGeometry(1.32,128,128),fallback);planetScene.add(planetMesh);new THREE.TextureLoader().load(textureURLs[which],tex=>{tex.colorSpace=THREE.SRGBColorSpace||THREE.sRGBEncoding;tex.anisotropy=planetRenderer.capabilities.getMaxAnisotropy();planetMesh.material=new THREE.MeshStandardMaterial({map:tex,roughness:1});},undefined,()=>{planetMesh.material=new THREE.MeshStandardMaterial({color:which==='mars'?0xc85d38:0x969ba5,roughness:1});});const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.355,96,96),new THREE.MeshBasicMaterial({color:which==='mars'?0xff764b:0x8bdcff,transparent:true,opacity:.055,side:THREE.BackSide}));planetScene.add(atmosphere);planetResize=()=>{if(!planetRenderer||!host.isConnected)return;const nw=Math.max(220,host.clientWidth),nh=Math.max(220,host.clientHeight);planetCamera.aspect=nw/nh;planetCamera.updateProjectionMatrix();planetRenderer.setSize(nw,nh);};addEventListener('resize',planetResize);let last=0;function loop(t){planetRAF=requestAnimationFrame(loop);if(!planetRenderer)return;if(t-last>30){planetMesh.rotation.y+=.0018;atmosphere.rotation.y+=.0012;planetRenderer.render(planetScene,planetCamera);last=t;}}planetRAF=requestAnimationFrame(loop);}
 const oldOpen=window.openPlanetViewer;
 window.openPlanetViewer=function(which){if(oldOpen)oldOpen(which);const viewer=document.getElementById('planetViewer');viewer.classList.add(which==='mars'?'mars-theme':'moon-theme');requestAnimationFrame(()=>requestAnimationFrame(()=>startPlanet(which)));};
 const oldClose=window.closePlanetViewer;
 window.closePlanetViewer=function(){disposePlanet();if(oldClose)oldClose();};
 // Hardware images become floating, slowly rotating 3D objects in a planet-specific scene.
 let hwRenderer=null,hwRAF=0,hwResize=null;
 function clearHardware3D(){if(hwRAF)cancelAnimationFrame(hwRAF);hwRAF=0;if(hwRenderer){hwRenderer.dispose();hwRenderer.domElement.remove();}hwRenderer=null;if(hwResize)removeEventListener('resize',hwResize);hwResize=null;}
 function renderHardware3D(img){if(!window.THREE||!img||!img.src)return;const wrap=document.getElementById('modalPhotoWrap');if(!wrap)return;clearHardware3D();let stage=document.getElementById('hardware3DStage');if(!stage){stage=document.createElement('div');stage.id='hardware3DStage';stage.className='hardware-3d-stage';wrap.insertBefore(stage,wrap.querySelector('.modal-photo-credit'));}const sub=(document.getElementById('mSub')?.textContent||'').toLowerCase(),isMars=sub.includes('mars');stage.className='hardware-3d-stage '+(isMars?'mars-stage':'');stage.innerHTML='';const w=Math.max(240,stage.clientWidth||600),h=Math.max(200,stage.clientHeight||360);const scene=new THREE.Scene();scene.background=null;const camera=new THREE.PerspectiveCamera(42,w/h,.1,100);camera.position.set(0,0,5.1);hwRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true});hwRenderer.setPixelRatio(Math.min(devicePixelRatio||1,2));hwRenderer.setSize(w,h);hwRenderer.outputEncoding=THREE.sRGBEncoding;stage.appendChild(hwRenderer.domElement);scene.add(new THREE.AmbientLight(0xffffff,1.5));const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(-2,3,5);scene.add(light);const starPos=new Float32Array(500*3);for(let i=0;i<500;i++){starPos[i*3]=(Math.random()-.5)*18;starPos[i*3+1]=(Math.random()-.5)*10;starPos[i*3+2]=-2-Math.random()*8;}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(starPos,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:.025,transparent:true,opacity:.8})));
 const planetTex=new THREE.TextureLoader();planetTex.load(textureURLs[isMars?'mars':'moon'],tex=>{const sphere=new THREE.Mesh(new THREE.SphereGeometry(1.2,48,48),new THREE.MeshStandardMaterial({map:tex,roughness:1}));sphere.position.set(2.0,.15,-1.2);sphere.scale.setScalar(.72);scene.add(sphere);sphere.userData.isPlanet=true;});
 const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');loader.load(img.currentSrc||img.src,tex=>{tex.colorSpace=THREE.SRGBColorSpace||THREE.sRGBEncoding;tex.anisotropy=hwRenderer.capabilities.getMaxAnisotropy();const ratio=(img.naturalWidth||4)/(img.naturalHeight||3);const width=Math.min(2.65,Math.max(1.65,2.35));const height=width/ratio;const obj=new THREE.Group();const plane=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({map:tex,roughness:.72,metalness:.02,side:THREE.DoubleSide}));obj.add(plane);const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(width,height,.06)),new THREE.LineBasicMaterial({color:isMars?0xff9a72:0x75e7ff,transparent:true,opacity:.75}));obj.add(edge);obj.position.set(-.35,0,0);scene.add(obj);obj.userData.hardware=true;},undefined,()=>{const fallback=document.createElement('img');fallback.className='hardware-photo-fallback';fallback.src=img.currentSrc||img.src;fallback.alt=img.alt||'NASA hardware';fallback.onerror=()=>{fallback.alt='NASA hardware image unavailable';};stage.appendChild(fallback);});
 hwResize=()=>{if(!hwRenderer||!stage.isConnected)return;const nw=Math.max(240,stage.clientWidth),nh=Math.max(200,stage.clientHeight);camera.aspect=nw/nh;camera.updateProjectionMatrix();hwRenderer.setSize(nw,nh);};addEventListener('resize',hwResize);let tick=0;function loop(){hwRAF=requestAnimationFrame(loop);tick+=.008;scene.children.forEach(o=>{if(o.userData.hardware){o.rotation.y=Math.sin(tick*.5)*.18;o.rotation.x=Math.sin(tick*.3)*.04;}if(o.userData.isPlanet)o.rotation.y+=.002;});hwRenderer.render(scene,camera);}hwRAF=requestAnimationFrame(loop);}
 const image=document.getElementById('modalHardwarePhoto');if(image){const priorLoad=image.onload;image.onload=function(e){if(typeof priorLoad==='function')priorLoad.call(this,e);renderHardware3D(this);};}
 const originalOpenModal=window.openModal;
 if(originalOpenModal){window.openModal=async function(id){clearHardware3D();const img=document.getElementById('modalHardwarePhoto');if(img)img.style.display='none';const result=await originalOpenModal(id);const current=document.getElementById('modalHardwarePhoto');if(current&&current.complete&&current.naturalWidth)renderHardware3D(current);return result;};}
 const originalCloseModal=window.closeModal;if(originalCloseModal)window.closeModal=function(){clearHardware3D();const stage=document.getElementById('hardware3DStage');if(stage)stage.innerHTML='';return originalCloseModal();};
})();

/* ==========================================================================
   Part #12: beyond-atlas-world-side-info
   ========================================================================== */
document.addEventListener('DOMContentLoaded',()=>{
 const data={
  moon:{title:'THE MOON',body:'Earth’s natural satellite. NASA’s Lunar Reconnaissance Orbiter has mapped its surface in detail, helping scientists study craters, landing regions and resources for future exploration.',link:'#moon',label:'Explore lunar missions ↗'},
  mars:{title:'MARS',body:'The Red Planet has ancient river valleys, cratered plains and evidence of past water. NASA orbiters and rovers study its geology and search for signs of ancient habitability.',link:'#mars',label:'Explore Mars missions ↗'}
 };
 const panel=document.getElementById('atlasSideDetail');
 document.querySelectorAll('.atlas-side-option').forEach(btn=>btn.addEventListener('click',()=>{
  const key=btn.dataset.worldInfo, item=data[key]; if(!item||!panel)return;
  document.querySelectorAll('.atlas-side-option').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',b===btn?'true':'false')});
  panel.innerHTML='<strong>'+item.title+'</strong><p>'+item.body+'</p><a href="'+item.link+'">'+item.label+'</a>';
 }));
 const video=document.querySelector('.hardware-bg-video');
 if(video){const start=()=>{video.play().catch(()=>{});};if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){start();io.disconnect();}}),{rootMargin:'150px'});io.observe(video);}else{video.addEventListener('canplay',start,{once:true});}}
});

/* ==========================================================================
   Part #20: ba-moon-mars-click-to-load-3d-script
   ========================================================================== */
(function () {
  function initMoonMars3DButtons() {
    document.querySelectorAll('#real-3d-hardware .ba-load-3d-button').forEach(function (button) {
      if (button.dataset.bound === '1') return;
      button.dataset.bound = '1';

      button.addEventListener('click', function () {
        var stage = button.previousElementSibling;
        if (!stage || !stage.classList.contains('real3d-stage')) {
          stage = button.parentElement.querySelector('.real3d-stage');
        }
        if (!stage) return;

        var preview = stage.querySelector('.ba-planet-preview');
        var viewer = stage.querySelector('.ba-lazy-3d-viewer');
        var opened = button.dataset.opened === '1';

        if (opened) {
          if (viewer) viewer.classList.remove('ba-viewer-open');
          if (preview) preview.classList.remove('ba-preview-hidden');
          button.dataset.opened = '0';
          button.textContent = button.dataset.planet === 'moon'
            ? '◇  Load Moon 3D View'
            : '◇  Load Mars 3D View';
        } else {
          if (preview) preview.classList.add('ba-preview-hidden');
          if (viewer) {
            viewer.classList.add('ba-viewer-open');
            if (viewer.tagName.toLowerCase() === 'model-viewer') {
              viewer.setAttribute('reveal', 'auto');
              viewer.setAttribute('camera-controls', '');
            }
          }
          button.dataset.opened = '1';
          button.textContent = '↶  Show Photo';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMoonMars3DButtons);
  } else {
    initMoonMars3DButtons();
  }
})();

