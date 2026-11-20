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

  // A. True cylindrical arch across card width in Z-depth (Natural expansive convex arch)
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
uniform sampler2D uTextureNext;
uniform float uTransitionProgress; // 0.0 to 1.0 (Liquid Displacement Transition)

uniform float uOpacity;           // Item opacity
uniform float uDimFactor;         // Dimming towards edges or background
uniform float uIsHeroBackdrop;    // Smooth blend to warm cream background (0.0 to 1.0)
uniform float uVelocity;          // Speed of carousel motion
uniform float uReducedMotion;     // 1.0 disables chromatic aberration
uniform vec3 uLightPos;           // Dynamic cursor light position in world coords
uniform float uSpatialBlur;       // 0.0 to 1.0 (Native optical depth-of-field blur)
uniform float uVignette;          // 0.0 to 1.0 (Radial edge shadow)
uniform float uAtmosphereDim;     // 0.0 to 1.0 (Dark ambient blend for reading overlays)

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vec2 uv = vUv;
  vec4 texColor;

  // Option 2: Liquid Shader Ripple & Displacement Transition
  if (uTransitionProgress > 0.0005 && uTransitionProgress < 0.9995) {
    float p = uTransitionProgress;

    if (uReducedMotion > 0.5) {
      // Clean accessible crossfade without displacement under reduced motion
      vec4 c1 = texture2D(uTexture, uv);
      vec4 c2 = texture2D(uTextureNext, uv);
      texColor = mix(c1, c2, p);
    } else {
      // Smooth bell-curve amplitude peaking at mid-transition (p = 0.5)
      float strength = sin(p * 3.14159265);

      // Concentric liquid ripples expanding from center, adapted to 1.95:1 aspect
      vec2 center = vec2(0.5, 0.5);
      vec2 toCenter = (uv - center) * vec2(1.85, 1.0);
      float dist = length(toCenter);

      // Dual harmonic organic ripple waves
      float wave1 = sin(dist * 24.0 - p * 14.0) * 0.038 * strength;
      float wave2 = cos(dist * 16.0 - p * 10.0 + uv.x * 5.0) * 0.022 * strength;
      float totalWave = wave1 + wave2;

      // Opposing displacement vectors for outgoing and incoming textures
      vec2 uv1 = clamp(uv + vec2(totalWave, totalWave * 0.6) * (1.0 - p), 0.001, 0.999);
      vec2 uv2 = clamp(uv - vec2(totalWave * 0.75, totalWave * 0.5) * p, 0.001, 0.999);

      // Delicate chromatic fringe along the liquid wave edge
      float cFringe = totalWave * 0.32;
      vec4 c1;
      c1.r = texture2D(uTexture, clamp(uv1 + vec2(cFringe, 0.0), 0.001, 0.999)).r;
      c1.g = texture2D(uTexture, uv1).g;
      c1.b = texture2D(uTexture, clamp(uv1 - vec2(cFringe, 0.0), 0.001, 0.999)).b;
      c1.a = texture2D(uTexture, uv1).a;

      vec4 c2;
      c2.r = texture2D(uTextureNext, clamp(uv2 + vec2(cFringe, 0.0), 0.001, 0.999)).r;
      c2.g = texture2D(uTextureNext, uv2).g;
      c2.b = texture2D(uTextureNext, clamp(uv2 - vec2(cFringe, 0.0), 0.001, 0.999)).b;
      c2.a = texture2D(uTextureNext, uv2).a;

      texColor = mix(c1, c2, smoothstep(0.0, 1.0, p));
    }
  } else {
    // 1. Kinetic Optical Chromatic Aberration on Fling/Spin
    float speed = abs(uVelocity);
    float chroma = clamp(speed * 0.0035, 0.0, 0.015) * (1.0 - uReducedMotion);
    vec2 chromaDir = vec2(sign(uVelocity), 0.0);

    if (chroma > 0.0005) {
      float r = texture2D(uTexture, vUv + chromaDir * chroma).r;
      float g = texture2D(uTexture, vUv).g;
      float b = texture2D(uTexture, vUv - chromaDir * chroma).b;
      texColor = vec4(r, g, b, 1.0);
    } else {
      texColor = texture2D(uTexture, vUv);
    }
  }

  // Native GPU Optical Depth-of-Field Poisson dispersion when blurred
  if (uSpatialBlur > 0.005) {
    float bRadius = uSpatialBlur * 0.016;
    vec4 s1 = texture2D(uTexture, clamp(uv + vec2(-bRadius, -bRadius * 0.7), 0.001, 0.999));
    vec4 s2 = texture2D(uTexture, clamp(uv + vec2(bRadius, -bRadius * 0.7), 0.001, 0.999));
    vec4 s3 = texture2D(uTexture, clamp(uv + vec2(-bRadius * 0.7, bRadius), 0.001, 0.999));
    vec4 s4 = texture2D(uTexture, clamp(uv + vec2(bRadius * 0.7, bRadius), 0.001, 0.999));
    vec4 s5 = texture2D(uTexture, clamp(uv + vec2(0.0, -bRadius * 1.2), 0.001, 0.999));
    vec4 s6 = texture2D(uTexture, clamp(uv + vec2(0.0, bRadius * 1.2), 0.001, 0.999));
    vec4 blurred = (texColor * 0.30) + ((s1 + s2 + s3 + s4) * 0.14) + ((s5 + s6) * 0.07);
    texColor = mix(texColor, blurred, smoothstep(0.0, 1.0, uSpatialBlur));
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

  // Soft radial spotlight falloff with anisotropic sheen along X-axis
  float distToLight = length(uLightPos.xy - vWorldPos.xy);
  float spotFalloff = exp(-distToLight * 0.32) * 0.15 * (1.0 - uIsHeroBackdrop);
  float anisoGlint = pow(max(1.0 - abs(dot(normal, lightDir)), 0.0), 3.0) * 0.08;

  vec3 finalRgb = baseRgb + vec3(specular + spotFalloff + anisoGlint);

  // Smooth hero backdrop blending into warm cream paper (#f5f3ec) during case study transition
  // Strictly 100% blend to eliminate ghosting/watermark bleed from underlying slides
  if (uIsHeroBackdrop > 0.001) {
    finalRgb = mix(finalRgb, vec3(0.961, 0.953, 0.925), uIsHeroBackdrop);
  }

  // 3. Radial Spatial Vignette (only when not in hero backdrop mode)
  if (uVignette > 0.005 && uIsHeroBackdrop < 0.5) {
    vec2 vCenter = (vUv - vec2(0.5)) * vec2(1.5, 1.0);
    float vDist = length(vCenter);
    float vig = smoothstep(0.95, 0.20, vDist * uVignette);
    finalRgb *= mix(1.0, vig, uVignette * 0.85);
  }

  // 4. Atmospheric Dimming for overlay legibility (only when not in hero backdrop mode)
  if (uAtmosphereDim > 0.005 && uIsHeroBackdrop < 0.5) {
    vec3 ambientTone = vec3(0.035, 0.035, 0.045);
    finalRgb = mix(finalRgb, ambientTone, uAtmosphereDim * 0.90);
  }

  gl_FragColor = vec4(finalRgb, texColor.a * uOpacity);
}
`;

