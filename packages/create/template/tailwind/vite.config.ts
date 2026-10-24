import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { vuefn } from '@vuefn/core/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: 'ssr' } }), vuefn(), vue(), tailwindcss()],
});
