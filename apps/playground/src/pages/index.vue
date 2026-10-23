<script lang="ts">
import { createServerFn } from "@tanstack/vue-start";
import { env } from "cloudflare:workers";
import { defineRoute } from "vuefn";

export const getGreeting = createServerFn().handler(() => ({
  greeting: env.GREETING,
  runtime: navigator.userAgent,
  at: new Date().toISOString(),
}));

export const route = defineRoute({
  loader: () => getGreeting(),
});
</script>

<script setup lang="ts">
import { ref } from "vue";

const data = route.useLoaderData();
const latest = ref(data.value.at);

async function askAgain() {
  latest.value = (await getGreeting()).at;
}
</script>

<template>
  <h1>{{ data.greeting }}</h1>
  <p>Running in {{ data.runtime }}</p>
  <button type="button" @click="askAgain">Ask the server again</button>
  <p data-testid="latest">{{ latest }}</p>
</template>
