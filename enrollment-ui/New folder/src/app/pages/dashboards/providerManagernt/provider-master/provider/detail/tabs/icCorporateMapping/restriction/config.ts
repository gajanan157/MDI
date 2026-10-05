import type { SearchField } from "@/app/pages/dashboards/CommonSearch";
import {
  SUPPORTING_DOCUMENT_ACCEPT,
  SUPPORTING_DOCUMENT_EXTENSIONS,
  SUPPORTING_DOCUMENT_INVALID_MESSAGE,
} from "../shared";

export const RESTRICTION_TYPE_OPTIONS = [
  { value: "Watchlist", label: "Watchlist" },
  { value: "Blacklist", label: "Blacklist" },
];

export const RESTRICTION_APPLICABLE_OPTIONS = [
  { value: "cashless", label: "Cashless" },
  { value: "reimbursement", label: "Reimbursement" },
];

export const RESTRICTION_APPLICABLE_CASHLESS_ONLY_OPTIONS = [
  { value: "cashless", label: "Cashless" },
];

export const INVESTIGATION_TYPE_OPTIONS = [
  { value: "Full investigation", label: "Full investigation" },
  { value: "Partial investigation", label: "Partial investigation" },
];

export const RESTRICTION_LEVEL_OPTIONS = [
  { value: "Insurer", label: "Insurer" },
  { value: "INSURER_CORPORATE", label: "Insurer + Corporate" },
  { value: "INSURER_RO", label: "Insurer + RO" },
  { value: "INSURER_POLICY", label: "Insurer + Policy" },
  // { value: "INSURER_CCN", label: "Insurer + CCN" },
];

export const RESTRICTION_DETAILS_DEFAULTS = {
  effectiveFrom: "",
  effectiveTo: "",
  remark: "",
  supportingDocument: null as File | null,
  supportingFileMetadataId: "",
  supportingDocumentName: "",
  inwardNo: "",
};

export const RESTRICTION_LIST_SEARCH_FIELDS: SearchField[] = [
  {
    name: "providerRestrictionType",
    label: "Restriction Type",
    type: "dropdown",
    options: [
      { value: "", label: "All" },
      { value: "BLACKLIST", label: "Blacklist" },
      { value: "WATCHLIST", label: "Watchlist" },
    ],
  },
  {
    name: "providerRestrictionStatus",
    label: "Status",
    type: "dropdown",
    options: [
      { value: "", label: "All" },
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
  },
  { name: "policyId", label: "Policy ID", type: "text" },
  { name: "tpaId", label: "TPA ID", type: "text" },
  { name: "providerRestrictionZoneId", label: "Restriction Zone ID", type: "text" },
];

export const RESTRICTION_DOCUMENT_S3_BUCKET = "provider";
export const RESTRICTION_DOCUMENT_S3_SUB_BUCKET = "SUPPLIMENTRY_DOCUMENT";
export const RESTRICTION_DOCUMENT_ENTITY_TYPE = "PROVIDER";
export const RESTRICTION_DOCUMENT_ACCEPT = SUPPORTING_DOCUMENT_ACCEPT;
export const RESTRICTION_DOCUMENT_EXTENSIONS = SUPPORTING_DOCUMENT_EXTENSIONS;
export const RESTRICTION_DOCUMENT_INVALID_MESSAGE = SUPPORTING_DOCUMENT_INVALID_MESSAGE;
