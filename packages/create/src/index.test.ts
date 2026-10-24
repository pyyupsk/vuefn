import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { env } from 'node:process';
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
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...env, npm_config_user_agent: undefined },
    timeout: 5000,
  });
}

async function runTerminal(...steps: [string, string][]) {
  const command = [process.execPath, cli]
    .map((arg) => `'${arg.replaceAll("'", "'\\''")}'`)
    .join(' ');
  const child = spawn('script', ['-qefc', `stty cols 100 rows 30; exec ${command}`, '/dev/null'], {
    cwd: dir,
    env: { ...env, npm_config_user_agent: undefined },
    timeout: 5000,
  });
  let stdout = '';
  let step = 0;
  child.stdout.on('data', (chunk) => {
    stdout += String(chunk);
    const response = steps[step];
    if (response && stdout.includes(response[0])) {
      step++;
      child.stdin.write(response[1]);
    }
  });
  const [status] = await once(child, 'close');
  return { status, stdout };
}

it.skipIf(process.platform !== 'linux')(
  'asks for a directory in a terminal',
  async () => {
    const result = await runTerminal(['Project directory', 'prompt-app\r']);
    expect(result.status, result.stdout).toBe(0);
    expect(result.stdout).toContain('Project directory');
    expect(result.stdout).toContain('npm i');
    expect(JSON.parse(await readFile(join(dir, 'prompt-app/package.json'), 'utf8')).name).toBe(
      'prompt-app',
    );
  },
  10000,
);

it.skipIf(process.platform !== 'linux').each(['\x03', '\x04'])(
  'cancels with %j before writing files',
  async (key) => {
    const result = await runTerminal(['Project directory', key]);
    expect(result.status, result.stdout).toBe(0);
    expect(result.stdout).toContain('Creation cancelled.');
    expect(await readdir(dir)).toEqual([]);
  },
  10000,
);

it.skipIf(process.platform !== 'linux')(
  'lets the user correct an invalid name before creating the app',
  async () => {
    const result = await runTerminal(
      ['Project directory', 'MyApp\r'],
      ['lowercase letters', '\x7f\x7f\x7f\x7f\x7fprompt-app\r'],
    );
    expect(result.status, result.stdout).toBe(0);
    expect(await readdir(dir)).toEqual(['prompt-app']);
    expect(JSON.parse(await readFile(join(dir, 'prompt-app/package.json'), 'utf8')).name).toBe(
      'prompt-app',
    );
  },
  10000,
);

it.skipIf(process.platform !== 'linux')(
  'asks again when the directory is empty',
  async () => {
    const result = await runTerminal(
      ['Project directory', '\r'],
      ['Enter a directory.', 'prompt-app\r'],
    );
    expect(result.status, result.stdout).toBe(0);
    expect(await readdir(dir)).toEqual(['prompt-app']);
  },
  10000,
);

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
  expect(result.stdout).toContain('npm i');
});

it.each([
  { agent: 'bun/1.4.4 npm/? node/v24.22.1 linux x64', next: '  bun install\n  bun run dev' },
  { agent: 'pnpm/11.18.0 npm/? node/v24.22.1 linux x64', next: '  pnpm i\n  pnpm run dev' },
  { agent: 'npm/11.0.0 node/v24.22.1 linux x64', next: '  npm i\n  npm run dev' },
  { agent: 'yarn/1.22.22 npm/? node/v24.22.1 linux x64', next: '  yarn install\n  yarn run dev' },
  { agent: 'yarn/4.0.0 npm/? node/v24.22.1 linux x64', next: '  yarn install\n  yarn run dev' },
  { agent: 'deno/2.0.0', next: '  deno install\n  deno task dev' },
  { agent: 'nub/1.0.0', next: '  nub install\n  nub run dev' },
  { agent: 'aube/1.0.0', next: '  aube install\n  aube run dev' },
  { agent: 'upm/1.0.0', next: '  upm install\n  upm run dev' },
  { agent: undefined, next: '  npm i\n  npm run dev' },
  { agent: 'unknown/1.0.0', next: '  npm i\n  npm run dev' },
  { agent: 'vi/1.0.0', next: '  npm i\n  npm run dev' },
])('prints next steps for user agent $agent', async ({ agent, next }) => {
  const result = spawnSync(process.execPath, [cli, 'my-app'], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...env, npm_config_user_agent: agent },
    timeout: 5000,
  });
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain(next);
  expect(await readdir(join(dir, 'my-app'))).not.toContain('node_modules');
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
  expect(result.stdout).toContain('Usage: create-vuefn [directory]');
  expect(await readdir(dir)).toEqual([]);
});

it('requires a directory without a terminal', async () => {
  const result = run();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Pass a directory in non-interactive mode.');
  expect(result.stdout).not.toContain('Project directory');
  expect(await readdir(dir)).toEqual([]);
});

it.each([['one', 'two'], ['--unknown']])('rejects invalid arguments %j', async (...args) => {
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
