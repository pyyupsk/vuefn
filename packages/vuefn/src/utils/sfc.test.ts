import { describe, expect, it } from 'vitest';

import { pageModule, routeModule } from '#utils/sfc';

const PAGE = '/app/src/pages/page.vue';
const TARGET = '/app/src/.vuefn/routes/page.ts';

const sfc = (route: string, rest = '') => `<script lang="ts">\n${route}\n</script>\n${rest}`;

function moduleOf(route: string, path: string | null, page = PAGE, target = TARGET) {
  return routeModule(sfc(route), page, target, path);
}

function pageOf(source: string) {
  const result = pageModule(source, PAGE, TARGET);
  if (!result) throw new Error('no route block');
  return result.code;
}

describe('routeModule', () => {
  it('keeps a template literal path', () => {
    const code = moduleOf(
      'export const route = defineRoute(`/posts`, { loader: () => 1 });',
      '/posts',
    );
    expect(code).toContain('createFileRoute(`/posts`)({ component: VuefnPage,');
  });

  it('moves relative imports to the folder of the route file', () => {
    const code = moduleOf(
      `import { notes } from '../db/schema';

export const route = defineRoute({});`,
      '/posts/',
      '/app/src/pages/posts/index.vue',
      '/app/src/.vuefn/routes/posts/index.ts',
    );
    expect(code).toContain('import VuefnPage from "../../../pages/posts/index.vue";');
    expect(code).toContain('from "../../../pages/db/schema"');
  });

  it('moves relative import.meta.glob patterns to the folder of the route file', () => {
    const code = moduleOf(
      `const docs = import.meta.glob('../content/*.md');
const raw = import.meta.glob(['./*.md', '!./draft.md', '/src/root/*.md'], { query: '?raw' });

export const route = defineRoute({ loader: () => [docs, raw] });`,
      '/posts/',
      '/app/src/pages/posts/index.vue',
      '/app/src/.vuefn/routes/posts/index.ts',
    );
    expect(code).toContain('import.meta.glob("../../../pages/content/*.md")');
    expect(code).toContain(
      'import.meta.glob(["../../../pages/posts/*.md", "!../../../pages/posts/draft.md", \'/src/root/*.md\'], { query: \'?raw\' })',
    );
  });

  it('writes the path itself when defineRoute takes only the options', () => {
    const code = moduleOf(
      `import { defineRoute } from 'vuefn';
export const route = defineRoute({
  loader: () => 1,
});`,
      '/posts/',
    );
    expect(code).toContain(
      'export const Route = createFileRoute("/posts/")({ component: VuefnPage,',
    );
  });

  it('writes the options inside a real createFileRoute call', () => {
    const code = moduleOf(
      `import { defineRoute } from 'vuefn';
export const route = defineRoute('/posts/$id', {
  loader: () => 1,
  headers: () => ({ a: '1' }),
});`,
      '/posts/$id',
    );
    expect(code).toContain('import { createFileRoute } from "@tanstack/vue-router";');
    expect(code).toContain('import VuefnPage from "../../pages/page.vue";');
    expect(code)
      .toContain(`export const Route = createFileRoute('/posts/$id')({ component: VuefnPage,
  loader: () => 1,
  headers: () => ({ a: '1' }),
});`);
    expect(code).toContain('export const route = Route;');
    expect(code).not.toContain('...');
  });

  it('adds the component when the route has no options', () => {
    expect(moduleOf(`export const route = defineRoute('/about');`, '/about')).toContain(
      "export const Route = createFileRoute('/about')({ component: VuefnPage });",
    );
  });

  it('builds a root route with the page as shell', () => {
    const code = moduleOf(`export const route = defineRootRoute({ head: () => ({}) });`, null);
    expect(code).toContain('import { createRootRoute } from "@tanstack/vue-router";');
    expect(code).toContain(
      'export const Route = createRootRoute({ shellComponent: VuefnPage, head: () => ({}) });',
    );
  });

  it('builds a root route with a typed context', () => {
    const code = moduleOf(
      `export const route = defineRootRouteWithContext<{ user: string }>()({ head: () => ({}) });`,
      null,
    );
    expect(code).toContain('import { createRootRouteWithContext } from "@tanstack/vue-router";');
    expect(code).toContain(
      'export const Route = createRootRouteWithContext<{ user: string }>()({ shellComponent: VuefnPage, head: () => ({}) });',
    );
  });

  it('builds a route for a page without a route block', () => {
    const template = '<template><p /></template>';
    expect(routeModule(template, PAGE, TARGET, '/page')).toContain(
      'export const Route = createFileRoute("/page")({ component: VuefnPage });',
    );
    expect(routeModule(template, PAGE, TARGET, null)).toContain(
      'export const Route = createRootRoute({ shellComponent: VuefnPage });',
    );
  });

  it('does not import createFileRoute twice', () => {
    const code = moduleOf(
      `import { createFileRoute } from '@tanstack/vue-router';
export const route = defineRoute('/a', {});`,
      '/a',
    );
    expect(code.match(/import \{ createFileRoute \}/g)).toHaveLength(1);
  });

  it('rejects options that are not an object literal', () => {
    expect(() => moduleOf(`export const route = defineRoute('/a', options);`, '/a')).toThrow(
      `${PAGE}: pass the route options as an object literal`,
    );
  });

  it('rejects a path that differs from the file name', () => {
    expect(() => moduleOf(`export const route = defineRoute('/abut', {});`, '/about')).toThrow(
      'Use defineRoute("/about", ...)',
    );
  });

  it('rejects a path that is not a literal', () => {
    expect(() => moduleOf('export const route = defineRoute(path, {});', '/a')).toThrow(
      'pass the route path as a string',
    );
  });

  it('rejects a route block without export const route', () => {
    expect(() => moduleOf('export const getData = 1;', '/a')).toThrow(
      'write the route as export const route = defineRoute({ ... })',
    );
    expect(() => moduleOf("export const route = defineRoute('/a', {});", null)).toThrow(
      'write the route as export const route = defineRootRoute',
    );
  });

  it('rejects a define function that only looks like one', () => {
    expect(() => moduleOf('export const route = toString({});', '/a')).toThrow(
      'write the route as export const route',
    );
  });

  it('rejects a route block that is not TypeScript', () => {
    expect(() =>
      routeModule('<script>export const route = {}</script>', PAGE, TARGET, '/a'),
    ).toThrow('lang="ts"');
  });
});

