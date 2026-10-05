// src/hooks/useUserRole.ts
import { useMemo } from "react";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { jwtDecode } from "jwt-decode";
import { KeycloakJwtPayload } from "@/app/auth/permissions";

export type UserRole = "maker1" | "maker2" | "checker" | "superadmin" | null;

/**
 * Role priority when user has multiple roles (highest first):
 * 1. Super Admin – if user has super.admin (alone or with checker/maker1/maker2) → treat as Super Admin
 * 2. Checker – if user has checker + maker1 and/or maker2 (but no super.admin) → treat as Checker
 * 3. Maker 1 – if user has only maker-1.write (or maker1 before maker2 in order)
 * 4. Maker 2 – if user has only maker-2.write
 */
const ROLE_PRIORITY_ORDER: Array<{ key: string; role: UserRole }> = [
  { key: "super.admin", role: "superadmin" },
  { key: "checker.write", role: "checker" },
  { key: "maker-1.write", role: "maker1" },
  { key: "maker-2.write", role: "maker2" },
];

/**
 * Hook to get the current user's effective role from Keycloak token.
 * When user has multiple roles, returns the highest-priority role:
 * Super Admin > Checker > Maker 1 > Maker 2.
 */
export function useUserRole(): UserRole {
  const { token } = useKeycloak();

  return useMemo(() => {
    let userRoles: string[] = [];

    if (token) {
      try {
        const decoded = jwtDecode<KeycloakJwtPayload>(token);
        userRoles = decoded?.resource_access?.["react-client"]?.roles ?? [];
      } catch {
        userRoles = [];
      }
    }

    const rolesLower = userRoles.map((r) => r.toLowerCase());

    // Apply priority: first matching role wins (superadmin > checker > maker1 > maker2)
    for (const { key, role } of ROLE_PRIORITY_ORDER) {
      if (rolesLower.includes(key)) {
        return role;
      }
    }

    // Default when no known role found (e.g. development)
    return "checker";
  }, [token]);
}

/**
 * Check if user has maker role (maker1 or maker2)
 */
export function useIsMaker(): boolean {
  const role = useUserRole();
  return role === "maker1" || role === "maker2";
}

/**
 * Check if user has maker1 role
 */
export function useIsMaker1(): boolean {
  const role = useUserRole();
  return role === "maker1";
}

/**
 * Check if user has maker2 role
 */
export function useIsMaker2(): boolean {
  const role = useUserRole();
  return role === "maker2";
}

/**
 * Check if user has checker role
 */
export function useIsChecker(): boolean {
  const role = useUserRole();
  return role === "checker" || role === "superadmin";
}

/**
 * Display label for a role (e.g. for badges and UI)
 */
export function getRoleDisplayLabel(role: UserRole): string {
  if (!role) return "User";
  switch (role) {
    case "maker1":
      return "Maker 1";
    case "maker2":
      return "Maker 2";
    case "checker":
      return "Checker";
    case "superadmin":
      return "Super Admin";
    default:
      return role;
  }
}
