<script setup lang="ts">
import type { ApiRow } from '@/content/landing';

defineProps<{
  rows: readonly ApiRow[];
  flags: readonly (readonly [string, string])[];
  config: string;
}>();
</script>

<template>
  <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
    <div class="lg:col-span-6">
      <h2 id="api-h" class="text-section font-semibold tracking-tight">The whole API</h2>
      <ul
        class="mt-8 overflow-hidden rounded-2xl border border-border bg-card"
        aria-label="Exports"
      >
        <li
          v-for="row in rows"
          :key="row.name"
          class="flex items-center justify-between gap-4 border-b border-border px-5 py-3 last:border-b-0"
        >
          <span class="flex items-center gap-3">
            <i v-if="row.where === 'build'" class="size-2 flex-none rounded-full bg-input" />
            <i v-else class="flex size-2 flex-none overflow-hidden rounded-full"
              ><i class="w-1/2 bg-worker" /><i class="w-1/2 bg-browser"
            /></i>
            <code class="font-mono text-sm">{{ row.name }}</code>
          </span>
          <span class="text-right text-xs text-muted-foreground">{{ row.from }}</span>
        </li>
      </ul>
      <h3 class="mt-8 text-sm font-medium text-muted-foreground">The CLI</h3>
      <ul
        class="mt-3 overflow-hidden rounded-2xl border border-border bg-card"
        aria-label="CLI flags"
      >
        <li
          v-for="[flag, what] in flags"
          :key="flag"
          class="flex items-center justify-between gap-4 border-b border-border px-5 py-3 last:border-b-0"
        >
          <code class="font-mono text-sm">{{ flag }}</code>
          <span class="text-right text-xs text-muted-foreground">{{ what }}</span>
        </li>
      </ul>
      <p class="mt-4 flex gap-5 text-xs text-muted-foreground">
        <span class="inline-flex items-center gap-2"
          ><i class="flex size-2 overflow-hidden rounded-full"
            ><i class="w-1/2 bg-worker" /><i class="w-1/2 bg-browser" /></i
          >Worker and browser</span
        >
        <span class="inline-flex items-center gap-2"
          ><i class="size-2 rounded-full bg-input" />Build time</span
        >
      </p>
    </div>
    <div class="lg:col-span-6">
      <figure class="overflow-hidden rounded-2xl bg-code text-code-foreground" data-ui>
        <figcaption
          class="border-b border-code-border bg-code-header px-4 py-2.5 font-mono text-xs text-code-muted-foreground"
        >
          vite.config.ts
        </figcaption>
        <div class="code-plain px-5 py-4 font-mono text-xs leading-6" v-html="config" />
      </figure>
      <p class="mt-5 max-w-lede text-muted-foreground">
        <code class="font-mono text-sm text-foreground">vuefn()</code> takes the place of
        <code class="font-mono text-sm text-foreground">tanstackStart()</code> and takes the same
        options. Every other option is a TanStack route or Start option. vuefn adds none of its own.
      </p>
    </div>
  </div>
</template>
