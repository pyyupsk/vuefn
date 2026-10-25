<script setup lang="ts">
import { useRouter } from '@tanstack/vue-router';
import type { Pagefind } from 'vite-plugin-pagefind/types';
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';

type Result = { url: string; title: string; excerpt: string };

const router = useRouter();
const dialog = useTemplateRef<HTMLDialogElement>('dialog');
const query = ref('');
const results = ref<Result[]>([]);
const status = ref<'idle' | 'loading' | 'missing'>('idle');
let pagefind: Pagefind | undefined;

async function load() {
  if (pagefind) return pagefind;
  try {
    // a full URL, so Vite dev does not add ?import and serve the file as an asset URL
    const url = new URL('/pagefind/pagefind.js', window.location.origin).href;
    pagefind = (await import(/* @vite-ignore */ url)) as Pagefind;
    return pagefind;
  } catch {
    status.value = 'missing';
    return undefined;
  }
}

function open() {
  dialog.value?.showModal();
  void load();
}

watch(query, async (text) => {
  const search = await load();
  if (!search || !text.trim()) {
    results.value = [];
    return;
  }
  status.value = 'loading';
  const found = await search.search(text);
  const pages = await Promise.all(found.results.slice(0, 8).map((result) => result.data()));
  if (text !== query.value) return;
  results.value = pages.map((page) => ({
    url: page.url.replace(/\.html$/, ''),
    title: page.meta.title ?? page.url,
    excerpt: page.excerpt,
  }));
  status.value = 'idle';
});

function onKey(event: KeyboardEvent) {
  if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    open();
  }
}

async function go(url = results.value[0]?.url) {
  if (!url) return;
  dialog.value?.close();
  await router.navigate({ href: url });
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div>
    <button
      type="button"
      class="flex h-9 cursor-pointer items-center gap-3 rounded-lg border border-border bg-card pr-1.5 pl-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
      @click="open"
    >
      <span class="hidden sm:inline">Search docs</span>
      <span class="sm:hidden">Search</span>
      <kbd class="hidden rounded-md border border-border px-1.5 font-sans text-xs sm:inline"
        >⌘K</kbd
      >
    </button>
    <dialog
      ref="dialog"
      class="m-auto mt-24 w-full max-w-xl rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-foreground/20 backdrop:backdrop-blur-sm"
      aria-label="Search the docs"
      @click.self="dialog?.close()"
    >
      <form method="dialog" class="border-b border-border" @submit.prevent="go()">
        <input
          v-model="query"
          type="search"
          class="h-14 w-full bg-transparent px-5 text-base outline-none placeholder:text-muted-foreground"
          placeholder="Search the docs"
          aria-label="Search the docs"
          autofocus
        />
      </form>
      <div class="max-h-96 overflow-y-auto p-2" aria-live="polite">
        <p v-if="status === 'missing'" class="p-3 text-sm text-muted-foreground">
          Search could not load its index. Reload the page and try again.
        </p>
        <p
          v-else-if="query && !results.length && status === 'idle'"
          class="p-3 text-sm text-muted-foreground"
        >
          Nothing matches "{{ query }}".
        </p>
        <ul v-else>
          <li v-for="result in results" :key="result.url">
            <a
              :href="result.url"
              @click.prevent="go(result.url)"
              class="block rounded-lg px-3 py-2.5 transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
            >
              <span class="block text-sm font-medium">{{ result.title }}</span>
              <span
                class="search-excerpt mt-0.5 line-clamp-2 block text-xs text-muted-foreground"
                v-html="result.excerpt"
              />
            </a>
          </li>
        </ul>
      </div>
    </dialog>
  </div>
</template>
