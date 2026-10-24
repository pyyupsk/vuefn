#!/usr/bin/env node
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { cancel, intro, isCancel, log, outro, text, updateSettings } from '@clack/prompts';

import { createApp } from '#lib/create';
import { validateName } from '#utils/validate-name';

async function main() {
  const usage = 'Usage: create-vuefn [directory]';
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { help: { type: 'boolean', short: 'h' } },
  });
  if (values.help) {
    process.stdout.write(`${usage}\n`);
    return;
  }
  if (positionals.length > 1) throw new Error(usage);
  const interactive = process.stdin.isTTY && process.stdout.isTTY;
  let directory = positionals[0];
  if (!directory && !interactive) {
    throw new Error(`${usage}\nPass a directory in non-interactive mode.`);
  }
  if (interactive) intro('create-vuefn');
  if (!directory) {
    updateSettings({ aliases: { '\x04': 'cancel' } });
    const answer = await text({
      message: 'Project directory',
      placeholder: 'my-app',
      validate: (value) => {
        if (!value?.trim()) return 'Enter a directory.';
        return validateName(basename(resolve(value)));
      },
    });
    if (isCancel(answer)) {
      cancel('Creation cancelled.');
      return;
    }
    directory = answer;
  }
  const target = resolve(directory);
  const name = basename(target);
  const template = fileURLToPath(new URL('../template/minimal', import.meta.url));
  await createApp(target, name, template);
  const cd = target === process.cwd() ? '' : `  cd '${directory.replaceAll("'", "'\\''")}'\n`;
  const commands = `${cd}  npm install\n  npm run dev`;
  if (interactive) {
    log.success(`Created ${name}.`);
    outro(`Next steps:\n${commands}`);
  } else {
    process.stdout.write(`Created ${name}.\n\n${commands}\n`);
  }
}

try {
  await main();
} catch (error) {
  process.stderr.write(`create-vuefn: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
