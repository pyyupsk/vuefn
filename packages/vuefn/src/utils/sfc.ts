import { dirname, relative, resolve } from 'node:path';

import { MagicString } from 'magic-string';
import { babelParse, parse, walk } from 'vue/compiler-sfc';

type RouteBlock = Readonly<{ content: string; start: number; end: number }>;

function findRouteBlock(source: string, filename: string): RouteBlock | null {
  const { descriptor, errors } = parse(source, { filename });
  if (errors.length > 0) throw errors[0];
  const script = descriptor.script;
  if (!script) return null;
  if (script.lang !== 'ts')
    throw new Error(`${filename}: the route <script> block needs lang="ts"`);
  return { content: script.content, start: script.loc.start.offset, end: script.loc.end.offset };
}

type Program = ReturnType<typeof babelParse>['program'];
type Statement = Program['body'][number];
type RouteDeclarator = Extract<
  Extract<Statement, { type: 'VariableDeclaration' }>['declarations'][number],
  object
>;
type CallExpression = Extract<RouteDeclarator['init'], { type: 'CallExpression' }>;
type Pattern = Extract<RouteDeclarator['id'], object>;

function parseBlock(content: string): Program {
  return babelParse(content, { sourceType: 'module', plugins: ['typescript'] }).program;
}

