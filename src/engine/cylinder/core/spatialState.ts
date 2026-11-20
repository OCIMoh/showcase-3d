/**
 * Spatial State Machine — Camera Waypoints & Scene Configurations
 * Maps abstract route names to physical WebGL camera coordinates, FOV, and GLSL shader post-processing.
 */

import { SpatialWaypoint } from '../../../router/routes';
export type { SpatialWaypoint };

export interface CameraWaypointConfig {
  camOffsetX: number;
  camOffsetY: number;
  camOffsetZ: number;
  tiltAngleX: number;
  tiltAngleY: number;
  fovDegrees: number;
  spatialBlur: number;
  vignetteStrength: number;
  atmosphereDim: number;
  targetFps: number;
  hudVisible: boolean;
  interactiveCylinder: boolean;
}

export const WAYPOINT_CONFIGS: Record<SpatialWaypoint, CameraWaypointConfig> = {
  STAGE: {
    camOffsetX: 0.0,
    camOffsetY: 0.0,
    camOffsetZ: 0.0,
    tiltAngleX: 0.0,
    tiltAngleY: 0.0,
    fovDegrees: 48.0,
    spatialBlur: 0.0,
    vignetteStrength: 0.0,
    atmosphereDim: 0.0,
    targetFps: 60,
    hudVisible: true,
    interactiveCylinder: true
  },
  CASE_STUDY: {
    camOffsetX: 0.0,
    camOffsetY: 0.0,
    camOffsetZ: 0.0,
    tiltAngleX: 0.0,
    tiltAngleY: 0.0,
    fovDegrees: 48.0,
    spatialBlur: 0.0,
    vignetteStrength: 0.15,
    atmosphereDim: 0.0,
    targetFps: 60,
    hudVisible: false,
    interactiveCylinder: false
  },
  STUDIO: {
    camOffsetX: 0.0,
    camOffsetY: 0.28,
    camOffsetZ: -0.90,
    tiltAngleX: 0.05,
    tiltAngleY: 0.0,
    fovDegrees: 55.0,
    spatialBlur: 1.0,
    vignetteStrength: 0.85,
    atmosphereDim: 0.65,
    targetFps: 20,
    hudVisible: false,
    interactiveCylinder: false
  },
  DRAWER: {
    camOffsetX: -0.65,
    camOffsetY: 0.0,
    camOffsetZ: -0.55,
    tiltAngleX: 0.0,
    tiltAngleY: 0.09,
    fovDegrees: 51.0,
    spatialBlur: 0.75,
    vignetteStrength: 0.70,
    atmosphereDim: 0.55,
    targetFps: 20,
    hudVisible: false,
    interactiveCylinder: false
  }
};
