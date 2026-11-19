/**
 * Projects Dataset for Mathias Adolfsson '26 Portfolio Carousel
 * Powered strictly by `projects.json` with deep extracted domain metadata
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
  // Rich domain metadata fields
  brand?: string;
  tagline?: string;
  heroHeadline?: string;
  pricing?: { price?: string; cta?: string; scarcity?: string; allocation?: string };
  storySteps?: Array<{ step: string; headline: string; body: string; tags?: string[] }>;
  specs?: Record<string, string>;
  quote?: { text: string; author?: string; role?: string };
  location?: string;
  contact?: { phone?: string; hours?: string; instagram?: string };
  fragrancePyramid?: Array<{ layer: string; title: string; notes: string }>;
  viralReels?: Array<{ title: string; views: string }>;
  services?: string[];
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
  brand?: string;
  tagline?: string;
  heroHeadline?: string;
  pricing?: { price?: string; cta?: string; scarcity?: string; allocation?: string };
  storySteps?: Array<{ step: string; headline: string; body: string; tags?: string[] }>;
  specs?: Record<string, string>;
  quote?: { text: string; author?: string; role?: string };
  location?: string;
  contact?: { phone?: string; hours?: string; instagram?: string };
  fragrancePyramid?: Array<{ layer: string; title: string; notes: string }>;
  viralReels?: Array<{ title: string; views: string }>;
  services?: string[];
}

// Curated authentic domain metadata mapped strictly to the repos in projects.json
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
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
    ],
    color: '#e5dacf'
  },
  'touche-keyboard': {
    title: 'Touché — Custom 3D Mechanical Keyboard',
    brand: 'Touché',
    category: '3D HARDWARE & ACOUSTICS',
    tagline: 'A keyboard, reconsidered.',
    heroHeadline: 'Precision starts beneath the surface.',
    description: 'CNC-milled aerospace-grade aluminum chassis with 5-layer acoustic dampening, custom silicone gaskets, and interactive 3D exploded view.',
    highlights: [
      'Machined from solid aluminum: single block aerospace alloy CNC-milled to perfection',
      'Acoustic perfection: five layers of dampening, polycarbonate plate, silicone gaskets',
      'Real-time sound synthesizer simulating switch acoustics in 60 FPS WebGL'
    ],
    techStack: ['TypeScript', 'Three.js', 'WebGL', 'GLSL Shaders', 'Web Audio API'],
    specs: {
      'Chassis': 'CNC-Milled Aerospace Aluminum',
      'Acoustics': '5-Layer Dampening + Silicone Gaskets',
      'Plate': 'Precision Polycarbonate',
      'Pricing': '$349 Pre-order'
    },
    pricing: { price: '$349', cta: 'Pre-order Now - $349' },
    quote: { text: 'Built to be felt. Every layer has a purpose.' },
    metrics: 'Production Live · $349 Pre-order',
    previewImageUrl: '/touche-1.png',
    galleryImages: [
      '/touche-1.png',
      '/touche-2.png',
      '/touche-3.png'
    ],
    color: '#00e5ff'
  },
  'lumina-coffee': {
    title: 'Lumina Coffee — The Artisanal Journey',
    brand: 'Lumina Coffee Roasters',
    category: 'BEVERAGE & 3D SCROLLYTELLING',
    tagline: 'A journey in every cup.',
    heroHeadline: 'Where it all begins. Cultivated in high-altitude misty mountain air.',
    description: 'Cinematic 3D scrollytelling following single-origin, small-batch coffee from lush high-altitude harvest to pour-over extraction.',
    storySteps: [
      { step: '01 / The Origin', headline: 'Where it all begins.', body: 'Cultivated in high-altitude, lush landscapes beneath misty mountain air.', tags: ['Single-origin', 'Sustainable'] },
      { step: '02 / Sun-drenched', headline: 'Dried to perfection.', body: 'Hand-raked under golden sun to enhance intrinsic sweetness and vibrant profile.', tags: ['Sun-dried', 'Artisanal'] },
      { step: '03 / Crafted Heat', headline: 'The art of the roast.', body: 'Carefully roasted in small batches, unlocking deep espresso profiles with unrelenting precision.', tags: ['Small-batch', 'Heritage'] },
      { step: '04 / The End', headline: 'Your perfect morning.', body: 'Every altitude, ray of sun, and degree of heat culminating in this single, flawless cup.', tags: ['Single Cup', 'Flawless'] }
    ],
    highlights: [
      'Kinetic scrollytelling with procedural WebGL shaders',
      '4-stage artisanal origin progression: Origin, Sun-drenched, Roasted Heat, Morning Cup',
      'High-altitude single-origin small batch roasting profile'
    ],
    techStack: ['HTML', 'CSS Architecture', 'JavaScript', '3D WebGL Canvas', 'GSAP'],
    specs: {
      'Format': '3D WebGL Canvas & Liquid Transitions',
      'Origin': 'High-Altitude Single-Origin',
      'Roast': 'Small-Batch Artisanal Heat',
      'Media': 'Generative GLSL Visuals'
    },
    quote: { text: 'Every altitude, every ray of sun, and every degree of heat—all culminating in this single, flawless cup.' },
    metrics: 'Production Live · 4-Stage Scrollytelling',
    previewImageUrl: '/lumina-2.png',
    galleryImages: [
      '/lumina-2.png',
      '/lumina-1.png'
    ],
    color: '#d4a373'
  },
  'amc-journey': {
    title: 'Animal Medical Center — 24/7 Care Journey',
    brand: 'Animal Medical Center (AMC)',
    category: 'HEALTHCARE & 24/7 VETERINARY',
    tagline: 'Where serious veterinary medicine meets genuine care.',
    heroHeadline: 'Every animal that comes through this door is afraid. This is where that stops.',
    description: '24/7 veterinary clinic and critical care hospital in Sector 70, Mohali, providing emergency ICU, advanced diagnostics, and surgical care across the Chandigarh Tricity.',
    location: 'Sector 70, Mohali, Punjab',
    contact: { phone: '+91 70370 38787', hours: 'Open 24 hours, every day', instagram: '@amc.mohali' },
    storySteps: [
      { step: '9:42 PM', headline: 'The Arrival', body: 'Hasn\'t eaten since morning. You know them better than any chart.' },
      { step: 'Night', headline: 'The First Ten Minutes', body: 'The first ten minutes matter more than the next ten tests. Hands slow. Voices lower.' },
      { step: 'Quiet hours', headline: 'Careful Diagnostics', body: 'Love sees the animal. Medicine looks for what love cannot name yet.' },
      { step: 'Morning', headline: 'The Walk Home', body: 'By the time you leave, the line doesn\'t lie. Breath lengthens. Home is close.' }
    ],
    services: [
      'Emergency & Critical Care',
      'Digital Diagnostics',
      'Soft Tissue & Bone Surgery',
      'Preventive Care',
      'Dentistry',
      'Hospitalization & Monitoring'
    ],
    specs: {
      'Facility': 'Sector 70, Mohali, Punjab',
      'Availability': 'Open 24 Hours / 365 Days',
      'Emergency Line': '+91 70370 38787',
      'Coverage': 'Mohali & Chandigarh Tricity'
    },
    quote: { text: 'Not brave. Just held. Steady hands beside a worried owner.' },
    highlights: [
      'Compassionate 24/7 veterinary triage and emergency care narrative',
      'Full-spectrum medical hospital: surgery, digital diagnostics, ICU hospitalization',
      'Emergency helpline (+91 70370 38787) with immediate clinical response'
    ],
    techStack: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Lucide Icons'],
    metrics: 'Production Live · 24/7 Emergency Hospital',
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
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ],
    color: '#f77f00'
  },
  'koi-fish-3d': {
    title: 'Koi Fish 3D — Procedural Fluid Simulation',
    brand: 'CREATE DAILY',
    category: 'GENERATIVE ART & GPU SHADERS',
    tagline: 'Interface Design & Generative 3D Shaders.',
    heroHeadline: 'Procedural Japanese koi pond simulation with fluid dynamics shaders.',
    description: 'Real-time Navier-Stokes 2D fluid solver rendered on GPU compute shaders with procedural skeletal fish spine undulation and refractive Snell-Descartes caustics.',
    highlights: [
      'Navier-Stokes fluid dynamics: real-time 2D velocity advection on GPU shaders',
      'Procedural skeletal motion: sine-driven articulated vertebrae chain producing organic fin drag',
      'Refractive water surface with Snell-Descartes caustics lighting'
    ],
    techStack: ['TypeScript', 'Three.js', 'WebGL', 'GLSL Shaders', 'Physics Math'],
    specs: {
      'Simulation': 'Navier-Stokes GPU Solver',
      'Locomotion': 'Procedural Skeletal Spine Chain',
      'Optics': 'Snell-Descartes Caustics',
      'Framerate': '60 FPS Hardware Accelerated'
    },
    quote: { text: 'An organic convergence of procedural mathematics, fluid simulation, and generative living art.' },
    metrics: 'Real-time Caustics · Fluid Dynamics',
    previewImageUrl: '/koi-1.png',
    galleryImages: [
      '/koi-1.png',
      '/koi-2.png'
    ],
    color: '#ff4d4d'
  },
  'universal-college': {
    title: 'Universal College Patran — Higher Education',
    brand: 'Universal College Patran',
    category: 'ACADEMIC INSTITUTION & CHARTER',
    tagline: 'From Patran to the World — Inspiring Minds, Building Futures.',
    heroHeadline: 'Discover Your Path — Serving all sections of society with multidisciplinary education.',
    description: 'Established in 2014 by Dashmesh Charitable Trust, affiliated with MRSPTU Bathinda & Jagat Guru Nanak Dev PSOU, offering 25+ regular degree and open university programs with 100% PMSS SC Scholarship.',
    location: 'Chanda Colony, Patran-147105, Patiala, Punjab',
    contact: { phone: '+91-97791-46689', hours: 'Mon–Sat 9:00 AM – 4:30 PM' },
    specs: {
      'Founded': '2014 by Dashmesh Charitable Trust',
      'Affiliations': 'MRSPTU Bathinda · PSOU Patiala · AICTE / UGC',
      'Scholarship': '100% Post-Matric SC Scheme (PMSS)',
      'Facilities': '4 AC Labs (100+ PCs) · Multi-Acre Sports Stadium'
    },
    highlights: [
      'Dual charter: MRSPTU Regular Degrees + PSOU Open University Diplomas',
      '100% Post-Matric SC Scholarship (PMSS) tuition fee waiver enlisted',
      'Modern 16-facility campus: 4 AC computer labs (100+ PCs), NCC & NSS units'
    ],
    quote: { text: 'A college is not only a place where careers are built; it is a place where the future of society is shaped.', author: 'S. Baljeet Singh', role: 'Chairman' },
    techStack: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Vercel'],
    metrics: 'Production Live · MRSPTU Affiliated · Est. 2014',
    previewImageUrl: '/universal-college-1.png',
    galleryImages: [
      '/universal-college-1.png',
      '/universal-college-2.png',
      '/universal-college-3.png'
    ],
    color: '#3a86ff'
  },
  'jimmy-oye': {
    title: 'Jimmy Oye — Same Shit. Different People.',
    brand: 'Jimmy Oye Comedy Showcase',
    category: 'STAND-UP COMEDY & 2026 TOUR',
    tagline: 'The Raw Setlist Manifesto.',
    heroHeadline: 'SAME SHIT. DIFFERENT PEOPLE. Authentic unfiltered standup comedy.',
    description: 'Live stand-up comedy special and uncensored bit archive featuring 21 raw routines, recorded specials with 12M+ views, and national tour dates across 6 cities.',
    viralReels: [
      { title: 'Sleeping Naked', views: '16.2K' },
      { title: 'Bakri Ka Doodh', views: '21.3K' },
      { title: 'Jordans', views: '22.7K' }
    ],
    specs: {
      'Tour 2026': '6 Cities (18,000+ Seats)',
      'Top Special': 'Boys Hostel (4.2M YouTube Views)',
      'Advisory': '100% Unfiltered · 18+ Mature Content',
      'Setlist': '21 Uncensored Routines'
    },
    quote: { text: 'A zine punk aesthetic, raw comedy forged in engineering hostel rooms, tested in club basements, and refined through 100+ live crowd interactions.' },
    highlights: [
      'National tour booking platform & instant thermal receipt ticket passes',
      'Recorded specials: Boys Hostel (4.2M views), Love Bangalore (2.8M views)',
      'Pure raw observational stand-up: hostel chaos, baniya math, Punjabi logic'
    ],
    techStack: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Vercel'],
    metrics: 'Production Live · 2026 Tour · 18,000+ Seats',
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
    title: 'WRAITH — Handcrafted Bushcraft & Field Knives',
    brand: 'WRAITH',
    category: 'METALLURGY & FIELD TOOLS',
    tagline: 'Handcrafted Bushcraft & Field Knives.',
    heroHeadline: 'Crucible CPM-3V powder steel cryo-quenched to 61 HRC with a true 14° Scandinavian zero grind.',
    description: 'Handcrafted in North Bend, Washington. The Wraith Field Edition combines Crucible CPM-3V powder tool steel, liquid-nitrogen quench (-300°F), and 4mm full-tang spine built to baton hardwood and strike ferro sparks.',
    pricing: { price: '$189.00 USD', cta: 'Order Blade — $189', allocation: 'Batch 04 (28 allocations)' },
    storySteps: [
      { step: '01 / The Steel', headline: 'Crucible CPM-3V.', body: 'High-toughness powder tool steel, vacuum-hardened and liquid-nitrogen quenched to hold an edge through frozen hardwood.' },
      { step: '02 / The Bevel', headline: 'True 14° Scandi Grind.', body: 'Milled flat to zero on slow water-cooled natural wheels. Bites into cedar for hair-thin feathersticks.' },
      { step: '03 / The Mountain', headline: 'Built for the Wet Cold.', body: 'Ergonomic canvas micarta scales provide a secure, non-slip grip in rain, snow, or mud.' },
      { step: '04 / The Chore', headline: 'Baton Hardwood. Strike Sparks.', body: 'A rigid 4mm full-tang spine built to split knotty wood, ground with a sharp 90° square edge for ferro sparks.' },
      { step: '05 / The Wraith', headline: 'One Blade for a Lifetime.', body: 'Hand-finished, numbered in limited batches, and backed by an unconditional lifetime guarantee.' }
    ],
    specs: {
      'Alloy Core': 'Crucible CPM-3V Powder Steel',
      'Hardness': '60.5 – 61.5 HRC (Cryo Quench -300°F)',
      'Bevel Grind': '14° Scandinavian Zero Grind',
      'Spine & Tang': '4.0mm Full-Tang Rigid Spine',
      'Price': '$189.00 USD (Batch 04 Allocation)'
    },
    quote: { text: 'Field test: split hemlock across three seasons. 61 HRC holds a razor edge through heavy knot strikes.' },
    highlights: [
      'Crucible CPM-3V tool steel vacuum-hardened & liquid-nitrogen quenched to 61 HRC',
      '14° Scandinavian zero grind: surgically sharp flat bevel ground on water-cooled stone',
      'Rigid 4mm full-tang spine with 90° square edge for ferro rod showers'
    ],
    techStack: ['CSS Architecture', 'Vanilla JavaScript', 'SVG Graphics', 'Vercel'],
    metrics: 'Production Live · Batch 04 · $189 USD',
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
    title: 'Amit Tandon — Official Comedy Platform',
    brand: 'Amit Tandon',
    category: 'CLEAN OBSERVATIONAL COMEDY',
    tagline: 'The Method in the Madness.',
    heroHeadline: 'Aise Kaise — Official World Tour across 33 cities worldwide.',
    description: 'Official world tour platform for Amit Tandon, India’s premier clean observational stand-up comedian and corporate keynote speaker, featuring 33-city ticketing and comedy specials.',
    specs: {
      'World Tour': 'Aise Kaise across 33 International Cities',
      'Positioning': 'India\'s Premier Clean Observational Comedian',
      'Format': 'Solo Live Specials & Corporate Keynotes',
      'Deployment': 'Vercel Edge Platform'
    },
    quote: { text: 'Relatable, middle-class observational wit navigating the chaotic absurdities of modern marriage, parenting, and corporate life.' },
    highlights: [
      'Aise Kaise international world tour dates & live venue ticketing',
      'Clean observational storytelling for multi-generational audiences',
      'Corporate keynote reservations and streaming special archives'
    ],
    techStack: ['CSS Architecture', 'JavaScript', 'Responsive Design', 'Vercel'],
    metrics: 'Production Live · 33-City World Tour',
    previewImageUrl: '/amit-1.png',
    galleryImages: [
      '/amit-1.png',
      '/amit-2.png',
      '/amit-3.png'
    ],
    color: '#fb5607'
  },
  'adieu-perfume': {
    title: 'ADIEU — Haute Parfumerie',
    brand: 'ADIEU / Parfum',
    category: 'LUXURY HAUTE PARFUMERIE',
    tagline: 'An olfactory monument to the quiet beauty of departure.',
    heroHeadline: 'Extrait de Parfum — First Harvest Allocation, Batch 01 · 300 Flacons.',
    description: '32% Extrait de Parfum cold-macerated in Grasse, France. Housed in fluted architectural crystal on monolithic honed volcanic travertine with brushed champagne brass magnetic closure.',
    pricing: { price: '$285 / 100ml', cta: 'Acquire The Monolith — $285', scarcity: '86 of 300 bottles remaining' },
    fragrancePyramid: [
      { layer: 'I. The Departure · Top', title: 'Bitter Bergamot & Smoke', notes: 'Cracked Guatemalan cardamom, charred birch smoke, and crisp Calabrian bergamot zest.' },
      { layer: 'II. The Reverie · Heart', title: 'Cognac & Orris Butter', notes: 'Aged 12-year French oak cognac resin, velvety Florentine orris root, and sun-dried golden osmanthus.' },
      { layer: 'III. The Monument · Base', title: 'Smoked Labdanum & Stone', notes: 'Dark volcanic travertine mineral accord, Spanish labdanum resin, raw ambergris, and cedar embers.' }
    ],
    specs: {
      'Concentration': '32% Extrait de Parfum (Cold-Macerated)',
      'Flacon': 'Fluted Architectural Crystal & Honed Travertine',
      'Cap': 'Brushed Champagne Brass with Magnetic Lock',
      'Allocation': 'Batch 01 · 300 Flacons (86 Remaining) · $285'
    },
    quote: { text: 'Crafted for those who linger in memory long after they have gone. Each flacon hand-filled and numbered in our Grasse laboratory.' },
    highlights: [
      'Cold-macerated 32% Extrait concentration with 12-year French oak cognac resin',
      'Architectural fluted crystal flacon resting upon monolithic volcanic travertine',
      'Atelier Policy: Complimentary 2ml matching sample to test on skin before unsealing'
    ],
    techStack: ['CSS Architecture', 'Vanilla JavaScript', 'SVG Micro-Interactions', 'Vercel'],
    metrics: 'Production Live · 32% Extrait · $285 USD',
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
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
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
      description: meta.description,
      highlights: meta.highlights,
      techStack: meta.techStack,
      metrics: meta.metrics,
      liveUrl: liveUrl,
      githubUrl: '',
      previewImageUrl: meta.previewImageUrl,
      galleryImages: meta.galleryImages,
      color: meta.color,
      isLive: isLive,
      brand: meta.brand,
      tagline: meta.tagline,
      heroHeadline: meta.heroHeadline,
      pricing: meta.pricing,
      storySteps: meta.storySteps,
      specs: meta.specs,
      quote: meta.quote,
      location: meta.location,
      contact: meta.contact,
      fragrancePyramid: meta.fragrancePyramid,
      viralReels: meta.viralReels,
      services: meta.services
    };
  });
