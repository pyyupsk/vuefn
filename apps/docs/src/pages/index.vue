<script lang="ts">
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';

import { HERO_FILES, TEMPLATES, VITE_CONFIG } from '@/content/landing';
import { highlight } from '@/lib/highlight';
import { whereOf } from '@/utils/where';

// prerendering bakes the result into the HTML, so Shiki never reaches the browser
export const getCode = createServerFn().handler(async () => ({
  hero: await Promise.all(
    HERO_FILES.map((file) => highlight(file.code, file.lang, (line) => whereOf(file, line))),
  ),
  templates: await Promise.all(
    TEMPLATES.map((template) => highlight(template.code, template.name === 'd1' ? 'ts' : 'vue')),
  ),
  config: await highlight(VITE_CONFIG, 'ts'),
}));

const description =
  'vuefn puts the loader, the server functions and the page of a TanStack Start route in one .vue file, and runs it on Cloudflare Workers.';

export const route = defineRoute({
  loader: () => getCode(),
  head: () => ({
    meta: [
      { title: 'vuefn: one .vue file per route' },
      { name: 'description', content: description },
      { property: 'og:title', content: 'vuefn: one .vue file per route' },
      { property: 'og:description', content: description },
    ],
  }),
});
</script>

<script setup lang="ts">
import ApiList from '@/components/landing/api-list.vue';
import CliSteps from '@/components/landing/cli-steps.vue';
import CopyCommand from '@/components/landing/copy-command.vue';
import HeroFile from '@/components/landing/hero-file.vue';
import ProofTiles from '@/components/landing/proof-tiles.vue';
import TemplatePicker from '@/components/landing/template-picker.vue';
import { API, CLI_FLAGS, CLI_STEPS, PROOF, REPO } from '@/content/landing';
import { useReveal } from '@/hooks/useReveal';

const code = route.useLoaderData();
useReveal('main > section');
</script>

<template>
  <header class="relative grid min-h-svh bg-field text-field-ink lg:grid-cols-2">
    <div class="flex flex-col justify-between gap-10 px-margin pt-8 pb-12 lg:p-margin">
      <a
        class="absolute top-4.5 left-5 z-1 text-xl font-semibold tracking-tight no-underline lg:static"
        href="/"
        >vuefn</a
      >
      <div>
        <h1 class="max-w-headline text-display leading-none font-normal tracking-display">
          <span class="block overflow-hidden pb-1"
            ><span class="inline-block animate-rise">One .vue file</span></span
          >
          <span class="block overflow-hidden pb-1"
            ><span class="inline-block animate-rise-late">per route</span></span
          >
        </h1>
        <p class="mt-6 mb-8 max-w-lede animate-fade text-field-muted">
          The loader, the server functions and the page live in one file. vuefn turns it into a
          TanStack Start route that runs on Cloudflare Workers.
        </p>
        <CopyCommand class="animate-fade-late" command="npm create @vuefn@latest" />
      </div>
    </div>
    <div
      class="relative -order-1 grid min-w-0 place-items-center bg-field-2 px-4 pt-16 pb-6 lg:order-0 lg:px-margin lg:pt-22 lg:pb-margin"
    >
      <a
        class="absolute top-5 right-5 text-ui lg:top-margin lg:right-margin"
        :href="`${REPO}#readme`"
        >Read the docs</a
      >
      <HeroFile :files="HERO_FILES" :html="code.hero" />
    </div>
  </header>

  <main id="main">
    <section class="px-margin py-section" aria-labelledby="templates-h">
      <TemplatePicker :templates="TEMPLATES" :html="code.templates" />
    </section>

    <section class="bg-field px-margin py-section text-field-ink" aria-labelledby="cli-h">
      <CliSteps :steps="CLI_STEPS" />
    </section>

    <section class="px-margin py-section" aria-labelledby="api-h">
      <ApiList :rows="API" :flags="CLI_FLAGS" :config="code.config" />
    </section>

    <section class="px-margin py-section" aria-labelledby="proof-h">
      <ProofTiles :items="PROOF" />
    </section>

    <section class="px-margin py-section" aria-labelledby="cta-h">
      <h2 id="cta-h" class="max-w-lede text-lead leading-snug">
        vuefn is 0.1.0. Start with a side project, and open an issue when something breaks.
      </h2>
      <div class="mt-6 flex items-center gap-6">
        <a
          class="inline-block bg-accent px-4.5 py-2.5 text-base font-semibold text-accent-ink no-underline transition active:scale-97"
          :href="`${REPO}#quick-start`"
          >Read the quick start</a
        >
        <a :href="`${REPO}/issues`">Open an issue</a>
      </div>
    </section>
  </main>

  <footer
    class="grid gap-2 px-margin pt-10 pb-7.5 text-ui text-muted md:grid-cols-footer md:items-baseline"
  >
    <span>One .vue file per route</span>
    <nav class="flex gap-6" aria-label="Footer">
      <a class="text-ink no-underline hover:underline" :href="REPO">GitHub</a>
      <a
        class="text-ink no-underline hover:underline"
        href="https://www.npmjs.com/package/@vuefn/core"
        >npm</a
      >
      <a class="text-ink no-underline hover:underline" :href="`${REPO}/releases`">Releases</a>
    </nav>
    <span class="md:text-right">MIT, 2026</span>
  </footer>
</template>
