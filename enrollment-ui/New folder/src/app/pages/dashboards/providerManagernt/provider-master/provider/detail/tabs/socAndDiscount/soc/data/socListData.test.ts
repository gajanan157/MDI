import { describe, expect, it } from "vitest";
import {
  NEW_SOC_INTERNAL_ID,
  SOC_LIST_ROWS,
  encodeSocRouteSegmentFromInternalId,
  filterSocRows,
  resolveSocIdFromRouteParam,
} from "./socListData";
import type { DiscountListRow } from "../../discount/types/discountTypes";
import { filterDiscountRows } from "../../discount/utils/discountHelpers";

const DISCOUNT_LIST_FIXTURE: DiscountListRow[] = [
  {
    id: "disc-1",
    agreementName: "Insurer – Provider Bipartite Agreement",
    agreementType: "Bipartite",
    insuranceCo: "HDFC ERGO",
    corporate: "Corp A",
    discountTypes: "Net Bill",
    effectiveFrom: "2026-01-15",
    status: "Complete",
  },
  {
    id: "disc-2",
    agreementName: "TPA – Provider Bipartite Agreement",
    agreementType: "Bipartite",
    insuranceCo: "Oriental",
    corporate: "MSCI",
    discountTypes: "Individual",
    effectiveFrom: "2026-03-01",
    status: "Pending",
  },
];

describe("filterSocRows", () => {
  it("returns all rows when filters are empty", () => {
    expect(
      filterSocRows(SOC_LIST_ROWS, {
        socIdVersion: "",
        socName: "",
        applicableIcs: "",
        status: "",
      }),
    ).toHaveLength(SOC_LIST_ROWS.length);
  });

  it("filters by SOC ID / version text", () => {
    const rows = filterSocRows(SOC_LIST_ROWS, {
      socIdVersion: "SOC-002",
      socName: "",
      applicableIcs: "",
      status: "",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("soc-002");
  });

  it("filters by status", () => {
    const rows = filterSocRows(SOC_LIST_ROWS, {
      socIdVersion: "",
      socName: "",
      applicableIcs: "",
      status: "Inactive",
    });
    expect(rows.every((row) => row.status === "Inactive")).toBe(true);
  });
});

describe("filterDiscountRows (standalone module)", () => {
  it("returns all rows when filters are empty", () => {
    expect(
      filterDiscountRows(DISCOUNT_LIST_FIXTURE, {
        agreementName: "",
        agreementType: "",
        insuranceCo: "",
        corporate: "",
        discountTypes: "",
        status: "",
      }),
    ).toHaveLength(DISCOUNT_LIST_FIXTURE.length);
  });

  it("filters by complete status", () => {
    const rows = filterDiscountRows(DISCOUNT_LIST_FIXTURE, {
      agreementName: "",
      agreementType: "",
      insuranceCo: "",
      corporate: "",
      discountTypes: "",
      status: "Complete",
    });
    expect(rows.every((row) => row.status === "Complete")).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });
});

describe("resolveSocIdFromRouteParam", () => {
  it("resolves known route param formats", () => {
    expect(resolveSocIdFromRouteParam("new")).toBe(NEW_SOC_INTERNAL_ID);
    expect(resolveSocIdFromRouteParam("soc-001")).toBe("soc-001");
    expect(resolveSocIdFromRouteParam("SOC-001 / V1")).toBe("soc-001");
    expect(resolveSocIdFromRouteParam("SOC-002/V2")).toBe("soc-002");
    expect(resolveSocIdFromRouteParam("SOC-003 - V1")).toBe("soc-003");
    expect(
      resolveSocIdFromRouteParam("fd012ebd-2106-4328-bf55-08437f6a30bf"),
    ).toBe("fd012ebd-2106-4328-bf55-08437f6a30bf");
  });

  it("returns null for unknown or malformed params", () => {
    expect(resolveSocIdFromRouteParam(undefined)).toBeNull();
    expect(resolveSocIdFromRouteParam("")).toBeNull();
    expect(resolveSocIdFromRouteParam("SOC-999 / V1")).toBeNull();
    expect(resolveSocIdFromRouteParam("SOC-001V1")).toBeNull();
  });

  it("rejects oversized params without hanging", () => {
    const oversized = `SOC-001${" ".repeat(200)} / V1`;
    expect(resolveSocIdFromRouteParam(oversized)).toBeNull();
  });
});

describe("encodeSocRouteSegmentFromInternalId", () => {
  it("normalizes SOC version spacing for route segments", () => {
    expect(encodeSocRouteSegmentFromInternalId("soc-001")).toBe(
      encodeURIComponent("SOC-001 / V1"),
    );
  });

  it("falls back to encoding the raw id when unknown", () => {
    expect(encodeSocRouteSegmentFromInternalId("unknown-id")).toBe(
      encodeURIComponent("unknown-id"),
    );
  });
});
