import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type CodePart = string | readonly [string, string?, number?, unknown?];

type EmbeddedCode = { id: string; content: CodePart[] };

type LanguagePlugin = (context: unknown) => {
  version: number;
  name: string;
  resolveEmbeddedCode(fileName: string, ir: unknown, file: EmbeddedCode): void;
};

/** The call that has no path yet: `defineRoute(` followed by the options or by nothing. */
const CALL = /defineRoute\s*\(\s*(?=[{)])/g;
const ROUTE_PATH = /createFileRoute\(\s*(["'])(.*?)\1/;

/**
 * Volar plugin that types `defineRoute({ ... })` without the path argument.
 * Before the type check it inserts the path of the generated route file, so vue-tsc never sees the call without it.
 *
 * @returns The Vue language plugin, listed as `@vuefn/core/volar` in `vueCompilerOptions.plugins`.
 * @example
 * { "vueCompilerOptions": { "plugins": ["@vuefn/core/volar"] } }
 */
const vuefn: LanguagePlugin = () => ({
  version: 2.2,
  name: 'vuefn',
  resolveEmbeddedCode(fileName, _ir, file) {
    // script_ts is the compiled script that vue-tsc checks, not script_raw
    if (
      file.id !== 'script_ts' ||
      !file.content.some((part) => partOf(part).includes('defineRoute'))
    )
      return;
    const path = routePathOf(fileName);
    if (!path) return;
    file.content = withPath(file.content, path);
  },
});

function partOf(part: CodePart): string {
  return typeof part === 'string' ? part : part[0];
}

function routePathOf(fileName: string): string | null {
  const file = fileName.replaceAll('\\', '/');
  const marker = '/pages/';
  const at = file.lastIndexOf(marker);
  if (at < 0) return null;
  const routeFile = join(
    file.slice(0, at),
    '.vuefn/routes',
    file.slice(at + marker.length).replace(/\.vue$/, '.ts'),
  );
  try {
    return ROUTE_PATH.exec(readFileSync(routeFile, 'utf8'))?.[2] ?? null;
  } catch {
    return null;
  }
}

function withPath(content: CodePart[], path: string): CodePart[] {
  const inserted = `${JSON.stringify(path)}, `;
  const result: CodePart[] = [];
  for (const part of content) {
    if (typeof part === 'string' || !part[0].includes('defineRoute')) {
      result.push(part);
      continue;
    }
    const [text, source, offset, data] = part;
    if (source === undefined || offset === undefined) {
      result.push([text.replaceAll(CALL, () => inserted), source, offset, data]);
      continue;
    }
    let seen = 0;
    for (const match of text.matchAll(CALL)) {
      const at = (match.index ?? 0) + match[0].length;
      result.push([text.slice(seen, at), source, offset + seen, data], inserted, [
        text.slice(at),
        source,
        offset + at,
        data,
      ]);
      seen = at;
    }
    if (seen === 0) result.push(part);
  }
  return result;
}

export default vuefn;
