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
    camOffsetX: 0.38,
    camOffsetY: 0.04,
    camOffsetZ: -0.72,
    tiltAngleX: 0.0,
    tiltAngleY: -0.16,
    fovDegrees: 50.0,
    spatialBlur: 0.65,
    vignetteStrength: 0.08,
    atmosphereDim: 0.0,
    targetFps: 60,
    hudVisible: false,
    interactiveCylinder: true
  },
  DRAWER: {
    camOffsetX: 0.0,
    camOffsetY: 0.22,
    camOffsetZ: -1.25,
    tiltAngleX: 0.04,
    tiltAngleY: 0.0,
    fovDegrees: 50.0,
    spatialBlur: 0.12,
    vignetteStrength: 0.22,
    atmosphereDim: 0.0,
    targetFps: 60,
    hudVisible: false,
    interactiveCylinder: true
  }
};
