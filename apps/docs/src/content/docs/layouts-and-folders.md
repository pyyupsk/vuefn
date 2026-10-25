## File names give paths

vuefn reads the pages in `src/pages`. It asks the TanStack route generator for the path of each file, so the TanStack file conventions apply.

The URL is what the browser shows. The route path is what `defineRoute` takes, and the build checks it against the file name.

| File                      | URL                                        | Route path             |
| ------------------------- | ------------------------------------------ | ---------------------- |
| `index.vue`               | `/`                                        | `/`                    |
| `about.vue`               | `/about`                                   | `/about`               |
| `posts.$id.vue`           | `/posts/1`                                 | `/posts/$id`           |
| `posts/$id.vue`           | `/posts/1`                                 | `/posts/$id`           |
| `_auth/route.vue`         | none, it wraps the pages in `_auth/`       | `/_auth`               |
| `_auth/login.vue`         | `/login`                                   | `/_auth/login`         |
| `(marketing)/pricing.vue` | `/pricing`                                 | `/(marketing)/pricing` |
| `blog_.$slug.vue`         | `/blog/hello`, not nested under `blog.vue` | `/blog_/$slug`         |
| `posts.{-$category}.vue`  | `/posts` or `/posts/news`                  | `/posts/{-$category}`  |
| `-components/Badge.vue`   | none, it is not a route                    | none                   |

Vue Router and Nuxt write `[id].vue` where TanStack writes `$id.vue`.

## A layout for a folder

A file named `route.vue` in a folder is the layout of the pages in that folder. It must render `<Outlet />`, otherwise its pages do not appear:

```text src/pages
src/pages/
├── posts/
│   ├── route.vue   → /posts, the layout around both pages below
│   ├── index.vue   → /posts/
│   └── $id.vue     → /posts/$id
```

```vue src/pages/posts/route.vue
<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute({});
</script>

<script setup lang="ts">
import { Outlet } from '@tanstack/vue-router';
</script>

<template>
  <h2>Posts</h2>
  <Outlet />
</template>
```

`route.vue` takes the path of the folder, and `index.vue` takes the same path with a trailing slash. A folder without `route.vue` has no layout.

## A layout without a path

A folder whose name starts with `_` adds a layout but no path segment. Use it to wrap pages, for example to check a session in `beforeLoad`:

```vue src/pages/_auth/route.vue
<script lang="ts">
import { redirect } from '@tanstack/vue-router';
import { defineRoute } from '@vuefn/core';

import { getSession } from '../../lib/session';

export const route = defineRoute({
  beforeLoad: async () => {
    if (!(await getSession())) throw redirect({ to: '/' });
  },
});
</script>
```

`getSession` stands for a server function of your own that reads the session cookie. Like every layout, this file also needs a template with `<Outlet />`, as in the example above.

`src/pages/_auth/login.vue` is then `/login`, inside that layout.

## The root page

`src/pages/__root.vue` renders the HTML document around every page. It uses `defineRootRoute`, which has no path:

```vue src/pages/__root.vue
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

To give the router a typed context, use `defineRootRouteWithContext<Context>()(options)` and pass the same context to `createRouter({ context })` in `src/router.ts`.
