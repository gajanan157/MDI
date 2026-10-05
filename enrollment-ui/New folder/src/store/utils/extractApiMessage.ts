import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";

function sanitizeOptionalMessage(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return sanitizeApiErrorMessage(trimmed);
}

/** Reads `message` or `error` from API error payloads. */
export function extractApiMessage(payload: unknown): string | undefined {
  if (payload == null) return undefined;
  if (typeof payload === "string") {
    return sanitizeOptionalMessage(payload);
  }
  if (typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return sanitizeOptionalMessage(record.message);
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return sanitizeOptionalMessage(record.error);
  }
  return undefined;
}
