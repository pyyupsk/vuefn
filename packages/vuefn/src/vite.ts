import { resolve } from 'node:path';

import { tanstackStart } from '@tanstack/vue-start/plugin/vite';
import type { PluginOption } from 'vite';

import { generateRoute, generateRoutes, removeRoute, routeFileFor } from '#lib/generate';
import type { RoutePaths } from '#lib/generate';
import { fileRoutePath, findRouteBlock, pageModule } from '#utils/sfc';

const ROUTES_DIR = '.vuefn/routes';

/**
 * Vite plugin that turns each `src/pages/*.vue` file into a TanStack Start route.
 * Use it in place of `tanstackStart()`.
 *
 * @returns The vuefn plugin followed by the TanStack Start plugins.
 * @example
 * export default defineConfig({
 *   plugins: [cloudflare({ viteEnvironment: { name: "ssr" } }), vuefn(), vue()],
 * });
 */
export function vuefn(): PluginOption {
  let pagesDir = '';
  let routesDir = '';
  let paths: RoutePaths = new Map();
  const isPage = (file: string) => file.startsWith(`${pagesDir}/`) && file.endsWith('.vue');
  return [
    {
      name: 'vuefn',
      enforce: 'pre',
      config(config) {
        const src = resolve(config.root ?? process.cwd(), 'src');
        pagesDir = resolve(src, 'pages');
        routesDir = resolve(src, ROUTES_DIR);
        paths = generateRoutes(pagesDir, routesDir);
      },
      configureServer(server) {
        const update = (file: string) => {
          if (!isPage(file)) return;
          try {
            generateRoute(pagesDir, routesDir, file, paths);
          } catch (error) {
            server.config.logger.error(String(error instanceof Error ? error.message : error));
          }
        };
        server.watcher.on('add', update);
        server.watcher.on('change', update);
        server.watcher.on('unlink', (file) => {
          if (isPage(file)) removeRoute(pagesDir, routesDir, file, paths);
        });
      },
      transform(code, id) {
        const written = paths.get(id);
        const actual = written && fileRoutePath(code);
        if (written && actual && actual !== written.path) {
          this.error(
            `${written.page}: the file name gives the path "${actual}". Use defineRoute("${actual}", ...).`,
          );
        }
        if (!isPage(id)) return;
        const block = findRouteBlock(code, id);
        if (!block) return;
        return pageModule(code, block, routeFileFor(pagesDir, routesDir, id), id);
      },
    },
    tanstackStart({ router: { routesDirectory: ROUTES_DIR } }),
  ];
}
