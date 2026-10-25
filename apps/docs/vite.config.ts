import { fileURLToPath } from 'node:url';

import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { vuefn } from '@vuefn/core/vite';
import Markdown from 'unplugin-vue-markdown/vite';
import { defineConfig } from 'vite';

import { setupMarkdown } from './src/lib/markdown.ts';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('src', import.meta.url)) } },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' }, inspectorPort: false }),
    // posts.html instead of posts/index.html, because Workers assets redirect /posts to /posts/
    vuefn({ prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: false } }),
    Markdown({ headEnabled: false, wrapperClasses: 'doc', markdownSetup: setupMarkdown }),
    vue({ include: [/\.vue$/, /\.md$/] }),
    tailwindcss(),
  ],
});
