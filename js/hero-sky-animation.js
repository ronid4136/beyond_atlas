/**
 * Beyond Atlas - Hero Celestial 3D Sky Engine
 * Real-time rotating 3D Mars, orbiting Moon, atmospheric corona & cosmic starfield
 * Seamlessly tracks the celestial line-of-sight where the astronaut looks
 * NASA Space Apps Challenge
 */

(function () {
  'use strict';

  let renderer, scene, camera, marsGroup, marsMesh, atmoMesh, moonMesh, orbitMesh, starPoints;
  let canvas, host;
  let moonAngle = 0;
  let targetCamX = 0, targetCamY = 0;
  let isInitialized = false;

  function initHeroSky() {
    if (isInitialized) return;
    canvas = document.getElementById('beyondHeroSkyCanvas');
    if (!canvas) return;
    host = canvas.parentElement;
    if (!host || !window.THREE) {
      setTimeout(initHeroSky, 50);
      return;
    }

    const T = window.THREE;
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;

    try {
      scene = new T.Scene();

      // Camera setup with natural cinematic perspective
      camera = new T.PerspectiveCamera(38, w / h, 0.1, 100);
      camera.position.set(0, 0, 7.8);

      renderer = new T.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      renderer.setSize(w, h, false);
      if ('outputColorSpace' in renderer) renderer.outputColorSpace = T.SRGBColorSpace;
      else if ('outputEncoding' in renderer) renderer.outputEncoding = T.sRGBEncoding;

      // Realistic Celestial Lighting (Sun keylight from top-left)
      const ambient = new T.AmbientLight(0x1e293b, 0.6);
      scene.add(ambient);

      const sun = new T.DirectionalLight(0xfff5ea, 2.4);
      sun.position.set(-6, 4.5, 4.5);
      scene.add(sun);

      const rimLight = new T.DirectionalLight(0x38bdf8, 0.35);
      rimLight.position.set(5, -2, -3);
      scene.add(rimLight);

      // Texture loader with error resilience
      const loader = new T.TextureLoader();
      const loadTex = (url) => {
        const tex = loader.load(
          url,
          () => {
            if (renderer && scene && camera) renderer.render(scene, camera);
          },
          undefined,
          (err) => {
            console.warn('Hero texture load warning:', url, err);
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
      scene.add(marsGroup);

      // Mars 3D Sphere - Base radius 1.0, scaled dynamically to match background
      const marsGeo = new T.SphereGeometry(1.0, 72, 72);
      const marsMat = new T.MeshStandardMaterial({
        map: marsTexture,
        bumpMap: marsBump,
        bumpScale: 0.045,
        roughness: 0.76,
        metalness: 0.04,
        color: 0xffffff
      });
      marsMesh = new T.Mesh(marsGeo, marsMat);
      marsMesh.rotation.z = 0.44; // 25.2° axial tilt
      marsGroup.add(marsMesh);

      // Glowing Atmosphere Shell (Rayleigh scattering rim)
      const atmoGeo = new T.SphereGeometry(1.028, 64, 64);
      const atmoMat = new T.MeshBasicMaterial({
        color: 0xff6e38,
        transparent: true,
        opacity: 0.32,
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
        roughness: 0.9,
        metalness: 0.02,
        color: 0xf1f5f9
      });
      moonMesh = new T.Mesh(moonGeo, moonMat);
      marsGroup.add(moonMesh);

      // Elegant Orbital Trajectory Ring
      const orbitPts = [];
      const rx = 1.95, ry = 0.88;
      for (let i = 0; i <= 240; i++) {
        const a = (i / 240) * Math.PI * 2;
        orbitPts.push(new T.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, -0.04));
      }
      const orbitGeo = new T.BufferGeometry().setFromPoints(orbitPts);
      orbitMesh = new T.LineLoop(
        orbitGeo,
        new T.LineBasicMaterial({
          color: 0xff8c42,
          transparent: true,
          opacity: 0.22,
          linewidth: 1
        })
      );
      orbitMesh.rotation.z = -0.2;
      marsGroup.add(orbitMesh);

      // Deep Space Starfield Particles
      const starCount = 480;
      const starPos = [];
      for (let i = 0; i < starCount; i++) {
        starPos.push(
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 16,
          -2 - Math.random() * 10
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

      // Precise Mathematical Alignment to the Background Mars Art
      function updatePlanetPosition() {
        if (!camera || !marsGroup || !host) return;
        const curW = host.clientWidth || window.innerWidth;
        const curH = host.clientHeight || window.innerHeight;
        const isMob = window.innerWidth <= 768;

        const W_img = 1376, H_img = 768;
        const bgPosXPercent = isMob ? 62 : 100; // 62% on mobile, 100% (right) on desktop

        const scale = Math.max(curW / W_img, curH / H_img);
        const W_rend = W_img * scale;
        const H_rend = H_img * scale;

        const offset_X = (curW - W_rend) * (bgPosXPercent / 100);
        const offset_Y = (curH - H_rend) * 0.5;

        let screenX = offset_X + 780 * scale;
        let screenY = offset_Y + 320 * scale;
        let screenRadius = 235 * scale;

        // Ensure Mars stays in the right-side celestial sky and never collides with the left text column
        if (!isMob && curW > 860) {
          const textRightBoundary = 610;
          if (screenX - screenRadius < textRightBoundary) {
            screenX = textRightBoundary + screenRadius * 0.95;
          }
        }

        // Convert (screenX, screenY) to Three.js world coordinates at z = 0
        const ndcX = (screenX / curW) * 2 - 1;
        const ndcY = -(screenY / curH) * 2 + 1;

        const vec = new T.Vector3(ndcX, ndcY, 0.5);
        vec.unproject(camera);
        const dir = vec.sub(camera.position).normalize();
        const targetZ = 0;
        const dist = (targetZ - camera.position.z) / dir.z;
        const worldPos = camera.position.clone().add(dir.multiplyScalar(dist));

        marsGroup.position.set(worldPos.x, worldPos.y, targetZ);

        // Match the 3D sphere radius to the screen radius
        const vFOV = (camera.fov * Math.PI) / 180;
        const visibleHeightWorld = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
        const worldRadius = (screenRadius / curH) * visibleHeightWorld;
        marsGroup.scale.set(worldRadius, worldRadius, worldRadius);
      }
      updatePlanetPosition();

      // Smooth Parallax on mouse/touch movement
      window.addEventListener('pointermove', (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        targetCamX = x * 0.28;
        targetCamY = y * 0.16;
      }, { passive: true });

      // Responsive Resize Handler
      const onResize = () => {
        if (!renderer || !host || !camera) return;
        const width = host.clientWidth || window.innerWidth;
        const height = host.clientHeight || window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        updatePlanetPosition();
      };

      if (window.ResizeObserver) {
        new ResizeObserver(onResize).observe(host);
      }
      window.addEventListener('resize', onResize);

      // 60 FPS Smooth Render Loop
      let lastTime = 0;
      function animate(time) {
        requestAnimationFrame(animate);
        if (document.hidden) return;

        // Smooth Mars continuous rotation
        if (marsMesh) {
          marsMesh.rotation.y += 0.0022;
        }

        // Orbiting Moon physics
        moonAngle += 0.0035;
        if (moonMesh) {
          moonMesh.position.set(
            Math.cos(moonAngle) * 1.95,
            Math.sin(moonAngle) * 0.88,
            Math.sin(moonAngle) * 0.38
          );
          moonMesh.rotation.y += 0.004;
        }

        // Starfield gentle cosmic drift
        if (starPoints) {
          starPoints.rotation.y += 0.00012;
        }

        // Smooth camera parallax easing
        camera.position.x += (targetCamX - camera.position.x) * 0.05;
        camera.position.y += (targetCamY - camera.position.y) * 0.05;

        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);

      isInitialized = true;
    } catch (e) {
      console.warn('Hero celestial 3D sky failed to initialize:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSky);
  } else {
    initHeroSky();
  }
  window.addEventListener('load', initHeroSky);
})();
