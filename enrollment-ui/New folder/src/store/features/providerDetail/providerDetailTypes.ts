import type {
  ProviderAuditLogEntry,
  ProviderAuditLogTabId,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/shared/providerAuditLog";

export type CertificateTypeOption = { label: string; value: string };

export type ProviderDetailState = {
  certificateTypeOptions: CertificateTypeOption[];
  certificateTypesLoading: boolean;
  certificateTypesError: string | null;
  auditLog: {
    providerId: string | null;
    tabId: ProviderAuditLogTabId | null;
    rows: ProviderAuditLogEntry[];
    loading: boolean;
    error: string | null;
  };
};
