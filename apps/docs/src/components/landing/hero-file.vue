<script setup lang="ts">
import { computed, ref } from 'vue';

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

function onKey(event: KeyboardEvent) {
  const next = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
  if (!next) return;
  pick((active.value + next + props.files.length) % props.files.length);
}
</script>

<template>
  <figure class="w-full max-w-150 min-w-0 bg-code text-code-ink" data-ui :data-hover="hovered">
    <div
      class="flex overflow-x-auto bg-code-bar"
      role="tablist"
      aria-label="Files"
      @keydown="onKey"
    >
      <button
        v-for="(item, index) in files"
        :id="`tab-${item.id}`"
        :key="item.id"
        type="button"
        role="tab"
        :aria-selected="index === active"
        :aria-controls="`panel-${item.id}`"
        :tabindex="index === active ? 0 : -1"
        class="flex-none cursor-pointer px-3.5 py-2.5 text-small font-medium whitespace-nowrap text-code-muted aria-selected:bg-code aria-selected:text-code-strong"
        @click="pick(index)"
      >
        <code v-if="item.label.includes('.')" class="text-snippet">{{ item.label }}</code>
        <template v-else>{{ item.label }}</template>
      </button>
    </div>
    <div
      :id="`panel-${file?.id}`"
      class="code-lines h-90 overflow-auto py-3.5 text-snippet leading-relaxed lg:h-120"
      role="tabpanel"
      tabindex="0"
      :aria-labelledby="`tab-${file?.id}`"
      @pointerover="onPoint"
      @pointerleave="hovered = ''"
      v-html="html[active]"
    />
    <figcaption
      class="flex min-h-10 justify-between gap-3 bg-code-bar px-3.5 py-2.5 text-small text-field-muted"
    >
      <span aria-live="polite">{{ readout }}</span>
      <span class="inline-flex flex-none items-center gap-1.5">
        <i class="size-2 rounded-full bg-worker" />Worker
        <i class="ml-2 size-2 rounded-full bg-browser" />Browser
      </span>
    </figcaption>
  </figure>
</template>
