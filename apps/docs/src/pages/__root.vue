<script lang="ts">
import fontsCss from '@pyyupsk/fonts?url';
import { preloads } from '@pyyupsk/fonts/meta';
import { defineRootRoute } from '@vuefn/core';

import NotFound from '@/components/site/not-found.vue';
import { SITE_URL } from '@/content/site';

import appCss from '@/styles/app.css?url';

export const route = defineRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#fafafa' },
      { property: 'og:site_name', content: 'vuefn' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: `${SITE_URL}/og.png` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'stylesheet', href: fontsCss },
      ...preloads.map(({ href, type }) => ({
        rel: 'preload',
        as: 'font',
        type,
        href,
        crossOrigin: 'anonymous',
      })),
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
  }),
  notFoundComponent: NotFound,
});
</script>

<script setup lang="ts">
import { Body, HeadContent, Html, Scripts } from '@tanstack/vue-router';
</script>

<template>
  <Html lang="en">
    <head>
      <HeadContent />
    </head>
    <Body>
      <a
        class="sr-only rounded-lg bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-margin focus:z-30"
        href="#main"
        >Skip to content</a
      >
      <slot />
      <Scripts />
    </Body>
  </Html>
</template>
