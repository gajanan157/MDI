import { EyeIcon } from "@heroicons/react/24/outline";
import { activeInactiveStatusPillRenderer } from "../../../../../../shared/providerAgGrid";
import { formatProviderDateTimeDisplay } from "../../../../../../shared/dateFormat";
import { readFieldValue } from "../../../utils/readFieldValue";
import {
  extractNestedApiRows,
  isApiRecord,
} from "../../../utils/sectionMerges/apiPayloadHelpers";
import type { CreateProviderRestrictionBody } from "../api";
import { emptyToNull } from "../shared";
import { PROVIDER_RESTRICTION_KEYS as KEYS } from "./keys";
import { restrictionScopeCellRenderer, restrictionScopeHeaderComponent } from "./restrictionScopeDisplay.helpers";
import type { ItemWithIdName, RestrictionDetailsState, RestrictionFormValues } from "../types";

/**
 * The form stores display values ("Watchlist", "Cashless", "Insurer"),
 * while the API contract uses uppercase enums ("WATCHLIST", "CASHLESS",
 * "INSURER") — see the POST /v1/provider-restriction request example.
 */
function toApiEnum(value: string): string {
  return value.trim().toUpperCase();
}

function toIdList(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => value.trim()).filter(Boolean);
}

/** Builds the body for `POST /v1/provider-restriction`. */
export function buildProviderRestrictionCreateBody(
  providerId: string,
  values: RestrictionFormValues,
  details: RestrictionDetailsState,
): CreateProviderRestrictionBody {
  const body: CreateProviderRestrictionBody = {
    providerId,
    insurerId: values.icName,
    providerRestrictionApplicableFor: toApiEnum(
      toProviderRestrictionApplicableFor(values.restrictionApplicable),
    ),
    providerRestrictionEffectiveFrom: details.effectiveFrom,
    providerRestrictionEffectiveTo: emptyToNull(details.effectiveTo),
    providerRestrictionLevel: toApiEnum(values.restrictionLevel),
    providerRestrictionReasonCode: "00001",
    providerRestrictionReasonDescription: "None",
    remark: emptyToNull(details.remark),
    emergencyExceptionAllowedFlag: values.emergency_exception_allowed_flag,
    investigationRequiredFlag: values.investigationRequired,
  };

  if (values.restrictionLevel === "Insurer") {
    body.providerRestrictionType = toApiEnum(values.restrictionType);
  }

  const inwardNo = emptyToNull(details.inwardNo);
  const supportingFileMetadataId = emptyToNull(details.supportingFileMetadataId);
  if (inwardNo != null) body.inwardNo = inwardNo;
  if (supportingFileMetadataId != null) body.supportingFileMetadataId = supportingFileMetadataId;

  if (values.restrictionLevel === "INSURER_CORPORATE") {
    const corporateIds = toIdList(values.corporateIds);
    if (corporateIds.length > 0) body.corporateIds = corporateIds;
  }

  if (values.restrictionLevel === "INSURER_RO") {
    const officeIds = toIdList(values.rohOfficeIds);
    if (officeIds.length > 0) body.insurerOfficeIds = officeIds;
  }

  if (values.restrictionLevel === "INSURER_POLICY") {
    const policyIds = toIdList(values.policyNumbers);
    if (policyIds.length > 0) body.policyIds = policyIds;
  }

  if (values.restrictionLevel === "INSURER_CCN") {
    const ccnNumbers = toIdList(values.ccnNumbers);
    if (ccnNumbers.length > 0) body.ccnNumbers = ccnNumbers;
  }

  return body;
}

/**
 * Maps API uppercase enums back to the form dropdown display values
 * used by `IcRestrictionCreateForm`.
 */
function fromRestrictionType(apiValue: string): string {
  return apiValue.trim().toUpperCase() === "BLACKLIST" ? "Blacklist" : "Watchlist";
}

function fromRestrictionLevel(apiValue: string): string {
  const value = apiValue.trim().toUpperCase().replace(/\+/g, "_");
  if (value === "INSURER_CORPORATE") return "INSURER_CORPORATE";
  if (value === "INSURER_RO") return "INSURER_RO";
  if (value === "INSURER_POLICY") return "INSURER_POLICY";
  if (value === "INSURER_CCN") return "INSURER_CCN";
  if (value === "INSURER") return "Insurer";
  return "";
}

