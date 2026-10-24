import { resolveCommand } from 'package-manager-detector/commands';
import { getUserAgent } from 'package-manager-detector/detect';

export function getNextSteps() {
  const manager = getUserAgent() ?? 'npm';
  const install = resolveCommand(manager, 'install', []);
  const dev = resolveCommand(manager, 'run', ['dev']);
  if (!install || !dev) throw new Error(`No install or dev command for ${manager}.`);
  return [install, dev].map(({ command, args }) => `  ${[command, ...args].join(' ')}`).join('\n');
}
