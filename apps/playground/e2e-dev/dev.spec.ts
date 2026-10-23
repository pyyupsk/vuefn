import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const file = join(import.meta.dirname, '..', 'src', 'pages', 'about.vue');
const blog = join(import.meta.dirname, '..', 'src', 'pages', 'blog');

function writePage(path: string, loaderText: string, templateText: string) {
  writeFileSync(
    file,
    `<script lang="ts">
import { defineRoute } from '@vuefn/core';

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

test.afterEach(() => {
  rmSync(file, { force: true });
  rmSync(blog, { recursive: true, force: true });
});

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
  await expect.poll(html, { timeout: 30_000 }).toContain('<h1>second loader</h1>');

  rmSync(file);
  await expect.poll(status, { timeout: 30_000 }).toBe(404);
});

function writeFlat(target: string, path: string, text: string) {
  writeFileSync(
    target,
    `<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute('${path}', {});
</script>

<template>
  <p>${text}</p>
</template>
`,
  );
}

test('adds and removes a page in a new folder without a restart', async ({ request }) => {
  const status = async (path: string) => (await request.get(path)).status();
  const html = async (path: string) => (await request.get(path)).text();

  mkdirSync(blog, { recursive: true });
  writeFileSync(
    join(blog, 'route.vue'),
    `<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute('/blog', {});
</script>

<script setup lang="ts">
import { Outlet } from '@tanstack/vue-router';
</script>

<template>
  <p>blog layout</p>
  <Outlet />
</template>
`,
  );
  writeFlat(join(blog, 'index.vue'), '/blog/', 'blog index');
  await expect.poll(() => status('/blog'), { timeout: 30_000 }).toBe(200);
  await expect.poll(() => html('/blog')).toContain('blog index');

  rmSync(blog, { recursive: true, force: true });
  await expect.poll(() => status('/blog'), { timeout: 30_000 }).toBe(404);
});
