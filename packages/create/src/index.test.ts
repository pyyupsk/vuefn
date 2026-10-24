import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, expect, it } from 'vitest';

const cli = fileURLToPath(new URL('./index.ts', import.meta.url));
let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vuefn-create-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

function run(...args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: dir, encoding: 'utf8' });
}

it('creates a Workers app without installing dependencies', async () => {
  const result = run('my-app');
  expect(result.status, result.stderr).toBe(0);
  const app = join(dir, 'my-app');
  const pkg = JSON.parse(await readFile(join(app, 'package.json'), 'utf8'));
  expect(pkg.name).toBe('my-app');
  expect(pkg.dependencies['@vuefn/core']).toBe('^0.1.0');
  expect(pkg.scripts).not.toHaveProperty('postinstall');
  const home = await readFile(join(app, 'src/pages/index.vue'), 'utf8');
  expect(home).toContain('<h1>Hello, vuefn!</h1>');
  expect(home).not.toContain('<script');
  const worker = await readFile(join(app, 'wrangler.jsonc'), 'utf8');
  expect(worker).toContain('"name": "my-app"');
  expect(worker).toContain('"main": "@tanstack/vue-start/server-entry"');
  expect(await readFile(join(app, '.gitignore'), 'utf8')).toContain('node_modules');
  expect(await readdir(app)).not.toContain('node_modules');
  expect(result.stdout).toContain('npm install');
});

it('leaves a nonempty directory unchanged', async () => {
  const app = join(dir, 'existing');
  await mkdir(app);
  await writeFile(join(app, 'keep.txt'), 'keep me');
  const result = run('existing');
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('not empty');
  expect(await readdir(app)).toEqual(['keep.txt']);
  expect(await readFile(join(app, 'keep.txt'), 'utf8')).toBe('keep me');
});

it('does not follow a target directory symlink', async () => {
  const actual = join(dir, 'actual');
  await mkdir(actual);
  await symlink(actual, join(dir, 'linked'), 'dir');
  const result = run('linked');
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('symbolic link');
  expect(await readdir(actual)).toEqual([]);
});

it('creates an app in the current empty directory', async () => {
  const app = join(dir, 'current-app');
  await mkdir(app);
  const result = spawnSync(process.execPath, [cli, '.'], { cwd: app, encoding: 'utf8' });
  expect(result.status, result.stderr).toBe(0);
  expect(JSON.parse(await readFile(join(app, 'package.json'), 'utf8')).name).toBe('current-app');
  expect(result.stdout).not.toContain('  cd ');
});

it('creates missing parent directories', async () => {
  const result = run('examples/my-app/');
  expect(result.status, result.stderr).toBe(0);
  expect(JSON.parse(await readFile(join(dir, 'examples/my-app/package.json'), 'utf8')).name).toBe(
    'my-app',
  );
});

it('prints a usable cd command when a parent path contains shell characters', () => {
  const path = "it's $HOME/my-app";
  const result = run(path);
  expect(result.status, result.stderr).toBe(0);
  const command = result.stdout.split('\n').find((line) => line.startsWith('  cd '));
  expect(command).toBeDefined();
  const shell = spawnSync('sh', ['-c', `${command} && pwd`], { cwd: dir, encoding: 'utf8' });
  expect(shell.status, shell.stderr).toBe(0);
  expect(shell.stdout.trim()).toBe(join(dir, path));
});

it.each(['--help', '-h'])('prints help for %s without writing files', async (flag) => {
  const result = run(flag);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('Usage: create-vuefn <directory>');
  expect(await readdir(dir)).toEqual([]);
});

it.each([[], ['one', 'two'], ['--unknown']])('rejects invalid arguments %j', async (...args) => {
  const result = run(...args);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('create-vuefn:');
  expect(await readdir(dir)).toEqual([]);
});

it('leaves an existing file unchanged', async () => {
  await writeFile(join(dir, 'my-app'), 'keep me');
  const result = run('my-app');
  expect(result.status).toBe(1);
  expect(await readFile(join(dir, 'my-app'), 'utf8')).toBe('keep me');
});

it('refuses hidden files rather than merging into the directory', async () => {
  await mkdir(join(dir, 'existing'));
  await writeFile(join(dir, 'existing/.gitignore'), 'keep me');
  const result = run('existing');
  expect(result.status).toBe(1);
  expect(await readdir(join(dir, 'existing'))).toEqual(['.gitignore']);
});

it.each(['MyApp', 'my app', '@scoped', 'a'.repeat(64)])(
  'rejects the invalid project name %s before writing files',
  async (name) => {
    const result = run(name);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('lowercase letters');
    expect(await readdir(dir)).toEqual([]);
  },
);
