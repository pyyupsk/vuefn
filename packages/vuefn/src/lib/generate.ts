import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { readPages } from '#lib/routes';
import type { RouterOptions } from '#lib/routes';
import { findRouteBlock, routeModule, routePath, sharedNames } from '#utils/sfc';

export type RoutePaths = Map<
  string,
  Readonly<{ target: string; path: string | null; layout: boolean }>
>;

export type GeneratedRoutes = Readonly<{ routes: RoutePaths; warnings: string[] }>;

export function routeFileFor(pagesDir: string, routesDir: string, page: string): string {
  return join(routesDir, relative(pagesDir, page).replace(/\.vue$/, '.ts'));
}

/** Writes a route file for every page, and leaves the unchanged ones alone. */
export async function generateRoutes(
  root: string,
  pagesDir: string,
  routesDir: string,
  router?: RouterOptions,
): Promise<GeneratedRoutes> {
  const pages = await readPages(root, pagesDir, router);
  const routes: RoutePaths = new Map();
  const warnings: string[] = [];
  for (const [page, { path, layout }] of pages) {
    const target = routeFileFor(pagesDir, routesDir, page);
    const source = readFileSync(page, 'utf8');
    // an editor writes the file empty before it writes the new text
    if (source.trim() === '') continue;
    const block = findRouteBlock(source, page);
    const writtenPath = block && path !== null ? routePath(block.content, page) : null;
    if (path !== null && writtenPath !== null && writtenPath !== path) {
      throw new Error(
        `${page}: the file name gives the path "${path}". Use defineRoute("${path}", ...).`,
      );
    }
    const code = routeModule(
      block,
      relative(dirname(target), page).replaceAll('\\', '/'),
      path,
      page,
      block ? sharedNames(source, block) : [],
    );
    if (!existsSync(target) || readFileSync(target, 'utf8') !== code) {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, code);
    }
    if (layout && !/<Outlet[\s/>]/.test(source)) {
      warnings.push(`${page}: this route renders child routes, so its template needs <Outlet />`);
    }
    routes.set(page, { target, path, layout });
  }
  removeStale(routesDir, new Set([...routes.values()].map((route) => route.target)));
  return { routes, warnings };
}

function removeStale(routesDir: string, keep: Set<string>): void {
  if (!existsSync(routesDir)) return;
  for (const name of readdirSync(routesDir, { recursive: true, encoding: 'utf8' })) {
    const file = join(routesDir, name);
    if (file.endsWith('.ts') && !keep.has(file)) rmSync(file, { force: true });
  }
}
