<script setup lang="ts">
import { Link } from '@tanstack/vue-router';

import { DOCS } from '@/content/docs/nav';

defineProps<{ current: string }>();
</script>

<template>
  <nav aria-label="Docs">
    <section v-for="group in DOCS" :key="group.title" class="mb-8">
      <h2 class="mb-2 text-small font-semibold tracking-wide text-muted uppercase">
        {{ group.title }}
      </h2>
      <ul>
        <li v-for="page in group.pages" :key="page.slug">
          <Link
            to="/docs/$slug"
            :params="{ slug: page.slug }"
            class="block border-l-3 py-1.5 pl-3 text-ui no-underline transition-colors"
            :class="
              page.slug === current
                ? 'border-accent font-semibold text-ink'
                : 'border-transparent text-muted hover:text-ink'
            "
            :aria-current="page.slug === current ? 'page' : undefined"
            >{{ page.title }}</Link
          >
        </li>
      </ul>
    </section>
  </nav>
</template>
