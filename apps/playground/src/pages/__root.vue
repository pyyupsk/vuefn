<script lang="ts">
import { defineRootRouteWithContext } from '@pyyupsk/vuefn';

export const route = defineRootRouteWithContext<{ appName: string }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'vuefn playground' },
    ],
  }),
});
</script>

<script setup lang="ts">
import { Body, HeadContent, Html, Scripts } from '@tanstack/vue-router';
</script>

<template>
  <Html>
    <head>
      <HeadContent />
    </head>
    <Body>
      <slot />
      <Scripts />
    </Body>
  </Html>
</template>
