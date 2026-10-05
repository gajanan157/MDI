/**
 * Local username/password login against master-service (/api/v1/auth), used when
 * VITE_ENABLE_KEYCLOAK="false". The token has the same claims layout as a Keycloak token.
 *
 * Plain fetch is used on purpose: the shared axios helpers fall back to mock data when the
 * backend is unreachable, which must never count as a successful login.
 */
import { jwtDecode, type JwtPayload } from "jwt-decode";

const TOKEN_KEY = "mdi_local_auth_token";
const AUTH_BASE = "/api/v1/auth";

export interface LocalUserInfo {
  sub: string;
  preferred_username: string;
  name: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  groupName?: string | null;
  roles?: string[];
}

interface LocalTokenClaims extends JwtPayload {
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  active_role?: string;
}

export class LocalAuthError extends Error {
  constructor(
    message: string,
    /** True when the server rejected the session (as opposed to being unreachable). */
    readonly unauthorized = false,
  ) {
    super(message);
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** True when another tab logged in or out (fires only in other tabs). */
export function isTokenStorageEvent(event: StorageEvent) {
  return event.key === TOKEN_KEY || event.key === null;
}

export function isTokenExpired(token: string, skewSeconds = 10): boolean {
  try {
    const { exp } = jwtDecode<LocalTokenClaims>(token);
    return !exp || exp * 1000 <= Date.now() + skewSeconds * 1000;
  } catch {
    return true;
  }
}

/** The role the server last signed into the token. Editing the stored token breaks its signature. */
export function activeRoleFromToken(token: string): string | null {
  try {
    return jwtDecode<LocalTokenClaims>(token).active_role ?? null;
  } catch {
    return null;
  }
}

/** Asks the server to switch role; it checks the user really holds it and returns a newly signed token. */
export async function switchRole(token: string, role: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${AUTH_BASE}/switch-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
  } catch {
    throw new LocalAuthError("Cannot reach the login service");
  }
  if (!response.ok) {
    throw new LocalAuthError(await readMessage(response, "Could not switch role"), response.status === 401);
  }
  const body = await response.json();
  const next: string | undefined = body?.data?.accessToken;
  if (!next) throw new LocalAuthError("Switch role response did not include a token");
  return next;
}

/** User info from the token itself, used when the server cannot be reached. */
export function userInfoFromToken(token: string): LocalUserInfo | null {
  try {
    const claims = jwtDecode<LocalTokenClaims>(token);
    return {
      sub: claims.sub ?? "",
      preferred_username: claims.preferred_username ?? claims.sub ?? "",
      name: claims.name ?? claims.preferred_username ?? "",
      given_name: claims.given_name,
      family_name: claims.family_name,
      email: claims.email,
    };
  } catch {
    return null;
  }
}

async function readMessage(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body?.message || body?.error || fallback;
  } catch {
    return fallback;
  }
}

export async function loginWithPassword(
  username: string,
  password: string,
): Promise<{ token: string; user: LocalUserInfo }> {
  let response: Response;
  try {
    response = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new LocalAuthError("Cannot reach the login service. Is master-service running?");
  }
  if (!response.ok) {
    throw new LocalAuthError(
      await readMessage(response, "Login failed"),
      response.status === 401,
    );
  }
  const body = await response.json();
  const token: string | undefined = body?.data?.accessToken;
  if (!token) throw new LocalAuthError("Login response did not include a token");
  return { token, user: body.data.user };
}

/** Validates the token with the server. Throws LocalAuthError (unauthorized=true when rejected). */
export async function fetchCurrentUser(token: string): Promise<LocalUserInfo> {
  let response: Response;
  try {
    response = await fetch(`${AUTH_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new LocalAuthError("Cannot reach the login service");
  }
  if (!response.ok) {
    throw new LocalAuthError(
      await readMessage(response, "Session expired"),
      response.status === 401,
    );
  }
  const body = await response.json();
  return body.data as LocalUserInfo;
}

/** Best effort: tokens are stateless, so logout succeeds even if this call fails. */
export function notifyLogout(token: string | null) {
  fetch(`${AUTH_BASE}/logout`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    keepalive: true,
  }).catch(() => {
    /* ignore */
  });
}
