<script lang="ts">
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';

export const getRuntime = createServerFn().handler(() => `Node ${process.versions.node}`);

export const route = defineRoute('/', {
  loader: () => getRuntime(),
});
</script>

<script setup lang="ts">
import { ref } from 'vue';

const runtime = route.useLoaderData();
const again = ref('');

async function askAgain() {
  again.value = await getRuntime();
}
</script>

<template>
  <h1>Running on {{ runtime }}</h1>
  <button type="button" @click="askAgain">Ask the server again</button>
  <p data-testid="again">{{ again }}</p>
</template>
