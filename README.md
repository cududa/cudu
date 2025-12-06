# Cudu

A high-performance voxel game engine for the browser.

Built on and evolved from [noa-engine](https://github.com/fenomas/noa) by [@fenomas](https://github.com/fenomas).

---

## Features

### Core Engine

- **Chunk-based World** - Efficient voxel storage with configurable chunk sizes
- **Babylon.js 8 Rendering** - Modern WebGL rendering with octree-based culling
- **Entity Component System** - 13 built-in components for physics, movement, collision, and more
- **Voxel Physics** - AABB collision detection for terrain and entities
- **Origin Rebasing** - Prevents floating-point precision issues in large worlds
- **Texture Atlases** - Efficient texture packing for terrain materials
- **Block Registry** - Flexible block definitions with custom mesh support
- **Input System** - Customizable keyboard/mouse bindings with pointer lock support
- **Shadows** - Directional lighting with entity shadow components

### New in Cudu

- **World Baking** - Pre-bake procedurally generated worlds to compressed `.noaworld` binary format for faster loading and smaller production bundles
- **Async Chunk Generation** - Promise-based world generation with `AbortController` support for cancellation
- **Auto-configured Chunk Distances** - Automatically calculate optimal load/unload distances from baked world bounds
- **ES Module Tree-shaking** - Granular `@babylonjs/core` imports enable significant bundle size reduction
- **Scene Readiness** - Proper shader compilation tracking via `sceneReady` Promise
- **Memory Management** - Comprehensive `dispose()` methods throughout all subsystems
- **Block Scale** - Configurable voxel scaling for different world sizes
- **Performance Optimizations** - Cached vectors, material reuse, terrain mesher caching

---

## Installation

```bash
npm install cudu @babylonjs/core
```

## Quick Start

```javascript
import { Engine } from 'cudu'

const noa = new Engine({
    debug: true,
    showFPS: true,
    chunkSize: 24,
    chunkAddDistance: [3, 2],
    chunkRemoveDistance: [4, 3],
})

// Register materials
noa.registry.registerMaterial('dirt', { textureURL: 'dirt.png' })

// Register blocks
noa.registry.registerBlock(1, { material: 'dirt' })

// Handle world generation
noa.world.on('worldDataNeeded', (requestID, data, x, y, z, worldName) => {
    // Fill chunk data with voxel IDs
    for (let i = 0; i < data.shape[0]; i++) {
        for (let j = 0; j < data.shape[1]; j++) {
            for (let k = 0; k < data.shape[2]; k++) {
                const elevation = y + j
                data.set(i, j, k, elevation < 0 ? 1 : 0)
            }
        }
    }
    noa.world.setChunkData(requestID, data)
})
```

For starter projects, see the [noa-examples](https://github.com/fenomas/noa-examples) repo (for original noa-engine). Cudu-specific examples are forthcoming.

---

## World Baking

Cudu supports pre-baking worlds for production builds:

```javascript
// Development: Bake your world
import { WorldBaker } from 'cudu/baking'

const baker = new WorldBaker(noa)
const bakedData = await baker.bakeWorld()

// Production: Load baked world
import { BakedWorldLoader } from 'cudu/baking'

const loader = new BakedWorldLoader(bakedWorldUrl)
noa.world.registerChunkGenerator(async (x, y, z, data, signal) => {
    return loader.loadChunk(x, y, z, data)
})

// Auto-configure chunk distances from baked bounds
noa.world.setAddRemoveDistanceFromBakedWorld(loader, spawnPosition)
```

---

## Using with Vite

Cudu works great with Vite for fast development with hot module reload. The key is aliasing `@babylonjs/core` to the UMD bundle for lower memory footprint:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'

const babylonjsPath = path.dirname(require.resolve('babylonjs/package.json'))

export default defineConfig({
  resolve: {
    alias: [
      // Use UMD bundles for ~40MB less memory usage
      { find: /^@babylonjs\/core(\/.*)?$/, replacement: babylonjsPath },
    ],
    dedupe: ['babylonjs'],
  },
  optimizeDeps: {
    include: ['babylonjs', 'cudu'],
  },
})
```

### Hot Module Reload Pattern

For proper HMR, store the dispose function globally and clean up before recreating:

```typescript
// main.ts
declare global {
  interface Window {
    noa: Engine | null
    disposeGame: (() => void) | null
  }
}

function cleanupPreviousInstance() {
  if (window.disposeGame) {
    window.disposeGame()
    window.disposeGame = null
  }
}

cleanupPreviousInstance()
createGame().then(({ noa, dispose }) => {
  window.noa = noa
  window.disposeGame = dispose
})
```

---

## Loading 3D Models

Use Babylon.js SceneLoader to import GLB/glTF models into your game:

### Directory Structure

```
public/
└── models/
    └── character/
        ├── Character.glb    # Compiled GLB model
        └── texture.png      # Textures

src/
└── models/                  # Source files (optional)
    └── character/
        └── Character.blend  # Blender source
```

### Loading a GLB Model

```typescript
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import '@babylonjs/loaders'  // Registers GLB/glTF loader

async function loadCharacterModel(noa: Engine) {
  const scene = noa.rendering.getScene()

  const result = await SceneLoader.ImportMeshAsync(
    '',
    '/models/character/',
    'Character.glb',
    scene
  )

  // Register meshes with noa's rendering system
  result.meshes.forEach(mesh => {
    noa.rendering.addMeshToScene(mesh, true)
  })

  // Access skeleton for animation
  const skeleton = result.skeletons[0]

  return { meshes: result.meshes, skeleton }
}
```

---

## Documentation

- [API Reference](https://fenomas.github.io/noa/API/) - Full engine API documentation
- [Components](docs/components.md) - ECS component system reference
- [Positions](docs/positions.md) - Coordinate system and origin rebasing
- [History](docs/history.md) - Version changelog

---

## Projects Using **ORIGINAL** noa-engine

When deciding on an engine to use for my own project, I gravitaed towards noa due to it's extensive production usage. Projects that use the original noa-engine:

- [Minecraft Classic](https://classic.minecraft.net/) - Official Mojang browser port
- [bloxd.io](https://bloxd.io/) - Multiplayer voxel games with editable worlds
- [VoxelSrv](https://github.com/Patbox/voxelsrv) - Voxel game inspired by Minecraft
- [CityCraft.io](https://citycraft.io/) - Multiplayer voxel cities
- [OPCraft](https://github.com/latticexyz/opcraft) - Voxel game on Ethereum smart contracts

---

## Contributing

Contributions are welcome! Please open a discussion issue before submitting large changes.

Code style and formatting are set up with ESLint config - VSCode should handle most of it automatically.

---

## Credits

Cudu is built on the excellent [noa-engine](https://github.com/fenomas/noa), created by [Andy Hall (@fenomas)](https://fenomas.com). The original engine architecture and core systems are his work.

Uses [Babylon.js](https://www.babylonjs.com/) for 3D rendering.

## License

[MIT](LICENSE.txt)
