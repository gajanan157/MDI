// src/services/mockDataService.ts
import {
  MOCK_CORPORATE_GROUPS,
  MOCK_CORPORATES,
  MOCK_BROKERS,
  MOCK_AGENTS,
  MOCK_INDUSTRY_SECTORS,
  MOCK_POLICIES,
  MOCK_INWARDS,
  MOCK_STAGE_COUNTS_FOR_ALL_USERS,
  MOCK_STATUS_COUNT,
  MOCK_MEMBER_STATISTICS,
  MOCK_MEMBERS,
  MOCK_FAILED_MEMBERS,
  MOCK_EXCEPTION_SUMMARY,
  MOCK_EXCEPTION_MEMBERS,
  MOCK_DISCREPANCY_MEMBERS,
  MOCK_RECONCILIATION_REPORT,
  MOCK_ECARD_TEMPLATES,
  MOCK_USERS,
} from "./mockEnrollmentData";
import {
  MOCK_DEPARTMENTS,
  MOCK_PROVIDER_INWARDS,
  MOCK_ROHINI_LIST,
  MOCK_PROVIDER_SYSTEM_OF_MEDICINE,
  MOCK_PROVIDER_IDENTIFIER_TYPES,
  MOCK_PROVIDER_TAXONOMY,
  MOCK_NETWORK_MODES,
  MOCK_DISCOUNT_TYPES,
  MOCK_PROVIDER_DETAILS_MAP,
  MOCK_PROVIDER_AGREEMENTS_MAP,
  MOCK_PROVIDER_OWNERS_MAP,
  MOCK_PROVIDER_INFRASTRUCTURE_MAP,
  MOCK_PROVIDER_MANPOWER_MAP,
  MOCK_PROVIDER_FACILITIES_MAP,
  MOCK_PROVIDER_CONTACT_PERSONS_MAP,
  MOCK_PROVIDER_NETWORK_MAPPINGS_MAP,
  MOCK_PROVIDER_BANK_ACCOUNTS_MAP,
  MOCK_PROVIDER_SOC_MAP,
  MOCK_PROVIDER_DISCOUNT_CONFIG_MAP,
} from "./mockProviderData";

export {
  MOCK_CORPORATE_GROUPS,
  MOCK_CORPORATES,
  MOCK_BROKERS,
  MOCK_AGENTS,
  MOCK_INDUSTRY_SECTORS,
  MOCK_POLICIES,
  MOCK_INWARDS,
  MOCK_STAGE_COUNTS_FOR_ALL_USERS,
  MOCK_STATUS_COUNT,
  MOCK_MEMBER_STATISTICS,
  MOCK_MEMBERS,
  MOCK_FAILED_MEMBERS,
  MOCK_EXCEPTION_SUMMARY,
  MOCK_EXCEPTION_MEMBERS,
  MOCK_DISCREPANCY_MEMBERS,
  MOCK_RECONCILIATION_REPORT,
  MOCK_ECARD_TEMPLATES,
  MOCK_USERS,
  MOCK_DEPARTMENTS,
  MOCK_PROVIDER_INWARDS,
  MOCK_ROHINI_LIST,
  MOCK_PROVIDER_SYSTEM_OF_MEDICINE,
  MOCK_PROVIDER_IDENTIFIER_TYPES,
  MOCK_PROVIDER_TAXONOMY,
  MOCK_NETWORK_MODES,
  MOCK_DISCOUNT_TYPES,
  MOCK_PROVIDER_DETAILS_MAP,
  MOCK_PROVIDER_AGREEMENTS_MAP,
  MOCK_PROVIDER_OWNERS_MAP,
  MOCK_PROVIDER_INFRASTRUCTURE_MAP,
  MOCK_PROVIDER_MANPOWER_MAP,
  MOCK_PROVIDER_FACILITIES_MAP,
  MOCK_PROVIDER_CONTACT_PERSONS_MAP,
  MOCK_PROVIDER_NETWORK_MAPPINGS_MAP,
  MOCK_PROVIDER_BANK_ACCOUNTS_MAP,
  MOCK_PROVIDER_SOC_MAP,
  MOCK_PROVIDER_DISCOUNT_CONFIG_MAP,
};

