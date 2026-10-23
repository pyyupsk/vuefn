<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute('/posts', {
  loader: () => ({ list: ['first', 'second'] }),
});
</script>

<script setup lang="ts">
import { Outlet } from '@tanstack/vue-router';

const data = route.useLoaderData();
</script>

<template>
  <section>
    <h2>Posts on Node</h2>
    <p data-testid="count">{{ data.list.length }} posts</p>
    <Outlet />
  </section>
</template>
