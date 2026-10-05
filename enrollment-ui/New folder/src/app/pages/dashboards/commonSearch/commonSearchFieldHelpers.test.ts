import { describe, expect, it } from "vitest";
import { getSearchActionsLayout } from "./commonSearchFieldHelpers";

describe("getSearchActionsLayout", () => {
  it("places Reset/Apply in the leftover column on a 4-col last row", () => {
    expect(getSearchActionsLayout(11, 4)).toEqual({
      wraps: false,
      gridClass: "col-span-1 sm:col-span-1 lg:col-span-1",
    });
  });

  it("wraps Reset/Apply to a new row when the last field row is full", () => {
    expect(getSearchActionsLayout(12, 4)).toEqual({
      wraps: true,
      gridClass: "col-span-1 sm:col-span-2 lg:col-span-4",
    });
  });

  it("fills remaining columns when one field sits on the last row", () => {
    expect(getSearchActionsLayout(13, 4)).toEqual({
      wraps: false,
      gridClass: "col-span-1 sm:col-span-1 lg:col-span-3",
    });
  });
});
