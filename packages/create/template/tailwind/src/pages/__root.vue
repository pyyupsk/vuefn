<script lang="ts">
import { defineRootRoute } from '@vuefn/core';

export const route = defineRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'vuefn' },
    ],
  }),
});
</script>

<script setup lang="ts">
import { Body, HeadContent, Html, Scripts } from '@tanstack/vue-router';

import '../app.css';
</script>

<template>
  <Html lang="en">
    <head>
      <HeadContent />
    </head>
    <Body>
      <slot />
      <Scripts />
    </Body>
  </Html>
</template>
