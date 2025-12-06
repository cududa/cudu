/**
 * `noa.world` - manages world data, chunks, voxels.
 *
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * var defaultOptions = {
 *   chunkSize: 24,
 *   chunkAddDistance: [2, 2],           // [horizontal, vertical]
 *   chunkRemoveDistance: [3, 3],        // [horizontal, vertical]
 *   worldGenWhilePaused: false,
 *   manuallyControlChunkLoading: false,
 * }
 * ```
 *
 * **Events:**
 *  + `worldDataNeeded = (requestID, dataArr, x, y, z, worldName)`
 *    Alerts client that a new chunk of world data is needed.
 *  + `playerEnteredChunk => (i, j, k)`
 *    Fires when player enters a new chunk
 *  + `chunkAdded => (chunk)`
 *    Fires after a new chunk object is added to the world
 *  + `chunkBeingRemoved = (requestID, dataArr, userData)`
 *    Fires before a chunk is removed from world
*/
export class World extends EventEmitter {
    /** @internal */
    constructor(noa: any, opts: any);
    /** @internal */
    noa: any;
    /** @internal */
    playerChunkLoaded: boolean;
    /** @internal */
    Chunk: typeof Chunk;
    /**
     * Game clients should set this if they need to manually control
     * which chunks to load and unload. When set, client should call
     * `noa.world.manuallyLoadChunk` / `manuallyUnloadChunk` as needed.
     */
    manuallyControlChunkLoading: boolean;
    /**
     * Defining this function sets a custom order in which to create chunks.
     * The function should look like:
     * ```js
     *   (i, j, k) => 1 // return a smaller number for chunks to process first
     * ```
     */
    chunkSortingDistFn: (i: any, j: any, k: any) => number;
    /**
     * Set this higher to cause chunks not to mesh until they have some neighbors.
     * Max legal value is 26 (each chunk will mesh only when all neighbors are present)
     */
    minNeighborsToMesh: number;
    /** When true, worldgen queues will keep running if engine is paused. */
    worldGenWhilePaused: boolean;
    /** Limit the size of internal chunk processing queues
     * @type {number}
    */
    maxChunksPendingCreation: number;
    /** Limit the size of internal chunk processing queues
     * @type {number}
    */
    maxChunksPendingMeshing: number;
    /** Cutoff (in ms) of time spent each **tick**
     * @type {number}
    */
    maxProcessingPerTick: number;
    /** Cutoff (in ms) of time spent each **render**
     * @type {number}
    */
    maxProcessingPerRender: number;
    /** @internal */
    _chunkSize: any;
    /** @internal */
    _chunkAddDistance: number[];
    /** @internal */
    _chunkRemoveDistance: number[];
    /** @internal */
    _addDistanceFn: (i: any, j: any, k: any) => boolean;
    /** @internal */
    _remDistanceFn: (i: any, j: any, k: any) => boolean;
    /** @internal */
    _prevWorldName: string;
    /** @internal */
    _prevPlayerChunkHash: number;
    /** @internal */
    _chunkAddSearchFrom: number;
    /** @internal */
    _prevSortingFn: any;
    /** @internal */
    _sortMeshQueueEvery: number;
    /** @internal All chunks existing in any queue */
    _chunksKnown: LocationQueue;
    /** @internal in range but not yet requested from client */
    _chunksToRequest: LocationQueue;
    /** @internal known to have invalid data (wrong world, eg) */
    _chunksInvalidated: LocationQueue;
    /** @internal out of range, and waiting to be removed */
    _chunksToRemove: LocationQueue;
    /** @internal requested, awaiting data event from client */
    _chunksPending: LocationQueue;
    /** @internal has data, waiting to be (re-)meshed */
    _chunksToMesh: LocationQueue;
    /** @internal priority queue for chunks to re-mesh */
    _chunksToMeshFirst: LocationQueue;
    /**
     * @internal A queue of chunk locations, rather than chunk references.
     * Has only the positive 1/16 quadrant, sorted (reverse order!) */
    _chunksSortedLocs: LocationQueue;
    /** @internal */
    _storage: ChunkStorage;
    /** @internal */
    _coordsToChunkIndexes: typeof chunkCoordsToIndexesGeneral;
    /** @internal */
    _coordsToChunkLocals: typeof chunkCoordsToLocalsPowerOfTwo;
    /** @internal */
    _coordShiftBits: number;
    /** @internal */
    _coordMask: number;
    /** @internal */
    _asyncChunkGenerator: (arg0: number, arg1: number, arg2: number, arg3: number, arg4: AbortSignal) => Promise<{
        voxelData: any;
        userData?: any;
        fillVoxelID?: number;
    } | null>;
    /** @internal */
    _asyncChunkAbortControllers: Map<any, any>;
    /** @internal */
    _asyncChunkPromises: Map<any, any>;
    getBlockID(x?: number, y?: number, z?: number): any;
    getBlockSolidity(x?: number, y?: number, z?: number): boolean;
    getBlockOpacity(x?: number, y?: number, z?: number): any;
    getBlockFluidity(x?: number, y?: number, z?: number): any;
    getBlockProperties(x?: number, y?: number, z?: number): any;
    setBlockID(id?: number, x?: number, y?: number, z?: number): void;
    /**
     * Register an async chunk generator function. When registered, this function
     * will be called instead of emitting `worldDataNeeded` events.
     *
     * The generator function receives:
     * - `x, y, z`: World coordinates of chunk origin
     * - `chunkSize`: Size of chunk in each dimension
     * - `signal`: AbortSignal that fires if chunk is cancelled (left view range)
     *
     * It should return a Promise that resolves to either:
     * - An object `{ voxelData, userData?, fillVoxelID? }` where voxelData is an ndarray
     * - Or `null` to indicate the chunk should be empty (all air)
     *
     * Example:
     * ```js
     * noa.world.registerChunkGenerator(async (x, y, z, chunkSize, signal) => {
     *   // Check for cancellation
     *   if (signal.aborted) return null
     *
     *   // Generate or fetch chunk data
     *   const voxelData = await generateChunk(x, y, z, chunkSize)
     *
     *   // Can check signal periodically during long operations
     *   if (signal.aborted) return null
     *
     *   return { voxelData }
     * })
     * ```
     *
     * @param {function(number, number, number, number, AbortSignal): Promise<{voxelData: *, userData?: *, fillVoxelID?: number}|null>} generatorFn
     */
    registerChunkGenerator(generatorFn: (arg0: number, arg1: number, arg2: number, arg3: number, arg4: AbortSignal) => Promise<{
        voxelData: any;
        userData?: any;
        fillVoxelID?: number;
    } | null>): void;
    /** @param box */
    isBoxUnobstructed(box: any): boolean;
    /**
     * Clients should call this after creating a chunk's worth of data (as an ndarray)
     * If userData is passed in it will be attached to the chunk
     * @param {string} id - the string specified when the chunk was requested
     * @param {*} array - an ndarray of voxel data
     * @param {*} userData - an arbitrary value for game client use
     * @param {number} fillVoxelID - specify a voxel ID here if you want to signify that
     * the entire chunk should be solidly filled with that voxel (e.g. `0` for air).
     * If you do this, the voxel array data will be overwritten and the engine will
     * take a fast path through some initialization steps.
     */
    setChunkData(id: string, array: any, userData?: any, fillVoxelID?: number): void;
    /**
     * Sets the distances within which to load new chunks, and beyond which
     * to unload them. Generally you want the remove distance to be somewhat
     * farther, so that moving back and forth across the same chunk border doesn't
     * keep loading/unloading the same distant chunks.
     *
     * Both arguments can be numbers (number of voxels), or arrays like:
     * `[horiz, vert]` specifying different horizontal and vertical distances.
     * @param {number | number[]} addDist
     * @param {number | number[]} remDist
     */
    setAddRemoveDistance(addDist?: number | number[], remDist?: number | number[]): void;
    /**
     * Automatically configure chunk load/unload distances based on a baked world's bounds
     * and the player's spawn position. This ensures all chunks within the baked area
     * are loadable from the spawn point, avoiding procedural generation overhead
     * and reducing memory usage.
     *
     * @param {{getWorldBounds: () => {minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number, chunkSize: number}}} loader - A loaded BakedWorldLoader instance
     * @param {[number, number, number]} [spawnPosition=[0,0,0]] - Player spawn position in world coordinates
     * @param {object} [options] - Optional configuration
     * @param {number} [options.buffer=1] - Extra chunks to load beyond minimum required (reduces pop-in when moving)
     * @param {number} [options.cameraOffset=0] - Extra chunks (horizontal and vertical) to account for 3rd-person camera distance. For a camera 25 blocks away with chunk size 32, use cameraOffset=1.
     * @example
     * ```js
     * const loader = new BakedWorldLoader()
     * await loader.loadFromURL('/world.noaworld')
     * // Configure for 3rd-person camera (~25 blocks away = ~1 chunk offset)
     * noa.world.setAddRemoveDistanceFromBakedWorld(loader, [15, 5, 0], { buffer: 1, cameraOffset: 1 })
     * ```
     */
    setAddRemoveDistanceFromBakedWorld(loader: {
        getWorldBounds: () => {
            minX: number;
            maxX: number;
            minY: number;
            maxY: number;
            minZ: number;
            maxZ: number;
            chunkSize: number;
        };
    }, spawnPosition?: [number, number, number], options?: {
        buffer?: number;
        cameraOffset?: number;
    }): void;
    /**
     * Tells noa to discard voxel data within a given `AABB` (e.g. because
     * the game client received updated data from a server).
     * The engine will mark all affected chunks for removal, and will later emit
     * new `worldDataNeeded` events (if the chunk is still in draw range).
     */
    invalidateVoxelsInAABB(box: any): void;
    /** When manually controlling chunk loading, tells the engine that the
     * chunk containing the specified (x,y,z) needs to be created and loaded.
     * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    manuallyLoadChunk(x?: number, y?: number, z?: number): void;
    /** When manually controlling chunk loading, tells the engine that the
     * chunk containing the specified (x,y,z) needs to be unloaded and disposed.
     * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    manuallyUnloadChunk(x?: number, y?: number, z?: number): void;
    /** @internal */
    tick(): void;
    /** @internal */
    render(): void;
    /** Dispose world resources and cancel pending async operations */
    dispose(): void;
    /** @internal */
    _getChunkByCoords(x?: number, y?: number, z?: number): Chunk;
    _queueChunkForRemesh(chunk: any): void;
    /** @internal */
    report(): void;
}
import EventEmitter from 'events';
import { Chunk } from './chunk';
import { LocationQueue } from './util';
import { ChunkStorage } from './util';
declare function chunkCoordsToIndexesGeneral(x: any, y: any, z: any): number[];
declare function chunkCoordsToLocalsPowerOfTwo(x: any, y: any, z: any): number[];
export {};
