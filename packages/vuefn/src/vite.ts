import { resolve } from 'node:path';

import { tanstackStart } from '@tanstack/vue-start/plugin/vite';
import { normalizePath } from 'vite';
import type { PluginOption } from 'vite';

import { generateRoutes } from '#lib/generate';
import type { RouteFiles } from '#lib/generate';
import { PAGES_DIR, ROUTES_DIR } from '#utils/route-file';
import { pageModule } from '#utils/sfc';

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
      `vuefn: leave out router.routesDirectory, vuefn writes the routes to ${ROUTES_DIR}`,
    );
  }
  let root = '';
  let src = '';
  let routes: RouteFiles = new Map();
  let warnings: string[] = [];
  const refresh = async () => {
    ({ routes, warnings } = await generateRoutes(root, src, options.router));
  };
  return [
    {
      name: 'vuefn',
      enforce: 'pre',
      async config(config) {
        root = resolve(config.root ?? process.cwd());
        src = resolve(root, options.srcDirectory ?? 'src');
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
        // the watcher gives native paths, with backslashes on Windows
        const pages = `${normalizePath(resolve(src, PAGES_DIR))}/`;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const update = (file: string) => {
          if (!normalizePath(file).startsWith(pages) || !file.endsWith('.vue')) return;
          clearTimeout(timer);
          timer = setTimeout(() => void run(), 50);
        };
        server.watcher.on('add', update);
        server.watcher.on('change', update);
        server.watcher.on('unlink', update);
      },
      transform(code, id) {
        const target = routes.get(id);
        if (target) return pageModule(code, id, target);
      },
    },
    tanstackStart({ ...options, router: { ...options.router, routesDirectory: ROUTES_DIR } }),
  ];
}
