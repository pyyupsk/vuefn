<script setup lang="ts">
defineProps<{ items: readonly (readonly [string, string])[] }>();
</script>

<template>
  <div class="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2">
    <div class="col-span-2 bg-accent p-4 text-accent-ink md:p-6">
      <h2 id="proof-h" class="text-tile-head leading-none tracking-tight">Built on, tested with</h2>
    </div>
    <div
      v-for="[name, what] in items"
      :key="name"
      class="min-h-30 bg-surface p-4 md:aspect-3/2 md:min-h-0 md:p-6"
    >
      <h3 class="text-tile leading-tight font-semibold tracking-tight">{{ name }}</h3>
      <p class="mt-2 text-ui leading-snug text-muted">{{ what }}</p>
    </div>
  </div>
</template>
