import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import vuefn from '#volar';

type Part = string | readonly [string, string?, number?, unknown?];
type File = { id: string; lang: string; content: Part[] };

const root = mkdtempSync(join(tmpdir(), 'vuefn-'));

afterEach(() => rmSync(root, { recursive: true, force: true }));

function plugin() {
  const instance = vuefn({}) as unknown as {
    resolveEmbeddedCode(fileName: string, ir: unknown, file: File): void;
  };
  return instance;
}

function source(code: string, path = '/posts/') {
  const page = join(root, 'pages', 'posts', 'index.vue');
  const route = join(root, '.vuefn', 'routes', 'posts', 'index.ts');
  mkdirSync(dirname(page), { recursive: true });
  mkdirSync(dirname(route), { recursive: true });
  writeFileSync(page, '<template><p /></template>');
  writeFileSync(route, `export const Route = createFileRoute(${JSON.stringify(path)})({});`);
  return page;
}

function text(file: File): string {
  return file.content.map((part) => (typeof part === 'string' ? part : part[0])).join('');
}

describe('volar plugin', () => {
  it('inserts the path into defineRoute before the type check', () => {
    const fileName = source('');
    const file: File = {
      id: 'script_ts',
      lang: 'ts',
      content: [['export const route = defineRoute({\n  loader: () => 1,\n});', 'script', 0, {}]],
    };
    plugin().resolveEmbeddedCode(fileName, {}, file);
    expect(text(file)).toContain('defineRoute("/posts/", {');
  });

  it('leaves a call that already has a path alone', () => {
    const file: File = {
      id: 'script_ts',
      lang: 'ts',
      content: [['export const route = defineRoute("/posts/", {});', 'script', 0, {}]],
    };
    plugin().resolveEmbeddedCode(source(''), {}, file);
    expect(text(file)).toBe('export const route = defineRoute("/posts/", {});');
  });

  it('skips a page whose route file has no path yet', () => {
    const file: File = {
      id: 'script_ts',
      lang: 'ts',
      content: [['export const route = defineRoute({});', 'script', 0, {}]],
    };
    plugin().resolveEmbeddedCode(join(root, 'pages', 'missing.vue'), {}, file);
    expect(text(file)).toBe('export const route = defineRoute({});');
  });
});
