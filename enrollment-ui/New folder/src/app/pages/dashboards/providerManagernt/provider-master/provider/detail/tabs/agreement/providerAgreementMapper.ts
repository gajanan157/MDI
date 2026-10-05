import type { AgreementListRow } from "./utils/agreementHelpers";
import { formatProviderDateTimeDisplay } from "@/app/pages/dashboards/providerManagernt/shared/dateFormat";
import type { AgreementFullFormValues } from "./utils/agreementFormConfig";
import {
  mapApiAgreementTypeToDisplay,
  mapApiAgreementTypeToFormType,
  mapApiStatusToDisplay,
} from "./utils/providerAgreementHelpers";
import type { NormalizedProviderAgreement } from "@/store/features/providerAgreement/providerAgreementTypes";

function formatAgreementDateForGrid(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return formatProviderDateTimeDisplay(trimmed) || trimmed;
}

function buildSelectedIcInvolvementJson(row: NormalizedProviderAgreement): string {
  if (!row.insurerMappings.length) return "";
  return JSON.stringify(
    row.insurerMappings.map((mapping) => ({
      insurerId: mapping.insurerId,
      effectiveFrom: mapping.mappingEffectiveFrom?.trim() || "",
      insurerName: mapping.insurerName?.trim() || undefined,
    })),
  );
}

export function mapNormalizedAgreementToListRow(
  row: NormalizedProviderAgreement,
): AgreementListRow {
  return {
    id: row.providerAgreementId,
    providerId: row.providerId,
    agreementName: row.providerAgreementName,
    type: mapApiAgreementTypeToDisplay(row.providerAgreementType),
    scope: row.applicableScope.trim(),
    effectiveFromDisplay: formatAgreementDateForGrid(row.providerAgreementEffectiveFrom),
    status: mapApiStatusToDisplay(row.providerAgreementStatus),
    socDiscountStatus: row.socDiscountStatus || "Pending",
    insurerMappings: row.insurerMappings.map((mapping) => ({
      insurerId: mapping.insurerId,
      insurerName: mapping.insurerName?.trim() || undefined,
      mappingEffectiveFrom:
        mapping.mappingEffectiveFrom?.trim() ||
        row.providerAgreementEffectiveFrom.trim() ||
        undefined,
    })),
  };
}

export function mapNormalizedAgreementToFullForm(
  row: NormalizedProviderAgreement,
): AgreementFullFormValues {
  return {
    agreementName: row.providerAgreementName,
    agreementVersion: row.providerAgreementVersion,
    agreementType: mapApiAgreementTypeToFormType(row.providerAgreementType),
    effectiveFrom: row.providerAgreementEffectiveFrom,
    effectiveTo: row.providerAgreementEffectiveTo,
    agreementDurationDays: String(row.providerAgreementDuration),
    status: mapApiStatusToDisplay(row.providerAgreementStatus),
    remarks: row.remark,
    applicableScope: row.applicableScope.trim() as AgreementFullFormValues["applicableScope"],
    selectedIcIds: row.insurerMappings.map((mapping) => mapping.insurerId),
    applicableIcsSummary: "",
    selectedIcInvolvementJson: buildSelectedIcInvolvementJson(row),
    empanelmentDate: row.providerEmpanellmentDate.trim(),
    signAgreementSentDate: row.providerAgreementSignedDate,
    agreementCopyAvailable: row.providerAgreementCopyAvailableFlag ? "Yes" : "No",
    hardCopySubmitted: "No",
    infrastructureAuditDone: row.infraAuditDoneFlag ? "Yes" : "No",
    providerSignatoryName: row.providerSignatoryName,
    providerSignatoryDesignation: row.providerSignatoryDesignation,
    ppnCity: row.providerGipsaPpnCity,
    ppnState: row.providerGipsaPpnState,
    ppnCityName: row.providerGipsaPpnCityName,
    ppnStateName: row.providerGipsaPpnStateName,
    agreementDocumentName: "",
    agreementDocumentUploadedOn: "",
    supportingDocumentName: "",
    supportingDocumentUploadedOn: "",
    fileMetadataId: row.fileMetadataId,
    supportingFileMetadataId: row.supportingFileMetadataId,
    inwardNo: row.inwardNo,
    pendingAgreementDocumentFile: null,
    pendingSupportingDocumentFile: null,
  };
}
