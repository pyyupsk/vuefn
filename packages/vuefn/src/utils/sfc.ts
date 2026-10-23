import { babelParse, parse } from '@vue/compiler-sfc';
import { MagicString } from 'magic-string';

export type RouteBlock = Readonly<{ content: string; start: number; end: number }>;

export function findRouteBlock(source: string, filename: string): RouteBlock | null {
  const { descriptor, errors } = parse(source, { filename });
  if (errors.length > 0) throw errors[0];
  const script = descriptor.script;
  if (!script) return null;
  if (script.lang !== 'ts')
    throw new Error(`${filename}: the route <script> block needs lang="ts"`);
  return { content: script.content, start: script.loc.start.offset, end: script.loc.end.offset };
}

export function routePath(content: string, filename: string): string {
  for (const node of babelParse(content, { sourceType: 'module', plugins: ['typescript'] }).program
    .body) {
    if (node.type !== 'ExportNamedDeclaration' || node.declaration?.type !== 'VariableDeclaration')
      continue;
    for (const d of node.declaration.declarations) {
      if (d.id.type !== 'Identifier' || d.id.name !== 'route') continue;
      const call = d.init;
      if (
        call?.type !== 'CallExpression' ||
        call.callee.type !== 'Identifier' ||
        call.callee.name !== 'defineRoute'
      )
        break;
      const [path] = call.arguments;
      if (path?.type === 'StringLiteral') return path.value;
      break;
    }
  }
  throw new Error(
    `${filename}: write the route as export const route = defineRoute("/path", { ... })`,
  );
}

export function routeModule(
  block: RouteBlock | null,
  pageImport: string,
  path: string | null,
): string {
  const create = path === null ? 'createRootRoute' : 'createFileRoute';
  const call = path === null ? 'createRootRoute' : `createFileRoute(${JSON.stringify(path)})`;
  const slot = path === null ? 'shellComponent' : 'component';
  return [
    `import { ${create} } from "@tanstack/vue-router";`,
    `import Page from ${JSON.stringify(pageImport)};`,
    block ? block.content.trim() : 'const route = { options: {} };',
    '',
    `export const Route = ${call}({ ...route.options, ${slot}: Page });`,
    '',
  ].join('\n');
}

export function fileRoutePath(code: string): string | null {
  return /createFileRoute\(\s*(["'`])(.*?)\1\s*\)/.exec(code)?.[2] ?? null;
}

export function exportNames(content: string): string[] {
  const names: string[] = [];
  for (const node of babelParse(content, { sourceType: 'module', plugins: ['typescript'] }).program
    .body) {
    if (node.type !== 'ExportNamedDeclaration' || node.exportKind === 'type') continue;
    const decl = node.declaration;
    if (decl?.type === 'VariableDeclaration') {
      for (const d of decl.declarations) if (d.id.type === 'Identifier') names.push(d.id.name);
    } else if (decl?.type === 'FunctionDeclaration' && decl.id) {
      names.push(decl.id.name);
    }
    for (const spec of node.specifiers) {
      if (spec.type === 'ExportSpecifier' && spec.exportKind !== 'type') {
        names.push(spec.exported.type === 'Identifier' ? spec.exported.name : spec.exported.value);
      }
    }
  }
  return names;
}

export function pageModule(source: string, block: RouteBlock, routeImport: string, id: string) {
  const names = exportNames(block.content).filter((n) => n !== 'route');
  const imports = ['Route as route', ...names].join(', ');
  const code = new MagicString(source);
  code.overwrite(
    block.start,
    block.end,
    `\nimport { ${imports} } from ${JSON.stringify(routeImport)};\nexport { ${['route', ...names].join(', ')} };\n`,
  );
  return { code: code.toString(), map: code.generateMap({ source: id, hires: true }) };
}
