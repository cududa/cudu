import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.js',

  // Keep @babylonjs/core as external - consumers will provide it
  external: (id) => id.startsWith('@babylonjs/core'),

  output: [
    {
      file: 'dist/noa.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/noa.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
  ],

  plugins: [
    resolve({
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
  ],
};
