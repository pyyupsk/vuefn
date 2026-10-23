<script lang="ts">
import { defineRootRouteWithContext } from '@vuefn/core';

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
import { useAppPlugins } from '@vuefn/core';
import { createPinia } from 'pinia';

useAppPlugins(createPinia());
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
