export const DEFAULT_AGREEMENT_PDF_URL = encodeURI(
  "/pdf/GH REVISION-01-07-2024-FOR TPA.pdf",
);

/** Shown when agreementForm keys are empty (mock / demo data). */
export const AGREEMENT_SUMMARY_DEFAULTS: Record<string, string> = {
  agreementNumber: "AGR-001",
  agreementVersion: "V1",
  agreementTypeName: "Private IC Agreement",
  agreementCategory: "Bipartite",
  agreementEffectiveFrom: "2025-01-01",
  agreementEffectiveTo: "2025-12-31",
  agreementStatus: "Active",
  applicableScope: "Private ICs",
  applicableIcs: "All Private ICs",
  selectedIcIds: "",
  selectedIcInvolvementJson: "",
  agreementDocumentName: "Agreement_Document.pdf",
  agreementDocumentUploadedOn: "15-Jan-2025",
};

export function mergeAgreementDisplay(
  form: Record<string, string>,
): Record<string, string> {
  return { ...AGREEMENT_SUMMARY_DEFAULTS, ...form };
}
