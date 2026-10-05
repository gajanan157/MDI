export const EMPANELMENT_SOURCE_OPTIONS = [
  { value: "TPA", label: "TPA" },
  { value: "Insurer", label: "Insurer" },
];

export const IC_MAPPING_FORM_DEFAULTS = {
  icName: "",
  corporateIds: [] as string[],
  icProviderCode: "",
  partyCode: "",
  partyCodeStatus: "Pending from IC",
  empanelmentSource: "TPA",
  networkMode: "",
  tariffType: "",
  effectiveFrom: "",
  effectiveTo: "",
  remarks: "",
  supportingDocument: null as File | null,
  supportingFileMetadataId: "",
  supportingDocumentName: "",
  inwardNo: "",
};
