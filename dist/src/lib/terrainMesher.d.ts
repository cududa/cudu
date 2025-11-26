/**
 * @internal
 * @param {import('../index').Engine} noa
*/
export function TerrainMesher(noa: import("../index").Engine): void;
export class TerrainMesher {
    /**
     * @internal
     * @param {import('../index').Engine} noa
    */
    constructor(noa: import("../index").Engine);
    allTerrainMaterials: import("babylonjs").StandardMaterial[];
    _defaultMaterial: import("babylonjs").StandardMaterial;
    initChunk: (chunk: any) => void;
    disposeChunk: (chunk: any) => void;
    /**
     * meshing entry point and high-level flow
     * @param {import('./chunk').Chunk} chunk
     */
    meshChunk: (chunk: import("./chunk").Chunk, ignoreMaterials?: boolean) => void;
}
