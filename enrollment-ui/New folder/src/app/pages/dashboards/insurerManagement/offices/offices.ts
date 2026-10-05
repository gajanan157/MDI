export interface Office {
  id: number;
  name: string; // Insurance company name
  officeName: string;
  officeType: "HO" | "RO" | "DO" | "UO" | "OTHER";
  officeCode: string;
  isUnderwritingCenter: boolean;
  effectiveFrom: string; // ISO date string
  effectiveTo: string | null;
  recordStatus: "Active" | "Inactive" | "Deleted" | "Mark for archival";
  active_flag: boolean;
}
