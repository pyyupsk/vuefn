<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ steps: readonly { title: string; text: string; screen: string }[] }>();

const active = ref(0);
</script>

<template>
  <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
    <div class="lg:col-span-5">
      <h2 id="cli-h" class="text-section font-semibold tracking-tight">From zero to a page</h2>
      <ol class="mt-8 space-y-2">
        <li v-for="(step, index) in steps" :key="step.title">
          <button
            type="button"
            :aria-pressed="index === active"
            class="w-full cursor-pointer rounded-xl border border-transparent p-4 text-left transition-colors hover:bg-card aria-pressed:border-border aria-pressed:bg-card"
            @click="active = index"
          >
            <span class="flex items-baseline gap-3">
              <span class="font-mono text-xs text-muted-foreground">{{ index + 1 }}</span>
              <span class="font-medium">{{ step.title }}</span>
            </span>
            <span class="mt-1 block pl-6 text-sm text-muted-foreground">{{ step.text }}</span>
          </button>
        </li>
      </ol>
    </div>
    <div class="lg:col-span-7">
      <div class="overflow-hidden rounded-2xl bg-code shadow-2xl shadow-foreground/15">
        <div class="flex h-10 items-center gap-1.5 border-b border-code-border bg-code-header px-4">
          <i v-for="dot in 3" :key="dot" class="size-2.5 rounded-full bg-code-border" />
          <span class="ml-3 font-mono text-xs text-code-muted-foreground">Terminal</span>
        </div>
        <pre
          class="min-h-80 overflow-x-auto px-5 py-4 font-mono text-xs leading-6 text-code-foreground"
          aria-live="polite"
          >{{ props.steps[active]?.screen }}</pre>
      </div>
    </div>
  </div>
</template>