/** An import specifier from `from` to `to`, with forward slashes also on Windows. */
function importPath(from: string, to: string): string {
  const path = relative(dirname(from), to).replaceAll('\\', '/');
  return path.startsWith('.') ? path : `./${path}`;
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

const ROOT_CREATE: Record<string, string> = {
  defineRootRoute: 'createRootRoute',
  defineRootRouteWithContext: 'createRootRouteWithContext',
};
const PAGE_CREATE: Record<string, string> = { defineRoute: 'createFileRoute' };

/** The define call of `export const route`, where only `defineRootRouteWithContext<T>()(...)` is curried. */
function defineCall(declarator: RouteDeclarator | null) {
  const call = declarator?.init;
  if (call?.type !== 'CallExpression') return null;
  const callee = call.callee.type === 'CallExpression' ? call.callee.callee : call.callee;
  if (callee.type !== 'Identifier') return null;
  const curried = callee !== call.callee;
  if (curried !== (callee.name === 'defineRootRouteWithContext')) return null;
  return { call, callee };
}

function isGlobCall(node: { type: string }): node is CallExpression {
  if (node.type !== 'CallExpression') return false;
  const { callee } = node as CallExpression;
  return (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'MetaProperty' &&
    callee.object.meta.name === 'import' &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'glob'
  );
}

/** The path written as the first argument of defineRoute, or undefined when the call has only the options. */
function writtenPath(first: CallExpression['arguments'][number] | undefined, filename: string) {
  if (!first || first.type === 'ObjectExpression') return undefined;
  if (first.type === 'StringLiteral') return first.value;
  if (first.type === 'TemplateLiteral' && first.expressions.length === 0) {
    return first.quasis[0]?.value.cooked ?? '';
  }
  throw new Error(`${filename}: pass the route path as a string`);
}

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

function exportNames(program: Program): string[] {
  const names: string[] = [];
  for (const node of program.body) {
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

/** The top-level names of the route block that are not exported but that the rest of the page uses. */
// shortcut: a word match, so a name in a string also counts, parse the template if that leaks an import
function sharedNames(source: string, block: RouteBlock, program: Program): string[] {
  const exported = new Set(exportNames(program));
  const rest = source.slice(0, block.start) + source.slice(block.end);
  return program.body
    .flatMap((node) =>
      declaredNames(
        node.type === 'ExportNamedDeclaration' && node.declaration ? node.declaration : node,
      ),
    )
    .filter(
      (name) =>
        !exported.has(name) &&
        new RegExp(`(^|[^\\w$])${name.replaceAll('$', '\\$')}($|[^\\w$])`).test(rest),
    );
}

/**
 * The route file of a page: its route block with `defineRoute` turned into `createFileRoute`.
 * TanStack only strips server options written inside the createFileRoute call, so the options stay there.
 */
export function routeModule(
  source: string,
  page: string,
  target: string,
  path: string | null,
): string {
  const isRoot = path === null;
  const slot = isRoot ? 'shellComponent' : 'component';
  const head = [`import VuefnPage from ${JSON.stringify(importPath(target, page))};`];
  const block = findRouteBlock(source, page);
  if (!block) {
    const create = isRoot ? 'createRootRoute' : 'createFileRoute';
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

  const program = parseBlock(block.content);
  const declarator = routeDeclarator(program);
  const define = defineCall(declarator);
  const table = isRoot ? ROOT_CREATE : PAGE_CREATE;
  const name = define?.callee.name ?? '';
  const create = Object.hasOwn(table, name) ? table[name] : undefined;
  if (!declarator || !define || !create) {
    const example = isRoot ? 'defineRootRoute({ ... })' : 'defineRoute({ ... })';
    throw new Error(`${page}: write the route as export const route = ${example}`);
  }
  const { call, callee } = define;
  const [first] = call.arguments;
  const written = isRoot ? undefined : writtenPath(first, page);
  if (written !== undefined && written !== path) {
    throw new Error(
      `${page}: the file name gives the path "${path}". Use defineRoute("${path}", ...).`,
    );
  }
  const hasPath = written !== undefined;
  const options = call.arguments[hasPath ? 1 : 0];
  if (options && options.type !== 'ObjectExpression') {
    throw new Error(`${page}: pass the route options as an object literal`);
  }

  const code = new MagicString(block.content);
  const move = (node: { start?: number | null; end?: number | null }, specifier: string) => {
    const negated = specifier.startsWith('!');
    const pattern = negated ? specifier.slice(1) : specifier;
    if (!pattern.startsWith('.')) return;
    const moved = importPath(target, resolve(dirname(page), pattern));
    code.overwrite(node.start ?? 0, node.end ?? 0, JSON.stringify(`${negated ? '!' : ''}${moved}`));
  };
  for (const node of program.body) {
    if (node.type === 'ImportDeclaration') move(node.source, node.source.value);
  }
  walk(program, {
    enter(node: { type: string }) {
      if (!isGlobCall(node)) return;
      const [patterns] = node.arguments;
      const list = patterns?.type === 'ArrayExpression' ? patterns.elements : [patterns];
      for (const pattern of list)
        if (pattern?.type === 'StringLiteral') move(pattern, pattern.value);
    },
  });
  const id = declarator.id;
  code.overwrite(id.start ?? 0, id.end ?? 0, 'Route');
  code.overwrite(callee.start ?? 0, callee.end ?? 0, create);
  if (hasPath && first) {
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

  const imported = program.body.some(
    (node) =>
      node.type === 'ImportDeclaration' &&
      node.specifiers.some((spec) => spec.local.name === create),
  );
  if (!imported) head.unshift(`import { ${create} } from "@tanstack/vue-router";`);
  const tail = ['export const route = Route;'];
  const shared = sharedNames(source, block, program);
  if (shared.length > 0) tail.push(`export { ${shared.join(', ')} };`);
  return [...head, code.toString().trim(), '', ...tail, ''].join('\n');
}

/** The page with its route block swapped for an import of the route file, or null when it has no route block. */
export function pageModule(source: string, page: string, target: string) {
  const block = findRouteBlock(source, page);
  if (!block) return null;
  const program = parseBlock(block.content);
  const names = [...exportNames(program), ...sharedNames(source, block, program)].filter(
    (n) => n !== 'route',
  );
  const imports = ['Route as route', ...names].join(', ');
  const code = new MagicString(source);
  code.overwrite(
    block.start,
    block.end,
    `\nimport { ${imports} } from ${JSON.stringify(target)};\nexport { ${['route', ...names].join(', ')} };\n`,
  );
  // a page without <script setup> still needs a default export for its template
  if (!/<script[^>]*\ssetup\b/.test(source)) code.appendLeft(block.end, '\nexport default {};');
  return { code: code.toString(), map: code.generateMap({ source: page, hires: true }) };
}
