// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import type { DiscountComponentRow } from "../types/discountTypes";
import { DISCOUNT_FORM_DEFAULTS } from "./discountConfig";
import { getDiscountSaveBlockMessage } from "./discountHelpers";

const ZERO_MESSAGE = "Discount percentage must be greater than 0%.";

const baseValues = { ...DISCOUNT_FORM_DEFAULTS, agreementId: "agr-1", ipdEnabled: true };

function componentRow(discountPercent: string): DiscountComponentRow {
  return { id: "comp-x", component: "roomRent", discountPercent, applicableOn: "" };
}

describe("getDiscountSaveBlockMessage – zero discount percentage", () => {
  it("blocks a component discount entered as 0%", () => {
    expect(getDiscountSaveBlockMessage(baseValues, [componentRow("0")])).toBe(ZERO_MESSAGE);
  });

  it("blocks a component discount entered as 0.0%", () => {
    expect(getDiscountSaveBlockMessage(baseValues, [componentRow("0.0")])).toBe(ZERO_MESSAGE);
  });

  it("blocks a bulk discount type configured with 0%", () => {
    const values = {
      ...baseValues,
      bulkDiscountByType: { netBill: { discountPercent: "0", applicableOn: "" } },
    };
    expect(getDiscountSaveBlockMessage(values, [])).toBe(ZERO_MESSAGE);
  });

  it("blocks an OPD subtype percent of 0%", () => {
    expect(
      getDiscountSaveBlockMessage(baseValues, [], undefined, { consultation: "0" }),
    ).toBe(ZERO_MESSAGE);
  });

  it("does not raise the zero message for a percentage greater than 0", () => {
    expect(getDiscountSaveBlockMessage(baseValues, [componentRow("5")])).not.toBe(
      ZERO_MESSAGE,
    );
  });
});
