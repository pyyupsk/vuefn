import { resolve } from "node:path";
import { tanstackStart } from "@tanstack/vue-start/plugin/vite";
import type { PluginOption } from "vite";
import { generateRoutes, routeFileFor } from "#lib/generate";
import { findRouteBlock, pageModule } from "#utils/sfc";

const ROUTES_DIR = ".vuefn/routes";

export function vuefn(): PluginOption {
  let pagesDir = "";
  let routesDir = "";
  return [
    {
      name: "vuefn",
      enforce: "pre",
      config(config) {
        const src = resolve(config.root ?? process.cwd(), "src");
        pagesDir = resolve(src, "pages");
        routesDir = resolve(src, ROUTES_DIR);
        generateRoutes(pagesDir, routesDir);
      },
      transform(code, id) {
        if (!id.startsWith(`${pagesDir}/`) || !id.endsWith(".vue")) return;
        const block = findRouteBlock(code, id);
        if (!block) return;
        return pageModule(code, block, routeFileFor(pagesDir, routesDir, id), id);
      },
    },
    tanstackStart({ router: { routesDirectory: ROUTES_DIR } }),
  ];
}
