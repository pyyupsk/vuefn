import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

test('renders the page and its loader on the server', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('<h1>Hello from a server function in index.vue</h1>');
  expect(html.match(/<title>/g)).toHaveLength(1);
});

test('calls a server function from a button after hydration', async ({ page }) => {
  await page.goto('/');
  const latest = page.getByTestId('latest');
  const before = await latest.textContent();
  const call = page.waitForResponse((response) => response.url().includes('/_serverFn/'));
  await page.getByRole('button', { name: 'Ask the server again' }).click();
  expect((await call).status()).toBe(200);
  await expect(latest).not.toHaveText(before ?? '');
});

test('navigates on the client with params, beforeLoad and router context', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Read post 2' }).click();
  await expect(page).toHaveURL('/posts/2');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Server functions on Workers');
  await expect(page.getByText('Post 2 of 2 on vuefn playground')).toBeVisible();
});

test('answers 404 for a post that does not exist', async ({ request }) => {
  expect((await request.get('/posts/9')).status()).toBe(404);
});

test('sends route headers from the server and keeps them out of the client bundle', async ({
  request,
}) => {
  const response = await request.get('/posts/1');
  expect(response.headers()['cache-control']).toBe('public, max-age=60');
  const assets = join(import.meta.dirname, '..', 'dist', 'client', 'assets');
  const leaked = readdirSync(assets).filter(
    (file) =>
      file.endsWith('.js') && readFileSync(join(assets, file), 'utf8').includes('max-age=60'),
  );
  expect(leaked).toEqual([]);
});

test('hydrates every page without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.goto('/posts/1');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});
