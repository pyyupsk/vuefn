import { readdirSync } from 'node:fs';

import { expect, it } from 'vitest';

import { DOCS } from '../content/docs/nav';
import { groupOf, neighborsOf, pageOf, slugOf } from './docs';

it('has one Markdown file for each page in the sidebar', () => {
  const files = readdirSync(new URL('../content/docs', import.meta.url)).filter((file) =>
    file.endsWith('.md'),
  );
  const slugs = DOCS.flatMap((group) => group.pages.map((page) => `${page.slug}.md`));
  expect(new Set(files)).toEqual(new Set(slugs));
});

it('finds the pages around a page', () => {
  expect(neighborsOf('introduction')).toEqual({ prev: undefined, next: pageOf('quick-start') });
  expect(neighborsOf('quick-start')).toEqual({
    prev: pageOf('introduction'),
    next: pageOf('the-route-block'),
  });
  expect(neighborsOf('limits')).toEqual({ prev: pageOf('cli'), next: undefined });
  expect(neighborsOf('missing')).toEqual({ prev: undefined, next: undefined });
});

it('turns a heading into an id', () => {
  expect(slugOf('Add a `createServerFn()` call')).toBe('add-a-createserverfn-call');
  expect(slugOf('  Build & deploy!  ')).toBe('build-deploy');
});

it('finds the sidebar group of a page', () => {
  expect(groupOf('quick-start')?.title).toBe('Getting started');
  expect(groupOf('missing')).toBeUndefined();
});
