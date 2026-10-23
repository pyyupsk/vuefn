<script lang="ts">
import { notFound } from "@tanstack/vue-router";
import { createServerFn } from "@tanstack/vue-start";
import { defineRoute } from "vuefn";

const posts = [
  { id: "1", title: "One file per route" },
  { id: "2", title: "Server functions on Workers" },
];

export const getPost = createServerFn()
  .validator((id: string) => id)
  .handler(({ data: id }) => {
    const post = posts.find((p) => p.id === id);
    if (!post) throw notFound();
    return post;
  });

export const route = defineRoute("/posts/$id", {
  loader: ({ params }) => getPost({ data: params.id }),
});
</script>

<script setup lang="ts">
const params = route.useParams();
const post = route.useLoaderData();
</script>

<template>
  <h1>{{ post.title }}</h1>
  <p>Post {{ params.id }}</p>
</template>
