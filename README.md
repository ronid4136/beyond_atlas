# 🚀 BEYOND ATLAS — Left Behind, Not Forgotten
### NASA Space Apps Challenge · Global Entry · Team AstroForge

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nasa--beyond--atlas.vercel.app-00dfa2.svg)](https://nasa-beyond-atlas.vercel.app/)
[![NASA Space Apps](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge-blue.svg)](https://www.spaceappschallenge.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black.svg)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-red.svg)](https://www.khronos.org/webgl/)

🌐 **Live Application:** [https://nasa-beyond-atlas.vercel.app](https://nasa-beyond-atlas.vercel.app)

> **"Left Behind, Not Forgotten"** — An interactive 3D planetary exploration platform commemorating the legendary rovers, landers, and scientific hardware humanity has deployed across the Moon, Mars, and deep space. Built by **Team AstroForge** for the **NASA Space Apps Challenge**.

---

## 🌟 Overview

**Beyond Atlas** is an immersive, accessible web platform that brings human exploration history to life. Designed for STEM students, researchers, and global space enthusiasts, the platform bridges real NASA open science data with real-time 3D graphics, physics-driven flight simulations, and bilingual voice-guided accessibility (English & Bengali).

---

## ✨ Key Features

### 🪐 1. Interactive 3D Celestial Globes
- **Three.js Powered Stages:** High-fidelity interactive 3D globes of **Earth**, the **Moon**, and **Mars** rendered with realistic photographic textures, atmospheric scattering, and starfield backgrounds.
- **Full Touch & Mouse Controls:** Smooth orbital rotation, panning, dynamic zoom, and inertia.

### 🛰️ 2. Official NASA 3D Hardware Models
- **Real NASA 3D Models:** Embedded official GLB/GLTF models (including the **Apollo 11 Lunar Module** and **Mars 2020 Perseverance Rover**) using Google `<model-viewer>`.
- **Interactive Component Hotspots:** Click on hardware parts (cameras, robotic arms, antennas, RTG power units) to inspect their purpose, engineering specs, and science payloads.

### 🚙 3. 3D Mars Rover Driving Simulator
- Drive a 3D rover across realistic Martian terrain right in the browser.
- Real-time physics, wheel articulation, obstacle navigation, and dynamic camera angles.
- Responsive on-screen touch controls for mobile devices and keyboard controls for desktop.

### 🕹️ 4. Arcade Lunar Lander & Rover Mini-Games
- **Lunar Lander Game:** Vector arcade physics simulation where players manage thrusters, velocity, and fuel to safely land on the Moon.
- **Rover Obstacle Run:** Navigate craters and boulder fields while collecting scientific samples.

### 🎙️ 5. Voice Narration Assistant
- Built-in speech synthesis using the **Web Speech API** that narrates hardware profiles, mission stories, and scientific discoveries.
- Audio toggle and language selection for universal accessibility.

### 🔭 6. NASA Open Data & APOD Integration
- Official **NASA Astronomy Picture of the Day (APOD)** dynamic integration.
- Telemetry telemetry counters and live mission distance calculators.
- Searchable hardware catalog with instant search, filters, and rich modal dossiers.

### 🧠 7. Astronaut Knowledge Quiz & Mission Timeline
- Test space exploration knowledge with interactive multi-question quizzes and instant scoring.
- Chronological timeline tracking humanity's planetary missions from Apollo to Artemis.

---

## 📂 Project Structure

```
NASA-project/
├── index.html                  # Main application entry point (Clean semantic HTML5)
│
├── css/                        # Modular, organized stylesheets
│   ├── styles.css              # Master stylesheet bundle (@import)
│   ├── base.css                # Typography, CSS variables, resets, layout grid
│   ├── components.css          # Modals, telemetry, quiz, timeline, search bar
│   ├── planets.css             # 3D planet stages, celestial cards, WebGL views
│   ├── games.css               # 3D Rover simulator and arcade game UI
│   └── theme-override.css      # Visual polish, Mars photographic theme, hero layout
│
├── js/                         # Modular JavaScript application architecture
│   ├── main.js                 # Master state, voice audio, catalog, quiz, NASA API
│   ├── hero-planet.js          # Interactive Three.js Mars globe in hero section
│   ├── planet-viewer.js        # 3D WebGL Moon & Mars stages
│   ├── shared-planet-engine.js # Shared 3D Three.js engine for celestial bodies
│   ├── hardware-lab.js         # Hardware exploration lab & model viewer inspector
│   ├── rover-sim.js            # 3D Mars Rover simulation engine & controls
│   └── arcade-games.js         # 2D Lunar Lander & Rover arcade mini-games
│
├── assets/                     # Media assets (extracted from embedded base64)
│   ├── images/                 # Mars panoramas, hardware photos, planet stages
│   └── videos/                 # Mission video clips (MP4)
│
├── .gitignore                  # Git ignore rules for clean repository
├── vercel.json                 # Vercel deployment configuration
└── README.md                   # Project documentation
```

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla Modern JavaScript (ES6+)
- **3D Graphics & Rendering:** [Three.js](https://threejs.org/) (r128), WebGL, Google [`<model-viewer>`](https://modelviewer.dev/)
- **Data & APIs:** NASA Open APIs (APOD, NASA 3D Resources, Images API)
- **Audio:** Web Speech API (`SpeechSynthesis`)
- **Typography:** Orbitron, Inter, Space Grotesk (Google Fonts)

---

## 🚀 Getting Started

### Prerequisites
You only need a modern web browser (Chrome, Edge, Firefox, Safari) and an HTTP server.

### Local Development

Because 3D models and textures require CORS permissions, run the project with a local HTTP server:

#### Option A: Using Node.js / npx
```bash
npx serve .
```

#### Option B: Using Python
```bash
# Python 3
python -m http.server 8000
```
Open `http://localhost:8000` in your browser.

#### Option C: Using VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 🌐 Deployment

### GitHub Pages
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Modularized Beyond Atlas project"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```
2. Go to **Settings > Pages** on your GitHub repository.
3. Under **Branch**, select `main` and root `/`, then click **Save**.
4. Your site will be live in seconds!

### Vercel
The project includes a `vercel.json` configuration file. You can deploy instantly by connecting your GitHub repo to [Vercel](https://vercel.com/) or by running:
```bash
npx vercel
```

---

## 👥 Contributors & Acknowledgments

- **NASA Space Apps Challenge**
- **NASA Open Data** & **NASA 3D Resources**
- Built with dedication for space science, planetary history, and future explorers.

---

*“To explore is to become human.”* 🌌

