import { describe, expect, it } from "vitest";
import {
  getNetworkDisplayStatus,
  getNetworkDisplayStatusFromFlags,
  NETWORK_DISPLAY_STATUS,
} from "../networkDisplayStatus";
import {
  mapNetworkMappingListToGridRows,
  normalizeProviderNetworkMappingList,
} from "../network";

describe("getNetworkDisplayStatus", () => {
  it("returns DEPANELLED when network is INACTIVE regardless of cashless/reimbursement", () => {
    expect(
      getNetworkDisplayStatus("INACTIVE", "ALLOWED", "ALLOWED"),
    ).toBe(NETWORK_DISPLAY_STATUS.DEPANELLED);
    expect(
      getNetworkDisplayStatus(false, true, true),
    ).toBe(NETWORK_DISPLAY_STATUS.DEPANELLED);
  });

  it("returns EMPANELLED when ACTIVE + ALLOWED + ALLOWED", () => {
    expect(
      getNetworkDisplayStatus("ACTIVE", "ALLOWED", "ALLOWED"),
    ).toBe(NETWORK_DISPLAY_STATUS.EMPANELLED);
    expect(
      getNetworkDisplayStatusFromFlags(true, true, true),
    ).toBe(NETWORK_DISPLAY_STATUS.EMPANELLED);
  });

  it("returns WATCHLIST when ACTIVE + ON_HOLD + ALLOWED", () => {
    expect(
      getNetworkDisplayStatus("ACTIVE", "ON_HOLD", "ALLOWED"),
    ).toBe(NETWORK_DISPLAY_STATUS.WATCHLIST);
    expect(
      getNetworkDisplayStatusFromFlags(true, false, true),
    ).toBe(NETWORK_DISPLAY_STATUS.WATCHLIST);
  });

  it("returns WATCHLIST when ACTIVE + ALLOWED + NOT_ALLOWED", () => {
    expect(
      getNetworkDisplayStatus("ACTIVE", "ALLOWED", "NOT_ALLOWED"),
    ).toBe(NETWORK_DISPLAY_STATUS.WATCHLIST);
    expect(
      getNetworkDisplayStatusFromFlags(true, true, false),
    ).toBe(NETWORK_DISPLAY_STATUS.WATCHLIST);
  });

  it("returns BLACKLIST when ACTIVE + ON_HOLD + NOT_ALLOWED", () => {
    expect(
      getNetworkDisplayStatus("ACTIVE", "ON_HOLD", "NOT_ALLOWED"),
    ).toBe(NETWORK_DISPLAY_STATUS.BLACKLIST);
    expect(
      getNetworkDisplayStatusFromFlags(true, false, false),
    ).toBe(NETWORK_DISPLAY_STATUS.BLACKLIST);
  });

  it("treats null/undefined cashless and reimbursement as ALLOWED", () => {
    expect(
      getNetworkDisplayStatus("ACTIVE", null, undefined),
    ).toBe(NETWORK_DISPLAY_STATUS.EMPANELLED);
  });
});

const SAMPLE_RESPONSE = [
  {
    providerId: "621c5d6f-6ec6-42f5-a42d-fab663fa8ab2",
    tpaId: null,
    insurerId: "14249ab5-f088-409b-a9b7-ddf39c174775",
    providerNetworkIsActive: true,
    corporateId: null,
    corporateName: null,
    insurerName: "Narayana Health Insurance Ltd",
    providerNetworkSource: "INSURER",
    providerNetworkMode: null,
    providerNetworkTariffType: null,
    providerNetworkEffectiveFrom: "2026-06-05",
    providerNetworkEffectiveTo: "2026-06-05",
    supportingFileMetadataId: null,
    inwardNo: null,
    insurerProviderCode: "string",
    remark: "string",
    providerRestrictionApplicableFor: "CASHLESS",
    providerBankMatchWithIC: "Pending",
    agreementStatus: "ACTIVE",
  },
  {
    providerId: "621c5d6f-6ec6-42f5-a42d-fab663fa8ab2",
    insurerId: "330af0cf-0d4d-4424-9da7-ded4bfeffe81",
    insurerName: "Magma General Insurance Limited",
    providerNetworkSource: "INSURER",
    providerNetworkMode: "HYBRID",
    providerNetworkTariffType: "HYBRID",
    providerNetworkEffectiveFrom: "2019-01-17",
    providerNetworkEffectiveTo: null,
    insurerProviderCode: null,
    providerRestrictionApplicableFor: "BOTH",
    providerBankMatchWithIC: "Pending",
    providerAgreementStatus: "PENDING",
    insurerType: "PRIVATE",
  },
];

