import { readFileSync, readdirSync } from 'node:fs';

import { expect, it } from 'vitest';

import { TEMPLATES, TEMPLATE_NAMES } from '#utils/templates';

const folder = new URL('../../template/', import.meta.url);

it('lists every template folder, and only those', () => {
  expect(new Set(TEMPLATE_NAMES)).toEqual(new Set(readdirSync(folder)));
});

it('runs only setup scripts that the template has', () => {
  for (const name of TEMPLATE_NAMES) {
    const { scripts } = JSON.parse(readFileSync(new URL(`${name}/package.json`, folder), 'utf8'));
    for (const script of TEMPLATES[name].setup) expect(scripts, name).toHaveProperty(script);
  }
});
