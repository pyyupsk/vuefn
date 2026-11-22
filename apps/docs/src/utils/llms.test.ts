import { expect, it } from 'vitest';

import { llmsIndex } from './llms';

it('links every page as Markdown under its sidebar group', () => {
  const text = llmsIndex(
    [{ title: 'Guides', pages: [{ slug: 'api', title: 'API', description: 'Every export.' }] }],
    'https://example.com',
  );
  expect(text).toMatch(/^# vuefn\n\n> /);
  expect(text).toContain('## Guides\n\n- [API](https://example.com/docs/api.md): Every export.');
  expect(text).toContain('- [All docs in one file](https://example.com/llms-full.txt)');
});
