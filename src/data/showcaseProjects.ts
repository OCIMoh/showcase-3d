/**
 * Projects Dataset for Mathias Adolfsson '26 Portfolio Carousel
 * Powered strictly by `projects.json`
 */

import rawProjects from './projects.json';

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
  galleryImages: string[];
  color: string;           // Signature accent color
  isLive: boolean;
}

interface RepoMetadata {
  title: string;
  category: string;
  description: string;
  highlights: string[];
  techStack: string[];
  metrics: string;
  previewImageUrl: string;
  galleryImages: string[];
  color: string;
}

// Curated aesthetic metadata mapped strictly to the repos in repo.json
const REPO_METADATA_MAP: Record<string, RepoMetadata> = {
  'varun-sir-portfolio': {
    title: 'Varun Sir Portfolio — Creative Portfolio',
    category: 'PORTFOLIO & CREATIVE ENGINEERING',
    description: 'Personal showcase and digital portfolio website built with modern fluid layouts and interactive micro-interactions.',
    highlights: [
      'Full-bleed editorial layout with kinetic typography',
      'Fluid state transitions and interactive micro-animations',
      'Ultra-responsive mobile-first viewport scaling'
    ],
    techStack: ['TypeScript', 'Next.js', 'Tailwind CSS', 'WebGL', 'Vercel'],
    metrics: 'Creative Portfolio · 60 FPS',
    previewImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
    ],
    color: '#e5dacf'
  },
  'touche-keyboard': {
    title: 'Touché — Custom 3D Mechanical Keyboard',
    category: '3D HARDWARE SHOWCASE',
    description: '3-d scroll website for a keyboard company showcase with interactive exploded views and acoustic switch mechanics.',
    highlights: [
      'Interactive 3D exploded view of chassis, PCB, plate, and mechanical switches',
      'Real-time sound synthesizer simulating switch acoustics',
      'High-performance 60 FPS WebGL shader pipeline'
    ],
    techStack: ['TypeScript', 'Three.js', 'WebGL', 'GLSL Shaders', 'Web Audio API'],
    metrics: 'Production Live · Real-time 3D Explosion',
    previewImageUrl: '/touche-1.png',
    galleryImages: [
      '/touche-1.png',
      '/touche-2.png',
      '/touche-3.png'
    ],
    color: '#00e5ff'
  },
  'lumina-coffee': {
    title: 'Lumina Coffee — 3D Scrollytelling',
    category: 'BEVERAGE & SCROLLYTELLING',
    description: '3-d scrollytelling coffee website tracking the artisanal bean journey from volcanic soil to pour-over.',
    highlights: [
      'Kinetic scrollytelling with real-time canvas steam particles',
      'Ambient atmospheric lighting and aroma visualization',
      'Interactive roast profile navigator'
    ],
    techStack: ['HTML', 'CSS Architecture', 'JavaScript', '3D Canvas', 'GSAP'],
    metrics: 'Kinetic Scrollytelling · Ambient Atmosphere',
    previewImageUrl: '/lumina-2.png',
    galleryImages: [
      '/lumina-2.png',
      '/lumina-1.png'
    ],
    color: '#d4a373'
  },
  'amc-journey': {
    title: 'AMC Journey — Mohali Pet Clinic',
    category: 'HEALTHCARE & VETERINARY',
    description: 'Modern institutional and booking website for Mohali Pet Clinic with compassionate care storytelling.',
    highlights: [
      'Comprehensive veterinary services and diagnostic showcase',
      'Patient booking flow and health tips resource center',
      'Warm and accessible responsive typography'
    ],
    techStack: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Lucide Icons'],
    metrics: 'Pet Healthcare · Responsive Clinic Platform',
    previewImageUrl: '/amc-2.png',
    galleryImages: [
      '/amc-1.png',
      '/amc-2.png',
      '/amc-3.png'
    ],
    color: '#a7c957'
  },
  'boosit-showcase-poc-1': {
    title: 'BoostIt — Showcase Experience',
    category: 'SAAS PLATFORM SHOWCASE',
    description: 'Showcase website for BoostIt featuring dynamic proof-of-concept interactive components and conversion flows.',
    highlights: [
      'High-conversion feature comparison cards',
      'Interactive metrics counters and animated feature reveals',
      'Lightweight component architecture'
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'GSAP Animations'],
    metrics: 'Conversion Flow · Proof of Concept',
    previewImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
    ],
    color: '#f77f00'
  },
  'koi-fish-3d': {
    title: 'Koi Fish 3D — Procedural Fluid Art',
    category: 'GENERATIVE ART & SHADERS',
    description: 'Procedural 3D Japanese koi pond simulation with fluid dynamics shaders, ripple wave propagation, and realistic caustics.',
    highlights: [
      'Real-time Navier-Stokes 2D fluid solver rendered on GPU compute shaders',
      'Procedural skeletal animation for organic fish spine locomotion and fin undulation',
      'Refractive water surface with Snell-Descartes caustics lighting'
    ],
    techStack: ['TypeScript', 'Three.js', 'WebGL', 'GLSL Shaders', 'Physics Math'],
    metrics: 'Real-time Caustics · Fluid Dynamics',
    previewImageUrl: '/koi-1.png',
    galleryImages: [
      '/koi-1.png',
      '/koi-2.png'
    ],
    color: '#ff4d4d'
  },
  'universal-college': {
    title: 'Universal College Patran',
    category: 'ACADEMIC INSTITUTION & PORTAL',
    description: 'Official institutional web platform for Universal College Patran with student portal access and course navigators.',
    highlights: [
      'Comprehensive academic curriculum catalog and faculty directory',
      'Admissions pipeline with dynamic eligibility calculators',
      'Zero-downtime deployment on Vercel with instant edge caching'
    ],
    techStack: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Vercel'],
    metrics: 'Production Live · Academic Portal',
    previewImageUrl: '/universal-college-1.png',
    galleryImages: [
      '/universal-college-1.png',
      '/universal-college-2.png',
      '/universal-college-3.png'
    ],
    color: '#3a86ff'
  },
  'jimmy-oye': {
    title: 'Jimmy Oye — Creative Music Showcase',
    category: 'ENTERTAINMENT & MUSIC BRAND',
    description: 'Vibrant and kinetic artist website with audio previews, video highlights, and live concert tour schedules.',
    highlights: [
      'Kinetic bold typography and vibrant neon aesthetic',
      'Integrated HTML5 Web Audio previews for music releases',
      'Tour calendar with real-time venue links'
    ],
    techStack: ['TypeScript', 'Next.js', 'Web Audio API', 'Tailwind CSS', 'Vercel'],
    metrics: 'Production Live · High-Aesthetic Music',
    previewImageUrl: '/jimmy-1.png',
    galleryImages: [
      '/jimmy-1.png',
      '/jimmy-2.png',
      '/jimmy-3.png',
      '/jimmy-4.png'
    ],
    color: '#ffbe0b' 
  }, 
  'wraith': {
    title: 'Project Wraith — Obsidian Cyber Suite',
    category: 'CYBERSECURITY & DEVTOOLS',
    description: 'High-contrast obsidian technical dashboard and landing experience for threat intelligence and vulnerability management.',
    highlights: [
      'Pure monochrome palette with surgical neon highlights',
      'Interactive packet inspection simulator with real-time SVG network graph',
      'Sub-50ms latency metrics dashboard'
    ],
    techStack: ['CSS Architecture', 'Vanilla JavaScript', 'SVG Graphics', 'Vercel'],
    metrics: 'Production Live · Zero-Latency HUD',
    previewImageUrl: '/wraith-1.png',
    galleryImages: [
      '/wraith-1.png',
      '/wraith-2.png',
      '/wraith-3.png',
      '/wraith-4.png'
    ],
    color: '#00ff66'
  },
  'amit-tandon': {
    title: 'Amit Tandon — Comedy & Live Tour',
    category: 'COMEDY & MEDIA PLATFORM',
    description: 'Official artist and live tour platform for comedian Amit Tandon featuring tour date ticketing and special video clips.',
    highlights: [
      'Live international tour ticketing integration',
      'Exclusive standup clips and press review quotes',
      'High-speed edge delivery with responsive layout'
    ],
    techStack: ['CSS Architecture', 'JavaScript', 'Responsive Design', 'Vercel'],
    metrics: 'Production Live · Tour Ticketing Platform',
    previewImageUrl: '/amit-1.png',
    galleryImages: [
      '/amit-1.png',
      '/amit-2.png',
      '/amit-3.png'
    ],
    color: '#fb5607'
  },
  'adieu-perfume': {
    title: 'Adieu Parfums — Haute Parfumerie',
    category: 'LUXURY E-COMMERCE',
    description: 'Monastic minimalist luxury digital showcase for artisanal niche fragrances with olfactory scent pyramid breakdowns.',
    highlights: [
      'Full-bleed black obsidian aesthetic inspired by high-fashion Parisian ateliers',
      'Olfactory notes navigation: Top, Heart, and Base note accord reveals',
      'Production-deployed on Vercel with instant edge caching'
    ],
    techStack: ['CSS Architecture', 'Vanilla JavaScript', 'SVG Micro-Interactions', 'Vercel'],
    metrics: 'Production Live · Monastic Aesthetics',
    previewImageUrl: '/adieu-1.png',
    galleryImages: [
      '/adieu-1.png',
      '/adieu-2.png'
    ],
    color: '#e2d8ce'
  }
};

