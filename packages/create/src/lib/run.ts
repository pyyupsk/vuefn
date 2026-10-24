import { spawn } from 'node:child_process';

export function run(command: string, args: string[], cwd: string) {
  return new Promise<number>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
}
