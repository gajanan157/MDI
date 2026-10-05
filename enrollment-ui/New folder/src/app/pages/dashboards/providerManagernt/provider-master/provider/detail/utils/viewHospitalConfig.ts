export const STATUS_COLOR_CLASS: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Blacklisted: "bg-red-100 text-red-800",
  Inactive: "bg-gray-100 text-gray-800",
};

export const AGREEMENT_SAMPLE_PDF_URL = encodeURI(
  "/pdf/GH REVISION-01-07-2024-FOR TPA.pdf",
);

export const DOCUMENT_SAMPLE_FILES: Record<
  number,
  { url: string; downloadName: string; type: "image" | "pdf" }
> = {
  1: { url: "/sample-pan-card.jpg", downloadName: "sample-pan-card.jpg", type: "image" },
  2: { url: encodeURI("/Pan Declaration.pdf"), downloadName: "Pan-Declaration.pdf", type: "pdf" },
};

export const SOC_SAMPLE_PDF_URL = encodeURI("/pdf/GH REVISION-01-07-2024-FOR TPA.pdf");

export const DOCUMENT_LIST = [
  { no: 1, name: "PAN Card", startDate: "-", validTill: "-" },
  { no: 2, name: "PAN Undertaking Declaration", startDate: "-", validTill: "-" },
  { no: 3, name: "Consulting Doctors List", startDate: "-", validTill: "-" },
  { no: 4, name: "ECS Form", startDate: "-", validTill: "-" },
  { no: 5, name: "Undertaking Declaration Letter", startDate: "-", validTill: "-" },
  { no: 6, name: "TPA & Insurance Panel List", startDate: "-", validTill: "-" },
  { no: 7, name: "Wellness Draft", startDate: "-", validTill: "-" },
  { no: 8, name: "IRDA Standard Sheet (Excel Only)", startDate: "-", validTill: "-" },
  { no: 9, name: "Entity Relationship Document", startDate: "-", validTill: "-" },
  {
    no: 10,
    name: "Registration Certificate",
    startDate: "01/04/2024",
    validTill: "31/03/2025",
    versions: [
      {
        id: "reg-2024",
        fileName: "Registration_Certificate_2024.pdf",
        startDate: "01/04/2024",
        validTill: "31/03/2025",
        active: true,
        registrationNo: "REG/PUNE/2019/1042",
        registrationAct: "Clinical Establishments Act",
        description: "Primary registration certificate for the clinical establishment.",
      },
      {
        id: "reg-2023",
        fileName: "Registration_Certificate_2023.pdf",
        startDate: "01/04/2023",
        validTill: "31/03/2024",
        active: false,
        registrationNo: "REG/PUNE/2018/0981",
        registrationAct: "Clinical Establishments Act",
        description: "Previous year registration certificate.",
      },
    ],
  },
  {
    no: 11,
    name: "Rohini Certificate",
    startDate: "01/04/2024",
    validTill: "31/03/2025",
    versions: [
      {
        id: "rohini-2024",
        fileName: "Rohini_Certificate_2024.pdf",
        startDate: "01/04/2024",
        validTill: "31/03/2025",
        active: true,
        registrationNo: "8900080120686",
        description: "Rohini registration certificate issued by IIB.",
      },
    ],
  },
  {
    no: 12,
    name: "Bio Medical Waste Certificate (BWC)",
    startDate: "01/04/2024",
    validTill: "31/03/2025",
    versions: [
      {
        id: "bwc-2024",
        fileName: "BWC_Certificate_2024.pdf",
        startDate: "01/04/2024",
        validTill: "31/03/2025",
        active: true,
        registrationNo: "BWC/MH/PUN/2024/118",
        registrationAct: "Bio-Medical Waste Rules",
        description: "Authorization for bio-medical waste management.",
      },
    ],
  },
  {
    no: 13,
    name: "Fire NOC",
    startDate: "01/04/2024",
    validTill: "31/03/2025",
    versions: [
      {
        id: "fire-2024",
        fileName: "Fire_NOC_2024.pdf",
        startDate: "01/04/2024",
        validTill: "31/03/2025",
        active: true,
        registrationNo: "FIRE/NOC/PUN/2024/552",
        description: "Fire safety no-objection certificate for hospital premises.",
      },
    ],
  },
  {
    no: 14,
    name: "Udyam Certificate",
    startDate: "01/04/2024",
    validTill: "31/03/2025",
    versions: [
      {
        id: "udyam-2024",
        fileName: "Udyam_Certificate_2024.pdf",
        startDate: "01/04/2024",
        validTill: "31/03/2025",
        active: true,
        registrationNo: "UDYAM-MH-12-0012847",
        description: "MSME Udyam registration certificate.",
      },
    ],
  },
  { no: 15, name: "Hospital Photos", startDate: "-", validTill: "-" },
  { no: 16, name: "Infrastructure Audit Form", startDate: "-", validTill: "-" },
];

export const TAB_LABELS: Record<string, string> = {
  "hospital-details": "Overview",
  "agreement": "Agreements",
  "provider-owner": "Owner",
  "infrastructure-facility": "Infra & Facility",
  "owners-info": "Contacts",
  "ic-corporate": "Network Management",
  "bank-details": "Banking Details",
  "hospital-document": "Documents",
  "soc": "SOC",
  "hospital-discount": "Discount",
};

/** Main tabs shown on the hospital detail page (id + label only). */
export const VIEW_HOSPITAL_MAIN_TABS = [
  { id: "hospital-details", label: "Overview" },
  { id: "agreement", label: "Agreements" },
  { id: "provider-owner", label: "Owner" },
  { id: "infrastructure-facility", label: "Infra & Facility" },
  { id: "owners-info", label: "Contacts" },
  { id: "ic-corporate", label: "Network Management" },
  { id: "bank-details", label: "Banking Details" },
  { id: "hospital-document", label: "Documents" },
  { id: "soc", label: "SOC" },
  { id: "hospital-discount", label: "Discount" },
] as const;

/**
 * Temporarily hidden from the tab bar. Tab definitions, routes, and components stay intact.
 * Remove an id from this set to show the tab again.
 */
export const HIDDEN_VIEW_HOSPITAL_MAIN_TAB_IDS = new Set<
  (typeof VIEW_HOSPITAL_MAIN_TABS)[number]["id"]
>([]);

/** Tabs available only for Network providers. Network Management stays available for Non-Network. */
export const NETWORK_ONLY_PROVIDER_TAB_IDS = new Set([
  "agreement",
  "provider-owner",
  "infrastructure-facility",
  "owners-info",
  "bank-details",
  "hospital-document",
  "soc",
  "hospital-discount",
]);
