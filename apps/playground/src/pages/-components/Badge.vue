<script setup lang="ts">
defineProps<{ text: string }>();
</script>

<template>
  <strong data-testid="badge">{{ text }}</strong>
</template>
