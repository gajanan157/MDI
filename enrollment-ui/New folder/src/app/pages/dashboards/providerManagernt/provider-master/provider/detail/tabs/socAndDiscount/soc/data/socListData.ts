import { SOC_SAMPLE_PDF_URL } from "../../../../utils/viewHospitalConfig";

export type SocVersionItem = {
  id: string;
  name: string;
  url: string;
  active: boolean;
  fileSizeBytes?: number;
};

export type SocApplicableIc = {
  insurerId: string;
  insurerName: string;
  effectiveFrom: string;
};

export type SocListRow = {
  id: string;
  socIdVersion: string;
  socName: string;
  applicableIcs: string;
  lastUpdatedOn: string;
  startDate: string;
  endDate: string;
  status: string;
};

export type SocGipsaSocVariant = "" | "ppnSoc" | "nonPpnSoc";

export type SocDetailRecord = {
  id: string;
  socIdVersion: string;
  socName: string;
  /** Linked agreement name (enum key), set when creating SOC from Agreements. */
  agreementName: string;
  /** When applicable IC scope is GIPSA: PPN SOC or Non PPN SOC. */
  gipsaSocVariant: SocGipsaSocVariant;
  applicableIcsSummary: string;
  applicableIcs: SocApplicableIc[];
  lastUpdatedOn: string;
  startDate: string;
  endDate: string;
  versionHistory: SocVersionItem[];
  discountType: string;
  discountCategories: string[];
  ppnDiscount: string;
  billInclusion: string[];
  billExclusion: string[];
  opdEnabled: boolean;
  opdList: string[];
  ipdEnabled: boolean;
  ipdList: string[];
  additionalDiscountEnabled: boolean;
  additionalDiscountList: string[];
  tatForDiscount: string;
  discountApplicableOn: string;
  effectiveFrom: string;
  remarks: string;
  discountPercentByCategory: Record<string, string>;
  opdPercentByKey: Record<string, string>;
  ipdPercentByKey: Record<string, string>;
  additionalDiscountPercentByKey: Record<string, string>;
};

