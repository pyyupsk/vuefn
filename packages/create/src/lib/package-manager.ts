import { resolveCommand } from 'package-manager-detector/commands';
import { getUserAgent } from 'package-manager-detector/detect';

type Manager = NonNullable<ReturnType<typeof getUserAgent>>;

function command(manager: Manager, action: 'install' | 'run', args: string[] = []) {
  const resolved = resolveCommand(manager, action, args);
  if (!resolved) throw new Error(`No ${action} command for ${manager}.`);
  return resolved;
}

export function getInstall() {
  return command(getUserAgent() ?? 'npm', 'install');
}

export function getNextSteps(template: string, installed = false) {
  const manager = getUserAgent() ?? 'npm';
  const steps = [
    ...(installed ? [] : [command(manager, 'install')]),
    ...(template === 'd1' ? [command(manager, 'run', ['db:migrate'])] : []),
    command(manager, 'run', ['dev']),
  ];
  return steps.map((step) => `  ${[step.command, ...step.args].join(' ')}`).join('\n');
}
