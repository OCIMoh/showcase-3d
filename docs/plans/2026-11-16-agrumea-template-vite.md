# Agrumêa Farm Template (Vite + TS) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-grade, reusable Awwwards-caliber website template replicating the interactive physics, angled/horizontal momentum carousel, 3D cylindrical canvas projection, and kinetic transitions of Agrumêa Farm, populated with stock data (Lorem Ipsum copy and Unsplash stock assets) using Vite and TypeScript.

**Architecture:** A lightweight client-side application built with Vite, TypeScript, and a hash/history SPA router. It features a custom 2D rigid-body Verlet physics engine, a decoupled LERP momentum marquee carousel with dynamic Canvas 2D label wrapping, GSAP timeline choreography, Lenis virtual smooth scroll, and Studio K95-inspired sweep transitions.

**Tech Stack:**
- **Bundler & Dev Server:** Vite 6
- **Language:** TypeScript 5.x
- **Animation Choreography:** GSAP 3.x
- **Smooth Scrolling:** Lenis (`lenis`)
- **Physics & Shaders:** Self-contained TypeScript 2D Rigid-Body Engine & HTML5 Canvas 2D Projection
- **Icons & Assets:** Lucide Icons & Unsplash Dynamic Image CDN
- **Routing:** Lightweight SPA Router (Zero-dependency Client Router)

---

## 🗺️ Routes & Content Structure

| Route | Page | Key Animations & Interactions | Stock Content / Mock Data |
| :--- | :--- | :--- | :--- |
| `/` | **Home** | - Fruit Physics Loader with 0–100% counter & explosion blast<br>- Studio K95 orange sweep panel wipe<br>- Straight / Angled Marquee Carousel with rotating seal badge<br>- Mouse parallax & magnetic pill cursor | **Hero:** *"Artisanal Heritage & Botanical Alchemy"*<br>**Intro:** 2-paragraph editorial Lorem Ipsum<br>**Products:** 8 stock jars (Pesto, Marmalade, Honey, Berry, etc.) |
| `/dispensa` | **Pantry / Catalog** | - Filter tabs with smooth FLIP layout transitions<br>- Grid cards with 3D hover jar lift & shadow bloom<br>- Quick-view slide-in drawer | **Categories:** Savory, Sweet Preserves, Spreads, Pure Oils<br>**Items:** 12 stock preserves with prices, origins, weights |
| `/dispensa/:id` | **Product Detail** | - Interactive 3D Jar inspector (drag to rotate cylinder 360°)<br>- Nutrition spec accordion<br>- Sticky ATC bar | **Title:** e.g., *"Confitura Nobilitatis"*<br>**Meta:** 210g, Organic, Harvest 2026<br>**Story:** Editorial culinary notes & ingredients list |
| `/produzione` | **Process & Heritage** | - Lenis scroll-linked parallax timeline<br>- Full-bleed image reveals with scrubbed scale-down<br>- Split-text character reveals (`chars`) | **Steps:** 01. Solar Harvest, 02. Copper Boiling, 03. Hand Sealing, 04. Zero Waste |
| `/experience` | **Workshops & Visits** | - Interactive date picker & booking form<br>- Floating image cards following cursor | **Tours:** Orchard Tasting Tour, Masterclass Confiture<br>**Form:** Guest count, dietary preferences, booking CTA |
| `/chi-siamo` | **About Us** | - Split-screen asymmetric editorial scroll<br>- Metric counters (100% Organic, 140 Hectares, 1892 Estate) | **Story:** Multigenerational agricultural heritage statement |
| `/contatti` | **Contact** | - Minimalist typography contact form<br>- Interactive office card with live Sicilian local time | **Offices:** Catania HQ, Floridia Estate<br>**Fields:** Name, Email, Inquiry Type, Message |

---

## 📁 Repository Directory Structure

```text
testing/
├── index.html                  # Shell HTML template with preloads
├── package.json                # Vite + TypeScript + GSAP + Lenis
├── tsconfig.json               # Modern TS config with strict typing
├── vite.config.ts              # Vite configuration
├── public/
│   ├── favicon.svg
│   └── site.webmanifest
└── src/
    ├── main.ts                 # App bootstrap, router initialization, global cursor
    ├── style/
    │   ├── variables.css       # Studio K95 colors, eases, and typography variables
    │   ├── reset.css           # Modern CSS reset & isolation
    │   ├── cursor.css          # Custom magnetic pill cursor styles
    │   ├── transitions.css     # Sweep panel & page wipe animations
    │   └── main.css            # Component and layout styling
    ├── data/
    │   ├── products.ts         # Stock products catalog with Unsplash images
    │   └── navigation.ts       # Route definitions and metadata
    ├── engine/
    │   ├── physics.ts          # 2D Rigid-Body Verlet engine (fruits/objects)
    │   ├── carousel.ts         # Modulo infinite track + 3D cylindrical label projection
    │   ├── scroll.ts           # Lenis smooth scroll manager
    │   └── cursor.ts           # Contextual magnetic cursor controller
    ├── router/
    │   └── router.ts           # Lightweight SPA router with sweep transitions
    └── views/
        ├── HomeView.ts         # Hero carousel + physics loader
        ├── CatalogView.ts      # Filterable pantry catalog grid
        ├── ProductDetailView.ts# 3D interactive jar inspector
        ├── StoryView.ts        # Heritage / Produzione scroll journey
        └── ContactView.ts      # Contact page & form
```

