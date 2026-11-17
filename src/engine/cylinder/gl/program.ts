/**
 * WebGL Program Compilation, Linking, and Typed Location Cache
 */

export interface ProgramInfo {
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
    uPanelOvalRatio: WebGLUniformLocation;
    uWrapAmount: WebGLUniformLocation;
    uClickPos: WebGLUniformLocation;
    uPullAmount: WebGLUniformLocation;
    uIsBarrelGallery: WebGLUniformLocation;
    uMeshOffsetY: WebGLUniformLocation;
    uOvalFlatness: WebGLUniformLocation;
    uCurveAmount: WebGLUniformLocation;
    uBarrelRadius: WebGLUniformLocation;
    uVelocity: WebGLUniformLocation;
    uOpacity: WebGLUniformLocation;
    uDimFactor: WebGLUniformLocation;
    uHoverLight: WebGLUniformLocation;
    uIsHeroBackdrop: WebGLUniformLocation;
    uAspect: WebGLUniformLocation;
    uReducedMotion: WebGLUniformLocation;
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

  // Shaders can be safely detached and deleted after linking
  gl.detachShader(prog, vs);
  gl.detachShader(prog, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  return prog;
}

export function createProgramInfo(gl: WebGLRenderingContext, program: WebGLProgram): ProgramInfo {
  const getUniform = (name: string): WebGLUniformLocation => {
    const loc = gl.getUniformLocation(program, name);
    if (!loc) {
      console.warn(`Uniform location "${name}" not found in shader program.`);
    }
    return loc as WebGLUniformLocation;
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
      uPanelOvalRatio: getUniform('uPanelOvalRatio'),
      uWrapAmount: getUniform('uWrapAmount'),
      uClickPos: getUniform('uClickPos'),
      uPullAmount: getUniform('uPullAmount'),
      uIsBarrelGallery: getUniform('uIsBarrelGallery'),
      uMeshOffsetY: getUniform('uMeshOffsetY'),
      uOvalFlatness: getUniform('uOvalFlatness'),
      uCurveAmount: getUniform('uCurveAmount'),
      uBarrelRadius: getUniform('uBarrelRadius'),
      uVelocity: getUniform('uVelocity'),
      uOpacity: getUniform('uOpacity'),
      uDimFactor: getUniform('uDimFactor'),
      uHoverLight: getUniform('uHoverLight'),
      uIsHeroBackdrop: getUniform('uIsHeroBackdrop'),
      uAspect: getUniform('uAspect'),
      uReducedMotion: getUniform('uReducedMotion')
    }
  };
}

