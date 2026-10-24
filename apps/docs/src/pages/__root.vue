<script lang="ts">
import { defineRootRoute } from '@vuefn/core';

import appCss from '@/styles/app.css?url';

export const route = defineRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#181715' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
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
      <a class="skip" href="#main">Skip to content</a>
      <slot />
      <Scripts />
    </Body>
  </Html>
</template>
