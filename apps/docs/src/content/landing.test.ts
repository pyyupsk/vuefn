import { expect, it } from 'vitest';

// the landing page shows this output, so it must stay what vuefn really writes
import { findRouteBlock, routeModule, sharedNames } from '../../../../packages/vuefn/src/utils/sfc';
import { HERO_FILES, PAGE_SOURCE, ROUTE_MODULE } from './landing';

it('shows the route module that vuefn writes for the hero page', () => {
  const page = '/app/src/pages/posts/$id.vue';
  const block = findRouteBlock(PAGE_SOURCE, page);
  if (!block) throw new Error('The hero page has no route block');
  const written = routeModule(
    block,
    '../../../pages/posts/$id.vue',
    '/posts/$id',
    page,
    sharedNames(PAGE_SOURCE, block),
    '/app/src/.vuefn/routes/posts/$id.ts',
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
