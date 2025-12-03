# Change Map

This document summarizes the major architectural areas touched by the recent rewrite so reviewers can navigate the repo efficiently.

## Engine Core (`src/index.js`)

- Unifies options such as `playerShadowComponent`, pointer-lock behavior, highlighting toggles, and origin rebasing defaults (lines 41‑59), then wires container, registry, world, rendering, physics, and ECS construction (lines 155‑200). The canonical player entity gets a default component stack and camera target through `followsEntity`, `movement`, `fadeOnZoom`, etc.
- `tick` and `render` now coordinate queue processing, physics, object meshing, deferred chunk meshing, block targeting, and entity systems with profiling hooks (lines 364‑453).
- Adds precise global/local conversion helpers plus the customizable `pick`/`_localPick` raycasting APIs (lines 511‑632), and isolates world-origin rebasing plus default block highlighting logic into helpers (lines 658‑704).

## Container, Camera, and Input Layers

- `src/lib/container.js` wraps `micro-game-shell` to manage DOM readiness, pointer lock/fullscreen, and tick/render wiring (lines 24‑104), exposing pointer/focus state accessors.
- `src/lib/inputs.js` now ships an internal input manager (based on `game-inputs`) with default `KeyboardEvent.code` bindings, mouse button strings for forward/back/strafe/fire/jump actions, and a `dispose()` surface so DOM listeners can be removed when the engine shuts down.
- `src/lib/camera.js` introduces inverse-axis toggles, multiple sensitivity multipliers (including pointer-lock-specific scaling), zoom inertia, and a `cameraTarget` entity that can be reassigned for custom behaviors. Helpers expose global/local positions for precision work.

## Entities and Built-in Components

- `src/lib/entities.js` configures `ent-comp` with built-in components stored under `ents.names.*` and exposes accessors (`getPositionData`, `getPhysics`, `hasMesh`, etc.) plus `onPairwiseEntityCollision` hook.
- Component implementations define the behavior stack reviewers should audit:
  - `position` (`src/components/position.js`) maintains `_localPosition`, `_renderPosition`, and `_extents` derived from global coords to support origin rebasing.
  - `physics` (`src/components/physics.js`) manages `voxel-physics-engine` bodies, syncing positions each tick and smoothing render positions between ticks.
  - `movement` (`src/components/movement.js`) applies Quake-style movement forces, jump buffering, air control, and friction tuning.
  - `receivesInputs` (`src/components/receivesInputs.js`) maps abstract input bindings to movement state.
  - Collision/presentation helpers (`collideEntities`, `collideTerrain`, `mesh`, `followsEntity`, `fadeOnZoom`, `shadow`, `smoothCamera`) show how gameplay systems interact with Babylon meshes, camera zoom, and shadow instancing.

## World/Chunk Pipeline

- `src/lib/world.js` now owns chunk sizing, add/remove ellipsoids, async worldgen, manual chunk loading, neighbor-based meshing delays, and queue processing budgets (lines 14‑190). Public APIs cover block lookup helpers, manual chunk control, distance setters, invalidation, and async chunk-generator registration with `AbortController` support (lines 200‑552, 800‑900).
- Queue processors orchestrate add/remove/mesh flows and emit diagnostics for profiling (lines 405‑711). Helper structs `LocationQueue`/`ChunkStorage` in `src/lib/util.js` explain O(1) lookups and hashing.
- `src/lib/chunk.js` tracks fill states, block handler queues, neighbors, and dirtiness so reviewers can reason about handler lifetimes and neighbor updates.
- `src/lib/world.js` plus `src/lib/objectMesher.js` and `src/lib/terrainMesher.js` separate terrain vs. object meshing. `TerrainMesher` emits `addingTerrainMesh`/`removingTerrainMesh`, and `TerrainMatManager` (`src/lib/terrainMaterials.js`) handles atlas indices, flowing materials, and Babylon plugins for animation/atlas sampling.

## Rendering Stack

- `src/lib/rendering.js` configures Babylon (with compatibility shims), AO defaults, directional lighting, camera holder hierarchy, on-resize behavior, octree block sizing, mesh queues, and APIs like `setMeshVisibility`. It cooperates with the ECS mesh/shadow components and the terrain/object meshers.
- `src/lib/sceneOctreeManager.js` exposes add/remove/rebase/visibility toggles per mesh, letting reviewers trace how culling integrates with origin rebasing.
- Mesh components (`src/components/mesh.js`) register Babylon meshes per entity, `fadeOnZoom` hides meshes while zoomed in, and `shadow` instantiates/disposes shared Babylon discs with per-entity offsets.

## Physics and Movement Integration

- `src/lib/physics.js` wraps `voxel-physics-engine` with local-coordinate-aware voxel getters. `collideTerrain` wires per-entity callbacks, while `collideEntities` (`src/components/collideEntities.js`) handles category/mask filters and pairwise callbacks.
- `movement`/`physics` components describe how inertia, jump buffering, air jumps, responsiveness, and render backtracking work so reviewers can verify regressions or performance changes.

## Documentation / Type Surfaces

- `docs/history.md` now chronicles version-by-version features (texture atlases, async chunk control, time scaling, API docs) for migration auditing.
- `docs/components.md` summarizes component order/responsibilities across tick and render phases.
- `docs/positions.md` explains the local/global coordinate system introduced with origin rebasing.
- Generated `.d.ts` files (e.g., `dist/src/index.d.ts`) mirror the rewritten APIs for editor discoverability.

Use these sections to jump directly into the subsystem you need to review—chunk queues, camera math, ECS ordering, etc.—without remapping the entire repo.
