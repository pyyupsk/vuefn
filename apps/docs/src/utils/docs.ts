import { DOCS } from '../content/docs/nav.ts';

const PAGES = DOCS.flatMap((group) => group.pages);

export function slugOf(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The sidebar group that holds `slug`. */
export function groupOf(slug: string) {
  return DOCS.find((group) => group.pages.some((page) => page.slug === slug));
}

export function pageOf(slug: string) {
  return PAGES.find((page) => page.slug === slug);
}

/** The pages before and after `slug` in the sidebar order. */
export function neighborsOf(slug: string) {
  const index = PAGES.findIndex((page) => page.slug === slug);
  return { prev: PAGES[index - 1], next: index < 0 ? undefined : PAGES[index + 1] };
}

/** A docs page as one Markdown file: its title, its description and its body without frontmatter. */
export function pageMarkdown(page: { title: string; description: string }, source: string) {
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  return `# ${page.title}\n\n> ${page.description}\n\n${body}\n`;
}
