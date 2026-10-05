import providerAuditLogMock from "./provider-audit-log-mock.json";
import { formatProviderDateTimeDisplay } from "../../../../shared/dateFormat";

export type ProviderAuditLogTabId =
  | "hospital-details"
  | "agreement"
  | "provider-owner"
  | "infrastructure-facility"
  | "owners-info"
  | "ic-corporate"
  | "bank-details"
  | "hospital-document"
  | "soc"
  | "hospital-discount"
  | "task-assignment";

export const PROVIDER_AUDIT_LOG_SECTION_LABELS: Record<
  ProviderAuditLogTabId,
  string
> = {
  "hospital-details": "Overview",
  agreement: "Agreements",
  "provider-owner": "Owner",
  "infrastructure-facility": "Infra & Facility",
  "owners-info": "Contacts",
  "ic-corporate": "Network Management",
  "bank-details": "Banking Details",
  "hospital-document": "Documents",
  soc: "SOC",
  "hospital-discount": "Discount",
  "task-assignment": "Task Assignment",
};

export type ProviderAuditLogEntry = {
  id: string;
  changedAt: string;
  changedBy: string;
  section: string;
  certificate: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  action: string;
};

export type ProviderAuditLogContext = {
  providerId?: string;
  tabId: ProviderAuditLogTabId;
};

const MOCK_BY_TAB = providerAuditLogMock as Record<
  ProviderAuditLogTabId,
  ProviderAuditLogEntry[]
>;

/** Audit grid/datetime display — `17 Jul 2026, 2:30 PM`. */
export function formatProviderAuditDateTime(input?: string): string {
  return formatProviderDateTimeDisplay(input);
}

export function sortAuditLogEntriesNewestFirst(
  entries: ProviderAuditLogEntry[],
): ProviderAuditLogEntry[] {
  return [...entries].sort(
    (a, b) =>
      new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );
}

function str(item: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = item[key];
    if (value != null && String(value).trim() !== "") return String(value);
  }
  return "";
}

export function mapApiItemToAuditLogEntry(
  item: Record<string, unknown>,
  index: number,
  fallbackSection: string,
): ProviderAuditLogEntry {
  return {
    id: str(item, "id", "auditLogId", "audit_log_id") || `audit-${index}`,
    changedAt:
      str(item, "changedAt", "changed_at", "createdAt", "created_at", "timestamp") ||
      new Date().toISOString(),
    changedBy: str(item, "changedBy", "changed_by", "userName", "user_name", "updatedBy") || "—",
    section: str(item, "section", "sectionName", "section_name") || fallbackSection,
    certificate: str(item, "certificate", "certificateName", "certificate_name") || "—",
    fieldName: str(item, "fieldName", "field_name", "field") || "—",
    oldValue: str(item, "oldValue", "old_value", "previousValue") || "—",
    newValue: str(item, "newValue", "new_value", "currentValue") || "—",
    action: str(item, "action", "operation", "changeType") || "UPDATE",
  };
}

export function getMockProviderAuditLog(
  tabId: ProviderAuditLogTabId,
): ProviderAuditLogEntry[] {
  const sectionLabel = PROVIDER_AUDIT_LOG_SECTION_LABELS[tabId];
  return (MOCK_BY_TAB[tabId] ?? []).map((entry) => ({
    ...entry,
    section: entry.section || sectionLabel,
  }));
}
