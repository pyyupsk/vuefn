<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute('/_auth', {});
</script>

<script setup lang="ts">
import { Outlet } from '@tanstack/vue-router';
</script>

<template>
  <aside data-testid="pathless">Auth layout</aside>
  <Outlet />
</template>
