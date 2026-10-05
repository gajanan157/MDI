/** Certificate row from GET `/v1/provider/{id}/details` — drives dynamic Certificates card in view mode. */
export interface ProviderDetailCertificate {
  certificateId?: string;
  type: string;
  description?: string;
  status?: string;
  validFrom?: string;
  validTo?: string;
  registrationNo?: string;
  /** Act / authority name from API (`providerActName`). */
  providerActName?: string;
  providerActDescription?: string;
  fileMetadataId?: string;
}

/** Infrastructure block from provider details API — drives dynamic Infrastructure card in view mode. */
export interface ProviderDetailInfrastructure {
  totalBedCount?: number;
  roomDetailList: Array<{
    providerBedTypeName?: string;
    providerBedCount?: number;
  }>;
}

export interface HospitalRecord {
  id: string;
  hospitalName: string;
  hospitalCode: string;
  rohiniCode: string;
  registrationValidTill: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  location: string;
  status: string;
  providerCode: string;
  isActive: boolean;
   city?: string;
  state?: string;
  /** Rohini registration effective end date (network list API `effectiveToDate`). */
  effectiveToDate?: string | null;
  nextRenewalDueDate?: string | null;
}

/** One row from GET `/v1/provider/{id}/contact-person` — same field names as API. */
export interface ProviderContactPersonDetail {
  providerContactPersonId?: string;
  tenantId?: string;
  providerId?: string;
  providerContactPersonRole?: string;
  providerContactPersonRoleId?: string;
  providerContactPersonPrefix?: string | null;
  providerContactPersonFirstName?: string | null;
  providerContactPersonMiddleName?: string | null;
  providerContactPersonLastName?: string | null;
  providerContactPersonFullName?: string;
  providerContactPersonDesignation?: string;
  providerContactPersonTelephoneNo?: string | string[];
  providerContactPersonMobileNo?: string | string[];
  providerContactPersonEmailId?: string | string[];
  providerContactPersonDateOfBirth?: string | null;
  providerContactPersonGender?: string | null;
  providerContactPersonAddress?: string | null;
  providerContactPersonState?: string | null;
  providerContactPersonCity?: string | null;
  providerContactPersonPincode?: string | null;
  recordStatus?: string;
}

/** One legacy provider code row from `providerOldCode` JSON (camelCase in UI). */
export interface ProviderOldCodeRow {
  code: string;
  active: boolean;
}

