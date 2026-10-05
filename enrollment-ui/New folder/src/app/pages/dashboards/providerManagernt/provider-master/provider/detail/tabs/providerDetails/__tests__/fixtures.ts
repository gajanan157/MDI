import type { ProviderDetailsFromApi } from "../../../utils/providerDetailSectionMerges";
import { buildProviderFormValues } from "../helpers";

const defaultClinicalSpecialtyOptions = [{ label: "Cardiology", value: "spec-1" }];

/** Minimal provider-details fixture for Provider Details tab tests. */
export function createProviderDetailsFromApi(
  overrides: Partial<ProviderDetailsFromApi> = {},
): ProviderDetailsFromApi {
  return {
    providerId: "provider-1",
    providerName: "City General Hospital",
    providerType: "HOSPITAL",
    providerCode: "HSP001",
    providerIibRohiniCode: "ROH001",
    providerOldCode: JSON.stringify([
      { provider_old_code: "OLD-001", provider_old_code_active_flag: true },
    ]),
    recordStatus: "Active",
    providerIsVerified: true,
    providerOwnershipType: "Private",
    providerCareTier: "Tertiary",
    providerInternalGrade: "Grade A",
    providerOwnerName: "Admin User",
    providerOwnerDesignation: "Director",
    providerSignatoryName: "Admin User",
    providerSignatoryDesignation: "Director",
    providerSystemOfMedicineName: "Allopathy",
    providerSystemOfMedicineId: "medicine-allopathy",
    providerEmpanellmentId: "empanel-1",
    providerTpaServicingBranchId: "branch-1",
    providerTpaServicingBranchName: "Pune-HO",
    providerServiceEmailId: "service@cityhospital.com",
    tpaServicingBranchName: "Pune-HO",
    tpaServicingBranchEmail: ["service@cityhospital.com"],
    providerTpaServicingBranchCityMappingId: "city-mapping-1",
    providerAddress: "123 Main Street",
    providerCity: "Mumbai",
    providerDistrict: "Mumbai",
    providerStateName: "Maharashtra",
    providerZone: "West",
    providerPostalCode: "400001",
    providerRegistrationNo: "REG-001",
    providerRegistrationAuthority: "Clinical Establishments Act",
    providerContactDetail: {
      providerWebsiteAvailableFlag: true,
      providerWebsiteUrl: "www.cityhospital.com",
      providerTelephoneNo: ["022-12345678"],
      providerFaxNo: ["022-87654321"],
      providerMobileNo: ["9876543210"],
      providerEmailId: ["admin@cityhospital.com"],
    },
    clinicalSpecialties: ["Cardiology"],
    identifiers: [],
    certificates: [
      {
        certificateId: "cert-1",
        type: "NABH",
        status: "Registered",
        registrationNo: "NABH-123",
        validFrom: "2024-01-01",
        validTo: "2026-01-01",
        providerActName: "",
      },
    ],
    ...overrides,
  };
}

/** Form values aligned with what useProviderDetailsForms loads from API state. */
export function createProviderDetailsFormValues(
  providerDetails: ProviderDetailsFromApi,
  clinicalSpecialtyOptions = defaultClinicalSpecialtyOptions,
) {
  const { general, contact, certs } = buildProviderFormValues(
    providerDetails,
    clinicalSpecialtyOptions,
  );
  return { general, contact, certs };
}
