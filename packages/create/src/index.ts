#!/usr/bin/env node
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { cancel, intro, isCancel, log, outro, select, text, updateSettings } from '@clack/prompts';

import { createApp } from '#lib/create';
import { getNextSteps } from '#lib/package-manager';
import { TEMPLATES, isTemplate } from '#lib/templates';
import type { TemplateName } from '#lib/templates';
import { validateName } from '#utils/validate-name';

async function main() {
  const usage = `Usage: create-vuefn [directory] [--template ${TEMPLATES.join('|')}]`;
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      template: { type: 'string', short: 't' },
    },
  });
  if (values.help) {
    process.stdout.write(`${usage}\n`);
    return;
  }
  if (positionals.length > 1) throw new Error(usage);
  const requested = values.template;
  if (requested !== undefined && !isTemplate(requested)) {
    throw new Error(`Unknown template "${requested}". Use ${TEMPLATES.join(', ')}.`);
  }
  let template: TemplateName = requested ?? 'minimal';
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
  if (!requested && interactive) {
    const answer = await select({
      message: 'Template',
      options: [
        { value: 'minimal', label: 'Minimal', hint: 'one page' },
        { value: 'tailwind', label: 'Tailwind', hint: 'with Tailwind CSS' },
        { value: 'd1', label: 'D1', hint: 'with Drizzle and Cloudflare D1' },
      ],
    });
    if (isCancel(answer)) {
      cancel('Creation cancelled.');
      return;
    }
    template = answer;
  }
  const target = resolve(directory);
  const name = basename(target);
  const templateDir = fileURLToPath(new URL(`../template/${template}`, import.meta.url));
  const cd = target === process.cwd() ? '' : `  cd '${directory.replaceAll("'", "'\\''")}'\n`;
  const commands = `${cd}${getNextSteps(template)}`;
  await createApp(target, name, templateDir);
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
