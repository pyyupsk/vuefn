import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { generateRoutes } from '#lib/generate';

const page = (path: string, text = '', body = '') =>
  `<script lang="ts">\nexport const route = defineRoute("${path}", {});\n${body}</script>\n<template><p>${text}</p></template>\n`;

let root = '';
let pages = '';
let routes = '';

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'vuefn-'));
  pages = join(root, 'pages');
  routes = join(root, 'routes');
  mkdirSync(pages);
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

function write(file: string, text = '') {
  const target = join(pages, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
}

describe('generateRoutes', () => {
  it('writes a route file for a nested page and records its path', async () => {
    write('posts/$id.vue', page('/posts/$id'));
    const { routes: found } = await generateRoutes(root, pages, routes);
    const target = join(routes, 'posts', '$id.ts');
    expect(readFileSync(target, 'utf8')).toContain('createFileRoute("/posts/$id")');
    expect(found.get(join(pages, 'posts', '$id.vue'))).toEqual({
      target,
      path: '/posts/$id',
      layout: false,
    });
  });

  it('writes a root route without a path', async () => {
    write(
      '__root.vue',
      '<script lang="ts">\nexport const route = defineRootRoute({});\n</script>\n<template><slot /></template>\n',
    );
    await generateRoutes(root, pages, routes);
    expect(readFileSync(join(routes, '__root.ts'), 'utf8')).toContain('createRootRoute');
  });

  it('does not rewrite the route file after a template-only edit', async () => {
    write('about.vue', page('/about'));
    await generateRoutes(root, pages, routes);
    const target = join(routes, 'about.ts');
    const before = statSync(target).mtimeMs;
    write('about.vue', page('/about', 'new text'));
    await generateRoutes(root, pages, routes);
    expect(statSync(target).mtimeMs).toBe(before);
  });

  it('skips a new empty page until it has content', async () => {
    write('about.vue');
    const { routes: found } = await generateRoutes(root, pages, routes);
    expect(existsSync(join(routes, 'about.ts'))).toBe(false);
    expect(found.size).toBe(0);
  });

  it('removes the route file of a page that moved or was deleted', async () => {
    write('posts/about.vue', page('/posts/about'));
    await generateRoutes(root, pages, routes);
    rmSync(join(pages, 'posts', 'about.vue'));
    write('posts/index.vue', page('/posts/'));
    const { routes: found } = await generateRoutes(root, pages, routes);
    expect(existsSync(join(routes, 'posts', 'about.ts'))).toBe(false);
    expect(existsSync(join(routes, 'posts', 'index.ts'))).toBe(true);
    expect(found.size).toBe(1);
  });

  it('warns about a route with children that has no <Outlet />', async () => {
    write('posts/route.vue', page('/posts'));
    write('posts/$id.vue', page('/posts/$id'));
    const warning = (await generateRoutes(root, pages, routes)).warnings;
    expect(warning).toEqual([
      `${join(pages, 'posts', 'route.vue')}: this route renders child routes, so its template needs <Outlet />`,
    ]);
  });

  it('does not warn when the layout renders its children', async () => {
    write(
      'posts/route.vue',
      '<script lang="ts">\nexport const route = defineRoute("/posts", {});\n</script>\n<template><Outlet /></template>\n',
    );
    write('posts/$id.vue', page('/posts/$id'));
    expect((await generateRoutes(root, pages, routes)).warnings).toEqual([]);
  });
});
