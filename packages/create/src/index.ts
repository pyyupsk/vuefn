#!/usr/bin/env node
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { createApp } from '#lib/create';

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { help: { type: 'boolean', short: 'h' } },
  });
  if (values.help) {
    process.stdout.write('Usage: create-vuefn <directory>\n');
  } else {
    if (positionals.length !== 1) throw new Error('Usage: create-vuefn <directory>');
    const target = resolve(positionals[0]);
    const name = basename(target);
    const template = fileURLToPath(new URL('../template/minimal', import.meta.url));
    await createApp(target, name, template);
    const cd =
      target === process.cwd() ? '' : `  cd '${positionals[0].replaceAll("'", "'\\''")}'\n`;
    process.stdout.write(`Created ${name}.\n\n${cd}  npm install\n  npm run dev\n`);
  }
} catch (error) {
  process.stderr.write(`create-vuefn: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
