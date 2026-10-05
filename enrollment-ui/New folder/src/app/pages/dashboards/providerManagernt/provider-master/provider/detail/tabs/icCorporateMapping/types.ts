import type { SearchField } from "@/app/pages/dashboards/CommonSearch";
import type { HospitalDetailRecord } from "../../../hospitalData";
import type { NormalizedProviderRestriction } from "./restriction/utils";
import type { IcMappingGridExtras } from "./mapping/utils";

export type IcMappingDetailSession = {
  item: ItemWithIdName;
  editing: boolean;
  detailLoading: boolean;
};

export type RestrictionDetailSession = {
  item: ItemWithIdName;
  editing: boolean;
  detailLoading: boolean;
};

export type ItemWithIdName = {
  id: string;
  name: string;
  insurerId?: string;
  insuranceCompanyName?: string;
  icProviderCode?: string;
} & Partial<IcMappingGridExtras>;

export interface IcCorporateMappingTabProps {
  providerId?: string;
  providerBarSection: React.ReactNode;
  mappingSubTab: "ic" | "corporate";
  setMappingSubTab: (v: "ic" | "corporate") => void;
  canWrite: boolean;
  canVerify?: boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  hospital?: HospitalDetailRecord | null;
  mappingSearchOpen: boolean;
  toggleMappingSearch: () => void;
  mappingSearchFields: SearchField[];
  onMappingSearch: (data: Record<string, unknown>) => void;
  filteredMappedForGrid: ItemWithIdName[];
  hasMappingListData: boolean;
  mappingPage: number;
  mappingPageSize: number;
  mappingTotalItems: number;
  onMappingPageChange: (page: number) => void;
  onMappingPageSizeChange: (size: number) => void;
  mappingGridColumnDefs: object[];
  onMappingView: (item: ItemWithIdName) => void;
  onMappingRestrictionAction: (item: ItemWithIdName) => void;
  onMappingUnmap: (item: ItemWithIdName) => void;
  onOpenPendingAgreement: (item: ItemWithIdName) => void;
  onCompareBankMatch: (item: ItemWithIdName) => void;
  icNetworkMappingLoading?: boolean;
  mappingViewItem: ItemWithIdName | null;
  setMappingViewItem: (v: ItemWithIdName | null) => void;
  icMappingDetail: IcMappingDetailSession | null;
  closeIcMappingDetail: (options?: { navigate?: boolean }) => void;
  setIcMappingDetailEditing: (editing: boolean) => void;
  setIcMappingDetailLoading: (detailLoading: boolean) => void;
  hydrateIcMappingDetailItem?: (item: ItemWithIdName) => void;
  unmapDialogOpen: boolean;
  setUnmapDialogOpen: (v: boolean) => void;
  unmapDialogItem: ItemWithIdName | null;
  unmapEffectiveFrom: string;
  setUnmapEffectiveFrom: (v: string) => void;
  unmapEffectiveFromError?: string;
  unmapRemark: string;
  setUnmapRemark: (v: string) => void;
  unmapRemarkError?: string;
  unmapSupportingFileName: string;
  setUnmapSupportingFileMetadataId: (
    fileMetadataId: string,
    fileName: string,
    inwardNo?: string,
  ) => void;
  clearUnmapSupportingDocument: () => void;
  unmapSupportingDocumentError?: string;
  setUnmapSupportingDocumentError?: (v: string) => void;
  unmapSaving: boolean;
  closeUnmapDialog: () => void;
  onUnmapSave: () => void | Promise<void>;
  icMappingCreateMode: boolean;
  setIcMappingCreateMode: (v: boolean) => void;
  /** Called after a new IC mapping is saved so the parent can reload the grid. */
  onIcMappingSaved?: () => void | Promise<void>;
  /** Called after a restriction is saved so the parent can reload the grid. */
  onRestrictionSaved?: () => void | Promise<void>;
  restrictionPrefillInsurerId?: string;
  restrictionPrefillCorporateId?: string;
  restrictionPrefillRestrictionId?: string;
  restrictionDetail: RestrictionDetailSession | null;
  closeRestrictionDetail: () => void;
  setRestrictionDetailEditing: (editing: boolean) => void;
  setRestrictionDetailLoading: (detailLoading: boolean) => void;
  setRestrictionContextEntityId?: (entityId: string) => void;
  clearRestrictionPrefill?: () => void;
  bindRestrictionNavigation?: (handlers: {
    setRestrictionCreateMode: (enabled: boolean) => void;
    setIcMappingCreateMode: (enabled: boolean) => void;
  }) => void;
  restrictionCreateMode: boolean;
  setRestrictionCreateMode: (v: boolean) => void;
  restrictionListActive: boolean;
  restrictionListCreateActive: boolean;
  restrictionListItem: ItemWithIdName | null;
  restrictionListRows: NormalizedProviderRestriction[];
  restrictionListLoading: boolean;
  restrictionListError: string;
  closeRestrictionListPage: () => void;
  handleRestrictionListAdd: () => void;
  handleRestrictionListView: (row: NormalizedProviderRestriction) => void;
  restrictionSearchOpen: boolean;
  toggleRestrictionSearch: () => void;
  restrictionSearchFields: SearchField[];
  handleRestrictionSearch: (data: Record<string, unknown>) => void;
  bankMatchCompareOpen?: boolean;
  bankMatchCompareItem?: ItemWithIdName | null;
  closeBankMatchCompare?: () => void;
  navigateToProviderBankDetails?: () => void;
}

export type IcMappingFormState = {
  icName: string;
  corporateIds: string[];
  icProviderCode: string;
  partyCodeStatus?: string;
  empanelmentSource: string;
  networkMode: string;
  tariffType: string;
  effectiveFrom: string;
  effectiveTo: string;
  remarks: string;
  supportingDocument: File | null;
  supportingFileMetadataId: string;
  supportingDocumentName: string;
  inwardNo: string;
};

export type RestrictionDetailsState = {
  effectiveFrom: string;
  effectiveTo: string;
  remark: string;
  supportingDocument: File | null;
  supportingFileMetadataId: string;
  supportingDocumentName: string;
  inwardNo: string;
};

export type RestrictionFormValues = {
  icName: string;
  restrictionType: string;
  restrictionApplicable: string[];
  investigationType: string;
  investigationRequired: boolean;
  emergency_exception_allowed_flag: boolean;
  restrictionLevel: string;
  corporateIds: string[];
  rohOfficeIds: string[];
  policyNumbers: string[];
  ccnNumbers: string[];
};