/** Extended fields for hospital detail view (Provider & General, Contact, Infrastructure) */
export interface HospitalDetailRecord extends HospitalRecord {
  irdaCode?: string;
  rohiniStatus?: string;
  category?: string;
  grade?: string;
  hospType?: string;
  type1?: string;
  type2?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  zone?: string;
  pinCode?: string;
  locationType?: string;
  cityType?: string;
  nabhStatus?: string;
  nabhEffectiveFrom?: string;
  nabhEffectiveTill?: string;
  nabhRegistration?: string;
  /** Registration number (correct spelling) */
  registrationNumber?: string;
  registrationAct?: string;
  ownershipType?: string;
  careTier?: string;
  /** BWC (Building & Works Compensation) information */
  bwcCertificateAvailable?: string;
  bwcStartDate?: string;
  bwcEndDate?: string;
  /** MSME information */
  msmeRegistrationNumber?: string;
  msmeCategory?: string;
  systemOfMedicine?: string;
  clinicalSpecialties?: string;
  stdCode?: string;
  telNo?: string;
  faxNo?: string;
  mobNo?: string;
  isWebsiteAvailable?: boolean;
  websiteUrl?: string;
  totalBeds?: number;
  icuBeds?: number;
  ccuBeds?: number;
  twinSharing?: number;
  suite?: number;
  labourRooms?: number;
  generalBeds?: number;
  singleBeds?: number;
  nicuBeds?: number;
  majorOt?: number;
  minorOt?: number;
  /** Owner's Information */
  ownerName?: string;
  ownerDesignation?: string;
  /** Provider owner (API may use these keys instead of ownerName / ownerDesignation). */
  providerOwnerName?: string;
  providerOwnerDesignation?: string;
  /** Authorized signatory from GET provider details (`providerSignatoryName` / `providerSignatoryDesignation`). */
  providerSignatoryName?: string;
  providerSignatoryDesignation?: string;
  ownerQualification?: string;
  panNo?: string;
  panHolderName?: string;
  tanNo?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  /** Primary contact person */
  primaryContactName?: string;
  primaryContactDesignation?: string;
  primaryContactMobile?: string;
  primaryContactTelephone?: string;
  primaryContactEmail?: string;
  /**
   * GET `/v1/provider/{id}/contact-person` — `data[]` rows (view: one card per person).
   * When present (including `[]`), drives Contact Persons tab; omit for legacy single-field display.
   */
  providerContactPersons?: ProviderContactPersonDetail[];
  /** Bank details */
  accountType?: string;
  accountHolderType?: string;
  bankName?: string;
  bankBranch?: string;
  ifscCode?: string;
  micrCode?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankAddress?: string;
  cancelledChequeUrl?: string;
  /** From GET `/bank-account` */
  bankSwiftCode?: string;
  bankUpiId?: string;
  bankVerificationStatus?: string;
  bankKycStatus?: string;
  bankKycVerifiedAt?: string;
  /** Bank account row status (e.g. Active) */
  bankRecordStatus?: string;
  bankIsPrimary?: string;
  bankIsActive?: string;
  bankVerifiedAt?: string;
  bankVerifiedBy?: string;
  /** When status is De-paneled or Cashless on hold: IC(s) by which provider is blacklisted / on hold */
  blacklistedByIcNames?: string[];
  /** Parsed from API `providerOldCode` JSON string — legacy codes with active flag per row. */
  providerOldCodes?: ProviderOldCodeRow[];
  /** Populated from API `certificates[]` when present — view mode renders list dynamically. */
  providerDetailCertificates?: ProviderDetailCertificate[];
  /** Populated from API `infrastructure` when present — view mode renders beds dynamically. */
  providerDetailInfrastructure?: ProviderDetailInfrastructure;
}

/**
 * Fallback local list used by legacy/non-network screens.
 * Network provider listing is API-driven, so keeping this empty is safe.
 */
export const hospitalMainList: HospitalRecord[] = [
  {
    id: "HOSP001",
    hospitalName: "Apollo Hospital International",
    hospitalCode: "MDI-HOSP-001",
    providerCode: "MDI-HOSP-001",
    rohiniCode: "ROH-APO-88912",
    registrationValidTill: "31/12/2027",
    contactPerson: "Dr. Anil Kumar Sharma",
    contactPhone: "079-66701800",
    contactEmail: "contact@apolloahmedabad.com",
    location: "Ahmedabad, Gujarat",
    status: "ACTIVE",
    isActive: true,
    city: "Ahmedabad",
    state: "Gujarat",
    effectiveToDate: "2027-12-31",
    nextRenewalDueDate: "2027-11-30",
  },
  {
    id: "HOSP002",
    hospitalName: "Fortis Memorial Research Institute",
    hospitalCode: "MDI-HOSP-002",
    providerCode: "MDI-HOSP-002",
    rohiniCode: "ROH-FOR-77123",
    registrationValidTill: "14/04/2026",
    contactPerson: "Dr. Ashutosh Raghuvanshi",
    contactPhone: "0124-4962200",
    contactEmail: "info@fortishealthcare.com",
    location: "Gurugram, Haryana",
    status: "ACTIVE",
    isActive: true,
    city: "Gurugram",
    state: "Haryana",
    effectiveToDate: "2026-04-14",
    nextRenewalDueDate: "2026-03-15",
  },
  {
    id: "HOSP003",
    hospitalName: "Manipal Hospital Old Airport Road",
    hospitalCode: "MDI-HOSP-003",
    providerCode: "MDI-HOSP-003",
    rohiniCode: "ROH-MAN-99001",
    registrationValidTill: "31/12/2026",
    contactPerson: "Dr. H. Sudarshan Ballal",
    contactPhone: "080-25024444",
    contactEmail: "info@manipalhospitals.com",
    location: "Bengaluru, Karnataka",
    status: "ACTIVE",
    isActive: true,
    city: "Bengaluru",
    state: "Karnataka",
    effectiveToDate: "2026-12-31",
    nextRenewalDueDate: "2026-11-30",
  },
  {
    id: "HOSP004",
    hospitalName: "Ruby Hall Clinic Sassoon Road",
    hospitalCode: "MDI-HOSP-004",
    providerCode: "MDI-HOSP-004",
    rohiniCode: "ROH-RUB-44321",
    registrationValidTill: "28/02/2027",
    contactPerson: "Dr. Purvez Grant",
    contactPhone: "020-66455100",
    contactEmail: "info@rubyhall.com",
    location: "Pune, Maharashtra",
    status: "ACTIVE",
    isActive: true,
    city: "Pune",
    state: "Maharashtra",
    effectiveToDate: "2027-02-28",
    nextRenewalDueDate: "2027-01-31",
  },
  {
    id: "HOSP005",
    hospitalName: "Max Super Speciality Hospital Saket",
    hospitalCode: "MDI-HOSP-005",
    providerCode: "MDI-HOSP-005",
    rohiniCode: "ROH-MAX-55678",
    registrationValidTill: "31/05/2027",
    contactPerson: "Dr. Abhay Soi",
    contactPhone: "011-26515050",
    contactEmail: "info@maxhealthcare.com",
    location: "New Delhi, Delhi",
    status: "ACTIVE",
    isActive: true,
    city: "New Delhi",
    state: "Delhi",
    effectiveToDate: "2027-05-31",
    nextRenewalDueDate: "2027-04-30",
  },
];

