import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/vite.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    publint: { level: 'suggestion' },
    attw: { profile: 'esm-only', level: 'error' },
  },
  {
    // vue-tsc loads the Volar plugin with require, so this entry also needs a CommonJS file
    entry: ['src/volar.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: false,
    sourcemap: true,
    outExtensions: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),
  },
]);
