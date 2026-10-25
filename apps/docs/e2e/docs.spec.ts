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

test('sends /docs to the introduction', async ({ page }) => {
  await page.goto('/docs');
  await expect(page).toHaveURL('/docs/introduction');
});

test('shows a page for a path that does not exist', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible();
});

test('switches every command block to the chosen package manager', async ({ page }) => {
  await page.goto('/docs/quick-start');
  await page.getByRole('button', { name: 'pnpm' }).first().click();
  await expect(page.getByText('pnpm create @vuefn my-app', { exact: true })).toBeVisible();
  await expect(page.getByText('pnpm db:migrate')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'pnpm' }).first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('finds a page with the search dialog', async ({ page }) => {
  await page.goto('/docs/introduction', { waitUntil: 'networkidle' });
  await page.keyboard.press('ControlOrMeta+k');
  const dialog = page.getByRole('dialog', { name: 'Search the docs' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('searchbox').fill('validator');
  await expect(dialog.getByRole('link', { name: /Server functions/ })).toBeVisible();
});

test('moves between pages without a full reload', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => Object.assign(window, { stayed: true }));
  await page.getByRole('link', { name: 'Read the docs' }).click();
  await expect(page).toHaveURL('/docs/introduction');
  await page
    .getByRole('navigation', { name: 'Docs' })
    .last()
    .getByRole('link', { name: 'API' })
    .click();
  await expect(page).toHaveURL('/docs/api');
  await page.locator('article').getByRole('link', { name: 'Vue plugins' }).click();
  await expect(page).toHaveURL('/docs/vue-plugins');
  expect(await page.evaluate(() => (window as unknown as { stayed?: boolean }).stayed)).toBe(true);
});

test('serves the files that crawlers and AI tools read', async ({ request }) => {
  const llms = await (await request.get('/llms.txt')).text();
  expect(llms).toContain('- [Quick start](https://vuefn.fasu.dev/docs/quick-start.md)');
  const markdown = await request.get('/docs/quick-start.md');
  expect(markdown.status()).toBe(200);
  expect(await markdown.text()).toMatch(/^# Quick start\n\n> /);
  expect(await (await request.get('/llms-full.txt')).text()).toContain('# Server functions');
  expect(await (await request.get('/sitemap.xml')).text()).toContain(
    '<loc>https://vuefn.fasu.dev/docs/api</loc>',
  );
  expect(await (await request.get('/robots.txt')).text()).toContain(
    'Sitemap: https://vuefn.fasu.dev/sitemap.xml',
  );
});