export const MOCK_PROVIDERS_LIST = [
  {
    providerId: "HOSP001",
    providerCode: "MDI-HOSP-001",
    providerName: "Apollo Hospital International",
    providerRohiniCode: "ROH-APO-88912",
    address: "Plot 1A, GIDC Estate, Gandhinagar Highway",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "382428",
    noOfBeds: 350,
    providerType: "HOSPITAL",
    providerNetworkType: "NETWORK",
    globalProviderNetwork: "NETWORK",
    tpaProviderNetwork: "NETWORK",
    insurerProviderNetwork: "NETWORK",
    networkSource: "GIPSA_PPN",
    effectiveFromDate: "2024-01-01",
    effectiveToDate: "2027-12-31",
    nextRenewalDueDate: "2027-11-30",
    status: "ACTIVE",
    email: "contact@apolloahmedabad.com",
    contactNumber: "079-66701800",
  },
  {
    providerId: "HOSP002",
    providerCode: "MDI-HOSP-002",
    providerName: "Fortis Memorial Research Institute",
    providerRohiniCode: "ROH-FOR-77123",
    address: "Sector 44, Opposite HUDA City Centre",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    noOfBeds: 400,
    providerType: "HOSPITAL",
    providerNetworkType: "NETWORK",
    globalProviderNetwork: "NETWORK",
    tpaProviderNetwork: "NETWORK",
    insurerProviderNetwork: "NETWORK",
    networkSource: "DIRECT_AGREEMENT",
    effectiveFromDate: "2023-04-15",
    effectiveToDate: "2026-04-14",
    nextRenewalDueDate: "2026-03-15",
    status: "ACTIVE",
    email: "info@fortishealthcare.com",
    contactNumber: "0124-4962200",
  },
  {
    providerId: "HOSP003",
    providerCode: "MDI-HOSP-003",
    providerName: "Manipal Hospital Old Airport Road",
    providerRohiniCode: "ROH-MAN-99001",
    address: "98, HAL Old Airport Rd, Kodihalli",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560017",
    noOfBeds: 600,
    providerType: "HOSPITAL",
    providerNetworkType: "NETWORK",
    globalProviderNetwork: "NETWORK",
    tpaProviderNetwork: "NETWORK",
    insurerProviderNetwork: "NETWORK",
    networkSource: "GIPSA_PPN",
    effectiveFromDate: "2023-01-01",
    effectiveToDate: "2026-12-31",
    nextRenewalDueDate: "2026-11-15",
    status: "ACTIVE",
    email: "enquiry@manipalhospitals.com",
    contactNumber: "080-25024444",
  },
  {
    providerId: "HOSP004",
    providerCode: "MDI-HOSP-004",
    providerName: "Ruby Hall Clinic Sassoon Road",
    providerRohiniCode: "ROH-RUB-44321",
    address: "40, Sassoon Road, Sangamvadi",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    noOfBeds: 550,
    providerType: "HOSPITAL",
    providerNetworkType: "NETWORK",
    globalProviderNetwork: "NETWORK",
    tpaProviderNetwork: "NETWORK",
    insurerProviderNetwork: "NETWORK",
    networkSource: "DIRECT_AGREEMENT",
    effectiveFromDate: "2024-03-01",
    effectiveToDate: "2027-02-28",
    nextRenewalDueDate: "2027-01-15",
    status: "ACTIVE",
    email: "info@rubyhall.com",
    contactNumber: "020-66455100",
  },
  {
    providerId: "HOSP005",
    providerCode: "MDI-HOSP-005",
    providerName: "Max Super Speciality Hospital Saket",
    providerRohiniCode: "ROH-MAX-55678",
    address: "1, 2, Press Enclave Marg, Saket",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110017",
    noOfBeds: 500,
    providerType: "HOSPITAL",
    providerNetworkType: "NETWORK",
    globalProviderNetwork: "NETWORK",
    tpaProviderNetwork: "NETWORK",
    insurerProviderNetwork: "NETWORK",
    networkSource: "GIPSA_PPN",
    effectiveFromDate: "2024-06-01",
    effectiveToDate: "2027-05-31",
    nextRenewalDueDate: "2027-04-15",
    status: "ACTIVE",
    email: "saket@maxhealthcare.com",
    contactNumber: "011-26515050",
  },
  {
    providerId: "HOSP006",
    providerCode: "MDI-HOSP-006",
    providerName: "Kokilaben Dhirubhai Ambani Hospital",
    providerRohiniCode: "ROH-KOK-11234",
    address: "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400053",
    noOfBeds: 750,
    providerType: "HOSPITAL",
    providerNetworkType: "NETWORK",
    globalProviderNetwork: "NETWORK",
    tpaProviderNetwork: "NETWORK",
    insurerProviderNetwork: "NETWORK",
    networkSource: "GIPSA_PPN",
    effectiveFromDate: "2023-08-01",
    effectiveToDate: "2026-07-31",
    nextRenewalDueDate: "2026-06-15",
    status: "ACTIVE",
    email: "info@kdah.com",
    contactNumber: "022-42696969",
  },
  {
    providerId: "HOSP007",
    providerCode: "MDI-HOSP-007",
    providerName: "Care Hospital Banjara Hills",
    providerRohiniCode: "ROH-CAR-33211",
    address: "Road No. 1, Prem Nagar, Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500034",
    noOfBeds: 435,
    providerType: "HOSPITAL",
    providerNetworkType: "NETWORK",
    globalProviderNetwork: "NETWORK",
    tpaProviderNetwork: "NETWORK",
    insurerProviderNetwork: "NETWORK",
    networkSource: "DIRECT_AGREEMENT",
    effectiveFromDate: "2024-02-15",
    effectiveToDate: "2027-02-14",
    nextRenewalDueDate: "2027-01-20",
    status: "ACTIVE",
    email: "info@carehospitals.com",
    contactNumber: "040-61656565",
  },
  {
    providerId: "HOSP008",
    providerCode: "MDI-HOSP-008",
    providerName: "Deenanath Mangeshkar Hospital",
    providerRohiniCode: "ROH-DMH-12345",
    address: "Near Mhatre Bridge, Erandwane",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411004",
    noOfBeds: 800,
    providerType: "HOSPITAL",
    providerNetworkType: "NETWORK",
    globalProviderNetwork: "NETWORK",
    tpaProviderNetwork: "NETWORK",
    insurerProviderNetwork: "NETWORK",
    networkSource: "DIRECT_AGREEMENT",
    effectiveFromDate: "2023-11-01",
    effectiveToDate: "2026-10-31",
    nextRenewalDueDate: "2026-09-30",
    status: "ACTIVE",
    email: "info@dmhospital.org",
    contactNumber: "020-40151000",
  }
];

