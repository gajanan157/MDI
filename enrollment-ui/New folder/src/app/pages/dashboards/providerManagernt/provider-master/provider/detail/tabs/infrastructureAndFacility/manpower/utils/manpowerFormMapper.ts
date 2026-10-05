import type {
  ProviderManpower,
  ProviderManpowerPatchPayload,
  ProviderManpowerRow,
} from "@/store/features/providerManpower/providerManpowerTypes";
import {
  manpowerRowKey,
  type ManpowerFormRow,
} from "./manpowerTypes";

function numToString(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

function stringToNum(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

/** Demo rows shown until the manpower API is live. */
const DUMMY_MANPOWER: Array<
  [string, string, number, number, number, number, string, number]
> = [
  ["Doctor", "Permanent", 24, 14, 6, 24, "MD", 9],
  ["Doctor", "Visiting", 12, 0, 8, 12, "MS", 12],
  ["Nurse", "Permanent", 86, 52, 10, 74, "B.Sc Nursing", 5],
  ["Nurse", "Contract", 30, 18, 4, 20, "GNM", 3],
  ["Technician", "Permanent", 18, 12, 2, 16, "DMLT", 6],
  ["Pharmacist", "Permanent", 6, 4, 0, 6, "B.Pharm", 7],
  ["Paramedical", "Contract", 22, 14, 3, 12, "Diploma", 4],
  ["Administrative Staff", "Permanent", 15, 12, 0, 3, "Other", 8],
];

function dummyManpowerFormRows(): ManpowerFormRow[] {
  return DUMMY_MANPOWER.map(
    ([
      manpowerType,
      employmentType,
      total,
      onDuty,
      onCall,
      trained,
      qualification,
      experience,
    ]) => ({
      rowKey: manpowerRowKey(manpowerType, employmentType),
      providerManpowerDetailId: null,
      manpowerType,
      employmentType,
      totalCount: String(total),
      onDutyCount: String(onDuty),
      onCallCount: String(onCall),
      trainedCount: String(trained),
      qualificationType: qualification,
      experienceYears: String(experience),
      isActive: true,
      fromApi: false,
    }),
  );
}

/** API rows → RHF form rows. Falls back to demo rows when the API has none. */
export function manpowerFormRowsFromApi(
  manpower: ProviderManpower | null | undefined,
): ManpowerFormRow[] {
  const apiRows = (manpower?.manpowerList ?? []).map((row) => ({
    rowKey: manpowerRowKey(row.manpowerType, row.employmentType),
    providerManpowerDetailId: row.providerManpowerDetailId ?? null,
    manpowerType: row.manpowerType,
    employmentType: row.employmentType,
    totalCount: numToString(row.totalCount),
    onDutyCount: numToString(row.onDutyCount),
    onCallCount: numToString(row.onCallCount),
    trainedCount: numToString(row.trainedCount),
    qualificationType: row.qualificationType,
    experienceYears: numToString(row.experienceYears),
    isActive: row.isActive,
    fromApi: true,
  }));
  return apiRows.length > 0 ? apiRows : dummyManpowerFormRows();
}

export function createEmptyManpowerFormRow(
  manpowerType = "",
  employmentType = "",
): ManpowerFormRow {
  return {
    rowKey: manpowerRowKey(manpowerType, employmentType) || `new-${Date.now()}`,
    providerManpowerDetailId: null,
    manpowerType,
    employmentType,
    totalCount: "",
    onDutyCount: "",
    onCallCount: "",
    trainedCount: "",
    qualificationType: "",
    experienceYears: "",
    isActive: true,
    fromApi: false,
  };
}

/** RHF form rows → PATCH payload (drops incompletely-identified rows). */
export function manpowerPatchPayloadFromForm(
  rows: ManpowerFormRow[],
): ProviderManpowerPatchPayload {
  const manpowerList: ProviderManpowerRow[] = rows
    .filter((row) => row.manpowerType.trim() && row.employmentType.trim())
    .map((row) => ({
      providerManpowerDetailId: row.providerManpowerDetailId ?? null,
      manpowerType: row.manpowerType.trim(),
      employmentType: row.employmentType.trim(),
      totalCount: stringToNum(row.totalCount),
      onDutyCount: stringToNum(row.onDutyCount),
      onCallCount: stringToNum(row.onCallCount),
      trainedCount: stringToNum(row.trainedCount),
      qualificationType: row.qualificationType.trim(),
      experienceYears: stringToNum(row.experienceYears),
      isActive: row.isActive,
    }));
  return { manpowerList };
}

/** Row-level warning: duty + on-call must not exceed total; trained must not exceed total. */
export function manpowerRowWarning(row: ManpowerFormRow): string | null {
  const total = stringToNum(row.totalCount);
  if (total == null) return null;
  const duty = stringToNum(row.onDutyCount) ?? 0;
  const onCall = stringToNum(row.onCallCount) ?? 0;
  const trained = stringToNum(row.trainedCount) ?? 0;
  if (duty + onCall > total) return "On-duty + on-call exceeds total count";
  if (trained > total) return "Trained count exceeds total count";
  return null;
}
