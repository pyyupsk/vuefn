import { expect, test } from '@playwright/test';

test('serves a docs page as prerendered HTML', async ({ request }) => {
  const response = await request.get('/docs/quick-start');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('<title>Quick start · vuefn</title>');
  expect(html).toContain('class="shiki');
  expect(html).not.toContain('createHighlighterCore');
});

test('links every heading from On this page', async ({ page }) => {
  await page.goto('/docs/quick-start');
  const links = page.getByRole('navigation', { name: 'On this page' }).getByRole('link');
  await expect(links).toHaveCount(6);
  const ids = await links.evaluateAll((all) => all.map((a) => a.getAttribute('href')?.slice(1)));
  const headings = await page
    .locator('main article :is(h2, h3)')
    .evaluateAll((all) => all.map((h) => h.id));
  expect(ids).toEqual(headings);
});

test('walks the docs with the sidebar and the pager', async ({ page }) => {
  await page.goto('/docs/introduction');
  const sidebar = page.getByRole('navigation', { name: 'Docs' }).last();
  await expect(sidebar.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.getByRole('link', { name: 'Next Quick start' }).click();
  await expect(page).toHaveURL('/docs/quick-start');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quick start');
  await expect(page).toHaveTitle('Quick start · vuefn');
  await expect(page.getByRole('link', { name: 'Previous Introduction' })).toBeVisible();
});

test('answers 404 for a page that does not exist', async ({ request }) => {
  expect((await request.get('/docs/missing')).status()).toBe(404);
});

test('opens the docs menu on a phone without errors', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/docs/quick-start');
  await page.getByText('Menu').click();
  await expect(
    page
      .getByRole('navigation', { name: 'Docs' })
      .first()
      .getByRole('link', { name: 'Introduction' }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
  expect(errors).toEqual([]);
  await context.close();
});