export const MOCK_INSURERS = [
  {
    id: "INS001",
    insurerCode: "NICL",
    insurerName: "National Insurance Company Limited",
    companyType: "PUBLIC",
    irdaiRegNo: "048",
    cinNumber: "U10200WB1906GOI001713",
    email: "customer.support@nic.co.in",
    tollFreeNo: "1800 345 0330",
    headOfficeCity: "Kolkata",
    status: "ACTIVE",
  },
  {
    id: "INS002",
    insurerCode: "NIA",
    insurerName: "The New India Assurance Co. Ltd.",
    companyType: "PUBLIC",
    irdaiRegNo: "190",
    cinNumber: "L66000MH1919GOI000526",
    email: "support@newindia.co.in",
    tollFreeNo: "1800 209 1415",
    headOfficeCity: "Mumbai",
    status: "ACTIVE",
  },
  {
    id: "INS003",
    insurerCode: "OICL",
    insurerName: "The Oriental Insurance Company Limited",
    companyType: "PUBLIC",
    irdaiRegNo: "556",
    cinNumber: "U66010DL1947GOI007158",
    email: "service@orientalinsurance.co.in",
    tollFreeNo: "1800 118 485",
    headOfficeCity: "New Delhi",
    status: "ACTIVE",
  },
  {
    id: "INS004",
    insurerCode: "UIIC",
    insurerName: "United India Insurance Company Limited",
    companyType: "PUBLIC",
    irdaiRegNo: "545",
    cinNumber: "U93090TN1938GOI000108",
    email: "customercare@uiic.co.in",
    tollFreeNo: "1800 425 33333",
    headOfficeCity: "Chennai",
    status: "ACTIVE",
  },
  {
    id: "INS005",
    insurerCode: "STAR",
    insurerName: "Star Health and Allied Insurance Co. Ltd.",
    companyType: "PRIVATE",
    irdaiRegNo: "129",
    cinNumber: "L66010TN2006PLC060280",
    email: "support@starhealth.in",
    tollFreeNo: "1800 425 2255",
    headOfficeCity: "Chennai",
    status: "ACTIVE",
  },
  {
    id: "INS006",
    insurerCode: "ICICI",
    insurerName: "ICICI Lombard General Insurance Co. Ltd.",
    companyType: "PRIVATE",
    irdaiRegNo: "115",
    cinNumber: "L67200MH2000PLC129408",
    email: "customersupport@icicilombard.com",
    tollFreeNo: "1800 2666",
    headOfficeCity: "Mumbai",
    status: "ACTIVE",
  },
];

