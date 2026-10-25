export interface DocPage {
  slug: string;
  title: string;
  description: string;
}

/** The sidebar, in reading order. Each slug has a `<slug>.md` next to this file. */
export const DOCS: readonly { title: string; pages: readonly DocPage[] }[] = [
  {
    title: 'Start here',
    pages: [
      {
        slug: 'introduction',
        title: 'Introduction',
        description: 'What vuefn does, and what a page with its route in one .vue file looks like.',
      },
      {
        slug: 'quick-start',
        title: 'Quick start',
        description: 'Create a vuefn app, add a page and deploy it to Cloudflare Workers.',
      },
    ],
  },
];
