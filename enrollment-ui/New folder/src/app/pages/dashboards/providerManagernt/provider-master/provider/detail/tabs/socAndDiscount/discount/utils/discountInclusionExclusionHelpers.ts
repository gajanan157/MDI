import type { BillScopeOption } from "../../../../../../ic-corporate-mapping/components/BillScopeMultiSelect";
import { looksLikeUuid } from "./discountDisplayLabel";
import type {
  DiscountInclusionExclusionMasterRecord,
  DiscountInclusionExclusionSaveItem,
} from "@/store/features/discountInclusionExclusionMaster/discountInclusionExclusionMasterTypes";

/**
 * Deduplicate master rows by `provider_inclusion_exclusion_code`.
 * INCLUSION/EXCLUSION type pairs for the same code become one dropdown option.
 */
export function buildUniqueInclusionExclusionOptions(
  records: DiscountInclusionExclusionMasterRecord[],
): BillScopeOption[] {
  const byCode = new Map<string, BillScopeOption>();

  (records ?? []).forEach((row) => {
    if (row.recordStatus === "INACTIVE") return;
    const code = String(row.code ?? "").trim();
    if (!code || byCode.has(code)) return;
    byCode.set(code, {
      value: code,
      label: row.name || code,
    });
  });

  return Array.from(byCode.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );
}

export function buildMasterRecordByCode(
  records: DiscountInclusionExclusionMasterRecord[],
): Map<string, DiscountInclusionExclusionMasterRecord> {
  const byCode = new Map<string, DiscountInclusionExclusionMasterRecord>();
  (records ?? []).forEach((row) => {
    const code = String(row.code ?? "").trim();
    if (!code || byCode.has(code)) return;
    byCode.set(code, row);
  });
  return byCode;
}

export function isDisabledInInclusion(
  optionCode: string,
  selectedExclusions: string[],
): boolean {
  const code = String(optionCode ?? "").trim();
  if (!code) return false;
  return (selectedExclusions ?? []).some((entry) => String(entry).trim() === code);
}

export function isDisabledInExclusion(
  optionCode: string,
  selectedInclusions: string[],
): boolean {
  const code = String(optionCode ?? "").trim();
  if (!code) return false;
  return (selectedInclusions ?? []).some((entry) => String(entry).trim() === code);
}

/** Keep option visible but mark disabled when selected in the opposite dropdown. */
export function withOppositeSelectionDisabled(
  options: BillScopeOption[],
  oppositeSelectedCodes: string[],
  disabledReason: string,
): BillScopeOption[] {
  const blocked = new Set(
    (oppositeSelectedCodes ?? []).map((code) => String(code ?? "").trim()).filter(Boolean),
  );
  return (options ?? []).map((option) => {
    const disabled = blocked.has(String(option.value ?? "").trim());
    return {
      ...option,
      isDisabled: disabled,
      disabledReason: disabled ? disabledReason : undefined,
    };
  });
}

/**
 * Derive save payload type from UI location (not master row type).
 * Comparison key remains `provider_inclusion_exclusion_code`.
 */
export function toInclusionExclusionSaveItems(
  selectedInclusions: string[],
  selectedExclusions: string[],
  masterByCode: Map<string, DiscountInclusionExclusionMasterRecord>,
): DiscountInclusionExclusionSaveItem[] {
  const items: DiscountInclusionExclusionSaveItem[] = [];

  (selectedInclusions ?? []).forEach((raw) => {
    const code = String(raw ?? "").trim();
    if (!code) return;
    const master = masterByCode.get(code);
    items.push({
      providerInclusionExclusionCode: code,
      providerInclusionExclusionType: "INCLUSION",
      providerInclusionExclusionMasterId: master?.id,
      providerInclusionExclusionName: master?.name,
    });
  });

  (selectedExclusions ?? []).forEach((raw) => {
    const code = String(raw ?? "").trim();
    if (!code) return;
    const master = masterByCode.get(code);
    items.push({
      providerInclusionExclusionCode: code,
      providerInclusionExclusionType: "EXCLUSION",
      providerInclusionExclusionMasterId: master?.id,
      providerInclusionExclusionName: master?.name,
    });
  });

  return items;
}

