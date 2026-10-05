let fallbackRandomIdCounter = 0;

function secureAlphanumeric(length: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => (byte % 36).toString(36)).join("");
  }

  fallbackRandomIdCounter += 1;
  return fallbackRandomIdCounter.toString(36).padStart(length, "0").slice(-length);
}

/**
 * Generates a random identifier string.
 *
 * @returns A random identifier string in the format 'tl-<alphanumeric>-<timestamp>'.
 */
export function randomId(): string {
  const randomString = secureAlphanumeric(9);
  const timestampString = Date.now().toString(36).slice(-4);

  return `tl-${randomString}-${timestampString}`;
}
