import { relative } from 'node:path';

import { getConfig, physicalGetRouteNodes } from '@tanstack/router-generator';
import type { Config } from '@tanstack/router-generator';
import type * as vueStart from '@tanstack/vue-start/plugin/vite';

export type RouterOptions = NonNullable<Parameters<typeof vueStart.tanstackStart>[0]>['router'];

export type PageRoute = Readonly<{
  path: string | null;
  /** Its template needs `<Outlet />` to show the child routes. */
  layout: boolean;
}>;

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @tanstack/router-generator keeps its own token regex builder private
function segmentRegex(token: Config['indexToken']): RegExp {
  if (typeof token === 'string') return new RegExp(`^(?:${escape(token)})$`);
  if (token instanceof RegExp) return new RegExp(`^(?:${token.source})$`, token.flags);
  return new RegExp(`^(?:${token.regex})$`, token.flags);
}

/** Reads the pages with the TanStack route generator, so the paths match `src/routes` exactly. */
export async function readPages(
  root: string,
  pagesDir: string,
  router: RouterOptions = {},
): Promise<Map<string, PageRoute>> {
  const { indexToken, routeToken, routeFilePrefix, routeFileIgnorePrefix, routeFileIgnorePattern } =
    router ?? {};
  const config = getConfig(
    {
      indexToken,
      routeToken,
      routeFilePrefix,
      routeFileIgnorePrefix,
      routeFileIgnorePattern,
      target: 'vue',
      routesDirectory: pagesDir,
    },
    root,
  );
  const { routeNodes } = await physicalGetRouteNodes(config, root, {
    indexTokenSegmentRegex: segmentRegex(config.indexToken),
    routeTokenSegmentRegex: segmentRegex(config.routeToken),
  });
  const found = routeNodes.map(
    (node) =>
      [
        node.fullPath,
        relative(pagesDir, node.fullPath) === '__root.vue' ? null : (node.routePath ?? null),
      ] as const,
  );
  return new Map(
    found.map(([page, path]) => [
      page,
      {
        path,
        layout:
          path !== null &&
          found.some(([other, otherPath]) => other !== page && otherPath?.startsWith(`${path}/`)),
      },
    ]),
  );
}
