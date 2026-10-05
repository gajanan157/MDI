import { describe, expect, it } from "vitest";
import { formatSocListDuration } from "./socListUtils";

describe("formatSocListDuration", () => {
  it("returns inclusive day count between DD-MM-YYYY dates", () => {
    expect(formatSocListDuration("01-04-2024", "31-03-2025")).toBe("365 days");
  });

  it("returns em dash when dates are invalid", () => {
    expect(formatSocListDuration("", "31-03-2025")).toBe("—");
    expect(formatSocListDuration("01-04-2024", "bad")).toBe("—");
  });

  it("returns em dash when end is before start", () => {
    expect(formatSocListDuration("31-03-2025", "01-04-2024")).toBe("—");
  });
});
