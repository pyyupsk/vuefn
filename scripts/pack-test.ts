// Installs both tarballs and builds an app made by the CLI, without publishing to npm.
import { readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { $ } from 'bun';

const pkg = join(import.meta.dir, '..', 'packages', 'vuefn');
const dir = await mkdtemp(join(tmpdir(), 'vuefn-pack-'));
try {
  // npm publish drops a package.json field it rejects (a bin path, for one), and npm pack does not
  await Promise.all(
    ['vuefn', 'create'].map(async (name) => {
      const warnings = (
        await $`npm publish --dry-run`.cwd(join(pkg, '..', name)).quiet()
      ).stderr.toString();
      if (warnings.includes('auto-corrected')) {
        throw new Error(`npm publish would change packages/${name}/package.json:\n${warnings}`);
      }
    }),
  );
  const tarball = (await $`npm pack --silent --pack-destination ${dir}`.cwd(pkg).text()).trim();
  const cli = (
    await $`npm pack --silent --pack-destination ${dir}`.cwd(join(pkg, '..', 'create')).text()
  ).trim();
  await Bun.write(join(dir, 'package.json'), '{ "private": true, "type": "module" }\n');
  await $`npm install --silent --no-audit --no-fund ${join(dir, tarball)} ${join(dir, cli)}`.cwd(
    dir,
  );

  await Bun.write(
    join(dir, 'check.mjs'),
    `import { defineRootRoute, defineRootRouteWithContext, defineRoute, useAppPlugins } from "@vuefn/core";
import { vuefn } from "@vuefn/core/vite";
if (typeof defineRootRoute({}).options !== "object") throw new Error("defineRootRoute");
if (typeof defineRootRouteWithContext()({}).options !== "object") throw new Error("defineRootRouteWithContext");
let message = "";
try { defineRoute("/a"); } catch (error) { message = error.message; }
if (!message.includes("only works in src/pages")) throw new Error("defineRoute");
if (typeof useAppPlugins !== "function") throw new Error("useAppPlugins");
const { createRequire } = await import("node:module");
if (typeof createRequire(import.meta.url)("@vuefn/core/volar") !== "function") throw new Error("volar plugin");
if (!vuefn().flat(Infinity).some((p) => p?.name === "vuefn")) throw new Error("vuefn plugin");
`,
  );
  await $`node check.mjs`.cwd(dir);
  const node = (await $`node --version`.text()).trim();
  console.log(`${tarball}: vuefn and vuefn/vite load on Node ${node}`);
  // the file: install below hides a starter that asks for another core version than the release
  const { version } = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
  async function testTemplate(template: string) {
    const name = `starter-${template}`;
    await $`npm exec --offline -- create-vuefn ${name} --template ${template}`.cwd(dir);
    const app = join(dir, name);
    const manifest = Bun.file(join(app, 'package.json'));
    const generated = await manifest.json();
    if (generated.name !== name) throw new Error(`The ${template} starter has an incorrect name`);
    if (generated.dependencies['@vuefn/core'] !== `^${version}`) {
      throw new Error(
        `The ${template} starter wants @vuefn/core ${generated.dependencies['@vuefn/core']}, the packed version is ${version}`,
      );
    }
    generated.dependencies['@vuefn/core'] = `file:${join(dir, tarball)}`;
    await Bun.write(manifest, `${JSON.stringify(generated, null, 2)}\n`);
    await $`npm install --no-audit --no-fund`.cwd(app);
    await $`npm run typecheck`.cwd(app);
    console.log(`${template}: builds and type-checks on Node ${node}`);
  }

  async function testTemplates(list: string[]): Promise<void> {
    const [first, ...rest] = list;
    if (!first) return;
    await testTemplate(first);
    await testTemplates(rest);
  }

  await testTemplates(['minimal', 'tailwind', 'd1']);
  console.log(`${cli}: every generated Workers app builds and type-checks on Node ${node}`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
