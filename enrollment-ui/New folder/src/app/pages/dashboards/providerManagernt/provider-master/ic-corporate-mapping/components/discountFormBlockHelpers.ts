import type { StylesConfig } from "react-select";
import {
  CHIP_MULTI_SELECT_STYLES,
  CHIP_MULTI_SELECT_STYLES_COMPACT,
} from "./discountFormBlockStyles";

type DiscountCategoryOption = { label: string; value: string };

export type DiscountDetailForm = {
  discountCategories: string[];
  ppnDiscount: string;
  billInclusion: string[];
  billExclusion: string[];
  ipdEnabled: boolean;
  ipdList: string[];
  opdEnabled: boolean;
  opdList: string[];
  additionalDiscountEnabled: boolean;
  additionalDiscountList: string[];
  tatForDiscount: string;
  discountApplicableOn: string;
  discountPercentSingle: string;
};

export const defaultDiscountDetail: DiscountDetailForm = {
  discountCategories: [],
  ppnDiscount: "",
  billInclusion: [],
  billExclusion: [],
  ipdEnabled: false,
  ipdList: [],
  opdEnabled: false,
  opdList: [],
  additionalDiscountEnabled: false,
  additionalDiscountList: [],
  tatForDiscount: "",
  discountApplicableOn: "",
  discountPercentSingle: "",
};

export type DiscountFormLayout = {
  root: string;
  content: string;
  title: string;
  input: string;
  embeddedDd: string;
  billScopeSize: "sm" | "md";
  categoryLabel: string;
  categorySection: string;
  categoryPercentPanel: string;
  categoryPercentGrid: string;
  categorySelectText: string;
  individualFieldsSection: string;
  individualTopGrid: string;
  individualBillGrid: string;
  bulkGrid: string;
  bulkColumn: string;
  applyButton: string;
  chipSelectStyles: StylesConfig<DiscountCategoryOption, true>;
};

function resolveDiscountLayoutRootClass(compact: boolean, embedded: boolean): string {
  if (embedded) return "mt-0";
  if (compact) return "mt-2 rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm";
  return "mt-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm";
}

function resolveDiscountLayoutInputClass(compact: boolean, embedded: boolean): string {
  if (compact && embedded) return "h-7 w-full text-[11px]";
  if (compact) return "h-8 w-full text-xs";
  return "h-8 w-full text-sm";
}

function resolveDiscountLayoutCategoryPercentPanel(compact: boolean, embedded: boolean): string {
  if (embedded) {
    return "mt-1.5 space-y-1.5 rounded-md border border-gray-200 bg-gray-50/50 p-1.5";
  }
  return "mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-2";
}

function resolveDiscountLayoutCategoryPercentGrid(embedded: boolean): string {
  if (embedded) {
    return "grid grid-cols-1 gap-x-2 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-4 sm:justify-items-start";
  }
  return "grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-2 lg:grid-cols-4 sm:justify-items-start";
}

function resolveDiscountLayoutIndividualTopGrid(embedded: boolean): string {
  if (embedded) {
    return "grid grid-cols-1 gap-x-2 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3";
  }
  return "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3";
}

function resolveDiscountLayoutIndividualBillGrid(embedded: boolean): string {
  if (embedded) {
    return "grid grid-cols-1 gap-x-2 gap-y-1.5 lg:grid-cols-2";
  }
  return "grid grid-cols-1 gap-2 lg:grid-cols-2";
}

function resolveDiscountLayoutBulkGrid(embedded: boolean): string {
  if (embedded) {
    return "grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-2";
  }
  return "grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2";
}

export function getDiscountFormLayout(compact: boolean, embedded: boolean): DiscountFormLayout {
  const chipSelectStyles = compact && embedded ? CHIP_MULTI_SELECT_STYLES_COMPACT : CHIP_MULTI_SELECT_STYLES;

  return {
    root: resolveDiscountLayoutRootClass(compact, embedded),
    content: embedded ? "mt-0 space-y-2" : "mt-2 space-y-3",
    title: compact ? "text-xs" : "text-sm",
    input: resolveDiscountLayoutInputClass(compact, embedded),
    embeddedDd: embedded
      ? "[&_.react-select__control]:min-h-[32px] [&_.react-select__control]:text-xs [&_label]:text-[10px]"
      : "",
    billScopeSize: compact && embedded ? "sm" : "md",
    categoryLabel: embedded ? "text-[10px]" : "text-xs",
    categorySection: embedded ? "space-y-1.5" : "space-y-1",
    categoryPercentPanel: resolveDiscountLayoutCategoryPercentPanel(compact, embedded),
    categoryPercentGrid: resolveDiscountLayoutCategoryPercentGrid(embedded),
    categorySelectText: embedded ? "text-xs" : "text-sm",
    individualFieldsSection: embedded ? "space-y-2" : "space-y-3",
    individualTopGrid: resolveDiscountLayoutIndividualTopGrid(embedded),
    individualBillGrid: resolveDiscountLayoutIndividualBillGrid(embedded),
    bulkGrid: resolveDiscountLayoutBulkGrid(embedded),
    bulkColumn: embedded ? "space-y-2" : "space-y-3",
    applyButton: compact ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
    chipSelectStyles,
  };
}
