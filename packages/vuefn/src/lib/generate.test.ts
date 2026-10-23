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
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { generateRoute, generateRoutes, removeRoute } from '#lib/generate';

const page = (path: string, text = '') =>
  `<script lang="ts">\nexport const route = defineRoute("${path}", {});\n</script>\n<template><p>${text}</p></template>\n`;

let pages = '';
let routes = '';

beforeEach(() => {
  const dir = mkdtempSync(join(tmpdir(), 'vuefn-'));
  pages = join(dir, 'pages');
  routes = join(dir, 'routes');
  mkdirSync(pages);
});

afterEach(() => rmSync(join(pages, '..'), { recursive: true, force: true }));

describe('generateRoute', () => {
  it('writes the route file and records its path', () => {
    writeFileSync(join(pages, 'about.vue'), page('/about'));
    const paths = generateRoutes(pages, routes);
    const target = join(routes, 'about.ts');
    expect(readFileSync(target, 'utf8')).toContain('createFileRoute("/about")');
    expect(paths.get(target)).toEqual({ page: join(pages, 'about.vue'), path: '/about' });
  });

  it('does not rewrite the route file after a template-only edit', () => {
    writeFileSync(join(pages, 'about.vue'), page('/about'));
    const paths = generateRoutes(pages, routes);
    const target = join(routes, 'about.ts');
    const before = statSync(target).mtimeMs;
    writeFileSync(join(pages, 'about.vue'), page('/about', 'new text'));
    generateRoute(pages, routes, join(pages, 'about.vue'), paths);
    expect(statSync(target).mtimeMs).toBe(before);
  });

  it('skips a new empty page until it has content', () => {
    writeFileSync(join(pages, 'about.vue'), '');
    const paths = generateRoutes(pages, routes);
    expect(existsSync(join(routes, 'about.ts'))).toBe(false);
    expect(paths.size).toBe(0);
  });

  it('removes the route file when the page is deleted', () => {
    writeFileSync(join(pages, 'about.vue'), page('/about'));
    const paths = generateRoutes(pages, routes);
    removeRoute(pages, routes, join(pages, 'about.vue'), paths);
    expect(existsSync(join(routes, 'about.ts'))).toBe(false);
    expect(paths.size).toBe(0);
  });
});
