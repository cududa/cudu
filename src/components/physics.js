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

    // Physics runs in world space (scaled coordinates).
    // No coordinate conversion needed here - blockGetter handles voxel conversion.

    return {

        name: 'physics',

        order: 40,

        state: new PhysicsState,

        onAdd: function (entID, state) {
            state.body = noa.physics.addBody()
            // implicitly assume body has a position component, to get size
            var posDat = noa.ents.getPositionData(state.__id)
            setPhysicsFromPosition(state, posDat)
        },


        onRemove: function (entID, state) {
            // update position before removing
            // this lets entity wind up at e.g. the result of a collision
            // even if physics component is removed in collision handler
            if (noa.ents.hasPosition(state.__id)) {
                var pdat = noa.ents.getPositionData(state.__id)
                setPositionFromPhysics(state, pdat)
                backtrackRenderPos(state, pdat, 0, false)
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
                setPositionFromPhysics(state, pdat)
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
                backtrackRenderPos(state, pdat, backtrackAmt, smoothed)
            }
        }

    }

}



// var offset = vec3.create()
var local = vec3.create()

// Set physics body from position state - physics runs in world space
export function setPhysicsFromPosition(physState, posState) {
    var box = physState.body.aabb
    var ext = posState._extents
    // Position is already in world coords
    box.base[0] = ext[0]
    box.base[1] = ext[1]
    box.base[2] = ext[2]
    // Size is already in world units
    vec3.set(box.vec, posState.width, posState.height, posState.width)
    vec3.add(box.max, box.base, box.vec)
}


// Set position state from physics body - physics runs in world space
function setPositionFromPhysics(physState, posState) {
    var base = physState.body.aabb.base
    var hw = posState.width / 2
    // Position is already in world coords
    vec3.set(posState._localPosition,
        base[0] + hw,
        base[1],
        base[2] + hw)
}


function backtrackRenderPos(physState, posState, backtrackAmt, smoothed) {
    // pos = pos + backtrack * body.velocity
    // velocity is in world space
    var vel = physState.body.velocity
    vec3.scaleAndAdd(local, posState._localPosition, vel, backtrackAmt)

    // smooth out update if component is present
    // (this is set after sudden movements like auto-stepping)
    if (smoothed) vec3.lerp(local, posState._renderPosition, local, 0.3)

    // copy values over to renderPosition,
    vec3.copy(posState._renderPosition, local)
}
