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
  <button
    class="inline-flex max-w-full cursor-pointer items-center gap-4 bg-field-ink px-4.5 py-3.5 text-ui font-semibold text-ink transition hover:bg-white active:scale-97"
    type="button"
    @click="copy"
  >
    <code class="truncate text-ui font-medium">{{ command }}</code>
    <span class="text-muted" aria-live="polite">{{ copied ? 'Copied' : 'Copy' }}</span>
  </button>
</template>
