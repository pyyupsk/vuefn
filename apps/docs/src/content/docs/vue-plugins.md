## Install a plugin

Vue Start creates the Vue app itself, so your code never calls `createApp()`, and `app.use()` has no place to run. Call `useAppPlugins` in the `<script setup>` of `src/pages/__root.vue` instead:

```vue src/pages/__root.vue
<script setup lang="ts">
import { Body, HeadContent, Html, Scripts } from '@tanstack/vue-router';
import { useAppPlugins } from '@vuefn/core';
import { createPinia } from 'pinia';

useAppPlugins(createPinia());
</script>
```

The plugin reaches both the server render and the browser. `useAppPlugins` takes several plugins at once, and it installs each plugin only once per app.

## One app per request

On the Worker, every request builds a new app. A plugin that you create inside `useAppPlugins` therefore belongs to that one request, and two visitors never share a Pinia store.

Do not create the plugin at the top level of a module, because that object is shared by every request on the same Worker.

## Plugins that need the entry file

`useAppPlugins` covers plugins that only need `app.use()`. A plugin that must change the client entry file, for example to run code before the app mounts, still needs a custom `client.entry` in TanStack Start.
