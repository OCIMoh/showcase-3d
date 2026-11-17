/**
 * GLSL Shaders — Dynamic 3D Vertex Bending, Chromatic Aberration, Elastic Click Bulge
 */

export const VERTEX_SHADER_SRC = `
attribute vec3 aPosition;
attribute vec2 aUv;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

// Carousel arc wrap parameters
uniform float uPanelRadius;
uniform float uPanelOvalRatio;
uniform float uWrapAmount;      // 1.0 = bent onto carousel, 0.0 = flat plane

// Click bulge parameters
uniform vec2 uClickPos;          // Local XY coordinates of click
uniform float uPullAmount;       // Elastic pull amount from chaser difference

// Barrel Gallery parameters (Case study vertical 3D cylinder)
uniform float uIsBarrelGallery;  // 1.0 if barrel gallery item, 0.0 otherwise
uniform float uMeshOffsetY;      // Vertical scroll offset
uniform float uOvalFlatness;     // Barrel flatness
uniform float uCurveAmount;      // Follows vertical scroll velocity
uniform float uBarrelRadius;     // Radius of horizontal cylinder

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = aUv;
  vec3 pos = aPosition;

  // 1. Dynamic Carousel Arc Bending
  if (uIsBarrelGallery < 0.5) {
    float localAngle = pos.x / uPanelRadius;
    float bentX = sin(localAngle) * uPanelRadius;
    float bentZ = -(1.0 - cos(localAngle)) * uPanelRadius * uPanelOvalRatio;
    
    pos.x = mix(pos.x, bentX, uWrapAmount);
    pos.z += bentZ * uWrapAmount;

    // Click pull bulge
    if (uPullAmount > 0.0001) {
      float distToClick = distance(pos.xy, uClickPos);
      float bulge = exp(-distToClick * 2.2) * uPullAmount;
      pos.z += bulge;
    }
  } else {
    // 2. Barrel Gallery Horizontal Cylinder Bending
    float worldY = pos.y + uMeshOffsetY;
    float angleY = worldY / uBarrelRadius;
    float barrelZ = -(1.0 - cos(angleY)) * uBarrelRadius * uOvalFlatness * uCurveAmount;
    pos.z += barrelZ;
  }

  vec4 worldPos = uModel * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  vec4 viewPos = uView * worldPos;
  gl_Position = uProjection * viewPos;
}
`;

export const FRAGMENT_SHADER_SRC = `
precision highp float;

uniform sampler2D uTexture;
uniform float uVelocity;          // Speed of carousel or scroll (normalized to 60fps)
uniform float uOpacity;           // Item opacity
uniform float uDimFactor;         // Dimming towards edges or background
uniform vec3 uHoverLight;         // Dynamic light position
uniform float uIsHeroBackdrop;    // Smooth blend to warm cream background (0.0 to 1.0)
uniform float uAspect;            // Dynamic aspect ratio derived from mesh width / height
uniform float uReducedMotion;     // 1.0 disables chromatic aberration

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  // Speed chromatic aberration: red and blue channels drift apart
  float shift = uReducedMotion > 0.5 ? 0.0 : clamp(uVelocity * 0.0022, -0.018, 0.018);
  vec4 color;
  
  if (abs(shift) > 0.0001) {
    float r = texture2D(uTexture, vUv + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - vec2(shift, 0.0)).b;
    float a = texture2D(uTexture, vUv).a;
    color = vec4(r, g, b, a);
  } else {
    color = texture2D(uTexture, vUv);
  }

  // Rounded corners in UV space derived from exact mesh aspect ratio
  vec2 uvCentered = vUv - vec2(0.5);
  vec2 uvAspect = vec2(uvCentered.x * uAspect, uvCentered.y);
  float radius = 0.04;
  vec2 cornerDist = max(abs(uvAspect) - vec2(uAspect * 0.5 - radius, 0.5 - radius), vec2(0.0));
  float cornerLen = length(cornerDist);
  float cornerAlpha = 1.0 - smoothstep(radius - 0.005, radius, cornerLen);
  if (cornerAlpha < 0.01) discard;

  // Soft directional light interaction
  float lightDist = distance(vWorldPos.xy, uHoverLight.xy);
  float lightFactor = clamp(1.0 - lightDist * 0.08, 0.88, 1.15);

  vec3 finalRgb = color.rgb * uDimFactor * lightFactor;

  // Smooth hero backdrop blending (replaces 0/1 step)
  if (uIsHeroBackdrop > 0.001) {
    finalRgb = mix(finalRgb, vec3(0.961, 0.953, 0.925), uIsHeroBackdrop * 0.95);
  }

  gl_FragColor = vec4(finalRgb, color.a * uOpacity * cornerAlpha);
}
`;

