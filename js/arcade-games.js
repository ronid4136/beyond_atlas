/**
 * Beyond Atlas - Mission Arcade Games Engine
 * Professional High-Performance 2D Canvas Games:
 * 1. Mars Rover: Jezero Sample Run
 * 2. Apollo Lunar Lander: Tranquility Touchdown
 * Built with procedural Web Audio API, responsive controls & particle effects.
 * NASA Space Apps Challenge
 */

(function () {
  'use strict';

  const root = document.getElementById('baArcadeGames');
  if (!root) return;

  const area = document.getElementById('baGamePlayArea');
  const canvas = document.getElementById('baArcadeCanvas');
  if (!area || !canvas) return;

  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('baGameStatus');
  const titleEl = document.getElementById('baGameTitle');
  const kickerEl = document.getElementById('baGameKicker');
  const instructionsEl = document.getElementById('baGameInstructions');
  const controlsEl = document.getElementById('baGameControls');
  const sfxToggleBtn = document.getElementById('baGameSfxToggle');
  const helpEl = document.getElementById('baGameHelp');

  // Telemetry Ribbon elements
  const tVal1 = document.getElementById('telemetryVal1');
  const tVal2 = document.getElementById('telemetryVal2');
  const tVal3 = document.getElementById('telemetryVal3');
  const tVal4 = document.getElementById('telemetryVal4');
  const tLbl1 = document.getElementById('telemetryLabel1');
  const tLbl2 = document.getElementById('telemetryLabel2');
  const tLbl3 = document.getElementById('telemetryLabel3');
  const tLbl4 = document.getElementById('telemetryLabel4');

  const stepEls = [...document.querySelectorAll('#baMiniMissionSteps .ba-mini-step')];

  // Logical Canvas Coordinates (optimized for laptop/desktop screen heights)
  const W = 800;
  const H = 340;

  /* ==========================================================================
     BULLETPROOF PROCEDURAL WEB AUDIO SYNTHESIZER
     (Zero external audio files, completely error-guarded, lag-free)
     ========================================================================== */
  const SoundFX = {
    ctx: null,
    enabled: true,
    lastThruster: 0,
    lastRCS: 0,
    lastDrive: 0,

    init() {
      try {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
          const AudioCtor = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioCtor();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      } catch (e) {}
    },

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    },

    playTone(freq, type = 'sine', duration = 0.12, gainVal = 0.1, pitchDecay = true) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (pitchDecay) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.4), now + duration);
        }
        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {}
    },

    playThruster() {
      if (!this.enabled) return;
      const now = Date.now();
      if (now - this.lastThruster < 75) return;
      this.lastThruster = now;
      this.playTone(80 + Math.random() * 25, 'triangle', 0.1, 0.08, true);
    },

    playRCS() {
      if (!this.enabled) return;
      const now = Date.now();
      if (now - this.lastRCS < 110) return;
      this.lastRCS = now;
      this.playTone(480 + Math.random() * 60, 'sine', 0.07, 0.05, true);
    },

    playDrive() {
      if (!this.enabled) return;
      const now = Date.now();
      if (now - this.lastDrive < 120) return;
      this.lastDrive = now;
      this.playTone(65, 'triangle', 0.08, 0.03, false);
    },

    playBoost() {
      if (!this.enabled) return;
      this.playTone(240, 'sawtooth', 0.2, 0.08, true);
    },

    playCollect(combo = 1) {
      if (!this.enabled) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const count = Math.min(combo + 1, 4);
      for (let i = 0; i < count; i++) {
        setTimeout(() => this.playTone(notes[i], 'sine', 0.18, 0.12, false), i * 55);
      }
    },

    playBounce() {
      this.playTone(110, 'triangle', 0.16, 0.18, true);
    },

    playExplosion() {
      this.playTone(90, 'sawtooth', 0.5, 0.25, true);
      setTimeout(() => this.playTone(45, 'triangle', 0.45, 0.2, true), 80);
    },

    playVictory() {
      const fanfare = [523.25, 659.25, 783.99, 1046.5];
      fanfare.forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.32, 0.15, false), i * 95);
      });
    }
  };

  /* ==========================================================================
     GAME ENGINE STATE & PARTICLES
     ========================================================================== */
  let activeGame = 'rover';
  let isRunning = false;
  let rafId = 0;
  let keys = {};
  let lastTime = 0;
  let screenShake = 0;
  let missionTimer = 0;

  let particles = [];
  let floatingTexts = [];
  let tireTracks = [];

  function setStep(num) {
    stepEls.forEach((el, idx) => {
      el.classList.toggle('active', idx === num - 1);
      el.classList.toggle('done', idx < num - 1);
    });
  }

  function addFloatingText(x, y, text, color = '#38bdf8') {
    floatingTexts.push({ x, y, text, color, alpha: 1, vy: -35 });
  }

  function addSparks(x, y, count = 12, color = '#fb923c', speed = 80) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * 3 + 1.5,
        alpha: 1,
        life: Math.random() * 0.5 + 0.35
      });
    }
  }

  /* ==========================================================================
     GAME 1: MARS ROVER (Jezero Sample Expedition)
     ========================================================================== */
  let rover = {
    x: 90,
    y: 170,
    angle: 0,
    speed: 0,
    steerAngle: 0,
    boostEnergy: 100,
    isBoosting: false,
    score: 0,
    samplesCollected: 0,
    combo: 1,
    lastCollectTime: 0,
    armExtension: 0
  };

  let samples = [];
  let rocks = [];
  let craters = [];

  function resetRover() {
    rover = {
      x: 85,
      y: 170,
      angle: 0,
      speed: 0,
      steerAngle: 0,
      boostEnergy: 100,
      isBoosting: false,
      score: 0,
      samplesCollected: 0,
      combo: 1,
      lastCollectTime: 0,
      armExtension: 0
    };

    samples = [
      { id: 1, x: 230, y: 75, name: "Hematite Concretion", color: "#38bdf8", pts: 100, pulse: 0 },
      { id: 2, x: 440, y: 95, name: "Lacustrine Mudstone", color: "#4ade80", pts: 150, pulse: 1.2 },
      { id: 3, x: 670, y: 130, name: "Olivine Basalt Core", color: "#fb923c", pts: 200, pulse: 2.4 },
      { id: 4, x: 330, y: 255, name: "Smectite Clay Deposit", color: "#f472b6", pts: 250, pulse: 3.6 },
      { id: 5, x: 570, y: 245, name: "Organic Biosignature", color: "#a855f7", pts: 300, pulse: 4.8 }
    ];

    rocks = [
      { x: 270, y: 175, r: 28, col: '#7c2d12' },
      { x: 450, y: 215, r: 32, col: '#854d0e' },
      { x: 510, y: 70, r: 24, col: '#78350f' },
      { x: 610, y: 170, r: 26, col: '#9a3412' }
    ];

    craters = [
      { x: 380, y: 150, r: 42 },
      { x: 680, y: 75, r: 35 }
    ];

    tireTracks = [];
    particles = [];
    floatingTexts = [];
    missionTimer = 0;
    screenShake = 0;

    statusEl.textContent = 'Mission Ready: Drive across Jezero Crater. Collect all 5 science samples!';
    tLbl1.textContent = 'MISSION TIME';
    tLbl2.textContent = 'BOOST ENERGY';
    tLbl3.textContent = 'SAMPLES COLLECTED';
    tLbl4.textContent = 'MISSION SCORE';
  }

  function drawRoverGame() {
    // Martian Red Planet Sky & Terrain Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#1c0a06');
    bgGrad.addColorStop(0.3, '#2e120a');
    bgGrad.addColorStop(0.7, '#481a0c');
    bgGrad.addColorStop(1, '#2b0f07');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle Martian topographic grid
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Craters on ground
    craters.forEach(c => {
      const cGrad = ctx.createRadialGradient(c.x, c.y, c.r * 0.2, c.x, c.y, c.r);
      cGrad.addColorStop(0, '#120503');
      cGrad.addColorStop(0.85, '#240b06');
      cGrad.addColorStop(1, 'rgba(251, 146, 60, 0.15)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.25)';
      ctx.stroke();
    });

    // Fading Tire Tracks in Martian Dust
    for (let i = 0; i < tireTracks.length; i++) {
      const t = tireTracks[i];
      ctx.strokeStyle = `rgba(30, 9, 4, ${t.alpha * 0.6})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.lineTo(t.x2, t.y2);
      ctx.stroke();
    }

    // Boulders
    rocks.forEach(r => {
      // Rock shadow
      ctx.fillStyle = 'rgba(8, 2, 2, 0.65)';
      ctx.beginPath();
      ctx.ellipse(r.x + 4, r.y + 5, r.r, r.r * 0.7, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Rock body with faceted 3D gradient
      const rGrad = ctx.createRadialGradient(r.x - r.r * 0.3, r.y - r.r * 0.3, 2, r.x, r.y, r.r);
      rGrad.addColorStop(0, '#b45309');
      rGrad.addColorStop(0.4, r.col);
      rGrad.addColorStop(1, '#1c0a06');
      ctx.fillStyle = rGrad;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Glowing Science Samples
    samples.forEach(s => {
      s.pulse += 0.05;
      const pulseScale = Math.sin(s.pulse) * 3;

      ctx.save();
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 14 + pulseScale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, s.x, s.y - 15);
      ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
      ctx.font = '8px monospace';
      ctx.fillText(`+${s.pts} PTS`, s.x, s.y + 20);
    });

    // Nearest Sample HUD Compass Arrow
    if (samples.length > 0) {
      let nearest = null;
      let minDist = 9999;
      samples.forEach(s => {
        const d = Math.hypot(s.x - rover.x, s.y - rover.y);
        if (d < minDist) {
          minDist = d;
          nearest = s;
        }
      });

      if (nearest) {
        const targetAngle = Math.atan2(nearest.y - rover.y, nearest.x - rover.x);
        const compassDist = 32;
        const ax = rover.x + Math.cos(targetAngle) * compassDist;
        const ay = rover.y + Math.sin(targetAngle) * compassDist;

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(targetAngle);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(-5, -4);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-5, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // ROVER VEHICLE MODEL
    ctx.save();
    ctx.translate(rover.x, rover.y);
    ctx.rotate(rover.angle);

    // Headlights
    const lightGrad = ctx.createRadialGradient(25, 0, 5, 110, 0, 95);
    lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    lightGrad.addColorStop(0.7, 'rgba(254, 240, 138, 0.08)');
    lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.moveTo(16, -5);
    ctx.lineTo(115, -34);
    ctx.lineTo(115, 34);
    ctx.lineTo(16, 5);
    ctx.closePath();
    ctx.fill();

    // Boost Flames
    if (rover.isBoosting) {
      const flameLen = 24 + Math.random() * 15;
      const fGrad = ctx.createLinearGradient(-16, 0, -16 - flameLen, 0);
      fGrad.addColorStop(0, '#ffffff');
      fGrad.addColorStop(0.3, '#f97316');
      fGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.moveTo(-14, -5);
      ctx.lineTo(-16 - flameLen, 0);
      ctx.lineTo(-14, 5);
      ctx.closePath();
      ctx.fill();
    }

    // 6 Wheels
    const wheels = [
      { x: 16, y: -14, steer: true },
      { x: 0, y: -15, steer: false },
      { x: -16, y: -14, steer: true },
      { x: 16, y: 14, steer: true },
      { x: 0, y: 15, steer: false },
      { x: -16, y: 14, steer: true }
    ];

    wheels.forEach(w => {
      ctx.save();
      ctx.translate(w.x, w.y);
      if (w.steer) ctx.rotate(rover.steerAngle * 0.5);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.fillRect(-5, -3, 10, 6);
      ctx.strokeRect(-5, -3, 10, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, -1, 4, 2);
      ctx.restore();
    });

    // Suspension struts
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-14, -10);
    ctx.lineTo(0, -9);
    ctx.lineTo(14, -10);
    ctx.moveTo(-14, 10);
    ctx.lineTo(0, 9);
    ctx.lineTo(14, 10);
    ctx.stroke();

    // Main Chassis
    const bodyGrad = ctx.createLinearGradient(-14, -9, 16, 9);
    bodyGrad.addColorStop(0, '#e2e8f0');
    bodyGrad.addColorStop(0.5, '#cbd5e1');
    bodyGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    ctx.fillRect(-15, -9, 30, 18);
    ctx.strokeRect(-15, -9, 30, 18);

    // Solar Deck
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-11, -6, 22, 12);

    // Mastcam
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(7, -3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mastcam LED
    const ledFlash = Math.sin(Date.now() * 0.008) > 0;
    ctx.fillStyle = ledFlash ? '#34d399' : '#059669';
    ctx.beginPath();
    ctx.arc(7, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Robotic arm
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, 4);
    ctx.lineTo(15 + rover.armExtension * 9, 6 + rover.armExtension * 3);
    ctx.stroke();

    ctx.restore();

    // Floating Score Texts
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // In-Canvas HUD Readouts
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SAMPLES: ${rover.samplesCollected} / 5`, 18, 25);

    if (rover.combo > 1) {
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.fillText(`COMBO x${rover.combo}!`, 130, 25);
    }

    // Boost Meter Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(W - 150, 14, 130, 12);
    ctx.fillRect(W - 150, 14, 130, 12);
    const bGrad = ctx.createLinearGradient(W - 150, 0, W - 20, 0);
    bGrad.addColorStop(0, '#f97316');
    bGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = bGrad;
    ctx.fillRect(W - 148, 16, (rover.boostEnergy / 100) * 126, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`BOOST ${Math.round(rover.boostEnergy)}%`, W - 85, 23);

    // VICTORY REPORT
    if (rover.samplesCollected >= 5) {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
      ctx.fillRect(120, 70, W - 240, 200);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.strokeRect(120, 70, W - 240, 200);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 20px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MISSION COMPLETE! ★★★', W / 2, 115);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px "Space Grotesk", sans-serif';
      ctx.fillText('All 5 Martian Science Samples Extracted & Sealed', W / 2, 145);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`FINAL SCORE: ${rover.score} PTS  •  TIME: ${formatTime(missionTimer)}`, W / 2, 180);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Click RETRY MISSION or select Lunar Lander above.', W / 2, 225);
    }
  }

  function updateRoverGame(dt) {
    missionTimer += dt;

    // Steering
    const targetSteer = (keys.ArrowRight || keys.d || keys.D ? 1 : 0) - (keys.ArrowLeft || keys.a || keys.A ? 1 : 0);
    rover.steerAngle += (targetSteer - rover.steerAngle) * 8 * dt;
    rover.angle += rover.steerAngle * (rover.speed / 65) * dt;

    // Acceleration & Boost
    rover.isBoosting = (keys[' '] || keys.Space) && rover.boostEnergy > 5;
    const accelRate = rover.isBoosting ? 260 : 135;
    const maxSpeed = rover.isBoosting ? 210 : 130;

    if (rover.isBoosting) {
      rover.boostEnergy = Math.max(0, rover.boostEnergy - 32 * dt);
      SoundFX.playBoost();
      screenShake = 3;
      const bx = rover.x - Math.cos(rover.angle) * 16;
      const by = rover.y - Math.sin(rover.angle) * 16;
      addSparks(bx, by, 3, '#f97316', 80);
    } else {
      rover.boostEnergy = Math.min(100, rover.boostEnergy + 14 * dt);
    }

    if (keys.ArrowUp || keys.w || keys.W) {
      rover.speed = Math.min(maxSpeed, rover.speed + accelRate * dt);
      SoundFX.playDrive();

      // Tire Tracks
      if (Math.abs(rover.speed) > 20 && Math.random() < 0.45) {
        const leftX = rover.x - Math.sin(rover.angle) * 11;
        const leftY = rover.y + Math.cos(rover.angle) * 11;
        const rightX = rover.x + Math.sin(rover.angle) * 11;
        const rightY = rover.y - Math.cos(rover.angle) * 11;
        tireTracks.push({
          x1: leftX,
          y1: leftY,
          x2: leftX - Math.cos(rover.angle) * 7,
          y2: leftY - Math.sin(rover.angle) * 7,
          alpha: 1
        });
        tireTracks.push({
          x1: rightX,
          y1: rightY,
          x2: rightX - Math.cos(rover.angle) * 7,
          y2: rightY - Math.sin(rover.angle) * 7,
          alpha: 1
        });
        if (tireTracks.length > 160) tireTracks.splice(0, 2);
      }
    } else if (keys.ArrowDown || keys.s || keys.S) {
      rover.speed = Math.max(-60, rover.speed - 150 * dt);
    } else {
      rover.speed *= Math.pow(0.88, dt * 60);
    }

    rover.x += Math.cos(rover.angle) * rover.speed * dt;
    rover.y += Math.sin(rover.angle) * rover.speed * dt;

    // Boundaries
    rover.x = Math.max(20, Math.min(W - 20, rover.x));
    rover.y = Math.max(20, Math.min(H - 20, rover.y));

    // Rock Collisions
    rocks.forEach(r => {
      const dist = Math.hypot(rover.x - r.x, rover.y - r.y);
      if (dist < r.r + 14) {
        rover.speed *= -0.55;
        const pushAngle = Math.atan2(rover.y - r.y, rover.x - r.x);
        rover.x = r.x + Math.cos(pushAngle) * (r.r + 15);
        rover.y = r.y + Math.sin(pushAngle) * (r.r + 15);
        screenShake = 5;
        SoundFX.playBounce();
        addSparks(rover.x, rover.y, 8, '#fbbf24', 60);
      }
    });

    // Crater drag
    craters.forEach(c => {
      if (Math.hypot(rover.x - c.x, rover.y - c.y) < c.r) {
        rover.speed *= 0.94;
      }
    });

    // Robotic arm extension
    let armTarget = 0;
    samples.forEach(s => {
      if (Math.hypot(rover.x - s.x, rover.y - s.y) < 60) {
        armTarget = 1;
      }
    });
    rover.armExtension += (armTarget - rover.armExtension) * 10 * dt;

    // Sample Pickup
    samples = samples.filter(s => {
      const dist = Math.hypot(rover.x - s.x, rover.y - s.y);
      if (dist < 25) {
        rover.samplesCollected++;
        const now = Date.now();
        if (now - rover.lastCollectTime < 5000) {
          rover.combo++;
        } else {
          rover.combo = 1;
        }
        rover.lastCollectTime = now;

        const earned = s.pts * rover.combo;
        rover.score += earned;

        SoundFX.playCollect(rover.combo);
        addFloatingText(s.x, s.y - 10, `+${earned} PTS! (${s.name})`, s.color);
        addSparks(s.x, s.y, 22, s.color, 110);
        screenShake = 3;

        if (rover.samplesCollected === 5) {
          SoundFX.playVictory();
          setStep(3);
          statusEl.textContent = `★ ALL 5 SAMPLES SECURED! Final Score: ${rover.score} PTS ★`;
        } else {
          statusEl.textContent = `Secured: ${s.name}! ${5 - rover.samplesCollected} samples remaining.`;
        }
        return false;
      }
      return true;
    });

    // Update Particles
    particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt / p.life;
    });
    particles = particles.filter(p => p.alpha > 0);

    floatingTexts.forEach(ft => {
      ft.y += ft.vy * dt;
      ft.alpha -= dt * 0.9;
    });
    floatingTexts = floatingTexts.filter(ft => ft.alpha > 0);

    tireTracks.forEach(t => {
      t.alpha -= dt * 0.05;
    });
    tireTracks = tireTracks.filter(t => t.alpha > 0);

    // Update Ribbon
    tVal1.textContent = formatTime(missionTimer);
    tVal2.textContent = `${Math.round(rover.boostEnergy)}%`;
    tVal3.textContent = `${rover.samplesCollected} / 5`;
    tVal4.textContent = `${rover.score} PTS`;
  }

  /* ==========================================================================
     GAME 2: APOLLO LUNAR LANDER (Tranquility Touchdown)
     ========================================================================== */
  let lander = {
    x: 400,
    y: 50,
    vx: 0,
    vy: 10,
    angle: 0,
    fuel: 100,
    landed: false,
    crashed: false,
    score: 0
  };

  const pad = { x: 400, y: 295, w: 140 };
  let stars = [];
  let fuelPickups = [];

  function terrainHeight(x) {
    return 290 + 14 * Math.sin(x * 0.013) + 7 * Math.sin(x * 0.03 + 1.2) - 5 * Math.cos(x * 0.008);
  }

  function resetLander() {
    lander = {
      x: 350 + (Math.random() * 100 - 50),
      y: 50,
      vx: (Math.random() - 0.5) * 16,
      vy: 10,
      angle: (Math.random() - 0.5) * 0.2,
      fuel: 100,
      landed: false,
      crashed: false,
      score: 0
    };

    fuelPickups = [
      { x: 180, y: 120, pulse: 0, collected: false },
      { x: 620, y: 130, pulse: 1.5, collected: false }
    ];

    stars = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * 220,
        size: Math.random() < 0.15 ? 2.2 : 1.1,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    particles = [];
    floatingTexts = [];
    missionTimer = 0;
    screenShake = 0;

    statusEl.textContent = 'Apollo Flight Guidance: Rotate with ←/→ to counter drift, hold ↑/W to fire thruster, land on green pad!';
    tLbl1.textContent = 'MISSION TIME';
    tLbl2.textContent = 'LUNAR FUEL';
    tLbl3.textContent = 'DESCENT SPEED';
    tLbl4.textContent = 'PITCH ANGLE';
  }

  function drawLanderGame() {
    // Deep Space Night Sky
    ctx.fillStyle = '#01050e';
    ctx.fillRect(0, 0, W, H);

    // Twinkling Starfield
    stars.forEach(st => {
      st.twinkle += 0.04;
      const alpha = 0.55 + Math.sin(st.twinkle) * 0.45;
      ctx.fillStyle = `rgba(224, 242, 254, ${alpha})`;
      ctx.fillRect(st.x, st.y, st.size, st.size);
    });

    // Earthrise in Space
    const earthX = 95;
    const earthY = 60;
    const earthGrad = ctx.createRadialGradient(earthX - 5, earthY - 5, 3, earthX, earthY, 26);
    earthGrad.addColorStop(0, '#93c5fd');
    earthGrad.addColorStop(0.4, '#2563eb');
    earthGrad.addColorStop(0.85, '#1e3a8a');
    earthGrad.addColorStop(1, '#020617');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Lunar Horizon & Terrain
    ctx.beginPath();
    ctx.moveTo(0, terrainHeight(0));
    for (let x = 0; x <= W; x += 10) {
      ctx.lineTo(x, terrainHeight(x));
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();

    const moonGrad = ctx.createLinearGradient(0, 220, 0, H);
    moonGrad.addColorStop(0, '#475569');
    moonGrad.addColorStop(0.25, '#1e293b');
    moonGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = moonGrad;
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lunar Craters
    for (let i = 0; i < 10; i++) {
      const cx = (i * 78 + 35) % W;
      const cy = terrainHeight(cx) + 14 + (i % 3) * 8;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 10 + (i % 3) * 5, 3 + (i % 2) * 2, -0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // TRANQUILITY BASE LANDING PAD
    const padY = terrainHeight(pad.x);
    const padFlash = Math.sin(Date.now() * 0.007) > 0;
    ctx.save();
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = padFlash ? '#34d399' : '#059669';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(pad.x, padY - 2, pad.w / 2, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(52, 211, 153, 0.18)';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(pad.x - 26, padY - 4, 52, 4);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 9px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TRANQUILITY BASE • APOLLO 11 TARGET', pad.x, padY - 14);

    // Floating Fuel Cells
    fuelPickups.forEach(fp => {
      if (!fp.collected) {
        fp.pulse += 0.06;
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(fp.x - 9, fp.y - 10, 18, 20);
        ctx.strokeRect(fp.x - 9, fp.y - 10, 18, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⛽ +25%', fp.x, fp.y + 3);
        ctx.restore();
      }
    });

    // Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Trajectory guidance vector
    if (!lander.landed && !lander.crashed) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lander.x, lander.y);
      ctx.lineTo(lander.x + lander.vx * 1.3, lander.y + lander.vy * 1.3);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // APOLLO LUNAR MODULE
    if (!lander.crashed) {
      ctx.save();
      ctx.translate(lander.x, lander.y);
      ctx.rotate(lander.angle);

      // Main Thruster Plume
      if ((keys.ArrowUp || keys.w || keys.W || keys.Space) && lander.fuel > 0 && !lander.landed) {
        const flameLen = 22 + Math.random() * 18;
        const flameGrad = ctx.createLinearGradient(0, 14, 0, 14 + flameLen);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.25, '#fef08a');
        flameGrad.addColorStop(0.65, '#f97316');
        flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-6, 14);
        ctx.lineTo(0, 14 + flameLen);
        ctx.lineTo(6, 14);
        ctx.closePath();
        ctx.fill();
      }

      // RCS cold gas puffs
      if (keys.ArrowLeft || keys.a || keys.A) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(12, -5, 3.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (keys.ArrowRight || keys.d || keys.D) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(-12, -5, 3.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Landing Legs & Footpads
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-9, 10);
      ctx.lineTo(-21, 22);
      ctx.lineTo(-28, 25);
      ctx.moveTo(9, 10);
      ctx.lineTo(21, 22);
      ctx.lineTo(28, 25);
      ctx.stroke();

      // Footpads
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-31, 24, 6, 3);
      ctx.fillRect(25, 24, 6, 3);

      // Descent Stage: Gold foil body
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.fillRect(-12, 3, 24, 11);
      ctx.strokeRect(-12, 3, 24, 11);

      // Ascent Stage: Silver cabin
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-11, 3);
      ctx.lineTo(-8, -10);
      ctx.lineTo(0, -17);
      ctx.lineTo(8, -10);
      ctx.lineTo(11, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Window
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, -7, 4, Math.PI, 0);
      ctx.fill();

      // Top Radar Antenna
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -17);
      ctx.lineTo(0, -24);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -24, 2.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // Floating text
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // In-Canvas Apollo Guidance HUD
    const isSafeVy = Math.abs(lander.vy) <= 30;
    const isSafeVx = Math.abs(lander.vx) <= 20;
    const isSafeAngle = Math.abs(lander.angle) <= 0.26;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`FUEL: ${Math.round(lander.fuel)}%`, 18, 24);
    ctx.fillStyle = isSafeVy ? '#34d399' : '#ef4444';
    ctx.fillText(`V-SPEED: ${lander.vy.toFixed(1)} m/s ${isSafeVy ? '✓' : '⚠️ HIGH'}`, 18, 40);
    ctx.fillStyle = isSafeVx ? '#34d399' : '#ef4444';
    ctx.fillText(`H-DRIFT: ${lander.vx.toFixed(1)} m/s ${isSafeVx ? '✓' : '⚠️ HIGH'}`, 18, 56);

    ctx.textAlign = 'right';
    ctx.fillStyle = isSafeAngle ? '#34d399' : '#ef4444';
    ctx.fillText(`TILT: ${(lander.angle * (180 / Math.PI)).toFixed(0)}°`, W - 18, 24);

    // ENDGAME REPORT OVERLAY
    if (lander.landed || lander.crashed) {
      const isSuccess = lander.landed;
      ctx.fillStyle = isSuccess ? 'rgba(6, 78, 59, 0.92)' : 'rgba(69, 10, 10, 0.92)';
      ctx.fillRect(140, 75, W - 280, 190);
      ctx.strokeStyle = isSuccess ? '#34d399' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(140, 75, W - 280, 190);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isSuccess ? 'TOUCHDOWN SUCCESSFUL! 🦅' : 'HARD IMPACT: CRASH DETECTED', W / 2, 115);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px "Space Grotesk", sans-serif';
      ctx.fillText(
        isSuccess
          ? '“Houston, Tranquility Base here. The Eagle has landed!”'
          : 'Speed exceeded structural limit. Counter-thrust early to land gently.',
        W / 2,
        150
      );

      ctx.fillStyle = isSuccess ? '#34d399' : '#fca5a5';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(
        isSuccess
          ? `MISSION POINTS: +100 PTS  •  FUEL LEFT: ${Math.round(lander.fuel)}%`
          : `IMPACT SPEED: ${Math.abs(lander.vy).toFixed(1)} m/s (Limit: 30 m/s)`,
        W / 2,
        185
      );

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px sans-serif';
      ctx.fillText('Click RETRY MISSION or press Reset to launch another flight.', W / 2, 230);
    }
  }

  function updateLanderGame(dt) {
    missionTimer += dt;

    if (!lander.landed && !lander.crashed) {
      // Rotation
      if (keys.ArrowLeft || keys.a || keys.A) {
        lander.angle -= 1.8 * dt;
        SoundFX.playRCS();
      }
      if (keys.ArrowRight || keys.d || keys.D) {
        lander.angle += 1.8 * dt;
        SoundFX.playRCS();
      }
      lander.angle = Math.max(-0.85, Math.min(0.85, lander.angle));

      // Main Thruster
      if ((keys.ArrowUp || keys.w || keys.W || keys.Space) && lander.fuel > 0) {
        lander.vx += Math.sin(lander.angle) * 88 * dt;
        lander.vy -= Math.cos(lander.angle) * 110 * dt;
        lander.fuel = Math.max(0, lander.fuel - 12 * dt);
        SoundFX.playThruster();

        // Rocket flame particles
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: lander.x + (Math.random() - 0.5) * 6,
            y: lander.y + 16,
            vx: -Math.sin(lander.angle) * 55 + (Math.random() - 0.5) * 18,
            vy: Math.cos(lander.angle) * 65 + Math.random() * 25,
            color: '#f97316',
            size: Math.random() * 3 + 1.8,
            alpha: 1,
            life: 0.32
          });
        }
      }

      // Moon Gravity
      lander.vy += 32 * dt;

      // Position update
      lander.x += lander.vx * dt;
      lander.y += lander.vy * dt;
      lander.vx *= Math.pow(0.998, dt * 60);

      // Boundaries
      if (lander.x < 18 || lander.x > W - 18) {
        lander.crashed = true;
        SoundFX.playExplosion();
        screenShake = 8;
        statusEl.textContent = 'Mission Failed: Spacecraft drifted outside designated landing corridor.';
      }

      // Orbital Fuel Canisters
      fuelPickups.forEach(fp => {
        if (!fp.collected && Math.hypot(lander.x - fp.x, lander.y - fp.y) < 26) {
          fp.collected = true;
          lander.fuel = Math.min(100, lander.fuel + 25);
          SoundFX.playCollect(2);
          addFloatingText(fp.x, fp.y, '+25% FUEL!', '#38bdf8');
          addSparks(fp.x, fp.y, 14, '#38bdf8', 75);
        }
      });

      // Ground Collision Check
      const groundY = terrainHeight(lander.x) - 24;

      // Ground effect dust storm
      if (groundY - lander.y < 60 && (keys.ArrowUp || keys.w || keys.W || keys.Space) && lander.fuel > 0) {
        for (let i = 0; i < 3; i++) {
          particles.push({
            x: lander.x + (Math.random() - 0.5) * 22,
            y: groundY + 20,
            vx: (Math.random() - 0.5) * 100,
            vy: -Math.random() * 25,
            color: '#94a3b8',
            size: Math.random() * 3.5 + 1.2,
            alpha: 0.75,
            life: 0.4
          });
        }
      }

      // Touchdown or Impact
      if (lander.y >= groundY) {
        lander.y = groundY;
        const safeOnPad = Math.abs(lander.x - pad.x) < pad.w / 2 - 8;
        const safeSpeed = Math.abs(lander.vy) <= 30 && Math.abs(lander.vx) <= 20;
        const safeAngle = Math.abs(lander.angle) <= 0.26;

        if (safeOnPad && safeSpeed && safeAngle) {
          lander.landed = true;
          lander.score = 100 + Math.round(lander.fuel);
          SoundFX.playVictory();
          setStep(3);
          statusEl.textContent = '★ TOUCHDOWN SUCCESS! The Eagle has landed at Tranquility Base. ★';
        } else {
          lander.crashed = true;
          SoundFX.playExplosion();
          screenShake = 10;
          addSparks(lander.x, lander.y, 35, '#f97316', 150);
          statusEl.textContent = 'Hard landing! Reduce descent speed and align upright over the landing pad.';
        }
      }
    }

    // Update Particles
    particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt / p.life;
    });
    particles = particles.filter(p => p.alpha > 0);

    floatingTexts.forEach(ft => {
      ft.y += ft.vy * dt;
      ft.alpha -= dt * 0.9;
    });
    floatingTexts = floatingTexts.filter(ft => ft.alpha > 0);

    // Update Telemetry Ribbon
    tVal1.textContent = formatTime(missionTimer);
    tVal2.textContent = `${Math.round(lander.fuel)}%`;
    tVal3.textContent = `${Math.abs(lander.vy).toFixed(1)} m/s`;
    tVal4.textContent = `${(lander.angle * (180 / Math.PI)).toFixed(0)}°`;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /* ==========================================================================
     MAIN GAME LOOP & DISPATCHER
     ========================================================================== */
  function gameLoop(timestamp) {
    if (!isRunning) return;
    const dt = Math.min(0.033, (timestamp - lastTime) / 1000 || 0.016);
    lastTime = timestamp;

    try {
      ctx.save();
      if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake;
        const sy = (Math.random() - 0.5) * screenShake;
        ctx.translate(sx, sy);
        screenShake = Math.max(0, screenShake - 16 * dt);
      }

      if (activeGame === 'rover') {
        updateRoverGame(dt);
        drawRoverGame();
      } else {
        updateLanderGame(dt);
        drawLanderGame();
      }
      ctx.restore();
    } catch (err) {
      console.error('Game error:', err);
    }

    rafId = requestAnimationFrame(gameLoop);
  }

  function syncControlHighlight() {
    controlsEl.querySelectorAll('button[data-key]').forEach(btn => {
      const k = btn.dataset.key;
      const pressed = keys[k] || (k === 'ArrowLeft' && (keys.a || keys.A)) ||
        (k === 'ArrowRight' && (keys.d || keys.D)) ||
        (k === 'ArrowUp' && (keys.w || keys.W)) ||
        (k === 'ArrowDown' && (keys.s || keys.S)) ||
        (k === 'Space' && keys[' ']);
      btn.classList.toggle('ba-key-pressed', !!pressed);
    });
  }

  function startGame(gameType) {
    activeGame = gameType;
    area.hidden = false;
    root.querySelector('.ba-arcade-cards').style.display = 'none';
    setStep(2);

    if (gameType === 'rover') {
      titleEl.textContent = 'Mars Rover: Jezero Sample Run';
      kickerEl.textContent = 'MARS SURFACE MISSION • 6-WHEEL SUSPENSION';
      instructionsEl.textContent =
        'Steer with ← / → or A / D. Drive with ↑ or W. Reverse with ↓ or S. Hold SPACE for Nitro Boost! Extract all 5 samples.';
      controlsEl.querySelector('[data-key="ArrowDown"]').style.display = 'inline-flex';
      const sp = controlsEl.querySelector('[data-key="Space"]');
      if (sp) {
        sp.style.display = 'inline-flex';
        sp.textContent = '⚡ NITRO BOOST (SPACE)';
      }
      controlsEl.querySelector('[data-key="ArrowUp"]').textContent = '▲ DRIVE';
      controlsEl.querySelector('[data-key="ArrowLeft"]').textContent = '◀ STEER LEFT';
      controlsEl.querySelector('[data-key="ArrowRight"]').textContent = 'STEER RIGHT ▶';
      helpEl.textContent = 'Keyboard: ← ↑ ↓ → or W-A-S-D • Space for Nitro Boost • Press R to restart';
      resetRover();
    } else {
      titleEl.textContent = 'Apollo Lunar Lander: Tranquility Touchdown';
      kickerEl.textContent = 'APOLLO 11 FLIGHT SIMULATION • LUNAR GRAVITY';
      instructionsEl.textContent =
        'Hold ↑ or W or SPACE for Main Engine Thrust. Tap ← / → or A / D for RCS Rotation. Intercept orbital fuel canisters and land softly on the green pad.';
      controlsEl.querySelector('[data-key="ArrowDown"]').style.display = 'none';
      const sp = controlsEl.querySelector('[data-key="Space"]');
      if (sp) {
        sp.style.display = 'inline-flex';
        sp.textContent = '🚀 MAIN THRUST (SPACE)';
      }
      controlsEl.querySelector('[data-key="ArrowUp"]').textContent = '▲ THRUST';
      controlsEl.querySelector('[data-key="ArrowLeft"]').textContent = '◀ RCS LEFT';
      controlsEl.querySelector('[data-key="ArrowRight"]').textContent = 'RCS RIGHT ▶';
      helpEl.textContent = 'Keyboard: W, ↑ or Space to thrust • A/D or ←/→ to rotate • Catch fuel cells • Press R to retry';
      resetLander();
    }

    isRunning = true;
    lastTime = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(gameLoop);
    area.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Canvas Click to Restart
  canvas.addEventListener('click', () => {
    SoundFX.init();
    if (activeGame === 'rover' && rover.completed) {
      resetRover();
      setStep(2);
    } else if (activeGame === 'lander' && (lander.landed || lander.crashed)) {
      resetLander();
      setStep(2);
    }
  });

  // Open Game Buttons
  root.querySelectorAll('[data-open-game]').forEach(btn => {
    btn.addEventListener('click', () => {
      SoundFX.init();
      setStep(1);
      startGame(btn.dataset.openGame);
    });
  });

  // Close Game Button
  document.getElementById('baGameClose').addEventListener('click', () => {
    isRunning = false;
    cancelAnimationFrame(rafId);
    keys = {};
    area.hidden = true;
    root.querySelector('.ba-arcade-cards').style.display = 'grid';
    setStep(1);
  });

  // Reset Mission Button
  document.getElementById('baGameReset').addEventListener('click', () => {
    SoundFX.init();
    if (activeGame === 'rover') resetRover();
    else resetLander();
    setStep(2);
  });

  // SFX Toggle Button
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      const isAudio = SoundFX.toggle();
      sfxToggleBtn.textContent = isAudio ? '🔊 SFX: ON' : '🔇 SFX: OFF';
    });
  }

  // Keyboard Event Handling
  const validKeys = [
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'a', 'A', 'd', 'D', 'w', 'W', 's', 'S',
    ' ', 'Space', 'r', 'R'
  ];

  document.addEventListener('keydown', e => {
    if (!area.hidden && validKeys.includes(e.key)) {
      e.preventDefault();
      SoundFX.init();
      if (e.key === 'r' || e.key === 'R') {
        if (activeGame === 'rover') resetRover();
        else resetLander();
        setStep(2);
        return;
      }
      const mapped =
        {
          a: 'ArrowLeft', A: 'ArrowLeft',
          d: 'ArrowRight', D: 'ArrowRight',
          w: 'ArrowUp', W: 'ArrowUp',
          s: 'ArrowDown', S: 'ArrowDown',
          ' ': 'Space'
        }[e.key] || e.key;
      keys[mapped] = true;
      syncControlHighlight();
    }
  });

  document.addEventListener('keyup', e => {
    const mapped =
      {
        a: 'ArrowLeft', A: 'ArrowLeft',
        d: 'ArrowRight', D: 'ArrowRight',
        w: 'ArrowUp', W: 'ArrowUp',
        s: 'ArrowDown', S: 'ArrowDown',
        ' ': 'Space'
      }[e.key] || e.key;
    keys[mapped] = false;
    syncControlHighlight();
  });

  // Touch & Pointer Controller Buttons
  controlsEl.querySelectorAll('[data-key]').forEach(btn => {
    const key = btn.dataset.key;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      SoundFX.init();
      keys[key] = true;
      btn.classList.add('ba-key-pressed');
      btn.setPointerCapture(e.pointerId);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'].forEach(ev => {
      btn.addEventListener(ev, () => {
        keys[key] = false;
        btn.classList.remove('ba-key-pressed');
      });
    });
  });

  // Initial draw preview
  resetRover();
  drawRoverGame();
})();
