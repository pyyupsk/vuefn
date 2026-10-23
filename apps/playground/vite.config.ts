import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { vuefn } from 'vuefn/vite';

export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: 'ssr' }, inspectorPort: false }), vuefn(), vue()],
});