describe("normalizeProviderNetworkMappingList", () => {
  it("maps exact API fields into normalized rows", () => {
    const rows = normalizeProviderNetworkMappingList(SAMPLE_RESPONSE);

    expect(rows).toHaveLength(2);
    expect(rows[0].insurerId).toBe("14249ab5-f088-409b-a9b7-ddf39c174775");
    expect(rows[0].insurerName).toBe("Narayana Health Insurance Ltd");
    expect(rows[0].insurerProviderCode).toBe("string");
    expect(rows[0].providerNetworkSource).toBe("INSURER");
    expect(rows[0].networkSource).toBe("INSURER");
    expect(rows[0].providerNetworkIsActive).toBe(true);
    expect(rows[0].providerBankMatchWithIC).toBe("Pending");
    expect(rows[0].bankMatch).toBe("pending");
    expect(rows[0].agreementStatus).toBe("active");
    expect(rows[0].agreement).toBe("Active");
    expect(rows[0].providerRestrictionApplicableFor).toBe("CASHLESS");
    expect(rows[0].cashless).toBe(false);
    expect(rows[0].reimbursement).toBe(true);
    expect(rows[1].providerNetworkMode).toBe("HYBRID");
    expect(rows[1].insurerType).toBe("PRIVATE");
    expect(rows[1].insurerProviderCode).toBe("");
    expect(rows[1].providerRestrictionApplicableFor).toBe("BOTH");
    expect(rows[1].agreementStatus).toBe("pending");
    expect(rows[1].agreement).toBe("Pending");
    expect(rows[1].cashless).toBe(false);
    expect(rows[1].reimbursement).toBe(false);
  });

  it("maps null providerNetworkSource to empty network source", () => {
    const rows = normalizeProviderNetworkMappingList([
      {
        insurerId: "insurer-1",
        insurerName: "Test Insurer",
        providerNetworkSource: null,
      },
    ]);

    expect(rows[0].providerNetworkSource).toBe("");
    expect(rows[0].networkSource).toBe("");
  });

  it("maps REIMBURSEMENT to reimbursement restricted only", () => {
    const rows = normalizeProviderNetworkMappingList([
      {
        insurerId: "insurer-1",
        insurerName: "Test Insurer",
        providerRestrictionApplicableFor: "REIMBURSEMENT",
      },
    ]);

    expect(rows[0].cashless).toBe(true);
    expect(rows[0].reimbursement).toBe(false);
  });

  it("maps Not Matched API value to mismatch status", () => {
    const rows = normalizeProviderNetworkMappingList([
      {
        insurerId: "insurer-1",
        insurerName: "Test Insurer",
        providerBankMatchWithIC: "Not Matched",
      },
    ]);

    expect(rows[0].bankMatch).toBe("mismatch");
  });

  it("maps null providerRestrictionApplicableFor to both enabled", () => {
    const rows = normalizeProviderNetworkMappingList([
      {
        insurerId: "insurer-1",
        insurerName: "Test Insurer",
        providerRestrictionApplicableFor: null,
      },
    ]);

    expect(rows[0].cashless).toBe(true);
    expect(rows[0].reimbursement).toBe(true);
  });

  it("derives display status from sample API rows", () => {
    const rows = normalizeProviderNetworkMappingList([
      {
        insurerId: "1",
        insurerName: "A",
        providerNetworkIsActive: false,
        providerRestrictionApplicableFor: null,
      },
      {
        insurerId: "2",
        insurerName: "B",
        providerNetworkIsActive: true,
        providerRestrictionApplicableFor: "CASHLESS",
      },
    ]);

    expect(
      getNetworkDisplayStatusFromFlags(
        rows[0].providerNetworkIsActive,
        rows[0].cashless,
        rows[0].reimbursement,
      ),
    ).toBe(NETWORK_DISPLAY_STATUS.DEPANELLED);

    expect(
      getNetworkDisplayStatusFromFlags(
        rows[1].providerNetworkIsActive,
        rows[1].cashless,
        rows[1].reimbursement,
      ),
    ).toBe(NETWORK_DISPLAY_STATUS.WATCHLIST);
  });
});

describe("mapNetworkMappingListToGridRows", () => {
  it("keeps bankMatch from API without demo overrides", () => {
    const rows = mapNetworkMappingListToGridRows(
      normalizeProviderNetworkMappingList(SAMPLE_RESPONSE),
    );

    expect(rows[0].bankMatch).toBe("pending");
    expect(rows[0].providerNetworkIsActive).toBe(true);
    expect(rows[1].bankMatch).toBe("pending");
  });
});
