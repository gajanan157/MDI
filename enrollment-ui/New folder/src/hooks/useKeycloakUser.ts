// src/hooks/useKeycloakUser.ts
import { useMemo } from "react";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { jwtDecode } from "jwt-decode";
import { KeycloakJwtPayload } from "@/app/auth/permissions";

export interface KeycloakUserInfo {
  userId: string | null;
  username: string | null;
  name: string | null;
  email: string | null;
  roles: string[];
}

/**
 * Hook to get user information from Keycloak token
 * Returns userId (sub), username, name, email, and roles from realm_access
 */
export function useKeycloakUser(): KeycloakUserInfo {
  const { token } = useKeycloak();

  return useMemo(() => {
    // Normal mode - decode Keycloak token
    if (token) {
      try {
        const decoded = jwtDecode<KeycloakJwtPayload>(token);
        return {
          userId: decoded?.sub || null,
          username: decoded?.preferred_username || null,
          name: decoded?.name || null,
          email: decoded?.email || null,
          roles: decoded?.realm_access?.roles || [],
        };
      } catch (error) {
        console.error("Failed to decode Keycloak token:", error);
        return {
          userId: null,
          username: null,
          name: null,
          email: null,
          roles: [],
        };
      }
    }

    // No token available
    return {
      userId: null,
      username: null,
      name: null,
      email: null,
      roles: [],
    };
  }, [token]);
}
