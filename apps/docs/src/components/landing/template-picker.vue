<script setup lang="ts">
import { computed, ref } from 'vue';

import type { Template } from '@/content/landing';

const props = defineProps<{ templates: readonly Template[]; html: readonly string[] }>();

const active = ref(0);
const template = computed(() => props.templates[active.value]);
</script>

<template>
  <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
    <div class="lg:col-span-5">
      <h2 id="templates-h" class="text-section font-semibold tracking-tight">
        Start from a template
      </h2>
      <p class="mt-3 max-w-lede text-muted-foreground">
        The CLI asks which one you want and can install the dependencies for you.
      </p>
      <div class="mt-8 inline-flex rounded-full border border-border bg-card p-1">
        <button
          v-for="(item, index) in templates"
          :key="item.name"
          type="button"
          :aria-pressed="index === active"
          class="cursor-pointer rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          @click="active = index"
        >
          {{ item.name }}
        </button>
      </div>
      <p class="mt-6 max-w-lede">{{ template?.description }}</p>
      <code
        class="mt-4 block max-w-full overflow-x-auto rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm whitespace-nowrap"
      >
        npm create @vuefn@latest my-app -- --template {{ template?.name }}
      </code>
    </div>
    <Transition
      enter-active-class="transition duration-200 ease-soft"
      leave-active-class="transition duration-150"
      enter-from-class="translate-y-2 opacity-0"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div
        :key="template?.name"
        class="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-7"
        data-ui
      >
        <ul
          class="space-y-1 border-b border-border px-5 py-4 text-sm text-muted-foreground"
          :aria-label="`Files in the ${template?.name} template`"
        >
          <li v-for="[path, why, main] in template?.files" :key="path" class="flex gap-3">
            <code class="font-mono" :class="main ? 'font-medium text-foreground' : ''">{{
              path
            }}</code>
            <span>{{ why }}</span>
          </li>
        </ul>
        <div
          class="code-plain min-h-60 bg-code px-5 py-4 font-mono text-xs leading-6"
          v-html="html[active]"
        />
      </div>
    </Transition>
  </div>
</template>
