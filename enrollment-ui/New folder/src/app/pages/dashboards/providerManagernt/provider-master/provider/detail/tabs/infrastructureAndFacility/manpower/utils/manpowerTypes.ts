import type { ProviderManpowerRow } from "@/store/features/providerManpower/providerManpowerTypes";

/** RHF row for the manpower grid — string-typed numeric fields for editing. */
export type ManpowerFormRow = {
  rowKey: string;
  providerManpowerDetailId: string | null;
  manpowerType: string;
  employmentType: string;
  totalCount: string;
  onDutyCount: string;
  onCallCount: string;
  trainedCount: string;
  qualificationType: string;
  experienceYears: string;
  isActive: boolean;
  /** True when the row came from the API (vs. added in this edit session). */
  fromApi: boolean;
};

export type ManpowerFormValues = { rows: ManpowerFormRow[] };

export const MANPOWER_TYPE_OPTIONS = [
  "Doctor",
  "Nurse",
  "Technician",
  "Pharmacist",
  "Paramedical",
  "Administrative Staff",
  "Support Staff",
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  "Permanent",
  "Contract",
  "Visiting",
  "Outsourced",
  "Part-time",
  "On-call",
] as const;

export const QUALIFICATION_TYPE_OPTIONS = [
  "MBBS",
  "MD",
  "MS",
  "DNB",
  "BDS",
  "B.Sc Nursing",
  "GNM",
  "ANM",
  "DMLT",
  "B.Pharm",
  "D.Pharm",
  "Diploma",
  "Other",
] as const;

export function manpowerRowKey(manpowerType: string, employmentType: string): string {
  return `${manpowerType.trim().toLowerCase()}::${employmentType.trim().toLowerCase()}`;
}

/** Type guard for a fully identified manpower row. */
export function isIdentifiedManpowerRow(row: ManpowerFormRow): boolean {
  return Boolean(row.manpowerType.trim() && row.employmentType.trim());
}

export type { ProviderManpowerRow };
