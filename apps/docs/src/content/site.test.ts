import { readFileSync } from 'node:fs';

import { expect, it } from 'vitest';

import { VERSION } from './site';

it('shows the version of @vuefn/core', () => {
  const pkg = JSON.parse(
    readFileSync(new URL('../../../../packages/vuefn/package.json', import.meta.url), 'utf8'),
  ) as { version: string };
  expect(VERSION).toBe(pkg.version);
});
