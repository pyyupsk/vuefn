import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['packages/vuefn/src/**/*.ts'],
      exclude: ['**/*.test.ts'],
      reporter: ['text', 'lcov'],
    },
  },
});
