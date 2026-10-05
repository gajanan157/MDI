import { getApi, masterApi, providerApi } from "@/app/api/apiService";
import {
  getMockProviderAuditLog,
  mapApiItemToAuditLogEntry,
  PROVIDER_AUDIT_LOG_SECTION_LABELS,
  sortAuditLogEntriesNewestFirst,
  type ProviderAuditLogEntry,
  type ProviderAuditLogTabId,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/shared/providerAuditLog";
import { getTaskAuditLogByTaskId } from "@/app/pages/dashboards/providerManagernt/dashboard/inward/taskAssignment/providerInwardTaskMockData";
import type { CertificateTypeOption } from "./providerDetailTypes";

function unwrapAuditLogList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data == null || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  for (const key of ["content", "items", "rows", "data", "auditLogs", "audit_logs"]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

export async function fetchCertificateTypeOptionsApi(): Promise<CertificateTypeOption[]> {
  const res = await getApi<unknown>(masterApi, "/v1/document-master", {
    params: {
      onlyName: true,
      departmentSubtype: "EMPANELMENT CERTIFICATES",
    },
  });
  if (!res.success) return [];

  const raw = res.data;
  const asArray = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? ((raw as Record<string, unknown>).data ??
        (raw as Record<string, unknown>).result ??
        (raw as Record<string, unknown>).payload ??
        [])
      : [];
  const rows = Array.isArray(asArray) ? asArray : [];
  const names = rows
    .map((row) => {
      if (typeof row === "string") return row.trim();
      if (!row || typeof row !== "object") return "";
      const rec = row as Record<string, unknown>;
      return String(
        rec.documentType ??
          rec.name ??
          rec.documentTypeName ??
          rec.label ??
          rec.value ??
          "",
      ).trim();
    })
    .filter(Boolean);

  return [...new Set(names)].map((name) => ({ label: name, value: name }));
}

/** GET `/v1/provider/{providerId}/audit-log?section=` */
export async function fetchProviderAuditLogApi(
  providerId: string,
  tabId: ProviderAuditLogTabId,
): Promise<ProviderAuditLogEntry[]> {
  if (tabId === "task-assignment") {
    return sortAuditLogEntriesNewestFirst(getTaskAuditLogByTaskId(providerId));
  }

  const fallbackSection = PROVIDER_AUDIT_LOG_SECTION_LABELS[tabId];
  try {
    const res = await getApi<unknown>(
      providerApi,
      `/v1/provider/${encodeURIComponent(providerId)}/audit-log`,
      { params: { section: tabId } },
    );
    if (res.success && res.data != null) {
      const list = unwrapAuditLogList(res.data);
      if (list.length > 0) {
        return sortAuditLogEntriesNewestFirst(
          list.map((item, index) =>
            mapApiItemToAuditLogEntry(
              item as Record<string, unknown>,
              index,
              fallbackSection,
            ),
          ),
        );
      }
    }
  } catch {
    // Fall back to mock data until API is available.
  }
  return sortAuditLogEntriesNewestFirst(getMockProviderAuditLog(tabId));
}
