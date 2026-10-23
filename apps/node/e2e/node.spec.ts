import { expect, test } from '@playwright/test';

test('renders the page and its loader on a Node server', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toMatch(/<h1>Running on Node \d+\.\d+\.\d+<\/h1>/);
  expect(html.match(/<title>/g)).toHaveLength(1);
});

test('calls a server function on Node after hydration', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask the server again' }).click();
  await expect(page.getByTestId('again')).toHaveText(/^Node \d+\.\d+\.\d+$/);
  expect(errors).toEqual([]);
});
