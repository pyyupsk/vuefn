import { resolveCommand } from 'package-manager-detector/commands';
import { getUserAgent } from 'package-manager-detector/detect';

export function getNextSteps(template: string) {
  const manager = getUserAgent() ?? 'npm';
  const steps = [
    resolveCommand(manager, 'install', []),
    ...(template === 'd1' ? [resolveCommand(manager, 'run', ['db:migrate'])] : []),
    resolveCommand(manager, 'run', ['dev']),
  ];
  const commands = steps.map((step) => {
    if (!step) throw new Error(`No install or dev command for ${manager}.`);
    return `  ${[step.command, ...step.args].join(' ')}`;
  });
  return commands.join('\n');
}
