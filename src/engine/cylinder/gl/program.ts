/**
 * WebGL Program Compilation, Linking, and Typed Location Cache
 * Decoupled Carousel and Gallery Program Factories
 */

import { CAROUSEL_VERTEX_SHADER, CAROUSEL_FRAGMENT_SHADER } from './carouselShaders';
import { GALLERY_VERTEX_SHADER, GALLERY_FRAGMENT_SHADER } from './galleryShaders';

export interface CarouselProgramInfo {
  program: WebGLProgram;
  attribs: {
    aPosition: number;
    aUv: number;
  };
  uniforms: {
    uProjection: WebGLUniformLocation;
    uView: WebGLUniformLocation;
    uModel: WebGLUniformLocation;
    uTexture: WebGLUniformLocation;
    uPanelRadius: WebGLUniformLocation;
    uWrapAmount: WebGLUniformLocation;
    uClickPos: WebGLUniformLocation;
    uPullAmount: WebGLUniformLocation;
    uVelocity: WebGLUniformLocation;
    uReducedMotion: WebGLUniformLocation;
    uOpacity: WebGLUniformLocation;
    uDimFactor: WebGLUniformLocation;
    uIsHeroBackdrop: WebGLUniformLocation;
  };
}

export interface GalleryProgramInfo {
  program: WebGLProgram;
  attribs: {
    aPosition: number;
    aUv: number;
  };
  uniforms: {
    uProjection: WebGLUniformLocation;
    uView: WebGLUniformLocation;
    uModel: WebGLUniformLocation;
    uTexture: WebGLUniformLocation;
    uMeshOffsetY: WebGLUniformLocation;
    uBarrelRadius: WebGLUniformLocation;
    uOvalFlatness: WebGLUniformLocation;
    uCurveAmount: WebGLUniformLocation;
    uOpacity: WebGLUniformLocation;
    uDimFactor: WebGLUniformLocation;
  };
}

export function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type);
  if (!s) throw new Error('Failed to create WebGL shader.');
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error('Shader compilation error: ' + err);
  }
  return s;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vsSrc: string,
  fsSrc: string
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);

  const prog = gl.createProgram();
  if (!prog) throw new Error('Failed to create WebGL program.');
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const err = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error('Program link error: ' + err);
  }

  gl.detachShader(prog, vs);
  gl.detachShader(prog, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  return prog;
}

export function createCarouselProgram(gl: WebGLRenderingContext): CarouselProgramInfo {
  const program = createProgram(gl, CAROUSEL_VERTEX_SHADER, CAROUSEL_FRAGMENT_SHADER);
  const getUniform = (name: string): WebGLUniformLocation => {
    return gl.getUniformLocation(program, name) as WebGLUniformLocation;
  };

  return {
    program,
    attribs: {
      aPosition: gl.getAttribLocation(program, 'aPosition'),
      aUv: gl.getAttribLocation(program, 'aUv')
    },
    uniforms: {
      uProjection: getUniform('uProjection'),
      uView: getUniform('uView'),
      uModel: getUniform('uModel'),
      uTexture: getUniform('uTexture'),
      uPanelRadius: getUniform('uPanelRadius'),
      uWrapAmount: getUniform('uWrapAmount'),
      uClickPos: getUniform('uClickPos'),
      uPullAmount: getUniform('uPullAmount'),
      uVelocity: getUniform('uVelocity'),
      uReducedMotion: getUniform('uReducedMotion'),
      uOpacity: getUniform('uOpacity'),
      uDimFactor: getUniform('uDimFactor'),
      uIsHeroBackdrop: getUniform('uIsHeroBackdrop')
    }
  };
}

export function createGalleryProgram(gl: WebGLRenderingContext): GalleryProgramInfo {
  const program = createProgram(gl, GALLERY_VERTEX_SHADER, GALLERY_FRAGMENT_SHADER);
  const getUniform = (name: string): WebGLUniformLocation => {
    return gl.getUniformLocation(program, name) as WebGLUniformLocation;
  };

  return {
    program,
    attribs: {
      aPosition: gl.getAttribLocation(program, 'aPosition'),
      aUv: gl.getAttribLocation(program, 'aUv')
    },
    uniforms: {
      uProjection: getUniform('uProjection'),
      uView: getUniform('uView'),
      uModel: getUniform('uModel'),
      uTexture: getUniform('uTexture'),
      uMeshOffsetY: getUniform('uMeshOffsetY'),
      uBarrelRadius: getUniform('uBarrelRadius'),
      uOvalFlatness: getUniform('uOvalFlatness'),
      uCurveAmount: getUniform('uCurveAmount'),
      uOpacity: getUniform('uOpacity'),
      uDimFactor: getUniform('uDimFactor')
    }
  };
}
