<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ command: string }>();
const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard.writeText(props.command);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1400);
  } catch {
    // the command stays on screen to copy by hand
  }
}
</script>

<template>
  <button class="cmd" type="button" @click="copy">
    <code>{{ command }}</code>
    <span aria-live="polite">{{ copied ? 'Copied' : 'Copy' }}</span>
  </button>
</template>

<style scoped>
.cmd {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  max-width: 100%;
  border: 0;
  padding: 14px 18px;
  background: var(--field-ink);
  color: var(--ink);
  font: 600 15px var(--font-text);
  cursor: pointer;
  transition:
    background 120ms,
    transform 120ms var(--ease);
}

.cmd:hover {
  background: #fff;
}

.cmd:active {
  transform: scale(0.97);
}

code {
  font-size: 15px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

span {
  color: var(--muted);
}
</style>
