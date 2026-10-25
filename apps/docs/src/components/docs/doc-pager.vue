<script setup lang="ts">
import { Link } from '@tanstack/vue-router';

import type { DocPage } from '@/content/docs/nav';

defineProps<{ prev?: DocPage; next?: DocPage }>();
</script>

<template>
  <nav class="mt-14 grid gap-3 sm:grid-cols-2" aria-label="Pages">
    <Link
      v-if="prev"
      to="/docs/$slug"
      :params="{ slug: prev.slug }"
      rel="prev"
      class="rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
    >
      <span class="block text-xs text-muted-foreground">Previous</span>
      <span class="font-medium">{{ prev.title }}</span>
    </Link>
    <Link
      v-if="next"
      to="/docs/$slug"
      :params="{ slug: next.slug }"
      rel="next"
      class="rounded-xl border border-border bg-card px-4 py-3 text-right transition-colors hover:bg-accent sm:col-start-2"
    >
      <span class="block text-xs text-muted-foreground">Next</span>
      <span class="font-medium">{{ next.title }}</span>
    </Link>
  </nav>
</template>
