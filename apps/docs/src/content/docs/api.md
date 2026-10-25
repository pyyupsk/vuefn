## Exports

| Export                                           | From               | Does                                                                    |
| ------------------------------------------------ | ------------------ | ----------------------------------------------------------------------- |
| `vuefn(options)`                                 | `@vuefn/core/vite` | The Vite plugin. It adds the TanStack Start plugins, so leave those out |
| `defineRoute(path, options)`                     | `@vuefn/core`      | The route of a page                                                     |
| `defineRootRoute(options)`                       | `@vuefn/core`      | The route of `src/pages/__root.vue`, which has no path                  |
| `defineRootRouteWithContext<Context>()(options)` | `@vuefn/core`      | The root route with a typed router context                              |
| `useAppPlugins(...plugins)`                      | `@vuefn/core`      | Installs Vue plugins on the app that Vue Start creates                  |
| `@vuefn/core/volar`                              | `tsconfig.json`    | Types `defineRoute` without a path                                      |

## vuefn(options)

```ts vite.config.ts
import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { vuefn } from '@vuefn/core/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: 'ssr' } }), vuefn(), vue()],
});
```

Use `vuefn()` in place of `tanstackStart()`. It takes the same options, such as `spa`, `prerender`, `pages`, `sitemap` and `srcDirectory`, and passes them to TanStack Start.

vuefn sets `router.routesDirectory` to `src/.vuefn/routes` itself. If you pass `router.routesDirectory`, the build stops with an error.

The plugin reads the pages in `src/pages`, or in `pages` under `srcDirectory`. It reads them again when a page is added, changed or deleted during `vite dev`.

## defineRoute(path, options)

```ts
export const route = defineRoute('/posts/$id', {
  loader: ({ params }) => getPost({ data: params.id }),
});
```

| Argument  | Type                   | Description                                                                                                                |
| --------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `path`    | `string`               | The route path that the file name gives. The build stops if they do not match. With the Volar plugin, you can leave it out |
| `options` | TanStack route options | `loader`, `beforeLoad`, `validateSearch`, `loaderDeps`, `head`, `headers` and the other options of `createFileRoute`       |

It returns the TanStack route. Use it from the page as `route.useLoaderData()`, `route.useParams()`, `route.useSearch()`, `route.useRouteContext()` and `<route.Link>`.

`defineRoute` works only in the route block of a file in `src/pages`. Anywhere else, it throws an error.

## defineRootRoute(options)

```ts src/pages/__root.vue
export const route = defineRootRoute({
  head: () => ({ meta: [{ charSet: 'utf-8' }, { title: 'My app' }] }),
});
```

It is TanStack `createRootRoute`, and it takes the same options.

## defineRootRouteWithContext()(options)

```ts src/pages/__root.vue
export const route = defineRootRouteWithContext<{ user: string }>()({
  beforeLoad: ({ context }) => ({ greeting: `Hi ${context.user}` }),
});
```

It is TanStack `createRootRouteWithContext`. Pass the same context to `createRouter({ context })` in `src/router.ts`.

## useAppPlugins(...plugins)

```ts src/pages/__root.vue
useAppPlugins(createPinia());
```

Call it in the `<script setup>` of `src/pages/__root.vue`. It installs each plugin once on the app of the current request. Called in any other component, it throws an error. See [Vue plugins](/docs/vue-plugins).

## @vuefn/core/volar

```json tsconfig.json
{
  "vueCompilerOptions": { "plugins": ["@vuefn/core/volar"] }
}
```

A plugin for `vue-tsc` and the Vue editor tools. It gives `defineRoute({ ... })` the path of its file, so the route keeps its types when you leave the path out. It reads `src/.vuefn`, so run `vite dev` or `vite build` before `vue-tsc`.
