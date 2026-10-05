import { describe, expect, it } from "vitest";
import {
  buildProviderOldCodePayloadFromIdentifiers,
  normalizeProviderDetailIdentifiers,
  pickProviderDetailRohiniCode,
} from "./providerDetailIdentifierNormalizer";

describe("providerDetailIdentifierNormalizer", () => {
  const sampleIdentifiers = [
    {
      identifierTypeName: "ROHINI_CODE",
      identifierValue: "8900080402782",
      identifierStatus: "ACTIVE",
      providerIdentifierId: "rohini-1",
    },
    {
      identifierTypeName: "PROVIDER_CODE",
      identifierValue: "150230021",
      identifierStatus: "ACTIVE",
      providerIdentifierId: "pc-1",
    },
    {
      identifierTypeName: "PAN",
      identifierValue: "ALKPR8541A",
      identifierStatus: "ACTIVE",
      identifierHolderName: "PALLAVI KETAN RANE",
      providerIdentifierId: "pan-1",
    },
  ];

  it("normalizes all identifiers from API array", () => {
    const rows = normalizeProviderDetailIdentifiers(sampleIdentifiers);
    expect(rows).toHaveLength(3);
    expect(rows[0].identifierTypeName).toBe("ROHINI_CODE");
    expect(rows[2].identifierHolderName).toBe("PALLAVI KETAN RANE");
  });

  it("picks Rohini code from identifiers", () => {
    const rows = normalizeProviderDetailIdentifiers(sampleIdentifiers);
    expect(pickProviderDetailRohiniCode(rows)).toBe("8900080402782");
  });

  it("builds provider old code payload from PROVIDER_CODE rows", () => {
    const rows = normalizeProviderDetailIdentifiers(sampleIdentifiers);
    const payload = buildProviderOldCodePayloadFromIdentifiers(rows);
    expect(payload).toContain("150230021");
    expect(payload).toContain("provider_old_code_active_flag");
  });
});
