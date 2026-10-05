const INTERNAL_SEARCH_KEYS = new Set([
  "_comments",
  "_sectionComment",
  "_tableComment",
  "_value",
]);

function formatSearchKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function addTopLevelSection(
  matchingSections: Set<string>,
  path: string[],
  key: string,
): void {
  if (path.length > 0) {
    matchingSections.add(path[0]);
  } else {
    matchingSections.add(key);
  }
}

function valueMatchesSearch(value: unknown, term: string): boolean {
  if (value === null || value === undefined) return false;
  return String(value).toLowerCase().includes(term);
}

function extractSearchableValue(value: Record<string, unknown>): string {
  if (value._value !== undefined) {
    return String(value._value).toLowerCase();
  }
  return JSON.stringify(value).toLowerCase();
}

function searchArrayValue(
  arr: unknown[],
  term: string,
  path: string[],
  key: string,
  matchingSections: Set<string>,
  searchInObject: (obj: unknown, currentPath?: string[]) => void,
  currentPath: string[],
): void {
  arr.forEach((item, index) => {
    if (typeof item === "object" && item !== null) {
      const record = item as Record<string, unknown>;
      if (record._value !== undefined && valueMatchesSearch(record._value, term)) {
        addTopLevelSection(matchingSections, path, key);
      }
      if (record._comment !== undefined && valueMatchesSearch(record._comment, term)) {
        addTopLevelSection(matchingSections, path, key);
      }
      searchInObject(item, [...currentPath, String(index)]);
      return;
    }
    if (valueMatchesSearch(item, term)) {
      addTopLevelSection(matchingSections, path, key);
    }
  });
}

function searchObjectValue(
  value: Record<string, unknown>,
  term: string,
  path: string[],
  key: string,
  currentPath: string[],
  matchingSections: Set<string>,
  searchInObject: (obj: unknown, currentPath?: string[]) => void,
): void {
  if (value._value !== undefined) {
    if (valueMatchesSearch(value._value, term)) {
      addTopLevelSection(matchingSections, path, key);
    }
    return;
  }

  if (value._comment !== undefined) {
    if (valueMatchesSearch(value._comment, term)) {
      addTopLevelSection(matchingSections, path, key);
    }
    searchInObject(value, currentPath);
    return;
  }

  searchInObject(value, currentPath);
}

function searchInitialDataSection(
  sectionKey: string,
  sectionValue: unknown,
  term: string,
  matchingSections: Set<string>,
): void {
  const sectionName = formatSearchKey(sectionKey).toLowerCase();
  if (sectionName.includes(term)) {
    matchingSections.add(sectionKey);
  }

  if (sectionValue === null || sectionValue === undefined) return;

  if (typeof sectionValue === "object" && !Array.isArray(sectionValue)) {
    Object.entries(sectionValue as Record<string, unknown>).forEach(
      ([fieldKey, fieldValue]) => {
        if (INTERNAL_SEARCH_KEYS.has(fieldKey)) return;

        let searchableValue = "";
        if (typeof fieldValue === "object" && fieldValue !== null && !Array.isArray(fieldValue)) {
          searchableValue = extractSearchableValue(fieldValue as Record<string, unknown>);
        } else {
          searchableValue = String(fieldValue).toLowerCase();
        }

        if (searchableValue.includes(term)) {
          matchingSections.add(sectionKey);
        }
      },
    );
    return;
  }

  if (Array.isArray(sectionValue)) {
    sectionValue.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        Object.values(item as Record<string, unknown>).forEach((val) => {
          let valStr = "";
          if (typeof val === "object" && val !== null && !Array.isArray(val) && "_value" in val) {
            valStr = String((val as { _value: unknown })._value).toLowerCase();
          } else {
            valStr = String(val).toLowerCase();
          }
          if (valStr.includes(term)) {
            matchingSections.add(sectionKey);
          }
        });
        return;
      }
      if (valueMatchesSearch(item, term)) {
        matchingSections.add(sectionKey);
      }
    });
    return;
  }

  if (valueMatchesSearch(sectionValue, term)) {
    matchingSections.add(sectionKey);
  }
}

export function findMatchingSections(
  formState: Record<string, unknown>,
  initialData: Record<string, unknown> | undefined,
  searchTerm: string,
): Set<string> {
  const term = searchTerm.toLowerCase().trim();
  const matchingSections = new Set<string>();
  if (!term) return matchingSections;

  const searchInObject = (obj: unknown, path: string[] = []): void => {
    if (!obj || typeof obj !== "object") return;

    Object.keys(obj as Record<string, unknown>).forEach((key) => {
      if (INTERNAL_SEARCH_KEYS.has(key)) return;

      const value = (obj as Record<string, unknown>)[key];
      const currentPath = [...path, key];

      if (path.length === 0) {
        const sectionName = formatSearchKey(key).toLowerCase();
        if (sectionName.includes(term)) {
          matchingSections.add(key);
        }
      }

      if (value === null || value === undefined) return;

      if (Array.isArray(value)) {
        searchArrayValue(value, term, path, key, matchingSections, searchInObject, currentPath);
        return;
      }

      if (typeof value === "object") {
        searchObjectValue(
          value as Record<string, unknown>,
          term,
          path,
          key,
          currentPath,
          matchingSections,
          searchInObject,
        );
        return;
      }

      if (valueMatchesSearch(value, term)) {
        addTopLevelSection(matchingSections, path, key);
      }
    });
  };

  const dataToSearch = { ...formState };
  delete dataToSearch._comments;
  searchInObject(dataToSearch);

  if (initialData) {
    const initialDataToSearch = { ...initialData };
    delete initialDataToSearch._comments;
    Object.keys(initialDataToSearch).forEach((key) => {
      if (key === "_comments") return;
      searchInitialDataSection(key, initialDataToSearch[key], term, matchingSections);
    });
  }

  return matchingSections;
}

export function scrollToFirstMatchingSection(
  sectionId: string,
  formatKeyFn: (key: string) => string,
): void {
  let sectionElement = document.querySelector(
    `[data-accordion-section="${sectionId}"]`,
  );

  if (!sectionElement) {
    const buttonId = document.querySelector(`[id*="${sectionId}"]`);
    if (buttonId) {
      sectionElement = buttonId.closest("[data-accordion-section]") || buttonId;
    }
  }

  if (!sectionElement) {
    sectionElement = document.querySelector(`[value="${sectionId}"]`);
  }

  if (!sectionElement) {
    const sectionName = formatKeyFn(sectionId);
    document.querySelectorAll("[data-accordion-control]").forEach((header) => {
      const text = header.textContent || "";
      if (text.toLowerCase().includes(sectionName.toLowerCase())) {
        sectionElement =
          header.closest("[data-accordion-section]") || header.parentElement;
      }
    });
  }

  if (sectionElement) {
    sectionElement.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const sectionName = formatKeyFn(sectionId);
  for (const el of document.querySelectorAll("*")) {
    if (el.textContent?.toLowerCase().includes(sectionName.toLowerCase())) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      break;
    }
  }
}
