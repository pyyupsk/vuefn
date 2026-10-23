import { describe, expect, it } from 'vitest';
import { createSSRApp, defineComponent, h, inject } from 'vue';
import { renderToString } from 'vue/server-renderer';

import { useAppPlugins } from '#plugins';

const key = Symbol('value');

describe('useAppPlugins', () => {
  it('installs a plugin before the template renders, and only once', async () => {
    let installs = 0;
    const plugin = {
      install(app: { provide: (key: symbol, value: string) => void }) {
        installs += 1;
        app.provide(key, 'installed');
      },
    };
    const page = defineComponent(() => {
      useAppPlugins(plugin);
      useAppPlugins(plugin);
      return () => h('p', String(inject(key)));
    });
    expect(await renderToString(createSSRApp(page))).toContain('installed');
    expect(installs).toBe(1);
  });

  it('refuses to run outside a component', () => {
    expect(() => useAppPlugins({ install: () => undefined })).toThrow('__root.vue');
  });
});
