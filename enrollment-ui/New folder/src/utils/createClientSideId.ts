let fallbackClientSideIdCounter = 0;

function createUuidFromRandomBytes(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Creates a unique client-side id using a cryptographically secure RNG when available. */
export function createClientSideId(prefix?: string): string {
  let token: string;
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      token = crypto.randomUUID();
    } else if (typeof crypto.getRandomValues === "function") {
      token = createUuidFromRandomBytes();
    } else {
      fallbackClientSideIdCounter += 1;
      token = `${Date.now()}-${fallbackClientSideIdCounter}`;
    }
  } else {
    fallbackClientSideIdCounter += 1;
    token = `${Date.now()}-${fallbackClientSideIdCounter}`;
  }

  return prefix ? `${prefix}-${token}` : token;
}
