<script setup lang="ts">
import { Link } from '@tanstack/vue-router';

import SiteLogo from '@/components/site/site-logo.vue';
import SiteSearch from '@/components/site/site-search.vue';
import { REPO, VERSION } from '@/content/site';

defineProps<{ current?: 'docs' }>();
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
    <div class="mx-auto flex h-header max-w-page items-center gap-6 px-margin">
      <SiteLogo />
      <span
        class="hidden rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground sm:inline"
        >v{{ VERSION }}</span
      >
      <nav class="flex gap-5 text-sm text-muted-foreground" aria-label="Main">
        <Link
          class="transition-colors hover:text-foreground"
          :class="{ 'font-medium text-foreground': current === 'docs' }"
          to="/docs/$slug"
          :params="{ slug: 'introduction' }"
          >Docs</Link
        >
        <a class="transition-colors hover:text-foreground" :href="REPO">GitHub</a>
      </nav>
      <SiteSearch class="ml-auto" />
      <Link
        class="hidden h-9 items-center rounded-full bg-primary sm:inline-flex px-4 text-sm font-medium text-primary-foreground transition hover:bg-brand-700 active:scale-98"
        to="/docs/$slug"
        :params="{ slug: 'quick-start' }"
        >Get started</Link
      >
    </div>
  </header>
</template>
