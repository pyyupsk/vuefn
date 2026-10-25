export const MANAGERS = ['npm', 'pnpm', 'bun', 'yarn'] as const;
export type Manager = (typeof MANAGERS)[number];

const RUN: Record<Manager, string> = { npm: 'npm run', pnpm: 'pnpm', bun: 'bun run', yarn: 'yarn' };
const EXEC: Record<Manager, string> = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  bun: 'bunx',
  yarn: 'yarn dlx',
};
const INSTALL: Record<Manager, string> = {
  npm: 'npm install',
  pnpm: 'pnpm install',
  bun: 'bun install',
  yarn: 'yarn',
};
const ADD: Record<Manager, string> = {
  npm: 'npm install',
  pnpm: 'pnpm add',
  bun: 'bun add',
  yarn: 'yarn add',
};

function line(text: string, manager: Manager) {
  const create = /^npm create (@[\w-]+)@latest(.*)$/.exec(text);
  if (create) {
    const [, pkg, rest = ''] = create;
    // only npm needs `--` to pass options on to the create package
    return `${manager} create ${pkg}${rest.replace(/ -- /, ' ')}`;
  }
  const install = /^npm install( .+)?$/.exec(text);
  if (install) return install[1] ? `${ADD[manager]}${install[1]}` : INSTALL[manager];
  const run = /^npm run (.+)$/.exec(text);
  if (run) return `${RUN[manager]} ${run[1]}`;
  const exec = /^npx (.+)$/.exec(text);
  if (exec) return `${EXEC[manager]} ${exec[1]}`;
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

const STORAGE_KEY = 'vuefn-package-manager';

export function isManager(value: unknown): value is Manager {
  return MANAGERS.includes(value as Manager);
}

/** The package manager that the reader picked last, or npm. */
export function savedManager(): Manager {
  const saved = globalThis.localStorage?.getItem(STORAGE_KEY);
  return isManager(saved) ? saved : 'npm';
}

/** Shows the tab of `manager` in every package-manager block under `root` and remembers it. */
export function showManager(root: Element, manager: Manager) {
  for (const tab of root.querySelectorAll<HTMLElement>('[data-pm]')) {
    tab.setAttribute('aria-pressed', String(tab.dataset.pm === manager));
  }
  for (const panel of root.querySelectorAll<HTMLElement>('[data-pm-panel]')) {
    panel.hidden = panel.dataset.pmPanel !== manager;
  }
  globalThis.localStorage?.setItem(STORAGE_KEY, manager);
}
