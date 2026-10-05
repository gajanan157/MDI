import type { ProviderMasterKey } from "./masterConfig";
import type { ProviderMasterActivityLogEntry } from "./providerMasterActivityLogTypes";

const USER = {
  admin: "Admin",
  priya: "Priya Jain",
  rahul: "Rahul Sharma",
} as const;

type LogAction = ProviderMasterActivityLogEntry["action"];

function logEntry(
  entry: ProviderMasterActivityLogEntry,
): ProviderMasterActivityLogEntry {
  return entry;
}

const IDENTIFIER_TYPE_LOG: ProviderMasterActivityLogEntry[] = [
  logEntry({
    id: "pit-1",
    changedAt: "2026-05-20T14:30:00",
    changedBy: USER.priya,
    recordCode: "ROHINI_CODE",
    recordName: "ROHINI Registry Code",
    fieldName: "Issuing Authority Name",
    oldValue: "ROHINI Registry",
    newValue: "ROHINI Registry (Updated)",
    action: "UPDATE" satisfies LogAction,
  }),
  logEntry({
    id: "pit-2",
    changedAt: "2026-05-19T11:15:00",
    changedBy: USER.rahul,
    recordCode: "DENTAL_COUNCIL_REG",
    recordName: "Dental Council Registration Number",
    fieldName: "Identifier Level",
    oldValue: "Facility",
    newValue: "Practitioner",
    action: "UPDATE" satisfies LogAction,
  }),
  logEntry({
    id: "pit-3",
    changedAt: "2026-05-18T09:45:00",
    changedBy: USER.admin,
    recordCode: "NABH_ACCRED",
    recordName: "NABH Accreditation Number",
    fieldName: "Status",
    oldValue: "Active",
    newValue: "Inactive",
    action: "UPDATE" satisfies LogAction,
  }),
  logEntry({
    id: "pit-4",
    changedAt: "2026-05-17T16:20:00",
    changedBy: USER.priya,
    recordCode: "GSTIN",
    recordName: "GST Identification Number",
    fieldName: "Description",
    oldValue: "GST registration for billing",
    newValue: "GST registration number for provider billing and invoicing",
    action: "UPDATE" satisfies LogAction,
  }),
  logEntry({
    id: "pit-5",
    changedAt: "2026-05-16T10:00:00",
    changedBy: USER.rahul,
    recordCode: "MCI_REG",
    recordName: "Medical Council Registration",
    fieldName: "Record",
    oldValue: "—",
    newValue: "MCI_REG / Medical Council Registration",
    action: "CREATE" satisfies LogAction,
  }),
  logEntry({
    id: "pit-6",
    changedAt: "2026-05-15T13:55:00",
    changedBy: USER.admin,
    recordCode: "PAN",
    recordName: "Permanent Account Number",
    fieldName: "Record",
    oldValue: "PAN / Permanent Account Number",
    newValue: "—",
    action: "DELETE" satisfies LogAction,
  }),
];

const TAXONOMY_LOG: ProviderMasterActivityLogEntry[] = [
  logEntry({
    id: "tax-1",
    changedAt: "2026-05-20T10:20:00",
    changedBy: USER.admin,
    recordCode: "HOSPITAL",
    recordName: "Hospital",
    fieldName: "Provider Type Scope",
    oldValue: "In-patient care facility",
    newValue: "Multi-specialty in-patient care facility",
    action: "UPDATE" satisfies LogAction,
  }),
  logEntry({
    id: "tax-2",
    changedAt: "2026-05-18T15:40:00",
    changedBy: USER.priya,
    recordCode: "CLINIC",
    recordName: "Clinic",
    fieldName: "Status",
    oldValue: "Active",
    newValue: "Inactive",
    action: "UPDATE" satisfies LogAction,
  }),
];

function genericMasterLog(
  masterKey: ProviderMasterKey,
  codePrefix: string,
  namePrefix: string,
): ProviderMasterActivityLogEntry[] {
  return [
    logEntry({
      id: `${masterKey}-1`,
      changedAt: "2026-05-19T12:00:00",
      changedBy: USER.admin,
      recordCode: `${codePrefix}-001`,
      recordName: `${namePrefix} Default`,
      fieldName: "Description",
      oldValue: `Default ${namePrefix.toLowerCase()} record`,
      newValue: `Updated ${namePrefix.toLowerCase()} description`,
      action: "UPDATE" satisfies LogAction,
    }),
    logEntry({
      id: `${masterKey}-2`,
      changedAt: "2026-05-17T09:30:00",
      changedBy: USER.rahul,
      recordCode: `${codePrefix}-002`,
      recordName: `${namePrefix} Secondary`,
      fieldName: "Status",
      oldValue: "Active",
      newValue: "Inactive",
      action: "UPDATE" satisfies LogAction,
    }),
    logEntry({
      id: `${masterKey}-3`,
      changedAt: "2026-05-15T14:15:00",
      changedBy: USER.priya,
      recordCode: `${codePrefix}-003`,
      recordName: `${namePrefix} New`,
      fieldName: "Record",
      oldValue: "—",
      newValue: `${codePrefix}-003 / ${namePrefix} New`,
      action: "CREATE" satisfies LogAction,
    }),
  ];
}

const MOCK_BY_MASTER: Partial<
  Record<ProviderMasterKey, ProviderMasterActivityLogEntry[]>
> = {
  provider_identifier_type_master: IDENTIFIER_TYPE_LOG,
  provider_taxonomy: TAXONOMY_LOG,
};

export function getMockProviderMasterActivityLog(
  masterKey: ProviderMasterKey,
): ProviderMasterActivityLogEntry[] {
  const specific = MOCK_BY_MASTER[masterKey];
  if (specific?.length) return specific;

  const prefix = masterKey
    .replace(/^provider_/, "")
    .replace(/_master$/, "")
    .split("_")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);

  const label = masterKey
    .replace(/^provider_/, "")
    .replace(/_master$/, "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return genericMasterLog(masterKey, prefix || "MST", label || "Master");
}
