/** Normalize file names for duplicate comparison (case-insensitive, trimmed). */
export function normalizeFileName(name: string | null | undefined): string {
  return String(name ?? "").trim().toLowerCase();
}

/** True when both names are non-empty and match (ignoring case). */
export function isDuplicateFileName(
  first: string | null | undefined,
  second: string | null | undefined,
): boolean {
  const a = normalizeFileName(first);
  const b = normalizeFileName(second);
  return Boolean(a && b && a === b);
}

/** File name from a FileList (first entry), or empty string. */
export function fileListFirstName(
  files: FileList | File[] | null | undefined,
): string {
  if (!files || files.length === 0) return "";
  const first = files[0];
  return first?.name ?? "";
}
