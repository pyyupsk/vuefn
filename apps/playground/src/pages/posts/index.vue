<script lang="ts">
import { defineRoute } from '@vuefn/core';

export const route = defineRoute('/posts/', {});
</script>

<script setup lang="ts">
import { Link } from '@tanstack/vue-router';

import { useCountStore } from '../../stores/count';

const count = useCountStore();
</script>

<template>
  <p>Pick a post</p>
  <button type="button" data-testid="increment" @click="count.increment">
    Count {{ count.value }}
  </button>
  <Link to="/posts/$id" :params="{ id: '1' }">Read post 1</Link>
</template>
