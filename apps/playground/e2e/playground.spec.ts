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

test('wraps a nested index route and its pages in the folder layout', async ({ request }) => {
  const index = await (await request.get('/posts')).text();
  expect(index).toContain('<h2>Posts <strong data-testid="badge">nested</strong></h2>');
  expect(index).toContain('Pick a post');
  const post = await (await request.get('/posts/1')).text();
  expect(post).toContain('<h2>Posts');
  expect(post).toContain('One file per route');
});

test('keeps a pathless layout out of the URL', async ({ request }) => {
  const html = await (await request.get('/login')).text();
  expect(html).toContain('<aside data-testid="pathless">Auth layout</aside>');
  expect(html).toContain('Sign in');
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

test('installs a Vue plugin on the server and in the browser', async ({ page, request }) => {
  const html = await (await request.get('/posts')).text();
  expect(html).toContain('Count 0');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/posts');
  await page.getByTestId('increment').click();
  await expect(page.getByTestId('increment')).toHaveText('Count 1');
  expect(errors).toEqual([]);
});
