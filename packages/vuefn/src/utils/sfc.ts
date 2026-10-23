import { parse } from "@vue/compiler-sfc";
import MagicString from "magic-string";

export type RouteBlock = Readonly<{ content: string; start: number; end: number }>;

export function findRouteBlock(source: string, filename: string): RouteBlock | null {
  const { descriptor, errors } = parse(source, { filename });
  if (errors.length > 0) throw errors[0];
  const script = descriptor.script;
  if (!script) return null;
  if (script.lang !== "ts")
    throw new Error(`${filename}: the route <script> block needs lang="ts"`);
  return { content: script.content, start: script.loc.start.offset, end: script.loc.end.offset };
}

export function routeModule(block: RouteBlock | null, pageImport: string, isRoot: boolean): string {
  const create = isRoot ? "createRootRoute" : "createFileRoute";
  const call = isRoot ? "createRootRoute" : 'createFileRoute("/")';
  const slot = isRoot ? "shellComponent" : "component";
  return [
    `import { ${create} } from "@tanstack/vue-router";`,
    `import Page from ${JSON.stringify(pageImport)};`,
    block ? block.content.trim() : "const route = {};",
    "",
    `export const Route = ${call}({ ...route, ${slot}: Page });`,
    "",
  ].join("\n");
}

export function pageModule(source: string, block: RouteBlock, routeImport: string, id: string) {
  const code = new MagicString(source);
  code.overwrite(
    block.start,
    block.end,
    `\nimport { Route as route } from ${JSON.stringify(routeImport)};\nexport { route };\n`,
  );
  return { code: code.toString(), map: code.generateMap({ source: id, hires: true }) };
}