export const MOCK_STATES = [
  { id: "MH", stateCode: "MH", stateName: "Maharashtra" },
  { id: "DL", stateCode: "DL", stateName: "Delhi" },
  { id: "KA", stateCode: "KA", stateName: "Karnataka" },
  { id: "GJ", stateCode: "GJ", stateName: "Gujarat" },
  { id: "TN", stateCode: "TN", stateName: "Tamil Nadu" },
  { id: "TS", stateCode: "TS", stateName: "Telangana" },
  { id: "HR", stateCode: "HR", stateName: "Haryana" },
  { id: "WB", stateCode: "WB", stateName: "West Bengal" },
];

export const MOCK_CITIES = [
  { id: "PUN", cityCode: "PUN", cityName: "Pune", stateCode: "MH" },
  { id: "MUM", cityCode: "MUM", cityName: "Mumbai", stateCode: "MH" },
  { id: "NGP", cityCode: "NGP", cityName: "Nagpur", stateCode: "MH" },
  { id: "DEL", cityCode: "DEL", cityName: "New Delhi", stateCode: "DL" },
  { id: "BLR", cityCode: "BLR", cityName: "Bengaluru", stateCode: "KA" },
  { id: "AMD", cityCode: "AMD", cityName: "Ahmedabad", stateCode: "GJ" },
  { id: "CHE", cityCode: "CHE", cityName: "Chennai", stateCode: "TN" },
  { id: "HYD", cityCode: "HYD", cityName: "Hyderabad", stateCode: "TS" },
  { id: "GUR", cityCode: "GUR", cityName: "Gurugram", stateCode: "HR" },
  { id: "KOL", cityCode: "KOL", cityName: "Kolkata", stateCode: "WB" },
];

export const MOCK_MASTER_PRODUCTS = [
  {
    id: "PROD001",
    productUin: "NICHLIP21001V012021",
    productName: "National Parivar Mediclaim Plus Policy",
    insurerName: "National Insurance Company Limited",
    productType: "GROUP_HEALTH",
    status: "APPROVED",
    version: "2.1",
    effectiveFrom: "2024-04-01",
  },
  {
    id: "PROD002",
    productUin: "NIAHLIP22003V022022",
    productName: "New India Premier Mediclaim Policy",
    insurerName: "The New India Assurance Co. Ltd.",
    productType: "RETAIL_HEALTH",
    status: "APPROVED",
    version: "1.4",
    effectiveFrom: "2023-10-01",
  },
  {
    id: "PROD003",
    productUin: "STARHLIP23005V012023",
    productName: "Star Comprehensive Health Insurance Plan",
    insurerName: "Star Health and Allied Insurance Co. Ltd.",
    productType: "TOP_UP",
    status: "PENDING_APPROVAL",
    version: "1.0",
    effectiveFrom: "2024-01-01",
  },
];

