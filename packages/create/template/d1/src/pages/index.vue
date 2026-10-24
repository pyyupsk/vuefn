<script lang="ts">
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';
import { env } from 'cloudflare:workers';
import { desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import { notes } from '../db/schema';

export const listNotes = createServerFn().handler(() =>
  drizzle(env.DB).select().from(notes).orderBy(desc(notes.createdAt)),
);

export const addNote = createServerFn()
  .validator((body: string) => body)
  .handler(async ({ data: body }) => {
    await drizzle(env.DB).insert(notes).values({ body, createdAt: Date.now() });
  });

export const route = defineRoute({
  loader: () => listNotes(),
});
</script>

<script setup lang="ts">
import { useRouter } from '@tanstack/vue-router';
import { ref } from 'vue';

const router = useRouter();
const data = route.useLoaderData();
const body = ref('');

async function submit() {
  await addNote({ data: body.value });
  body.value = '';
  await router.invalidate();
}
</script>

<template>
  <main>
    <h1>Notes</h1>
    <form @submit.prevent="submit">
      <input v-model="body" placeholder="Write a note" />
      <button type="submit">Add</button>
    </form>
    <ul>
      <li v-for="note in data" :key="note.id">{{ note.body }}</li>
    </ul>
  </main>
</template>
