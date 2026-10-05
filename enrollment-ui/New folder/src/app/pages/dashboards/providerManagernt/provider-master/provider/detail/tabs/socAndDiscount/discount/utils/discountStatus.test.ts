import { describe, expect, it } from "vitest";
import {
  discountStatusTone,
  formatDiscountStatusLabel,
  normalizeDiscountStatus,
} from "./discountStatus";

describe("discount status helpers", () => {
  it("normalizes to the canonical API value", () => {
    expect(normalizeDiscountStatus(" active ")).toBe("ACTIVE");
    expect(normalizeDiscountStatus("Terminated")).toBe("TERMINATED");
    expect(normalizeDiscountStatus(null)).toBe("");
  });

  it("shows the real status label instead of Complete/Pending", () => {
    expect(formatDiscountStatusLabel("ACTIVE")).toBe("Active");
    expect(formatDiscountStatusLabel("TERMINATED")).toBe("Terminated");
    expect(formatDiscountStatusLabel("EXPIRED")).toBe("Expired");
    expect(formatDiscountStatusLabel("INACTIVE")).toBe("Inactive");
    expect(formatDiscountStatusLabel("DRAFT")).toBe("Draft");
    expect(formatDiscountStatusLabel("")).toBe("—");
  });

  it("title-cases an unknown status rather than dropping it", () => {
    expect(formatDiscountStatusLabel("SUPERSEDED")).toBe("Superseded");
  });

  it("tones active green and terminated/expired red", () => {
    expect(discountStatusTone("ACTIVE")).toContain("green");
    expect(discountStatusTone("TERMINATED")).toContain("red");
    expect(discountStatusTone("EXPIRED")).toContain("red");
    expect(discountStatusTone("WHATEVER")).toContain("slate");
  });
});