export const MOCK_TPA_BRANCHES = [
  { id: "BR001", tpaBranchId: "BR001", branchCode: "MDI-PUN-HO", branchName: "Pune-HO", name: "Pune-HO", city: "Pune", state: "Maharashtra", isHeadOffice: true },
  { id: "BR002", tpaBranchId: "BR002", branchCode: "MDI-MUM-RO", branchName: "MD India Mumbai Regional Office", name: "MD India Mumbai Regional Office", city: "Mumbai", state: "Maharashtra", isHeadOffice: false },
  { id: "BR003", tpaBranchId: "BR003", branchCode: "MDI-DEL-RO", branchName: "MD India Delhi Regional Office", name: "MD India Delhi Regional Office", city: "New Delhi", state: "Delhi", isHeadOffice: false },
  { id: "BR004", tpaBranchId: "BR004", branchCode: "MDI-BLR-RO", branchName: "MD India Bengaluru Branch", name: "MD India Bengaluru Branch", city: "Bengaluru", state: "Karnataka", isHeadOffice: false },
];

/**
 * Universal helper wrapping list data into whatever envelope the Redux slices expect
 */
const MOCK_USER_GROUPS = [
  "Corporate-Enrolment-Admin",
  "Corporate-Enrolment-Processor",
  "Corporate-Enrolment-QC",
  "Corporate-Endorsement-Processor",
  "Corporate-Endorsement-QC",
].map((name, index) => ({
  id: `GRP-MOCK-${index + 1}`,
  groupName: name,
  name,
  description: null,
  path: `/${name}`,
  parentId: null,
  subGroupCount: 0,
  subGroups: [],
}));

function wrapList(items: any[], extra: Record<string, any> = {}) {
  return {
    success: true,
    data: {
      data: items,
      content: items,
      records: items,
      items: items,
      totalElements: items.length,
      totalRecords: items.length,
      totalPages: 1,
      page: 1,
      size: items.length,
      pagination: {
        totalRecords: items.length,
        totalPages: 1,
        currentPage: 0,
        page: 1,
        size: items.length,
      },
      ...extra,
    },
    message: "Success (Mock Mode)",
  };
}

/**
 * Universal helper wrapping single objects / stats dictionaries
 */
function wrapData(payload: any) {
  return {
    success: true,
    data: {
      data: payload,
      ...(typeof payload === "object" && payload !== null && !Array.isArray(payload) ? payload : {}),
    },
    message: "Success (Mock Mode)",
  };
}

/**
 * Universal Mock Dispatcher matching incoming API routes to dummy data
 */
