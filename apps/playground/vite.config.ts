import { cloudflare } from '@cloudflare/vite-plugin';
import { vuefn } from '@pyyupsk/vuefn/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: 'ssr' }, inspectorPort: false }), vuefn(), vue()],
});
