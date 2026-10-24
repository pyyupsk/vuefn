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
  <div class="cli">
    <div class="steps">
      <h2 id="cli-h">From zero to a page</h2>
      <ol>
        <li
          v-for="(step, index) in steps"
          ref="blocks"
          :key="step.title"
          :data-step="index"
          :class="{ on: index === active }"
        >
          <p class="big">{{ step.title }}</p>
          <p class="small">{{ step.text }}</p>
        </li>
      </ol>
    </div>
    <div class="stage">
      <pre class="term" data-ui aria-live="polite">{{ props.steps[active]?.screen }}</pre>
    </div>
  </div>
</template>

<style scoped>
.cli {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  align-items: start;
}

.steps {
  grid-column: 1 / 6;
}

h2 {
  font-weight: 400;
  font-size: var(--step-lead);
  color: var(--field-muted);
}

ol {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 52vh;
}

.big {
  max-width: 16ch;
  color: var(--field-muted);
  font-size: clamp(26px, 2.4vw, 32px);
  line-height: 1.15;
  letter-spacing: -0.02em;
  transition: color 200ms;
}

.on .big {
  color: var(--field-ink);
}

.small {
  max-width: 36ch;
  margin-top: 12px;
  color: var(--field-muted);
  font-size: 16px;
}

.stage {
  grid-column: 7 / 13;
  position: sticky;
  top: 14vh;
  display: grid;
  place-items: center;
  min-height: 66vh;
  margin-top: 8vh;
  padding: 48px;
  background: var(--field-2);
}

.term {
  width: 100%;
  max-width: 560px;
  min-height: 380px;
  padding: 24px 26px;
  background: #0d0c0b;
  color: var(--code-ink);
  font-size: 15px;
  line-height: 1.7;
  overflow-x: auto;
}

@media (max-width: 860px) {
  .cli {
    display: flex;
    flex-direction: column-reverse;
  }

  .stage {
    top: 0;
    z-index: 1;
    width: 100%;
    min-height: 0;
    margin-top: 0;
    padding: 16px;
  }

  .term {
    min-height: 250px;
    font-size: 12.5px;
  }

  li {
    min-height: 56svh;
  }
}
</style>
