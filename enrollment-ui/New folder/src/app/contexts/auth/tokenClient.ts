import { toast } from "sonner";

// src/auth/tokenClient.ts
export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

// DEV: use proxied path so the browser calls same-origin and Vite proxies to Keycloak.
const TOKEN_URL = "/api/token";

// DEV ONLY: client_secret is visible in bundle — remove for production.
// If you implement an Express proxy or server-side exchange, remove these from frontend.
const CLIENT_ID = "react-password-client";
const CLIENT_SECRET = "nVzM5Qh9Dfva0IYxYo2Q38JN4FMXy0Ct";

async function postForm(url: string, params: URLSearchParams) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  // parse text then JSON to capture any non-json body gracefully
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { error: "invalid_json", error_description: text || "" };
  }

  if (!res.ok) {
    const msg =
      (json && (json.error_description || json.error)) ||
      `${res.status} ${res.statusText}`;
    toast.error(msg, {
      position: "top-right",
      duration: 5000,
    });
    throw new Error(msg);
  }
  toast.success("Login successful!", {
    position: "top-right",
    duration: 5000,
  });
  return json as TokenResponse;
}

/**
 * Exchange username/password for access & refresh tokens (Resource Owner Password Credentials).
 * DEV only.
 */
export async function fetchTokenByPassword(
  username: string,
  password: string,
): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("username", username);
  params.append("password", password);

  return postForm(TOKEN_URL, params);
}

/**
 * Refresh tokens using refresh_token grant.
 */
export async function refreshToken(
  refresh_token: string,
): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("refresh_token", refresh_token);

  return postForm(TOKEN_URL, params);
}
