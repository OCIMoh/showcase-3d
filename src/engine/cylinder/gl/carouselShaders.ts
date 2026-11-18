/**
 * Carousel 3D Shaders — Dedicated to the Main 3D Oval Carousel
 * 
 * Features:
 * - Full 1.95:1 widescreen card geometry (zero horizontal squishing)
 * - Cylindrical arch curvature in Z-depth
 * - Dynamic velocity-dependent aerodynamic flex and trailing inertia
 * - Vertical corner flex during rapid scrolling
 * - Interactive click-pull elastic bulge
 * - Smooth hero backdrop transition into case study
 * - Sharp 90-degree rectangular card edges
 */

export const CAROUSEL_VERTEX_SHADER = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aUv;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

uniform float uPanelRadius;       // Semi-major axis radius of carousel
uniform float uWrapAmount;        // 1.0 = carousel mode, 0.0 = flattens
uniform vec2 uClickPos;           // Screen-space click position
uniform float uPullAmount;        // Elastic pull bulge amplitude
uniform float uVelocity;          // Speed of carousel motion
uniform float uReducedMotion;     // 1.0 disables dynamic flex

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = aUv;
  vec3 pos = aPosition;

  float normX = pos.x / (uPanelRadius * 0.5);
  float normY = pos.y / (uPanelRadius * 0.28);
  float motionScale = uReducedMotion > 0.5 ? 0.0 : 1.0;
  float speed = abs(uVelocity);
  float velBend = clamp(speed * 0.45 * motionScale, 0.0, 2.2);

  // A. True cylindrical arch across card width in Z-depth (Preserves full 1.95:1 widescreen width)
  float archRadius = uPanelRadius * 0.65;
  float localAngle = pos.x / archRadius;
  float bentX = sin(localAngle) * archRadius;
  float baseArchZ = -(1.0 - cos(localAngle)) * archRadius * 0.45;

  // B. Dynamic aerodynamic flex & corner flex during scrolling
  float dynamicArchZ = -(normX * normX) * velBend * 0.55;
  float inertiaZ = -normX * uVelocity * 0.10 * motionScale;
  float verticalFlexZ = -(normY * normY) * velBend * 0.22;

  float totalZ = (baseArchZ + dynamicArchZ + inertiaZ + verticalFlexZ) * uWrapAmount;
  
  // Natural subtle cylindrical projection on X without squishing card width
  pos.x = mix(pos.x, bentX, uWrapAmount * 0.15);
  pos.z += totalZ;

  // Click pull bulge
  if (uPullAmount > 0.0001) {
    float distToClick = distance(pos.xy, uClickPos);
    float bulge = exp(-distToClick * 2.2) * uPullAmount;
    pos.z += bulge;
  }

  vec4 worldPos = uModel * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = uProjection * uView * worldPos;
}
`;

export const CAROUSEL_FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uTexture;
uniform float uOpacity;           // Item opacity
uniform float uDimFactor;         // Dimming towards edges or background
uniform float uIsHeroBackdrop;    // Smooth blend to warm cream background (0.0 to 1.0)
uniform float uVelocity;          // Speed of carousel motion
uniform float uReducedMotion;     // 1.0 disables chromatic aberration
uniform vec3 uLightPos;           // Dynamic cursor light position in world coords

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  // 1. Kinetic Optical Chromatic Aberration on Fling/Spin
  // Splits RGB channels along the velocity vector during rapid momentum
  float speed = abs(uVelocity);
  float chroma = clamp(speed * 0.0035, 0.0, 0.015) * (1.0 - uReducedMotion);
  vec2 chromaDir = vec2(sign(uVelocity), 0.0);

  vec4 texColor;
  if (chroma > 0.0005) {
    float r = texture2D(uTexture, vUv + chromaDir * chroma).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - chromaDir * chroma).b;
    texColor = vec4(r, g, b, 1.0);
  } else {
    texColor = texture2D(uTexture, vUv);
  }

  vec3 baseRgb = texColor.rgb * uDimFactor;

  // 2. Card Surface Specular Sheen (Soft, luxury satin spotlight tracking cursor)
  vec3 lightDir = normalize(uLightPos - vWorldPos);
  // Curved surface normal across the cylindrical panel
  vec3 normal = normalize(vec3(vWorldPos.x * 0.16, vWorldPos.y * 0.05, 1.0));
  vec3 viewDir = normalize(vec3(0.0, 0.0, -6.8) - vWorldPos);
  vec3 halfVec = normalize(lightDir + viewDir);

  float NdotH = max(dot(normal, halfVec), 0.0);
  float specular = pow(NdotH, 32.0) * 0.28 * (1.0 - uIsHeroBackdrop);

  // Soft radial spotlight falloff
  float distToLight = length(uLightPos.xy - vWorldPos.xy);
  float spotFalloff = exp(-distToLight * 0.32) * 0.15 * (1.0 - uIsHeroBackdrop);

  vec3 finalRgb = baseRgb + vec3(specular + spotFalloff);

  // Smooth hero backdrop blending during case study transition
  if (uIsHeroBackdrop > 0.001) {
    finalRgb = mix(finalRgb, vec3(0.961, 0.953, 0.925), uIsHeroBackdrop * 0.95);
  }

  gl_FragColor = vec4(finalRgb, texColor.a * uOpacity);
}
`;

