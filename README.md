# vuefn

One `.vue` file per route for TanStack Vue Start on Cloudflare Workers.

## Features

- The loader, the server functions and the page of a route live in one `.vue` file
- `useLoaderData()` and `useParams()` get their types from the loader and the path
- `createServerFn()` in a page runs on the server. The browser gets only the call
- If a route path does not match its file name, the build stops and says the right one
- `vite dev` picks up new, changed and deleted pages without a restart
- No runtime of its own: TanStack Start does the routing, SSR and server functions

## Install

```bash
npm install vuefn @tanstack/vue-router @tanstack/vue-start vue
npm install -D vite @vitejs/plugin-vue @cloudflare/vite-plugin wrangler vue-tsc
```

Node `^22.23.4`, `^24.22.1` or `>=26.12.1`.

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

File names follow the [TanStack naming rules](https://tanstack.com/router/latest/docs/framework/vue/routing/file-naming-conventions): `index.vue` is `/`, `about.vue` is `/about`, `posts.$id.vue` is `/posts/$id`.

vuefn and TanStack write `src/.vuefn/` and `src/routeTree.gen.ts` on every `vite dev` and `vite build`. Add both to `.gitignore`, and run `vue-tsc --noEmit` after one of those commands.

## API

| Export                       | From         | Does                                                                    |
| ---------------------------- | ------------ | ----------------------------------------------------------------------- |
| `vuefn()`                    | `vuefn/vite` | The Vite plugin. It adds the TanStack Start plugins, so leave those out |
| `defineRoute(path, options)` | `vuefn`      | The route of a page. `path` must match the file name                    |
| `defineRootRoute(options)`   | `vuefn`      | The route of `src/pages/__root.vue`, which has no path                  |
| `route.useLoaderData()`      | the route    | A `Ref` to what the loader returns                                      |
| `route.useParams()`          | the route    | A `Ref` to the path parameters, typed from `path`                       |

`options` are TanStack route options, such as `loader` and `head`.

## Limits

- `<script setup>` sees only the names that `<script lang="ts">` exports
- `export default` and `export *` in `<script lang="ts">` do not reach the page
- In `loader`, only `params` and `abortController` have types so far
- Tested with flat routes on Cloudflare Workers. Layouts and nested folders are not tested yet

## Why?

TanStack Vue Start needs two files per route today: a `.ts` file for the route and a `.component.vue` file for the page. A `createServerFn()` written in a `.vue` file also loses its server code. vuefn moves the route block into a real `.ts` file before TanStack Start reads it, so both work in one file.

## License

[MIT](https://github.com/pyyupsk/vuefn/blob/main/LICENSE) License © 2026 [Pongsakorn Thipayanate](https://github.com/pyyupsk)