export function mapProviderRestrictionToForm(
  row: NormalizedProviderRestriction,
): {
  values: RestrictionFormValues;
  details: RestrictionDetailsState;
} {
  return {
    values: {
      icName: row.insurerId,
      restrictionType: fromRestrictionType(row.providerRestrictionType),
      restrictionApplicable: fromProviderRestrictionApplicableFor(
        row.providerRestrictionApplicableFor,
      ),
      investigationType: "",
      investigationRequired: row.investigationRequiredFlag,
      emergency_exception_allowed_flag: row.emergencyExceptionAllowedFlag,
      restrictionLevel: fromRestrictionLevel(row.providerRestrictionLevel),
      corporateIds: row.corporateIds,
      rohOfficeIds: row.insurerOfficeIds,
      policyNumbers: row.policyIds,
      ccnNumbers: row.ccnNumbers,
    },
    details: {
      effectiveFrom: toRestrictionDateInputValue(row.providerRestrictionEffectiveFrom),
      effectiveTo: toRestrictionDateInputValue(row.providerRestrictionEffectiveTo),
      remark: row.remark,
      supportingDocument: null,
      supportingFileMetadataId: row.supportingFileMetadataId,
      supportingDocumentName: "",
      inwardNo: row.inwardNo,
    },
  };
}

type RestrictionRequiredFieldOptions = {
  showRestrictionType: boolean;
  showCorporateDropdown: boolean;
  showRohDropdown: boolean;
  showPolicyNumbersField: boolean;
  showCcnNumbersField: boolean;
};

/** At least one RO office id when level is Insurer + RO. */
export function hasRohOfficeIdsSelected(rohOfficeIds: string[] | undefined): boolean {
  return Array.isArray(rohOfficeIds) && rohOfficeIds.some((id) => String(id).trim() !== "");
}

/** At least one corporate id when level is Insurer + Corporate. */
export function hasCorporateIdsSelected(corporateIds: string[] | undefined): boolean {
  return Array.isArray(corporateIds) && corporateIds.some((id) => String(id).trim() !== "");
}

function isRestrictionLevelSpecificFieldsFilled(values: RestrictionFormValues): boolean {
  if (values.restrictionLevel === "INSURER_CORPORATE") {
    return hasCorporateIdsSelected(values.corporateIds);
  }
  if (values.restrictionLevel === "INSURER_RO") {
    return hasRohOfficeIdsSelected(values.rohOfficeIds);
  }
  if (values.restrictionLevel === "INSURER_POLICY") {
    const policyNumbers = Array.isArray(values.policyNumbers) ? values.policyNumbers : [];
    return policyNumbers.length > 0;
  }
  if (values.restrictionLevel === "INSURER_CCN") {
    const ccnNumbers = Array.isArray(values.ccnNumbers) ? values.ccnNumbers : [];
    return ccnNumbers.length > 0;
  }
  return true;
}

function resolveCorporateIdsFromApi(
  corporateIdsFromApi: string[],
  corporateId: string,
): string[] {
  if (corporateIdsFromApi.length > 0) return corporateIdsFromApi;
  if (corporateId) return [corporateId];
  return [];
}

/** Required fields mirror `handleRestrictionSave` validation. */
export function areRestrictionRequiredFieldsFilled(
  values: RestrictionFormValues,
  details: RestrictionDetailsState,
  options: RestrictionRequiredFieldOptions,
): boolean {
  if (!values.restrictionLevel?.trim()) return false;
  if (!values.icName?.trim()) return false;
  if (options.showRestrictionType && !values.restrictionType?.trim()) return false;

  const applicable = Array.isArray(values.restrictionApplicable)
    ? values.restrictionApplicable
    : [];
  if (applicable.length === 0) return false;

  if (!isRestrictionLevelSpecificFieldsFilled(values)) return false;
  if (!details.effectiveFrom?.trim()) return false;
  if (!details.remark?.trim()) return false;
  if (
    !details.supportingDocument &&
    !details.supportingFileMetadataId?.trim() &&
    !details.supportingDocumentName?.trim()
  ) {
    return false;
  }

  return true;
}

/** Normalizes API date strings to `yyyy-mm-dd` for `<input type="date">`. */
export function toRestrictionDateInputValue(apiValue: string): string {
  const datePart = apiValue.trim().split("T")[0]?.trim() ?? "";

  const iso = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return datePart;

  const dmyHyphen = datePart.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyHyphen) return `${dmyHyphen[3]}-${dmyHyphen[2]}-${dmyHyphen[1]}`;

  const dmySlash = datePart.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmySlash) return `${dmySlash[3]}-${dmySlash[2]}-${dmySlash[1]}`;

  return datePart;
}