// Repositories hidden from the carousel until screenshots/assets are provided
const HIDDEN_REPOS = new Set(['varun-sir-portfolio', 'boosit-showcase-poc-1']);

/**
 * SHOWCASE_PROJECTS: strictly generated from projects.json (excluding hidden repos)
 */
export const SHOWCASE_PROJECTS: ShowcaseProject[] = rawProjects
  .filter(repo => !HIDDEN_REPOS.has(repo.name))
  .map((repo) => {
  const isLive = Boolean(repo.homepage && !repo.homepage.includes('github.com'));
  const liveUrl = isLive ? (repo.homepage as string) : '';

  const meta = REPO_METADATA_MAP[repo.name] || {
    title: repo.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    category: `${(repo.language || 'CREATIVE').toUpperCase()} // ARCHIVE`,
    description: repo.description || 'Interactive digital experience engineered by Showcase-3D Studio.',
    highlights: [
      'Hardware-accelerated 60 FPS WebGL rendering pipeline',
      'Dynamic GLSL cylindrical distortion and vertex displacement',
      'Continuous spatial momentum with tactile kinetic controls'
    ],
    techStack: [repo.language || 'TypeScript', 'WebGL', 'GSAP'].filter(Boolean),
    metrics: isLive ? 'Production Live' : 'Studio Prototype · 60 FPS',
    previewImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'
    ],
    color: '#00e5ff'
  };

  const year = repo.created_at ? new Date(repo.created_at).getFullYear().toString() : '2026';
  const client = repo.full_name ? repo.full_name.split('/')[0] : 'Studio';

  return {
    id: String(repo.id),
    slug: repo.name,
    name: repo.name,
    title: meta.title,
    client: client,
    year: year,
    category: meta.category,
    description: repo.description || meta.description,
    highlights: meta.highlights,
    techStack: meta.techStack,
    metrics: meta.metrics,
    liveUrl: liveUrl,
    githubUrl: '',
    previewImageUrl: meta.previewImageUrl,
    galleryImages: meta.galleryImages,
    color: meta.color,
    isLive: isLive
  };
});
