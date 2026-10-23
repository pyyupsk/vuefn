<script lang="ts">
import { defineRoute } from "vuefn";

export const route = defineRoute({
  loader: () => ({ message: "Hello from a loader in index.vue" }),
});
</script>

<script setup lang="ts">
const data = route.useLoaderData();
</script>

<template>
  <h1>{{ data.message }}</h1>
</template>