/** Maps multi-select values to `providerRestrictionApplicableFor` API enum. */
export function toProviderRestrictionApplicableFor(applicable: string[]): string {
  const hasCashless = applicable.includes("cashless");
  const hasReimbursement = applicable.includes("reimbursement");
  if (hasCashless && hasReimbursement) return "BOTH";
  if (hasCashless) return "CASHLESS";
  if (hasReimbursement) return "REIMBURSEMENT";
  return "";
}

/** Maps API `providerRestrictionApplicableFor` back to multi-select values. */
export function fromProviderRestrictionApplicableFor(value: string): string[] {
  const applicableFor = value.trim().toUpperCase();
  if (applicableFor === "BOTH") return ["cashless", "reimbursement"];
  if (applicableFor === "CASHLESS") return ["cashless"];
  if (applicableFor === "REIMBURSEMENT") return ["reimbursement"];
  return [];
}

/** A row with `providerRestrictionId` opens edit; otherwise add restriction. */
export function hasProviderRestriction(item: ItemWithIdName): boolean {
  return Boolean(item.providerRestrictionId?.trim());
}

export function getRestrictionActionLabel(): string {
  return "Restrictions";
}

/** Grid icons: open lock = add, closed lock = edit existing restriction. */
export function getRestrictionActionIconType(
  item: ItemWithIdName,
): "add" | "edit" {
  return hasProviderRestriction(item) ? "edit" : "add";
}

export type ProviderRestrictionListFilters = {
  providerId?: string;
  insurerId?: string;
  corporateId?: string;
  policyId?: string;
  tpaId?: string;
  providerRestrictionZoneId?: string;
  providerRestrictionType?: string;
  providerRestrictionStatus?: string;
  page?: number;
  size?: number;
};

export function getRestrictionListEntityId(
  item: ItemWithIdName,
  mappingSubTab: "ic" | "corporate",
): string {
  if (mappingSubTab === "corporate") return item.id.trim();
  return (item.insurerId ?? item.id).trim();
}

/** Insurer/corporate id for restriction list breadcrumb after GET by restriction id. */
export function resolveRestrictionEntityIdFromRow(
  row: NormalizedProviderRestriction,
  mappingSubTab: "ic" | "corporate",
): string {
  if (mappingSubTab === "corporate") {
    return (row.corporateIds[0] ?? row.corporateId).trim();
  }
  return row.insurerId.trim();
}

export function resolveRestrictionListItem(args: {
  entityId: string;
  mappingSubTab: "ic" | "corporate";
  gridRows: ItemWithIdName[];
  corporateToIcMap: Record<string, string>;
}): ItemWithIdName {
  const entityId = args.entityId.trim();
  const found = args.gridRows.find((row) => {
    if (args.mappingSubTab === "corporate") return row.id.trim() === entityId;
    return (row.insurerId ?? row.id).trim() === entityId;
  });
  if (found) return found;

  if (args.mappingSubTab === "corporate") {
    return {
      id: entityId,
      insurerId: args.corporateToIcMap[entityId] ?? "",
      name: "",
    };
  }

  return {
    id: entityId,
    insurerId: entityId,
    name: "",
  };
}

export function buildProviderRestrictionListFilters(args: {
  providerId: string;
  mappingSubTab: "ic" | "corporate";
  item: ItemWithIdName;
  corporateToIcMap: Record<string, string>;
  searchFilters?: Record<string, unknown>;
}): ProviderRestrictionListFilters {
  const filters: ProviderRestrictionListFilters = {
    providerId: args.providerId.trim(),
    page: 1,
    size: 20,
  };

  if (args.mappingSubTab === "corporate") {
    filters.corporateId = args.item.id.trim();
    const insurerId = (args.corporateToIcMap[args.item.id] ?? args.item.insurerId ?? "").trim();
    if (insurerId) {
      filters.insurerId = insurerId;
    }
  } else {
    const insurerId = (args.item.insurerId ?? args.item.id).trim();
    if (insurerId) {
      filters.insurerId = insurerId;
    }
  }

  const search = args.searchFilters ?? {};
  const providerRestrictionType = String(search.providerRestrictionType ?? "").trim();
  const providerRestrictionStatus = String(search.providerRestrictionStatus ?? "").trim();
  const policyId = String(search.policyId ?? "").trim();
  const tpaId = String(search.tpaId ?? "").trim();
  const providerRestrictionZoneId = String(search.providerRestrictionZoneId ?? "").trim();

  if (providerRestrictionType) filters.providerRestrictionType = providerRestrictionType;
  if (providerRestrictionStatus) filters.providerRestrictionStatus = providerRestrictionStatus;
  if (policyId) filters.policyId = policyId;
  if (tpaId) filters.tpaId = tpaId;
  if (providerRestrictionZoneId) {
    filters.providerRestrictionZoneId = providerRestrictionZoneId;
  }

  return filters;
}

