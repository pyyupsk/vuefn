<script setup lang="ts">
import { computed, ref } from 'vue';

import type { Template } from '@/content/landing';

const props = defineProps<{ templates: readonly Template[]; html: readonly string[] }>();

const active = ref(0);
const template = computed(() => props.templates[active.value]);
</script>

<template>
  <div class="picker">
    <div class="names">
      <h2 id="templates-h">Start from a template</h2>
      <button
        v-for="(item, index) in templates"
        :key="item.name"
        type="button"
        :aria-pressed="index === active"
        @click="active = index"
      >
        {{ item.name }}
      </button>
      <p>{{ template?.description }}</p>
      <code class="line">npm create @vuefn@latest my-app --template {{ template?.name }}</code>
    </div>
    <div class="stage">
      <Transition name="swap" mode="out-in">
        <div :key="template?.name" class="sheet" data-ui>
          <ul class="tree" :aria-label="`Files in the ${template?.name} template`">
            <li v-for="[path, why, main] in template?.files" :key="path" :class="{ main }">
              <code>{{ path }}</code>
              <span>{{ why }}</span>
            </li>
          </ul>
          <div class="code" v-html="html[active]" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.picker {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.names {
  grid-column: 1 / 6;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

h2 {
  margin-bottom: 24px;
  font-weight: 400;
  font-size: var(--step-lead);
  color: var(--muted);
}

button {
  border: 0;
  padding: 0;
  background: none;
  color: var(--muted);
  font: 400 clamp(40px, 4.4vw, 64px) / 1.1 var(--font-text);
  letter-spacing: -0.03em;
  cursor: pointer;
  transition: color 160ms;
}

button[aria-pressed='true'],
button:hover {
  color: var(--ink);
}

p {
  max-width: 34ch;
  margin-top: 24px;
}

.line {
  max-width: 100%;
  margin-top: 16px;
  padding: 10px 12px;
  background: var(--surface);
  font-size: 14px;
  overflow-x: auto;
  white-space: nowrap;
}

.stage {
  grid-column: 7 / 13;
  position: relative;
  min-height: 560px;
  overflow: hidden;
  background: var(--surface);
}

.sheet {
  position: absolute;
  inset: 56px -40px auto 56px;
  background: #f3f3ef;
}

.tree {
  list-style: none;
  padding: 22px 24px;
  font-size: 15px;
  line-height: 1.9;
  color: var(--muted);
}

.tree code {
  font-size: 14px;
  margin-right: 12px;
  color: #3b3a35;
}

.tree .main code {
  color: var(--ink);
  font-weight: 600;
}

.code {
  min-height: 240px;
  background: var(--code-bg);
  font-size: 14px;
  line-height: 1.7;
}

.code :deep(pre) {
  padding: 22px 24px;
  overflow-x: auto;
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 160ms;
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
}

@media (max-width: 860px) {
  .picker {
    display: block;
  }

  .stage {
    min-height: 480px;
    margin-top: 40px;
  }

  .sheet {
    inset: 16px -120px auto 16px;
  }
}
</style>
