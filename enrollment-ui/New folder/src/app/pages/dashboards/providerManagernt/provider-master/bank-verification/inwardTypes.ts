export type BankVerificationInwardRow = {
  id: string;
  inwardNo: string;
  insurerName: string;
  insurerId: string;
  recordStatus: string;
  createdAt: string;
  uploadedByName: string;
  configuredIcId: string;
  dataFileName: string;
  emailFileName?: string;
};

export function createMinimalBankVerificationInwardRow(
  inwardNo: string,
  extras?: Partial<BankVerificationInwardRow>,
): BankVerificationInwardRow {
  const trimmed = inwardNo.trim();
  return {
    insurerName: "",
    insurerId: "",
    recordStatus: "Active",
    createdAt: "",
    uploadedByName: "",
    configuredIcId: "",
    dataFileName: "",
    ...extras,
    id: trimmed,
    inwardNo: trimmed,
  };
}
