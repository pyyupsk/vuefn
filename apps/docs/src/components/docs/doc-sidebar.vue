<script setup lang="ts">
import { Link } from '@tanstack/vue-router';

import { DOCS } from '@/content/docs/nav';

defineProps<{ current: string }>();
</script>

<template>
  <nav aria-label="Docs">
    <section v-for="group in DOCS" :key="group.title" class="mb-6">
      <h2 class="mb-1 px-3 text-xs font-medium text-muted-foreground">{{ group.title }}</h2>
      <ul>
        <li v-for="page in group.pages" :key="page.slug">
          <Link
            to="/docs/$slug"
            :params="{ slug: page.slug }"
            class="block rounded-lg px-3 py-1.5 text-sm transition-colors"
            :class="
              page.slug === current
                ? 'bg-secondary font-medium text-secondary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            "
            :aria-current="page.slug === current ? 'page' : undefined"
            >{{ page.title }}</Link
          >
        </li>
      </ul>
    </section>
  </nav>
</template>
