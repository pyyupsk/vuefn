## Why one file

TanStack Vue Start needs two files for each route today: a `.ts` file for the route and a `.vue` file for the page. A `createServerFn()` that you write in a `.vue` file also loses its server code.

vuefn moves the route block of the page into a real `.ts` file before TanStack Start reads it. TanStack Start then sees the two files that it expects, and you keep one.

## What a page looks like

The route goes in `<script lang="ts">`. The view goes in `<script setup>` and `<template>`:

```vue src/pages/posts/$id.vue
<script lang="ts">
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';

const posts = [{ id: '1', title: 'One file per route' }];

export const getPost = createServerFn()
  .validator((id: string) => id)
  .handler(({ data: id }) => posts.find((p) => p.id === id));

export const route = defineRoute({
  loader: ({ params }) => getPost({ data: params.id }),
});
</script>

<script setup lang="ts">
const post = route.useLoaderData();
</script>

<template>
  <h1>{{ post?.title }}</h1>
</template>
```

The handler of `getPost` runs only on the Worker. The browser gets a call that sends a request to it. `route.useLoaderData()` knows the type that the loader returns, and `route.useParams()` knows that the page has an `id`.

## What you get

- `defineRoute` takes every TanStack route option, such as `loader`, `head` and `validateSearch`
- `useLoaderData()`, `useParams()`, `useSearch()` and `Link` get their types from the route
- If the path in `defineRoute` does not match the file name, the build stops and gives the correct path
- Folders, layout routes and pathless layouts follow the TanStack file conventions
- `vite dev` finds new, changed and deleted pages without a restart

## What vuefn does not do

vuefn has no runtime of its own. TanStack Start does the routing, the server render and the server functions, and the TanStack documentation applies to a vuefn app. vuefn works with Vite only.

vuefn is at version 0.1.0. Start with a side project, and [open an issue](https://github.com/pyyupsk/vuefn/issues) when something breaks.
