/**
 * Cylinder Carousel Engine Configuration & Magic Numbers
 */

/**
 * Geometric, visual, physics, and content configuration options for the carousel engine.
 */
export interface CylinderConfig {
  /** Width of an individual 3D mesh card in world units */
  cardWidth: number;
  /** Height of an individual 3D mesh card in world units */
  cardHeight: number;
  /** Card aspect ratio (derived from cardWidth / cardHeight) */
  cardAspect: number;
  /** Horizontal spacing along the carousel circumference */
  spacing: number;
  /** Semi-major radius of the oval carousel loop (X-axis) */
  radiusX: number;
  /** Semi-minor depth of the oval carousel loop (Z-axis) */
  radiusZ: number;
  /** Oval eccentricity ratio governing card inward rotation */
  ovalRatio: number;
  /** Maximum visible angle cutoff for carousel cards (radians) */
  maxAngle: number;
  /** Angular span factor determining center card focus */
  angularSpanFactor: number;
  /** Center card scale magnification bonus (0.20 = +20%) */
  centerBonusScale: number;

  /** Camera Z position in world units */
  cameraZ: number;
  /** Vertical field of view in degrees */
  fovDegrees: number;

  /** Barrel gallery cylinder radius in world units */
  barrelRadius: number;
  /** Barrel gallery horizontal curvature flatness */
  ovalFlatness: number;
  /** Vertical spacing between gallery slides */
  gallerySpacing: number;

  /** Damping lambda for carousel horizontal motion */
  dampMotion: number;
  /** Damping lambda for elastic click bulge pull */
  dampPull: number;
  /** Damping lambda for mouse tilt parallax */
  dampTilt: number;
  /** Damping lambda for hover spotlight */
  dampLight: number;
  /** Damping lambda for case study barrel gallery scrolling */
  dampGallery: number;
  /** Amplitude multiplier for the elastic pull bulge */
  pullDistance: number;
}

/**
 * Brand, profile, and editorial copy for HUD, drawers, and headers.
 */
export interface BrandConfig {
  brandLine1: string;
  brandLine2: string;
  badge: string;
  aboutHeadline: string;
  aboutBio: string;
  githubUrl: string;
}

export const DEFAULT_CONFIG: Readonly<CylinderConfig> = {
  cardWidth: 5.46,
  cardHeight: 2.80,
  cardAspect: 5.46 / 2.80,
  spacing: 6.42,
  radiusX: 11.5,
  radiusZ: 6.08,
  ovalRatio: 0.53,
  maxAngle: 1.36,
  angularSpanFactor: 1.15,
  centerBonusScale: 0.20,

  cameraZ: -6.8,
  fovDegrees: 48,

  barrelRadius: 4.2,
  ovalFlatness: 0.95,
  gallerySpacing: 3.30,

  dampMotion: 5.33,
  dampPull: 5.00,
  dampTilt: 5.33,
  dampLight: 5.33,
  dampGallery: 5.33,
  pullDistance: 0.85
};

export const DEFAULT_BRAND: Readonly<BrandConfig> = {
  brandLine1: 'Showcase-3D',
  brandLine2: 'Studio',
  badge: 'Showcase-3D // CREATIVE ENGINEER',
  aboutHeadline: 'CURVED CYLINDRICAL CAROUSEL & 3D INTERACTIVE ENGINE',
  aboutBio: 'Creative engineering studio specializing in WebGL, procedural 3D graphics, dynamic GLSL shaders, and tactile digital experiences.',
  githubUrl: 'https://github.com/OCIMoh'
};

