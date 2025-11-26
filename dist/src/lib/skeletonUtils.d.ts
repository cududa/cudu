/**
 * Apply a pre-rotation and an animation rotation on top of a bone's rest rotation.
 * This expects GLB bones to have linked TransformNodes.
 */
export function applyBoneRotation(transform: any, restRotation: any, preRotation: any, animRotation: any): void;
/**
 * Convenience to build a quaternion from an axis/angle in radians.
 */
export function qAxis(axis: any, angle: any): Quaternion;
/**
 * Builds inward roll/yaw mirroring per side.
 * side: 'left' | 'right'
 */
export function shoulderPreRotation(side: any, down: any, out: any, rollIn: any, yawIn: any): Quaternion;
import { Quaternion } from 'babylonjs';
