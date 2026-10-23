import { readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const file = join(import.meta.dirname, '..', 'src', 'pages', 'about.vue');

function writePage(path: string, loaderText: string, templateText: string) {
  writeFileSync(
    file,
    `<script lang="ts">
import { defineRoute } from '@pyyupsk/vuefn';

export const route = defineRoute('${path}', {
  loader: () => ({ text: '${loaderText}' }),
});
</script>

<script setup lang="ts">
const data = route.useLoaderData();
</script>

<template>
  <h1>{{ data.text }}</h1>
  <p>${templateText}</p>
</template>
`,
  );
}

test.afterEach(() => rmSync(file, { force: true }));

test('adds, changes and removes a page without a restart', async ({ page, request }) => {
  const status = async () => (await request.get('/about')).status();
  const html = async () => (await request.get('/about')).text();

  writePage('/about', 'first loader', 'first template');
  await expect.poll(status, { timeout: 30_000 }).toBe(200);
  await expect.poll(html).toContain('<h1>first loader</h1>');

  await page.goto('/about');
  await expect(page.getByText('first template')).toBeVisible();
  await page.evaluate(() => {
    (window as unknown as { kept: boolean }).kept = true;
  });
  writePage('/about', 'first loader', 'second template');
  await expect(page.getByText('second template')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { kept?: boolean }).kept)).toBe(true);

  await page.waitForTimeout(1000);
  writePage('/about', 'second loader', 'second template');
  const route = join(import.meta.dirname, '..', 'src', '.vuefn', 'routes', 'about.ts');
  for (let i = 0; i < 6; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(
      `[debug ${i * 2 + 2}s] route mtime=${statSync(route).mtimeMs} loader=${/text: '([^']+)'/.exec(readFileSync(route, 'utf8'))?.[1]} ssr=${/<h1>([^<]*)<\/h1>/.exec(await html())?.[1]}`,
    );
  }
  await expect.poll(html, { timeout: 30_000 }).toContain('<h1>second loader</h1>');

  writePage('/abut', 'second loader', 'second template');
  await expect.poll(status, { timeout: 30_000 }).toBe(500);

  rmSync(file);
  await expect.poll(status, { timeout: 30_000 }).toBe(404);
});
