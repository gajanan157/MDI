export type BulkDiscountTypeConfig = {
  discountPercent: string;
  applicableOn: string;
  /** GIPSA package only: PPN vs Non PPN. */
  ppnVariant?: "" | "ppn" | "nonPpn";
};

export type DiscountComponentRow = {
  id: string;
  component: string;
  discountPercent: string;
  applicableOn: string;
};

export type DiscountFormValues = {
  /** Selected provider agreement row id (from list API). */
  agreementId: string;
  agreementName: string;
  agreementType: string;
  /** Linked SOC id (optional). */
  socId: string;
  /** When true, discount applies to all insurers on the agreement. */
  insurerAll: boolean;
  insurerIds: string[];
  /** Insurers used to load corporates when not “all policyholders”. */
  corporateInsurerIds: string[];
  /** Corporate ids keyed by insurer id — keeps IC → corporate mapping. */
  corporateIdsByInsurer: Record<string, string[]>;
  corporateAll: boolean;
  /** One or more discount types (individual, net bill, package, etc.). */
  discountTypes: string[];
  /** Per bulk discount type (net bill, package, approved amount) configuration. */
  bulkDiscountByType: Record<string, BulkDiscountTypeConfig>;
  ppnDiscount: string;
  /** Inclusion codes keyed by discount type (`individual`, `netBill`, `opd`, …). */
  inclusionByType: Record<string, string[]>;
  /** Exclusion codes keyed by discount type. */
  exclusionByType: Record<string, string[]>;
  ipdEnabled: boolean;
  ipdList: string[];
  opdEnabled: boolean;
  opdList: string[];
  additionalDiscountEnabled: boolean;
  additionalDiscountList: string[];
  effectiveFrom: string;
  effectiveTo: string;
  remarks: string;
  supportingDocumentName: string;
  supportingFileMetadataId: string;
};

export type DiscountNamedItem = {
  id: string;
  name: string;
};

export type DiscountCorporateNamedItem = DiscountNamedItem & {
  insurerId: string;
  insurerName: string;
};

export type DiscountSubtypeViewItem = DiscountNamedItem & {
  percent: string;
};

export type DiscountTypeViewGroup = {
  serviceType: string;
  typeKey: string;
  typeName: string;
  percent: string;
  subtypes: DiscountSubtypeViewItem[];
  inclusionItems?: DiscountNamedItem[];
  exclusionItems?: DiscountNamedItem[];
  ppnVariant?: "" | "ppn" | "nonPpn";
  socId?: string;
  socName?: string;
};

export type DiscountDetailRecord = DiscountFormValues & {
  id: string;
  insurerNames: string;
  corporates: string;
  componentDiscounts: DiscountComponentRow[];
  ipdPercentByKey: Record<string, string>;
  opdPercentByKey: Record<string, string>;
  additionalDiscountPercentByKey: Record<string, string>;
  /** Canonical API status (`providerDiscountStatus`), upper-cased — e.g. "ACTIVE", "TERMINATED". */
  status: string;
  createdAt: string;
  updatedAt: string;
  /** Display names from get-by-id; view UI prefers these over option lookups. */
  insurerItems?: DiscountNamedItem[];
  corporateItems?: DiscountCorporateNamedItem[];
  discountTypeGroups?: DiscountTypeViewGroup[];
};

export type DiscountListRow = {
  id: string;
  agreementName: string;
  agreementType: string;
  insuranceCo: string;
  corporate: string;
  discountTypes: string;
  effectiveFrom: string;
  /** Canonical API status (`providerDiscountStatus`), upper-cased — e.g. "ACTIVE", "TERMINATED". */
  status: string;
  /** Preferred over splitting `insuranceCo` when present. */
  insuranceNames?: string[];
  /** Preferred over splitting `corporate` when present. */
  corporateItems?: { name: string; insurerName: string }[];
};

export type DiscountListFilters = {
  agreementName: string;
  agreementType: string;
  insuranceCo: string;
  corporate: string;
  discountTypes: string;
  status: string;
};
