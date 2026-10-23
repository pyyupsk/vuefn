<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute('/_auth/login', {});
</script>

<script setup lang="ts">
const message = 'Sign in';
</script>

<template>
  <h1>{{ message }}</h1>
</template>
