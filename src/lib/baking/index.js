/**
 * World Baking System for Cudu
 *
 * This module provides tools for "baking" procedurally generated worlds
 * to binary files that can be loaded without procedural generation code,
 * enabling tree-shaking in production builds.
 *
 * @module cudu/baking
 */

// Production loader - lightweight, no proc-gen dependencies
export { BakedWorldLoader } from './bakedWorldLoader.js'

// Development baker - tree-shake in production
export { WorldBaker } from './worldBaker.js'

// Format utilities (shared between loader and baker)
export {
    MAGIC,
    FORMAT_VERSION,
    HEADER_SIZE,
    CHUNK_INDEX_ENTRY_SIZE,
    chunkKey,
} from './worldFormats.js'
