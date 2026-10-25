## In the route block

- `export default` and `export *` in `<script lang="ts">` do not reach the page.
- Route options must be an object literal, so that TanStack can keep server-only options out of the browser.
- The page reads the route through `<script setup>`. A page without `<script setup>` still renders its template, but cannot read the loader.
- vuefn moves relative `import.meta.glob` patterns with the route block, so the keys of the result are relative to `src/.vuefn/routes`. Write the pattern from the root, such as `'/src/content/*.md'`, to get the keys that you wrote.

## Server code

- A loader runs in the browser on client-side navigation too. Put Worker-only imports such as `cloudflare:workers` or D1 in a `createServerFn`.

## Types

- `defineRoute({ ... })` without a path gets its types only through the Volar plugin. The plugin reads `src/.vuefn`, so run `vite dev` or `vite build` before `vue-tsc`.
- `vue-tsc` 3 does not run on TypeScript 7 yet. Use TypeScript 6.

## Plugins and tools

- Vue Start creates the Vue app, so `app.use()` goes through `useAppPlugins` in `__root.vue`. A plugin that needs the client entry, not the app, still needs a custom `client.entry`.
- vuefn works with Vite only. TanStack Start also has an Rsbuild plugin, which vuefn does not support.

## Known bugs

- `Html` from `@tanstack/vue-router` 1.170.42 mounts the page a second time after hydration, so every component mounts twice and CSS animations start again. The fix is in [TanStack/router#8816](https://github.com/TanStack/router/pull/8816) and is not released yet ([#8815](https://github.com/TanStack/router/issues/8815)).

## Tested with

- Flat and folder routes, layouts and pathless layouts, on Cloudflare Workers and on Node with [srvx](https://srvx.h3.dev).
- Node `^22.23.4`, `^24.22.1` and `>=26.12.1`.
