<script setup lang="ts">
defineProps<{ items: readonly (readonly [string, string])[] }>();
</script>

<template>
  <div>
    <h2 id="proof-h" class="text-section font-semibold tracking-tight">Built on, tested with</h2>
    <div class="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
      <div
        v-for="[name, what] in items"
        :key="name"
        class="rounded-2xl border border-border bg-card p-5"
      >
        <h3 class="font-medium">{{ name }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ what }}</p>
      </div>
    </div>
  </div>
</template>
