<script lang="ts">
import { notFound } from '@tanstack/vue-router';
import { defineRoute } from '@vuefn/core';

import { pageOf } from '@/utils/docs';

export const route = defineRoute({
  loader: ({ params }) => {
    const page = pageOf(params.slug);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} · vuefn` },
          { name: 'description', content: loaderData.description },
          { property: 'og:title', content: `${loaderData.title} · vuefn` },
          { property: 'og:description', content: loaderData.description },
        ]
      : [],
  }),
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';

import DocPager from '@/components/docs/doc-pager.vue';
import DocSidebar from '@/components/docs/doc-sidebar.vue';
import DocToc from '@/components/docs/doc-toc.vue';
import { REPO } from '@/content/landing';
import type { Heading } from '@/lib/markdown';
import { neighborsOf } from '@/utils/docs';

// shortcut: every page ships in one chunk, split with a lazy glob when the docs grow past a few dozen pages
const docs = import.meta.glob<{ default: Component; toc: Heading[] }>('/src/content/docs/*.md', {
  eager: true,
});

const page = route.useLoaderData();
const doc = computed(() => docs[`/src/content/docs/${page.value.slug}.md`]);
const around = computed(() => neighborsOf(page.value.slug));
</script>

<template>
  <header
    class="sticky top-0 z-10 flex items-center justify-between border-b border-surface-2 bg-bg px-margin py-3"
  >
    <a class="text-xl font-semibold tracking-tight no-underline" href="/">vuefn</a>
    <a class="text-ui text-ink no-underline hover:underline" :href="REPO">GitHub</a>
  </header>

  <div class="px-margin lg:grid lg:grid-cols-12 lg:gap-6">
    <details class="border-b border-surface-2 py-3 lg:hidden">
      <summary class="cursor-pointer text-ui font-semibold">Menu</summary>
      <DocSidebar class="pt-4" :current="page.slug" />
    </details>
    <aside class="hidden lg:col-span-3 lg:block xl:col-span-2">
      <DocSidebar class="sticky top-16 pt-10" :current="page.slug" />
    </aside>

    <main id="main" class="min-w-0 py-10 lg:col-span-9 xl:col-span-7">
      <component :is="doc.default" />
      <DocPager v-bind="around" />
    </main>

    <aside class="hidden xl:col-span-3 xl:block">
      <DocToc class="sticky top-16 pt-10" :headings="doc.toc" />
    </aside>
  </div>
</template>
