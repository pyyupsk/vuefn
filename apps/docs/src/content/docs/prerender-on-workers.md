## Static pages from the build

Prerendering renders pages to HTML files during `vite build`. Cloudflare serves those files as static assets, so the Worker does not run for them. Use it for pages that are the same for every visitor, such as a landing page or docs.

Pass the TanStack Start `prerender` option to `vuefn()`:

```ts vite.config.ts
import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { vuefn } from '@vuefn/core/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    vuefn({ prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: false } }),
    vue(),
  ],
});
```

With `crawlLinks: true`, the build starts at `/` and follows every link that it finds. A page that no link reaches is not prerendered. List such pages in the `pages` option, next to `prerender`:

```ts
vuefn({
  pages: [{ path: '/hidden' }],
  prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: false },
});
```

## Set autoSubfolderIndex to false

By default, TanStack Start writes `/posts` as `posts/index.html`. Cloudflare Workers assets then answer a request for `/posts` with a redirect (307) to `/posts/`.

With `autoSubfolderIndex: false`, the build writes `posts.html`, and Workers serves `/posts` directly.

## Code in prerendered pages

The loader of a prerendered page runs once, during the build. Its server functions run during the build too, so the HTML holds their result. The docs on this site use this to highlight code with Shiki at build time, and Shiki never reaches the browser.

Do not prerender a page whose data changes per request or per user. Leave it out with the `filter` option, and the Worker renders it on each request:

```ts
vuefn({
  prerender: {
    enabled: true,
    crawlLinks: true,
    autoSubfolderIndex: false,
    filter: (page) => !page.path.startsWith('/account'),
  },
});
```
