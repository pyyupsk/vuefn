## Where the code runs

A server function is code that runs only on the Worker. You write it with `createServerFn` from TanStack Start, in the route block of the page. The browser gets a small function that sends a request to the Worker, and the handler, its imports and its secrets stay on the server.

```vue src/pages/notes.vue
<script lang="ts">
import { createServerFn } from '@tanstack/vue-start';
import { defineRoute } from '@vuefn/core';
import { env } from 'cloudflare:workers';

export const listNotes = createServerFn().handler(() =>
  env.DB.prepare('select * from notes').all(),
);

export const route = defineRoute({
  loader: () => listNotes(),
});
</script>
```

## The loader runs in two places

On the first request, the loader runs on the Worker as part of the server render. When the user follows a link to the page, the loader runs in the browser.

For that reason, a loader must not import Worker-only code such as `cloudflare:workers` or a database client. Put that code in a server function and call the server function from the loader. The call works in both places.

## Read with GET, write with POST

A server function uses `GET` by default. Use `GET` to read data.

A function that writes data must use `POST` and must check its input in a `validator`. The validator runs on the Worker before the handler, and its return value becomes `data`:

```ts
export const addNote = createServerFn({ method: 'POST' })
  .validator((body: unknown) => {
    if (typeof body !== 'string' || !body.trim() || body.length > 500) {
      throw new Error('A note needs 1 to 500 characters.');
    }
    return body.trim();
  })
  .handler(async ({ data: body }) => {
    await env.DB.prepare('insert into notes (body) values (?)').bind(body).run();
  });
```

A `GET` request to a `POST` function gets the status 403.

## Call a function from the page

Call a server function from `<script setup>` like any async function. After a write, call `router.invalidate()` so the loader runs again and the page shows the new data:

```vue
<script setup lang="ts">
import { useRouter } from '@tanstack/vue-router';
import { ref } from 'vue';

const router = useRouter();
const notes = route.useLoaderData();
const body = ref('');

async function submit() {
  await addNote({ data: body.value });
  body.value = '';
  await router.invalidate();
}
</script>
```
