/**
 * `noa.rendering` -
 * Manages all rendering, and the BABYLON scene, materials, etc.
 *
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * {
 *     showFPS: false,
 *     antiAlias: true,
 *     clearColor: [0.8, 0.9, 1],
 *     ambientColor: [0.5, 0.5, 0.5],
 *     lightDiffuse: [1, 1, 1],
 *     lightSpecular: [1, 1, 1],
 *     lightVector: [1, -1, 0.5],
 *     useAO: true,
 *     AOmultipliers: [0.93, 0.8, 0.5],
 *     reverseAOmultiplier: 1.0,
 *     preserveDrawingBuffer: true,
 *     octreeBlockSize: 2,
 *     renderOnResize: true,
 * }
 * ```
*/
export class Rendering {
    /**
     * @internal
     * @param {import('../index').Engine} noa
    */
    constructor(noa: import("../index").Engine, opts: any, canvas: any);
    /** @internal */
    noa: import("../index").Engine;
    /** Whether to redraw the screen when the game is resized while paused */
    renderOnResize: boolean;
    /** @internal */
    useAO: boolean;
    /** @internal */
    aoVals: any;
    /** @internal */
    revAoVal: any;
    /** @internal */
    meshingCutoffTime: number;
    /** @internal */
    _disposed: boolean;
    /** the Babylon.js Engine object for the scene */
    engine: Engine;
    /** the Babylon.js Scene object for the world */
    scene: Scene;
    /** a Babylon.js DirectionalLight that is added to the scene */
    light: DirectionalLight;
    /** the Babylon.js FreeCamera that renders the scene */
    camera: FreeCamera;
    /** @internal */
    _sceneIsReady: boolean;
    /** @internal */
    _sceneReadyCallbacks: any[];
    /** @internal - RAF ID for cancellation on dispose */
    _sceneReadyPollId: any;
    /**
     * Promise that resolves when the Babylon.js scene is fully ready.
     * Use this to defer visual system initialization.
     * @type {Promise<void>}
     */
    sceneReady: Promise<void>;
    /**
     * Constructor helper - set up the Babylon.js scene and basic components
     * @internal
     */
    _initScene(canvas: any, opts: any): void;
    /** @internal */
    _octreeManager: SceneOctreeManager;
    /** @internal */
    _cameraHolder: TransformNode;
    /** @internal */
    _camScreen: import("@babylonjs/core").Mesh;
    /** @internal */
    _camScreenMat: StandardMaterial;
    /** @internal */
    _camLocBlock: number;
    /** @internal */
    _pickOriginVec: Vector3;
    /** @internal */
    _pickDirectionVec: Vector3;
    /** @internal */
    _pickRay: Ray;
    /** @internal */
    _terrainPickPredicate: (mesh: any) => any;
    /** The Babylon `scene` object representing the game world. */
    getScene(): Scene;
    /**
     * Whether the Babylon.js scene is fully initialized and ready for use.
     * Check this before creating meshes/materials if you need synchronous access.
     * @returns {boolean}
     */
    isSceneReady(): boolean;
    /**
     * Register a callback to be called when the scene is ready.
     * If the scene is already ready, the callback is invoked immediately.
     * This is the recommended way to defer visual system initialization.
     *
     * @param {() => void} callback - Function to call when scene is ready
     */
    onSceneReady(callback: () => void): void;
    setMainLightOptions(opts: any): void;
    excludeMeshFromMainLight(mesh: any, includeDescendants?: boolean): void;
    includeMeshInMainLight(mesh: any, includeDescendants?: boolean): void;
    /** @internal */
    tick(dt: any): void;
    /** @internal */
    render(): void;
    /** @internal */
    postRender(): void;
    dispose(): void;
    _highlightMesh: any;
    /** @internal */
    resize(): void;
    pickTerrainFromCamera(distance?: number): import("@babylonjs/core").PickingInfo;
    pickTerrainWithRay(origin: any, direction: any, distance?: number, originIsLocal?: boolean): import("@babylonjs/core").PickingInfo;
    /** @internal */
    highlightBlockFace(show: any, posArr: any, normArr: any): void;
    /**
     * Adds a mesh to the engine's selection/octree logic so that it renders.
     *
     * @param mesh the mesh to add to the scene
     * @param isStatic pass in true if mesh never moves (i.e. never changes chunks)
     * @param pos (optional) global position where the mesh should be
     * @param containingChunk (optional) chunk to which the mesh is statically bound
     */
    addMeshToScene(mesh: any, isStatic?: boolean, pos?: any, containingChunk?: any): void;
    /**
     * Remove a mesh from noa's scene management without disposing it.
     * Use this to temporarily remove a mesh or transfer it to different management.
     * The mesh can be re-added later with addMeshToScene.
     *
     * Note: The onDisposeObservable handler added by addMeshToScene will remain,
     * but it's safe - removeMesh is idempotent and the flag prevents double-processing.
     *
     * @param {import('@babylonjs/core').Mesh} mesh
     */
    removeMeshFromScene(mesh: import("@babylonjs/core").Mesh): void;
    /**
     * Use this to toggle the visibility of a mesh without disposing it or
     * removing it from the scene.
     *
     * @param {import('@babylonjs/core').Mesh} mesh
     * @param {boolean} visible
     */
    setMeshVisibility(mesh: import("@babylonjs/core").Mesh, visible?: boolean): void;
    /**
     * Create a default standardMaterial:
     * flat, nonspecular, fully reflects diffuse and ambient light
     * @returns {StandardMaterial}
     */
    makeStandardMaterial(name: any): StandardMaterial;
    /** @internal */
    prepareChunkForRendering(chunk: any): void;
    /** @internal */
    disposeChunkForRendering(chunk: any): void;
    /** @internal */
    _rebaseOrigin(delta: any): void;
    /** @internal */
    debug_SceneCheck(): string;
    /** @internal */
    debug_MeshCount(): void;
}
import { Engine } from './babylonExports.js';
import { Scene } from './babylonExports.js';
import { DirectionalLight } from './babylonExports.js';
import { FreeCamera } from './babylonExports.js';
import { SceneOctreeManager } from './sceneOctreeManager';
import { TransformNode } from './babylonExports.js';
import { StandardMaterial } from './babylonExports.js';
import { Vector3 } from './babylonExports.js';
import { Ray } from './babylonExports.js';
