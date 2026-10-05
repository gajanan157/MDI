import type { ComponentType } from "react";
import type { RouteObject } from "react-router";

export function lazyPageRoute<TModule extends { default: ComponentType<any> }>(
  path: string,
  importPage: () => Promise<TModule>,
  permission?: string,
): RouteObject {
  return {
    path,
    ...(permission ? { handle: { permission } } : {}),
    lazy: async () => ({
      Component: (await importPage()).default,
    }),
  };
}
