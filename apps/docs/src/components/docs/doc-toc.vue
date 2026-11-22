<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import type { Heading } from '@/utils/docs';

const props = defineProps<{ headings: readonly Heading[] }>();

const active = ref(props.headings[0]?.id);
let observer: IntersectionObserver | undefined;

function observe() {
  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      const seen = entries.find((entry) => entry.isIntersecting);
      if (seen) active.value = seen.target.id;
    },
    { rootMargin: '-80px 0px -70% 0px' },
  );
  for (const heading of props.headings) {
    const el = document.getElementById(heading.id);
    if (el) observer.observe(el);
  }
}

onMounted(observe);
watch(() => props.headings, observe);
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <nav v-if="headings.length" aria-labelledby="toc-h">
    <h2 id="toc-h" class="mb-3 text-sm font-medium">On this page</h2>
    <ul class="border-l border-border">
      <li v-for="heading in headings" :key="heading.id">
        <a
          class="-ml-px block border-l py-1 text-sm transition-colors"
          :class="[
            heading.depth === 3 ? 'pl-6' : 'pl-3',
            heading.id === active
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          ]"
          :href="`#${heading.id}`"
          :aria-current="heading.id === active ? 'location' : undefined"
          >{{ heading.text }}</a
        >
      </li>
    </ul>
  </nav>
</template>
