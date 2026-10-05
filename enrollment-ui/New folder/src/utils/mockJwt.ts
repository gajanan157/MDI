// src/utils/mockJwt.ts
const MOCK_TOKEN_KEY = "mock_auth_token";

export function createMockToken(userId: string) {
  // create a simple base64 pseudo-token: btoa(JSON.stringify({ userId, ts: Date.now() }))
  const payload = { userId, ts: Date.now() };
  return btoa(JSON.stringify(payload));
}

export function parseMockToken(token: string | null) {
  if (!token) return null;
  try {
    const decoded = atob(token);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function setMockSession(token: string | null) {
  if (token) {
    localStorage.setItem(MOCK_TOKEN_KEY, token);
    // also mirror to the shared key your provider expects if necessary:
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem(MOCK_TOKEN_KEY);
    localStorage.removeItem("authToken");
  }
}

export function getMockSession() {
  return localStorage.getItem(MOCK_TOKEN_KEY) || localStorage.getItem("authToken");
}

export function isMockTokenValid(token: string | null) {
  if (!token) return false;
  const payload = parseMockToken(token);
  // simple expiry: 7 days
  if (!payload || !payload.ts) return false;
  const ageMs = Date.now() - payload.ts;
  return ageMs < 7 * 24 * 60 * 60 * 1000;
}
