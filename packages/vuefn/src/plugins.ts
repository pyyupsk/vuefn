import { getCurrentInstance } from 'vue';
import type { App, Plugin } from 'vue';

const installed = new WeakMap<App, Set<Plugin>>();

/**
 * Installs Vue plugins, such as Pinia or vue-i18n, on the app that Vue Start creates.
 * Call it in the `<script setup>` of `src/pages/__root.vue`, so both the server render and the browser get them.
 *
 * @param plugins - The Vue plugins to install, such as `createPinia()`.
 * @example
 * // src/pages/__root.vue
 * useAppPlugins(createPinia());
 */
export function useAppPlugins(...plugins: Plugin[]): void {
  const app = getCurrentInstance()?.appContext.app;
  if (!app) {
    throw new Error('vuefn: call useAppPlugins in the <script setup> of src/pages/__root.vue');
  }
  let used = installed.get(app);
  if (!used) installed.set(app, (used = new Set()));
  for (const plugin of plugins) {
    if (used.has(plugin)) continue;
    used.add(plugin);
    app.use(plugin);
  }
}
