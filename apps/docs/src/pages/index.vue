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
import { Link } from '@tanstack/vue-router';

import ApiList from '@/components/landing/api-list.vue';
import CliSteps from '@/components/landing/cli-steps.vue';
import HeroFile from '@/components/landing/hero-file.vue';
import InstallBox from '@/components/landing/install-box.vue';
import ProofTiles from '@/components/landing/proof-tiles.vue';
import TemplatePicker from '@/components/landing/template-picker.vue';
import SiteFooter from '@/components/site/site-footer.vue';
import SiteHeader from '@/components/site/site-header.vue';
import { API, CLI_FLAGS, CLI_STEPS, FEATURES, PROOF } from '@/content/landing';
import { REPO } from '@/content/site';

const code = route.useLoaderData();
</script>

<template>
  <SiteHeader />

  <main id="main">
    <section
      class="mx-auto grid max-w-page grid-cols-1 items-center gap-12 px-margin pt-16 pb-section lg:grid-cols-12 lg:pt-24"
      aria-labelledby="hero-h"
    >
      <div class="lg:col-span-5">
        <Link
          class="inline-flex animate-rise items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          to="/docs/$slug"
          :params="{ slug: 'introduction' }"
        >
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
            ><i class="size-1.5 rounded-full bg-brand-500" />0.1.0</span
          >
          TanStack Start for Vue on Cloudflare →
        </Link>
        <h1
          id="hero-h"
          class="mt-6 animate-rise text-display leading-none font-semibold tracking-display"
        >
          One .vue file<br /><span class="text-muted-foreground">per route.</span>
        </h1>
        <p class="mt-6 max-w-lede animate-rise-late text-lg text-muted-foreground">
          The loader, the server functions and the page live in one file. vuefn turns it into a
          TanStack Start route that runs on Cloudflare Workers.
        </p>
        <div class="mt-8 flex animate-rise-late flex-wrap gap-3">
          <Link
            class="inline-flex h-11 items-center rounded-full bg-primary px-5 font-medium text-primary-foreground transition hover:bg-brand-700 active:scale-98"
            to="/docs/$slug"
            :params="{ slug: 'quick-start' }"
            >Get started</Link
          >
          <Link
            class="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 font-medium transition hover:bg-accent active:scale-98"
            to="/docs/$slug"
            :params="{ slug: 'introduction' }"
            >Read the docs</Link
          >
        </div>
        <InstallBox class="mt-8 animate-rise-late" />
      </div>
      <div class="min-w-0 lg:col-span-7">
        <HeroFile :files="HERO_FILES" :html="code.hero" />
      </div>
    </section>

    <section class="mx-auto max-w-page px-margin pb-section" aria-labelledby="features-h">
      <h2 id="features-h" class="sr-only">What you get</h2>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="feature in FEATURES"
          :key="feature.title"
          class="flex flex-col rounded-2xl border border-border bg-card p-6"
        >
          <h3 class="font-medium">{{ feature.title }}</h3>
          <p class="mt-2 text-sm text-muted-foreground">{{ feature.text }}</p>
          <code
            class="mt-auto self-start rounded-lg bg-muted px-2 py-1 pt-1 font-mono text-xs text-muted-foreground"
            >{{ feature.code }}</code
          >
        </li>
      </ul>
    </section>

    <section class="mx-auto max-w-page px-margin pb-section" aria-labelledby="templates-h">
      <TemplatePicker :templates="TEMPLATES" :html="code.templates" />
    </section>

    <section class="mx-auto max-w-page px-margin pb-section" aria-labelledby="cli-h">
      <CliSteps :steps="CLI_STEPS" />
    </section>

    <section class="mx-auto max-w-page px-margin pb-section" aria-labelledby="api-h">
      <ApiList :rows="API" :flags="CLI_FLAGS" :config="code.config" />
    </section>

    <section class="mx-auto max-w-page px-margin pb-section" aria-labelledby="proof-h">
      <ProofTiles :items="PROOF" />
    </section>

    <section class="mx-auto max-w-page px-margin pb-section" aria-labelledby="cta-h">
      <div class="rounded-3xl bg-foreground px-8 py-14 text-background md:px-14">
        <h2 id="cta-h" class="max-w-xl text-section leading-tight font-semibold tracking-tight">
          vuefn is 0.1.0. Start with a side project, and open an issue when something breaks.
        </h2>
        <div class="mt-8 flex flex-wrap gap-3">
          <Link
            class="inline-flex h-11 items-center rounded-full bg-primary px-5 font-medium text-primary-foreground transition hover:bg-brand-700 active:scale-98"
            to="/docs/$slug"
            :params="{ slug: 'quick-start' }"
            >Read the quick start</Link
          >
          <a
            class="inline-flex h-11 items-center rounded-full border border-background/25 px-5 font-medium transition hover:bg-background/10 active:scale-98"
            :href="`${REPO}/issues`"
            >Open an issue</a
          >
        </div>
      </div>
    </section>
  </main>

  <SiteFooter />
</template>
