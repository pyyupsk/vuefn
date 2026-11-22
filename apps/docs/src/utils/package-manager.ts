import type { Agent, Command } from 'package-manager-detector';
import { resolveCommand } from 'package-manager-detector/commands';

export const MANAGERS = ['npm', 'pnpm', 'bun', 'yarn'] as const;
export type Manager = (typeof MANAGERS)[number];

// the yarn tab shows Yarn 2 and later, which runs one-off packages with `yarn dlx`
const AGENT: Record<Manager, Agent> = { npm: 'npm', pnpm: 'pnpm', bun: 'bun', yarn: 'yarn@berry' };

function resolve(manager: Manager, command: Command, args: string[]) {
  const resolved = resolveCommand(AGENT[manager], command, args);
  return resolved ? [resolved.command, ...resolved.args].join(' ') : undefined;
}

function line(text: string, manager: Manager) {
  const create = /^npm create ([@\w-]+)@latest(.*)$/.exec(text);
  if (create) {
    const [, pkg, rest = ''] = create;
    // only npm needs `--` to pass options on to the create package
    return `${manager} create ${pkg}${rest.replace(/ -- /, ' ')}`;
  }
  const install = /^npm install( .+)?$/.exec(text);
  if (install) {
    const args = install[1]?.trim().split(' ') ?? [];
    return resolve(manager, args.length ? 'add' : 'install', args) ?? text;
  }
  const run = /^npm run (.+)$/.exec(text);
  if (run?.[1]) return resolve(manager, 'run', run[1].split(' ')) ?? text;
  const exec = /^npx (.+)$/.exec(text);
  if (exec?.[1]) return resolve(manager, 'execute', exec[1].split(' ')) ?? text;
  return text;
}

/** True when a shell block holds an npm command that reads differently in other package managers. */
export function hasNpmCommand(code: string) {
  return /^(npm (create|install|run)|npx) /m.test(code) || /^npm install$/m.test(code);
}

/** Rewrites each npm command of a shell block for another package manager. Other lines stay. */
export function forManager(code: string, manager: Manager) {
  if (manager === 'npm') return code;
  return code
    .split('\n')
    .map((text) => line(text, manager))
    .join('\n');
}

export function isManager(value: unknown): value is Manager {
  return MANAGERS.includes(value as Manager);
}
