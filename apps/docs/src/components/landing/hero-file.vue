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
  <figure class="file" data-ui :data-hover="hovered">
    <div class="tabs" role="tablist" aria-label="Files" @keydown="onKey">
      <button
        v-for="(item, index) in files"
        :id="`tab-${item.id}`"
        :key="item.id"
        type="button"
        role="tab"
        :aria-selected="index === active"
        :aria-controls="`panel-${item.id}`"
        :tabindex="index === active ? 0 : -1"
        @click="pick(index)"
      >
        <code v-if="item.label.includes('.')">{{ item.label }}</code>
        <template v-else>{{ item.label }}</template>
      </button>
    </div>
    <div
      :id="`panel-${file?.id}`"
      class="code"
      role="tabpanel"
      tabindex="0"
      :aria-labelledby="`tab-${file?.id}`"
      @pointerover="onPoint"
      @pointerleave="hovered = ''"
      v-html="html[active]"
    />
    <figcaption class="readout">
      <span aria-live="polite">{{ readout }}</span>
      <span class="legend"><i class="dot worker" />Worker <i class="dot browser" />Browser</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.file {
  width: min(600px, 100%);
  min-width: 0;
  background: var(--code-bg);
  color: var(--code-ink);
}

.tabs {
  display: flex;
  background: var(--code-bar);
  overflow-x: auto;
}

.tabs button {
  flex: none;
  border: 0;
  padding: 10px 14px;
  background: none;
  color: var(--code-muted);
  font: 500 13px var(--font-text);
  cursor: pointer;
  white-space: nowrap;
}

.tabs button code {
  font-size: 12.5px;
}

.tabs button[aria-selected='true'] {
  background: var(--code-bg);
  color: #f2f1ea;
}

.code {
  height: 480px;
  overflow: auto;
  font-size: 12.5px;
  line-height: 1.6;
}

.code :deep(pre) {
  padding: 14px 0;
  background: transparent !important;
  counter-reset: line;
}

.code :deep(.line) {
  display: inline-block;
  width: 100%;
  padding-right: 16px;
  border-left: 3px solid transparent;
  transition: opacity 120ms;
}

.code :deep(.line)::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 40px;
  padding-right: 14px;
  text-align: right;
  color: #5c5b55;
}

.code :deep([data-where='worker']),
.code :deep([data-where='both']) {
  border-left-color: var(--worker);
}

.code :deep([data-where='browser']) {
  border-left-color: var(--browser);
}

.file[data-hover='worker'] .code :deep(.line:not([data-where='worker'])),
.file[data-hover='both'] .code :deep(.line:not([data-where='both'])),
.file[data-hover='browser'] .code :deep(.line:not([data-where='browser'])) {
  opacity: 0.35;
}

.readout {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 10px 14px;
  background: var(--code-bar);
  color: #b5b4ac;
  font-size: 13px;
}

.legend {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.browser {
  margin-left: 8px;
  background: var(--browser);
}

.dot.worker {
  background: var(--worker);
}

@media (max-width: 860px) {
  .code {
    height: 46svh;
    font-size: 12px;
  }
}
</style>
