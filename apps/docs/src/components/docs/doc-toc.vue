<script setup lang="ts">
import type { Heading } from '@/lib/markdown';

defineProps<{ headings: readonly Heading[] }>();
</script>

<template>
  <nav v-if="headings.length" aria-labelledby="toc-h">
    <h2 id="toc-h" class="mb-2 text-small font-semibold tracking-wide text-muted uppercase">
      On this page
    </h2>
    <ul>
      <li v-for="heading in headings" :key="heading.id" :class="{ 'pl-3': heading.depth === 3 }">
        <a
          class="block py-1 text-small text-muted no-underline hover:text-ink"
          :href="`#${heading.id}`"
          >{{ heading.text }}</a
        >
      </li>
    </ul>
  </nav>
</template>
