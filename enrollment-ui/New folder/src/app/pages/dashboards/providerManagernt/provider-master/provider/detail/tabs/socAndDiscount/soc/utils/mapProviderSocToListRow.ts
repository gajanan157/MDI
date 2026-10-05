import type { NormalizedProviderSoc } from "@/store/features/providerSoc/providerSocTypes";
import type { SocApplicableIc, SocDetailRecord, SocListRow } from "../data/socListData";

export function mapProviderSocToListRow(row: NormalizedProviderSoc): SocListRow {
  return {
    id: row.providerSocId,
    socIdVersion: row.socIdVersion || row.socName || row.providerSocId,
    socName: row.socName,
    applicableIcs: row.applicableIcs,
    lastUpdatedOn: row.lastUpdatedOn,
    startDate: row.effectiveFrom,
    endDate: row.effectiveTo,
    status: row.status,
  };
}

function toApplicableIcs(row: NormalizedProviderSoc): SocApplicableIc[] {
  return row.insurerMappings.map((mapping) => ({
    insurerId: mapping.insurerId,
    insurerName: mapping.insurerName,
    effectiveFrom: mapping.effectiveFrom || row.effectiveFrom,
  }));
}

export function mapProviderSocToDetail(row: NormalizedProviderSoc): SocDetailRecord {
  const applicableIcs = toApplicableIcs(row);
  return {
    id: row.providerSocId,
    socIdVersion: row.socIdVersion || row.socName || row.providerSocId,
    socName: row.socName,
    agreementName: row.providerAgreementName,
    gipsaSocVariant: "",
    applicableIcsSummary: row.applicableIcs || (applicableIcs.length ? applicableIcs.map((item) => item.insurerName).join(", ") : "—"),
    applicableIcs,
    lastUpdatedOn: row.lastUpdatedOn,
    startDate: row.effectiveFrom,
    endDate: row.effectiveTo,
    versionHistory: row.fileMetadataId
      ? [
          {
            id: row.fileMetadataId,
            name: row.socName || row.socIdVersion || "SOC document",
            url: row.downloadUrl,
            active: true,
          },
        ]
      : [],
    discountType: "",
    discountCategories: [],
    ppnDiscount: "",
    billInclusion: [],
    billExclusion: [],
    opdEnabled: false,
    opdList: [],
    ipdEnabled: false,
    ipdList: [],
    additionalDiscountEnabled: false,
    additionalDiscountList: [],
    tatForDiscount: "",
    discountApplicableOn: "",
    effectiveFrom: row.effectiveFrom,
    remarks: "",
    discountPercentByCategory: {},
    opdPercentByKey: {},
    ipdPercentByKey: {},
    additionalDiscountPercentByKey: {},
  };
}

export function mapProviderSocToDropdownOption(row: NormalizedProviderSoc): {
  value: string;
  label: string;
} {
  return {
    value: row.providerSocId,
    label: row.socName || row.socIdVersion || row.providerSocId,
  };
}
