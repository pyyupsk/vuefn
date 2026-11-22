import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const templates = join(here, '..', 'packages', 'create', 'template');

/** Points the starter at the version of `@vuefn/core` in the same release. */
export function syncTemplate(version: string, template: string): void {
  const manifest = JSON.parse(readFileSync(template, 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  const range = `^${version}`;
  if (manifest.dependencies?.['@vuefn/core'] === range) return;
  manifest.dependencies = { ...manifest.dependencies, '@vuefn/core': range };
  writeFileSync(template, `${JSON.stringify(manifest, null, 2)}\n`);
}

if (import.meta.main) {
  const { version } = JSON.parse(
    readFileSync(join(here, '..', 'packages', 'vuefn', 'package.json'), 'utf8'),
  ) as { version: string };
  for (const name of readdirSync(templates))
    syncTemplate(version, join(templates, name, 'package.json'));
  console.log(`templates: @vuefn/core ^${version}`);
}
