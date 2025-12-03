
import { Physics as VoxelPhysics } from 'voxel-physics-engine'




var defaultOptions = {
    gravity: [0, -10, 0],
    airDrag: 0.1,
}

/**
 * `noa.physics` - Wrapper module for the physics engine.
 * 
 * This module extends 
 * [voxel-physics-engine](https://github.com/fenomas/voxel-physics-engine),
 * so turn on "Inherited" to see its APIs here, or view the base module 
 * for full docs.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * 
 * ```js
 * {
 *     gravity: [0, -10, 0],
 *     airDrag: 0.1,
 *     fluidDrag: 0.4,
 *     fluidDensity: 2.0,
 *     minBounceImpulse: .5,      // cutoff for a bounce to occur
 * }
 * ```
*/

export class Physics extends VoxelPhysics {

    /** 
     * @internal 
     * @param {import('../index').Engine} noa
    */
    constructor(noa, opts) {
        opts = Object.assign({}, defaultOptions, opts)
        var world = noa.world
        var solidLookup = noa.registry._solidityLookup
        var fluidLookup = noa.registry._fluidityLookup

        // Physics runs in "voxel space" (unscaled) so voxel-aabb-sweep works correctly.
        // Positions are converted to/from scaled world coords in the physics component.
        // The offset needs to be converted to voxel space as well.
        var offset = noa.worldOriginOffset
        var scale = noa.blockScale

        // blockGetter receives voxel-space coordinates, convert offset to voxel space
        var blockGetter = (x, y, z) => {
            var vx = Math.floor(x + offset[0] / scale)
            var vy = Math.floor(y + offset[1] / scale)
            var vz = Math.floor(z + offset[2] / scale)
            var id = world.getBlockID(vx, vy, vz)
            return solidLookup[id]
        }
        var isFluidGetter = (x, y, z) => {
            var vx = Math.floor(x + offset[0] / scale)
            var vy = Math.floor(y + offset[1] / scale)
            var vz = Math.floor(z + offset[2] / scale)
            var id = world.getBlockID(vx, vy, vz)
            return fluidLookup[id]
        }

        super(opts, blockGetter, isFluidGetter)

        /** @internal */
        this._blockScale = scale
    }

}



