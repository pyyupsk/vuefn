import { resolve } from 'node:path';

import { tanstackStart } from '@tanstack/vue-start/plugin/vite';
import type { PluginOption } from 'vite';

import { generateRoutes, routeFileFor } from '#lib/generate';
import type { RoutePaths } from '#lib/generate';
import { findRouteBlock, pageModule } from '#utils/sfc';

const ROUTES_DIR = '.vuefn/routes';

/** The options of `vuefn()`: every TanStack Start option except `router.routesDirectory`. */
export type VuefnOptions = NonNullable<Parameters<typeof tanstackStart>[0]>;

/**
 * Vite plugin that turns each `src/pages/*.vue` file into a TanStack Start route.
 * Use it in place of `tanstackStart()`.
 *
 * @param options - TanStack Start options, such as `spa`, `prerender` and `srcDirectory`. vuefn sets `router.routesDirectory`.
 * @returns The vuefn plugin followed by the TanStack Start plugins.
 * @example
 * export default defineConfig({
 *   plugins: [cloudflare({ viteEnvironment: { name: "ssr" } }), vuefn(), vue()],
 * });
 */
export function vuefn(options: VuefnOptions = {}): PluginOption {
  if (options.router?.routesDirectory) {
    throw new Error(
      'vuefn: leave out router.routesDirectory, vuefn writes the routes to .vuefn/routes',
    );
  }
  let root = '';
  let pagesDir = '';
  let routesDir = '';
  let routes: RoutePaths = new Map();
  let warnings: string[] = [];
  const refresh = async () => {
    ({ routes, warnings } = await generateRoutes(root, pagesDir, routesDir, options.router));
  };
  return [
    {
      name: 'vuefn',
      enforce: 'pre',
      async config(config) {
        root = resolve(config.root ?? process.cwd());
        const src = resolve(root, options.srcDirectory ?? 'src');
        pagesDir = resolve(src, 'pages');
        routesDir = resolve(src, ROUTES_DIR);
        await refresh();
      },
      buildStart() {
        for (const warning of warnings) this.warn(warning);
      },
      configEnvironment(name, config) {
        if (name !== 'ssr' || config.optimizeDeps?.noDiscovery !== false) return;
        // Vite finds vue/server-renderer during the first SSR request and loads a second Vue mid-request
        return { optimizeDeps: { include: ['vue', 'vue/server-renderer'] } };
      },
      configureServer(server) {
        // one change rereads every page, because it can add, rename or delete a folder
        const run = async () => {
          try {
            await refresh();
          } catch (error) {
            server.config.logger.error(String(error instanceof Error ? error.message : error));
          }
        };
        let timer: ReturnType<typeof setTimeout> | undefined;
        const update = (file: string) => {
          if (!file.startsWith(`${pagesDir}/`) || !file.endsWith('.vue')) return;
          clearTimeout(timer);
          timer = setTimeout(() => void run(), 50);
        };
        server.watcher.on('add', update);
        server.watcher.on('change', update);
        server.watcher.on('unlink', update);
      },
      transform(code, id) {
        if (!routes.has(id)) return;
        const block = findRouteBlock(code, id);
        if (!block) return;
        return pageModule(code, block, routeFileFor(pagesDir, routesDir, id), id);
      },
    },
    tanstackStart({ ...options, router: { ...options.router, routesDirectory: ROUTES_DIR } }),
  ];
}
