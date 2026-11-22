<script lang="ts">
import { redirect } from '@tanstack/vue-router';
import { defineRoute } from '@vuefn/core';

import { FIRST_PAGE } from '@/utils/docs';

export const route = defineRoute({
  beforeLoad: () => {
    throw redirect({ to: '/docs/$slug', params: { slug: FIRST_PAGE } });
  },
});
</script>