/** Map stored master ids (or names) to dropdown codes used by the form. */
export function toInclusionExclusionCodes(
  selected: string[],
  records: DiscountInclusionExclusionMasterRecord[],
): string[] {
  const byId = new Map<string, string>();
  const byName = new Map<string, string>();
  (records ?? []).forEach((row) => {
    const code = String(row.code ?? "").trim();
    if (!code) return;
    const id = String(row.id ?? "").trim();
    const name = String(row.name ?? "").trim().toLowerCase();
    if (id && !byId.has(id)) byId.set(id, code);
    if (name && !byName.has(name)) byName.set(name, code);
  });

  const codes: string[] = [];
  const seen = new Set<string>();
  (selected ?? []).forEach((raw) => {
    const value = String(raw ?? "").trim();
    if (!value) return;
    const mapped =
      byId.get(value) ??
      byName.get(value.toLowerCase()) ??
      (looksLikeUuid(value) ? "" : value);
    if (!mapped || seen.has(mapped)) return;
    seen.add(mapped);
    codes.push(mapped);
  });
  return codes;
}

export function resolveMasterIdsFromSelected(
  selected: string[],
  records: DiscountInclusionExclusionMasterRecord[],
): string[] {
  const masterByCode = buildMasterRecordByCode(records);
  const ids: string[] = [];
  const seen = new Set<string>();
  (selected ?? []).forEach((raw) => {
    const value = String(raw ?? "").trim();
    if (!value) return;
    const mapped = masterByCode.get(value)?.id?.trim() || (looksLikeUuid(value) ? value : "");
    if (!mapped || seen.has(mapped)) return;
    seen.add(mapped);
    ids.push(mapped);
  });
  return ids;
}

/** OPD is one type detail; all OPD subtypes share this inclusion/exclusion key. */
export const DISCOUNT_OPD_INCL_EXCL_KEY = "opd";

export function cloneStringArrayRecord(
  record: Record<string, string[]> | undefined,
): Record<string, string[]> {
  const next: Record<string, string[]> = {};
  Object.entries(record ?? {}).forEach(([key, values]) => {
    next[key] = [...(values ?? [])];
  });
  return next;
}

export function mapInclusionExclusionRecordToCodes(
  record: Record<string, string[]> | undefined,
  records: DiscountInclusionExclusionMasterRecord[],
): Record<string, string[]> {
  const next: Record<string, string[]> = {};
  Object.entries(record ?? {}).forEach(([key, values]) => {
    next[key] = toInclusionExclusionCodes(values, records);
  });
  return next;
}

export function pruneStringArrayRecord(
  record: Record<string, string[]> | undefined,
  keepKeys: Iterable<string>,
): Record<string, string[]> {
  const keep = new Set(Array.from(keepKeys).filter(Boolean));
  const next: Record<string, string[]> = {};
  Object.entries(record ?? {}).forEach(([key, values]) => {
    if (!keep.has(key)) return;
    next[key] = [...(values ?? [])];
  });
  return next;
}

const EMPTY_STRING_ARRAY_RECORD: Record<string, string[]> = {};

export function stringArrayRecordsEqual(
  left: Record<string, string[]> | undefined,
  right: Record<string, string[]> | undefined,
): boolean {
  return (
    JSON.stringify(left ?? EMPTY_STRING_ARRAY_RECORD) ===
    JSON.stringify(right ?? EMPTY_STRING_ARRAY_RECORD)
  );
}

export function setStringArrayRecordValue(
  record: Record<string, string[]> | undefined,
  key: string,
  nextValues: string[],
): Record<string, string[]> {
  return {
    ...cloneStringArrayRecord(record),
    [key]: [...nextValues],
  };
}

export function inclusionExclusionLabel(
  value: string,
  options: BillScopeOption[],
  records: DiscountInclusionExclusionMasterRecord[],
): string {
  const v = String(value ?? "").trim();
  if (!v) return "";
  const fromOptions = options.find((option) => option.value === v)?.label;
  if (fromOptions && !looksLikeUuid(fromOptions)) return fromOptions;
  const fromId = records.find((row) => row.id === v);
  if (fromId?.name && !looksLikeUuid(fromId.name)) return fromId.name;
  const fromName = records.find(
    (row) => String(row.name ?? "").trim().toLowerCase() === v.toLowerCase(),
  );
  if (fromName?.name && !looksLikeUuid(fromName.name)) return fromName.name;
  return looksLikeUuid(v) ? "" : v;
}
