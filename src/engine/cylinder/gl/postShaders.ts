/**
 * Optical Post-Processing GLSL Shaders — Showcase3D.cloud (Phase 5)
 * 
 * Features:
 * - Velocity-Driven Chromatic Aberration (RGB spectral fringe dispersion on spin)
 * - Analog Micro-Film Grain & Dithering (anti-banding for dark OLED displays)
 * - Atmospheric Vignette & Contrast Calibration
 */

export const POST_VERTEX_SHADER = `
precision highp float;

attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const POST_FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uSceneTexture;
uniform float uTime;
uniform float uVelocity;
uniform float uGrainIntensity;
uniform float uAberrationScale;
uniform float uVignette;
uniform vec2 uResolution;

varying vec2 vUv;

// Ultra-fast GPU pseudo-random generator
float pseudoNoise(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 toCenter = vUv - 0.5;
  float dist = length(toCenter);

  // 1. Velocity-Driven Optical Chromatic Aberration (Spectral Fringe Dispersion)
  // Fringe intensity scales quadratically with distance from lens center and carousel momentum
  float vel = abs(uVelocity);
  vec2 shift = toCenter * dist * clamp(vel * uAberrationScale, 0.0, 0.022);

  float r = texture2D(uSceneTexture, vUv + shift).r;
  float g = texture2D(uSceneTexture, vUv).g;
  float b = texture2D(uSceneTexture, vUv - shift).b;
  vec3 color = vec3(r, g, b);

  // 2. Analog Micro-Film Grain (Dithers dark #080808 background to prevent 8-bit banding on OLED screens)
  float noise = pseudoNoise(vUv * uResolution + fract(uTime) * 117.13);
  float grain = (noise - 0.5) * uGrainIntensity;
  color += grain;

  // 3. Atmospheric Optical Vignette (Framing focus on center active showcase)
  float vig = 1.0 - smoothstep(0.46, 1.25, dist) * uVignette;
  color *= vig;

  gl_FragColor = vec4(color, 1.0);
}
`;
