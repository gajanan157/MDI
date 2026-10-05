type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
const normalizeForSearch = (value: string) =>
  value.replace(/_/g, " ").toLowerCase().trim();

export const searchJsonPaths = (
  data: JSONValue,
  search: string,
  currentPath = "",
): string[] => {
  if (!search) return [];

  const lower = search.toLowerCase();
  const matches: string[] = [];

  // Primitive
  if (
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean"
  ) {
    if (data.toString().toLowerCase().includes(lower)) {
      matches.push(currentPath);
    }
    return matches;
  }

  // Array
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      matches.push(
        ...searchJsonPaths(item, search, `${currentPath}[${index}]`),
      );
    });
    return matches;
  }

  // Object
  if (typeof data === "object" && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      const normalizedKey = normalizeForSearch(key);
      const normalizedSearch = normalizeForSearch(search);

      if (normalizedKey.includes(normalizedSearch)) {
        matches.push(nextPath);
      }

      matches.push(...searchJsonPaths(value, search, nextPath));
    });
  }

  return matches;
};

export const getAccordionPathsToOpen = (path: string): string[] => {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");

  let current = "";
  return parts.map((part) => {
    current = current ? `${current}.${part}` : part;
    return current;
  });
};
