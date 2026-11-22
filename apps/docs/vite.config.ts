import { fileURLToPath } from 'node:url';

import { cloudflare } from '@cloudflare/vite-plugin';
import { fonts } from '@pyyupsk/vite-fonts';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { vuefn } from '@vuefn/core/vite';
import Markdown from 'unplugin-vue-markdown/vite';
import { defineConfig } from 'vite';
import { pagefindBuild, pagefindDevelop } from 'vite-plugin-pagefind';

import { SITE_URL } from './src/content/site.ts';
import { setupMarkdown } from './src/lib/markdown.ts';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('src', import.meta.url)) } },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' }, inspectorPort: false }),
    // posts.html instead of posts/index.html, because Workers assets redirect /posts to /posts/
    vuefn({
      prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: false },
      sitemap: { enabled: true, host: SITE_URL },
      // /docs only redirects to the introduction
      pages: [{ path: '/docs/', sitemap: { exclude: true }, prerender: { enabled: false } }],
    }),
    Markdown({ headEnabled: false, wrapperClasses: 'doc', markdownSetup: setupMarkdown }),
    vue({ include: [/\.vue$/, /\.md$/] }),
    fonts({
      inject: 'manual',
      families: {
        sans: {
          family: 'Geist',
          weights: ['variable'],
          variable: '--font-geist',
          fallback: ['system-ui', 'sans-serif'],
          adjustFontFallback: true,
        },
        mono: {
          family: 'Geist Mono',
          weights: ['variable'],
          variable: '--font-geist-mono',
          fallback: ['ui-monospace', 'monospace'],
          adjustFontFallback: true,
        },
      },
    }),
    tailwindcss(),
    // the build script runs pagefind; in dev the plugin builds once and serves the index from public/
    // not in the preview server that prerender starts, or the build runs itself again
    pagefindBuild(),
    {
      ...pagefindDevelop({ outputDirectory: 'dist/client' }),
      apply: (_, env) => env.command === 'serve' && !env.isPreview,
    },
  ],
});
