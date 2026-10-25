# Quick start

This page creates a vuefn app, adds a page and deploys the app to Cloudflare Workers.

## Before you start

You need Node `^22.23.4`, `^24.22.1` or `>=26.12.1`, and a package manager: npm, pnpm, Yarn, Bun or Deno. To deploy, you also need a [Cloudflare account](https://dash.cloudflare.com/sign-up).

## Create the app

```bash
npm create @vuefn@latest my-app
```

The CLI asks for a template and offers to install the dependencies and to start a git repository. Pick one of these templates:

| Template   | Gives you                                         |
| ---------- | ------------------------------------------------- |
| `minimal`  | One page. This is the default                     |
| `tailwind` | One page styled with Tailwind CSS                 |
| `d1`       | A list of notes in Cloudflare D1, through Drizzle |

To skip the question, add the template to the command:

```bash
npm create @vuefn@latest my-app -- --template tailwind
```

## Start the server

```bash
cd my-app
npm install
npm run dev
```

Open `http://localhost:3000`. The page that you see is `src/pages/index.vue`.

## Add a page

Make a file `src/pages/about.vue`:

```vue
<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute({
  head: () => ({ meta: [{ title: 'About' }] }),
});
</script>

<template>
  <h1>About</h1>
</template>
```

Open `http://localhost:3000/about`. You do not restart the server, because `vite dev` finds the new page.

The file name gives the path. `index.vue` is `/`, `about.vue` is `/about` and `posts/$id.vue` is `/posts/$id`. Vue Router and Nuxt write `[id].vue` where TanStack writes `$id.vue`.

## Load data on the server

Add a server function to the route block of `src/pages/about.vue`:

```vue
<script lang="ts">
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';

export const getTime = createServerFn().handler(() => new Date().toISOString());

export const route = defineRoute({
  loader: () => getTime(),
});
</script>

<script setup lang="ts">
const time = route.useLoaderData();
</script>

<template>
  <h1>About</h1>
  <p>The Worker answered at {{ time }}.</p>
</template>
```

The handler runs on the Worker. When you go to the page from another page, the loader runs in the browser and calls the Worker for the result.

A server function uses `GET` by default. A function that writes data needs `createServerFn({ method: 'POST' })` and a `validator` for its input.

## Build and deploy

```bash
npm run build
npm run preview
npm run deploy
```

`npm run preview` serves the build on your computer with workerd, the runtime of Cloudflare Workers. `npm run deploy` builds the app again and deploys it with Wrangler. The first deploy asks you to log in to Cloudflare.

## All commands

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Starts the Vite server on port 3000            |
| `npm run build`     | Builds the app for Cloudflare Workers          |
| `npm run preview`   | Serves the build locally with workerd          |
| `npm run typecheck` | Generates the route tree and checks TypeScript |
| `npm run deploy`    | Builds and deploys the app with Wrangler       |

The `d1` template also has `npm run db:migrate` for the local D1 database and `npm run db:generate` for a Drizzle migration.
