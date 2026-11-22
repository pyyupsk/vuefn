import type { Lang } from '#lib/highlight.ts';

export type Where = 'worker' | 'both' | 'browser';

export type HeroFile = Readonly<{
  id: string;
  label: string;
  /** Where the file sits in the editor's file tree, its name there and an optional tag. */
  folder: string;
  name: string;
  tag?: string;
  lang: Lang;
  code: string;
  /** 1-based inclusive line ranges and where those lines run. */
  ranges: readonly (readonly [number, number, Where])[];
  says: Readonly<Partial<Record<Where, string>>>;
}>;

export const PAGE_SOURCE = `<script lang="ts">
import { notFound } from '@tanstack/vue-router';
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';
import { env } from 'cloudflare:workers';

type Post = { id: string; title: string; body: string };

export const getPost = createServerFn()
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const post = await env.DB.prepare('select * from posts where id = ?')
      .bind(id).first<Post>();
    if (!post) throw notFound();
    return post;
  });

export const route = defineRoute({
  loader: ({ params }) => getPost({ data: params.id }),
});
</script>

<script setup lang="ts">
const post = route.useLoaderData();
</script>

<template>
  <article>
    <h1>{{ post.title }}</h1>
    <p>{{ post.body }}</p>
  </article>
</template>
`;

/** What vuefn writes for PAGE_SOURCE. landing.test.ts checks it against the real transform. */
export const ROUTE_MODULE = `import { createFileRoute } from "@tanstack/vue-router";
import VuefnPage from "../../../pages/posts/$id.vue";
import { notFound } from '@tanstack/vue-router';
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';
import { env } from 'cloudflare:workers';

type Post = { id: string; title: string; body: string };

export const getPost = createServerFn()
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const post = await env.DB.prepare('select * from posts where id = ?')
      .bind(id).first<Post>();
    if (!post) throw notFound();
    return post;
  });

export const Route = createFileRoute("/posts/$id")({ component: VuefnPage,
  loader: ({ params }) => getPost({ data: params.id }),
});

export const route = Route;
`;

export const HERO_FILES: readonly HeroFile[] = [
  {
    id: 'page',
    label: 'pages/posts/$id.vue',
    folder: 'src/pages/posts',
    name: '$id.vue',
    lang: 'vue',
    code: PAGE_SOURCE,
    ranges: [
      [9, 16, 'worker'],
      [18, 20, 'both'],
      [23, 32, 'browser'],
    ],
    says: {
      worker: 'Lines 9 to 16 run only on the Worker. The browser gets a call, not the query.',
      both: 'The loader runs on the Worker for the first request and in the browser after that.',
      browser: 'The page renders on the Worker, then hydrates in the browser.',
    },
  },
  {
    id: 'route',
    label: '.vuefn/routes/posts/$id.ts',
    folder: 'src/.vuefn/routes/posts',
    name: '$id.ts',
    tag: 'generated',
    lang: 'ts',
    code: ROUTE_MODULE,
    ranges: [
      [1, 2, 'worker'],
      [19, 21, 'worker'],
    ],
    says: {
      worker: 'vuefn writes this file. The path comes from the file name, so you never type it.',
    },
  },
  {
    id: 'browser',
    label: 'In the browser',
    folder: 'browser bundle',
    name: 'getPost',
    tag: 'built',
    lang: 'ts',
    code: `// what the browser bundle keeps of getPost, simplified
export const getPost = createServerFn().handler(
  // the handler is gone and the call becomes a request
  createClientRpc('posts_$id_getPost'),
);

// navigating to /posts/2 in the browser sends
// GET /_serverFn/<id>?payload=...
`,
    ranges: [
      [2, 5, 'browser'],
      [8, 8, 'browser'],
    ],
    says: {
      browser:
        'No env, no SQL and no Worker import reach the browser. TanStack Start removes them.',
    },
  },
];

/** Where a 1-based line of a hero file runs, or '' when it is not marked. */
export function whereOf(file: HeroFile, line: number): Where | '' {
  return file.ranges.find(([from, to]) => line >= from && line <= to)?.[2] ?? '';
}

export type Template = Readonly<{
  name: 'minimal' | 'tailwind' | 'd1';
  description: string;
  lang: Lang;
  files: readonly (readonly [path: string, why: string, main?: boolean])[];
  /** A part of the main file. landing.test.ts checks that the template still holds it. */
  code: string;
}>;

