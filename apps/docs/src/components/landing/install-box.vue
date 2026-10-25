<script setup lang="ts">
import { computed, ref } from 'vue';

const commands = {
  npm: 'npm create @vuefn@latest',
  pnpm: 'pnpm create @vuefn',
  bun: 'bun create @vuefn',
  yarn: 'yarn create @vuefn',
} as const;
type Manager = keyof typeof commands;

const manager = ref<Manager>('npm');
const command = computed(() => commands[manager.value]);
const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard.writeText(command.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1400);
  } catch {
    // the command stays on screen to copy by hand
  }
}
</script>

<template>
  <div class="max-w-md overflow-hidden rounded-2xl border border-border bg-card">
    <div class="flex gap-1 border-b border-border px-2 pt-2" aria-label="Package manager">
      <button
        v-for="name in Object.keys(commands) as Manager[]"
        :key="name"
        type="button"
        :aria-pressed="name === manager"
        class="-mb-px cursor-pointer border-b-2 border-transparent px-2.5 pt-1 pb-2 text-sm text-muted-foreground transition-colors hover:text-foreground aria-pressed:border-foreground aria-pressed:text-foreground"
        @click="manager = name"
      >
        {{ name }}
      </button>
    </div>
    <div class="flex items-center justify-between gap-3 py-2 pr-2 pl-4">
      <code class="truncate font-mono text-sm">{{ command }}</code>
      <button
        type="button"
        class="h-8 flex-none cursor-pointer rounded-lg border border-border px-3 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        :aria-label="`Copy ${command}`"
        @click="copy"
      >
        <span aria-live="polite">{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>
  </div>
</template>
