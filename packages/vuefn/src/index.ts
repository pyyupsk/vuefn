import { createRootRoute, createRootRouteWithContext } from '@tanstack/vue-router';
import type {
  AnyContext,
  FileBaseRouteOptions,
  FileRoutesByPath,
  Register,
  ResolveParams,
  Route,
  UpdatableRouteOptions,
} from '@tanstack/vue-router';

type Info<TFilePath extends keyof FileRoutesByPath> = FileRoutesByPath[TFilePath];

/**
 * Defines the route of a page in its `<script lang="ts">` block.
 * The path must match the file name. vuefn stops the build if it does not.
 * It takes the same options as TanStack `createFileRoute(path)(options)` and returns the same route.
 *
 * @param path - The route path that the file name gives, such as `'/posts/$id'`.
 * @param options - TanStack route options, such as `loader`, `validateSearch`, `beforeLoad` and `head`.
 * @returns The TanStack route, with `useLoaderData`, `useParams`, `useSearch` and `Link` typed for it.
 * @example
 * export const route = defineRoute('/posts/$id', {
 *   loader: ({ params }) => getPost({ data: params.id }),
 * });
 */
export function defineRoute<
  TFilePath extends keyof FileRoutesByPath,
  TSearchValidator = undefined,
  TParams = ResolveParams<Info<TFilePath>['path']>,
  TRouteContextFn = AnyContext,
  TBeforeLoadFn = AnyContext,
  TLoaderDeps extends Record<string, unknown> = {},
  TLoaderFn = undefined,
  TSSR = unknown,
  TMiddlewares = unknown,
  THandlers = undefined,
>(
  path: TFilePath,
  options?: FileBaseRouteOptions<
    Register,
    Info<TFilePath>['parentRoute'],
    Info<TFilePath>['id'],
    Info<TFilePath>['path'],
    TSearchValidator,
    TParams,
    TLoaderDeps,
    TLoaderFn,
    AnyContext,
    TRouteContextFn,
    TBeforeLoadFn,
    AnyContext,
    TSSR,
    TMiddlewares,
    THandlers
  > &
    UpdatableRouteOptions<
      Info<TFilePath>['parentRoute'],
      Info<TFilePath>['id'],
      Info<TFilePath>['fullPath'],
      TParams,
      TSearchValidator,
      TLoaderFn,
      TLoaderDeps,
      AnyContext,
      TRouteContextFn,
      TBeforeLoadFn
    >,
): Route<
  Register,
  Info<TFilePath>['parentRoute'],
  Info<TFilePath>['path'],
  Info<TFilePath>['fullPath'],
  TFilePath,
  Info<TFilePath>['id'],
  TSearchValidator,
  TParams,
  AnyContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  unknown,
  unknown,
  TSSR,
  TMiddlewares,
  THandlers
>;
export function defineRoute(path: string): never {
  throw new Error(
    `vuefn: defineRoute('${path}') only works in src/pages/*.vue with the vuefn() plugin`,
  );
}

/**
 * Defines the root route in `pages/__root.vue`. It takes the same options as TanStack `createRootRoute`.
 *
 * @example
 * export const route = defineRootRoute({
 *   head: () => ({ meta: [{ title: 'My app' }] }),
 * });
 */
export const defineRootRoute: typeof createRootRoute = createRootRoute;

/**
 * Defines the root route with a typed router context, like TanStack `createRootRouteWithContext`.
 * Pass the same context to `createRouter({ context })` in `src/router.ts`.
 *
 * @example
 * export const route = defineRootRouteWithContext<{ user: string }>()({
 *   beforeLoad: ({ context }) => ({ greeting: `Hi ${context.user}` }),
 * });
 */
export const defineRootRouteWithContext: typeof createRootRouteWithContext =
  createRootRouteWithContext;
