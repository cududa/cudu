/**
 * Centralized Babylon.js imports using granular @babylonjs/core paths.
 * This enables tree-shaking when consumers use @babylonjs/core directly.
 *
 * For development with Vite, consumers can alias @babylonjs/core -> babylonjs
 * to use the UMD bundle for reliable HMR.
 */

// Core Engine & Scene
export { Engine } from '@babylonjs/core/Engines/engine';
export { Scene, ScenePerformancePriority } from '@babylonjs/core/scene';

// Cameras
export { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';

// Math
export { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector';
export { Color3, Color4 } from '@babylonjs/core/Maths/math.color';

// Materials
export { Material } from '@babylonjs/core/Materials/material';
export { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
export { MaterialPluginBase } from '@babylonjs/core/Materials/materialPluginBase';
export { Texture } from '@babylonjs/core/Materials/Textures/texture';
export { RawTexture2DArray } from '@babylonjs/core/Materials/Textures/rawTexture2DArray';

// Meshes
export { Mesh } from '@babylonjs/core/Meshes/mesh';
export { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
export { TransformNode } from '@babylonjs/core/Meshes/transformNode';

// Mesh Builders
export { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
export { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder';
export { CreateLines } from '@babylonjs/core/Meshes/Builders/linesBuilder';

// Lights
export { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';

// Culling & Octree
export { Octree } from '@babylonjs/core/Culling/Octrees/octree';
export { OctreeBlock } from '@babylonjs/core/Culling/Octrees/octreeBlock';
export { OctreeSceneComponent } from '@babylonjs/core/Culling/Octrees/octreeSceneComponent';

// Picking
export { Ray } from '@babylonjs/core/Culling/ray';

// Side-effect imports for features that need registration
import '@babylonjs/core/Meshes/thinInstanceMesh';
import '@babylonjs/core/Meshes/instancedMesh';
