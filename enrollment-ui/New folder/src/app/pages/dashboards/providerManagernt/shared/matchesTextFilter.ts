/** Case-insensitive substring match; empty query matches everything. */
export function matchesTextFilter(value: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return value.toLowerCase().includes(q);
}
