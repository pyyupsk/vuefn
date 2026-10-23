# vuefn

One `.vue` file per route for TanStack Vue Start on Cloudflare Workers.

## Features

- The loader, the server functions and the page of a route live in one `.vue` file
- `defineRoute` takes every TanStack route option, and `useLoaderData()`, `useParams()`, `useSearch()` and `Link` get their types from it
- `createServerFn()` in a page runs on the server. The browser gets only the call
- If a route path does not match its file name, the build stops and says the right one
- `vite dev` picks up new, changed and deleted pages without a restart
- No runtime of its own: TanStack Start does the routing, SSR and server functions

## Install

```bash
npm install vuefn @tanstack/vue-router @tanstack/vue-start vue
npm install -D vite @vitejs/plugin-vue @cloudflare/vite-plugin wrangler vue-tsc typescript@^6
```

Node `^22.23.4`, `^24.22.1` or `>=26.12.1`. `vue-tsc` 3 does not run on TypeScript 7 yet, so pin TypeScript 6.

## Usage

Use `vuefn()` in place of `tanstackStart()`:

```ts
// vite.config.ts
import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { vuefn } from 'vuefn/vite';

export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: 'ssr' } }), vuefn(), vue()],
});
```

```jsonc
// wrangler.jsonc
{
  "name": "my-app",
  "compatibility_date": "2026-10-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/vue-start/server-entry",
}
```

```ts
// src/router.ts
import { createRouter } from '@tanstack/vue-router';

import { routeTree } from './routeTree.gen';

export function getRouter() {
  return createRouter({ routeTree });
}
```

The root page renders the HTML document around every page:

```vue
<!-- src/pages/__root.vue -->
<script lang="ts">
import { defineRootRoute } from 'vuefn';

export const route = defineRootRoute({
  head: () => ({ meta: [{ charSet: 'utf-8' }, { title: 'My app' }] }),
});
</script>

<script setup lang="ts">
import { Body, HeadContent, Html, Scripts } from '@tanstack/vue-router';
</script>

<template>
  <Html>
    <head>
      <HeadContent />
    </head>
    <Body>
      <slot />
      <Scripts />
    </Body>
  </Html>
</template>
```

A page puts its route in `<script lang="ts">` and its view in `<script setup>`:

```vue
<!-- src/pages/posts.$id.vue -->
<script lang="ts">
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from 'vuefn';

const posts = [{ id: '1', title: 'One file per route' }];

export const getPost = createServerFn()
  .validator((id: string) => id)
  .handler(({ data: id }) => posts.find((p) => p.id === id));

export const route = defineRoute('/posts/$id', {
  loader: ({ params }) => getPost({ data: params.id }),
});
</script>

<script setup lang="ts">
const params = route.useParams(); // { id: string }
const post = route.useLoaderData(); // { id: string; title: string } | undefined
</script>

<template>
  <h1>{{ post?.title }}</h1>
</template>
```

File names follow the [TanStack naming rules](https://tanstack.com/router/latest/docs/framework/vue/routing/file-naming-conventions): `index.vue` is `/`, `about.vue` is `/about`, `posts.$id.vue` is `/posts/$id`. Vue Router and Nuxt write `[id].vue` where TanStack writes `$id.vue`.

vuefn and TanStack write `src/.vuefn/` and `src/routeTree.gen.ts` on every `vite dev` and `vite build`. Add both to `.gitignore`, and run `vue-tsc --noEmit` after one of those commands.

## API

| Export                                        | From         | Does                                                                    |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------- |
| `vuefn(options)`                              | `vuefn/vite` | The Vite plugin. It adds the TanStack Start plugins, so leave those out |
| `defineRoute(path, options)`                  | `vuefn`      | The route of a page. `path` must match the file name                    |
| `defineRootRoute(options)`                    | `vuefn`      | The route of `src/pages/__root.vue`, which has no path                  |
| `defineRootRouteWithContext<Context>()(opts)` | `vuefn`      | The root route with a typed router context                              |

`vuefn(options)` takes the `tanstackStart()` options, such as `spa`, `prerender` and `srcDirectory`. vuefn sets `router.routesDirectory` itself.

The `defineRoute` options are the TanStack route options: `loader`, `beforeLoad`, `validateSearch`, `loaderDeps`, `head` and the rest. `route` is the TanStack route, so `route.useLoaderData()`, `route.useParams()`, `route.useSearch()`, `route.useRouteContext()` and `<route.Link>` are typed for this page.

## Limits

- `export default` and `export *` in `<script lang="ts">` do not reach the page
- Route options must be an object literal, so TanStack can keep server-only options out of the client
- Tested with flat routes on Cloudflare Workers. Layouts and nested folders are not tested yet
- Vue Start creates the Vue app itself, so `app.use()` for Pinia or vue-i18n needs a custom entry
- Vite only. TanStack Start also has an Rsbuild plugin, which vuefn does not support

## Why?

TanStack Vue Start needs two files per route today: a `.ts` file for the route and a `.component.vue` file for the page. A `createServerFn()` written in a `.vue` file also loses its server code. vuefn moves the route block into a real `.ts` file before TanStack Start reads it, so both work in one file.

## License

[MIT](https://github.com/pyyupsk/vuefn/blob/main/LICENSE) License © 2026 [Pongsakorn Thipayanate](https://github.com/pyyupsk)
