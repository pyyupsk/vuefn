// Writes robots.txt, llms.txt, llms-full.txt and one .md file per docs page into the built site.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { DOCS } from '#content/docs/nav.ts';
import { SITE_URL } from '#content/site.ts';
import { pageMarkdown } from '#utils/docs.ts';
import { llmsIndex } from '#utils/llms.ts';

const out = new URL('../dist/client/', import.meta.url);
mkdirSync(new URL('docs/', out), { recursive: true });

const pages = DOCS.flatMap((group) => group.pages).map((page) =>
  pageMarkdown(
    page,
    readFileSync(new URL(`../src/content/docs/${page.slug}.md`, import.meta.url), 'utf8'),
  ),
);
DOCS.flatMap((group) => group.pages).forEach((page, index) =>
  writeFileSync(new URL(`docs/${page.slug}.md`, out), pages[index] ?? ''),
);
writeFileSync(new URL('llms.txt', out), llmsIndex(DOCS, SITE_URL));
writeFileSync(new URL('llms-full.txt', out), pages.join('\n'));
writeFileSync(
  new URL('robots.txt', out),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);
