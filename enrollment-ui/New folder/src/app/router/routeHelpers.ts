import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { isMockAuthEnabled } from '@/utils/mockAuth';
import { moduleRoutes, dashboardRoutes } from '@/app/workspace/data';

export function lazyPageRoute<TModule extends { default: ComponentType<any> }>(
  path: string,
  importPage: () => Promise<TModule>,
  permission?: string,
): RouteObject {
  return {
    path,
    ...(permission ? { handle: { permission } } : {}),
    lazy: async () => {
      // Only the disconnected preview uses the local sample-data workspaces.
      // Live routes retain their existing API-backed workflow components.
      if (isMockAuthEnabled()) {
        if (moduleRoutes[path]) return { Component: (await import('@/app/workspace/DirectoryPage')).default };
        if (dashboardRoutes.includes(path)) return { Component: (await import('@/app/workspace/DashboardPage')).default };
        if (path === 'provider-masters/empanel') return { Component: (await import('@/app/workspace/EmpanelmentPage')).default };
      }
      return { Component: (await importPage()).default };
    },
  };
}
