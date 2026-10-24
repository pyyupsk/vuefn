# vuefn

One `.vue` file per route for TanStack Vue Start on Cloudflare Workers.

## Features

- The loader, the server functions and the page of a route live in one `.vue` file
- `defineRoute` takes every TanStack route option, and `useLoaderData()`, `useParams()`, `useSearch()` and `Link` get their types from it
- `createServerFn()` in a page runs on the server. The browser gets only the call
- If a route path does not match its file name, the build stops and says the right one
- Folders, layout routes and pathless layouts follow the TanStack file conventions
- `vite dev` picks up new, changed and deleted pages without a restart
- No runtime of its own: TanStack Start does the routing, SSR and server functions

## Install

```bash
npm install @vuefn/core @tanstack/vue-router @tanstack/vue-start vue
npm install -D vite @vitejs/plugin-vue @cloudflare/vite-plugin wrangler vue-tsc typescript@^6
```

Node `^22.23.4`, `^24.22.1` or `>=26.12.1`. `vue-tsc` 3 does not run on TypeScript 7 yet, so pin TypeScript 6.

## Usage

Use `vuefn()` in place of `tanstackStart()`:

```ts
// vite.config.ts
import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { vuefn } from '@vuefn/core/vite';
import { defineConfig } from 'vite';

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
import { defineRootRoute } from '@vuefn/core';

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
import { defineRoute } from '@vuefn/core';

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

## Folders and layouts

A folder gives its pages a shared layout, and a file named `route.vue` is that layout:

```tree
src/pages/
├── posts/
│   ├── route.vue   → /posts, the layout around both pages below
│   ├── index.vue   → /posts/
│   └── $id.vue     → /posts/$id
```

```vue
<!-- src/pages/posts/route.vue -->
<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute('/posts', {});
</script>

<script setup lang="ts">
import { Outlet } from '@tanstack/vue-router';
</script>

<template>
  <h2>Posts</h2>
  <Outlet />
</template>
```

`route.vue` is the layout only because it sits in the folder. It takes the path of the folder, `index.vue` takes the path with a trailing slash, and a folder without `route.vue` has no layout. A layout must render `<Outlet />`, otherwise its pages never appear.

The rest of the [TanStack file conventions](https://tanstack.com/router/latest/docs/framework/react/routing/file-naming-conventions) works the same way, because vuefn asks TanStack's route generator for the path of every file instead of having rules of its own:

| File                      | Path                                          |
| ------------------------- | --------------------------------------------- |
| `posts/$id.vue`           | `/posts/$id`                                  |
| `_auth/route.vue`         | pathless, wraps `_auth/login.vue` as `/login` |
| `(marketing)/pricing.vue` | `/pricing`                                    |
| `blog_.$slug.vue`         | `/blog_/$slug`, not nested under `blog`       |
| `posts.{-$category}.vue`  | `/posts/{-$category}`, an optional segment    |
| `-components/Badge.vue`   | not a route, import it from a page            |

### Without the path

The path is in the file name and in the generated route file, so the page can leave it out. Add the Volar plugin once:

```json
// tsconfig.json
{
  "vueCompilerOptions": { "plugins": ["@vuefn/core/volar"] }
}
```

Now `defineRoute({ ... })` is enough. The plugin gives `vue-tsc` the path before it checks the file, so `route.useLoaderData()` and `useParams()` stay typed. Without the plugin, pass the path by hand.

## Plugins

Vue Start creates the Vue app itself, so `app.use()` has no place to run. Call `useAppPlugins` in the setup of `src/pages/__root.vue` instead, and the plugin reaches the server render and the browser:

```vue
<script setup lang="ts">
import { useAppPlugins } from '@vuefn/core';
import { createPinia } from 'pinia';

useAppPlugins(createPinia());
</script>
```

Every request builds a new app, so a plugin created in this call belongs to that request.

vuefn and TanStack write `src/.vuefn/` and `src/routeTree.gen.ts` on every `vite dev` and `vite build`. Add both to `.gitignore`, and run `vue-tsc --noEmit` after one of those commands.

## API

| Export                                        | From               | Does                                                                    |
| --------------------------------------------- | ------------------ | ----------------------------------------------------------------------- |
| `vuefn(options)`                              | `@vuefn/core/vite` | The Vite plugin. It adds the TanStack Start plugins, so leave those out |
| `defineRoute(path, options)`                  | `@vuefn/core`      | The route of a page. `path` must match the file name                    |
| `defineRootRoute(options)`                    | `@vuefn/core`      | The route of `src/pages/__root.vue`, which has no path                  |
| `defineRootRouteWithContext<Context>()(opts)` | `@vuefn/core`      | The root route with a typed router context                              |
| `useAppPlugins(...plugins)`                   | `@vuefn/core`      | Installs Vue plugins on the app that Vue Start creates                  |

`vuefn(options)` takes the `tanstackStart()` options, such as `spa`, `prerender` and `srcDirectory`. vuefn sets `router.routesDirectory` itself.

The `defineRoute` options are the TanStack route options: `loader`, `beforeLoad`, `validateSearch`, `loaderDeps`, `head` and the rest. `route` is the TanStack route, so `route.useLoaderData()`, `route.useParams()`, `route.useSearch()`, `route.useRouteContext()` and `<route.Link>` are typed for this page.

## Limits

- `export default` and `export *` in `<script lang="ts">` do not reach the page
- Route options must be an object literal, so TanStack can keep server-only options out of the client
- The page reaches its route data through `<script setup>`. A page without it still renders its template, but cannot read the loader
- A loader runs in the browser on client-side navigation too, so a Worker-only import such as `cloudflare:workers` or D1 belongs in a `createServerFn`
- The path-less `defineRoute({ ... })` types only through the Volar plugin, and the plugin reads `src/.vuefn`, so run `vite dev` or `vite build` before `vue-tsc`
- Tested with flat and folder routes, layouts and pathless layouts on Cloudflare Workers and on Node with [srvx](https://srvx.h3.dev)
- Vue Start creates the Vue app itself, so `app.use()` goes through `useAppPlugins` in `__root.vue`. A plugin that needs the client entry rather than the app still needs `client.entry`
- Vite only. TanStack Start also has an Rsbuild plugin, which vuefn does not support

## Why?

TanStack Vue Start needs two files per route today: a `.ts` file for the route and a `.component.vue` file for the page. A `createServerFn()` written in a `.vue` file also loses its server code. vuefn moves the route block into a real `.ts` file before TanStack Start reads it, so both work in one file.

## License

[MIT](https://github.com/pyyupsk/vuefn/blob/main/LICENSE) License © 2026 [Pongsakorn Thipayanate](https://github.com/pyyupsk)
