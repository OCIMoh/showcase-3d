/**
 * Gallery 3D Shaders — Dedicated to the 3D Vertical Cylinder Barrel Gallery
 * 
 * Features:
 * - Showcase-3D continuous horizontal cylinder roller
 * - Velocity-dependent curvature: flat at rest (uCurveAmount = 0.0), a barrel when scrolling
 * - Entrance second-curve relaxation
 * - Transparent pixel discard (enables pure floating 3D typography without card backgrounds)
 * - Sharp 90-degree rectangular card edges
 */

export const GALLERY_VERTEX_SHADER = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aUv;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

uniform float uMeshOffsetY;       // World Y position of card in vertical loop
uniform float uBarrelRadius;      // Radius of horizontal cylinder
uniform float uOvalFlatness;      // Curvature flatness factor
uniform float uCurveAmount;       // Velocity-driven curvature (0.0 at rest)

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = aUv;
  vec3 pos = aPosition;

  // The Barrel Gallery (Showcase-3D continuous horizontal cylinder)
  // Flat at rest (uCurveAmount = 0.0), a barrel when scrolling or arriving
  float worldY = pos.y + uMeshOffsetY;
  float effRadius = uBarrelRadius;
  float angleY = worldY / effRadius;

  // Derivative at center worldY=0 is -sin(0)=0 (perfectly flat tangent at rest)
  // Bends inward into +Z depth following scroll speed and entrance curve
  float clampedAngleY = clamp(angleY, -1.5707963, 1.5707963);
  float barrelZ = +(1.0 - cos(clampedAngleY)) * effRadius * uOvalFlatness * uCurveAmount;
  pos.z += barrelZ;

  vec4 worldPos = uModel * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = uProjection * uView * worldPos;
}
`;

export const GALLERY_FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uTexture;
uniform float uOpacity;           // Item opacity
uniform float uDimFactor;         // Dimming towards edges

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);

  // Discard fully transparent pixels (enables floating 3D typography without card backgrounds)
  if (texColor.a < 0.01) {
    discard;
  }

  vec3 finalRgb = texColor.rgb * uDimFactor;
  gl_FragColor = vec4(finalRgb, texColor.a * uOpacity);
}
`;

