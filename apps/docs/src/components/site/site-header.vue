<script setup lang="ts">
import SiteLogo from '@/components/site/site-logo.vue';
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
        <a
          class="transition-colors hover:text-foreground"
          :class="{ 'font-medium text-foreground': current === 'docs' }"
          href="/docs/introduction"
          >Docs</a
        >
        <a class="transition-colors hover:text-foreground" :href="REPO">GitHub</a>
      </nav>
      <a
        class="ml-auto inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/85 active:scale-98"
        href="/docs/quick-start"
        >Get started</a
      >
    </div>
  </header>
</template>