/** Optional per-provider local detail overrides for legacy fallback. */
const detailOverrides: Record<string, Partial<HospitalDetailRecord>> = {
  HOSP001: {
    irdaCode: "IRDA-HSP-0001",
    rohiniStatus: "ACTIVE",
    category: "Multi Specialty",
    grade: "Grade A",
    hospType: "Private",
    type1: "Tertiary Care",
    type2: "Super Speciality",
    address: "Plot 1A, GIDC Estate, Gandhinagar Highway",
    city: "Ahmedabad",
    district: "Gandhinagar",
    state: "Gujarat",
    zone: "West",
    pinCode: "382428",
    locationType: "Metro",
    cityType: "Metro",
    nabhStatus: "Registered",
    registrationNumber: "REG-GJ-2018-9921",
    registrationAct: "Gujarat State Health Systems Resource Centre",
    ownershipType: "Private",
    careTier: "Tertiary",
    systemOfMedicine: "Allopathy",
    clinicalSpecialties: "Cardiology, Neurology, Oncology, Orthopedics, Nephrology",
    stdCode: "079",
    telNo: "66701800",
    faxNo: "079-66701805",
    mobNo: "9876543210",
    isWebsiteAvailable: true,
    websiteUrl: "https://www.apollohospitals.com/ahmedabad",
    totalBeds: 350,
    icuBeds: 40,
    ccuBeds: 15,
    twinSharing: 70,
    suite: 20,
    labourRooms: 6,
    generalBeds: 160,
    singleBeds: 45,
    nicuBeds: 15,
    majorOt: 8,
    minorOt: 4,
    ownerName: "Dr. Prathap C. Reddy",
    ownerDesignation: "Executive Chairman",
    providerOwnerName: "Dr. Prathap C. Reddy",
    providerOwnerDesignation: "Executive Chairman",
    ownerQualification: "MD, FRCS (Cardiology)",
    panNo: "AAACA1234F",
    panHolderName: "Apollo Hospitals Enterprise Ltd",
    tanNo: "AHMA12345B",
    signatoryName: "Dr. Suneeta Reddy",
    signatoryDesignation: "Managing Director",
    primaryContactName: "Dr. Anil Kumar Sharma",
    primaryContactDesignation: "Medical Superintendent",
    primaryContactMobile: "9825012345",
    primaryContactTelephone: "079-66701810",
    primaryContactEmail: "dr.anil.sharma@apollohospitals.com",
    accountType: "CURRENT",
    accountHolderType: "HOSPITAL",
    bankName: "HDFC Bank Ltd",
    bankBranch: "Gandhinagar Highway Branch",
    ifscCode: "HDFC0000123",
    micrCode: "380240002",
    accountHolderName: "Apollo Hospitals Enterprise Ltd",
    accountNumber: "50200012345678",
    bankAddress: "Plot 1A, GIDC Estate, Gandhinagar Highway, Ahmedabad - 382428",
    providerOldCodes: [
      { code: "OLD-APO-991", active: true },
      { code: "LEG-APO-012", active: false },
    ],
    providerContactPersons: [
      {
        providerContactPersonId: "CP-001",
        providerId: "HOSP001",
        providerContactPersonRole: "Medical Superintendent",
        providerContactPersonFullName: "Dr. Anil Kumar Sharma",
        providerContactPersonDesignation: "Medical Superintendent & Chief of Staff",
        providerContactPersonTelephoneNo: ["079-66701810"],
        providerContactPersonMobileNo: ["9825012345"],
        providerContactPersonEmailId: ["dr.anil.sharma@apollohospitals.com"],
        recordStatus: "ACTIVE",
      },
      {
        providerContactPersonId: "CP-002",
        providerId: "HOSP001",
        providerContactPersonRole: "TPA & Insurance Desk Manager",
        providerContactPersonFullName: "Bhavin Mehta",
        providerContactPersonDesignation: "Head - Corporate Relations & TPA Helpdesk",
        providerContactPersonTelephoneNo: ["079-66701820"],
        providerContactPersonMobileNo: ["9825123456"],
        providerContactPersonEmailId: ["tpa.desk.ahmedabad@apollohospitals.com"],
        recordStatus: "ACTIVE",
      },
      {
        providerContactPersonId: "CP-003",
        providerId: "HOSP001",
        providerContactPersonRole: "Billing & Accounts In-Charge",
        providerContactPersonFullName: "Neha P. Patel",
        providerContactPersonDesignation: "Senior Manager - Hospital Billing & Settlement",
        providerContactPersonTelephoneNo: ["079-66701830"],
        providerContactPersonMobileNo: ["9825234567"],
        providerContactPersonEmailId: ["billing.settlements@apollohospitals.com"],
        recordStatus: "ACTIVE",
      },
    ],
    providerDetailCertificates: [
      {
        certificateId: "CERT-001",
        type: "NABH",
        description: "Full NABH Hospital Accreditation Tier-1",
        status: "Registered",
        validFrom: "2021-04-01",
        validTo: "2027-03-31",
        registrationNo: "NABH-2021-0891",
        providerActName: "National Accreditation Board for Hospitals",
      },
      {
        certificateId: "CERT-002",
        type: "FIRE_SAFETY",
        description: "Fire NOC & Life Safety Clearance",
        status: "Registered",
        validFrom: "2023-01-01",
        validTo: "2026-12-31",
        registrationNo: "FS-GJ-2023-4412",
        providerActName: "National Building Code - Fire Safety Division",
      },
      {
        certificateId: "CERT-003",
        type: "POLLUTION_CONTROL",
        description: "Bio-Medical Waste Management Authorization",
        status: "Registered",
        validFrom: "2022-06-01",
        validTo: "2027-05-31",
        registrationNo: "PCB-BMW-8819",
        providerActName: "Gujarat Pollution Control Board",
      },
    ],
    providerDetailInfrastructure: {
      totalBedCount: 350,
      roomDetailList: [
        { providerBedTypeName: "General Ward", providerBedCount: 160 },
        { providerBedTypeName: "Semi-Private / Twin Sharing", providerBedCount: 70 },
        { providerBedTypeName: "Single Private Room", providerBedCount: 45 },
        { providerBedTypeName: "Intensive Care Unit (ICU)", providerBedCount: 40 },
        { providerBedTypeName: "Neonatal ICU (NICU)", providerBedCount: 15 },
        { providerBedTypeName: "Deluxe Suite", providerBedCount: 20 },
      ],
    },
  },
};



