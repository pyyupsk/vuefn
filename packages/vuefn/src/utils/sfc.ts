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

type Program = ReturnType<typeof babelParse>['program'];
type RouteDeclarator = Extract<
  Extract<Program['body'][number], { type: 'VariableDeclaration' }>['declarations'][number],
  object
>;

function parseBlock(content: string): Program {
  return babelParse(content, { sourceType: 'module', plugins: ['typescript'] }).program;
}

function routeDeclarator(program: Program): RouteDeclarator | null {
  for (const node of program.body) {
    if (node.type !== 'ExportNamedDeclaration' || node.declaration?.type !== 'VariableDeclaration')
      continue;
    for (const d of node.declaration.declarations) {
      if (d.id.type === 'Identifier' && d.id.name === 'route') return d;
    }
  }
  return null;
}

function routeCall(declarator: RouteDeclarator | null, callee: string) {
  const call = declarator?.init;
  if (call?.type !== 'CallExpression' || call.callee.type !== 'Identifier') return null;
  return call.callee.name === callee ? call : null;
}

export function routePath(content: string, filename: string): string {
  const [path] = routeCall(routeDeclarator(parseBlock(content)), 'defineRoute')?.arguments ?? [];
  if (path?.type === 'StringLiteral') return path.value;
  throw new Error(
    `${filename}: write the route as export const route = defineRoute("/path", { ... })`,
  );
}

function importsName(program: Program, name: string): boolean {
  return program.body.some(
    (node) =>
      node.type === 'ImportDeclaration' && node.specifiers.some((spec) => spec.local.name === name),
  );
}

// TanStack strips server-only options and splits code only when they are written inside the createFileRoute call.
export function routeModule(
  block: RouteBlock | null,
  pageImport: string,
  path: string | null,
  filename: string,
): string {
  const isRoot = path === null;
  const create = isRoot ? 'createRootRoute' : 'createFileRoute';
  const slot = isRoot ? 'shellComponent' : 'component';
  const head = [`import Page from ${JSON.stringify(pageImport)};`];
  if (!block) {
    const call = isRoot ? create : `${create}(${JSON.stringify(path)})`;
    return [
      `import { ${create} } from "@tanstack/vue-router";`,
      ...head,
      '',
      `export const Route = ${call}({ ${slot}: Page });`,
      'export const route = Route;',
      '',
    ].join('\n');
  }

  const content = block.content;
  const program = parseBlock(content);
  const declarator = routeDeclarator(program);
  const call = routeCall(declarator, isRoot ? 'defineRootRoute' : 'defineRoute');
  if (!declarator || !call) {
    const define = isRoot ? 'defineRootRoute({ ... })' : 'defineRoute("/path", { ... })';
    throw new Error(`${filename}: write the route as export const route = ${define}`);
  }
  const options = call.arguments[isRoot ? 0 : 1];
  if (options && options.type !== 'ObjectExpression') {
    throw new Error(`${filename}: pass the route options as an object literal`);
  }

  const code = new MagicString(content);
  const id = declarator.id;
  code.overwrite(id.start ?? 0, id.end ?? 0, 'Route');
  code.overwrite(call.callee.start ?? 0, call.callee.end ?? 0, create);
  if (!isRoot) {
    const [pathArg] = call.arguments;
    const from = pathArg?.end ?? 0;
    const to = options ? (options.start ?? 0) : (call.end ?? 0) - 1;
    if (to > from) code.overwrite(from, to, ')(');
    else code.appendLeft(from, ')(');
  }
  if (options) code.appendLeft((options.start ?? 0) + 1, ` ${slot}: Page,`);
  else code.appendLeft((call.end ?? 0) - 1, `{ ${slot}: Page }`);

  if (!importsName(program, create))
    head.unshift(`import { ${create} } from "@tanstack/vue-router";`);
  return [...head, code.toString().trim(), '', 'export const route = Route;', ''].join('\n');
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
