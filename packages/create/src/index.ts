#!/usr/bin/env node
import { lstat, readdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  select,
  text,
  updateSettings,
} from '@clack/prompts';

import { createApp } from '#lib/create';
import { getInstall, getNextSteps } from '#lib/package-manager';
import { run } from '#lib/run';
import { cdCommand } from '#utils/cd-command';
import { TEMPLATES, TEMPLATE_NAMES, isTemplate } from '#utils/templates';
import type { TemplateName } from '#utils/templates';
import { validateName } from '#utils/validate-name';

async function main() {
  const usage = `Usage: create-vuefn [directory] [--template ${TEMPLATE_NAMES.join('|')}]`;
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
    throw new Error(`Unknown template "${requested}". Use ${TEMPLATE_NAMES.join(', ')}.`);
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
      options: TEMPLATE_NAMES.map((value) => ({
        value,
        label: TEMPLATES[value].label,
        hint: TEMPLATES[value].hint,
      })),
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
  const cd = target === process.cwd() ? '' : `  ${cdCommand(directory)}\n`;
  let overwrite = false;
  const stat = await lstat(target).catch(() => null);
  if (interactive && stat?.isDirectory() && (await readdir(target)).length > 0) {
    const answer = await confirm({
      message: `${target} is not empty. Overwrite files with the same names?`,
      initialValue: false,
    });
    if (isCancel(answer) || !answer) {
      cancel('Creation cancelled.');
      return;
    }
    overwrite = true;
  }
  await createApp(target, name, templateDir, { overwrite });
  let install = false;
  let git = false;
  if (interactive) {
    const installAnswer = await confirm({ message: 'Install dependencies?', initialValue: true });
    install = !isCancel(installAnswer) && installAnswer;
    const gitAnswer = await confirm({
      message: 'Initialize a git repository?',
      initialValue: true,
    });
    git = !isCancel(gitAnswer) && gitAnswer;
  }
  if (git) {
    const code = await run('git', ['init'], target).catch(() => 1);
    if (code === 0) log.success('Initialized an empty git repository.');
    else log.warn('git init failed, so the app has no repository.');
  }
  let installed = false;
  if (install) {
    const { command, args } = getInstall();
    const code = await run(command, args, target);
    if (code !== 0) {
      throw new Error(
        `${command} ${args.join(' ')} failed (exit ${code}). The app is in ${name}; run the install command there.`,
      );
    }
    installed = true;
  }
  const commands = `${cd}${getNextSteps(TEMPLATES[template].setup, installed)}`;
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
