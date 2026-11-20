/**
 * Spatial State Machine — Camera Waypoints & Scene Configurations
 * Maps abstract route names to physical WebGL camera coordinates and post-processing properties.
 */

import { SpatialWaypoint } from '../../../router/routes';
export type { SpatialWaypoint };

export interface CameraWaypointConfig {
  camOffsetX: number;
  camOffsetY: number;
  camOffsetZ: number;
  tiltAngleX: number;
  tiltAngleY: number;
  blurAmountPx: number;
  brightness: number;
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
    blurAmountPx: 0.0,
    brightness: 1.0,
    hudVisible: true,
    interactiveCylinder: true
  },
  CASE_STUDY: {
    camOffsetX: 0.0,
    camOffsetY: 0.0,
    camOffsetZ: 0.0,
    tiltAngleX: 0.0,
    tiltAngleY: 0.0,
    blurAmountPx: 0.0,
    brightness: 1.0,
    hudVisible: false,
    interactiveCylinder: false
  },
  STUDIO: {
    camOffsetX: 0.0,
    camOffsetY: 0.22,
    camOffsetZ: -0.75,
    tiltAngleX: 0.04,
    tiltAngleY: 0.0,
    blurAmountPx: 16.0,
    brightness: 0.4,
    hudVisible: false,
    interactiveCylinder: false
  },
  DRAWER: {
    camOffsetX: -0.55,
    camOffsetY: 0.0,
    camOffsetZ: -0.45,
    tiltAngleX: 0.0,
    tiltAngleY: 0.08,
    blurAmountPx: 12.0,
    brightness: 0.45,
    hudVisible: false,
    interactiveCylinder: false
  }
};
