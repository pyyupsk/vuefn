import { MagicString } from 'magic-string';
import { babelParse, parse } from 'vue/compiler-sfc';

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

function isPathLiteral(node: { type: string; expressions?: unknown[] } | undefined): boolean {
  return (
    node?.type === 'StringLiteral' ||
    (node?.type === 'TemplateLiteral' && node.expressions?.length === 0)
  );
}

function routeCall(declarator: RouteDeclarator | null, callee: string) {
  const call = declarator?.init;
  if (call?.type !== 'CallExpression' || call.callee.type !== 'Identifier') return null;
  return call.callee.name === callee ? call : null;
}

export function routePath(content: string, filename: string): string | null {
  const call = routeCall(routeDeclarator(parseBlock(content)), 'defineRoute');
  if (!call) {
    throw new Error(`${filename}: write the route as export const route = defineRoute({ ... })`);
  }
  const [path] = call.arguments;
  if (!path || path.type === 'ObjectExpression') return null;
  if (path.type === 'StringLiteral') return path.value;
  if (path.type === 'TemplateLiteral' && path.expressions.length === 0) {
    return path.quasis[0]?.value.cooked ?? null;
  }
  throw new Error(`${filename}: pass the route path as a string`);
}

function importsName(program: Program, name: string): boolean {
  return program.body.some(
    (node) =>
      node.type === 'ImportDeclaration' && node.specifiers.some((spec) => spec.local.name === name),
  );
}

// TanStack only strips server options written inside the createFileRoute call
export function routeModule(
  block: RouteBlock | null,
  pageImport: string,
  path: string | null,
  filename: string,
  shared: readonly string[] = [],
): string {
  const isRoot = path === null;
  let create = isRoot ? 'createRootRoute' : 'createFileRoute';
  const slot = isRoot ? 'shellComponent' : 'component';
  const head = [`import VuefnPage from ${JSON.stringify(pageImport)};`];
  if (!block) {
    const call = isRoot ? create : `${create}(${JSON.stringify(path)})`;
    return [
      `import { ${create} } from "@tanstack/vue-router";`,
      ...head,
      '',
      `export const Route = ${call}({ ${slot}: VuefnPage });`,
      'export const route = Route;',
      '',
    ].join('\n');
  }

  const content = block.content;
  const program = parseBlock(content);
  const declarator = routeDeclarator(program);
  let call = routeCall(declarator, isRoot ? 'defineRootRoute' : 'defineRoute');
  let callee = call?.callee;
  const init = declarator?.init;
  if (isRoot && !call && init?.type === 'CallExpression') {
    const inner = init.callee;
    if (inner.type === 'CallExpression' && inner.callee.type === 'Identifier') {
      if (inner.callee.name === 'defineRootRouteWithContext') {
        call = init;
        callee = inner.callee;
        create = 'createRootRouteWithContext';
      }
    }
  }
  if (!declarator || !call || !callee) {
    const define = isRoot ? 'defineRootRoute({ ... })' : 'defineRoute("/path", { ... })';
    throw new Error(`${filename}: write the route as export const route = ${define}`);
  }
  const [first] = call.arguments;
  const hasPath = !isRoot && isPathLiteral(first);
  const options = call.arguments[isRoot || !hasPath ? 0 : 1];
  if (options && options.type !== 'ObjectExpression') {
    throw new Error(`${filename}: pass the route options as an object literal`);
  }

  const code = new MagicString(content);
  const id = declarator.id;
  code.overwrite(id.start ?? 0, id.end ?? 0, 'Route');
  code.overwrite(callee.start ?? 0, callee.end ?? 0, create);
  if (!isRoot && hasPath && first) {
    const from = first.end ?? 0;
    const to = options ? (options.start ?? 0) : (call.end ?? 0) - 1;
    if (to > from) code.overwrite(from, to, ')(');
    else code.appendLeft(from, ')(');
  }
  if (!isRoot && !hasPath) {
    const injected = `${JSON.stringify(path)})(${options ? '' : `{ ${slot}: VuefnPage }`}`;
    code.appendLeft(options ? (options.start ?? 0) : (call.end ?? 0) - 1, injected);
  }
  if (options) code.appendLeft((options.start ?? 0) + 1, ` ${slot}: VuefnPage,`);
  else if (hasPath || isRoot) code.appendLeft((call.end ?? 0) - 1, `{ ${slot}: VuefnPage }`);

  if (!importsName(program, create))
    head.unshift(`import { ${create} } from "@tanstack/vue-router";`);
  const tail = ['export const route = Route;'];
  if (shared.length > 0) tail.push(`export { ${shared.join(', ')} };`);
  return [...head, code.toString().trim(), '', ...tail, ''].join('\n');
}

