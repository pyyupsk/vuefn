import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Plugin } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

import { vuefn } from '#vite';

let root = '';

afterEach(() => rmSync(root, { recursive: true, force: true }));

async function runConfig(plugins: ReturnType<typeof vuefn>) {
  const [plugin] = [plugins].flat() as Plugin[];
  if (typeof plugin?.config !== 'function') return;
  return plugin.config.call({} as never, { root }, { command: 'serve', mode: 'development' });
}

describe('vuefn', () => {
  it('reads the pages from srcDirectory', async () => {
    root = mkdtempSync(join(tmpdir(), 'vuefn-'));
    mkdirSync(join(root, 'app', 'pages'), { recursive: true });
    writeFileSync(join(root, 'app', 'pages', 'index.vue'), '<template><p /></template>');
    await runConfig(vuefn({ srcDirectory: 'app' }));
    expect(existsSync(join(root, 'app', '.vuefn', 'routes', 'index.ts'))).toBe(true);
  });

  it('refuses a routesDirectory of its own', () => {
    expect(() => vuefn({ router: { routesDirectory: 'routes' } })).toThrow('routesDirectory');
  });

  it('stops the build when defineRoute names another path than the file name', async () => {
    root = mkdtempSync(join(tmpdir(), 'vuefn-'));
    mkdirSync(join(root, 'src', 'pages'), { recursive: true });
    writeFileSync(
      join(root, 'src', 'pages', 'about.vue'),
      '<script lang="ts">\nexport const route = defineRoute("/abut", {});\n</script>',
    );
    await expect(runConfig(vuefn())).rejects.toThrow('defineRoute("/about", ...)');
  });

  it('pre-bundles vue for ssr only when ssr discovery is on', () => {
    const [plugin] = [vuefn()].flat() as Plugin[];
    const hook = plugin?.configEnvironment;
    const run = (name: string, noDiscovery: boolean) =>
      typeof hook === 'function'
        ? hook.call({} as never, name, { optimizeDeps: { noDiscovery } }, {
            command: 'serve',
            mode: 'development',
          } as never)
        : undefined;
    expect(run('ssr', false)).toEqual({
      optimizeDeps: { include: ['vue', 'vue/server-renderer'] },
    });
    expect(run('ssr', true)).toBeUndefined();
    expect(run('client', false)).toBeUndefined();
  });
});
