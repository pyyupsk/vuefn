import type { Ref } from "vue";

type LoaderData<T> = T extends { loader: (...args: never[]) => infer R } ? Awaited<R> : undefined;

export type DefinedRoute<T> = Readonly<{
  options: T;
  useLoaderData: () => Ref<LoaderData<T>>;
}>;

export function defineRoute<const T extends object>(options: T): DefinedRoute<T> {
  return { options } as DefinedRoute<T>;
}
