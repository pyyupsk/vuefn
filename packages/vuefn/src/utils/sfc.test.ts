import { describe, expect, it } from 'vitest';

import {
  exportNames,
  fileRoutePath,
  findRouteBlock,
  pageModule,
  routeModule,
  routePath,
} from '#utils/sfc';

const page = `<script lang="ts">
export const route = defineRoute("/", { loader: () => 1 });
</script>

<script setup lang="ts">
const data = route.useLoaderData();
</script>

<template><p>{{ data }}</p></template>
`;

function blockOf(source: string, filename: string) {
  const block = findRouteBlock(source, filename);
  if (!block) throw new Error(`${filename} has no route block`);
  return block;
}

describe('findRouteBlock', () => {
  it('returns the plain script block, not script setup', () => {
    const block = blockOf(page, 'index.vue');
    expect(block.content.trim()).toBe(
      'export const route = defineRoute("/", { loader: () => 1 });',
    );
    expect(page.slice(block.start, block.end)).toBe(block.content);
  });

  it('returns null for a page without a route block', () => {
    expect(findRouteBlock('<template><p /></template>', 'a.vue')).toBeNull();
  });

  it('rejects a route block that is not TypeScript', () => {
    expect(() => findRouteBlock('<script>export const route = {}</script>', 'a.vue')).toThrow(
      'lang="ts"',
    );
  });
});

describe('routeModule', () => {
  it('builds a file route with the page as component', () => {
    const code = routeModule(findRouteBlock(page, 'index.vue'), '../../pages/index.vue', '/');
    expect(code).toContain('import { createFileRoute } from "@tanstack/vue-router";');
    expect(code).toContain('import Page from "../../pages/index.vue";');
    expect(code).toContain(
      'export const Route = createFileRoute("/")({ ...route.options, component: Page });',
    );
  });

  it('builds a root route with the page as shell', () => {
    const code = routeModule(null, '../../pages/__root.vue', null);
    expect(code).toContain('const route = { options: {} };');
    expect(code).toContain(
      'export const Route = createRootRoute({ ...route.options, shellComponent: Page });',
    );
  });
});

describe('pageModule', () => {
  it('swaps the route block for an import of the generated route', () => {
    const block = blockOf(page, 'index.vue');
    const { code } = pageModule(page, block, '/app/src/.vuefn/routes/index.ts', 'index.vue');
    expect(code).toContain('import { Route as route } from "/app/src/.vuefn/routes/index.ts";');
    expect(code).not.toContain('defineRoute');
    expect(code).toContain('<script setup');
  });
});

describe('exportNames', () => {
  it('lists value exports and skips type exports', () => {
    const names = exportNames(`
      import { x } from "y";
      export const getData = createServerFn().handler(() => 1), other = 2;
      export function helper() {}
      const local = 1;
      export { local as renamed };
      export type Data = { a: 1 };
      export const route = defineRoute({});
    `);
    expect(names).toEqual(['getData', 'other', 'helper', 'renamed', 'route']);
  });
});

describe('pageModule exports', () => {
  it('brings every export of the route block into the page', () => {
    const source = `<script lang="ts">
export const getData = createServerFn().handler(() => 1);
export const route = defineRoute({});
</script>
<script setup lang="ts">
getData();
</script>`;
    const block = blockOf(source, 'a.vue');
    const { code } = pageModule(source, block, '/gen/a.ts', 'a.vue');
    expect(code).toContain('import { Route as route, getData } from "/gen/a.ts";');
    expect(code).toContain('export { route, getData };');
  });
});

describe('routePath', () => {
  it('reads the path from defineRoute', () => {
    expect(routePath('export const route = defineRoute("/posts/$id", {});', 'a.vue')).toBe(
      '/posts/$id',
    );
  });

  it('rejects a route without a path', () => {
    expect(() => routePath('export const route = defineRoute({});', 'a.vue')).toThrow(
      'defineRoute("/path"',
    );
  });

  it('rejects a page without export const route', () => {
    expect(() => routePath('export const getData = 1;', 'a.vue')).toThrow('a.vue');
  });
});

describe('fileRoutePath', () => {
  it('reads the path TanStack wrote into the route file', () => {
    expect(fileRoutePath("export const Route = createFileRoute('/posts/$id')({})")).toBe(
      '/posts/$id',
    );
    expect(fileRoutePath('export const Route = createRootRoute({})')).toBeNull();
  });
});
