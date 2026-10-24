<script setup lang="ts">
defineProps<{ items: readonly (readonly [string, string])[] }>();
</script>

<template>
  <div class="tiles">
    <div class="tile head">
      <h2 id="proof-h">Built on, tested with</h2>
    </div>
    <div v-for="[name, what] in items" :key="name" class="tile">
      <h3>{{ name }}</h3>
      <p>{{ what }}</p>
    </div>
  </div>
</template>

<style scoped>
.tiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.tile {
  aspect-ratio: 3 / 2;
  padding: 24px;
  background: var(--surface);
}

.head {
  grid-column: span 2;
  aspect-ratio: auto;
  background: var(--accent);
  color: var(--accent-ink);
}

h2 {
  font-weight: 400;
  font-size: clamp(28px, 3vw, 44px);
  line-height: 1.05;
  letter-spacing: -0.025em;
}

h3 {
  font-weight: 600;
  font-size: clamp(20px, 2vw, 28px);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

p {
  margin-top: 8px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.4;
}

@media (max-width: 860px) {
  .tiles {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .tile {
    aspect-ratio: auto;
    min-height: 120px;
    padding: 16px;
  }
}
</style>
