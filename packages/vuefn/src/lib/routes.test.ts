import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { readPages } from '#lib/routes';

const root = mkdtempSync(join(tmpdir(), 'vuefn-'));

afterEach(() => rmSync(root, { recursive: true, force: true }));

function pages(files: readonly string[]) {
  const dir = join(root, 'pages');
  for (const file of files) {
    const page = join(dir, file);
    mkdirSync(dirname(page), { recursive: true });
    writeFileSync(page, '<template><p /></template>');
  }
  return dir;
}

describe('readPages', () => {
  it('names a pages directory that does not exist', async () => {
    await expect(readPages(root, join(root, 'missing'))).rejects.toThrow('no pages directory at');
  });

  it('gives each file the path of the TanStack route conventions', async () => {
    const dir = pages([
      '__root.vue',
      'index.vue',
      'about.vue',
      'posts/route.vue',
      'posts/index.vue',
      'posts/$id.vue',
      '_auth/route.vue',
      '_auth/login.vue',
      '(marketing)/pricing.vue',
      'blog_.$slug.vue',
      'script[.]js.vue',
      'posts.{-$category}.vue',
    ]);
    const found = await readPages(root, dir);
    expect(
      [...found]
        .map(([page, route]) => `${page.slice(dir.length + 1)}=${String(route.path)}`)
        .toSorted((a, b) => (a < b ? -1 : 1)),
    ).toEqual([
      '(marketing)/pricing.vue=/(marketing)/pricing',
      '__root.vue=null',
      '_auth/login.vue=/_auth/login',
      '_auth/route.vue=/_auth',
      'about.vue=/about',
      'blog_.$slug.vue=/blog_/$slug',
      'index.vue=/',
      'posts.{-$category}.vue=/posts/{-$category}',
      'posts/$id.vue=/posts/$id',
      'posts/index.vue=/posts/',
      'posts/route.vue=/posts',
      'script[.]js.vue=/script.js',
    ]);
  });

  it('skips files and folders that TanStack excludes from the route tree', async () => {
    const dir = pages([
      'index.vue',
      '-components/header.vue',
      '-helpers/footer.vue',
      'posts/-post-row.vue',
    ]);
    const found = await readPages(root, dir);
    expect([...found.keys()].map((page) => page.slice(dir.length + 1))).toEqual(['index.vue']);
  });

  it('marks the routes that render children, so a missing <Outlet /> is a warning', async () => {
    const dir = pages(['index.vue', 'posts/route.vue', 'posts/$id.vue', 'about.vue']);
    const found = await readPages(root, dir);
    const layout = (file: string) => found.get(join(dir, file))?.layout;
    expect(layout('posts/route.vue')).toBe(true);
    expect(layout('index.vue')).toBe(false);
    expect(layout('about.vue')).toBe(false);
  });
});
