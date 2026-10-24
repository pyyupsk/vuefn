import { cp, lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { validateName } from '#utils/validate-name';

export type CreateOptions = Readonly<{ overwrite?: boolean }>;

export async function createApp(
  target: string,
  name: string,
  template: string,
  { overwrite = false }: CreateOptions = {},
) {
  const error = validateName(name);
  if (error) throw new Error(error);
  const stat = await lstat(target).catch(() => null);
  if (stat?.isSymbolicLink()) throw new Error('The target is a symbolic link.');
  if (stat && !stat.isDirectory()) throw new Error('The target is not a directory.');
  await mkdir(target, { recursive: true });
  if (!overwrite && (await readdir(target)).length > 0) {
    throw new Error('The target directory is not empty.');
  }
  const files = await readdir(template);
  await Promise.all(
    files.map(async (file) => {
      const source = join(template, file);
      const destination = join(target, file === 'gitignore' ? '.gitignore' : file);
      if (file === 'package.json' || file === 'wrangler.jsonc') {
        const content = (await readFile(source, 'utf8')).replaceAll('vuefn-app', name);
        await writeFile(destination, content, { flag: overwrite ? 'w' : 'wx' });
      } else {
        await cp(source, destination, {
          recursive: true,
          force: overwrite,
          errorOnExist: !overwrite,
        });
      }
    }),
  );
}
