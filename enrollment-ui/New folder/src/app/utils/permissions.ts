import { RouteObject } from "react-router";

export const getDefaultRouteByRoles = (
  routes: RouteObject[],
  userRoles: string[]
): string | null => {
  if (!routes || routes.length === 0) return null;

  for (const route of routes) {
    const roles = (route.handle as any)?.roles;

    if (roles && roles.some((r: string) => userRoles.includes(r))) {
      return route.path ?? null;
    }

    if (route.children) {
      const childPath = getDefaultRouteByRoles(route.children, userRoles);
      if (childPath) return childPath;
    }
  }

  return null; // nothing matched
};
