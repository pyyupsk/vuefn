<script setup lang="ts">
import type { ApiRow } from '@/content/landing';

defineProps<{
  rows: readonly ApiRow[];
  flags: readonly (readonly [string, string])[];
  config: string;
}>();
</script>

<template>
  <div class="lg:grid lg:grid-cols-12 lg:gap-6">
    <div class="max-w-140 lg:col-span-6">
      <h2 id="api-h" class="mb-8 text-lead">The whole API</h2>
      <ul aria-label="Exports">
        <li
          v-for="row in rows"
          :key="row.name"
          class="flex min-h-10 items-baseline justify-between gap-4 py-1.75"
        >
          <span class="flex items-center gap-2.5">
            <i
              class="size-2.25 flex-none rounded-full"
              :class="row.where === 'build' ? 'bg-muted' : 'bg-worker'"
            />
            <code class="text-ui">{{ row.name }}</code>
          </span>
          <span class="text-right text-sm text-muted">{{ row.from }}</span>
        </li>
      </ul>
      <h3 class="mt-10 text-ui text-muted">The CLI</h3>
      <ul aria-label="CLI flags">
        <li
          v-for="[flag, what] in flags"
          :key="flag"
          class="flex min-h-10 items-baseline justify-between gap-4 py-1.75"
        >
          <span class="flex items-center gap-2.5">
            <i class="size-2.25 flex-none rounded-full bg-muted" />
            <code class="text-ui">{{ flag }}</code>
          </span>
          <span class="text-right text-sm text-muted">{{ what }}</span>
        </li>
      </ul>
      <p class="mt-8 flex gap-6 text-sm text-muted">
        <span class="inline-flex items-center gap-2"
          ><i class="size-2.25 rounded-full bg-worker" />Worker and browser</span
        >
        <span class="inline-flex items-center gap-2"
          ><i class="size-2.25 rounded-full bg-muted" />Build time</span
        >
      </p>
    </div>
    <div class="mt-14 lg:col-span-5 lg:col-start-8 lg:mt-0">
      <figure class="bg-code text-code-ink" data-ui>
        <figcaption class="bg-code-bar px-3.5 py-2.5 text-snippet text-code-strong">
          <code>vite.config.ts</code>
        </figcaption>
        <div class="code-plain px-5 py-4.5 text-sm leading-relaxed" v-html="config" />
      </figure>
      <p class="mt-5 max-w-lede text-base">
        <code>vuefn()</code> takes the place of <code>tanstackStart()</code> and takes the same
        options. Every other option is a TanStack route or Start option. vuefn adds none of its own.
      </p>
    </div>
  </div>
</template>
