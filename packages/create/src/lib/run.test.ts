import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import { run } from '#lib/run';

const cwd = mkdtempSync(join(tmpdir(), 'vuefn-run-'));

it('resolves the exit code of the command it runs', async () => {
  expect(await run(process.execPath, ['-e', 'process.exit(0)'], cwd)).toBe(0);
  expect(await run(process.execPath, ['-e', 'process.exit(3)'], cwd)).toBe(3);
});

it('runs the command in the target directory', async () => {
  const file = join(cwd, 'where.txt');
  await run(
    process.execPath,
    ['-e', `require('node:fs').writeFileSync(${JSON.stringify(file)}, process.cwd())`],
    cwd,
  );
  expect(readFileSync(file, 'utf8')).toBe(cwd);
  rmSync(file, { force: true });
});
