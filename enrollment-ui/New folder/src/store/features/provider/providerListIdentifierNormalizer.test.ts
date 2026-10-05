import { describe, expect, it } from "vitest";
import { normalizeProviderListRohiniIdentifier } from "./providerListIdentifierNormalizer";

describe("normalizeProviderListRohiniIdentifier", () => {
  it("returns ROHINI Registry Code identifierValue and validTo", () => {
    const result = normalizeProviderListRohiniIdentifier([
      {
        identifierTypeName: "ROHINI Registry Code",
        identifierValue: "8900080251225",
        validTo: null,
        isPrimary: true,
      },
    ]);

    expect(result).toEqual({
      identifierValue: "8900080251225",
      validTo: null,
    });
  });

  it("returns ROHINI_CODE identifierValue and validTo", () => {
    const result = normalizeProviderListRohiniIdentifier([
      {
        identifierTypeName: "PROVIDER_CODE",
        identifierValue: "150230021",
        validTo: null,
      },
      {
        identifierTypeName: "ROHINI_CODE",
        identifierValue: "8900080402782",
        validTo: "2026-12-31",
        isPrimary: true,
      },
    ]);

    expect(result).toEqual({
      identifierValue: "8900080402782",
      validTo: "2026-12-31",
    });
  });

  it("returns null when identifiers has no ROHINI_CODE", () => {
    expect(
      normalizeProviderListRohiniIdentifier([
        { identifierTypeName: "PAN", identifierValue: "ALKPR8541A" },
      ]),
    ).toBeNull();
  });

  it("returns null when identifiers is missing or empty", () => {
    expect(normalizeProviderListRohiniIdentifier(undefined)).toBeNull();
    expect(normalizeProviderListRohiniIdentifier([])).toBeNull();
  });
});
