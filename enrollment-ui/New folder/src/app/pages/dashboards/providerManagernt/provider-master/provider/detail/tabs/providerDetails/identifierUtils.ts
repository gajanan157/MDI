import { DETAIL_ROW_EMPTY_PLACEHOLDER } from "../../shared/DetailRow";
import { formatToDDMMMYYYY } from "@/app/pages/dashboards/providerManagernt/shared/dateFormat";
import {
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE,
  PROVIDER_DETAIL_IDENTIFIER_KEYS as KEYS,
  isProviderOldCodeIdentifierType,
  isProviderOverviewIdentifierType,
  isProviderRohiniIdentifierType,
  showsIdentifierHolderField,
} from "../../utils/sectionMerges/provider/providerDetailIdentifierFieldKeys";
import type { NormalizedProviderDetailIdentifier } from "../../utils/sectionMerges/provider/providerDetailIdentifierNormalizer";
import type { ProviderDetailsFromApi } from "../../utils/providerDetailSectionMerges";
import type { ProviderOldCodeRow } from "../../../hospitalData";
import type {
  IdentifierFormRow,
  IdentifiersEditFormValues,
} from "../../schemas";
import { PRIMARY_IDENTIFIER_TYPE_NAMES } from "./options";
import type { NormalizedIdentifierTypeOption } from "./options";

// --- Display constants and helpers ---

/** Dense B2B styling aligned with Provider Details DetailRow blocks. */
export const IDENTIFIER_SHELL_CLASS =
  "min-w-0 overflow-hidden rounded-md border border-slate-200/90 bg-white";

export const IDENTIFIER_HEADER_CLASS =
  "border-b border-slate-200/80 bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-gray-700";

export const IDENTIFIER_SECTION_TITLE_CLASS =
  "text-[10px] font-bold leading-none text-gray-700";

export const IDENTIFIER_HINT_CLASS = "text-[9px] leading-tight text-slate-500";

export const IDENTIFIER_VALUE_CLASS =
  "min-w-0 break-all font-mono text-[10px] font-semibold leading-snug tabular-nums text-gray-900";

export const IDENTIFIER_TYPE_CLASS = "text-[10px] font-bold leading-snug text-gray-700";

export const IDENTIFIER_LABEL_COL_CLASS =
  "w-[42%] shrink-0 bg-gray-100 px-1.5 py-1 text-[10px] font-bold leading-snug text-gray-700";

export const IDENTIFIER_VALUE_COL_CLASS =
  "flex min-w-0 flex-1 items-center gap-1.5 bg-white px-1.5 py-1";

export const IDENTIFIER_ROW_MAIN_CLASS =
  "flex border-b border-slate-200/80 last:border-b-0";

export const IDENTIFIER_META_ROW_CLASS =
  "flex border-t border-slate-100 bg-slate-50/70 text-[9px] leading-snug";

export const IDENTIFIER_META_LABEL_CLASS =
  "w-[42%] shrink-0 px-1.5 py-0.5 font-semibold text-slate-600";

export const IDENTIFIER_META_VALUE_CLASS =
  "min-w-0 flex-1 break-words px-1.5 py-0.5 text-slate-800";

export const IDENTIFIER_ACCORDION_BUTTON_CLASS =
  "w-full bg-gray-100 px-1.5 py-1 text-left transition-colors hover:bg-gray-200/60";

export const IDENTIFIER_ACCORDION_PANEL_CLASS =
  "border-t border-slate-200/80 bg-white";

export const IDENTIFIER_EMPTY_MESSAGE_CLASS =
  "rounded-md border border-slate-200/80 bg-slate-50 px-2 py-1.5 text-[10px] text-slate-600";

export const IDENTIFIER_STATUS_ACTIVE_CLASS =
  "inline-flex shrink-0 rounded px-1 py-px text-[9px] font-semibold uppercase leading-none text-emerald-900 ring-1 ring-emerald-300/70 bg-emerald-100/90";

export const IDENTIFIER_STATUS_INACTIVE_CLASS =
  "inline-flex shrink-0 rounded px-1 py-px text-[9px] font-semibold uppercase leading-none text-slate-800 ring-1 ring-slate-300/90 bg-slate-200/80";

