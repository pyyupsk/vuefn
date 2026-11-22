import { resolveCommand } from 'package-manager-detector/commands';
import { getUserAgent } from 'package-manager-detector/detect';

type Manager = NonNullable<ReturnType<typeof getUserAgent>>;

function command(manager: Manager, action: 'install' | 'run', args: string[] = []) {
  const resolved = resolveCommand(manager, action, args);
  if (!resolved) throw new Error(`No ${action} command for ${manager}.`);
  return resolved;
}

const manager = (): Manager => getUserAgent() ?? 'npm';

export function getInstall() {
  return command(manager(), 'install');
}

export function getNextSteps(setup: readonly string[], installed = false) {
  const agent = manager();
  const steps = [
    ...(installed ? [] : [command(agent, 'install')]),
    ...setup.map((script) => command(agent, 'run', [script])),
    command(agent, 'run', ['dev']),
  ];
  return steps.map((step) => `  ${[step.command, ...step.args].join(' ')}`).join('\n');
}
