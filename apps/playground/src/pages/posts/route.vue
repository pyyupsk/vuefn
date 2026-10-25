<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute('/posts', {});
</script>

<script setup lang="ts">
import { Outlet } from '@tanstack/vue-router';

import Badge from '../-components/badge.vue';
</script>

<template>
  <section>
    <h2>Posts <Badge text="nested" /></h2>
    <Outlet />
  </section>
</template>
