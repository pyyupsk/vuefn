import { describe, expect, it } from "vitest";
import { findRouteBlock, pageModule, routeModule } from "#utils/sfc";

const page = `<script lang="ts">
export const route = defineRoute({ loader: () => 1 });
</script>

<script setup lang="ts">
const data = route.useLoaderData();
</script>

<template><p>{{ data }}</p></template>
`;

describe("findRouteBlock", () => {
  it("returns the plain script block, not script setup", () => {
    const block = findRouteBlock(page, "index.vue");
    expect(block?.content.trim()).toBe("export const route = defineRoute({ loader: () => 1 });");
    expect(page.slice(block!.start, block!.end)).toBe(block!.content);
  });

  it("returns null for a page without a route block", () => {
    expect(findRouteBlock("<template><p /></template>", "a.vue")).toBeNull();
  });

  it("rejects a route block that is not TypeScript", () => {
    expect(() => findRouteBlock("<script>export const route = {}</script>", "a.vue")).toThrow(
      'lang="ts"',
    );
  });
});

describe("routeModule", () => {
  it("builds a file route with the page as component", () => {
    const code = routeModule(findRouteBlock(page, "index.vue"), "../../pages/index.vue", false);
    expect(code).toContain('import { createFileRoute } from "@tanstack/vue-router";');
    expect(code).toContain('import Page from "../../pages/index.vue";');
    expect(code).toContain(
      'export const Route = createFileRoute("/")({ ...route.options, component: Page });',
    );
  });

  it("builds a root route with the page as shell", () => {
    const code = routeModule(null, "../../pages/__root.vue", true);
    expect(code).toContain("const route = { options: {} };");
    expect(code).toContain(
      "export const Route = createRootRoute({ ...route.options, shellComponent: Page });",
    );
  });
});

describe("pageModule", () => {
  it("swaps the route block for an import of the generated route", () => {
    const block = findRouteBlock(page, "index.vue")!;
    const { code } = pageModule(page, block, "/app/src/.vuefn/routes/index.ts", "index.vue");
    expect(code).toContain('import { Route as route } from "/app/src/.vuefn/routes/index.ts";');
    expect(code).not.toContain("defineRoute");
    expect(code).toContain("<script setup");
  });
});
