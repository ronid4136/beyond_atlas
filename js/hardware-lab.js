/**
 * Beyond Atlas - Hardware Exploration Lab & 3D Model Inspector
 * NASA Space Apps Challenge
 */

/* ==========================================================================
   Part #3: script-3
   ========================================================================== */
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.atlas-world-model model-viewer').forEach(v=>v.addEventListener('load',()=>{const p=v.parentElement.querySelector('.atlas-model-loading');if(p)p.style.display='none';}));});

/* ==========================================================================
   Part #9: beyond-atlas-hardware-parts-interaction
   ========================================================================== */
(function(){
 const partSets={
  perseverance:[['Mast cameras','The camera mast provides wide views of the terrain and detailed images of rocks.'],['UHF antenna','The communications system relays data between the rover and orbiters around Mars.'],['Robotic arm','The arm positions scientific tools close to rocks and soil for inspection.'],['Drill & coring bit','The drill collects rock cores that can be sealed for possible future return.'],['Six wheels','The rocker-bogie mobility system helps the rover cross uneven Martian terrain.'],['RTG power unit','A radioisotope power system supplies electricity and heat during the mission.']],
  curiosity:[['Mast cameras','Mast cameras capture colour panoramas and help inspect distant targets.'],['ChemCam','A laser instrument studies the composition of rocks from a distance.'],['Robotic arm','The arm places instruments against rocks and soil.'],['Drill','The drill gathers powdered rock samples for onboard analysis.'],['Wheels & suspension','The six-wheel rocker-bogie system helps the rover climb over rough ground.']],
  apollo:[['Descent stage','The lower stage carried landing legs, descent engine and surface equipment.'],['Ascent stage','The upper cabin lifted the astronauts from the lunar surface.'],['Landing radar','Radar measured altitude and descent speed during landing.'],['Descent engine','A throttleable engine slowed the spacecraft for a controlled landing.']],
  insight:[['Seismometer','SEIS measured marsquakes and internal vibrations of Mars.'],['Heat-flow probe','The HP3 instrument was designed to measure heat moving through the Martian soil.'],['Robotic arm','The arm deployed instruments onto the surface.'],['Solar arrays','Solar panels supplied electrical power to the lander.']]
 };
 function selectParts(){const title=(document.getElementById('mTitle')?.textContent||'').toLowerCase();if(title.includes('perseverance'))return partSets.perseverance;if(title.includes('curiosity'))return partSets.curiosity;if(title.includes('apollo')||title.includes('lunar module'))return partSets.apollo;if(title.includes('insight'))return partSets.insight;return [['Science instruments','Scientific instruments collect measurements about the environment.'],['Communications system','Antennas send mission data to Earth through relay networks.'],['Power system','The power unit supplies electricity to operate the hardware.'],['Mobility / structure','The main structure supports the equipment and mission operations.']];}
 function renderParts(){const host=document.getElementById('hardwarePartPoints');if(!host)return;const desc=document.getElementById('hardwarePartDescription');if(desc)desc.remove();const parts=selectParts();host.innerHTML=parts.map((p,i)=>`<button class="hardware-part-point" type="button" data-part="${i}">${p[0]}</button>`).join('');const box=document.getElementById('hardwareKeyParts');let d=document.createElement('p');d.id='hardwarePartDescription';d.className='hardware-part-description';d.textContent='Select a component name to see what it does.';box.appendChild(d);host.querySelectorAll('button').forEach((b)=>b.addEventListener('click',()=>{host.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');d.textContent=parts[Number(b.dataset.part)][1];}));}
 const oldOpen=window.openModal;if(oldOpen)window.openModal=async function(id){const r=await oldOpen(id);renderParts();return r;};
 document.addEventListener('DOMContentLoaded',renderParts);
})();

/* ==========================================================================
   Part #10: script-10
   ========================================================================== */
(function(){
 const hardware={
  mars:{caption:'PERSEVERANCE · MARS SURFACE',icon:'🚙',steps:[
   ['Wheels & Mobility System','Six aluminium wheels help Perseverance travel across rough Martian terrain. Its rocker-bogie suspension helps keep the rover stable while crossing rocks.'],
   ['Mastcam-Z Cameras','The camera pair sits high on the mast. It captures detailed colour and 3D images to help scientists study the landscape and plan routes.'],
   ['SuperCam Instrument','Mounted near the top of the mast, SuperCam studies rocks from a distance using a laser, camera and spectrometers.'],
   ['Robotic Arm','The arm positions scientific tools against selected rocks. It can examine surface texture and composition before sample collection.'],
   ['Sample Caching System','A drill and sample-handling hardware collect rock cores, seal them in tubes and prepare them for a possible future return mission.'],
   ['Power System','A radioisotope power system supplies electricity and heat, helping the rover operate through cold Martian nights and dusty conditions.'],
   ['High-Gain Antenna','The steerable high-gain antenna sends data directly to Earth and receives commands from mission controllers.'],
   ['UHF Relay Antenna','This antenna relays data through orbiting Mars spacecraft, helping move large science files back to Earth.'],
   ['MEDA Weather Sensors','The environmental sensor suite measures wind, temperature, pressure, dust and other Martian weather conditions.'],
   ['MOXIE Experiment','The Mars Oxygen In-Situ Resource Utilization Experiment tested a way to produce oxygen from carbon dioxide in the Martian atmosphere.'],
   ['Planetary Instrument for X-ray Lithochemistry (PIXL)','PIXL uses X-ray analysis to identify chemical elements in rocks and help assess their history.'],
   ['SHERLOC Instrument','SHERLOC uses a laser, camera and spectrometers to search for organic compounds and map minerals.'],
   ['Navigation Cameras','Hazard-avoidance and navigation cameras help the rover detect obstacles, plan routes and move safely.']
  ]},
  moon:{caption:'APOLLO · LUNAR SURFACE',icon:'🌕',steps:[
   ['Descent Stage','The lower stage carried landing engines, landing legs and equipment. It remained on the Moon after the astronauts departed.'],
   ['Descent Engine','The throttleable engine slowed the Lunar Module for a controlled landing on the lunar surface.'],
   ['Ascent Stage','The upper crew cabin lifted the astronauts off the Moon and rendezvoused with the Command and Service Module in lunar orbit.'],
   ['Landing Legs & Footpads','Four landing legs absorbed landing forces and helped support the Lunar Module on uneven lunar terrain.'],
   ['Scientific Equipment','Apollo crews deployed experiments and instruments on the lunar surface to study the Moon’s environment and interior.'],
   ['Docking System','The docking mechanism connected the Lunar Module with the Command Module so the crew could transfer back after surface operations.'],
   ['Rendezvous Radar','The radar helped the ascent stage determine its position and range relative to the Command and Service Module in lunar orbit.'],
   ['Reaction Control Thrusters','Small thrusters controlled the Lunar Module attitude and orientation during flight and docking manoeuvres.'],
   ['Guidance Computer','The Apollo Guidance Computer supported navigation, guidance and control during descent, ascent and rendezvous.'],
   ['EVA Hatch & Life Support','The cabin hatch supported crew access, while the environmental control system maintained a breathable cabin atmosphere.'],
   ['Descent Propellant Tanks','The tanks stored propellants for the descent engine that slowed the spacecraft before touchdown.'],
   ['Ascent Propulsion System','The ascent engine lifted the crew cabin from the lunar surface to rejoin the orbiting spacecraft.'],
   ['ALSEP Experiments','Apollo Lunar Surface Experiments Package instruments gathered long-term scientific measurements on the Moon.']
  ]}
 };
 let planet='mars',index=0;
 const $=id=>document.getElementById(id);
 function render(){const data=hardware[planet],item=data.steps[index];$('stepPartTitle').textContent=item[0];$('stepPartDescription').textContent=item[1];$('stepProgressLabel').textContent=`STEP ${index+1} OF ${data.steps.length}`;$('stepProgressTrack').firstElementChild.style.width=((index+1)/data.steps.length*100)+'%';$('stepVisualIcon')&&($('stepVisualIcon').textContent=data.icon);$('stepVisualCaption').textContent=data.caption;$('stepLabVisual').className='step-lab-visual '+(planet==='mars'?'mars-lab-visual':'moon-lab-visual');$('stepMars3D').title=planet==='mars'?'NASA Perseverance rover on Mars':'NASA Mars rover 3D viewer hidden';$('stepMoon3D').setAttribute('aria-label',planet==='moon'?'Interactive NASA Apollo Lunar Module on the Moon':'NASA Apollo Lunar Module 3D viewer hidden');const selected=$('stepSelectedPartName');if(selected)selected.textContent=item[0];const selectedNo=$('stepSelectedPartNumber');if(selectedNo)selectedNo.textContent=String(index+1).padStart(2,'0');const selectedBox=$('stepSelectedPart');if(selectedBox)selectedBox.setAttribute('data-planet',planet);$('stepPrev').disabled=index===0;$('stepNext').disabled=index===data.steps.length-1;$('stepNext').textContent=index===data.steps.length-1?'Completed ✓':'Next component →';$('stepLabDots').innerHTML='';data.steps.forEach((step,i)=>{const b=document.createElement('button');b.type='button';b.textContent=i+1;b.className=i===index?'active':'';b.setAttribute('aria-label','Show '+step[0]);b.title='Select '+step[0];b.addEventListener('click',()=>{index=i;render()});$('stepLabDots').appendChild(b)});}
 document.querySelectorAll('.step-planet-tab').forEach(btn=>btn.addEventListener('click',()=>{planet=btn.dataset.planet;index=0;document.querySelectorAll('.step-planet-tab').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});render()}));
 $('stepPrev').addEventListener('click',()=>{if(index>0){index--;render()}});$('stepNext').addEventListener('click',()=>{if(index<hardware[planet].steps.length-1){index++;render()}});render();
})();

/* ==========================================================================
   Part #11: script-11
   ========================================================================== */
// Keep an obvious fallback if an embedded NASA model is blocked by browser or network policy.
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.atlas-world-model model-viewer').forEach(v=>{
    const hide=()=>{const p=v.parentElement.querySelector('.atlas-model-loading');if(p)p.style.display='none';};
    v.addEventListener('load',hide);v.addEventListener('error',()=>{const p=v.parentElement.querySelector('.atlas-model-loading');if(p)p.textContent='3D model unavailable here — use NASA source link above.';});
    if(v.loaded)hide();
  });
});