describe('pageModule', () => {
  it('swaps the route block for an import of the route file, and keeps script setup', () => {
    const code = pageOf(
      sfc(
        'export const route = defineRoute("/", { loader: () => 1 });',
        '<script setup lang="ts">\nconst data = route.useLoaderData();\n</script>\n<template><p>{{ data }}</p></template>\n',
      ),
    );
    expect(code).toContain(`import { Route as route } from "${TARGET}";`);
    expect(code).not.toContain('defineRoute');
    expect(code).toContain('const data = route.useLoaderData();');
    expect(code).not.toContain('export default {};');
  });

  it('gives a page without script setup a default export', () => {
    expect(pageOf(sfc('export const route = defineRoute("/", {});'))).toContain(
      'export default {};',
    );
  });

  it('leaves a page without a route block alone', () => {
    expect(pageModule('<template><p /></template>', PAGE, TARGET)).toBeNull();
  });

  it('imports every value export, and skips type exports', () => {
    const code = pageOf(
      sfc(`import { x } from "y";
export const getData = createServerFn().handler(() => 1), other = 2;
export function helper() {}
const local = 1;
export { local as renamed };
export type Data = { a: 1 };
export const route = defineRoute({});`),
    );
    expect(code).toContain(
      `import { Route as route, getData, other, helper, renamed } from "${TARGET}";`,
    );
  });
});

describe('route block names in the page', () => {
  const block = `import { a } from 'x';
import type { T } from 'x';
import { type U, b } from 'x';
import c, * as d from 'x';
const { e, f: [g, ...h] } = obj, i = 1;
let j = 2;
function k() {}
class L {}
enum M { A }
declare const n: number;
type O = 1;
interface P {}
const unused = 1;
export const route = defineRoute('/a', {});
export function q() {}`;
  const source = sfc(
    block,
    '<script setup lang="ts">\nuse(a, b, c, d, e, g, h, i, j, k, L, M, n, q, unused2);\n</script>',
  );
  const shared = 'a, b, c, d, e, g, h, i, j, k, L, M';

  it('exports from the route file only the local names that the page uses', () => {
    expect(routeModule(source, PAGE, TARGET, '/a')).toContain(`export { ${shared} };`);
  });

  it('imports the exports and the shared names into the page', () => {
    expect(pageOf(source)).toContain(`import { Route as route, q, ${shared} } from "${TARGET}";`);
  });
});
