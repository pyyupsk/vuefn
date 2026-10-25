export interface DocPage {
  slug: string;
  title: string;
  description: string;
}

/** The sidebar, in reading order. Each slug has a `<slug>.md` next to this file. */
export const DOCS: readonly { title: string; pages: readonly DocPage[] }[] = [
  {
    title: 'Getting started',
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
  {
    title: 'Guides',
    pages: [
      {
        slug: 'route-block',
        title: 'The route block',
        description:
          'What goes in each script block, and which names the page gets from the route.',
      },
      {
        slug: 'server-functions',
        title: 'Server functions',
        description: 'Run code only on the Worker, read with GET and write with POST.',
      },
      {
        slug: 'layouts',
        title: 'Layouts and folders',
        description: 'How file names become paths, and how a folder gets a layout.',
      },
      {
        slug: 'prerender',
        title: 'Prerender on Workers',
        description: 'Render pages to HTML at build time and serve them as static files.',
      },
      {
        slug: 'd1',
        title: 'D1 with Drizzle',
        description: 'Read and write a Cloudflare D1 database from a page, with the d1 template.',
      },
      {
        slug: 'vite-plugins',
        title: 'Vite plugins',
        description:
          'The Vite, Vue and TanStack plugins of your project keep working next to vuefn.',
      },
      {
        slug: 'vue-plugins',
        title: 'Vue plugins',
        description: 'Install Pinia and other Vue plugins on the app that Vue Start creates.',
      },
    ],
  },
  {
    title: 'Reference',
    pages: [
      {
        slug: 'api',
        title: 'API',
        description: 'Every export of @vuefn/core and what it takes.',
      },
      {
        slug: 'cli',
        title: 'CLI',
        description: 'The options of npm create vuefn and how it behaves in a terminal and in CI.',
      },
      {
        slug: 'limits',
        title: 'Limits',
        description: 'What vuefn does not do yet, and the known bugs.',
      },
    ],
  },
];