export function getMockApiResponse(url: string, method: string = "GET", _body?: unknown): any {
  const cleanUrl = url.toLowerCase();

  // 0. User-service groups. This must run first: a members URL such as
  // "api/v1/groups/Corporate-Enrolment-QC/members" also contains "corporate".
  const groupsMatch = cleanUrl.match(/api\/v1\/groups(?:\/([^/?]+)\/members)?(?:[?#]|$)/);
  if (groupsMatch) {
    if (groupsMatch[1]) {
      // Group names map to role names, e.g. Corporate-Enrolment-QC -> corporate_enrolment_qc
      const role = decodeURIComponent(groupsMatch[1]).replace(/-/g, "_");
      const members = MOCK_USERS.filter((u: any) => u.role === role);
      return wrapList(members.length ? members : MOCK_USERS);
    }
    return wrapList(MOCK_USER_GROUPS);
  }

  // 1. Enrollment Progress polling
  if (cleanUrl.includes("progress")) {
    return wrapData({
      status: "COMPLETED",
      percentage: 100,
      remainingTimeInSeconds: 0,
    });
  }

  // 2. Stage counts for All Users (Workflow)
  if (cleanUrl.includes("stage-count")) {
    return wrapData(MOCK_STAGE_COUNTS_FOR_ALL_USERS);
  }

  // 3. Status Count for Corporate Inward (OCR / WorkFlow)
  if (cleanUrl.includes("status-count")) {
    return wrapData(MOCK_STATUS_COUNT);
  }

  // 4. Member Data Statistics & Endorsement Statistics
  if (cleanUrl.includes("statistic") || cleanUrl.includes("endorsementstat")) {
    return wrapData(MOCK_MEMBER_STATISTICS);
  }

  // 5. Member Exceptions Summary
  if (cleanUrl.includes("exceptions/summary")) {
    return wrapList(MOCK_EXCEPTION_SUMMARY);
  }

  // 6. Member Exceptions List
  if (cleanUrl.includes("exception")) {
    return wrapList(MOCK_EXCEPTION_MEMBERS);
  }

  // 7. Member Discrepancies
  if (cleanUrl.includes("discrepanc")) {
    return wrapList(MOCK_DISCREPANCY_MEMBERS);
  }

  // 8. Reconciliation Report & Error Log
  if (cleanUrl.includes("reconciliation-report")) {
    return wrapList(MOCK_RECONCILIATION_REPORT);
  }

  // 9. Member Endorsement Details
  if (cleanUrl.includes("endorsementdetail")) {
    return wrapList(MOCK_MEMBERS);
  }

  // 10. Member Search & Member Data
  if (cleanUrl.includes("/v1/member") || cleanUrl.includes("/v1/members")) {
    if (cleanUrl.includes("fail") || cleanUrl.includes("validation_failed")) {
      return wrapList(MOCK_FAILED_MEMBERS);
    }
    return wrapList(MOCK_MEMBERS);
  }

  // 11. Corporate Groups
  if (cleanUrl.includes("corporate-group")) {
    return wrapList(MOCK_CORPORATE_GROUPS);
  }

  // 12. Industry Sectors Dropdown
  if (cleanUrl.includes("industry-sector") || (cleanUrl.includes("sector") && cleanUrl.includes("dropdown"))) {
    return wrapList(MOCK_INDUSTRY_SECTORS);
  }

  // 13. Corporates Master List
  if (cleanUrl.includes("corporate")) {
    return wrapList(MOCK_CORPORATES);
  }

  // 14. Brokers Master
  if (cleanUrl.includes("broker")) {
    return wrapList(MOCK_BROKERS);
  }

  // 15. Agents Master
  if (cleanUrl.includes("agent")) {
    return wrapList(MOCK_AGENTS);
  }

  // 16. Policies & Policy Search
  if (cleanUrl.includes("polic")) {
    if (cleanUrl.includes("dropdown")) {
      const dropdownItems = MOCK_POLICIES.map((p) => ({
        label: `${p.policyNumber} - ${p.policy.corporateName}`,
        value: p.policyId,
        ...p,
      }));
      return wrapList(dropdownItems);
    }
    return wrapList(MOCK_POLICIES);
  }

  // 17. Corporate Enrollment Inwards (Workflow / OCR)
  if (cleanUrl.includes("ocr") || cleanUrl.includes("workflow")) {
    return wrapList(MOCK_INWARDS);
  }

  // 18. Provider Management Inwards (`v1/files/inwards`)
  if (cleanUrl.includes("files/inwards") || cleanUrl.includes("inward")) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const todayPrefix = `${yyyy}-${mm}-${dd}`;

    let list = MOCK_PROVIDER_INWARDS.map((i, index) => {
      if (i.isToday) {
        const times = ["09:30:00", "10:45:00", "11:20:00", "14:15:00"];
        const timePart = times[index % times.length];
        const dateIso = `${todayPrefix}T${timePart}`;
        return {
          ...i,
          inwardReceivedAt: dateIso,
          createdAt: dateIso,
        };
      }
      return i;
    });

    // Filter by status if query parameter present
    if (cleanUrl.includes("status=processor_pending")) {
      list = list.filter((i) => i.status === "PROCESSOR_PENDING");
    } else if (cleanUrl.includes("status=qc_pending")) {
      list = list.filter((i) => i.status === "QC_PENDING");
    } else if (cleanUrl.includes("status=completed")) {
      list = list.filter((i) => i.status === "COMPLETED");
    } else if (
      cleanUrl.includes("status=rejected_inward") ||
      cleanUrl.includes("status=rejected")
    ) {
      list = list.filter((i) => i.status === "REJECTED_INWARD");
    }

    // Filter by date range (e.g. activeCard === "TODAY")
    if (cleanUrl.includes("fromdate=") && cleanUrl.includes("todate=")) {
      list = list.filter((i) => i.isToday);
    }

    return wrapList(list);
  }

  // 19. E-Card Templates & Names
  if (cleanUrl.includes("ecard")) {
    if (cleanUrl.includes("name")) {
      const names = MOCK_ECARD_TEMPLATES.map((t) => ({
        label: t.templateName,
        value: t.templateId,
        ...t,
      }));
      return wrapList(names);
    }
    return wrapList(MOCK_ECARD_TEMPLATES);
  }

  // 20. Escalation Matrix Departments (critical for Provider Inward resolution)
  if (cleanUrl.includes("departments") || cleanUrl.includes("escalation-matrix")) {
    return wrapList(MOCK_DEPARTMENTS);
  }

  // 21. ROHINI Hospital Master
  if (cleanUrl.includes("rohini")) {
    return wrapList(MOCK_ROHINI_LIST, {
      additionalData: {
        countExpiringInDays: 1,
        inwardNos: ["INW-2024-PRV-001", "INW-2024-PRV-002"],
      },
    });
  }

  // 22. Provider Masters (Medicine Systems, Identifier Types, Taxonomy, Modes, Discounts)
  if (cleanUrl.includes("system-of-medicine")) {
    return wrapList(MOCK_PROVIDER_SYSTEM_OF_MEDICINE);
  }
  if (cleanUrl.includes("identifier-type")) {
    return wrapList(MOCK_PROVIDER_IDENTIFIER_TYPES);
  }
  if (cleanUrl.includes("taxonomy")) {
    return wrapList(MOCK_PROVIDER_TAXONOMY);
  }
  if (cleanUrl.includes("network-mode")) {
    return wrapList(MOCK_NETWORK_MODES);
  }
  if (cleanUrl.includes("discount-type") || cleanUrl.includes("discount-subtype")) {
    return wrapList(MOCK_DISCOUNT_TYPES);
  }

  // 23. User Management / Staff
  if (cleanUrl.includes("user") && !cleanUrl.includes("insurer")) {
    return wrapList(MOCK_USERS);
  }

  // 24. Providers Detail, Sub-Resources, & Listing
  if (cleanUrl.includes("provider") || cleanUrl.includes("hospital")) {
    if (method !== "GET") {
      return {
        success: true,
        data: {
          id: "MOCK-" + Math.floor(Math.random() * 90000 + 10000),
          status: "SUCCESS",
          updatedAt: new Date().toISOString(),
          ...(typeof _body === "object" && _body !== null ? _body : {}),
        },
        message: "Operation completed successfully (Mock Mode)",
      };
    }

    // Extract providerId from URL if present
    const idMatch = url.match(/\/v1\/providers?\/([^/?#]+)/i);
    const queryIdMatch = url.match(/[?&]providerId=([^&#]+)/i);
    const rawId = (queryIdMatch ? queryIdMatch[1] : (idMatch ? idMatch[1] : "HOSP001")).toUpperCase();
    const providerId = (rawId in MOCK_PROVIDER_DETAILS_MAP) ? rawId : "HOSP001";

    // 24.1 PPN State & City checks
    if (cleanUrl.includes("check-ppn-state-city")) {
      return {
        success: true,
        data: {
          isPpnAvailable: true,
          stateId: "ST-GJ",
          stateName: "Gujarat",
          cityId: "CT-AHM",
          cityName: "Ahmedabad",
        },
      };
    }
    if (cleanUrl.includes("provider-gipsa-ppn-state")) {
      return wrapList(MOCK_STATES.map((s) => ({ label: s.name, value: s.id })));
    }
    if (cleanUrl.includes("provider-gipsa-ppn-city")) {
      return wrapList(MOCK_CITIES.map((c) => ({ label: c.name, value: c.id })));
    }

    // 24.2 Bank IFSC Validation & Bank Account
    if (cleanUrl.includes("validate-bank-ifsc")) {
      return {
        success: true,
        data: {
          IFSC: "HDFC0000123",
          BANK: "HDFC Bank Ltd",
          BRANCH: "Gandhinagar Highway",
        },
      };
    }
    if (cleanUrl.includes("bank-account")) {
      const bank = MOCK_PROVIDER_BANK_ACCOUNTS_MAP[providerId] || MOCK_PROVIDER_BANK_ACCOUNTS_MAP["HOSP001"];
      return {
        success: true,
        data: [bank],
      };
    }

    // 24.3 Infrastructure, Manpower, Facility
    if (cleanUrl.includes("infrastructure")) {
      const infra = MOCK_PROVIDER_INFRASTRUCTURE_MAP[providerId] || MOCK_PROVIDER_INFRASTRUCTURE_MAP["HOSP001"];
      return wrapData(infra);
    }
    if (cleanUrl.includes("manpower")) {
      const manpower = MOCK_PROVIDER_MANPOWER_MAP[providerId] || MOCK_PROVIDER_MANPOWER_MAP["HOSP001"];
      return wrapData(manpower);
    }
    if (cleanUrl.includes("facility")) {
      const facility = MOCK_PROVIDER_FACILITIES_MAP[providerId] || MOCK_PROVIDER_FACILITIES_MAP["HOSP001"];
      return wrapData(facility);
    }

    // 24.4 Owner & Contact Persons
    if (cleanUrl.includes("owner")) {
      const owners = MOCK_PROVIDER_OWNERS_MAP[providerId] || MOCK_PROVIDER_OWNERS_MAP["HOSP001"];
      return wrapList(owners);
    }
    if (cleanUrl.includes("contact-person") || cleanUrl.includes("contact-persons")) {
      const contacts = MOCK_PROVIDER_CONTACT_PERSONS_MAP[providerId] || MOCK_PROVIDER_CONTACT_PERSONS_MAP["HOSP001"];
      return wrapList(contacts);
    }

    // 24.5 Network Mapping & Restrictions
    if (cleanUrl.includes("network-mapping")) {
      const mappings = MOCK_PROVIDER_NETWORK_MAPPINGS_MAP[providerId] || MOCK_PROVIDER_NETWORK_MAPPINGS_MAP["HOSP001"];
      return wrapList(mappings);
    }
    if (cleanUrl.includes("provider-restriction")) {
      return wrapList([]);
    }

    // 24.6 Agreement
    if (cleanUrl.includes("agreement")) {
      const agrs = MOCK_PROVIDER_AGREEMENTS_MAP[providerId] || MOCK_PROVIDER_AGREEMENTS_MAP["HOSP001"];
      return wrapList(agrs);
    }

    // 24.7 SOC & Discount Configuration
    if (cleanUrl.includes("/soc")) {
      const socs = MOCK_PROVIDER_SOC_MAP[providerId] || MOCK_PROVIDER_SOC_MAP["HOSP001"];
      return wrapList(socs);
    }
    if (cleanUrl.includes("configuration")) {
      const configs = MOCK_PROVIDER_DISCOUNT_CONFIG_MAP[providerId] || MOCK_PROVIDER_DISCOUNT_CONFIG_MAP["HOSP001"];
      return wrapList(configs);
    }

    // 24.8 Identifiers
    if (cleanUrl.includes("identifier")) {
      return wrapList(MOCK_PROVIDER_IDENTIFIER_TYPES);
    }

    // 24.9 Provider Single Hospital Details (Overview Tab)
    if (cleanUrl.includes("/details")) {
      const details = MOCK_PROVIDER_DETAILS_MAP[providerId] || MOCK_PROVIDER_DETAILS_MAP["HOSP001"];
      return {
        success: true,
        data: details,
      };
    }

    // 24.10 Full Providers List (Default)
    return wrapList(MOCK_PROVIDERS_LIST, {
      additionalData: {
        countExpiringInDays: 2,
      },
    });
  }

  // 25. Insurers List & Offices
  if (cleanUrl.includes("insurer")) {
    return wrapList(MOCK_INSURERS);
  }

  // 26. States & Cities
  if (cleanUrl.includes("state")) {
    return { success: true, data: MOCK_STATES };
  }
  if (cleanUrl.includes("city")) {
    return { success: true, data: MOCK_CITIES };
  }

  // 27. Master Products & MBM
  if (cleanUrl.includes("master-product") || cleanUrl.includes("product")) {
    return wrapList(MOCK_MASTER_PRODUCTS);
  }

  // 28. TPA & Branches
  if (cleanUrl.includes("tpa") || cleanUrl.includes("branch")) {
    return wrapList(MOCK_TPA_BRANCHES);
  }

  // 29. Generic Fallback for GET queries
  if (method === "GET") {
    return wrapList([]);
  }

  // 30. Mutations (POST / PUT / PATCH / DELETE)
  return {
    success: true,
    data: {
      id: "MOCK-" + Math.floor(Math.random() * 90000 + 10000),
      status: "SUCCESS",
      updatedAt: new Date().toISOString(),
    },
    message: "Operation completed successfully (Mock Mode)",
  };
}
