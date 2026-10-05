import * as yup from "yup";

export const documentAnalysisSchema = yup.object().shape({
  document_type: yup.string().required("Document type is required"),
  department: yup.string().required("Department is required"),
  document_title: yup.string().required("Document title is required"),
  version: yup.string().required("Version is required"),
  created_by: yup.string().required("Created by is required"),
  reviewed_by: yup.string(),
  approved_by: yup.string(),
  report_category: yup.string().required("Report category is required"),
  report_type: yup.string().required("Report type is required"),
  frequency: yup.string().required("Frequency is required"),
  data_source: yup.string().required("Data source is required"),
  recipients: yup.array().of(yup.string()).min(1, "At least one recipient is required"),
  priority: yup.string().required("Priority is required"),
  description: yup.string(),
  special_requirements: yup.string(),
  deadline_date: yup.date().nullable(),
  file: yup.mixed(),
});

export type DocumentAnalysisFormValues = yup.InferType<typeof documentAnalysisSchema>;

export const DOCUMENT_TYPES = [
  { label: "Addendum", value: "addendum" },
  { label: "Amendment", value: "amendment" },
  { label: "Renewal", value: "renewal" },
  { label: "Extension", value: "extension" },
  { label: "MIS Report", value: "mis_report" },
  { label: "Claims Report", value: "claims_report" },
  { label: "Policy Document", value: "policy_document" },
];

export const DEPARTMENTS = [
  { label: "Management Information System", value: "mis" },
  { label: "Operations", value: "operations" },
  { label: "Finance", value: "finance" },
  { label: "Claims", value: "claims" },
  { label: "Underwriting", value: "underwriting" },
  { label: "IT", value: "it" },
];

export const REPORT_CATEGORIES = [
  { label: "Internal Management", value: "internal_management" },
  { label: "External Insurers", value: "external_insurers" },
  { label: "Regulatory", value: "regulatory" },
];

export const REPORT_TYPES = [
  // Internal Management
  { label: "Branches", value: "branches", category: "internal_management" },
  { label: "Operations", value: "operations", category: "internal_management" },
  { label: "Finance", value: "finance", category: "internal_management" },
  { label: "RTI", value: "rti", category: "internal_management" },
  
  // External Insurers
  { label: "Brokers", value: "brokers", category: "external_insurers" },
  { label: "Corporates", value: "corporates", category: "external_insurers" },
  { label: "New RFP", value: "new_rfp", category: "external_insurers" },
  
  // Regulatory
  { label: "IRDAI", value: "irdai", category: "regulatory" },
  { label: "TAC", value: "tac", category: "regulatory" },
  { label: "CAG", value: "cag", category: "regulatory" },
  { label: "Agents", value: "agents", category: "regulatory" },
  { label: "IIB", value: "iib", category: "regulatory" },
  { label: "Ministry Govt", value: "ministry_govt", category: "regulatory" },
];

export const FREQUENCIES = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
  { label: "On-Demand", value: "on_demand" },
];

export const DATA_SOURCES = [
  { label: "Claims Database", value: "claims_db" },
  { label: "Policy Database", value: "policy_db" },
  { label: "Finance System", value: "finance_system" },
  { label: "External API", value: "external_api" },
  { label: "Manual Entry", value: "manual_entry" },
  { label: "File Upload", value: "file_upload" },
];

export const PRIORITIES = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

export const RECIPIENTS = [
  { label: "Operations Team", value: "operations_team" },
  { label: "Operations HOD", value: "operations_hod" },
  { label: "Compliance Manager", value: "compliance_manager" },
  { label: "Finance Team", value: "finance_team" },
  { label: "Management", value: "management" },
  { label: "IRDAI", value: "irdai" },
  { label: "Brokers", value: "brokers" },
  { label: "Corporates", value: "corporates" },
];
