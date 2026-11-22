import { join, relative } from 'node:path';

/** The folders under the source directory: the pages the user writes, and the route files vuefn writes for them. */
export const PAGES_DIR = 'pages';
export const ROUTES_DIR = '.vuefn/routes';

export function routeFileFor(src: string, page: string): string {
  return join(src, ROUTES_DIR, relative(join(src, PAGES_DIR), page).replace(/\.vue$/, '.ts'));
}

/** The path that a route file passes to `createFileRoute`, or null for the root route. */
export function routeFilePath(code: string): string | null {
  return /createFileRoute\(\s*(["'`])(.*?)\1\s*\)/.exec(code)?.[2] ?? null;
}
