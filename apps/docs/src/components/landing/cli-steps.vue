<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

const props = defineProps<{ steps: readonly { title: string; text: string; screen: string }[] }>();

const active = ref(0);
const blocks = useTemplateRef<HTMLElement[]>('blocks');
let observer: IntersectionObserver | undefined;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) active.value = Number((entry.target as HTMLElement).dataset.step);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  for (const block of blocks.value ?? []) observer.observe(block);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div class="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
    <div class="lg:col-span-5">
      <h2 id="cli-h" class="text-lead text-field-muted">From zero to a page</h2>
      <ol>
        <li
          v-for="(step, index) in steps"
          ref="blocks"
          :key="step.title"
          :data-step="index"
          class="group flex min-h-step flex-col justify-center"
          :data-on="index === active || undefined"
        >
          <p
            class="max-w-step text-step leading-tight tracking-tight text-field-muted transition-colors group-data-on:text-field-ink"
          >
            {{ step.title }}
          </p>
          <p class="mt-3 max-w-note text-base text-field-muted">{{ step.text }}</p>
        </li>
      </ol>
    </div>
    <div
      class="sticky top-0 z-1 grid w-full place-items-center bg-field-2 p-4 lg:top-sticky lg:col-span-6 lg:col-start-7 lg:mt-nudge lg:min-h-stage lg:p-12"
    >
      <pre
        class="min-h-62 w-full max-w-140 overflow-x-auto bg-term px-6.5 py-6 text-small leading-relaxed text-code-ink lg:min-h-95 lg:text-ui"
        data-ui
        aria-live="polite"
        >{{ props.steps[active]?.screen }}</pre>
    </div>
  </div>
</template>
