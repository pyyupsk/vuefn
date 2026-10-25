<script lang="ts">
import { notFound } from '@tanstack/vue-router';
import { defineRoute } from '@vuefn/core';

import { groupOf, pageOf } from '@/utils/docs';

export const route = defineRoute({
  loader: ({ params }) => {
    const page = pageOf(params.slug);
    if (!page) throw notFound();
    return { ...page, group: groupOf(page.slug)?.title };
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
import { Link } from '@tanstack/vue-router';
import { computed, ref } from 'vue';
import type { Component } from 'vue';

import DocPager from '@/components/docs/doc-pager.vue';
import DocSidebar from '@/components/docs/doc-sidebar.vue';
import DocToc from '@/components/docs/doc-toc.vue';
import SiteHeader from '@/components/site/site-header.vue';
import type { Heading } from '@/lib/markdown';
import { neighborsOf } from '@/utils/docs';

// shortcut: every page ships in one chunk, split with a lazy glob when the docs grow past a few dozen pages
const docs = import.meta.glob<{ default: Component; toc: Heading[]; steps?: boolean }>(
  '/src/content/docs/*.md',
  { eager: true },
);
const sources = import.meta.glob<string>('/src/content/docs/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const page = route.useLoaderData();
const doc = computed(() => docs[`/src/content/docs/${page.value.slug}.md`]);
const around = computed(() => neighborsOf(page.value.slug));
const copied = ref(false);

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function copyPage() {
  const source = sources[`/src/content/docs/${page.value.slug}.md`] ?? '';
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
  copied.value = await copyText(`# ${page.value.title}\n\n${page.value.description}\n\n${body}`);
  if (copied.value) setTimeout(() => (copied.value = false), 1400);
}

// the copy buttons come from the Markdown, so one listener handles them all
async function onArticleClick(event: MouseEvent) {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy]');
  const code = button?.closest('figure')?.querySelector('pre')?.textContent;
  if (!button || typeof code !== 'string' || !(await copyText(code))) return;
  button.textContent = 'Copied';
  setTimeout(() => (button.textContent = 'Copy'), 1400);
}
</script>

<template>
  <SiteHeader current="docs" />

  <div
    class="mx-auto max-w-page px-margin lg:grid lg:grid-cols-docs lg:gap-10 xl:grid-cols-docs-toc"
  >
    <details class="border-b border-border py-3 lg:hidden">
      <summary class="cursor-pointer text-sm font-medium">Menu</summary>
      <DocSidebar class="pt-3" :current="page.slug" />
    </details>
    <aside class="hidden lg:block">
      <DocSidebar
        class="sticky top-header max-h-sidebar overflow-y-auto py-8"
        :current="page.slug"
      />
    </aside>

    <main id="main" class="min-w-0 py-8 lg:py-10">
      <div class="mx-auto max-w-3xl">
        <p class="text-sm text-muted-foreground">
          {{ page.group }}<span class="mx-1.5" aria-hidden="true">›</span
          ><span class="text-foreground">{{ page.title }}</span>
        </p>
        <div class="mt-2 flex flex-wrap items-start justify-between gap-4">
          <h1 class="text-4xl font-semibold tracking-tight">{{ page.title }}</h1>
          <div class="flex gap-1.5">
            <button
              type="button"
              class="h-8 cursor-pointer rounded-lg border border-border bg-card px-3 text-xs font-medium transition-colors hover:bg-accent"
              @click="copyPage"
            >
              <span aria-live="polite">{{ copied ? 'Copied' : 'Copy page' }}</span>
            </button>
            <Link
              v-if="around.prev"
              to="/docs/$slug"
              :params="{ slug: around.prev.slug }"
              class="grid size-8 place-items-center rounded-lg border border-border bg-card transition-colors hover:bg-accent"
              :aria-label="`Previous: ${around.prev.title}`"
              >‹</Link
            >
            <Link
              v-if="around.next"
              to="/docs/$slug"
              :params="{ slug: around.next.slug }"
              class="grid size-8 place-items-center rounded-lg border border-border bg-card transition-colors hover:bg-accent"
              :aria-label="`Next: ${around.next.title}`"
              >›</Link
            >
          </div>
        </div>
        <p class="mt-3 text-lg text-muted-foreground">{{ page.description }}</p>
        <hr class="my-8 border-border" />
        <article :class="{ 'doc-steps': doc?.steps }" @click="onArticleClick">
          <component :is="doc?.default" />
        </article>
        <DocPager v-bind="around" />
      </div>
    </main>

    <aside class="hidden xl:block">
      <DocToc class="sticky top-header py-10" :headings="doc?.toc ?? []" />
    </aside>
  </div>
</template>