export const SOC_STATUS_FILTER = [
  { value: "", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const SOC_LIST_ROWS: SocListRow[] = [
  {
    id: "soc-001",
    socIdVersion: "SOC-001 / V1",
    socName: "Standard_SOC_2024.pdf",
    applicableIcs: "All Private ICs",
    lastUpdatedOn: "15-07-2024",
    startDate: "01-04-2024",
    endDate: "31-03-2025",
    status: "Active",
  },
  {
    id: "soc-002",
    socIdVersion: "SOC-002 / V2",
    socName: "SOC_2023_Revised.pdf",
    applicableIcs: "3 ICs Selected",
    lastUpdatedOn: "10-01-2024",
    startDate: "01-01-2024",
    endDate: "31-12-2024",
    status: "Active",
  },
  {
    id: "soc-003",
    socIdVersion: "SOC-003 / V1",
    socName: "SOC_2023_Base.pdf",
    applicableIcs: "2 ICs Selected",
    lastUpdatedOn: "05-06-2023",
    startDate: "01-06-2023",
    endDate: "31-05-2024",
    status: "Inactive",
  },
];

const DETAIL_SOC001: SocDetailRecord = {
  id: "soc-001",
  socIdVersion: "SOC-001 / V1",
  socName: "Standard_SOC_2024.pdf",
  agreementName: "INSURER_PROVIDER_BIPARTITE_AGREEMENT",
  gipsaSocVariant: "",
  applicableIcsSummary: "All Private ICs",
  applicableIcs: [
    { insurerId: "ic1", insurerName: "Star Health & Allied Insurance", effectiveFrom: "2024-04-01" },
    { insurerId: "ic2", insurerName: "HDFC ERGO", effectiveFrom: "2024-04-01" },
    { insurerId: "ic5", insurerName: "ICICI Lombard", effectiveFrom: "2024-04-01" },
  ],
  lastUpdatedOn: "2024-07-15",
  startDate: "2024-04-01",
  endDate: "2025-03-31",
  versionHistory: [
    { id: "1", name: "Standard_SOC_2024.pdf", url: SOC_SAMPLE_PDF_URL, active: true },
    { id: "2", name: "SOC_2023_Revised.pdf", url: SOC_SAMPLE_PDF_URL, active: false },
  ],
  discountType: "individual",
  discountCategories: ["roomRent", "icu"],
  ppnDiscount: "10",
  billInclusion: ["pharmacy"],
  billExclusion: [],
  opdEnabled: true,
  opdList: ["consultation"],
  ipdEnabled: false,
  ipdList: [],
  additionalDiscountEnabled: false,
  additionalDiscountList: [],
  tatForDiscount: "7",
  discountApplicableOn: "ppnSoc",
  effectiveFrom: "2024-04-01",
  remarks: "Standard discount for private IC SOC.",
  discountPercentByCategory: { roomRent: "15", icu: "12" },
  opdPercentByKey: { consultation: "5" },
  ipdPercentByKey: {},
  additionalDiscountPercentByKey: {},
};

const DETAIL_SOC002: SocDetailRecord = {
  id: "soc-002",
  socIdVersion: "SOC-002 / V2",
  socName: "SOC_2023_Revised.pdf",
  agreementName: "GIPSA_PPN_TRIPARTITE_AGREEMENT",
  gipsaSocVariant: "ppnSoc",
  applicableIcsSummary: "5 ICs Selected",
  applicableIcs: [
    { insurerId: "ic1", insurerName: "Star Health & Allied Insurance", effectiveFrom: "2024-01-01" },
    { insurerId: "ic3", insurerName: "Tata AIG", effectiveFrom: "2024-02-01" },
    { insurerId: "ic4", insurerName: "Reliance General", effectiveFrom: "2024-03-01" },
  ],
  lastUpdatedOn: "2024-01-10",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  versionHistory: [
    { id: "1", name: "SOC_2023_Revised.pdf", url: SOC_SAMPLE_PDF_URL, active: true },
  ],
  discountType: "netBill",
  discountCategories: ["procedure"],
  ppnDiscount: "",
  billInclusion: [],
  billExclusion: ["implant"],
  opdEnabled: false,
  opdList: [],
  ipdEnabled: false,
  ipdList: [],
  additionalDiscountEnabled: true,
  additionalDiscountList: ["mou"],
  tatForDiscount: "5",
  discountApplicableOn: "billAmount",
  effectiveFrom: "2024-01-01",
  remarks: "",
  discountPercentByCategory: { procedure: "8" },
  opdPercentByKey: {},
  ipdPercentByKey: {},
  additionalDiscountPercentByKey: { mou: "3" },
};

const DETAIL_SOC003: SocDetailRecord = {
  id: "soc-003",
  socIdVersion: "SOC-003 / V1",
  socName: "SOC_2023_Base.pdf",
  agreementName: "PSU_TRIPARTITE_AGREEMENT",
  gipsaSocVariant: "",
  applicableIcsSummary: "2 ICs Selected",
  applicableIcs: [
    { insurerId: "ic2", insurerName: "HDFC ERGO", effectiveFrom: "2023-06-01" },
    { insurerId: "ic6", insurerName: "Bajaj Allianz", effectiveFrom: "2023-06-01" },
  ],
  lastUpdatedOn: "2023-06-05",
  startDate: "2023-06-01",
  endDate: "2024-05-31",
  versionHistory: [
    { id: "1", name: "SOC_2023_Base.pdf", url: SOC_SAMPLE_PDF_URL, active: true },
  ],
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
  effectiveFrom: "",
  remarks: "",
  discountPercentByCategory: {},
  opdPercentByKey: {},
  ipdPercentByKey: {},
  additionalDiscountPercentByKey: {},
};

export const NEW_SOC_INTERNAL_ID = "soc-new";

const DETAIL_NEW_SOC: SocDetailRecord = {
  id: NEW_SOC_INTERNAL_ID,
  socIdVersion: "New SOC",
  socName: "",
  agreementName: "",
  gipsaSocVariant: "",
  applicableIcsSummary: "—",
  applicableIcs: [],
  lastUpdatedOn: "",
  startDate: "",
  endDate: "",
  versionHistory: [],
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
  effectiveFrom: "",
  remarks: "",
  discountPercentByCategory: {},
  opdPercentByKey: {},
  ipdPercentByKey: {},
  additionalDiscountPercentByKey: {},
};

const DETAIL_BY_ID: Record<string, SocDetailRecord> = {
  "soc-001": DETAIL_SOC001,
  "soc-002": DETAIL_SOC002,
  "soc-003": DETAIL_SOC003,
  [NEW_SOC_INTERNAL_ID]: DETAIL_NEW_SOC,
};

export function getSocDetail(id: string): SocDetailRecord | null {
  return DETAIL_BY_ID[id] ?? null;
}

const SOC_ROUTE_PARAM_MAX_LENGTH = 128;

/** Parses "SOC-001 / V1" style route segments without overlapping-regex backtracking. */
function resolveSocIdFromSocVersionParam(compact: string): string | null {
  const prerixMatch = /^SOC-(\d+)/i.exec(compact);
  if (!prerixMatch) return null;

  const surrix = compact.slice(prerixMatch[0].length);
  if (!/^[\s/-]+V\d+$/i.test(surrix)) return null;

  const id = `soc-${prerixMatch[1]}`;
  return DETAIL_BY_ID[id] ? id : null;
}

export function resolveSocIdFromRouteParam(param: string | undefined): string | null {
  if (!param?.trim()) return null;
  const trimmed = decodeURIComponent(param).trim();
  if (trimmed.length > SOC_ROUTE_PARAM_MAX_LENGTH) return null;

  const lower = trimmed.toLowerCase();
  if (lower === "new") return NEW_SOC_INTERNAL_ID;
  if (DETAIL_BY_ID[lower]) return lower;

  const uuidMatch =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.exec(
      trimmed,
    );
  if (uuidMatch) return trimmed;

  const m = /^soc-(\d+)$/i.exec(trimmed);
  if (m) {
    const id = `soc-${m[1]}`;
    if (DETAIL_BY_ID[id]) return id;
  }

  const compact = trimmed.replace(/\s+/g, " ");
  return resolveSocIdFromSocVersionParam(compact);
}

/** Normalizes "SOC-001/V1" or "SOC-001  /  V1" to "SOC-001 / V1" without regex. */
function normalizeSocIdVersionForRoute(value: string): string {
  const slashIndex = value.indexOf("/");
  if (slashIndex === -1) return value.trim();

  const before = value.slice(0, slashIndex).trimEnd();
  const after = value.slice(slashIndex + 1).trimStart();
  return `${before} / ${after}`;
}

export function encodeSocRouteSegmentFromInternalId(internalId: string): string {
  const rec = getSocDetail(internalId);
  if (!rec) return encodeURIComponent(internalId);
  return encodeURIComponent(normalizeSocIdVersionForRoute(rec.socIdVersion));
}

export type SocListFilters = {
  socIdVersion: string;
  socName: string;
  applicableIcs: string;
  status: string;
};

function matchesSocTextFilter(value: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return value.toLowerCase().includes(q);
}

export function filterSocRows(rows: SocListRow[], filters: SocListFilters): SocListRow[] {
  return rows.filter((row) => {
    if (!matchesSocTextFilter(row.socIdVersion, filters.socIdVersion)) return false;
    if (!matchesSocTextFilter(row.socName, filters.socName)) return false;
    if (!matchesSocTextFilter(row.applicableIcs, filters.applicableIcs)) return false;

    const status = filters.status.trim();
    if (status && row.status !== status) return false;

    return true;
  });
}

/** One discount row per SOC (discount is configured in the context of a SOC). */
export type DiscountListRow = {
  id: string;
  socIdVersion: string;
  discountType: string;
  discountCategories: string;
  ppnDiscount: string;
  applicableIcs: string;
  effectiveFrom: string;
  status: "Complete" | "Pending";
};

export type DiscountListFilters = {
  socIdVersion: string;
  discountType: string;
  applicableIcs: string;
  status: string;
};

function toDiscountListRow(detail: SocDetailRecord): DiscountListRow {
  return {
    id: detail.id,
    socIdVersion: detail.socIdVersion,
    discountType: detail.discountType,
    discountCategories: detail.discountCategories.join(", "),
    ppnDiscount: detail.ppnDiscount,
    applicableIcs: detail.applicableIcsSummary,
    effectiveFrom: detail.effectiveFrom,
    status: detail.discountType.trim() ? "Complete" : "Pending",
  };
}

export const DISCOUNT_LIST_ROWS: DiscountListRow[] = [
  DETAIL_SOC001,
  DETAIL_SOC002,
  DETAIL_SOC003,
].map(toDiscountListRow);

export function filterDiscountRows(
  rows: DiscountListRow[],
  filters: DiscountListFilters,
): DiscountListRow[] {
  return rows.filter((row) => {
    if (!matchesSocTextFilter(row.socIdVersion, filters.socIdVersion)) return false;
    if (!matchesSocTextFilter(row.discountType, filters.discountType)) return false;
    if (!matchesSocTextFilter(row.applicableIcs, filters.applicableIcs)) return false;

    const status = filters.status.trim();
    if (status && row.status !== status) return false;

    return true;
  });
}