const VIEW_BTN =
  "inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700";

export function buildRestrictionListGridColumnDefs(
  onView: (row: NormalizedProviderRestriction) => void,
): object[] {
  return [
    {
      headerName: "Actions",
      field: "actions",
      colId: "actions",
      width: 80,
      maxWidth: 88,
      sortable: false,
      filter: false,
      pinned: "left" as const,
      lockPinned: true,
      suppressMovable: true,
      suppressCellFocus: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params: { data: NormalizedProviderRestriction }) => (
        <div className="flex h-full items-center justify-center">
          <button
            type="button"
            className={VIEW_BTN}
            title="View restriction"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onView(params.data);
            }}
          >
            <EyeIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      ),
    },
    // {
    //   field: "insurerName",
    //   headerName: "Insurance Company",
    //   flex: 1.4,
    //   minWidth: 180,
    //   valueFormatter: (params: { value?: string }) =>
    //     formatRestrictionGridText(params.value),
    // },
    {
      field: "restrictionScope",
      colId: "restrictionScope",
      headerName: "Corporate / RO / Policy",
      headerComponent: restrictionScopeHeaderComponent(),
      flex: 0,
      minWidth: 200,
      sortable: false,
      suppressSizeToFit: true,
      cellRenderer: restrictionScopeCellRenderer,
    },
    {
      field: "providerRestrictionType",
      headerName: "Restriction Type",
      flex: 1.2,
      minWidth: 140,
      valueFormatter: (params: { value?: string }) =>
        formatRestrictionGridLabel(params.value),
    },
    {
      field: "providerRestrictionApplicableFor",
      headerName: "Applicable For",
      flex: 1,
      minWidth: 130,
      valueFormatter: (params: { value?: string }) =>
        formatRestrictionGridLabel(params.value),
    },
    {
      field: "providerRestrictionLevel",
      headerName: "Restriction Level",
      flex: 1.2,
      minWidth: 150,
      valueFormatter: (params: { value?: string }) =>
        formatRestrictionGridLabel(params.value),
    },
    {
      field: "providerRestrictionStatus",
      headerName: "Status",
      width: 110,
      minWidth: 100,
      cellRenderer: activeInactiveStatusPillRenderer,
    },
    {
      field: "providerRestrictionEffectiveFrom",
      headerName: "Effective From",
      flex: 1,
      minWidth: 130,
      valueFormatter: (params: { value?: string }) =>
        formatRestrictionGridDate(params.value),
    },
  ];
}

export function formatRestrictionGridLabel(value: string | undefined): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "—";

  return trimmed
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatRestrictionGridText(value: string | undefined): string {
  const trimmed = String(value ?? "").trim();
  return trimmed || "—";
}

export function formatRestrictionGridDate(value: string | undefined): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "—";
  return formatProviderDateTimeDisplay(trimmed);
}

export function getRestrictionListRowId(row: {
  providerRestrictionId: string;
}): string {
  return row.providerRestrictionId;
}

export type NormalizedProviderRestriction = {
  providerRestrictionId: string;
  providerId: string;
  insurerId: string;
  insurerName: string;
  corporateId: string;
  corporateName: string;
  corporateNames: string[];
  providerRestrictionType: string;
  providerRestrictionApplicableFor: string;
  providerRestrictionEffectiveFrom: string;
  providerRestrictionEffectiveTo: string;
  providerRestrictionLevel: string;
  providerRestrictionReasonCode: string;
  providerRestrictionReasonDescription: string;
  remark: string;
  inwardNo: string;
  supportingFileMetadataId: string;
  corporateIds: string[];
  policyIds: string[];
  insurerOfficeIds: string[];
  insurerOfficeName: string;
  policyNumber: string;
  policyNumbers: string[];
  ccnNumbers: string[];
  emergencyExceptionAllowedFlag: boolean;
  investigationRequiredFlag: boolean;
  providerRestrictionStatus: string;
};

function getString(item: Record<string, unknown>, key: string): string {
  const value = readFieldValue(item, [key]);
  if (value == null) return "";
  return String(value).trim();
}

function getStringArray(item: Record<string, unknown>, key: string): string[] {
  const value = readFieldValue(item, [key]);
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry).trim()).filter(Boolean);
}

