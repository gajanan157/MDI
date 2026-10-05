import type { DiscountFormValues } from "../types/discountTypes";
import { resolveDiscountTypeTone } from "./discountTypeStyles";

/** GET `/v1/provider/{id}/agreement` filters for the Discount agreement-name dropdown. */
export const DISCOUNT_AGREEMENT_LIST_FILTERS = {
  providerAgreementStatus: "ACTIVE",
  recordStatus: "ACTIVE",
  download: true,
} as const;

/** GET `/v1/provider/soc` filters for the Package discount SOC dropdown. */
export const DISCOUNT_SOC_LIST_FILTERS = {
  isActive: true,
  download: true,
} as const;

export const DISCOUNT_FORM_DEFAULTS: DiscountFormValues = {
  agreementId: "",
  agreementName: "",
  agreementType: "",
  socId: "",
  insurerAll: true,
  insurerIds: [],
  corporateInsurerIds: [],
  corporateIdsByInsurer: {},
  corporateAll: true,
  discountTypes: [],
  bulkDiscountByType: {},
  ppnDiscount: "",
  inclusionByType: {},
  exclusionByType: {},
  ipdEnabled: false,
  ipdList: [],
  opdEnabled: false,
  opdList: [],
  additionalDiscountEnabled: false,
  additionalDiscountList: [],
  effectiveFrom: "",
  effectiveTo: "",
  remarks: "",
  supportingDocumentName: "",
  supportingFileMetadataId: "",
};

export const DISCOUNT_FIELD_LABEL_CLASS =
  "input-label mb-0.5 block font-normal leading-4 text-black";

export const DISCOUNT_SECTION_BODY_CLASS = "space-y-1.5 bg-white px-3 py-1.5";

export const DISCOUNT_PAGE_CLASS = "space-y-1.5";

export const DISCOUNT_COMPACT_SUBSECTION_CLASS = "space-y-1";

/** Shared control height for discount form rows. */
export const DISCOUNT_FIELD_CONTROL_CLASS = "h-8 w-full text-xs";

/** Collapse default Input min-height so row fields align with DropdownSelect. */
export const DISCOUNT_COMPACT_INPUT_CLASSNAMES = {
  root: "!min-h-0 h-auto w-full",
  label: "sr-only sm:sr-only",
  labelText: "sr-only sm:sr-only",
  wrapper: "w-full",
} as const;

/** Compact label row for Agreement & scope top row. */
export const DISCOUNT_SCOPE_FIELD_LABEL_CLASS =
  "mb-0.5 flex min-h-4 items-center text-[10px] font-medium leading-4 text-gray-700";

/** Fixed control slot height for Agreement & scope top row. */
export const DISCOUNT_SCOPE_CONTROL_SLOT_CLASS =
  "flex h-8 w-full min-w-0 items-center [&>*]:min-w-0 [&>*]:w-full";

/** Agreement & scope row: agreement name, type, IPD, OPD. */
export const DISCOUNT_SCOPE_TOP_ROW_GRID_CLASS =
  "grid grid-cols-1 items-end gap-x-2 gap-y-1 sm:grid-cols-2 lg:grid-cols-4";

export const DISCOUNT_SCOPE_DROPDOWN_FORM_CLASS = String.raw`min-h-0 w-full [&_.dropdown-label]:!mb-0.5 [&_.dropdown-label]:!min-h-4 [&_.dropdown-label]:!text-[10px] [&_.dropdown-label]:!font-medium [&_.dropdown-label]:!leading-4 [&_.dropdown-label]:!text-gray-700 [&_.mt-\[3px\]]:!mt-0 [&_.mb-1]:!mb-0 [&_.select-form-containers]:!h-8 [&_.select-form__control]:!border-[#cdcdcd]`;

/** Align DropdownSelect with compact row inputs (header labels shown separately). */
export const DISCOUNT_COMPACT_DROPDOWN_FORM_CLASS = String.raw`min-h-0 w-full sm:[&_.dropdown-label]:sr-only sm:[&_.input-label]:sr-only [&_.mt-\[3px\]]:!mt-0 [&_.mb-1]:!mb-0`;

export const DISCOUNT_ROW_GRID_CLASS =
  "grid grid-cols-1 items-center gap-2 rounded-sm border border-gray-200 bg-white p-2 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto]";

/** Bulk discount panels: up to three per row on large screens. */
export const DISCOUNT_BULK_GRID_CLASS =
  "grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3";

export const DISCOUNT_BULK_PANEL_CLASS: Record<string, string> = {
  netBill: resolveDiscountTypeTone("netBill").panel,
  approvedAmountDiscount: resolveDiscountTypeTone("approvedAmountDiscount").panel,
  package: resolveDiscountTypeTone("package").panel,
};

export const DISCOUNT_TYPE_CARD_CLASS =
  "flex h-full w-full flex-col gap-1.5 rounded-sm border px-2 py-1.5";

export const DISCOUNT_INDIVIDUAL_PANEL_CLASS = `${DISCOUNT_TYPE_CARD_CLASS} border-blue-200 bg-white`;

export const DISCOUNT_PERCENT_GRID_CLASS =
  "grid grid-cols-1 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

export function encodeDiscountRouteSegment(internalId: string): string {
  return encodeURIComponent(internalId);
}

export function resolveDiscountIdFromRouteParam(key: string): string | null {
  const trimmed = key.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase() === "new") return "new";
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

export function buildProviderDiscountPath(
  suffix: "view" | "edit",
  internalId: string,
  options: { providerBasePath?: string; pathname?: string },
): string | null {
  const key =
    internalId === "new" ? "new" : encodeDiscountRouteSegment(internalId);
  if (options.providerBasePath) {
    return `${options.providerBasePath}/discount/${key}/${suffix}`;
  }
  const providerId = options.pathname?.match(
    /\/provider-masters\/providers\/([^/]+)/,
  )?.[1];
  if (!providerId) return null;
  return `/provider-masters/providers/${providerId}/discount/${key}/${suffix}`;
}
