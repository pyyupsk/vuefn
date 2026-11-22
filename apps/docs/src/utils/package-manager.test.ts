import { expect, it } from 'vitest';

import { forManager, hasNpmCommand } from './package-manager';

const block = `npm create vuefn@latest my-app -- --template d1
cd my-app
npm install
npm install -D wrangler
npm run db:migrate
npx wrangler d1 create my-app-db`;

it('rewrites npm commands for pnpm', () => {
  expect(forManager(block, 'pnpm')).toBe(`pnpm create vuefn my-app --template d1
cd my-app
pnpm i
pnpm add -D wrangler
pnpm run db:migrate
pnpm dlx wrangler d1 create my-app-db`);
});

it('rewrites npm commands for bun and yarn', () => {
  expect(forManager(block, 'bun').split('\n')).toEqual([
    'bun create vuefn my-app --template d1',
    'cd my-app',
    'bun install',
    'bun add -D wrangler',
    'bun run db:migrate',
    'bun x wrangler d1 create my-app-db',
  ]);
  expect(forManager(block, 'yarn').split('\n')).toEqual([
    'yarn create vuefn my-app --template d1',
    'cd my-app',
    'yarn install',
    'yarn add -D wrangler',
    'yarn run db:migrate',
    'yarn dlx wrangler d1 create my-app-db',
  ]);
});

it('leaves npm blocks and other shells alone', () => {
  expect(forManager(block, 'npm')).toBe(block);
  expect(hasNpmCommand(block)).toBe(true);
  expect(hasNpmCommand('npm install')).toBe(true);
  expect(hasNpmCommand('git init\ncd app')).toBe(false);
});
