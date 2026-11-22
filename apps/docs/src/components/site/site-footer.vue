<script setup lang="ts">
import { Link } from '@tanstack/vue-router';

import SiteLogo from '@/components/site/site-logo.vue';
import { REPO } from '@/content/site';
import { FIRST_PAGE } from '@/utils/docs';
</script>

<template>
  <footer class="border-t border-border">
    <div
      class="mx-auto flex max-w-page flex-col gap-6 px-margin py-10 text-sm text-muted-foreground md:flex-row md:items-center"
    >
      <SiteLogo class="text-foreground" />
      <span>One .vue file per route</span>
      <nav class="flex gap-5 md:ml-auto" aria-label="Footer">
        <Link class="hover:text-foreground" to="/docs/$slug" :params="{ slug: FIRST_PAGE }"
          >Docs</Link
        >
        <a class="hover:text-foreground" :href="REPO">GitHub</a>
        <a class="hover:text-foreground" href="https://www.npmjs.com/package/@vuefn/core">npm</a>
        <a class="hover:text-foreground" :href="`${REPO}/releases`">Releases</a>
      </nav>
      <span>MIT, 2026</span>
    </div>
  </footer>
</template>
