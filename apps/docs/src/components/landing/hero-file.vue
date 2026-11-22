<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';

import type { HeroFile, Where } from '@/content/landing';

const props = defineProps<{ files: readonly HeroFile[]; html: readonly string[] }>();

const active = ref(0);
const hovered = ref<Where | ''>('');
const file = computed(() => props.files[active.value]);
const readout = computed(() =>
  hovered.value ? file.value?.says[hovered.value] : 'Point at a line to see where it runs.',
);

function pick(index: number) {
  active.value = index;
  hovered.value = '';
}

function onPoint(event: PointerEvent) {
  const line = (event.target as Element | null)?.closest<HTMLElement>('.line');
  hovered.value = (line?.dataset.where as Where | undefined) ?? '';
}

async function onKey(event: KeyboardEvent) {
  const next = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (!next) return;
  event.preventDefault();
  const list = event.currentTarget as HTMLElement;
  pick((active.value + next + props.files.length) % props.files.length);
  // the new tab is selected only after Vue renders
  await nextTick();
  list.querySelector<HTMLElement>('[aria-selected=true]')?.focus();
}
</script>

<template>
  <figure
    class="w-full min-w-0 overflow-hidden rounded-2xl bg-code text-code-foreground shadow-2xl shadow-foreground/15"
    :data-hover="hovered"
  >
    <div class="flex h-10 items-center gap-1.5 border-b border-code-border bg-code-header px-4">
      <i v-for="dot in 3" :key="dot" class="size-2.5 rounded-full bg-code-border" />
      <span class="ml-3 font-mono text-xs text-code-muted-foreground">{{ file?.label }}</span>
    </div>
    <div class="md:grid md:grid-cols-editor">
      <div
        class="flex gap-1 overflow-x-auto border-b border-code-border p-2 md:flex-col md:border-r md:border-b-0 md:p-3"
        role="tablist"
        aria-label="Files"
        aria-orientation="vertical"
        @keydown="onKey"
      >
        <template v-for="(item, index) in files" :key="item.id">
          <span
            class="hidden px-2 pt-2 pb-1 font-mono text-xs text-code-muted-foreground first:pt-0 md:block"
            >{{ item.folder }}</span
          >
          <button
            :id="`tab-${item.id}`"
            type="button"
            role="tab"
            :aria-label="item.label"
            :aria-selected="index === active"
            :aria-controls="`panel-${item.id}`"
            :tabindex="index === active ? 0 : -1"
            class="flex flex-none cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 font-mono text-xs whitespace-nowrap text-code-muted-foreground transition-colors hover:text-code-active-foreground aria-selected:bg-code-border aria-selected:text-code-active-foreground md:pl-4"
            @click="pick(index)"
          >
            {{ item.name }}
            <span
              v-if="item.tag"
              class="rounded-full border border-code-border px-1.5 font-sans text-tag text-code-muted-foreground"
              >{{ item.tag }}</span
            >
          </button>
        </template>
      </div>
      <div
        :id="`panel-${file?.id}`"
        class="code-lines h-90 overflow-auto py-3 font-mono text-xs leading-6 lg:h-110"
        role="tabpanel"
        tabindex="0"
        :aria-labelledby="`tab-${file?.id}`"
        @pointerover="onPoint"
        @pointerleave="hovered = ''"
        v-html="html[active]"
      />
    </div>
    <figcaption
      class="flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-code-border px-4 py-2.5 text-xs text-code-muted-foreground"
    >
      <span aria-live="polite">{{ readout }}</span>
      <span class="inline-flex flex-none items-center gap-1.5">
        <i class="size-2 rounded-full bg-worker" />Worker
        <i class="ml-2 size-2 rounded-full bg-browser" />Browser
        <i class="ml-2 flex size-2 overflow-hidden rounded-full"
          ><i class="w-1/2 bg-worker" /><i class="w-1/2 bg-browser" /></i
        >Both
      </span>
    </figcaption>
  </figure>
</template>
