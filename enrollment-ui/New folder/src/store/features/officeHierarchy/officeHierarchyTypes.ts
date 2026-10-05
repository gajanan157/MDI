import { Office } from "@/app/pages/dashboards/insurerManagement/InsurerOfficeHierarchy/utils/hierarchyUtils";

export interface OfficeHierarchyResponse {
  data: Office[];
  pagination?: {
    totalRecords: number;
  };
}

export interface OfficeHierarchySearchParams {
  insurerId?: string;
  officeName?: string;
  officeCode?: string;
  officeType?: string;
  location?: string;
  contactPerson?: string;
  status?: string;
  childOfficeType?: string;
  childLocation?: string;
  subChildOfficeType?: string;
  subChildLocation?: string;
  grandChildOfficeType?: string;
  grandChildLocation?: string;
}