/* ==========================================================================
   Part #15: ba-lab-modal-fixed-controller
   ========================================================================== */
(function () {
  function init() {
    const trigger = document.getElementById('baLabToggle');
    const panel = document.getElementById('baLabFullContent');
    if (!trigger || !panel || trigger.dataset.modalFixedReady === '1') return;

    trigger.dataset.modalFixedReady = '1';
    const originalParent = panel.parentNode;
    const originalNext = panel.nextSibling;
    panel.hidden = true;

    let backdrop = null;
    let isOpen = false;

    function closeModal() {
      if (!isOpen) return;
      isOpen = false;
      panel.classList.remove('ba-lab-modal-panel');
      panel.hidden = true;
      if (backdrop) {
        backdrop.remove();
        backdrop = null;
      }
      if (originalNext && originalNext.parentNode === originalParent) {
        originalParent.insertBefore(panel, originalNext);
      } else {
        originalParent.appendChild(panel);
      }
      document.body.classList.remove('ba-lab-modal-active');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function openModal() {
      if (isOpen) return;
      isOpen = true;
      backdrop = document.createElement('div');
      backdrop.id = 'baLabModalBackdrop';
      backdrop.addEventListener('click', closeModal);
      document.body.appendChild(backdrop);
      document.body.appendChild(panel);
      panel.hidden = false;
      panel.classList.add('ba-lab-modal-panel');
      document.body.classList.add('ba-lab-modal-active');
      trigger.setAttribute('aria-expanded', 'true');

      // Always create a visible close control in the top-right of the modal.
      let closeButton = panel.querySelector('#baLabVisibleCloseButton');
      if (!closeButton) {
        const topbar = document.createElement('div');
        topbar.className = 'ba-modal-topbar ba-modal-topbar-runtime';
        topbar.innerHTML = '<button type="button" id="baLabVisibleCloseButton" aria-label="Close and return to main interface" title="Back to main interface"><span aria-hidden="true">×</span><span>Back to Main Interface</span></button>';
        panel.insertBefore(topbar, panel.firstChild);
        closeButton = topbar.querySelector('#baLabVisibleCloseButton');
      }
      closeButton.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      };
    }

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (isOpen) closeModal();
      else openModal();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ==========================================================================
   Part #16: ba-deep-space-gallery-modal-controller
   ========================================================================== */
(function () {
  function initDeepSpaceGallery() {
    const section = document.getElementById('hardwareGallery');
    if (!section || section.dataset.deepSpaceReady === 'yes') return;
    section.dataset.deepSpaceReady = 'yes';

    const originalNodes = Array.from(section.childNodes);
    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'deep-space-gallery-launcher';
    launcher.textContent = 'Deep-Space Hardware Gallery';
    launcher.setAttribute('aria-expanded', 'false');
    section.insertBefore(launcher, section.firstChild);

    let backdrop = null;
    let modal = null;
    let opened = false;

    function closeGallery() {
      if (!opened) return;
      opened = false;
      originalNodes.forEach(node => section.appendChild(node));
      if (modal) modal.remove();
      if (backdrop) backdrop.remove();
      modal = null;
      backdrop = null;
      document.body.classList.remove('deep-space-gallery-modal-open');
      launcher.setAttribute('aria-expanded', 'false');
    }

    function openGallery() {
      if (opened) return;
      opened = true;
      backdrop = document.createElement('div');
      backdrop.id = 'deepSpaceGalleryBackdrop';
      backdrop.addEventListener('click', closeGallery);

      modal = document.createElement('div');
      modal.id = 'deepSpaceGalleryModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Deep-Space Hardware Gallery');

      const head = document.createElement('div');
      head.className = 'deep-space-gallery-modal-head';
      const title = document.createElement('strong');
      title.textContent = 'Deep-Space Hardware Gallery';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'deep-space-gallery-close';
      close.setAttribute('aria-label', 'Close gallery');
      close.innerHTML = '&times;';
      close.addEventListener('click', closeGallery);
      head.append(title, close);
      modal.appendChild(head);

      originalNodes.forEach(node => {
        if (node !== launcher) modal.appendChild(node);
      });
      document.body.append(backdrop, modal);
      document.body.classList.add('deep-space-gallery-modal-open');
      launcher.setAttribute('aria-expanded', 'true');
    }

    launcher.addEventListener('click', openGallery);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeGallery();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeepSpaceGallery);
  } else {
    initDeepSpaceGallery();
  }
})();

