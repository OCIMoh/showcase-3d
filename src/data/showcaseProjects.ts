/**
 * Repository Dataset for Mathias Adolfsson '26 Portfolio Carousel
 * Powered strictly by `repo.json`
 */

import rawRepos from './repo.json';

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
    previewImageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
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
    previewImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80'
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
    previewImageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1200&q=80'
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
    previewImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
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
    previewImageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1200&q=80'
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
    previewImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
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
    previewImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80'
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
    previewImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'
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
    previewImageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80'
    ],
    color: '#e2d8ce'
  }
};

/**
 * SHOWCASE_PROJECTS: strictly generated from repo.json
 * Nothing else is in this array!
 */
export const SHOWCASE_PROJECTS: ShowcaseProject[] = rawRepos.map((repo) => {
  const meta = REPO_METADATA_MAP[repo.name] || {
    title: repo.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    category: `${(repo.language || 'SOFTWARE').toUpperCase()} // REPOSITORY`,
    description: repo.description || 'Open source software repository developed by OCIMoh.',
    highlights: [
      `Official repository: ${repo.full_name}`,
      `Primary language: ${repo.language || 'TypeScript'}`,
      `Branch: ${repo.default_branch}`
    ],
    techStack: [repo.language || 'TypeScript', 'Git', 'Vercel'].filter(Boolean),
    metrics: repo.homepage ? 'Production Live' : 'Open Source Repository',
    previewImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'
    ],
    color: '#00e5ff'
  };

  const year = repo.created_at ? new Date(repo.created_at).getFullYear().toString() : '2026';
  const client = repo.full_name ? repo.full_name.split('/')[0] : 'OCIMoh';
  const isLive = Boolean(repo.homepage);
  const liveUrl = repo.homepage || repo.html_url;

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
    githubUrl: repo.html_url,
    previewImageUrl: meta.previewImageUrl,
    galleryImages: meta.galleryImages,
    color: meta.color,
    isLive: isLive
  };
});
