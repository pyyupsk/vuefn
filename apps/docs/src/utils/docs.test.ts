import { readdirSync } from 'node:fs';

import { expect, it } from 'vitest';

import { DOCS } from '#content/docs/nav.ts';

import { PAGES, groupOf, neighborsOf, pageMarkdown, slugOf } from './docs';

it('has one Markdown file for each page in the sidebar', () => {
  const files = readdirSync(new URL('../content/docs', import.meta.url)).filter((file) =>
    file.endsWith('.md'),
  );
  expect(new Set(files)).toEqual(new Set(PAGES.map((page) => `${page.slug}.md`)));
});

it('finds the pages around a page', () => {
  const [first, second, third] = PAGES;
  const last = PAGES.at(-1);
  expect(neighborsOf(first?.slug ?? '')).toEqual({ prev: undefined, next: second });
  expect(neighborsOf(second?.slug ?? '')).toEqual({ prev: first, next: third });
  expect(neighborsOf(last?.slug ?? '')).toEqual({ prev: PAGES.at(-2), next: undefined });
  expect(neighborsOf('missing')).toEqual({ prev: undefined, next: undefined });
});

it('turns a heading into an id', () => {
  expect(slugOf('Add a `createServerFn()` call')).toBe('add-a-createserverfn-call');
  expect(slugOf('  Build & deploy!  ')).toBe('build-deploy');
});

it('finds the sidebar group of a page', () => {
  const group = DOCS.at(-1);
  expect(groupOf(group?.pages[0]?.slug ?? '')).toBe(group);
  expect(groupOf('missing')).toBeUndefined();
});

it('writes a page as Markdown without its frontmatter', () => {
  expect(
    pageMarkdown(
      { title: 'Quick start', description: 'Make an app.' },
      '---\nsteps: true\n---\n\nYou need Node.\n',
    ),
  ).toBe('# Quick start\n\n> Make an app.\n\nYou need Node.\n');
});
