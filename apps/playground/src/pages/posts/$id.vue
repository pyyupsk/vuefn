<script lang="ts">
import { notFound } from '@tanstack/vue-router';
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';

const posts = [
  { id: '1', title: 'One file per route' },
  { id: '2', title: 'Server functions on Workers' },
];

export const getPost = createServerFn()
  .validator((id: string) => id)
  .handler(({ data: id }) => {
    const post = posts.find((p) => p.id === id);
    if (!post) throw notFound();
    return post;
  });

export const route = defineRoute({
  headers: () => ({ 'cache-control': 'public, max-age=60' }),
  beforeLoad: ({ context }) => ({ site: context.appName }),
  loader: async ({ params, context }) => ({
    post: await getPost({ data: params.id }),
    site: context.site,
  }),
});
</script>

<script setup lang="ts">
const params = route.useParams();
const data = route.useLoaderData();
const total = posts.length;
</script>

<template>
  <h1>{{ data.post.title }}</h1>
  <p>Post {{ params.id }} of {{ total }} on {{ data.site }}</p>
</template>