export function getHospitalDetail(id: string): HospitalDetailRecord | null {
  if (hospitalMainList.length === 0) {
    return null;
  }
  const base = hospitalMainList.find((h) => h.id === id);
  if (!base) return null;
  const overrides = detailOverrides[id] ?? {};
  const [city, state] = (base.location ?? "").split(",").map((s) => s.trim());
  const stdCode = base.contactPhone?.match(/^\d{2,4}/)?.[0] ?? "";
  const telNo =
    base.contactPhone?.replace(/^\d{2,4}-?/, "") ?? base.contactPhone ?? "";
  return {
    ...base,
    irdaCode:
      overrides.irdaCode ?? `IRDA-HSP-${base.hospitalCode?.slice(-4) ?? id}`,
    rohiniStatus: overrides.rohiniStatus ?? base.status,
    category: overrides.category ?? "Multi Specialty",
    grade: overrides.grade ?? "Grade A",
    hospType: overrides.hospType ?? "Private",
    type1: overrides.type1 ?? "Tertiary Care",
    type2: overrides.type2 ?? "—",
    address: overrides.address ?? base.location,
    city: overrides.city ?? city,
    district: overrides.district ?? city,
    state: overrides.state ?? state,
    zone: overrides.zone ?? "—",
    pinCode: overrides.pinCode ?? "—",
    locationType: overrides.locationType ?? "—",
    cityType: overrides.cityType ?? "Metro",
    nabhStatus: overrides.nabhStatus ?? "—",
    registrationNumber: overrides.registrationNumber ?? "—",
    registrationAct: overrides.registrationAct ?? "—",
    ownershipType: overrides.ownershipType ?? "—",
    careTier: overrides.careTier ?? "—",
    systemOfMedicine: overrides.systemOfMedicine ?? "—",
    clinicalSpecialties: overrides.clinicalSpecialties ?? "—",
    stdCode: overrides.stdCode ?? stdCode,
    telNo: overrides.telNo ?? telNo,
    faxNo: overrides.faxNo ?? "—",
    mobNo: overrides.mobNo ?? "—",
    isWebsiteAvailable: overrides.isWebsiteAvailable ?? false,
    websiteUrl: overrides.websiteUrl ?? "—",
    totalBeds: overrides.totalBeds ?? 100,
    icuBeds: overrides.icuBeds ?? 10,
    ccuBeds: overrides.ccuBeds ?? 5,
    twinSharing: overrides.twinSharing ?? 20,
    suite: overrides.suite ?? 5,
    labourRooms: overrides.labourRooms ?? 2,
    majorOt: overrides.majorOt ?? 3,
    minorOt: overrides.minorOt ?? 2,
    ownerName: overrides.ownerName ?? base.contactPerson,
    ownerDesignation: overrides.ownerDesignation ?? "—",
    providerOwnerName: overrides.providerOwnerName ?? overrides.ownerName ?? base.contactPerson,
    providerOwnerDesignation: overrides.providerOwnerDesignation ?? overrides.ownerDesignation ?? "—",
    ownerQualification: overrides.ownerQualification ?? "—",
    panNo: overrides.panNo ?? "—",
    panHolderName: overrides.panHolderName ?? base.hospitalName,
    tanNo: overrides.tanNo ?? "—",
    signatoryName: overrides.signatoryName ?? base.contactPerson,
    signatoryDesignation: overrides.signatoryDesignation ?? "—",
    primaryContactName: overrides.primaryContactName ?? base.contactPerson,
    primaryContactDesignation: overrides.primaryContactDesignation ?? "—",
    primaryContactMobile: overrides.primaryContactMobile ?? "—",
    primaryContactTelephone:
      overrides.primaryContactTelephone ?? base.contactPhone,
    primaryContactEmail: overrides.primaryContactEmail ?? base.contactEmail,
    accountType: overrides.accountType ?? "—",
    accountHolderType: overrides.accountHolderType ?? "—",
    bankName: overrides.bankName ?? "—",
    bankBranch: overrides.bankBranch ?? "—",
    ifscCode: overrides.ifscCode ?? "—",
    micrCode: overrides.micrCode ?? "—",
    accountHolderName: overrides.accountHolderName ?? "—",
    accountNumber: overrides.accountNumber ?? "—",
    bankAddress: overrides.bankAddress ?? "—",
    cancelledChequeUrl: overrides.cancelledChequeUrl,
  };
}