---

## 🛠️ Step-by-Step Implementation Tasks

### Task 1: Project Initialization & Tooling
**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`

**Step 1: Write `package.json`**
Dependencies: `gsap`, `lenis`, `lucide`. DevDependencies: `vite`, `typescript`.

**Step 2: Install dependencies**
Run: `npm install`
Expected: Packages installed successfully in `node_modules`.

**Step 3: Verify Vite dev server runs**
Run: `npx vite --port 3000`
Expected: Vite server starts instantly on port 3000.

---

### Task 2: Design Tokens & Typography System
**Files:**
- Create: `src/style/variables.css`
- Create: `src/style/reset.css`
- Create: `src/style/cursor.css`
- Create: `src/style/transitions.css`
- Create: `src/style/main.css`

**Step 1: Define Studio K95 tokens**
Colors:
- `--color-terracotta: #e94e1b`
- `--color-parchment: #fdf3eb`
- `--color-burgundy: #762530`
- `--color-citrus: #f39200`
- `--color-ink: #261612`

Easing:
- `--ease-don-expo: cubic-bezier(0.19, 1, 0.22, 1)`
- `--ease-premium: cubic-bezier(0.645, 0.045, 0.355, 1)`
- `--ease-soft: cubic-bezier(0.22, 1, 0.36, 1)`

---

### Task 3: Mock Data Catalog (Stock Preserves & Content)
**Files:**
- Create: `src/data/products.ts`
- Create: `src/data/navigation.ts`

**Step 1: Write `src/data/products.ts`**
Create an array of 12 artisanal stock products using Unsplash high-resolution URLs with:
- `id`, `slug`, `title`, `latinSubtitle`, `category`, `price`, `weight`, `origin`, `description`
- `labelColor`, `textColor`, `foilColor`
- `jarImage`, `textureImage`

---

### Task 4: 2D Rigid-Body Fruit Physics Engine (`src/engine/physics.ts`)
**Files:**
- Create: `src/engine/physics.ts`

**Step 1: Implement rigid-body class in TypeScript**
- Continuous gravity stream & collision boundaries.
- Low restitution ($0.32$) & high friction ($0.94$).
- Pointer drag & velocity throw.
- Radial impulse blast on click: $\vec{F} = \frac{k}{d^2}\vec{u}$.
- Canvas rendering pipeline with stylized botanic fruit geometries.

---

### Task 5: Straight / Angled Carousel & 3D Cylindrical Label Engine (`src/engine/carousel.ts`)
**Files:**
- Create: `src/engine/carousel.ts`

**Step 1: Implement LERP momentum accumulator**
- Continuous RAF loop: `currentX += (targetX - currentX) * 0.085`.
- Closed modulo track wrapping: `((x % trackWidth) + trackWidth) % trackWidth`.
- Real-time cylindrical projection onto HTML5 `<canvas>` with horizontal sinusoidal compression & bilateral shading.
- Support toggle between straight horizontal (`0deg`) and signature angled (`10deg`).
- 1:1 mathematical coupling with background rotating typographic seal badge.

---

### Task 6: Virtual Smooth Scroll & Global Magnetic Cursor
**Files:**
- Create: `src/engine/scroll.ts`
- Create: `src/engine/cursor.ts`

**Step 1: Setup Lenis integration**
- Configure Lenis with touch multiplier and ease curve.
- Bind GSAP ScrollTrigger to Lenis scroll updates.

**Step 2: Contextual Pill Cursor**
- Mouse follow with inertia lag.
- Contextual state changes: `DRAG`, `DISCOVER`, `EXPLORE`, `VIEW`, `CLICK`.

---

### Task 7: Lightweight SPA Router & Page Transitions (`src/router/router.ts`)
**Files:**
- Create: `src/router/router.ts`

**Step 1: Build client-side router**
- Supports routes: `/`, `/dispensa`, `/dispensa/:id`, `/produzione`, `/experience`, `/chi-siamo`, `/contatti`.
- Executes Studio K95 sweep wipe animation between route changes.
- Updates page document title and scroll position.

---

### Task 8: View Implementations
**Files:**
- Create: `src/views/HomeView.ts`
- Create: `src/views/CatalogView.ts`
- Create: `src/views/ProductDetailView.ts`
- Create: `src/views/StoryView.ts`
- Create: `src/views/ContactView.ts`

**Step 1: Build `HomeView.ts`**
- Mounts physics loader on first load (0% to 100%).
- Mounts marquee carousel with 3D label projection.
- Mounts brand heritage introduction.

**Step 2: Build `CatalogView.ts`**
- Interactive filter buttons (All, Savory, Sweet, Spreads).
- Responsive grid of jars with card hover lift and shadow bloom.

**Step 3: Build `ProductDetailView.ts`**
- 360° cylindrical jar drag inspection.
- Specifications, ingredients list, and cart checkout button.

---

### Task 9: Verification & Production Build
**Step 1: Run TypeScript compiler check**
Command: `npx tsc --noEmit`
Expected: 0 errors.

**Step 2: Run Vite production build**
Command: `npm run build`
Expected: Output in `dist/` with clean assets.

---

## 🚀 Execution Choice

Two options are available to proceed:

1. **Subagent-Driven (in this session)**: We dispatch subagents to implement tasks step-by-step with testing between each task.
2. **Parallel Session (new session)**: Open a fresh dedicated session with `executing-plans` to execute the full checklist autonomously.

