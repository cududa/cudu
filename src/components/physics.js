/** 
 * @module
 * @internal
 */

import * as vec3 from 'gl-vec3'


export class PhysicsState {
    constructor() {
        /** @type {import('voxel-physics-engine').RigidBody} */
        this.body = null
    }
}


/**
 * Physics component, stores an entity's physics engbody.
 * @param {import('..').Engine} noa
*/

export default function (noa) {

    // Physics runs in "voxel space" (unscaled) for correct collision detection.
    // Positions are converted to/from scaled world coords here.
    var scale = noa.blockScale

    return {

        name: 'physics',

        order: 40,

        state: new PhysicsState,

        onAdd: function (entID, state) {
            state.body = noa.physics.addBody()
            // implicitly assume body has a position component, to get size
            var posDat = noa.ents.getPositionData(state.__id)
            setPhysicsFromPosition(state, posDat, scale)
        },


        onRemove: function (entID, state) {
            // update position before removing
            // this lets entity wind up at e.g. the result of a collision
            // even if physics component is removed in collision handler
            if (noa.ents.hasPosition(state.__id)) {
                var pdat = noa.ents.getPositionData(state.__id)
                setPositionFromPhysics(state, pdat, scale)
                backtrackRenderPos(state, pdat, 0, false, scale)
            }
            // Clear body callbacks before removal to prevent memory retention
            if (state.body) {
                state.body.onStep = null
                state.body.onCollide = null
            }
            noa.physics.removeBody(state.body)
        },


        system: function (dt, states) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var pdat = noa.ents.getPositionData(state.__id)
                if (!pdat) continue // defensive check for mid-frame deletion
                setPositionFromPhysics(state, pdat, scale)
            }
        },


        renderSystem: function (dt, states) {

            var tickPos = noa.positionInCurrentTick
            var tickTime = 1000 / noa.container._shell.tickRate
            tickTime *= noa.timeScale
            var tickMS = tickPos * tickTime

            // tickMS is time since last physics engine tick
            // to avoid temporal aliasing, render the state as if lerping between
            // the last position and the next one
            // since the entity data is the "next" position this amounts to
            // offsetting each entity into the past by tickRate - dt
            // http://gafferongames.com/game-physics/fix-your-timestep/

            var backtrackAmt = (tickMS - tickTime) / 1000
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var id = state.__id
                var pdat = noa.ents.getPositionData(id)
                if (!pdat) continue // defensive check for mid-frame deletion
                var smoothed = noa.ents.cameraSmoothed(id)
                backtrackRenderPos(state, pdat, backtrackAmt, smoothed, scale)
            }
        }

    }

}



// var offset = vec3.create()
var local = vec3.create()

// Convert from scaled world coords to voxel space for physics
export function setPhysicsFromPosition(physState, posState, scale) {
    var box = physState.body.aabb
    var ext = posState._extents
    // Convert position from scaled world coords to voxel space
    box.base[0] = ext[0] / scale
    box.base[1] = ext[1] / scale
    box.base[2] = ext[2] / scale
    // Convert size from scaled world units to voxel units
    var voxelWidth = posState.width / scale
    var voxelHeight = posState.height / scale
    vec3.set(box.vec, voxelWidth, voxelHeight, voxelWidth)
    vec3.add(box.max, box.base, box.vec)
}


// Convert from voxel space back to scaled world coords
function setPositionFromPhysics(physState, posState, scale) {
    var base = physState.body.aabb.base
    var hw = posState.width / 2
    // Convert from voxel space to scaled world coords
    vec3.set(posState._localPosition,
        base[0] * scale + hw,
        base[1] * scale,
        base[2] * scale + hw)
}


function backtrackRenderPos(physState, posState, backtrackAmt, smoothed, scale) {
    // pos = pos + backtrack * body.velocity
    // velocity is in voxel space, scale it for world coords
    var vel = physState.body.velocity
    var scaledBacktrack = backtrackAmt * scale
    vec3.scaleAndAdd(local, posState._localPosition, vel, scaledBacktrack)

    // smooth out update if component is present
    // (this is set after sudden movements like auto-stepping)
    if (smoothed) vec3.lerp(local, posState._renderPosition, local, 0.3)

    // copy values over to renderPosition,
    vec3.copy(posState._renderPosition, local)
}
