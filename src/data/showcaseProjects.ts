/**
 * OCIMoh Creative Studio — Showcase Projects Dataset
 * Award-winning website portfolio case studies from OCIMoh GitHub Organization
 */

export interface ShowcaseProject {
  id: string;
  slug: string;
  name: string;
  title: string;
  client: string;
  year: string;
  category: string;
  description: string;
  highlights: string[];
  techStack: string[];
  metrics: string;
  liveUrl: string;
  githubUrl: string;
  previewImageUrl: string;
  color: string;           // Signature accent color (cyan, amber, neon green, magenta)
  isLive: boolean;
}

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'touche-keyboard',
    slug: 'touche-keyboard',
    name: 'touche-keyboard',
    title: 'Touché — Custom 3D Mechanical Keyboard',
    client: 'Touché Hardware Lab',
    year: '2026',
    category: '3D HARDWARE SHOWCASE',
    description: 'Immersive 3D mechanical keyboard configurator and scroll experience with real-time switch mechanics, tactile keycap customization, and acoustic haptic feedback.',
    highlights: [
      'Interactive 3D exploded view of keyboard chassis, PCB, plate, and mechanical switches',
      'Real-time sound synthesizer simulating mechanical switch sound profiles (linear, tactile, clicky)',
      'Custom PBR metal, brass weight, and frosted polycarbonate materials'
    ],
    techStack: ['Three.js', 'TypeScript', 'WebGL 2.0', 'GLSL Shaders', 'Web Audio API'],
    metrics: '60fps WebGL · Real-time PBR · Spatial Audio',
    liveUrl: 'https://github.com/OCIMoh/touche-keyboard',
    githubUrl: 'https://github.com/OCIMoh/touche-keyboard',
    previewImageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
    color: '#00d2ff',
    isLive: false
  },
  {
    id: 'lumina-coffee',
    slug: 'lumina-coffee',
    name: 'lumina-coffee',
    title: 'Lumina Coffee — Scrollytelling Experience',
    client: 'Lumina Artisanal Roasters',
    year: '2026',
    category: '3D SCROLLYTELLING',
    description: 'Cinematic vertical scrollytelling journey following single-origin Ethiopian coffee beans from volcanic soil harvesting to copper flame drum roasting.',
    highlights: [
      'Continuous parallax scroll narrative with synchronized camera dolly sequences',
      'Dynamic flavor profile radar chart and olfactory notes breakdown',
      'Sub-second first contentful paint and responsive mobile storytelling'
    ],
    techStack: ['TypeScript', 'Canvas API', 'Scrollytelling', 'CSS3D', 'Vite'],
    metrics: '100 Lighthouse Performance · Butter Scroll',
    liveUrl: 'https://github.com/OCIMoh/lumina-coffee',
    githubUrl: 'https://github.com/OCIMoh/lumina-coffee',
    previewImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    color: '#e58a32',
    isLive: false
  },
  {
    id: 'koi-fish-3d',
    slug: 'koi-fish-3d',
    name: 'koi-fish-3d',
    title: 'Nishikigoi — Interactive 3D Fluid Simulation',
    client: 'Creative R&D Lab',
    year: '2026',
    category: 'WEBGL SIMULATION',
    description: 'High-performance interactive 3D Koi fish pond simulation featuring organic boid flocking behavior, procedural fin deformation, and real-time cursor ripple shaders.',
    highlights: [
      'Procedural skeletal animation mimicking biological fish locomotion',
      'Interactive caustics light projection and water refraction shaders',
      'Spatial food-feeding attraction physics triggered by pointer gestures'
    ],
    techStack: ['Three.js', 'WebGL', 'GLSL Vertex Shaders', 'TypeScript', 'Math Physics'],
    metrics: '120fps GPU · Procedural Kinematics',
    liveUrl: 'https://github.com/OCIMoh/koi-fish-3d',
    githubUrl: 'https://github.com/OCIMoh/koi-fish-3d',
    previewImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    color: '#ff3d00',
    isLive: false
  },
  {
    id: 'universal-college',
    slug: 'universal-college',
    name: 'universal-college',
    title: 'Universal College — Institutional Portal',
    client: 'Universal College Patran',
    year: '2026',
    category: 'CAMPUS DIGITAL PLATFORM',
    description: 'Modern, high-trust institutional portal for Universal College Patran with interactive academic department directories, admissions pipeline, and virtual campus tours.',
    highlights: [
      'Comprehensive academic course registry with dynamic qualification filters',
      'Direct online student inquiry and prospect onboarding system',
      'Production-deployed on Vercel with instant edge caching'
    ],
    techStack: ['TypeScript', 'Next.js', 'TailwindCSS', 'Vercel Edge', 'Responsive UI'],
    metrics: 'Production Live · 500+ Daily Students',
    liveUrl: 'https://universal-college-patran.vercel.app/',
    githubUrl: 'https://github.com/OCIMoh/universal-college',
    previewImageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    color: '#3b82f6',
    isLive: true
  },
  {
    id: 'jimmy-oye',
    slug: 'jimmy-oye',
    name: 'jimmy-oye',
    title: 'Jimmy Oye — Creative Portfolio & Audio',
    client: 'Jimmy Oye Music & Media',
    year: '2026',
    category: 'CREATIVE DEVELOPER PORTFOLIO',
    description: 'High-energy personal creative portfolio with kinetic typography, custom soundboard playback, and micro-interactive cursor physics.',
    highlights: [
      'Interactive music stem player with frequency visualizer spectrum',
      'Smooth scroll transitions with dynamic color palette morphing',
      'Live deployed on Vercel with automated CI/CD pipeline'
    ],
    techStack: ['TypeScript', 'React', 'Framer Motion', 'Web Audio API', 'Vercel'],
    metrics: 'Production Live · Audio-Reactive UI',
    liveUrl: 'https://jimmy-oye.vercel.app',
    githubUrl: 'https://github.com/OCIMoh/jimmy-oye',
    previewImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    color: '#a855f7',
    isLive: true
  },
  {
    id: 'adieu-perfume',
    slug: 'adieu-perfume',
    name: 'adieu-perfume',
    title: 'Adieu Parfums — Haute Parfumerie',
    client: 'Maison Adieu Paris',
    year: '2026',
    category: 'LUXURY E-COMMERCE',
    description: 'Monastic minimalist luxury digital showcase for artisanal niche fragrances with olfactory scent pyramid breakdowns and bespoke glass bottle presentation.',
    highlights: [
      'Full-bleed black obsidian aesthetic inspired by high-fashion Parisian ateliers',
      'Olfactory notes navigation: Top, Heart, and Base note accord reveals',
      'Bespoke micro-typography and silky mouse-following ambient lens'
    ],
    techStack: ['CSS Architecture', 'Vanilla JavaScript', 'SVG Micro-Interactions', 'WebGL'],
    metrics: 'Quiet Luxury · Monastic Aesthetics',
    liveUrl: 'https://github.com/OCIMoh/adieu-perfume',
    githubUrl: 'https://github.com/OCIMoh/adieu-perfume',
    previewImageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
    color: '#e2d8ce',
    isLive: false
  },
  {
    id: 'amit-tandon',
    slug: 'amit-tandon',
    name: 'amit-tandon',
    title: 'Amit Tandon — Executive Showcase',
    client: 'Amit Tandon',
    year: '2026',
    category: 'EXECUTIVE PORTFOLIO',
    description: 'Polished corporate leadership portfolio showcasing public speaking keynotes, advisory ventures, and media broadcast appearances with editorial clarity.',
    highlights: [
      'High-contrast editorial typography with fluid layout transitions',
      'Curated video gallery of television and podcast keynote appearances',
      'Production-deployed on Vercel with sub-second page delivery'
    ],
    techStack: ['CSS3', 'Modern JavaScript', 'Vercel Edge', 'Responsive Design'],
    metrics: 'Production Live · Executive Grade',
    liveUrl: 'https://amit-tandon.vercel.app',
    githubUrl: 'https://github.com/OCIMoh/amit-tandon',
    previewImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    color: '#f59e0b',
    isLive: true
  },
  {
    id: 'wraith',
    slug: 'wraith',
    name: 'wraith',
    title: 'Project Wraith — Dark Mode Cyber Suite',
    client: 'Internal Design Lab',
    year: '2026',
    category: 'CYBERNETIC UI SYSTEM',
    description: 'Experimental dark mode design system and UI framework built for next-generation developer tooling, glowing telemetry consoles, and low-latency workstations.',
    highlights: [
      'High-contrast darkroom obsidian palette with neon cyan and lime status telemetry',
      'Zero-dependency hardware-accelerated CSS and Canvas component library',
      'Modular dashboard layouts designed for ultra-dense data display'
    ],
    techStack: ['CSS Systems', 'Custom Canvas Shaders', 'TypeScript', 'Hardware Compositing'],
    metrics: 'Sub-millisecond Render · Dark Cyberpunk',
    liveUrl: 'https://github.com/OCIMoh/wraith',
    githubUrl: 'https://github.com/OCIMoh/wraith',
    previewImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    color: '#10b981',
    isLive: false
  },
  {
    id: 'amc-journey',
    slug: 'amc-journey',
    name: 'amc-journey',
    title: 'AMC Pet Hospital — Care Journey',
    client: 'Animal Medical Care Mohali',
    year: '2026',
    category: 'VETERINARY HEALTHCARE',
    description: 'Compassionate, high-trust veterinary hospital web application featuring step-by-step patient care timelines, digital medical appointments, and surgeon credentials.',
    highlights: [
      'Interactive pet recovery timeline guiding owners through post-op milestones',
      'Emergency 24/7 hotline triage launcher with geographic clinic routing',
      'Accessibility-first typography designed for high-stress medical environments'
    ],
    techStack: ['TypeScript', 'TailwindCSS', 'Form Validation API', 'Responsive UI'],
    metrics: 'WCAG 2.1 AA Compliant · High Trust UI',
    liveUrl: 'https://github.com/OCIMoh/amc-journey',
    githubUrl: 'https://github.com/OCIMoh/amc-journey',
    previewImageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    color: '#06b6d4',
    isLive: false
  },
  {
    id: 'boosit-showcase-poc-1',
    slug: 'boosit-showcase-poc-1',
    name: 'boosit-showcase-poc-1',
    title: 'BoostIt — Growth Engine Landing Experience',
    client: 'BoostIt SaaS Inc.',
    year: '2026',
    category: 'SAAS PRODUCT LAUNCH',
    description: 'Conversion-engineered SaaS marketing experience featuring dynamic ROI projections, animated product feature walkthroughs, and social proof benchmarks.',
    highlights: [
      'Interactive growth multiplier slider showing expected revenue lift in real time',
      'Clean modular pricing matrix with billing cycle toggles and feature tooltips',
      'Engineered for maximum signup funnel velocity and micro-conversion'
    ],
    techStack: ['HTML5', 'CSS Grid', 'JavaScript Kinetic Motion', 'Responsive'],
    metrics: '+42% Funnel Velocity · SaaS Benchmark',
    liveUrl: 'https://github.com/OCIMoh/boosit-showcase-poc-1',
    githubUrl: 'https://github.com/OCIMoh/boosit-showcase-poc-1',
    previewImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    color: '#ec4899',
    isLive: false
  },
  {
    id: 'varun-sir-portfolio',
    slug: 'varun-sir-portfolio',
    name: 'varun-sir-portfolio',
    title: 'Varun Tech Portfolio — Engineering Leadership',
    client: 'Varun Engineering',
    year: '2026',
    category: 'TECH LEADERSHIP PORTFOLIO',
    description: 'Personal tech portfolio showcasing full-stack engineering architecture, software engineering curriculum design, and mentorship milestones.',
    highlights: [
      'Interactive skill matrix and engineering stack proficiency indicators',
      'Curriculum repository showcasing real-world full-stack student project codebases',
      'Clean developer dark aesthetics with rapid markdown documentation viewer'
    ],
    techStack: ['TypeScript', 'Next.js', 'Markdown Parser', 'TailwindCSS'],
    metrics: 'Developer Focused · Clean Tech',
    liveUrl: 'https://github.com/OCIMoh/varun-sir-portfolio',
    githubUrl: 'https://github.com/OCIMoh/varun-sir-portfolio',
    previewImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    color: '#6366f1',
    isLive: false
  }
];

