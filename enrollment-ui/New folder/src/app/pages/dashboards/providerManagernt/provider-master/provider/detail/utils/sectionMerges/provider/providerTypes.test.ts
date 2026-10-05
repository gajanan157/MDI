import { describe, expect, it } from "vitest";
import { resolveProviderDetailsFromApi } from "./providerTypes";

describe("resolveProviderDetailsFromApi", () => {
  it("maps provider certificate and contact fields from live API shape", () => {
    const details = resolveProviderDetailsFromApi({
      providerId: "019efe67-834c-7429-b183-df8aa29a8599",
      providerCode: "HO-GU-SUR-000002",
      providerName: "Baps Pramukhswami Hospital",
      providerType: "HOSPITAL",
      recordStatus: "Active",
      providerOfficialMobile: ["9879644144"],
      providerOfficialTelephone: ["0261-2781000"],
      providerOfficialFax: ["42780567"],
      providerOfficialEmail: ["bapsphospital@gmail.com"],
      identifiers: [],
      certificates: [
        {
          providerCertificateId: "019efe68-2a5b-7115-8343-31483878c57e",
          providerCertificateStatus: "Registered",
          providerCertificateTypeName: "Rohini Registration Certificate",
          providerCertificateRegistrationNumber: "8900080098732",
          fileMetadataId: "file-meta-1",
        },
        {
          providerCertificateId: "019efe68-2a5b-71bd-b12b-f96659457b89",
          providerCertificateLevel: "FULL NABH",
          providerCertificateStatus: "Registered",
          providerCertificateTypeName: "NABH Certificate",
          providerCertificateRegistrationNumber: "PEH-2018-0387",
        },
      ],
    });

    expect(details).not.toBeNull();
    expect(details?.certificates).toHaveLength(2);
    expect(details?.certificates[0]).toMatchObject({
      certificateId: "019efe68-2a5b-7115-8343-31483878c57e",
      type: "Rohini Registration Certificate",
      status: "Registered",
      registrationNo: "8900080098732",
      fileMetadataId: "file-meta-1",
    });
    expect(details?.certificates[1]).toMatchObject({
      type: "NABH Certificate",
      providerActName: "FULL NABH",
      registrationNo: "PEH-2018-0387",
    });
    expect(details?.certificates[1].fileMetadataId).toBeUndefined();
    expect(details?.providerContactDetail).toMatchObject({
      providerEmailId: ["bapsphospital@gmail.com"],
      providerTelephoneNo: ["0261-2781000"],
      providerFaxNo: ["42780567"],
      providerMobileNo: ["9879644144"],
    });
  });

  it("maps providerTypeName and providerClinicalSpecialties object rows", () => {
    const details = resolveProviderDetailsFromApi({
      providerId: "b6f6d14f-3f2a-4e8f-a30a-ed0b0047d1cf",
      providerCode: "HO-MH-PUN-000576",
      providerName: "A P S",
      providerTypeId: "019e0710-8b79-7501-8f3a-baaa7a3947fb",
      providerTypeName: "Superspecialty Hospital",
      providerType: "HOSPITAL",
      providerClass: "GEN_HOSP_SUPER",
      recordStatus: "Active",
      identifiers: [],
      providerClinicalSpecialties: [
        {
          providerClinicalSpecialtyId: "019d0f90-0288-7767-9928-601079f0b189",
          providerClinicalSpecialtyName: "Cardiology",
        },
        {
          providerClinicalSpecialtyId: "019d0f90-0288-77fc-a399-7f6b4aef411c",
          providerClinicalSpecialtyName: "Gastroenterology",
        },
        {
          providerClinicalSpecialtyId: "019d0f90-0288-784a-ad71-28da6e1ed214",
          providerClinicalSpecialtyName: "Orthopedics",
        },
      ],
    });

    expect(details).not.toBeNull();
    expect(details?.providerTypeId).toBe("019e0710-8b79-7501-8f3a-baaa7a3947fb");
    expect(details?.providerTypeName).toBe("Superspecialty Hospital");
    expect(details?.clinicalSpecialties).toEqual([
      "Cardiology",
      "Gastroenterology",
      "Orthopedics",
    ]);
    expect(details?.clinicalSpecialtyIds).toEqual([
      "019d0f90-0288-7767-9928-601079f0b189",
      "019d0f90-0288-77fc-a399-7f6b4aef411c",
      "019d0f90-0288-784a-ad71-28da6e1ed214",
    ]);
  });

  it("extracts unique agreement type names from agreements array", () => {
    const details = resolveProviderDetailsFromApi({
      providerId: "930965e3-fa49-4d72-a93f-706e09f5d5b8",
      providerCode: "HO-MH-PUN-000578",
      providerName: "Sunrise Multispeciality Hospital",
      providerType: "HOSPITAL",
      recordStatus: "Active",
      identifiers: [],
      agreements: [
        { providerAgreementName: "INSURER_PROVIDER_BIPARTITE_AGREEMENT" },
        { providerAgreementName: "INSURER_PROVIDER_BIPARTITE_AGREEMENT" },
        { providerAgreementName: "TPA_PROVIDER_BIPARTITE_AGREEMENT" },
        { providerAgreementName: "GIC_STANDARD_AGREEMENT" },
        { providerAgreementName: "GIPSA_PPN_TRIPARTITE_AGREEMENT" },
      ],
    });

    expect(details?.agreementTypeNames).toEqual([
      "INSURER_PROVIDER_BIPARTITE_AGREEMENT",
      "TPA_PROVIDER_BIPARTITE_AGREEMENT",
      "GIC_STANDARD_AGREEMENT",
      "GIPSA_PPN_TRIPARTITE_AGREEMENT",
    ]);
  });

  it("maps providerTpaServicingBranchCityMappingId from root or nested tpaServicingBranch", () => {
    const fromRoot = resolveProviderDetailsFromApi({
      providerId: "e037f381-6564-4e39-86a2-dc2658f8bbb5",
      providerName: "Healix Hospital",
      providerType: "HOSPITAL",
      providerCode: "HO-001",
      recordStatus: "Active",
      identifiers: [],
      providerTpaServicingBranchCityMappingId: "city-mapping-root",
    });
    expect(fromRoot?.providerTpaServicingBranchCityMappingId).toBe("city-mapping-root");

    const fromNested = resolveProviderDetailsFromApi({
      providerId: "e037f381-6564-4e39-86a2-dc2658f8bbb5",
      providerName: "Healix Hospital",
      providerType: "HOSPITAL",
      providerCode: "HO-001",
      recordStatus: "Active",
      identifiers: [],
      tpaServicingBranch: {
        providerTpaServicingBranchCityMappingId: "city-mapping-nested",
      },
    });
    expect(fromNested?.providerTpaServicingBranchCityMappingId).toBe("city-mapping-nested");
  });

  it("maps tpaProviderNetwork and insurerProviderNetwork", () => {
    const details = resolveProviderDetailsFromApi({
      providerId: "af4d57de-bb5e-4e1d-be3a-08a07d359abf",
      providerName: "Nector Superspeciality Center Llp",
      providerType: "HOSPITAL",
      providerCode: "HO-MH-THA-000265",
      recordStatus: "Active",
      identifiers: [],
      providerNetworkType: "NETWORK",
      tpaProviderNetwork: "NON_NETWORK",
      insurerProviderNetwork: "NETWORK",
    });

    expect(details?.providerNetworkType).toBe("NETWORK");
    expect(details?.tpaProviderNetwork).toBe("NON_NETWORK");
    expect(details?.insurerProviderNetwork).toBe("NETWORK");
  });
});