function extractNamedStringList(raw: unknown, nameKeys: string[]): string[] {
  if (!Array.isArray(raw)) return [];
  const names: string[] = [];

  for (const entry of raw) {
    if (typeof entry === "string") {
      const trimmed = entry.trim();
      if (trimmed) names.push(trimmed);
      continue;
    }
    if (!isApiRecord(entry)) continue;

    for (const key of nameKeys) {
      const name = getString(entry, key);
      if (name) {
        names.push(name);
        break;
      }
    }
  }

  return names;
}

function uniqueNonEmptyStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function getBoolean(item: Record<string, unknown>, key: string): boolean {
  const value = readFieldValue(item, [key]);
  return value === true;
}

export function normalizeProviderRestriction(
  raw: unknown,
): NormalizedProviderRestriction | null {
  if (!isApiRecord(raw)) return null;

  const providerRestrictionId = getString(raw, KEYS.providerRestrictionId);
  if (!providerRestrictionId) return null;

  const insurerId = getString(raw, KEYS.insurerId);
  const corporateId = getString(raw, KEYS.corporateId);
  const corporateIdsFromApi = getStringArray(raw, KEYS.corporateIds);
  const corporateIds = resolveCorporateIdsFromApi(corporateIdsFromApi, corporateId);
  const policyIds = getStringArray(raw, KEYS.policyIds);
  const policyNumbers = getStringArray(raw, KEYS.policyNumbers);
  const policyNumber = getString(raw, KEYS.policyNumber);
  const corporateNames = uniqueNonEmptyStrings([
    ...getStringArray(raw, KEYS.corporateNames),
    ...extractNamedStringList(raw[KEYS.corporateNames], ["corporateName", "name"]),
    ...extractNamedStringList(raw.corporates, ["corporateName", "name"]),
  ]);

  return {
    providerRestrictionId,
    providerId: getString(raw, KEYS.providerId),
    insurerId,
    insurerName: getString(raw, KEYS.insurerName),
    corporateId,
    corporateName: getString(raw, KEYS.corporateName),
    corporateNames,
    providerRestrictionType: getString(raw, KEYS.providerRestrictionType),
    providerRestrictionApplicableFor: getString(raw, KEYS.providerRestrictionApplicableFor),
    providerRestrictionEffectiveFrom: getString(raw, KEYS.providerRestrictionEffectiveFrom),
    providerRestrictionEffectiveTo: getString(raw, KEYS.providerRestrictionEffectiveTo),
    providerRestrictionLevel: getString(raw, KEYS.providerRestrictionLevel),
    providerRestrictionReasonCode: getString(raw, KEYS.providerRestrictionReasonCode),
    providerRestrictionReasonDescription: getString(
      raw,
      KEYS.providerRestrictionReasonDescription,
    ),
    remark: getString(raw, KEYS.remark),
    inwardNo: getString(raw, KEYS.inwardNo),
    supportingFileMetadataId: getString(raw, KEYS.supportingFileMetadataId),
    corporateIds,
    policyIds: policyIds.length > 0 ? policyIds : policyNumbers,
    insurerOfficeIds: getStringArray(raw, KEYS.insurerOfficeIds),
    insurerOfficeName: getString(raw, KEYS.insurerOfficeName),
    policyNumber,
    policyNumbers,
    ccnNumbers: getStringArray(raw, KEYS.ccnNumbers),
    emergencyExceptionAllowedFlag: getBoolean(raw, KEYS.emergencyExceptionAllowedFlag),
    investigationRequiredFlag: getBoolean(raw, KEYS.investigationRequiredFlag),
    providerRestrictionStatus: getString(raw, KEYS.providerRestrictionStatus),
  };
}

function extractProviderRestrictionListItems(raw: unknown): unknown[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (!isApiRecord(raw)) return [];

  if (Array.isArray(raw.data)) return raw.data;

  const dataNode = raw.data;
  if (isApiRecord(dataNode)) {
    for (const key of ["content", "items", "list", "data", "result"] as const) {
      const value = dataNode[key];
      if (Array.isArray(value)) return value;
    }
  }

  for (const key of ["content", "items", "list", "result", "payload"] as const) {
    const value = raw[key];
    if (Array.isArray(value)) return value;
  }

  return extractNestedApiRows(raw);
}

export function normalizeProviderRestrictionList(raw: unknown): NormalizedProviderRestriction[] {
  const nestedRows = extractNestedApiRows(raw);
  const items =
    nestedRows.length > 0 ? nestedRows : extractProviderRestrictionListItems(raw);

  return items
    .map(normalizeProviderRestriction)
    .filter((row): row is NormalizedProviderRestriction => row != null);
}