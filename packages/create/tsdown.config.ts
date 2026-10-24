import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  dts: false,
  clean: true,
  publint: { level: 'suggestion' },
});
