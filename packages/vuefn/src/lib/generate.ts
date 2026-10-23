import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { findRouteBlock, routeModule, routePath, sharedNames } from '#utils/sfc';

export type RoutePaths = Map<string, Readonly<{ page: string; path: string }>>;

export function routeFileFor(pagesDir: string, routesDir: string, page: string): string {
  return join(routesDir, relative(pagesDir, page).replace(/\.vue$/, '.ts'));
}

export function generateRoute(
  pagesDir: string,
  routesDir: string,
  page: string,
  paths: RoutePaths,
): void {
  const target = routeFileFor(pagesDir, routesDir, page);
  const source = readFileSync(page, 'utf8');
  if (source.trim() === '') return;
  const block = findRouteBlock(source, page);
  let path: string | null = null;
  if (relative(pagesDir, page) !== '__root.vue') path = block ? routePath(block.content, page) : '';
  if (path) paths.set(target, { page, path });
  else paths.delete(target);
  const code = routeModule(
    block,
    relative(dirname(target), page),
    path,
    page,
    block ? sharedNames(source, block) : [],
  );
  // a template-only edit gives the same code, and rewriting it would reload the route tree
  if (existsSync(target) && readFileSync(target, 'utf8') === code) return;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, code);
}

export function removeRoute(
  pagesDir: string,
  routesDir: string,
  page: string,
  paths: RoutePaths,
): void {
  const target = routeFileFor(pagesDir, routesDir, page);
  paths.delete(target);
  rmSync(target, { force: true });
}

export function generateRoutes(pagesDir: string, routesDir: string): RoutePaths {
  const paths: RoutePaths = new Map();
  rmSync(routesDir, { recursive: true, force: true });
  for (const rel of readdirSync(pagesDir, { recursive: true, encoding: 'utf8' })) {
    if (rel.endsWith('.vue')) generateRoute(pagesDir, routesDir, join(pagesDir, rel), paths);
  }
  return paths;
}
