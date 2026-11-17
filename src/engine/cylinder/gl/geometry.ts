/**
 * 32x32 Subdivided Quad Plane Geometry Generator for Smooth 3D Vertex Bending
 */

export interface SubdividedPlaneGeometry {
  vertices: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
}

export function generateSubdividedPlane(
  width: number,
  height: number,
  segX = 32,
  segY = 32
): SubdividedPlaneGeometry {
  const numVertices = (segX + 1) * (segY + 1);
  const vertices = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const indices = new Uint16Array(segX * segY * 6);

  let vIdx = 0;
  let uvIdx = 0;

  for (let y = 0; y <= segY; y++) {
    const v = y / segY;
    const posY = (0.5 - v) * height;

    for (let x = 0; x <= segX; x++) {
      const u = x / segX;
      const posX = (u - 0.5) * width;

      vertices[vIdx++] = posX;
      vertices[vIdx++] = posY;
      vertices[vIdx++] = 0;

      uvs[uvIdx++] = u;
      uvs[uvIdx++] = v;
    }
  }

  let iIdx = 0;
  for (let y = 0; y < segY; y++) {
    for (let x = 0; x < segX; x++) {
      const a = y * (segX + 1) + x;
      const b = a + 1;
      const c = a + (segX + 1);
      const d = c + 1;

      indices[iIdx++] = a;
      indices[iIdx++] = c;
      indices[iIdx++] = b;

      indices[iIdx++] = b;
      indices[iIdx++] = c;
      indices[iIdx++] = d;
    }
  }

  return { vertices, uvs, indices };
}

