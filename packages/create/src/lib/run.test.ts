import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
  // a script file, because cmd.exe on Windows would rewrite the quotes of an inline script
  writeFileSync(
    join(cwd, 'where.cjs'),
    "require('node:fs').writeFileSync('where.txt', process.cwd())",
  );
  await run(process.execPath, ['where.cjs'], cwd);
  expect(readFileSync(join(cwd, 'where.txt'), 'utf8')).toBe(cwd);
  rmSync(join(cwd, 'where.txt'), { force: true });
});
