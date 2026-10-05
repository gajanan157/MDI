import { describe, expect, it } from "vitest";
import {
  isPrivateInsurerType,
  shouldSelectTpaBipartiteFromMapping,
  shouldSkipPpnCheckForHybridInsurerBipartite,
} from "../providerAgreementHelpers";

describe("shouldSelectTpaBipartiteFromMapping", () => {
  it("returns true for TPA source + TPA network mode", () => {
    expect(
      shouldSelectTpaBipartiteFromMapping({
        networkMode: "TPA",
        networkSource: "TPA",
      }),
    ).toBe(true);
  });

  it("returns true for TPA source + hybrid network mode", () => {
    expect(
      shouldSelectTpaBipartiteFromMapping({
        networkMode: "hybrid",
        networkSource: "TPA",
      }),
    ).toBe(true);
  });

  it("returns false for insurer source + hybrid network mode", () => {
    expect(
      shouldSelectTpaBipartiteFromMapping({
        networkMode: "hybrid",
        networkSource: "IC",
      }),
    ).toBe(false);
  });

  it("returns false for TPA source + insurer network mode", () => {
    expect(
      shouldSelectTpaBipartiteFromMapping({
        networkMode: "insurer",
        networkSource: "TPA",
      }),
    ).toBe(false);
  });
});

describe("shouldSkipPpnCheckForHybridInsurerBipartite", () => {
  it("returns true for hybrid + insurer source + private IC", () => {
    expect(
      shouldSkipPpnCheckForHybridInsurerBipartite({
        networkMode: "HYBRID",
        networkSource: "IC",
        insurerType: "PRIVATE",
      }),
    ).toBe(true);
  });

  it("accepts Insurer as network source label", () => {
    expect(
      shouldSkipPpnCheckForHybridInsurerBipartite({
        networkMode: "hybrid",
        networkSource: "Insurer",
        insurerType: "private",
      }),
    ).toBe(true);
  });

  it("returns false for hybrid + TPA source", () => {
    expect(
      shouldSkipPpnCheckForHybridInsurerBipartite({
        networkMode: "hybrid",
        networkSource: "TPA",
        insurerType: "PRIVATE",
      }),
    ).toBe(false);
  });

  it("returns false for hybrid + insurer source + PSU IC", () => {
    expect(
      shouldSkipPpnCheckForHybridInsurerBipartite({
        networkMode: "hybrid",
        networkSource: "IC",
        insurerType: "PSU",
      }),
    ).toBe(false);
  });
});

describe("isPrivateInsurerType", () => {
  it("matches PRIVATE case-insensitively", () => {
    expect(isPrivateInsurerType("private")).toBe(true);
    expect(isPrivateInsurerType("PRIVATE")).toBe(true);
    expect(isPrivateInsurerType("PSU")).toBe(false);
  });
});
