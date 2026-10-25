<script setup lang="ts">
import { Link } from '@tanstack/vue-router';

import SiteHeader from '@/components/site/site-header.vue';
</script>

<template>
  <SiteHeader />
  <main id="main" class="mx-auto flex max-w-page flex-col items-start px-margin py-section">
    <p class="font-mono text-sm text-muted-foreground">404</p>
    <h1 class="mt-3 text-section font-semibold tracking-tight">This page does not exist</h1>
    <p class="mt-3 max-w-lede text-muted-foreground">
      The link may be old, or the page moved. The docs have every page in the sidebar.
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <Link
        class="inline-flex h-11 items-center rounded-full bg-primary px-5 font-medium text-primary-foreground transition hover:bg-brand-700 active:scale-98"
        to="/docs/$slug"
        :params="{ slug: 'introduction' }"
        >Open the docs</Link
      >
      <Link
        class="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 font-medium transition hover:bg-accent active:scale-98"
        to="/"
        >Home</Link
      >
    </div>
  </main>
</template>
