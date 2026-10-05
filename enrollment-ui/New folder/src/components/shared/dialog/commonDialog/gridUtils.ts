import type { ConfigFormDialogMaxColumns } from "./fieldTypes";

/** Tailwind grid classes for the form body (responsive). */
export function getGridClass(maxColumns: ConfigFormDialogMaxColumns): string {
  switch (maxColumns) {
    case 1:
      return "grid grid-cols-1 gap-4";
    case 2:
      return "grid grid-cols-1 gap-2 sm:grid-cols-2";
    case 3:
      return "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3";
    case 4:
      return "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    default:
      return "grid grid-cols-1 gap-2 sm:grid-cols-2";
  }
}

export function getColSpanClass(
  span: 1 | 2 | 3 | 4,
  maxColumns: ConfigFormDialogMaxColumns,
): string {
  const s = Math.min(span, maxColumns) as 1 | 2 | 3 | 4;

  if (maxColumns === 1) {
    return "col-span-1 min-w-0";
  }

  if (maxColumns === 2) {
    if (s === 1) return "col-span-1 min-w-0";
    return "sm:col-span-2 min-w-0";
  }

  if (maxColumns === 3) {
    if (s === 1) return "col-span-1 min-w-0";
    if (s === 2) return "sm:col-span-2 lg:col-span-2 min-w-0";
    return "sm:col-span-2 lg:col-span-3 min-w-0";
  }

  // maxColumns === 4
  if (s === 1) return "col-span-1 min-w-0";
  if (s === 2) return "sm:col-span-2 xl:col-span-2 min-w-0";
  if (s === 3) return "sm:col-span-2 lg:col-span-3 xl:col-span-3 min-w-0";
  return "sm:col-span-2 xl:col-span-4 min-w-0";
}
