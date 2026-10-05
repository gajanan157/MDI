import { jwtDecode, JwtPayload } from "jwt-decode";


export interface KeycloakJwtPayload extends JwtPayload {
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: { roles: string[] };
  };
  name?: string;
  preferred_username?: string;
  groups?: any;
}
export function getUserPermissions(token?: string): Set<string> {
  if (!token) return new Set();

  const decoded = jwtDecode<KeycloakJwtPayload>(token);

  const clientRoles = decoded?.resource_access?.["react-client"]?.roles ?? [];
  const realmRoles = decoded?.realm_access?.roles ?? [];

  if (clientRoles.includes("super.admin") ||realmRoles.includes("super.admin")) {
    return new Set<string>(["*"]);
  }

  const adminRoles = ["admin", "provider.admin"];

  return new Set<string>([
    ...clientRoles,
    ...realmRoles.filter((role) => adminRoles.includes(role)),
  ]);
}
export function getUserRoles(token?: string): Set<string> {
  if (!token) return new Set();

  const decoded = jwtDecode<KeycloakJwtPayload>(token);  

  const clientRoles = decoded?.resource_access?.["react-client"]?.roles ?? [];
  return new Set(clientRoles as any[]);
}
