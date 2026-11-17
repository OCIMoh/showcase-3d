/**
 * MathiasCylinderEngine — Backward-Compatible Re-export Shim
 * 
 * The WebGL engine architecture has been modularized into:
 * src/engine/cylinder/
 *   ├── math/mat4.ts
 *   ├── core/config.ts
 *   ├── core/damped.ts
 *   ├── gl/shaders.ts
 *   ├── gl/geometry.ts
 *   ├── gl/program.ts
 *   ├── gl/textures.ts
 *   ├── input/inputController.ts
 *   ├── ui/arcHud.ts
 *   ├── ui/aboutDrawer.ts
 *   ├── ui/overlay.ts
 *   ├── audio/synth.ts
 *   ├── renderer/carouselPass.ts
 *   ├── renderer/galleryPass.ts
 *   └── engine.ts
 */

export * from './cylinder/engine';
export * from './cylinder/core/config';
export { CylinderCarouselEngine as MathiasCylinderEngine } from './cylinder/engine';
