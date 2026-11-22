import { expect, test } from '@playwright/test';

test('serves the landing page as prerendered HTML', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('One .vue file');
  expect(html).toContain('data-where="worker"');
  expect(html).not.toContain('createHighlighterCore');
});

test('starts no animation when the page loads', async ({ page }) => {
  await page.addInitScript(() => {
    const starts: string[] = [];
    Object.assign(window, { starts });
    addEventListener(
      'animationstart',
      (event: AnimationEvent) => starts.push(event.animationName),
      true,
    );
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.evaluate(() => (window as unknown as { starts: string[] }).starts)).toEqual([]);
});

test('says where a line of the hero file runs', async ({ page }) => {
  await page.goto('/');
  const readout = page.locator('figcaption [aria-live]');
  await expect(readout).toHaveText('Point at a line to see where it runs.');
  await page.getByRole('tabpanel').locator('[data-where="worker"]').first().hover();
  await expect(readout).toContainText('run only on the Worker');
  await page.getByRole('tab', { name: '.vuefn/routes/posts/$id.ts' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('createFileRoute("/posts/$id")');
  await page.getByRole('tab', { name: '.vuefn/routes/posts/$id.ts' }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'In the browser' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

test('switches the template sheet', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'd1', exact: true }).click();
  await expect(page.getByText('npm create vuefn@latest my-app -- --template d1')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Files in the d1 template' })).toContainText(
    'migrations/0001_init.sql',
  );
});

test('copies the create command', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: /npm create vuefn@latest/ }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm create vuefn@latest');
  await expect(page.getByText('Copied')).toBeVisible();
});

test('hydrates without console errors on a phone', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.mouse.wheel(0, 4000);
  await expect(page.getByRole('heading', { name: 'The whole API' })).toBeVisible();
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
