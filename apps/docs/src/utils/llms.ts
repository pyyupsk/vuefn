import type { DocPage } from '#content/docs/nav.ts';

type Group = { title: string; pages: readonly DocPage[] };

/** The llms.txt index: a title, a summary, and one Markdown link per docs page, grouped like the sidebar. */
export function llmsIndex(groups: readonly Group[], siteUrl: string) {
  const sections = groups.map(
    (group) =>
      `## ${group.title}\n\n${group.pages
        .map((page) => `- [${page.title}](${siteUrl}/docs/${page.slug}.md): ${page.description}`)
        .join('\n')}`,
  );
  const text = [
    '# vuefn',
    '> One .vue file per route for TanStack Vue Start on Cloudflare Workers.',
    'vuefn is a Vite plugin. It moves the route block of each page in src/pages into its own .ts file, so the loader, the server functions and the view of a TanStack Start route live in one .vue file.',
    ...sections,
    `## Optional\n\n- [All docs in one file](${siteUrl}/llms-full.txt)`,
  ].join('\n\n');
  return `${text}\n`;
}
