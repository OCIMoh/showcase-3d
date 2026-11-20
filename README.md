# Showcase-3D — Studio & WebGL Portfolio

An award-winning interactive 3D WebGL portfolio replication inspired by **Showcase-3D's Portfolio** (as featured on Codrops).

---

## 🌟 Key Architecture & Capabilities

1. **Native WebGL 3D Cylindrical Reel (`src/engine/cylinder/engine.ts`):**
   - **Zero external 3D libraries** — pure, ultra-fast native WebGL shaders and math.
   - **32-segment curved cylinder quad meshes** conforming dynamically to a radius of 6.8 units with realistic barrel curvature.
   - **Delta-based infinite rotation loop** allowing endless fluid scrubbing in both directions without hard boundaries or jumps.
   - **Dual-card 50/50 centered resting alignment** with natural spring physics and velocity fling momentum.
   - **Dynamic UI Texture Compositing** using high-resolution offscreen HTML5 canvas compositors.
   - **Subtle harmonic Web Audio tick feedback** on carousel card transitions.

2. **Dedicated Standalone Project Pages (`src/views/ProjectView.ts`):**
   - Clicking any project card navigates directly to a dedicated showcase page (`/project/:slug`).
   - Rich technical metadata: Client / Repository, Year, Category, Performance Benchmark.
   - Full-width hero media display with live status badge.
   - Architectural and engineering highlights breakdown.
   - Technical stack tags.
   - Next / Previous project continuous navigation.

3. **Smooth SPA Router & Dark Page Transitions (`src/router/router.ts`):**
   - Client-side pushState SPA routing between Home (`/`) and Project Showcase (`/project/:slug`).
   - Seamless, dark sweep page transition (`#080808`) maintaining immersion.

4. **Interactive Studio About Modal:**
   - In-situ bio, technical disciplines, open-source repositories, and GitHub/social links accessible from the top-right "About" trigger.

---

## 🚀 Getting Started

### 1. Development Server
```bash
npm run dev
```
Starts the Vite dev server with instant Hot Module Replacement (HMR).

### 2. Production Build
```bash
npm run build
```
Type-checks TypeScript and compiles a minified, high-performance production bundle in `dist/`.

### 3. Local Preview
```bash
npm run preview
```
Previews the production build locally.
