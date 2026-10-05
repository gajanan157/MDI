const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function looksLikeUuid(value: string): boolean {
  return UUID_PATTERN.test(String(value ?? "").trim());
}

/** Prefer a human name; never return a raw UUID. */
export function humanDiscountLabel(
  name?: string | null,
  fallbackId?: string | null,
): string {
  const label = String(name ?? "").trim();
  if (label && !looksLikeUuid(label)) return label;
  const id = String(fallbackId ?? "").trim();
  if (id && !looksLikeUuid(id)) return id;
  return "";
}

/** Saved names first, then master options, skipping duplicate labels. */
export function mergeNamedDiscountOptions(
  saved: { id: string; name: string }[],
  master: { value: string; label: string }[],
): { value: string; label: string }[] {
  const map = new Map<string, string>();
  saved.forEach((item) => {
    const label = humanDiscountLabel(item.name, "");
    if (item.id && label) map.set(item.id, label);
  });
  const usedLabels = new Set(
    Array.from(map.values()).map((label) => label.trim().toLowerCase()),
  );
  master.forEach((option) => {
    if (!option.value) return;
    const label = humanDiscountLabel(option.label, option.value);
    if (!label) return;
    if (map.has(option.value)) {
      map.set(option.value, label);
      return;
    }
    if (usedLabels.has(label.trim().toLowerCase())) return;
    map.set(option.value, label);
    usedLabels.add(label.trim().toLowerCase());
  });
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
}
