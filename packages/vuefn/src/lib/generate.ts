import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { readPages } from '#lib/routes';
import type { RouterOptions } from '#lib/routes';
import { PAGES_DIR, ROUTES_DIR, routeFileFor } from '#utils/route-file';
import { routeModule } from '#utils/sfc';

/** Each page and the route file written for it. */
export type RouteFiles = Map<string, string>;

export type GeneratedRoutes = Readonly<{ routes: RouteFiles; warnings: string[] }>;

/** Writes a route file for every page in `src/pages`, and leaves the unchanged ones alone. */
export async function generateRoutes(
  root: string,
  src: string,
  router?: RouterOptions,
): Promise<GeneratedRoutes> {
  const pages = await readPages(root, join(src, PAGES_DIR), router);
  const routes: RouteFiles = new Map();
  const warnings: string[] = [];
  for (const [page, { path, layout }] of pages) {
    const target = routeFileFor(src, page);
    const source = readFileSync(page, 'utf8');
    // an editor writes the file empty before it writes the new text
    if (source.trim() === '') continue;
    const code = routeModule(source, page, target, path);
    if (!existsSync(target) || readFileSync(target, 'utf8') !== code) {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, code);
    }
    if (layout && !/<Outlet[\s/>]/.test(source)) {
      warnings.push(`${page}: this route renders child routes, so its template needs <Outlet />`);
    }
    routes.set(page, target);
  }
  removeStale(join(src, ROUTES_DIR), new Set(routes.values()));
  return { routes, warnings };
}

function removeStale(routesDir: string, keep: Set<string>): void {
  if (!existsSync(routesDir)) return;
  for (const name of readdirSync(routesDir, { recursive: true, encoding: 'utf8' })) {
    const file = join(routesDir, name);
    if (file.endsWith('.ts') && !keep.has(file)) rmSync(file, { force: true });
  }
}
