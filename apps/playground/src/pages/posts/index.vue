<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute('/posts/', {});
</script>

<script setup lang="ts">
import { Link } from '@tanstack/vue-router';
</script>

<template>
  <p>Pick a post</p>
  <Link to="/posts/$id" :params="{ id: '1' }">Read post 1</Link>
</template>
