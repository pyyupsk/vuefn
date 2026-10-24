<script lang="ts">
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';

import { HERO_FILES, TEMPLATES, VITE_CONFIG } from '@/content/landing';
import { highlight } from '@/lib/highlight';
import { whereOf } from '@/utils/where';

// prerendering bakes the result into the HTML, so Shiki never reaches the browser
export const getCode = createServerFn().handler(async () => ({
  hero: await Promise.all(
    HERO_FILES.map((file) => highlight(file.code, file.lang, (line) => whereOf(file, line))),
  ),
  templates: await Promise.all(
    TEMPLATES.map((template) => highlight(template.code, template.name === 'd1' ? 'ts' : 'vue')),
  ),
  config: await highlight(VITE_CONFIG, 'ts'),
}));

const description =
  'vuefn puts the loader, the server functions and the page of a TanStack Start route in one .vue file, and runs it on Cloudflare Workers.';

export const route = defineRoute({
  loader: () => getCode(),
  head: () => ({
    meta: [
      { title: 'vuefn: one .vue file per route' },
      { name: 'description', content: description },
      { property: 'og:title', content: 'vuefn: one .vue file per route' },
      { property: 'og:description', content: description },
    ],
  }),
});
</script>

<script setup lang="ts">
import ApiList from '@/components/landing/api-list.vue';
import CliSteps from '@/components/landing/cli-steps.vue';
import CopyCommand from '@/components/landing/copy-command.vue';
import HeroFile from '@/components/landing/hero-file.vue';
import ProofTiles from '@/components/landing/proof-tiles.vue';
import TemplatePicker from '@/components/landing/template-picker.vue';
import { API, CLI_FLAGS, CLI_STEPS, PROOF, REPO } from '@/content/landing';
import { useReveal } from '@/hooks/useReveal';

const code = route.useLoaderData();
useReveal('main > section');
</script>

<template>
  <header class="hero">
    <div class="intro">
      <a class="mark" href="/">vuefn</a>
      <div>
        <h1>
          <span class="line"><span>One .vue file</span></span>
          <span class="line"><span>per route</span></span>
        </h1>
        <p class="lede">
          The loader, the server functions and the page live in one file. vuefn turns it into a
          TanStack Start route that runs on Cloudflare Workers.
        </p>
        <CopyCommand class="after" command="npm create @vuefn@latest" />
      </div>
    </div>
    <div class="fragment">
      <a class="top-link" :href="`${REPO}#readme`">Read the docs</a>
      <HeroFile :files="HERO_FILES" :html="code.hero" />
    </div>
  </header>

  <main id="main">
    <section aria-labelledby="templates-h">
      <TemplatePicker :templates="TEMPLATES" :html="code.templates" />
    </section>

    <section class="dark" aria-labelledby="cli-h">
      <CliSteps :steps="CLI_STEPS" />
    </section>

    <section aria-labelledby="api-h">
      <ApiList :rows="API" :flags="CLI_FLAGS" :config="code.config" />
    </section>

    <section aria-labelledby="proof-h">
      <ProofTiles :items="PROOF" />
    </section>

    <section class="cta" aria-labelledby="cta-h">
      <h2 id="cta-h">
        vuefn is 0.1.0. Start with a side project, and open an issue when something breaks.
      </h2>
      <div class="actions">
        <a class="btn" :href="`${REPO}#quick-start`">Read the quick start</a>
        <a :href="`${REPO}/issues`">Open an issue</a>
      </div>
    </section>
  </main>

  <footer>
    <span>One .vue file per route</span>
    <nav aria-label="Footer">
      <a :href="REPO">GitHub</a>
      <a href="https://www.npmjs.com/package/@vuefn/core">npm</a>
      <a :href="`${REPO}/releases`">Releases</a>
    </nav>
    <span>MIT, 2026</span>
  </footer>
</template>

<style scoped>
.hero {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100svh;
  background: var(--field);
  color: var(--field-ink);
}

.intro {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--margin);
}

.mark {
  font-weight: 600;
  font-size: 22px;
  letter-spacing: -0.02em;
  text-decoration: none;
}

h1 {
  max-width: 12ch;
  font-weight: 400;
  font-size: var(--step-display);
  line-height: 1;
  letter-spacing: -0.03em;
}

h1 .line {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
}

h1 .line > span {
  display: inline-block;
  animation: rise 900ms var(--ease) both;
}

h1 .line:nth-child(2) > span {
  animation-delay: 110ms;
}

.lede {
  max-width: 44ch;
  margin: 24px 0 32px;
  color: var(--field-muted);
  animation: fade 600ms 500ms var(--ease) both;
}

.after {
  animation: fade 600ms 560ms var(--ease) both;
}

.fragment {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  padding: 88px var(--margin) var(--margin);
  background: var(--field-2);
}

.top-link {
  position: absolute;
  top: var(--margin);
  right: var(--margin);
  font-size: 15px;
}

section {
  padding: clamp(80px, 10vw, 150px) var(--margin);
}

.dark {
  background: var(--field);
  color: var(--field-ink);
}

.cta h2 {
  max-width: 30ch;
  font-weight: 400;
  font-size: var(--step-lead);
  line-height: 1.35;
}

.actions {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
}

.btn {
  display: inline-block;
  padding: 10px 18px;
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: transform 120ms var(--ease);
}

.btn:active {
  transform: scale(0.97);
}

footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: baseline;
  padding: 40px var(--margin) 30px;
  color: var(--muted);
  font-size: 15px;
}

footer nav {
  display: flex;
  gap: 24px;
}

footer nav a {
  color: var(--ink);
  text-decoration: none;
}

footer nav a:hover {
  text-decoration: underline;
}

footer > span:last-child {
  text-align: right;
}

@keyframes rise {
  from {
    transform: translateY(105%);
  }
}

@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .fragment {
    order: -1;
    padding: 64px 16px 24px;
  }

  .intro {
    gap: 40px;
    padding-block: 32px 48px;
  }

  .mark {
    position: absolute;
    top: 18px;
    left: 20px;
    z-index: 1;
  }

  .top-link {
    top: 20px;
    right: 20px;
  }

  footer {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
