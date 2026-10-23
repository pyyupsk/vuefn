// Installs the packed tarball in a temp app, as a user would from npm, and loads both entries with Node.
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { $ } from 'bun';

const pkg = join(import.meta.dir, '..', 'packages', 'vuefn');
const dir = await mkdtemp(join(tmpdir(), 'vuefn-pack-'));
try {
  const tarball = (await $`npm pack --silent --pack-destination ${dir}`.cwd(pkg).text()).trim();
  await Bun.write(join(dir, 'package.json'), '{ "private": true, "type": "module" }\n');
  await $`npm install --silent --no-audit --no-fund ${join(dir, tarball)}`.cwd(dir);

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
} finally {
  await rm(dir, { recursive: true, force: true });
}