export function fileRoutePath(code: string): string | null {
  return /createFileRoute\(\s*(["'`])(.*?)\1\s*\)/.exec(code)?.[2] ?? null;
}

export function exportNames(content: string): string[] {
  const names: string[] = [];
  for (const node of parseBlock(content).body) {
    if (node.type !== 'ExportNamedDeclaration' || node.exportKind === 'type') continue;
    if (node.declaration) names.push(...declaredNames(node.declaration));
    for (const spec of node.specifiers) {
      if (spec.type === 'ExportSpecifier' && spec.exportKind !== 'type') {
        names.push(spec.exported.type === 'Identifier' ? spec.exported.name : spec.exported.value);
      }
    }
  }
  return names;
}

type Statement = Program['body'][number];
type Pattern = Extract<RouteDeclarator['id'], object>;

function patternNames(pattern: Pattern | null | undefined): string[] {
  if (!pattern) return [];
  switch (pattern.type) {
    case 'Identifier':
      return [pattern.name];
    case 'ObjectPattern':
      return pattern.properties.flatMap((p) =>
        patternNames((p.type === 'RestElement' ? p.argument : p.value) as Pattern),
      );
    case 'ArrayPattern':
      return pattern.elements.flatMap((e) => patternNames(e as Pattern | null));
    case 'RestElement':
      return patternNames(pattern.argument);
    case 'AssignmentPattern':
      return patternNames(pattern.left);
    default:
      return [];
  }
}

function declaredNames(node: Statement): string[] {
  switch (node.type) {
    case 'VariableDeclaration':
      return node.declare ? [] : node.declarations.flatMap((d) => patternNames(d.id));
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      return node.id && !node.declare ? [node.id.name] : [];
    case 'TSEnumDeclaration':
      return node.declare ? [] : [node.id.name];
    case 'ImportDeclaration':
      if (node.importKind === 'type') return [];
      return node.specifiers
        .filter((spec) => spec.type !== 'ImportSpecifier' || spec.importKind !== 'type')
        .map((spec) => spec.local.name);
    default:
      return [];
  }
}

export function localNames(content: string): string[] {
  const exported = new Set(exportNames(content));
  return parseBlock(content)
    .body.flatMap((node) =>
      declaredNames(
        node.type === 'ExportNamedDeclaration' && node.declaration ? node.declaration : node,
      ),
    )
    .filter((name) => !exported.has(name));
}

// shortcut: a word match, so a name in a string also counts, parse the template if that leaks an import
export function sharedNames(source: string, block: RouteBlock): string[] {
  const rest = source.slice(0, block.start) + source.slice(block.end);
  return localNames(block.content).filter((name) =>
    new RegExp(`(^|[^\\w$])${name.replaceAll('$', '\\$')}($|[^\\w$])`).test(rest),
  );
}

export function pageModule(source: string, block: RouteBlock, routeImport: string, id: string) {
  const names = [...exportNames(block.content), ...sharedNames(source, block)].filter(
    (n) => n !== 'route',
  );
  const imports = ['Route as route', ...names].join(', ');
  const code = new MagicString(source);
  code.overwrite(
    block.start,
    block.end,
    `\nimport { ${imports} } from ${JSON.stringify(routeImport)};\nexport { ${['route', ...names].join(', ')} };\n`,
  );
  // a page without <script setup> still needs a default export for its template
  if (!/<script[^>]*\ssetup\b/.test(source)) code.appendLeft(block.end, '\nexport default {};');
  return { code: code.toString(), map: code.generateMap({ source: id, hires: true }) };
}