export const TEMPLATES: readonly Template[] = [
  {
    name: 'minimal',
    description: 'One page that says hello. The smallest app vuefn makes.',
    lang: 'vue',
    files: [
      ['src/pages/__root.vue', 'the html shell'],
      ['src/pages/index.vue', 'the page', true],
      ['src/router.ts', ''],
      ['vite.config.ts', 'vuefn()'],
      ['wrangler.jsonc', 'the Worker'],
    ],
    code: `<template>
  <h1>Hello, vuefn!</h1>
</template>
`,
  },
  {
    name: 'tailwind',
    description: 'The same app with Tailwind CSS 4, wired through its Vite plugin.',
    lang: 'vue',
    files: [
      ['src/app.css', '@import "tailwindcss"'],
      ['src/pages/__root.vue', 'imports app.css'],
      ['src/pages/index.vue', 'the page', true],
      ['vite.config.ts', 'adds tailwindcss()'],
    ],
    code: `<template>
  <main class="mx-auto max-w-xl p-8">
    <h1 class="text-3xl font-semibold tracking-tight">Hello, vuefn!</h1>
    <p class="mt-2 text-base/7 text-gray-600">Styled with Tailwind CSS on Cloudflare Workers.</p>
  </main>
</template>
`,
  },
  {
    name: 'd1',
    description:
      'A notes page that reads and writes Cloudflare D1 through Drizzle, with its first migration.',
    lang: 'ts',
    files: [
      ['migrations/0001_init.sql', 'the notes table'],
      ['src/db/schema.ts', 'Drizzle schema'],
      ['src/pages/index.vue', 'listNotes and addNote', true],
      ['wrangler.jsonc', 'the DB binding'],
    ],
    code: `export const addNote = createServerFn({ method: 'POST' })
  .validator((body: unknown) => {
    if (typeof body !== 'string' || !body.trim() || body.length > 500) {
      throw new Error('A note needs 1 to 500 characters.');
    }
    return body.trim();
  })
  .handler(async ({ data: body }) => {
    await drizzle(env.DB).insert(notes).values({ body, createdAt: Date.now() });
  });
`,
  },
];

export const CLI_STEPS = [
  {
    title: 'Run one command.',
    text: 'The CLI asks for a folder. In CI, pass the folder as an argument and nothing is asked.',
    screen: `$ npm create vuefn@latest

┌  create-vuefn
│
◆  Project directory
│  my-app
└`,
  },
  {
    title: 'Then pick a template.',
    text: 'minimal, tailwind or d1. It asks before it writes into a folder that has files.',
    screen: `┌  create-vuefn
│
◇  Project directory
│  blog
│
◆  Template
│  ● Minimal (one page)
│  ○ Tailwind
│  ○ D1
└`,
  },
  {
    title: 'Then start Vite.',
    text: 'The next steps use the package manager you ran it with: npm, pnpm, Yarn, Bun or Deno.',
    screen: `◇  Install dependencies?
│  Yes
│
◆  Created blog.
│
└  Next steps:
     cd 'blog'
     npm run dev

$ npm run dev
  Local:   http://localhost:3000/`,
  },
] as const;

export type ApiRow = Readonly<{ name: string; from: string; where: Where | 'build' }>;

export const API: readonly ApiRow[] = [
  { name: 'vuefn(options)', from: '@vuefn/core/vite', where: 'build' },
  { name: 'defineRoute({ ... })', from: '@vuefn/core', where: 'both' },
  { name: 'defineRootRoute({ ... })', from: '@vuefn/core', where: 'both' },
  { name: 'defineRootRouteWithContext()', from: '@vuefn/core', where: 'both' },
  { name: 'useAppPlugins(...plugins)', from: '@vuefn/core', where: 'both' },
  { name: '@vuefn/core/volar', from: 'tsconfig.json', where: 'build' },
];

export const CLI_FLAGS: readonly (readonly [string, string])[] = [
  ['--template minimal', 'one page'],
  ['--template tailwind', 'Tailwind CSS 4'],
  ['--template d1', 'D1 and Drizzle'],
];

export const VITE_CONFIG = `import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { vuefn } from '@vuefn/core/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    vuefn(),
    vue(),
  ],
});
`;

export const PROOF: readonly (readonly [string, string])[] = [
  ['TanStack Start', '~1.169 does the routing and server functions'],
  ['Vue 3.5', 'renders the page'],
  ['Vite 8', 'builds it'],
  ['Cloudflare Workers', 'workerd runs in every browser test'],
  ['Node with srvx', 'a second example app'],
  ['Unit and browser tests', 'on every push'],
  ['Node 22 and 24', 'packed tarballs installed in CI'],
  ['Volar', 'types defineRoute without a path'],
  ['TypeScript 6', 'vue-tsc 3 does not run on 7 yet'],
  ['MIT', 'no runtime of its own'],
];

export const FEATURES: readonly Readonly<{ title: string; text: string; code: string }>[] = [
  {
    title: 'Server code in the page',
    text: 'A createServerFn in the route block runs on the Worker. The browser gets only the call.',
    code: 'createServerFn()',
  },
  {
    title: 'Typed from the file name',
    text: 'useLoaderData, useParams and Link know the route, and you never write its path.',
    code: 'route.useParams()',
  },
  {
    title: 'Cloudflare Workers',
    text: 'D1 and env come in through the Worker. Prerendered pages are served as static files.',
    code: 'cloudflare:workers',
  },
  {
    title: 'No runtime of its own',
    text: 'TanStack Start does the routing and the server render. vuefn only moves one block.',
    code: '@vuefn/core/vite',
  },
];
