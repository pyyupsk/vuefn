<script setup lang="ts">
import { Link } from '@tanstack/vue-router';

import type { DocPage } from '@/content/docs/nav';

defineProps<{ prev?: DocPage; next?: DocPage }>();
</script>

<template>
  <nav class="mt-16 grid gap-4 border-t border-surface-2 pt-8 sm:grid-cols-2" aria-label="Pages">
    <Link
      v-if="prev"
      to="/docs/$slug"
      :params="{ slug: prev.slug }"
      rel="prev"
      class="block bg-sheet p-4 no-underline transition-colors hover:bg-surface"
    >
      <span class="block text-small text-muted">Previous</span>
      <span class="text-ui font-semibold">{{ prev.title }}</span>
    </Link>
    <Link
      v-if="next"
      to="/docs/$slug"
      :params="{ slug: next.slug }"
      rel="next"
      class="block bg-sheet p-4 text-right no-underline transition-colors hover:bg-surface sm:col-start-2"
    >
      <span class="block text-small text-muted">Next</span>
      <span class="text-ui font-semibold">{{ next.title }}</span>
    </Link>
  </nav>
</template>
