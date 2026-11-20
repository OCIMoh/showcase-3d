/**
 * Studio Content — Canonical Data for Showcase-3D Studio & Services
 * 
 * Sourced directly from docs/content.md
 * Studio-first focus: Creative Philosophy, Capabilities, Colophon, and Inquiry.
 */

export interface StudioPhilosophyItem {
  title: string;
  body: string;
}

export interface StudioCapabilityItem {
  title: string;
  body: string;
}

export interface StudioColophonRow {
  label: string;
  value: string;
}

export interface StudioContent {
  brand: {
    tag: string;
    headlineLines: string[];
    bioParagraphs: string[];
  };
  philosophy: StudioPhilosophyItem[];
  capabilities: StudioCapabilityItem[];
  colophon: StudioColophonRow[];
  contact: {
    email: string;
    actionLabel: string;
    note: string;
  };
}

export const STUDIO_CONTENT: StudioContent = {
  brand: {
    tag: 'THE STUDIO',
    headlineLines: [
      'Where digital spaces',
      'shed the flat page',
      'and become monuments.'
    ],
    bioParagraphs: [
      'Showcase-3D is an independent creative engineering studio specializing in real-time 3D websites and interactive WebGL experiences. We partner with luxury maisons, design ateliers, hardware makers, and architecture practices to turn brand visits into unforgettable physical spaces.',
      'Every showcase ships under 1MB of initial code and holds a locked 60 FPS on mid-range phones, because an interactive scene that stutters on mobile is a broken design. We accept four commissions a quarter.'
    ]
  },
  philosophy: [
    {
      title: 'Permanence Over Noise',
      body: 'Most websites are treated as disposable marketing paper. We engineer digital monuments with weight, materiality, and emotional permanence.'
    },
    {
      title: 'Performance as an Aesthetic',
      body: 'Smoothness is an artistic choice, not just an engineering checklist. High frame rates, instant responsiveness, and zero layout shift are what make digital objects feel real.'
    },
    {
      title: 'The Object as Interface',
      body: 'We eliminate generic cards, pop-ups, and dashboard clutter. The 3D subject itself provides the light, form, and navigation.'
    }
  ],
  capabilities: [
    {
      title: 'Spatial Web Experiences',
      body: 'Flagship 3D websites, interactive digital pavilions, and brand launch worlds.'
    },
    {
      title: 'Interactive Product Twins',
      body: 'Real-time lighting simulation, material refractions, tactile exploded views, and parts inspection.'
    },
    {
      title: 'Creative Technology & Shaders',
      body: 'Custom GLSL shaders, procedural physics, interactive camera choreography, and spatial sound design.'
    }
  ],
  colophon: [
    { label: 'STUDIO', value: 'Showcase-3D · Independent Creative Practice' },
    { label: 'DISCIPLINE', value: 'Spatial WebGL 2.0 / Custom GLSL Shaders' },
    { label: 'PERFORMANCE', value: '60 FPS on Mid-Range Phones · Sub-1MB Payload' },
    { label: 'COMMISSIONS', value: 'Q1 2027 Open · Strictly 4 Projects / Quarter' }
  ],
  contact: {
    email: 'johndoe.@example.com',
    actionLabel: 'Initiate Commission ↗',
    note: 'Direct atelier dispatch · 24-hour response guarantee'
  }
};
