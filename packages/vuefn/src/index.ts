import type { ResolveParams } from '@tanstack/vue-router';
import type { Ref } from 'vue';

type LoaderData<T> = T extends { loader: (...args: never[]) => infer R } ? Awaited<R> : undefined;

type Options<TParams> = Readonly<{
  loader?: (ctx: { params: TParams; abortController: AbortController }) => unknown;
  [key: string]: unknown;
}>;

/**
 * The route that `defineRootRoute` gives to `__root.vue`. At runtime it is the TanStack root route.
 */
export type DefinedRootRoute<T> = Readonly<{
  options: T;
  useLoaderData: () => Ref<LoaderData<T>>;
}>;

/**
 * The route that `defineRoute` gives to a page. At runtime it is the TanStack file route.
 */
export type DefinedRoute<TPath extends string, T> = DefinedRootRoute<T> &
  Readonly<{ path: TPath; useParams: () => Ref<ResolveParams<TPath>> }>;

/**
 * Defines the route of a page in its `<script lang="ts">` block.
 * The path must match the file name. vuefn stops the build if it does not.
 *
 * @param path - The route path that the file name gives, such as `"/posts/$id"`.
 * @param options - TanStack route options, such as `loader` and `head`.
 * @returns The route, with `useLoaderData` and `useParams` typed from `path` and `loader`.
 * @example
 * export const route = defineRoute("/posts/$id", {
 *   loader: ({ params }) => getPost({ data: params.id }),
 * });
 */
export function defineRoute<
  const TPath extends string,
  const T extends Options<ResolveParams<TPath>>,
>(path: TPath, options: T): DefinedRoute<TPath, T> {
  return { path, options } as DefinedRoute<TPath, T>;
}

/**
 * Defines the root route in `pages/__root.vue`. The root route has no path.
 *
 * @param options - TanStack root route options, such as `head`.
 * @returns The root route, with `useLoaderData` typed from `loader`.
 * @example
 * export const route = defineRootRoute({
 *   head: () => ({ meta: [{ title: "My app" }] }),
 * });
 */
export function defineRootRoute<const T extends Options<Record<string, never>>>(
  options: T,
): DefinedRootRoute<T> {
  return { options } as DefinedRootRoute<T>;
}
