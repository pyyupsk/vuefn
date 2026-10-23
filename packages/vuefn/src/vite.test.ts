import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Plugin } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

import { vuefn } from '#vite';

let root = '';

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('vuefn', () => {
  it('pre-bundles vue for ssr so the first dev request has one vue', () => {
    root = mkdtempSync(join(tmpdir(), 'vuefn-'));
    mkdirSync(join(root, 'src', 'pages'), { recursive: true });
    const [plugin] = [vuefn()].flat() as Plugin[];
    const config =
      typeof plugin?.config === 'function'
        ? plugin.config.call({} as never, { root }, { command: 'serve', mode: 'development' })
        : undefined;
    expect(config).toEqual({
      environments: { ssr: { optimizeDeps: { include: ['vue', 'vue/server-renderer'] } } },
    });
  });
});
