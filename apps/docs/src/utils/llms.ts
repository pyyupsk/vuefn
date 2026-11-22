import type { DocGroup } from '#content/docs/nav.ts';
import { DESCRIPTION } from '#content/site.ts';

export function llmsIndex(groups: readonly DocGroup[], siteUrl: string) {
  const sections = groups.map(
    (group) =>
      `## ${group.title}\n\n${group.pages
        .map((page) => `- [${page.title}](${siteUrl}/docs/${page.slug}.md): ${page.description}`)
        .join('\n')}`,
  );
  const text = [
    '# vuefn',
    `> ${DESCRIPTION}.`,
    'vuefn is a Vite plugin. It moves the route block of each page in src/pages into its own .ts file, so the loader, the server functions and the view of a TanStack Start route live in one .vue file.',
    ...sections,
    `## Optional\n\n- [All docs in one file](${siteUrl}/llms-full.txt)`,
  ].join('\n\n');
  return `${text}\n`;
}
