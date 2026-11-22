import { readFileSync } from 'node:fs';

import { expect, it } from 'vitest';

import { TEMPLATE_NAMES } from '../../../../packages/create/src/utils/templates';
import { routeModule } from '../../../../packages/vuefn/src/utils/sfc';
import { HERO_FILES, PAGE_SOURCE, ROUTE_MODULE, TEMPLATES } from './landing';

// the landing page shows this output, so it must stay what vuefn really writes
it('shows the route module that vuefn writes for the hero page', () => {
  const written = routeModule(
    PAGE_SOURCE,
    '/app/src/pages/posts/$id.vue',
    '/app/src/.vuefn/routes/posts/$id.ts',
    '/posts/$id',
  );
  expect(written).toBe(ROUTE_MODULE);
});

it('marks only lines that exist in each hero file', () => {
  for (const file of HERO_FILES) {
    const lines = file.code.trimEnd().split('\n').length;
    for (const [from, to, where] of file.ranges) {
      expect(from, file.id).toBeGreaterThan(0);
      expect(to, file.id).toBeLessThanOrEqual(lines);
      expect(file.says[where], `${file.id} ${where}`).toBeTruthy();
    }
  }
});

it('shows each template of the CLI with code that it still holds', () => {
  expect(TEMPLATES.map((template) => template.name)).toEqual(TEMPLATE_NAMES);
  for (const template of TEMPLATES) {
    const [main] = template.files.find(([, , isMain]) => isMain) ?? [];
    const file = new URL(
      `../../../../packages/create/template/${template.name}/${main}`,
      import.meta.url,
    );
    // git on Windows checks the template out with CRLF line endings
    const code = readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
    expect(code, template.name).toContain(template.code);
  }
});
