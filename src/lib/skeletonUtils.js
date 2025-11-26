import { Quaternion, Vector3 } from 'babylonjs'

/**
 * Apply a pre-rotation and an animation rotation on top of a bone's rest rotation.
 * This expects GLB bones to have linked TransformNodes.
 */
export function applyBoneRotation(transform, restRotation, preRotation, animRotation) {
  const pre = preRotation ? preRotation : Quaternion.Identity()
  const anim = animRotation ? animRotation : Quaternion.Identity()
  transform.rotationQuaternion = restRotation.multiply(pre).multiply(anim)
}

/**
 * Convenience to build a quaternion from an axis/angle in radians.
 */
export function qAxis(axis, angle) {
  return Quaternion.RotationAxis(axis, angle)
}

/**
 * Builds inward roll/yaw mirroring per side.
 * side: 'left' | 'right'
 */
export function shoulderPreRotation(side, down, out, rollIn, yawIn) {
  // Axes per Homer guide:
  // Down = forward -, Out = up -, Roll in = forward (same sign both?), Yaw in = up (mirrored)
  const sign = side === 'left' ? 1 : -1
  const rotDown = qAxis(Vector3.Forward(), -down)
  const rotOut = qAxis(Vector3.Up(), -out)
  const rotRoll = qAxis(Vector3.Forward(), rollIn)
  const rotYaw = qAxis(Vector3.Up(), yawIn * sign)
  return rotDown.multiply(rotOut).multiply(rotRoll).multiply(rotYaw)
}
