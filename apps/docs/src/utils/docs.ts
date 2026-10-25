import { DOCS } from '../content/docs/nav.ts';

const PAGES = DOCS.flatMap((group) => group.pages);

export function slugOf(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function pageOf(slug: string) {
  return PAGES.find((page) => page.slug === slug);
}

/** The pages before and after `slug` in the sidebar order. */
export function neighborsOf(slug: string) {
  const index = PAGES.findIndex((page) => page.slug === slug);
  return { prev: PAGES[index - 1], next: index < 0 ? undefined : PAGES[index + 1] };
}
