type PercentRecord = Record<string, string>;

type SelectOption = { label: string; value: string };

export function prunePercentRecord(prev: PercentRecord, selectedKeys: string[]): PercentRecord {
  const next = { ...prev };
  for (const key of Object.keys(next)) {
    if (!selectedKeys.includes(key)) {
      delete next[key];
    }
  }
  return next;
}

export function syncPercentRecordWithList(
  prev: PercentRecord,
  selectedKeys: string[],
): PercentRecord {
  const next = { ...prev };
  let changed = false;

  for (const key of Object.keys(next)) {
    if (!selectedKeys.includes(key)) {
      delete next[key];
      changed = true;
    }
  }

  return changed ? next : prev;
}

export function getSelectOptionLabel(options: SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function getDiscountOpdLayout(
  compactLabels: boolean,
  singleRow = false,
  includeNotCovered = true,
) {
  return {
    labelText: compactLabels ? "text-[10px]" : "text-xs",
    card: singleRow
      ? "min-w-0 rounded-md border border-gray-200 bg-white p-2"
      : compactLabels
        ? "min-w-0 rounded-md border border-gray-200 bg-white p-1.5 shadow-sm"
        : "min-w-0 rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm sm:p-3",
    percentPanel: compactLabels
      ? "mt-1 rounded border border-gray-200 bg-gray-50/90 p-1"
      : "mt-3 rounded-lg border border-gray-200 bg-gray-50/90 p-2.5",
    percentInputClass: compactLabels ? "!text-[10px]" : "",
    rowGrid: singleRow
      ? includeNotCovered
        ? "grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-2"
        : "grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2"
      : includeNotCovered
        ? "grid grid-cols-1 gap-1.5 md:grid-cols-3 md:gap-2"
        : "grid grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2",
  };
}

export type { PercentRecord, SelectOption };
