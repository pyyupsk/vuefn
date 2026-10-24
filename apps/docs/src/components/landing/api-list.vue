<script setup lang="ts">
import type { ApiRow } from '@/content/landing';

defineProps<{
  rows: readonly ApiRow[];
  flags: readonly (readonly [string, string])[];
  config: string;
}>();
</script>

<template>
  <div class="api">
    <div class="list">
      <h2 id="api-h">The whole API</h2>
      <ul aria-label="Exports">
        <li v-for="row in rows" :key="row.name">
          <span class="name"
            ><i :class="['dot', row.where]" /><code>{{ row.name }}</code></span
          >
          <span class="from">{{ row.from }}</span>
        </li>
      </ul>
      <h3>The CLI</h3>
      <ul aria-label="CLI flags">
        <li v-for="[flag, what] in flags" :key="flag">
          <span class="name"
            ><i class="dot build" /><code>{{ flag }}</code></span
          >
          <span class="from">{{ what }}</span>
        </li>
      </ul>
      <p class="legend">
        <span><i class="dot both" />Worker and browser</span>
        <span><i class="dot build" />Build time</span>
      </p>
    </div>
    <div class="setup">
      <figure class="file" data-ui>
        <figcaption><code>vite.config.ts</code></figcaption>
        <div class="code" v-html="config" />
      </figure>
      <p>
        <code>vuefn()</code> takes the place of <code>tanstackStart()</code> and takes the same
        options. Every other option is a TanStack route or Start option. vuefn adds none of its own.
      </p>
    </div>
  </div>
</template>

<style scoped>
.api {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.list {
  grid-column: 1 / 7;
  max-width: 560px;
}

h2 {
  margin-bottom: 32px;
  font-weight: 400;
  font-size: var(--step-lead);
}

h3 {
  margin-top: 40px;
  font-weight: 400;
  font-size: 15px;
  color: var(--muted);
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  min-height: 40px;
  padding-block: 7px;
}

.name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name code {
  font-size: 15px;
}

.from {
  color: var(--muted);
  font-size: 14px;
  text-align: right;
}

.dot {
  display: inline-block;
  flex: none;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.dot.both {
  background: var(--worker);
}

.dot.build {
  background: var(--muted);
}

.legend {
  display: flex;
  gap: 24px;
  margin-top: 32px;
  color: var(--muted);
  font-size: 14px;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.setup {
  grid-column: 8 / 13;
}

.file {
  background: var(--code-bg);
  color: var(--code-ink);
}

figcaption {
  padding: 10px 14px;
  background: var(--code-bar);
  color: #f2f1ea;
  font-size: 12.5px;
}

.code {
  font-size: 14px;
  line-height: 1.7;
}

.code :deep(pre) {
  padding: 18px 20px;
  overflow-x: auto;
}

.setup p {
  max-width: 44ch;
  margin-top: 20px;
  font-size: 16px;
}

.setup p code {
  font-size: 0.9em;
}

@media (max-width: 860px) {
  .api {
    display: block;
  }

  .setup {
    margin-top: 56px;
  }
}
</style>
