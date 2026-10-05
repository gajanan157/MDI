// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { normalizeRow } from "./providerBankAccountSearchApi";

const sample = {
  providerBankId: "4f9ac7af-eedd-4250-b29d-26477d4a38a3",
  providerId: "01a00f8d-b062-7ca6-b87f-1f8760d4931f",
  providerBankAccountNo: "50200067745670",
  providerBankIfscCode: "HDFC0000280",
  providerBankHolderName: "Viaan Eye And Retina Centre Llp",
  providerName: "VIAAN EYE & RETINA CENTRE",
  providerCode: "HO-HR-GUR-000002",
  insurerId: "3569e0c8-2dda-49c4-a106-0e1cff14b83c",
  insurerName: "National Insurance Company Limited",
  providerBankMatchStatus: "MATCHED",
  providerRohiniNo: "8900080006362",
  providerPanNo: "AAVFV0501G",
  providerPanHolderName: "VIAAN EYE AND RETINA CENTRE LLP",
  recordStatus: "Active",
};

describe("normalizeRow – IC-Provider bank details search", () => {
  it("maps the bank match status from providerBankMatchStatus", () => {
    expect(normalizeRow(sample, 0)?.bankMatch).toBe("matched");
    expect(normalizeRow({ ...sample, providerBankMatchStatus: "NOT_MATCHED" }, 0)?.bankMatch).toBe(
      "mismatch",
    );
    expect(normalizeRow({ ...sample, providerBankMatchStatus: undefined }, 0)?.bankMatch).toBe(
      "pending",
    );
  });

  it("maps the ROHINI number from providerRohiniNo", () => {
    expect(normalizeRow(sample, 0)?.rohiniRegistryCode).toBe("8900080006362");
  });

  it("maps PAN, account and IFSC fields", () => {
    const row = normalizeRow(sample, 0);
    expect(row?.panNo).toBe("AAVFV0501G");
    expect(row?.panHolderName).toBe("VIAAN EYE AND RETINA CENTRE LLP");
    expect(row?.bankAccountNo).toBe("50200067745670");
    expect(row?.bankIfscCode).toBe("HDFC0000280");
    expect(row?.bankHolderName).toBe("Viaan Eye And Retina Centre Llp");
  });

  it("leaves record source blank when the payload has no source field", () => {
    expect(normalizeRow(sample, 0)?.recordSource).toBe("");
  });

  it("labels an explicit record source", () => {
    expect(normalizeRow({ ...sample, recordSource: "INSURER" }, 0)?.recordSource).toBe(
      "Insurer record",
    );
    expect(normalizeRow({ ...sample, isInsurerRecord: false }, 0)?.recordSource).toBe(
      "Provider record",
    );
  });

  it("returns null for a non-object row", () => {
    expect(normalizeRow(null, 0)).toBeNull();
    expect(normalizeRow("x", 0)).toBeNull();
  });
});
