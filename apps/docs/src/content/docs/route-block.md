## Two script blocks

A vuefn page has two `<script>` blocks. Each block runs in a different place.

| Block                      | Holds                                                 | Runs                                                         |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| `<script lang="ts">`       | The route: `defineRoute`, server functions, constants | Moved into its own `.ts` file before TanStack Start reads it |
| `<script setup lang="ts">` | The view: refs, computed values, event handlers       | In the component, on the server render and in the browser    |

```vue src/pages/posts/$id.vue
<script lang="ts">
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';

export const getPost = createServerFn()
  .validator((id: string) => id)
  .handler(({ data: id }) => ({ id, title: `Post ${id}` }));

export const route = defineRoute({
  loader: ({ params }) => getPost({ data: params.id }),
});
</script>

<script setup lang="ts">
const post = route.useLoaderData();
</script>

<template>
  <h1>{{ post.title }}</h1>
</template>
```

## What vuefn writes

During `vite dev` and `vite build`, vuefn copies the route block to `src/.vuefn/routes/posts/$id.ts`. That file calls `createFileRoute('/posts/$id')` with your options and with the page as its component. The page then imports `route` from that file, so `<script setup>` and the template can use it.

Do not edit `src/.vuefn/`. vuefn writes it again on every start and build. Add `src/.vuefn/`, `src/routeTree.gen.ts` and `.tanstack/`, a temp folder of TanStack, to `.gitignore`.

## Names the page can use

The page gets these names from the route block:

- `route`, the TanStack route of the page
- Every name that the route block exports, such as `getPost`
- Every other name from the route block that the page uses, such as an imported helper or a constant

Use `route` for everything that belongs to this page:

| Call                      | Gives                                             |
| ------------------------- | ------------------------------------------------- |
| `route.useLoaderData()`   | What the loader returned, typed                   |
| `route.useParams()`       | The path params, such as `{ id: string }`         |
| `route.useSearch()`       | The search params after `validateSearch`          |
| `route.useRouteContext()` | The router context and what `beforeLoad` returned |
| `<route.Link>`            | A link typed against the routes of the app        |

## The path

The file name gives the path. `defineRoute` accepts the path as its first argument, and the build stops if the path does not match the file name:

```ts
export const route = defineRoute('/posts/$id', {
  loader: ({ params }) => getPost({ data: params.id }),
});
```

To leave the path out and keep the types, add the Volar plugin to `tsconfig.json` once:

```json tsconfig.json
{
  "vueCompilerOptions": { "plugins": ["@vuefn/core/volar"] }
}
```

The plugin reads `src/.vuefn`, so run `vite dev` or `vite build` once before `vue-tsc`.

## Route options

`defineRoute` takes every TanStack route option, for example `loader`, `beforeLoad`, `validateSearch`, `loaderDeps`, `head` and `headers`. The options must be an object literal, so that TanStack can remove server-only options from the browser bundle.
