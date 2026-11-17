# Agrumêa Farm Template (Vite + TypeScript)

An Awwwards-caliber website template replicating the physics, interactive momentum carousel, 3D cylindrical canvas projection, and kinetic sweep transitions of **Agrumêa Farm** (by Studio K95, winner of Awwwards Site of the Day and Developer Award).

Populated with **curated stock assets** (Unsplash commercial-safe photography) and **editorial Latin/Italian placeholder copy**.

---

## 🌟 Key Features

1. **2D Rigid-Body Fruit Physics Engine (`src/engine/physics.ts`):**
   - Impulse-based kinematics modeling gravity, mass, friction, and restitution.
   - Low elasticity ($0.32$) for natural organic fruit settling.
   - Pointer dragging, velocity throwing, and radial explosive blast on click.
   - Header toggle button (`🍋 Fruit Physics`) to trigger the fruit sandbox anytime.

2. **Straight Horizontal & Angled Marquee Carousel (`src/engine/carousel.ts`):**
   - Decoupled LERP momentum accumulator:
     $$\text{currentX} \mathrel{+}= (\text{targetX} - \text{currentX}) \times 0.085$$
   - Infinite closed-modulo wrap-around track.
   - **3D Cylindrical Label Canvas Projection:** Each jar renders an HTML5 `<canvas>` that projects the label using horizontal sinusoidal UV compression and bilateral ambient occlusion shadows as the jar rotates in real time.
   - Synchronized rotating typographic seal badge (`#sliderBadge`).
   - Multiplane mouse parallax depth.

3. **Virtual Smooth Scrolling & Magnetic Cursor:**
   - Powered by **Lenis** smooth scroll.
   - Contextual pill cursor adapting to hover targets (`DRAG`, `DISCOVER`, `CLICK`, `EXPLORE`).

4. **Lightweight SPA Router (`src/router/router.ts`):**
   - Client-side navigation with Studio K95's signature orange sweep wipe transition (`--ease-don-expo`).
   - Pre-configured routes:
     - `/` — Hero Carousel & Fruit Physics Loader
     - `/dispensa` — Filterable Pantry Grid
     - `/dispensa/:slug` — Product Detail & Ingredients Showcase
     - `/produzione` — Heritage & Craft Process
     - `/experience` — Orchard Tasting & Workshops
     - `/chi-siamo` — Generational Story
     - `/contatti` — Minimalist Contact Page & Sicilian Live Clock

---

## 🚀 Getting Started

### 1. Development Server
```bash
npm run dev
```
Starts Vite dev server at `http://localhost:3000` with instant Hot Module Replacement (HMR).

### 2. Production Build
```bash
npm run build
```
Type-checks TypeScript and compiles an optimized, minified production bundle in `dist/` (~17.2 kB gzipped total).

### 3. Local Preview
```bash
npm run preview
```

---

## 📁 Project Structure

```text
├── index.html                  # Main HTML shell
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── src/
│   ├── main.ts                 # Bootstrap router, cursor, scroll
│   ├── style/
│   │   ├── variables.css       # Studio K95 colors, eases, tokens
│   │   ├── reset.css           # Modern CSS reset
│   │   ├── cursor.css          # Magnetic pill cursor
│   │   ├── transitions.css     # Sweep wipe panel animations
│   │   └── main.css            # Component & layout styles
│   ├── data/
│   │   ├── products.ts         # Stock product catalog & Unsplash URLs
│   │   └── navigation.ts       # Navigation routes
│   ├── engine/
│   │   ├── physics.ts          # 2D rigid-body fruit physics engine
│   │   ├── carousel.ts         # Marquee carousel & cylindrical canvas projection
│   │   ├── scroll.ts           # Lenis virtual smooth scroll
│   │   └── cursor.ts           # Contextual magnetic cursor
│   ├── router/
│   │   └── router.ts           # SPA router with page transitions
│   └── views/
│       ├── HomeView.ts         # Home view
│       ├── CatalogView.ts      # Catalog grid with category filter
│       ├── ProductDetailView.ts# Product detail view
│       ├── StoryView.ts        # Heritage & production timeline
│       └── ContactView.ts      # Contact view with live CET clock
└── dist/                       # Compiled production build
```
