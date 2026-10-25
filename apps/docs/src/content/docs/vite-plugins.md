## Your plugins keep working

vuefn is one Vite plugin, and it changes one thing: the route block of each page in `src/pages`. It moves that `<script lang="ts">` block into its own `.ts` file before `@vitejs/plugin-vue` compiles the page. The rest of the page, and every other file of the app, reaches Vite and the other plugins as usual.

That means the plugins of a Vite + Vue app and of a Vite + TanStack Start app work in a vuefn app too:

- Vue plugins for Vite, such as a Markdown compiler, auto imports or auto-registered components
- CSS tools, such as Tailwind CSS
- Plugins for the build, such as a search index or image tools
- The options of TanStack Start, such as `prerender`, `sitemap`, `spa` and `pages`, which `vuefn()` passes on

If a plugin does not work next to vuefn, [open an issue](https://github.com/pyyupsk/vuefn/issues).

## Where vuefn goes

`vuefn()` takes the place of `tanstackStart()`, so leave the TanStack Start plugin out. Put `cloudflare()` first and `vuefn()` before `vue()`. A plugin that compiles another format to Vue, such as Markdown, goes before `vue()` too.

## The plugins of this site

These docs are a vuefn app. This is their `vite.config.ts`, shortened:

```ts vite.config.ts
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { vuefn } from '@vuefn/core/vite';
import Markdown from 'unplugin-vue-markdown/vite';
import { defineConfig } from 'vite';
import { pagefind } from 'vite-plugin-pagefind';

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    vuefn({
      prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: false },
      sitemap: { enabled: true, host: 'https://vuefn.fasu.dev' },
    }),
    Markdown({ headEnabled: false }),
    vue({ include: [/\.vue$/, /\.md$/] }),
    tailwindcss(),
    pagefind({ outputDirectory: 'dist/client' }),
  ],
});
```

| Plugin                    | Does                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `@cloudflare/vite-plugin` | Runs the server code in workerd, in dev and in the build                                         |
| `vuefn`                   | Turns the pages into TanStack Start routes. `prerender` and `sitemap` are TanStack Start options |
| `unplugin-vue-markdown`   | Compiles the Markdown of these docs to Vue components, with Shiki for the code                   |
| `@vitejs/plugin-vue`      | Compiles the `.vue` files and the compiled Markdown                                              |
| `@tailwindcss/vite`       | Builds the CSS with Tailwind CSS v4                                                              |
| `vite-plugin-pagefind`    | Serves the Pagefind search index during `vite dev`                                               |

The pages of these docs are Markdown files. One page, `src/pages/docs/$slug.vue`, renders all of them: TanStack gives it the slug, and it shows the Markdown file with that name. This is a plain TanStack route with a path param, and nothing about it is special to vuefn.
