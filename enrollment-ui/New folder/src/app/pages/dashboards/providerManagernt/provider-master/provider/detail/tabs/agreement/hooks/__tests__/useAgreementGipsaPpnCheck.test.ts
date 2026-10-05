import { describe, expect, it } from "vitest";
import {
  isGipsaPpnValidationPassed,
  isPsuPpnStateValidationPassed,
  isPsuPpnValidationPassed,
} from "../useAgreementGipsaPpnCheck";

describe("isPsuPpnValidationPassed", () => {
  it("returns true when only PPN state is available", () => {
    expect(
      isPsuPpnValidationPassed({
        providerGipsaPpnStateAvailable: true,
        providerGipsaPpnCityAvailable: false,
      }),
    ).toBe(true);
  });

  it("returns false when both PPN state and city are available", () => {
    expect(
      isPsuPpnValidationPassed({
        providerGipsaPpnStateAvailable: true,
        providerGipsaPpnCityAvailable: true,
      }),
    ).toBe(false);
  });

  it("returns false when PPN state is not available", () => {
    expect(
      isPsuPpnValidationPassed({
        providerGipsaPpnStateAvailable: false,
        providerGipsaPpnCityAvailable: false,
      }),
    ).toBe(false);
  });
});

describe("isGipsaPpnValidationPassed", () => {
  it("requires PPN city only", () => {
    expect(
      isGipsaPpnValidationPassed({
        providerGipsaPpnCityAvailable: true,
      }),
    ).toBe(true);
    expect(
      isGipsaPpnValidationPassed({
        providerGipsaPpnCityAvailable: false,
      }),
    ).toBe(false);
  });
});

describe("isPsuPpnStateValidationPassed", () => {
  it("checks state only", () => {
    expect(
      isPsuPpnStateValidationPassed({
        providerGipsaPpnStateAvailable: true,
      }),
    ).toBe(true);
  });
});