export const IDENTIFIER_VIEW_STACK_CLASS = "space-y-2";

type DetailPart = {
  label: string;
  value: string;
};

function readDetailValue(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

function withDatePlaceholder(value: string): string {
  if (!value) return DETAIL_ROW_EMPTY_PLACEHOLDER;
  return formatToDDMMMYYYY(value);
}

export function buildProviderIdentifierDetailParts(
  identifier: NormalizedProviderDetailIdentifier,
): DetailPart[] {
  const parts: DetailPart[] = [];

  const holderName = readDetailValue(identifier.identifierHolderName);
  if (showsIdentifierHolderField(identifier.identifierTypeName) && holderName) {
    parts.push({ label: "Holder", value: holderName });
  }
  const authority = readDetailValue(identifier.issuingAuthorityName);
  if (authority) parts.push({ label: "Authority", value: authority });

  parts.push({
    label: "Valid From",
    value: withDatePlaceholder(readDetailValue(identifier.validFrom)),
  });
  parts.push({
    label: "Valid To",
    value: withDatePlaceholder(readDetailValue(identifier.validTo)),
  });

  const issueDate = readDetailValue(identifier.issueDate);
  if (issueDate) parts.push({ label: "Issue Date", value: formatToDDMMMYYYY(issueDate) });

  return parts;
}

export function formatProviderIdentifierDetailLine(
  identifier: NormalizedProviderDetailIdentifier,
): string {
  return buildProviderIdentifierDetailParts(identifier)
    .map((part) => `${part.label}: ${part.value}`)
    .join(" · ");
}

// --- View layout mapper ---

export type ProviderIdentifierCodeGroup = {
  id: string;
  providerCode: string;
  identifierStatus: string;
  sourceSystem: string;
  relatedIdentifiers: NormalizedProviderDetailIdentifier[];
};

export type ProviderIdentifierViewLayout = {
  topIdentifiers: NormalizedProviderDetailIdentifier[];
  providerCodeGroups: ProviderIdentifierCodeGroup[];
  referencedOrphanIdentifiers: NormalizedProviderDetailIdentifier[];
};

function isProviderCodeHeader(row: NormalizedProviderDetailIdentifier): boolean {
  return isProviderOldCodeIdentifierType(row.identifierTypeName);
}

export function filterProviderDetailIdentifiersForOverview(
  identifiers: NormalizedProviderDetailIdentifier[],
): NormalizedProviderDetailIdentifier[] {
  return identifiers.filter((row) => isProviderOverviewIdentifierType(row.identifierTypeName));
}

function dedupeRohiniIdentifiers(
  rows: NormalizedProviderDetailIdentifier[],
): NormalizedProviderDetailIdentifier[] {
  const byValue = new Map<string, NormalizedProviderDetailIdentifier>();

  for (const row of rows) {
    const value = row.identifierValue.trim();
    if (!value) continue;

    const existing = byValue.get(value);
    if (!existing) {
      byValue.set(value, row);
      continue;
    }

    if (row.identifierTypeName === PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE) {
      byValue.set(value, row);
    }
  }

  return Array.from(byValue.values());
}

/** Overview Identifier Details: Rohini number(s) and old provider codes only. */
export const PROVIDER_ROHINI_OVERVIEW_LABEL = "Rohini Number";

function isActiveIdentifierStatus(status: string): boolean {
  return status.trim().toUpperCase() === "ACTIVE";
}

export function splitProviderIdentifierOverviewRows(
  identifiers: NormalizedProviderDetailIdentifier[],
): {
  rohiniRows: NormalizedProviderDetailIdentifier[];
  oldCodeRows: NormalizedProviderDetailIdentifier[];
} {
  const rows = buildProviderIdentifierOverviewRows(identifiers);
  return {
    rohiniRows: rows.filter((row) => isProviderRohiniIdentifierType(row.identifierTypeName)),
    oldCodeRows: rows.filter((row) => isProviderOldCodeIdentifierType(row.identifierTypeName)),
  };
}

export function mapOldProviderCodeIdentifiersToViewRows(
  identifiers: NormalizedProviderDetailIdentifier[],
): ProviderOldCodeRow[] {
  return identifiers
    .filter((row) => isProviderOldCodeIdentifierType(row.identifierTypeName))
    .map((row) => ({
      code: row.identifierValue,
      active: isActiveIdentifierStatus(row.identifierStatus),
    }));
}

export function buildProviderIdentifierOverviewRows(
  identifiers: NormalizedProviderDetailIdentifier[],
): NormalizedProviderDetailIdentifier[] {
  const filtered = filterProviderDetailIdentifiersForOverview(identifiers);
  const rohiniRows = dedupeRohiniIdentifiers(
    filtered.filter((row) => isProviderRohiniIdentifierType(row.identifierTypeName)),
  );
  const oldCodeRows = filtered.filter((row) => isProviderOldCodeIdentifierType(row.identifierTypeName));

  return [...rohiniRows, ...oldCodeRows];
}

export function mapProviderIdentifierOverviewViewLayout(
  identifiers: NormalizedProviderDetailIdentifier[],
): ProviderIdentifierViewLayout {
  const filtered = filterProviderDetailIdentifiersForOverview(identifiers);
  const layout = mapProviderIdentifierViewLayout(filtered);

  return {
    topIdentifiers: dedupeRohiniIdentifiers(
      layout.topIdentifiers.filter((row) => isProviderRohiniIdentifierType(row.identifierTypeName)),
    ),
    providerCodeGroups: layout.providerCodeGroups.map((group) => ({
      ...group,
      relatedIdentifiers: [],
    })),
    referencedOrphanIdentifiers: [],
  };
}

function isPrimaryIdentifier(row: NormalizedProviderDetailIdentifier): boolean {
  return PRIMARY_IDENTIFIER_TYPE_NAMES.includes(
    row.identifierTypeName as (typeof PRIMARY_IDENTIFIER_TYPE_NAMES)[number],
  );
}

function buildGroupId(row: NormalizedProviderDetailIdentifier): string {
  return row.providerIdentifierId || `${row.identifierTypeName}-${row.identifierValue}`;
}

function hasVerificationReference(row: NormalizedProviderDetailIdentifier): boolean {
  return row.verificationReferenceNo.trim() !== "";
}

function matchesProviderCodeHeader(
  row: NormalizedProviderDetailIdentifier,
  header: NormalizedProviderDetailIdentifier,
): boolean {
  const headerValue = header.identifierValue.trim();
  if (!headerValue) return false;
  return row.verificationReferenceNo.trim() === headerValue;
}

/** Top: no reference; bottom: old provider codes with referenced identifiers grouped inside. */
export function mapProviderIdentifierViewLayout(
  identifiers: NormalizedProviderDetailIdentifier[],
): ProviderIdentifierViewLayout {
  const providerCodeHeaders = identifiers.filter(isProviderCodeHeader);
  const headerIds = new Set(providerCodeHeaders.map((row) => buildGroupId(row)));
  const providerCodeValues = new Set(providerCodeHeaders.map((row) => row.identifierValue));

  const providerCodeGroups = providerCodeHeaders.map((header) => ({
    id: buildGroupId(header),
    providerCode: header.identifierValue,
    identifierStatus: header.identifierStatus,
    sourceSystem: header.sourceSystem,
    relatedIdentifiers: identifiers.filter(
      (row) =>
        !headerIds.has(buildGroupId(row)) &&
        !isPrimaryIdentifier(row) &&
        matchesProviderCodeHeader(row, header),
    ),
  }));

  const groupedReferencedIds = new Set<string>(
    providerCodeGroups.flatMap((group) =>
      group.relatedIdentifiers.map((row) => buildGroupId(row)),
    ),
  );

  const referencedOrphanIdentifiers = identifiers.filter(
    (row) =>
      !headerIds.has(buildGroupId(row)) &&
      hasVerificationReference(row) &&
      !providerCodeValues.has(row.verificationReferenceNo.trim()) &&
      !groupedReferencedIds.has(buildGroupId(row)),
  );

  const topCandidates = identifiers.filter(
    (row) =>
      !headerIds.has(buildGroupId(row)) &&
      !groupedReferencedIds.has(buildGroupId(row)) &&
      (!hasVerificationReference(row) || isPrimaryIdentifier(row)),
  );

  const primaryIdentifiers = topCandidates.filter(isPrimaryIdentifier);
  const primaryIds = new Set(primaryIdentifiers.map((row) => buildGroupId(row)));
  const otherTopIdentifiers = topCandidates.filter((row) => !primaryIds.has(buildGroupId(row)));

  return {
    topIdentifiers: [...primaryIdentifiers, ...otherTopIdentifiers],
    providerCodeGroups,
    referencedOrphanIdentifiers,
  };
}

// --- Form mapper ---

function readFormString(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function isSameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function mapIdentifierToFormRow(
  row: NormalizedProviderDetailIdentifier,
): IdentifierFormRow {
  return {
    providerIdentifierId: row.providerIdentifierId,
    identifierTypeName: row.identifierTypeName,
    identifierValue: row.identifierValue,
    identifierStatus: row.identifierStatus,
    validFrom: readFormString(row.validFrom),
    validTo: readFormString(row.validTo),
    identifierHolderName: row.identifierHolderName,
    issuingAuthorityName: row.issuingAuthorityName,
    issueDate: readFormString(row.issueDate),
    verificationReferenceNo: row.verificationReferenceNo,
    sourceSystem: row.sourceSystem,
  };
}

export function mapIdentifiersToFormValues(
  identifiers: NormalizedProviderDetailIdentifier[],
): IdentifiersEditFormValues {
  return {
    items: identifiers.map(mapIdentifierToFormRow),
  };
}

export function formItemsToNormalized(
  items: IdentifierFormRow[],
): NormalizedProviderDetailIdentifier[] {
  return items.map((row, index) => ({
    providerIdentifierId: row.providerIdentifierId || `new-${index}`,
    identifierTypeName: row.identifierTypeName,
    identifierValue: row.identifierValue,
    identifierStatus: row.identifierStatus,
    validFrom: normalizeNullable(row.validFrom),
    validTo: normalizeNullable(row.validTo),
    isPrimary: false,
    issueDate: normalizeNullable(row.issueDate),
    sourceSystem: row.sourceSystem,
    identifierHolderName: row.identifierHolderName,
    issuingAuthorityName: row.issuingAuthorityName,
    verificationReferenceNo: row.verificationReferenceNo,
  }));
}

export function buildIdentifierFormRowFromType(
  typeOption: NormalizedIdentifierTypeOption,
): IdentifierFormRow {
  return {
    providerIdentifierId: "",
    identifierTypeName: typeOption.identifierTypeName,
    identifierValue: "",
    identifierStatus: "ACTIVE",
    validFrom: "",
    validTo: "",
    identifierHolderName: "",
    issuingAuthorityName: typeOption.issuingAuthorityName,
    issueDate: "",
    verificationReferenceNo: "",
    sourceSystem: typeOption.sourceSystem,
  };
}

/** Child identifier linked to a parent Old Provider Code via verificationReferenceNo. */
export function buildIdentifierChildFormRow(
  typeOption: NormalizedIdentifierTypeOption,
  parentProviderCode: string,
): IdentifierFormRow {
  return {
    ...buildIdentifierFormRowFromType(typeOption),
    verificationReferenceNo: parentProviderCode.trim(),
  };
}

export function resolveIdentifierFormIndex(
  items: IdentifierFormRow[],
  identifier: NormalizedProviderDetailIdentifier,
  usedIndexes: Set<number>,
): number {
  if (identifier.providerIdentifierId.startsWith("new-")) {
    const index = Number(identifier.providerIdentifierId.slice(4));
    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < items.length &&
      !usedIndexes.has(index)
    ) {
      usedIndexes.add(index);
      return index;
    }
  }

  if (identifier.providerIdentifierId) {
    const byId = items.findIndex(
      (row, itemIndex) =>
        !usedIndexes.has(itemIndex) &&
        row.providerIdentifierId === identifier.providerIdentifierId,
    );
    if (byId >= 0) {
      usedIndexes.add(byId);
      return byId;
    }
  }

  const byFields = items.findIndex(
    (row, itemIndex) =>
      !usedIndexes.has(itemIndex) &&
      row.identifierTypeName === identifier.identifierTypeName &&
      row.identifierValue === identifier.identifierValue,
  );
  if (byFields >= 0) usedIndexes.add(byFields);
  return byFields;
}

export function findIdentifierFormIndex(
  items: IdentifierFormRow[],
  identifier: NormalizedProviderDetailIdentifier,
): number {
  return resolveIdentifierFormIndex(items, identifier, new Set<number>());
}

function findBaseIdentifierRow(
  identifiers: NormalizedProviderDetailIdentifier[],
  row: IdentifierFormRow,
): NormalizedProviderDetailIdentifier | undefined {
  if (!row.providerIdentifierId) return undefined;
  return identifiers.find(
    (item) => item.providerIdentifierId === row.providerIdentifierId,
  );
}

export function findOldProviderCodeFormIndex(
  items: IdentifierFormRow[],
  providerCode: string,
): number {
  return items.findIndex(
    (row) =>
      row.identifierValue === providerCode &&
      (row.identifierTypeName === "Old Provider Code" ||
        row.identifierTypeName === "PROVIDER_CODE"),
  );
}

/** Resolves edit-form row index for an Old Provider Code accordion group. */
export function resolveOldProviderCodeHeaderIndex(
  items: IdentifierFormRow[],
  group: { id: string; providerCode: string },
): number {
  if (group.id.startsWith("new-")) {
    const index = Number(group.id.slice(4));
    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < items.length &&
      (items[index]?.identifierTypeName === "Old Provider Code" ||
        items[index]?.identifierTypeName === "PROVIDER_CODE")
    ) {
      return index;
    }
  }

  if (group.id) {
    const bySavedId = items.findIndex(
      (row) =>
        row.providerIdentifierId === group.id &&
        (row.identifierTypeName === "Old Provider Code" ||
          row.identifierTypeName === "PROVIDER_CODE"),
    );
    if (bySavedId >= 0) return bySavedId;
  }

  return findOldProviderCodeFormIndex(items, group.providerCode);
}

