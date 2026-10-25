<script lang="ts">
import { redirect } from '@tanstack/vue-router';
import { defineRoute } from '@vuefn/core';

export const route = defineRoute({
  beforeLoad: () => {
    throw redirect({ to: '/docs/$slug', params: { slug: 'introduction' } });
  },
});
</script>
