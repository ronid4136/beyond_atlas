/**
 * Beyond Atlas - Arcade Lunar Lander & Mars Rover Mini-Games
 * NASA Space Apps Challenge
 */

/* ==========================================================================
   Part #18: ba-arcade-rover-lander-games-js
   ========================================================================== */
(function(){
  const root=document.getElementById('baArcadeGames');
  if(!root || root.dataset.ready==='1') return;
  root.dataset.ready='1';
  const area=document.getElementById('baGamePlayArea'),canvas=document.getElementById('baArcadeCanvas'),ctx=canvas.getContext('2d');
  const status=document.getElementById('baGameStatus'),title=document.getElementById('baGameTitle'),kicker=document.getElementById('baGameKicker'),instructions=document.getElementById('baGameInstructions'),controls=document.getElementById('baGameControls');
  const stepEls=[...document.querySelectorAll('#baMiniMissionSteps .ba-mini-step')],hud=document.getElementById('baMoonHud');
  const fuelEl=document.getElementById('baFuelValue'),altEl=document.getElementById('baAltitudeValue'),speedEl=document.getElementById('baSpeedValue'),angleEl=document.getElementById('baAngleValue');
  let game='rover',running=false,raf=0,keys={},last=0,rover,lander,samples,rocks,message='',elapsed=0,particles=[];
  const W=800,H=380,groundY=314,pad={x:400,w:132};
  function setStep(n){stepEls.forEach((el,i)=>{el.classList.toggle('active',i===n-1);el.classList.toggle('done',i<n-1)})}
  function resetRover(){rover={x:85,y:190,a:0,speed:0,score:0};samples=[{x:250,y:80},{x:480,y:120},{x:690,y:160},{x:340,y:300},{x:570,y:280}];rocks=[{x:285,y:205,r:29},{x:455,y:250,r:35},{x:530,y:65,r:24},{x:620,y:190,r:30}];message='Collect all 5 glowing science samples. Avoid the rocks.'}
  function resetLander(){lander={x:400,y:74,vx:0,vy:0,a:0,fuel:100,landed:false,crashed:false,score:0};elapsed=0;particles=[];message='Mission objective: align above the pad, reduce speed, and touch down gently.'}
  function reset(){if(game==='rover')resetRover();else resetLander();status.textContent=message;draw()}
  function drawRover(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#241108');g.addColorStop(1,'#51230f');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,130,58,.12)';for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    rocks.forEach(o=>{ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fillStyle='#160b07';ctx.fill();ctx.strokeStyle='#9a3d12';ctx.stroke()});
    samples.forEach(o=>{ctx.beginPath();ctx.arc(o.x,o.y,9,0,Math.PI*2);ctx.fillStyle='#39caff';ctx.shadowColor='#29bfff';ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#c9efff';ctx.font='10px Arial';ctx.textAlign='center';ctx.fillText('SAMPLE',o.x,o.y-17)});
    ctx.save();ctx.translate(rover.x,rover.y);ctx.rotate(rover.a);ctx.fillStyle='#d7e8f4';ctx.fillRect(-15,-10,30,20);ctx.fillStyle='#708ca3';ctx.fillRect(-19,-13,8,26);ctx.fillRect(11,-13,8,26);ctx.fillStyle='#24cfff';ctx.beginPath();ctx.arc(8,-3,4,0,7);ctx.fill();ctx.restore();
    ctx.fillStyle='#d9edff';ctx.font='bold 15px Arial';ctx.textAlign='left';ctx.fillText('SCIENCE SAMPLES  '+rover.score+'/5',18,27);
  }
  function terrainY(x){return 310+12*Math.sin(x*.014)+7*Math.sin(x*.032+1.4)-4*Math.cos(x*.008)}
  function drawLander(){
    ctx.fillStyle='#020916';ctx.fillRect(0,0,W,H);
    // Deep-space stars and distant Earth.
    for(let i=0;i<105;i++){const x=(i*137+23)%W,y=(i*71+13)%270;ctx.fillStyle=i%7===0?'#9bdcff':'rgba(225,240,255,.75)';ctx.fillRect(x,y,i%7===0?2:1, i%7===0?2:1)}
    const earth=ctx.createRadialGradient(112,68,3,112,68,27);earth.addColorStop(0,'#8edbff');earth.addColorStop(.55,'#2867c8');earth.addColorStop(1,'#071c48');ctx.fillStyle=earth;ctx.beginPath();ctx.arc(112,68,27,0,Math.PI*2);ctx.fill();
    // Moon mountains and cratered foreground.
    ctx.beginPath();ctx.moveTo(0,terrainY(0));for(let x=0;x<=W;x+=12)ctx.lineTo(x,terrainY(x));ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
    const ground=ctx.createLinearGradient(0,270,0,H);ground.addColorStop(0,'#596a82');ground.addColorStop(.25,'#27364d');ground.addColorStop(1,'#141f32');ctx.fillStyle=ground;ctx.fill();ctx.strokeStyle='#8fa5bd';ctx.lineWidth=2;ctx.stroke();
    for(let i=0;i<14;i++){const x=(i*79+31)%W,y=terrainY(x)+18+(i%3)*9;ctx.beginPath();ctx.ellipse(x,y,9+(i%4)*5,3+(i%3)*2,-.12,0,Math.PI*2);ctx.fillStyle='rgba(8,15,27,.28)';ctx.fill()}
    // Glowing, clearly marked touchdown zone.
    ctx.save();ctx.shadowColor='#35f0a5';ctx.shadowBlur=14;ctx.strokeStyle='#35e6a1';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(pad.x,terrainY(pad.x)-3,pad.w/2,10,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(40,223,151,.16)';ctx.fill();ctx.restore();
    ctx.fillStyle='#ffcf4a';ctx.fillRect(pad.x-42,terrainY(pad.x)-5,84,4);ctx.fillStyle='#b7f9dc';ctx.font='10px Arial';ctx.textAlign='center';ctx.fillText('TRANQUILITY BASE · LANDING ZONE',pad.x,terrainY(pad.x)-18);
    // Lander engine plume.
    ctx.save();ctx.translate(lander.x,lander.y);ctx.rotate(lander.a);
    if(keys.ArrowUp&&lander.fuel>0&&!lander.crashed&&!lander.landed){const flame=22+Math.random()*17;const fg=ctx.createLinearGradient(0,17,0,17+flame);fg.addColorStop(0,'#fff3a0');fg.addColorStop(.4,'#ffb43b');fg.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(-6,17);ctx.lineTo(0,17+flame);ctx.lineTo(6,17);ctx.closePath();ctx.fill()}
    // Landing craft body, legs and antenna.
    ctx.strokeStyle='#d8e4f1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,12);ctx.lineTo(-23,27);ctx.lineTo(-32,30);ctx.moveTo(9,12);ctx.lineTo(23,27);ctx.lineTo(32,30);ctx.stroke();
    ctx.fillStyle='#f0b934';ctx.fillRect(-13,5,26,12);ctx.fillStyle='#e4edf6';ctx.beginPath();ctx.moveTo(-12,5);ctx.lineTo(-9,-13);ctx.lineTo(0,-20);ctx.lineTo(9,-13);ctx.lineTo(12,5);ctx.closePath();ctx.fill();
    ctx.fillStyle='#24435e';ctx.beginPath();ctx.arc(0,-8,5,Math.PI,0);ctx.fill();ctx.strokeStyle='#f7d47c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(0,-28);ctx.stroke();ctx.restore();
    // HUD values in the canvas for standalone play view.
    const speed=Math.hypot(lander.vx,lander.vy);
    ctx.fillStyle='#eaf5ff';ctx.font='bold 13px Arial';ctx.textAlign='left';ctx.fillText('FUEL '+Math.round(lander.fuel)+'%',18,24);ctx.fillStyle='#b8d2e8';ctx.font='11px Arial';ctx.fillText('TOTAL SPEED '+speed.toFixed(1)+' m/s',18,43);
    ctx.fillStyle='#c6d9eb';ctx.textAlign='right';ctx.fillText('A / D ROTATE  ·  W THRUST',W-18,24);
    if(lander.landed||lander.crashed){ctx.fillStyle=lander.landed?'rgba(5,55,42,.82)':'rgba(70,18,20,.82)';roundedRect(210,120,380,90,14,ctx.fillStyle,'rgba(255,255,255,.3)');ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 22px Arial';ctx.fillText(lander.landed?'TOUCHDOWN SUCCESS!':'MISSION FAILED',400,158);ctx.font='13px Arial';ctx.fillText(lander.landed?'Tranquility Base reached · Mission complete':'Press RESET to attempt another landing',400,184)}
  }
  function draw(){if(game==='rover')drawRover();else drawLander()}
  function update(dt){
    if(game==='rover'){
      if(keys.ArrowLeft)rover.a-=2.8*dt;if(keys.ArrowRight)rover.a+=2.8*dt;
      if(keys.ArrowUp)rover.speed=Math.min(115,rover.speed+90*dt);else if(keys.ArrowDown)rover.speed=Math.max(-55,rover.speed-100*dt);else rover.speed*=Math.pow(.91,dt*60);
      rover.x+=Math.cos(rover.a)*rover.speed*dt;rover.y+=Math.sin(rover.a)*rover.speed*dt;rover.x=Math.max(18,Math.min(782,rover.x));rover.y=Math.max(45,Math.min(360,rover.y));
      rocks.forEach(o=>{if(Math.hypot(rover.x-o.x,rover.y-o.y)<o.r+15){rover.speed*=-.45;rover.x-=Math.cos(rover.a)*5;rover.y-=Math.sin(rover.a)*5}});
      samples=samples.filter(o=>{if(Math.hypot(rover.x-o.x,rover.y-o.y)<22){rover.score++;return false}return true});
      if(rover.score===5){message='Mission complete! All 5 science samples collected.';setStep(3)}status.textContent=message;
    }else if(!lander.landed&&!lander.crashed){
      if(keys.ArrowLeft)lander.a-=1.9*dt;if(keys.ArrowRight)lander.a+=1.9*dt;
      lander.a=Math.max(-.9,Math.min(.9,lander.a));
      if(keys.ArrowUp&&lander.fuel>0){lander.vx+=Math.sin(lander.a)*92*dt;lander.vy-=Math.cos(lander.a)*118*dt;lander.fuel=Math.max(0,lander.fuel-11*dt)}
      lander.vy+=34*dt; // lunar gravity
      lander.x+=lander.vx*dt;lander.y+=lander.vy*dt;
      lander.vx*=Math.pow(.999,dt*60);
      const ground=terrainY(lander.x)-27;
      if(lander.x<25||lander.x>775){lander.crashed=true;message='Mission failed: craft drifted beyond the landing area.'}
      if(lander.y>=ground){
        const safeX=Math.abs(lander.x-pad.x)<pad.w/2-10;
        const safeSpeed=Math.abs(lander.vy)<34&&Math.abs(lander.vx)<26;
        const upright=Math.abs(lander.a)<.24;
        if(safeX&&safeSpeed&&upright){lander.landed=true;message='Perfect touchdown! Tranquility Base reached. +100 mission points.';lander.score=100;setStep(3)}
        else{lander.crashed=true;message='Hard landing. Keep vertical speed below 34, horizontal speed below 26, and align upright on the pad.'}
      }
      if(lander.y<30){lander.y=30;lander.vy=Math.max(0,lander.vy)}
      if(lander.fuel<=0&&lander.y<ground-10){message='Fuel depleted! Use RESET to try again.'}
      status.textContent=message;
      if(fuelEl)fuelEl.textContent=Math.round(lander.fuel)+'%';
      if(altEl)altEl.textContent=Math.max(0,Math.round(ground-lander.y))+' m';
      if(speedEl)speedEl.textContent=Math.abs(lander.vy).toFixed(1)+' m/s';
      if(angleEl)angleEl.textContent=(lander.a*180/Math.PI).toFixed(0)+'°';
    }else status.textContent=message;
  }
  function frame(t){if(!running)return;const dt=Math.min(.032,(t-last)/1000||.016);last=t;update(dt);draw();raf=requestAnimationFrame(frame)}
  function start(which){
    game=which;area.hidden=false;root.querySelector('.ba-arcade-cards').style.display='none';setStep(2);
    title.textContent=which==='rover'?'Mars Rover: Sample Run':'Lunar Lander: Safe Touchdown';kicker.textContent=which==='rover'?'MARS SURFACE MISSION':'APOLLO LUNAR LANDING';
    instructions.textContent=which==='rover'?'Use ← and → to steer, ↑ to drive and ↓ to reverse. Collect all 5 blue samples.':'A / D or ← / → to rotate. Hold W or ↑ to thrust. Land upright on the glowing pad with low speed.';
    controls.querySelector('[data-key="ArrowDown"]').style.display=which==='rover'?'inline-flex':'none';
    controls.querySelector('[data-key="ArrowUp"]').textContent=which==='rover'?'▲ DRIVE':'▲ THRUST';controls.querySelector('[data-key="ArrowLeft"]').textContent=which==='rover'?'◀ TURN LEFT':'◀ ROTATE LEFT';controls.querySelector('[data-key="ArrowRight"]').textContent=which==='rover'?'TURN RIGHT ▶':'ROTATE RIGHT ▶';
    if(hud)hud.hidden=which!=='lander';reset();running=true;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);area.scrollIntoView({behavior:'smooth',block:'center'});
  }
  root.querySelectorAll('[data-open-game]').forEach(b=>b.addEventListener('click',()=>{setStep(1);start(b.dataset.openGame)}));
  document.getElementById('baGameClose').addEventListener('click',()=>{running=false;cancelAnimationFrame(raf);keys={};area.hidden=true;root.querySelector('.ba-arcade-cards').style.display='grid';setStep(1);});
  document.getElementById('baGameReset').addEventListener('click',()=>{reset();setStep(3)});
  document.addEventListener('keydown',e=>{if(!area.hidden&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','A','d','D','w','W'].includes(e.key)){e.preventDefault();keys[({a:'ArrowLeft',A:'ArrowLeft',d:'ArrowRight',D:'ArrowRight',w:'ArrowUp',W:'ArrowUp'})[e.key]||e.key]=true}});
  document.addEventListener('keyup',e=>{const k=({a:'ArrowLeft',A:'ArrowLeft',d:'ArrowRight',D:'ArrowRight',w:'ArrowUp',W:'ArrowUp'})[e.key]||e.key;keys[k]=false});
  controls.querySelectorAll('[data-key]').forEach(b=>{const key=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true;b.setPointerCapture(e.pointerId)});['pointerup','pointercancel','lostpointercapture','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>{keys[key]=false}))});
  resetRover();draw();
})();

