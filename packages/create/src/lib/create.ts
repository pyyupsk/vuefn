import { cp, lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function createApp(target: string, name: string, template: string) {
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(name)) {
    throw new Error(
      'Use 1–63 lowercase letters, numbers or hyphens, starting with a letter or number.',
    );
  }
  await mkdir(target, { recursive: true });
  if ((await lstat(target)).isSymbolicLink()) throw new Error('The target is a symbolic link.');
  if ((await readdir(target)).length > 0) throw new Error('The target directory is not empty.');
  const files = await readdir(template);
  await Promise.all(
    files.map(async (file) => {
      const source = join(template, file);
      const destination = join(target, file === 'gitignore' ? '.gitignore' : file);
      if (file === 'package.json' || file === 'wrangler.jsonc') {
        const content = (await readFile(source, 'utf8')).replaceAll('vuefn-app', name);
        await writeFile(destination, content, { flag: 'wx' });
      } else {
        await cp(source, destination, { recursive: true, force: false, errorOnExist: true });
      }
    }),
  );
}
