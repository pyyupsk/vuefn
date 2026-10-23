import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { findRouteBlock, routeModule, routePath } from "#utils/sfc";

export function routeFileFor(pagesDir: string, routesDir: string, page: string): string {
  return join(routesDir, relative(pagesDir, page).replace(/\.vue$/, ".ts"));
}

export function generateRoutes(
  pagesDir: string,
  routesDir: string,
): Map<string, Readonly<{ page: string; path: string }>> {
  const paths = new Map<string, Readonly<{ page: string; path: string }>>();
  rmSync(routesDir, { recursive: true, force: true });
  const pages = readdirSync(pagesDir, { recursive: true, encoding: "utf8" }).filter((f) =>
    f.endsWith(".vue"),
  );
  for (const rel of pages) {
    const page = join(pagesDir, rel);
    const target = routeFileFor(pagesDir, routesDir, page);
    const block = findRouteBlock(readFileSync(page, "utf8"), page);
    const path = rel === "__root.vue" ? null : block ? routePath(block.content, page) : "";
    if (path) paths.set(target, { page, path });
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, routeModule(block, relative(dirname(target), page), path));
  }
  return paths;
}
