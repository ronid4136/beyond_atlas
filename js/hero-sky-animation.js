/**
 * Beyond Atlas - Cinematic Celestial 3D Mars Engine
 * Real-time rotating 3D Mars, orbiting Moon, atmospheric corona & cosmic starfield
 * Embedded in the Featured Spotlight Card (where 2nd picture originally was)
 * NASA Space Apps Challenge
 */

(function () {
  'use strict';

  let renderer, scene, camera, marsGroup, marsMesh, atmoMesh, moonMesh, orbitMesh, starPoints;
  let canvas, host;
  let moonAngle = 0;
  let isDragging = false, lastX = 0, lastY = 0;
  let targetRotX = 0.08, targetRotY = 0.35, currentRotX = 0.08, currentRotY = 0.35;
  let zoom = 4.4, targetZoom = 4.4;
  let autoRotate = true;
  let isInitialized = false;

  function initCelestialSimulation() {
    if (isInitialized) return;

    // Look for the spotlight celestial canvas first, fallback to hero canvas if needed
    canvas = document.getElementById('spotlightCelestialCanvas') || document.getElementById('beyondHeroSkyCanvas');
    if (!canvas) return;
    host = canvas.parentElement;
    if (!host || !window.THREE) {
      setTimeout(initCelestialSimulation, 60);
      return;
    }

    const T = window.THREE;
    const w = Math.max(260, host.clientWidth || 360);
    const h = Math.max(240, host.clientHeight || 280);

    try {
      scene = new T.Scene();

      camera = new T.PerspectiveCamera(38, w / h, 0.1, 100);
      camera.position.set(0, 0, zoom);

      renderer = new T.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      if ('outputColorSpace' in renderer) renderer.outputColorSpace = T.SRGBColorSpace;
      else if ('outputEncoding' in renderer) renderer.outputEncoding = T.sRGBEncoding;

      // Realistic Celestial Lighting (Sun keylight from top-left)
      const ambient = new T.AmbientLight(0x231828, 0.7);
      scene.add(ambient);

      const sun = new T.DirectionalLight(0xfff1e6, 2.6);
      sun.position.set(-5.5, 4.0, 5.0);
      scene.add(sun);

      const rimLight = new T.DirectionalLight(0x38bdf8, 0.42);
      rimLight.position.set(5.0, -2.5, -3.5);
      scene.add(rimLight);

      // Texture loader with error resilience & fallbacks
      const loader = new T.TextureLoader();
      const loadTex = (url) => {
        const tex = loader.load(
          url,
          () => {
            if (renderer && scene && camera) renderer.render(scene, camera);
          },
          undefined,
          (err) => {
            console.warn('Celestial texture warning:', url, err);
          }
        );
        tex.wrapS = T.ClampToEdgeWrapping;
        tex.wrapT = T.ClampToEdgeWrapping;
        tex.minFilter = T.LinearMipmapLinearFilter;
        return tex;
      };

      const marsTexture = loadTex('assets/images/mars_texture.jpg');
      const marsBump = loadTex('assets/images/mars_bump.jpg');
      const moonTexture = loadTex('assets/images/moon_texture.jpg');

      // Mars Main Celestial Group
      marsGroup = new T.Group();
      marsGroup.position.set(0, 0, 0);
      scene.add(marsGroup);

      // Mars 3D Sphere - High detail with 96 segments
      const marsGeo = new T.SphereGeometry(1.22, 96, 96);
      const marsMat = new T.MeshStandardMaterial({
        map: marsTexture,
        bumpMap: marsBump,
        bumpScale: 0.05,
        roughness: 0.76,
        metalness: 0.04,
        color: 0xffffff
      });
      marsMesh = new T.Mesh(marsGeo, marsMat);
      marsMesh.rotation.z = 0.44; // 25.2° axial tilt
      marsGroup.add(marsMesh);

      // Glowing Atmosphere Shell (Rayleigh scattering rim)
      const atmoGeo = new T.SphereGeometry(1.258, 64, 64);
      const atmoMat = new T.MeshBasicMaterial({
        color: 0xff6e38,
        transparent: true,
        opacity: 0.36,
        side: T.BackSide,
        blending: T.AdditiveBlending
      });
      atmoMesh = new T.Mesh(atmoGeo, atmoMat);
      marsGroup.add(atmoMesh);

      // Orbiting Celestial Moon
      const moonGeo = new T.SphereGeometry(0.18, 48, 48);
      const moonMat = new T.MeshStandardMaterial({
        map: moonTexture,
        bumpMap: moonTexture,
        bumpScale: 0.04,
        roughness: 0.88,
        metalness: 0.02,
        color: 0xf1f5f9
      });
      moonMesh = new T.Mesh(moonGeo, moonMat);
      marsGroup.add(moonMesh);

      // Elegant Orbital Trajectory Ring
      const orbitPts = [];
      const rx = 2.2, ry = 0.95;
      for (let i = 0; i <= 240; i++) {
        const a = (i / 240) * Math.PI * 2;
        orbitPts.push(new T.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, -0.05));
      }
      const orbitGeo = new T.BufferGeometry().setFromPoints(orbitPts);
      orbitMesh = new T.LineLoop(
        orbitGeo,
        new T.LineBasicMaterial({
          color: 0xff8c42,
          transparent: true,
          opacity: 0.32,
          linewidth: 1
        })
      );
      orbitMesh.rotation.z = -0.22;
      marsGroup.add(orbitMesh);

      // Deep Space Starfield Particles
      const starCount = 420;
      const starPos = [];
      for (let i = 0; i < starCount; i++) {
        starPos.push(
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 14,
          -2.5 - Math.random() * 8
        );
      }
      const starGeo = new T.BufferGeometry();
      starGeo.setAttribute('position', new T.Float32BufferAttribute(starPos, 3));
      const starMat = new T.PointsMaterial({
        color: 0xbfdbfe,
        size: 0.022,
        transparent: true,
        opacity: 0.75
      });
      starPoints = new T.Points(starGeo, starMat);
      scene.add(starPoints);

      // Drag to rotate with smooth inertia
      canvas.style.touchAction = 'none';
      canvas.style.cursor = 'grab';

      canvas.addEventListener('pointerdown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      });

      canvas.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        targetRotY += dx * 0.007;
        targetRotX = Math.max(-1.1, Math.min(1.1, targetRotX + dy * 0.007));
      });

      const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        canvas.style.cursor = 'grab';
        try {
          if (e && e.pointerId) canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
      };

      canvas.addEventListener('pointerup', stopDrag);
      canvas.addEventListener('pointercancel', stopDrag);
      canvas.addEventListener('lostpointercapture', stopDrag);

      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        targetZoom = Math.max(3.2, Math.min(6.5, targetZoom + e.deltaY * 0.0035));
      }, { passive: false });

      // Public Controls for Buttons
      window.__baCelestialControls = {
        toggleRotation: function () {
          autoRotate = !autoRotate;
          return autoRotate;
        },
        zoomIn: function () {
          targetZoom = Math.max(3.0, targetZoom - 0.45);
        },
        zoomOut: function () {
          targetZoom = Math.min(6.5, targetZoom + 0.45);
        },
        reset: function () {
          targetRotX = 0.08;
          targetRotY = 0.35;
          targetZoom = 4.4;
          autoRotate = true;
        }
      };

      // Responsive Resize Handler
      const onResize = () => {
        if (!renderer || !host || !camera) return;
        const width = host.clientWidth || 360;
        const height = host.clientHeight || 280;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      if (window.ResizeObserver) {
        new ResizeObserver(onResize).observe(host);
      }
      window.addEventListener('resize', onResize);

      // 60 FPS Render Loop with Smooth Physics
      function animate() {
        requestAnimationFrame(animate);
        if (document.hidden) return;

        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;
        zoom += (targetZoom - zoom) * 0.08;

        camera.position.z = zoom;

        // Smooth Mars continuous rotation
        if (marsMesh) {
          marsMesh.rotation.x = currentRotX;
          marsMesh.rotation.y = currentRotY;

          if (autoRotate && !isDragging) {
            targetRotY += 0.0022;
          }
        }

        // Orbiting Moon physics
        moonAngle += 0.0035;
        if (moonMesh) {
          moonMesh.position.set(
            Math.cos(moonAngle) * 2.2,
            Math.sin(moonAngle) * 0.95,
            Math.sin(moonAngle) * 0.42
          );
          moonMesh.rotation.y += 0.004;
        }

        // Starfield gentle cosmic drift
        if (starPoints) {
          starPoints.rotation.y += 0.00012;
        }

        if (orbitMesh) {
          orbitMesh.rotation.z += 0.0004;
        }

        renderer.render(scene, camera);
      }
      animate();

      isInitialized = true;
    } catch (e) {
      console.warn('Spotlight celestial 3D simulation failed to initialize:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCelestialSimulation);
  } else {
    initCelestialSimulation();
  }
  window.addEventListener('load', initCelestialSimulation);
})();
