import { expect, it } from 'vitest';

import { pageMarkdown } from './docs';
import { llmsIndex } from './llms';

it('links every page as Markdown under its sidebar group', () => {
  const text = llmsIndex(
    [{ title: 'Guides', pages: [{ slug: 'api', title: 'API', description: 'Every export.' }] }],
    'https://example.com',
  );
  expect(text).toContain('# vuefn\n\n> One .vue file per route');
  expect(text).toContain('## Guides\n\n- [API](https://example.com/docs/api.md): Every export.');
  expect(text).toContain('- [All docs in one file](https://example.com/llms-full.txt)');
});

it('writes a page as Markdown without its frontmatter', () => {
  expect(
    pageMarkdown(
      { title: 'Quick start', description: 'Make an app.' },
      '---\nsteps: true\n---\n\nYou need Node.\n',
    ),
  ).toBe('# Quick start\n\n> Make an app.\n\nYou need Node.\n');
});
