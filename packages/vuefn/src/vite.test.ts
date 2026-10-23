import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Plugin } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

import { vuefn } from '#vite';

let root = '';

afterEach(() => rmSync(root, { recursive: true, force: true }));

function runConfig(plugins: ReturnType<typeof vuefn>) {
  const [plugin] = [plugins].flat() as Plugin[];
  return typeof plugin?.config === 'function'
    ? plugin.config.call({} as never, { root }, { command: 'serve', mode: 'development' })
    : undefined;
}

describe('vuefn', () => {
  it('reads the pages from srcDirectory', () => {
    root = mkdtempSync(join(tmpdir(), 'vuefn-'));
    mkdirSync(join(root, 'app', 'pages'), { recursive: true });
    writeFileSync(join(root, 'app', 'pages', 'index.vue'), '<template><p /></template>');
    void runConfig(vuefn({ srcDirectory: 'app' }));
    expect(existsSync(join(root, 'app', '.vuefn', 'routes', 'index.ts'))).toBe(true);
  });

  it('refuses a routesDirectory of its own', () => {
    expect(() => vuefn({ router: { routesDirectory: 'routes' } })).toThrow('routesDirectory');
  });

  it('pre-bundles vue for ssr so the first dev request has one vue', () => {
    root = mkdtempSync(join(tmpdir(), 'vuefn-'));
    mkdirSync(join(root, 'src', 'pages'), { recursive: true });
    expect(runConfig(vuefn())).toEqual({
      environments: { ssr: { optimizeDeps: { include: ['vue', 'vue/server-renderer'] } } },
    });
  });
});
