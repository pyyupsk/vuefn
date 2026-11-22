import { DOCS } from '#content/docs/nav.ts';

export const PAGES = DOCS.flatMap((group) => group.pages);

/** Where the docs start, the target of every plain "Docs" link. */
export const FIRST_PAGE = PAGES[0]?.slug ?? '';

/** A heading that the Markdown gives an id, listed in On this page. */
export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

export function slugOf(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function groupOf(slug: string) {
  return DOCS.find((group) => group.pages.some((page) => page.slug === slug));
}

export function pageOf(slug: string) {
  return PAGES.find((page) => page.slug === slug);
}

export function neighborsOf(slug: string) {
  const index = PAGES.findIndex((page) => page.slug === slug);
  return { prev: PAGES[index - 1], next: index < 0 ? undefined : PAGES[index + 1] };
}

/** The page as one Markdown file for llms-full.txt and the Copy page button. */
export function pageMarkdown(page: { title: string; description: string }, source: string) {
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  return `# ${page.title}\n\n> ${page.description}\n\n${body}\n`;
}
