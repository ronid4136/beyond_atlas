/**
 * Beyond Atlas - Realistic 3D Planet Engine (Mars, Moon, Earth)
 * Interactive 3D World Stage with Real Mission Landing Sites & Touchpoints
 * NASA Space Apps Challenge
 */

(function () {
  'use strict';

  let renderer, scene, camera, planetMesh, atmoMesh, orbitRingMesh, host, canvas;
  let markersGroup = null, markerMeshes = [];
  let isDragging = false, lastPointerX = 0, lastPointerY = 0;
  let pointerDownPos = { x: 0, y: 0 }, pointerDownTime = 0;
  let targetRotX = 0.08, targetRotY = 0.4, currentRotX = 0.08, currentRotY = 0.4;
  let velX = 0, velY = 0;
  let zoom = 4.2, targetZoom = 4.2;
  let autoRotate = true;
  let currentPlanetKey = 'mars';
  let isInitialized = false;

  const planetConfigs = {
    mars: {
      name: 'MARS',
      title: 'MARS · 3D EXPLORATION',
      kicker: 'NASA-INSPIRED 3D WORLDS',
      cardTitle: 'Explore <span class="orange">Mars</span> in 3D',
      cardDesc: 'Get a closer look at the Red Planet. Rotate, zoom and explore its surface, craters, and historic NASA mission landing sites in high-resolution interactive 3D.',
      tilt: 0.44, // 25.2° axial tilt
      atmoColor: 0xff6b35,
      atmoOpacity: 0.38,
      ringColor: 0xff7043,
      ringOpacity: 0.35,
      speed: 0.0028
    },
    moon: {
      name: 'MOON',
      title: 'MOON · 3D EXPLORATION',
      kicker: 'NASA-INSPIRED 3D WORLDS',
      cardTitle: 'Explore <span class="cyan">Moon</span> in 3D',
      cardDesc: 'Inspect Earth\'s celestial companion. Explore the lunar maria, impact basins, and historic Apollo landing regions in photorealistic 3D.',
      tilt: 0.12, // 6.7° tilt
      atmoColor: 0x94a3b8,
      atmoOpacity: 0.0,
      ringColor: 0xcfd8dc,
      ringOpacity: 0.28,
      speed: 0.0018
    },
    earth: {
      name: 'EARTH',
      title: 'EARTH · 3D EXPLORATION',
      kicker: 'NASA-INSPIRED 3D WORLDS',
      cardTitle: 'Explore <span class="cyan">Earth</span> in 3D',
      cardDesc: 'Observe our living blue marble with oceans, continental landmasses, spaceports, and mission control centers in real-time 3D.',
      tilt: 0.41, // 23.4° axial tilt
      atmoColor: 0x00a8ff,
      atmoOpacity: 0.65,
      ringColor: 0x38bdf8,
      ringOpacity: 0.42,
      speed: 0.0024
    }
  };

  // Historic Landing Sites and Mission Touchpoints (Where missions went)
  const planetLocations = {
    mars: [
      {
        id: 'jezero',
        name: 'Jezero Crater · Perseverance Rover',
        badge: '🚀 NASA ACTIVE ROVER MISSION',
        coords: '18.38° N, 77.58° E · Jezero Crater',
        lat: 18.38,
        lon: 77.58,
        color: 0x38bdf8,
        desc: 'Touchdown site of NASA\'s Perseverance rover and Ingenuity helicopter (Feb 18, 2021). Exploring a 3.7-billion-year-old river delta to collect rock cores and search for ancient microbial biosignatures.',
        meta: [
          { label: 'Hardware', val: 'Perseverance + Ingenuity' },
          { label: 'Year', val: '2021 – Active' },
          { label: 'Mission Goal', val: 'Astrobiology & Sample Return' }
        ]
      },
      {
        id: 'gale',
        name: 'Gale Crater · Curiosity Rover',
        badge: '🚙 NASA MARS SCIENCE LAB',
        coords: '4.59° S, 137.44° E · Aeolis Palus',
        lat: -4.59,
        lon: 137.44,
        color: 0xffa726,
        desc: 'Landing site of NASA\'s Curiosity rover (Aug 6, 2012). Investigated ancient stream beds and confirmed that Mars once supported life-friendly chemical ingredients and drinkable liquid water.',
        meta: [
          { label: 'Hardware', val: 'Curiosity Rover (MSL)' },
          { label: 'Year', val: '2012 – Active' },
          { label: 'Distance Driven', val: '31+ Kilometers' }
        ]
      },
      {
        id: 'olympus',
        name: 'Olympus Mons · Solar System Wonder',
        badge: '🌋 TALLEST VOLCANO IN SOLAR SYSTEM',
        coords: '18.65° N, 226.2° E (133.8° W) · Tharsis Rise',
        lat: 18.65,
        lon: -133.8,
        color: 0xf43f5e,
        desc: 'A colossal shield volcano rising 21.9 km (72,000 ft) high—over 2.5 times the elevation of Mount Everest. Its caldera spans 85 km across, large enough to engulf entire cities.',
        meta: [
          { label: 'Elevation', val: '21.9 km (13.6 miles)' },
          { label: 'Diameter', val: '624 km across' },
          { label: 'Classification', val: 'Shield Volcano' }
        ]
      },
      {
        id: 'viking1',
        name: 'Chryse Planitia · Viking 1 Lander',
        badge: '🛰️ FIRST SUCCESSFUL MARS LANDER',
        coords: '22.27° N, 47.95° W · Plain of Gold',
        lat: 22.27,
        lon: -47.95,
        color: 0x34d399,
        desc: 'Touchdown site of NASA\'s historic Viking 1 Lander (July 20, 1976). First spacecraft to operate on the Martian surface, transmitting the first iconic color panoramas of Mars back to Earth.',
        meta: [
          { label: 'Hardware', val: 'Viking 1 Lander' },
          { label: 'Landing Date', val: 'July 20, 1976' },
          { label: 'Significance', val: 'First Surface Operations' }
        ]
      }
    ],
    moon: [
      {
        id: 'apollo11',
        name: 'Mare Tranquillitatis · Apollo 11',
        badge: '🌕 FIRST HUMAN MOON LANDING',
        coords: '0.67° N, 23.47° E · Sea of Tranquility',
        lat: 0.67,
        lon: 23.47,
        color: 0x38bdf8,
        desc: 'Touchdown site of the Apollo 11 Lunar Module "Eagle" on July 20, 1969. Neil Armstrong and Buzz Aldrin stepped onto the lunar surface, leaving behind the descent stage and seismic experiments.',
        meta: [
          { label: 'Astronauts', val: 'Armstrong & Aldrin' },
          { label: 'Touchdown', val: 'July 20, 1969' },
          { label: 'Left Behind', val: 'LM Descent Stage & LRRR' }
        ]
      },
      {
        id: 'apollo12',
        name: 'Oceanus Procellarum · Apollo 12 & Surveyor 3',
        badge: '🦅 PRECISION ROBOTIC RENDEZVOUS',
        coords: '3.01° S, 23.42° W · Ocean of Storms',
        lat: -3.01,
        lon: -23.42,
        color: 0xfacc15,
        desc: 'Apollo 12 pinpoint touchdown just 160 meters from the robotic Surveyor 3 lander (Nov 19, 1969). Astronauts Pete Conrad and Alan Bean retrieved parts from Surveyor 3 to evaluate long-term space exposure.',
        meta: [
          { label: 'Astronauts', val: 'Conrad & Bean' },
          { label: 'Target', val: 'Surveyor 3 Robot Lander' },
          { label: 'Samples Returned', val: '34.3 kg lunar rocks' }
        ]
      },
      {
        id: 'apollo14',
        name: 'Fra Mauro · Apollo 14 Highlands',
        badge: '⛳ FRA MAURO HIGHLANDS EXPEDITION',
        coords: '3.64° S, 17.47° W · Fra Mauro Crater',
        lat: -3.64,
        lon: -17.47,
        color: 0x34d399,
        desc: 'Exploration of ancient Imbrium Basin impact material (Feb 5, 1971). Commander Alan Shepard famously hit two golf balls on the lunar surface with a makeshift six-iron club.',
        meta: [
          { label: 'Astronauts', val: 'Shepard & Mitchell' },
          { label: 'EVA Duration', val: '9 hours 22 minutes' },
          { label: 'Left Behind', val: 'ALSEP Science Station' }
        ]
      },
      {
        id: 'apollo17',
        name: 'Taurus-Littrow · Apollo 17',
        badge: '🚀 FINAL HUMAN APOLLO EXPEDITION',
        coords: '20.19° N, 30.77° E · Valley of Taurus-Littrow',
        lat: 20.19,
        lon: 30.77,
        color: 0xf43f5e,
        desc: 'Final human mission to the Moon (Dec 11, 1972). Gene Cernan and geologist Harrison Schmitt spent over 75 hours on the surface, driving the Lunar Rover 35.7 km and discovering orange volcanic glass beads.',
        meta: [
          { label: 'Astronauts', val: 'Cernan & Schmitt' },
          { label: 'Rover Driven', val: '35.7 km across valley' },
          { label: 'Left Behind', val: 'Challenger LM & Lunar Rover' }
        ]
      }
    ],
    earth: [
      {
        id: 'ksc',
        name: 'Kennedy Space Center · Cape Canaveral',
        badge: '🚀 PREMIER HUMAN SPACEPORT',
        coords: '28.57° N, 80.65° W · Florida, USA',
        lat: 28.57,
        lon: -80.65,
        color: 0x38bdf8,
        desc: 'NASA\'s primary launch center for human spaceflight. Launched all Apollo Saturn V Moon missions, 135 Space Shuttle flights, and the modern Artemis lunar program.',
        meta: [
          { label: 'Facility', val: 'Launch Complex 39A/B' },
          { label: 'Famous Rocket', val: 'Saturn V / SLS' },
          { label: 'Status', val: 'Active Spaceport' }
        ]
      },
      {
        id: 'baikonur',
        name: 'Baikonur Cosmodrome · Kazakhstan',
        badge: '🌌 WORLD\'S FIRST OPERATIONAL SPACEPORT',
        coords: '45.96° N, 63.30° E · Steppes of Kazakhstan',
        lat: 45.96,
        lon: 63.30,
        color: 0xfacc15,
        desc: 'The world\'s first and largest operational space launch facility. Launched Sputnik 1 (1957, first artificial satellite) and Vostok 1 carrying Yuri Gagarin (1961, first human in space).',
        meta: [
          { label: 'Historical Milestones', val: 'Sputnik 1 & Yuri Gagarin' },
          { label: 'Founded', val: 'June 2, 1955' },
          { label: 'Status', val: 'Active Orbital Launches' }
        ]
      },
      {
        id: 'jpl',
        name: 'NASA Jet Propulsion Laboratory (JPL)',
        badge: '🛰️ ROBOTIC PLANETARY EXPLORATION',
        coords: '34.20° N, 118.17° W · Pasadena, California',
        lat: 34.20,
        lon: -118.17,
        color: 0x34d399,
        desc: 'NASA\'s premier center for robotic deep-space mission design, construction, and operations. Built and directs Curiosity, Perseverance, Voyager 1 & 2, and the Mars 2020 mission.',
        meta: [
          { label: 'Control Center', val: 'Space Flight Operations' },
          { label: 'Notable Missions', val: 'Perseverance, Curiosity, Voyager' },
          { label: 'Status', val: 'Active Mission Command' }
        ]
      }
    ]
  };

  let planetMaterials = {};

  function initTexturesAndMaterials() {
    if (!window.THREE) return false;

    const loader = new THREE.TextureLoader();

    const loadTex = (url) => {
      const tex = loader.load(
        url,
        () => {
          if (renderer && scene && camera) renderer.render(scene, camera);
        },
        undefined,
        (err) => {
          console.warn('Could not load planet texture:', url, err);
        }
      );
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      return tex;
    };

    const marsTex = loadTex('assets/images/mars_texture.jpg');
    const marsBumpTex = loadTex('assets/images/mars_bump.jpg');
    const moonTex = loadTex('assets/images/moon_texture.jpg');
    const earthTex = loadTex('assets/images/earth_texture.jpg');

    planetMaterials = {
      mars: new THREE.MeshStandardMaterial({
        map: marsTex,
        bumpMap: marsBumpTex,
        bumpScale: 0.045,
        roughness: 0.78,
        metalness: 0.04,
        color: 0xffffff
      }),
      moon: new THREE.MeshStandardMaterial({
        map: moonTex,
        bumpMap: moonTex,
        bumpScale: 0.065,
        roughness: 0.92,
        metalness: 0.02,
        color: 0xf0f0f0
      }),
      earth: new THREE.MeshStandardMaterial({
        map: earthTex,
        roughness: 0.48,
        metalness: 0.08,
        color: 0xffffff
      })
    };

    return true;
  }

  // 3D Location Markers builder (Attached to planetMesh so they rotate in 3D)
  function buildLocationMarkers(planetKey) {
    if (!planetMesh) return;

    if (markersGroup) {
      planetMesh.remove(markersGroup);
      markersGroup = null;
      markerMeshes = [];
    }

    markersGroup = new THREE.Group();
    planetMesh.add(markersGroup);

    const locs = planetLocations[planetKey] || [];
    const radius = 1.155; // Sit slightly on the surface of 1.15 sphere

    locs.forEach((loc) => {
      const phi = (90 - loc.lat) * (Math.PI / 180);
      const theta = (loc.lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));

      const pinGroup = new THREE.Group();
      pinGroup.position.set(x, y, z);
      pinGroup.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x, y, z).normalize()
      );

      // Glowing Pin Head Sphere
      const pinGeo = new THREE.SphereGeometry(0.042, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: loc.color || 0x00d4ff
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.y = 0.048;
      pinGroup.add(pinMesh);

      // Pin Needle
      const stemGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.06, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = 0.02;
      pinGroup.add(stemMesh);

      // Surface Pulsing Ring Beacon
      const ringGeo = new THREE.RingGeometry(0.045, 0.075, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: loc.color || 0x00d4ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      pinGroup.add(ringMesh);

      // User data for raycast click
      pinMesh.userData = { isMarker: true, locData: loc, pinGroup: pinGroup };
      ringMesh.userData = { isMarker: true, locData: loc, pinGroup: pinGroup };
      pinGroup.userData = { isMarker: true, locData: loc };

      markersGroup.add(pinGroup);
      markerMeshes.push(pinMesh, ringMesh);
    });

    renderLocationChips(planetKey);
  }

  // Render location filter chips below the 3D globe
  function renderLocationChips(planetKey) {
    const container = document.getElementById('stageLocationChips');
    if (!container) return;

    container.innerHTML = '';
    const locs = planetLocations[planetKey] || [];

    locs.forEach((loc, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'stage-location-chip' + (idx === 0 ? ' active' : '');
      chip.setAttribute('data-loc-id', loc.id);
      chip.innerHTML = `<span>📍</span> ${loc.name.split('·')[0].trim()}`;
      chip.onclick = () => {
        focusOnLocation(loc);
      };
      container.appendChild(chip);
    });

    if (locs.length > 0) {
      showLocationPopup(locs[0]);
    }
  }

  // Smoothly rotate the planet to face the clicked location and show its info
  function focusOnLocation(loc) {
    if (!loc) return;

    // Convert lat/lon to target Euler rotation
    const targetY = -(loc.lon * (Math.PI / 180)) - Math.PI / 2;
    const targetX = (loc.lat * (Math.PI / 180));

    targetRotY = targetY;
    targetRotX = Math.max(-0.8, Math.min(0.8, targetX));
    targetZoom = 3.65; // Subtle zoom in

    document.querySelectorAll('.stage-location-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-loc-id') === loc.id);
    });

    showLocationPopup(loc);
  }

  // Display the location details popup card inside the stage
  function showLocationPopup(loc) {
    const popup = document.getElementById('stageLocationPopup');
    if (!popup) return;

    const badge = document.getElementById('popupBadge');
    const title = document.getElementById('popupTitle');
    const coords = document.getElementById('popupCoords');
    const desc = document.getElementById('popupDesc');
    const meta = document.getElementById('popupMeta');

    if (badge) badge.innerHTML = loc.badge || '📍 MISSION LANDING SITE';
    if (title) title.innerText = loc.name;
    if (coords) coords.innerText = loc.coords;
    if (desc) desc.innerText = loc.desc;

    if (meta && loc.meta) {
      meta.innerHTML = loc.meta
        .map(m => `<span class="popup-meta-item"><b>${m.label}:</b> ${m.val}</span>`)
        .join('');
    }

    popup.style.display = 'block';
  }

  window.closeStageLocationPopup = function () {
    const popup = document.getElementById('stageLocationPopup');
    if (popup) popup.style.display = 'none';
  };

  function applyPlanet(key) {
    const cfg = planetConfigs[key] || planetConfigs.mars;
    currentPlanetKey = key;

    // Update Header labels
    const titleEl = document.getElementById('heroStageTitle');
    const kickerEl = document.getElementById('heroStageKicker');
    if (titleEl) titleEl.innerText = cfg.title;
    if (kickerEl) kickerEl.innerText = cfg.kicker;

    // Update Card Heading & Description to match the active planet
    const cardHeadingEl = document.getElementById('marsSpotlightHeading');
    const cardDescEl = document.querySelector('.spotlight-desc');
    const actionBtnEl = document.getElementById('spotlightActionBtn');
    if (cardHeadingEl && cfg.cardTitle) cardHeadingEl.innerHTML = cfg.cardTitle;
    if (cardDescEl && cfg.cardDesc) cardDescEl.innerText = cfg.cardDesc;
    if (actionBtnEl) {
      if (key === 'mars') {
        actionBtnEl.innerHTML = 'Explore Mars →';
        actionBtnEl.href = 'explore.html#mars';
      } else if (key === 'moon') {
        actionBtnEl.innerHTML = 'Explore Moon →';
        actionBtnEl.href = 'explore.html#moon';
      } else {
        actionBtnEl.innerHTML = 'Explore Earth Orbit →';
        actionBtnEl.href = 'explore.html';
      }
    }

    // Update active tab buttons
    document.querySelectorAll('.planet-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.planet === key);
    });

    if (!planetMesh) return;

    if (planetMaterials[key]) {
      planetMesh.material = planetMaterials[key];
    }
    planetMesh.rotation.z = cfg.tilt;

    if (atmoMesh) {
      atmoMesh.material.color.set(cfg.atmoColor);
      atmoMesh.material.opacity = cfg.atmoOpacity;
      atmoMesh.visible = cfg.atmoOpacity > 0;
    }

    if (orbitRingMesh) {
      orbitRingMesh.material.color.set(cfg.ringColor);
      orbitRingMesh.material.opacity = cfg.ringOpacity;
    }

    // Build the 3D location pins for this planet
    buildLocationMarkers(key);

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function initAtlasWorlds() {
    if (isInitialized) return;

    canvas = document.getElementById('heroPlanetCanvas');
    if (!canvas) return;
    host = canvas.parentElement;
    if (!host) return;

    if (!window.THREE) {
      setTimeout(initAtlasWorlds, 50);
      return;
    }

    const width = Math.max(260, host.clientWidth || 360);
    const height = Math.max(240, host.clientHeight || 280);

    try {
      if (!initTexturesAndMaterials()) return;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      camera.position.set(0, 0, zoom);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      if ('outputColorSpace' in renderer) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      } else if ('outputEncoding' in renderer) {
        renderer.outputEncoding = THREE.sRGBEncoding;
      }

      // Space Lighting
      const ambientLight = new THREE.AmbientLight(0x1a2638, 0.58);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfff8ee, 2.1);
      sunLight.position.set(-5.5, 2.5, 4.8);
      scene.add(sunLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
      rimLight.position.set(4.8, -2.2, -3.8);
      scene.add(rimLight);

      // Planet Sphere Geometry
      const geometry = new THREE.SphereGeometry(1.15, 96, 96);
      planetMesh = new THREE.Mesh(geometry, planetMaterials.mars);
      planetMesh.rotation.z = planetConfigs.mars.tilt;
      scene.add(planetMesh);

      // Atmospheric Outer Shell
      atmoMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.18, 64, 64),
        new THREE.MeshBasicMaterial({
          color: planetConfigs.mars.atmoColor,
          transparent: true,
          opacity: planetConfigs.mars.atmoOpacity,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending
        })
      );
      scene.add(atmoMesh);

      // Planetary Orbit Rings
      const ringPts = [];
      const rx = 2.05, ry = 1.1;
      for (let i = 0; i <= 240; i++) {
        const a = (i / 240) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, -0.05));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
      orbitRingMesh = new THREE.LineLoop(
        ringGeo,
        new THREE.LineBasicMaterial({
          color: planetConfigs.mars.ringColor,
          transparent: true,
          opacity: planetConfigs.mars.ringOpacity,
          linewidth: 1
        })
      );
      orbitRingMesh.rotation.z = -0.35;
      scene.add(orbitRingMesh);

      // Subtle Space Starfield in 3D Card
      const starPositions = [];
      for (let i = 0; i < 480; i++) {
        starPositions.push(
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 12,
          -2.5 - Math.random() * 8
        );
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: 0.022,
        transparent: true,
        opacity: 0.75
      });
      scene.add(new THREE.Points(starGeo, starMat));

      // Handle Resize smoothly
      const handleResize = () => {
        if (!renderer || !host) return;
        const w = host.clientWidth || 360;
        const h = host.clientHeight || 280;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };

      if (window.ResizeObserver) {
        new ResizeObserver(handleResize).observe(host);
      }
      window.addEventListener('resize', handleResize);

      // Drag to rotate with smooth inertia
      canvas.style.touchAction = 'none';
      canvas.style.cursor = 'grab';

      canvas.addEventListener('pointerdown', (e) => {
        isDragging = true;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        pointerDownPos = { x: e.clientX, y: e.clientY };
        pointerDownTime = Date.now();
        velX = 0;
        velY = 0;
        canvas.style.cursor = 'grabbing';
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      });

      canvas.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;

        velX = dy * 0.007;
        velY = dx * 0.007;

        targetRotY += velY;
        targetRotX = Math.max(-1.1, Math.min(1.1, targetRotX + velX));
      });

      const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        canvas.style.cursor = 'grab';
        try {
          if (e && e.pointerId) canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}

        // Raycast click detection on marker pins if pointer barely moved
        const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
        const duration = Date.now() - pointerDownTime;
        if (dist < 6 && duration < 380 && markerMeshes.length > 0) {
          const rect = canvas.getBoundingClientRect();
          const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
          );
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(markerMeshes, true);
          if (intersects.length > 0) {
            const hit = intersects[0].object;
            const locData = (hit.userData && hit.userData.locData) || (hit.parent && hit.parent.userData && hit.parent.userData.locData);
            if (locData) {
              focusOnLocation(locData);
            }
          }
        }
      };

      canvas.addEventListener('pointerup', stopDrag);
      canvas.addEventListener('pointercancel', stopDrag);
      canvas.addEventListener('lostpointercapture', stopDrag);

      // Zoom via wheel
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        targetZoom = Math.max(2.6, Math.min(6.5, targetZoom + e.deltaY * 0.0035));
      }, { passive: false });

      // Apply initial planet (Mars) & build location pins
      applyPlanet('mars');

      // Global control functions
      window.__baHeroControls = {
        toggleRotation: function () {
          autoRotate = !autoRotate;
          return autoRotate;
        },
        zoomIn: function () {
          targetZoom = Math.max(2.6, targetZoom - 0.45);
        },
        zoomOut: function () {
          targetZoom = Math.min(6.5, targetZoom + 0.45);
        },
        reset: function () {
          targetRotX = 0.08;
          targetRotY = 0.4;
          targetZoom = 4.2;
          autoRotate = true;
          const locs = planetLocations[currentPlanetKey] || [];
          if (locs.length > 0) focusOnLocation(locs[0]);
        },
        setPlanet: function (key) {
          applyPlanet(key);
        }
      };

      window.switchHeroPlanet = function (key) {
        applyPlanet(key);
      };

      // 60 FPS Animation loop with silky damping
      function animate() {
        requestAnimationFrame(animate);
        if (planetMesh && !document.hidden) {
          currentRotX += (targetRotX - currentRotX) * 0.08;
          currentRotY += (targetRotY - currentRotY) * 0.08;
          zoom += (targetZoom - zoom) * 0.08;

          camera.position.z = zoom;
          planetMesh.rotation.x = currentRotX;
          planetMesh.rotation.y = currentRotY;

          if (autoRotate && !isDragging) {
            const speed = (planetConfigs[currentPlanetKey] && planetConfigs[currentPlanetKey].speed) || 0.0028;
            targetRotY += speed;
          }

          if (orbitRingMesh) {
            orbitRingMesh.rotation.z += 0.0005;
          }

          // Gentle pulsing animation on surface marker rings
          if (markersGroup) {
            const pulse = 1.0 + Math.sin(Date.now() * 0.006) * 0.22;
            markersGroup.children.forEach(pin => {
              if (pin.children[2]) {
                pin.children[2].scale.set(pulse, pulse, pulse);
              }
            });
          }

          renderer.render(scene, camera);
        }
      }
      animate();

      isInitialized = true;
    } catch (err) {
      console.warn('Hero 3D planet stage initialized with error:', err);
    }
  }

  // Self-boot on ready or window load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAtlasWorlds);
  } else {
    initAtlasWorlds();
  }
  window.addEventListener('load', initAtlasWorlds);
})();
