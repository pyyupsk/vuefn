<script setup lang="ts">
import { computed, ref } from 'vue';

import { copy } from '@/utils/copy';
import { MANAGERS, forManager } from '@/utils/package-manager';
import type { Manager } from '@/utils/package-manager';

const manager = ref<Manager>(MANAGERS[0]);
const command = computed(() => forManager('npm create vuefn@latest', manager.value));
const copied = ref(false);
</script>

<template>
  <div class="max-w-md overflow-hidden rounded-2xl border border-border bg-card">
    <div class="flex gap-1 border-b border-border px-2 pt-2" aria-label="Package manager">
      <button
        v-for="name in MANAGERS"
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
        @click="copy(command, (on) => (copied = on))"
      >
        <span aria-live="polite">{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>
  </div>
</template>
