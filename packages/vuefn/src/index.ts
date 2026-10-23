import type { ResolveParams } from "@tanstack/vue-router";
import type { Ref } from "vue";

type LoaderData<T> = T extends { loader: (...args: never[]) => infer R } ? Awaited<R> : undefined;

type Options<TParams> = Readonly<{
  loader?: (ctx: { params: TParams; abortController: AbortController }) => unknown;
  [key: string]: unknown;
}>;

export type DefinedRootRoute<T> = Readonly<{
  options: T;
  useLoaderData: () => Ref<LoaderData<T>>;
}>;

export type DefinedRoute<TPath extends string, T> = DefinedRootRoute<T> &
  Readonly<{ path: TPath; useParams: () => Ref<ResolveParams<TPath>> }>;

export function defineRoute<
  const TPath extends string,
  const T extends Options<ResolveParams<TPath>>,
>(path: TPath, options: T): DefinedRoute<TPath, T> {
  return { path, options } as DefinedRoute<TPath, T>;
}

export function defineRootRoute<const T extends Options<Record<never, string>>>(
  options: T,
): DefinedRootRoute<T> {
  return { options } as DefinedRootRoute<T>;
}
