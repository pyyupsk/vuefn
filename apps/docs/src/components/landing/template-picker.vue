<script setup lang="ts">
import { computed, ref } from 'vue';

import type { Template } from '@/content/landing';

const props = defineProps<{ templates: readonly Template[]; html: readonly string[] }>();

const active = ref(0);
const template = computed(() => props.templates[active.value]);
</script>

<template>
  <div class="lg:grid lg:grid-cols-12 lg:gap-6">
    <div class="flex flex-col items-start gap-2 lg:col-span-5">
      <h2 id="templates-h" class="mb-6 text-lead text-muted">Start from a template</h2>
      <button
        v-for="(item, index) in templates"
        :key="item.name"
        type="button"
        :aria-pressed="index === active"
        class="cursor-pointer text-pick leading-tight tracking-display text-muted transition-colors hover:text-ink aria-pressed:text-ink"
        @click="active = index"
      >
        {{ item.name }}
      </button>
      <p class="mt-6 max-w-measure">{{ template?.description }}</p>
      <code
        class="mt-4 max-w-full overflow-x-auto bg-surface px-3 py-2.5 text-sm whitespace-nowrap"
      >
        npm create @vuefn@latest my-app --template {{ template?.name }}
      </code>
    </div>
    <div
      class="relative mt-10 min-h-120 overflow-hidden bg-surface lg:col-span-6 lg:col-start-7 lg:mt-0 lg:min-h-140"
    >
      <Transition
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        mode="out-in"
      >
        <div
          :key="template?.name"
          class="absolute top-4 -right-30 left-4 bg-sheet lg:top-14 lg:-right-10 lg:left-14"
          data-ui
        >
          <ul
            class="px-6 py-5.5 text-ui leading-loose text-muted"
            :aria-label="`Files in the ${template?.name} template`"
          >
            <li v-for="[path, why, main] in template?.files" :key="path">
              <code class="mr-3 text-sm" :class="main ? 'font-semibold text-ink' : 'text-tree'">{{
                path
              }}</code>
              <span>{{ why }}</span>
            </li>
          </ul>
          <div
            class="code-plain min-h-60 bg-code px-6 py-5.5 text-sm leading-relaxed"
            v-html="html[active]"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>
