/**
 * Turns gateway/proxy HTML error pages (APISIX/nginx/openresty) into short text.
 */
export function isHtmlErrorBody(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype html") ||
    trimmed.startsWith("<html") ||
    /<title[^>]*>[\s\S]*?<\/title>/i.test(trimmed)
  );
}

export function extractHtmlErrorTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim();
  if (title) return title;

  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  const h1 = h1Match?.[1]?.trim();
  if (h1) return h1;

  return null;
}

/** If `message` is an HTML error page, return the title/h1 (e.g. "502 Bad Gateway"). */
export function sanitizeApiErrorMessage(
  message: string | null | undefined,
  fallback = "Request failed",
): string {
  if (message == null) return fallback;
  const trimmed = message.trim();
  if (!trimmed) return fallback;
  if (!isHtmlErrorBody(trimmed)) return trimmed;
  return extractHtmlErrorTitle(trimmed) ?? fallback;
}