function buildIdentifierPatchRow(
  row: IdentifierFormRow,
  baseRow: NormalizedProviderDetailIdentifier | undefined,
): Record<string, unknown> {
  return {
    [KEYS.providerIdentifierId]: row.providerIdentifierId || baseRow?.providerIdentifierId || "",
    [KEYS.identifierTypeName]: row.identifierTypeName,
    [KEYS.identifierValue]: row.identifierValue,
    [KEYS.identifierStatus]: row.identifierStatus,
    [KEYS.validFrom]: normalizeNullable(row.validFrom),
    [KEYS.validTo]: normalizeNullable(row.validTo),
    [KEYS.identifierHolderName]: normalizeNullable(row.identifierHolderName),
    [KEYS.issuingAuthorityName]: normalizeNullable(row.issuingAuthorityName),
    [KEYS.issueDate]: normalizeNullable(row.issueDate),
    [KEYS.verificationReferenceNo]: row.verificationReferenceNo,
    [KEYS.sourceSystem]: row.sourceSystem,
  };
}

function buildBaseIdentifierPatchRows(
  identifiers: NormalizedProviderDetailIdentifier[],
): Record<string, unknown>[] {
  return identifiers.map((row) => buildIdentifierPatchRow(mapIdentifierToFormRow(row), row));
}

export function buildIdentifiersPatch(
  form: IdentifiersEditFormValues,
  base: ProviderDetailsFromApi,
): Record<string, unknown>[] | undefined {
  const nextRows = form.items.map((row) =>
    buildIdentifierPatchRow(row, findBaseIdentifierRow(base.identifiers, row)),
  );
  const baseRows = buildBaseIdentifierPatchRows(base.identifiers);

  return isSameJson(nextRows, baseRows) ? undefined : nextRows;
}
