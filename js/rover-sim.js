/**
 * Beyond Atlas - 3D Mars Rover Driving Simulation Engine
 * NASA Space Apps Challenge
 */

/* ==========================================================================
   Part #14: ROVER-ROBUST-CONTROLS
   ========================================================================== */
(function(){
 function init(){
  const canvas=document.getElementById('rover3DCanvas');
  if(!canvas || canvas.dataset.controllerReady==='1') return;
  const ctx=canvas.getContext('2d');
  if(!ctx) return;
  canvas.dataset.controllerReady='1';
  const el=id=>document.getElementById(id);
  let w=0,h=0,px=0,heading=0,energy=100,data=0,samples=0,xp=0,solar=false,arm=false,cam=0,level=1;
  const rocks=[{x:-.7,d:3.3,scanned:false,col:'#b58a70'},{x:.85,d:5.4,scanned:false,col:'#8d7667'},{x:-.15,d:7.1,scanned:false,col:'#c19b7b'},{x:1.35,d:9,scanned:false,col:'#9c806c'}];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function size(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);draw();}
  function project(x,y,d){const scale=330/(d+3);return{x:w/2+(x+cam)*scale,y:h*.53-y*scale*.78,d,scale};}
  function polygon(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>{const q=project(...p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
  function drawRock(r){const q=project(r.x,0,r.d),rad=clamp(q.scale*.27,7,26);ctx.save();ctx.translate(q.x,q.y);ctx.fillStyle=r.scanned?'#5ec8d5':r.col;ctx.strokeStyle='rgba(255,224,190,.65)';ctx.beginPath();ctx.moveTo(-rad,rad*.2);ctx.lineTo(-rad*.55,-rad*.8);ctx.lineTo(rad*.15,-rad);ctx.lineTo(rad,0);ctx.lineTo(rad*.45,rad*.55);ctx.lineTo(-rad*.6,rad*.6);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  function drawRover(){
   const base=project(0,0,0),sc=clamp(base.scale/30,1,1.5),cx=w/2,cy=h*.69;
   ctx.save();ctx.translate(cx,cy);ctx.rotate(heading*.12);
   // wheels
   [-1,1].forEach(x=>[-1,1].forEach(z=>{ctx.fillStyle='#111a22';ctx.strokeStyle='#a4b8c4';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x*43*sc,z*17*sc,10*sc,17*sc,-.18,0,Math.PI*2);ctx.fill();ctx.stroke();}));
   // rover chassis with shaded faces
   ctx.fillStyle='#d59a3b';ctx.strokeStyle='#ffe09b';ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(-43*sc,-25*sc);ctx.lineTo(35*sc,-25*sc);ctx.lineTo(47*sc,-7*sc);ctx.lineTo(-31*sc,-7*sc);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#a86d2c';ctx.beginPath();ctx.moveTo(-31*sc,-7*sc);ctx.lineTo(47*sc,-7*sc);ctx.lineTo(39*sc,14*sc);ctx.lineTo(-39*sc,14*sc);ctx.closePath();ctx.fill();ctx.stroke();
   // solar wings
   const wing=solar?84:62;ctx.fillStyle='#164f77';ctx.strokeStyle='#83d9fa';ctx.fillRect(-wing*sc,-33*sc,wing*sc-45*sc,7*sc);ctx.strokeRect(-wing*sc,-33*sc,wing*sc-45*sc,7*sc);ctx.fillRect(45*sc,-33*sc,(wing-45)*sc,7*sc);ctx.strokeRect(45*sc,-33*sc,(wing-45)*sc,7*sc);
   // mast and camera
   ctx.strokeStyle='#d6e0e5';ctx.lineWidth=4*sc;ctx.beginPath();ctx.moveTo(0,-25*sc);ctx.lineTo(0,-85*sc);ctx.stroke();ctx.fillStyle='#dbe5e9';ctx.fillRect(-13*sc,-96*sc,26*sc,17*sc);ctx.strokeRect(-13*sc,-96*sc,26*sc,17*sc);
   // drill arm extends on drill action
   ctx.strokeStyle='#e7c47d';ctx.lineWidth=4*sc;ctx.beginPath();ctx.moveTo(28*sc,-9*sc);ctx.lineTo((arm?65:48)*sc,8*sc);ctx.stroke();ctx.restore();
  }
  function draw(){
   if(!w||!h)return;
   const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#152d43');g.addColorStop(.5,'#4a3b35');g.addColorStop(1,'#251d1a');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
   ctx.fillStyle='rgba(232,241,248,.55)';for(let i=0;i<28;i++){const x=(i*89)%w,y=(i*37)%(h*.38);ctx.fillRect(x,y,1,1);}
   polygon([[-20,-.1,1],[20,-.1,1],[35,-.1,18],[-35,-.1,18]],'#795542');
   for(let d=2;d<20;d+=2){const a=project(-20,-.1,d),b=project(20,-.1,d);ctx.strokeStyle='rgba(255,207,164,.13)';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
   rocks.forEach(drawRock);drawRover();
   ctx.strokeStyle='rgba(125,225,255,.6)';ctx.beginPath();ctx.arc(w/2,h*.53,15,0,Math.PI*2);ctx.stroke();
  }
  function update(){el('roverEnergy').textContent=energy+'%';el('roverData').textContent=data;el('roverSamples').textContent=samples+' / 3';el('roverXP').textContent=xp;el('roverSector').textContent='SECTOR '+String.fromCharCode(65+(Math.floor(px)%5))+'-'+String(1+Math.floor(px*2)%9).padStart(2,'0');const lv=el('roverLevel');if(lv)lv.textContent='LEVEL '+String(level).padStart(2,'0')+' / 05';const ob=el('roverLevelObjective');if(ob)ob.textContent=level===5?'Final mission: secure 3 samples':'Collect 3 samples · '+(5-level)+' level(s) after this';}
  function say(t){const m=el('roverMessage');if(m)m.textContent=t;}
  function spend(n){if(energy<n){say('Battery low — click SOLAR to recharge.');return false;}energy-=n;return true;}
  function drive(dir){
   if(!spend(4))return;
   px+=dir;rocks.forEach(r=>{r.d-=dir*.72;r.x-=heading*.06;});
   rocks.forEach(r=>{if(r.d<1.5)r.d=1.5;if(r.d>12)r.d=12;});
   xp+=2;update();draw();say(dir>0?'Rover moved forward. Select a nearby rock and click SCAN.':'Rover reversed. Keep a safe distance from the rocks.');
  }
  function nearest(){return rocks.filter(r=>!r.scanned&&r.d>=1.4&&r.d<=5.8).sort((a,b)=>a.d-b.d)[0]||rocks.find(r=>r.scanned&&r.d>=1.4&&r.d<=5.8);}
  function scan(){if(!spend(5))return;const r=nearest();if(!r){energy+=5;say('No rock in range. Click DRIVE to approach a rock.');return;}if(r.scanned){energy+=5;say('This rock is already scanned. Click DRILL to collect its sample.');return;}r.scanned=true;data++;xp+=10;update();draw();say('SCAN COMPLETE — mineral signature recorded. Now click DRILL.');}
  function drill(){const r=rocks.find(a=>a.scanned&&!a.sampled&&a.d>=1.2&&a.d<=6.2);if(!r){say('No scanned rock close enough. DRIVE closer, then SCAN.');return;}if(samples>=3){say('Mission complete — all three samples collected!');return;}if(!spend(12))return;r.sampled=true;samples++;xp+=25;arm=true;if(samples===3){if(level<5){say('LEVEL '+level+' COMPLETE! New terrain unlocked — preparing Level '+(level+1)+'.');level++;samples=0;energy=Math.min(100,energy+25);rocks.forEach((r,i)=>{r.d=[3.1,4.9,6.8,8.8][i];r.x=[-.9,.7,-.2,1.25][i];r.scanned=false;r.sampled=false;});arm=false;data+=1;}else{say('FINAL MISSION COMPLETE! All 5 levels cleared. Total science data: '+data+'.');}}else{say('Sample secured '+samples+'/3. Drive to another rock, then SCAN and DRILL.');}update();draw();}
  function solarToggle(){solar=!solar;if(solar){const old=energy;energy=Math.min(100,energy+35);xp+=5;say('Solar array deployed — battery charged by '+(energy-old)+'%.');}else say('Solar array folded. Ready to drive.');el('roverSolar').textContent=solar?'☀ SOLAR ON':'☀ SOLAR';update();draw();}
  function bind(id,fn){const old=el(id);if(!old)return;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener('click',e=>{e.preventDefault();fn();});}
  bind('roverDriveForward',()=>drive(1));bind('roverDriveLeft',()=>{heading--;cam-=.35;if(spend(1)){xp++;update();draw();say('Steering left — rover heading changed.');}});bind('roverDriveRight',()=>{heading++;cam+=.35;if(spend(1)){xp++;update();draw();say('Steering right — rover heading changed.');}});bind('roverScan',scan);bind('roverDrill',drill);bind('roverSolar',solarToggle);
  bind('roverReset',()=>{px=0;heading=0;cam=0;energy=100;data=0;samples=0;xp=0;solar=false;arm=false;level=1;rocks.forEach((r,i)=>{r.d=[3.3,5.4,7.1,9][i];r.x=[-.7,.85,-.15,1.35][i];r.scanned=false;r.sampled=false;});el('roverSolar').textContent='☀ SOLAR';update();draw();say('Mission reset. Level 1 ready — clear all 5 levels.');});
  canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);canvas._dragX=e.clientX;});canvas.addEventListener('pointermove',e=>{if(canvas._dragX==null)return;cam+=(e.clientX-canvas._dragX)*.008;canvas._dragX=e.clientX;draw();});['pointerup','pointercancel','pointerleave'].forEach(n=>canvas.addEventListener(n,()=>canvas._dragX=null));
  window.addEventListener('keydown',e=>{if(!document.getElementById('game'))return;if(['ArrowUp','w','W'].includes(e.key)){e.preventDefault();drive(1);}if(['ArrowDown','s','S'].includes(e.key)){e.preventDefault();drive(-1);}if(['ArrowLeft','a','A'].includes(e.key)){heading--;cam-=.2;draw();}if(['ArrowRight','d','D'].includes(e.key)){heading++;cam+=.2;draw();}},{passive:false});
  if('ResizeObserver'in window)new ResizeObserver(size).observe(canvas.parentElement);else window.addEventListener('resize',size);
  size();update();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

