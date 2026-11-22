import { env } from 'node:process';

import { afterEach, expect, it } from 'vitest';

import { getNextSteps } from '#lib/package-manager';

afterEach(() => {
  delete env.npm_config_user_agent;
});

it('skips the install step when dependencies are already installed', () => {
  env.npm_config_user_agent = 'npm/11.0.0 node/v24.22.1 linux x64';
  expect(getNextSteps([], true)).toBe('  npm run dev');
});

it('runs the setup scripts of the template before dev', () => {
  env.npm_config_user_agent = 'pnpm/11.18.0 node/v24.22.1 linux x64';
  expect(getNextSteps(['db:migrate'])).toBe('  pnpm i\n  pnpm run db:migrate\n  pnpm run dev');
});
