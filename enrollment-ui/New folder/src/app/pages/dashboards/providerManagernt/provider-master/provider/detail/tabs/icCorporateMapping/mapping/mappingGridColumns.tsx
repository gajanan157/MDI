import {
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  getRestrictionActionLabel,
  hasProviderRestriction,
} from "../restriction/utils";
import type { IcMappingGridLabels } from "../../../../../../shared/providerMasterI18n";
import type { ItemWithIdName } from "../types";
import {
  IcMappingAgreementCell,
  IcMappingBankMatchCell,
  IcMappingBoolCell,
  IcMappingNetworkSourceCell,
  IcMappingNetworkStatusCell,
} from "./mappingGridCells";

type RestrictionIconColorScheme = "ic" | "corporate";

const ACTION_ICON_BASE =
  "inline-flex h-6 w-6 items-center justify-center rounded border transition-colors";
const ACTION_ICON_DISABLED =
  "inline-flex h-6 w-6 cursor-not-allowed items-center justify-center rounded border opacity-60";

const VIEW_BTN = `${ACTION_ICON_BASE} cursor-pointer border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700`;
const UNMAP_BTN = `${ACTION_ICON_BASE} cursor-pointer border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700`;
const UNMAP_BTN_DISABLED = `${ACTION_ICON_DISABLED} border-rose-100 bg-rose-50/60 text-rose-400`;

const RESTRICTION_BTN_COLORS: Record<
  RestrictionIconColorScheme,
  { add: string; edit: string; addDisabled: string; editDisabled: string }
> = {
  ic: {
    add: `${ACTION_ICON_BASE} cursor-pointer border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700`,
    edit: `${ACTION_ICON_BASE} cursor-pointer border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700`,
    addDisabled: `${ACTION_ICON_DISABLED} border-amber-100 bg-amber-50/60 text-amber-500`,
    editDisabled: `${ACTION_ICON_DISABLED} border-orange-100 bg-orange-50/60 text-orange-500`,
  },
  corporate: {
    add: `${ACTION_ICON_BASE} cursor-pointer border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700`,
    edit: `${ACTION_ICON_BASE} cursor-pointer border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-100 hover:text-fuchsia-700`,
    addDisabled: `${ACTION_ICON_DISABLED} border-violet-100 bg-violet-50/60 text-violet-500`,
    editDisabled: `${ACTION_ICON_DISABLED} border-fuchsia-100 bg-fuchsia-50/60 text-fuchsia-500`,
  },
};

export function buildMappingActionsColumn(options: {
  labels: Pick<IcMappingGridLabels, "actions" | "view" | "unmap">;
  canWrite: boolean;
  restrictionIconScheme?: RestrictionIconColorScheme;
  onView: (item: ItemWithIdName) => void;
  /** Opens the provider restrictions list for this mapped insurer/corporate. */
  onRestrictionAction: (item: ItemWithIdName) => void;
  onUnmap: (item: ItemWithIdName) => void;
}): object {
  const {
    labels,
    canWrite,
    restrictionIconScheme = "ic",
    onView,
    onRestrictionAction,
    onUnmap,
  } = options;

  const restrictionColors = RESTRICTION_BTN_COLORS[restrictionIconScheme];

  return {
    headerName: labels.actions,
    field: "actions",
    colId: "actions",
    minWidth: 92,
    maxWidth: 108,
    sortable: false,
    filter: false,
    pinned: "left" as const,
    lockPinned: true,
    suppressMovable: true,
    suppressCellFocus: true,
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cellRenderer: (params: { data: ItemWithIdName }) => {
      const item = params.data;
      const isEditRestriction = hasProviderRestriction(item);
      const restrictionTitle = getRestrictionActionLabel(item);
      const RestrictionIcon = isEditRestriction ? LockClosedIcon : LockOpenIcon;
      const restrictionBtnClass = isEditRestriction
        ? restrictionColors.edit
        : restrictionColors.add;

      return (
        <div className="flex h-full items-center justify-center gap-0.5">
          <button
            type="button"
            className={VIEW_BTN}
            title={labels.view}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onView(item);
            }}
          >
            <EyeIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className={restrictionBtnClass}
            title={restrictionTitle}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onRestrictionAction(item);
            }}
          >
            <RestrictionIcon className="h-[14px] w-[14px]" strokeWidth={2.2} />
          </button>
          {canWrite ? (
            <button
              type="button"
              className={UNMAP_BTN}
              title={labels.unmap}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onUnmap(item);
              }}
            >
              <NoSymbolIcon className="h-[14px] w-[14px]" strokeWidth={2.2} />
            </button>
          ) : (
            <span className={UNMAP_BTN_DISABLED} title={labels.unmap} aria-hidden>
              <NoSymbolIcon className="h-[14px] w-[14px]" />
            </span>
          )}
        </div>
      );
    },
  };
}

export function buildCorporateMappingGridColumnDefs(options: {
  labels: IcMappingGridLabels;
  canWrite: boolean;
  onView: (item: ItemWithIdName) => void;
  onRestrictionAction: (item: ItemWithIdName) => void;
  onUnmap: (item: ItemWithIdName) => void;
  onCompareBankMatch?: (item: ItemWithIdName) => void;
}): object[] {
  return buildMappingGridColumnDefs({
    ...options,
    restrictionIconScheme: "corporate",
    primaryNameHeader: options.labels.corporateName,
    showInsuranceCompany: true,
  });
}

function buildMappingDataColumns(
  labels: IcMappingGridLabels,
  primaryNameHeader: string,
  showInsuranceCompany = false,
  onOpenPendingAgreement?: (item: ItemWithIdName) => void,
  onOpenCompletedAgreement?: (item: ItemWithIdName) => void,
  onCompareBankMatch?: (item: ItemWithIdName) => void,
): object[] {
  const insuranceCompanyColumn = {
    field: "insuranceCompanyName",
    headerName: labels.insuranceCompany,
    flex: 1.1,
    minWidth: 160,
    sortable: true,
    filter: false,
    valueFormatter: (params: { value?: string }) => params.value ?? "—",
  };

  return [
    {
      field: "name",
      headerName: primaryNameHeader,
      flex: 1.1,
      minWidth: 160,
      sortable: true,
      filter: false,
    },
    ...(showInsuranceCompany ? [insuranceCompanyColumn] : []),
    {
      field: "icProviderCode",
      headerName: labels.icProviderCode,
      flex: 0.85,
      minWidth: 120,
      sortable: true,
      filter: false,
      valueFormatter: (params: { value?: string }) => params.value ?? "—",
    },
    {
      colId: "networkSource",
      headerName: labels.networkSource,
      flex: 0.75,
      minWidth: 100,
      maxWidth: 120,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: ItemWithIdName }) => (
        <IcMappingNetworkSourceCell data={params.data} />
      ),
    },
    {
      field: "networkMode",
      headerName: labels.networkMode,
      flex: 0.75,
      minWidth: 100,
      sortable: true,
      filter: false,
      valueFormatter: (params: { value?: string }) => params.value ?? "—",
    },
    {
      field: "tariffType",
      headerName: labels.tariffType,
      flex: 0.75,
      minWidth: 100,
      sortable: true,
      filter: false,
      valueFormatter: (params: { value?: string }) => params.value ?? "—",
    },
    {
      field: "providerNetworkIsActive",
      headerName: labels.status,
      flex: 0.85,
      minWidth: 110,
      maxWidth: 140,
      sortable: true,
      filter: false,
      cellRenderer: (params: { data: ItemWithIdName }) => (
        <IcMappingNetworkStatusCell
          providerNetworkIsActive={params.data.providerNetworkIsActive}
          cashless={params.data.cashless}
          reimbursement={params.data.reimbursement}
          labels={labels}
        />
      ),
    },
    {
      field: "cashless",
      headerName: labels.cashlessStatus,
      width: 90,
      maxWidth: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: ItemWithIdName }) => (
        <IcMappingBoolCell value={Boolean(params.data.cashless)} labels={labels} />
      ),
    },
    {
      field: "reimbursement",
      headerName: labels.reimbursement,
      width: 110,
      maxWidth: 120,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: ItemWithIdName }) => (
        <IcMappingBoolCell value={Boolean(params.data.reimbursement)} labels={labels} />
      ),
    },
    {
      colId: "agreementStatus",
      field: "agreement",
      headerName: labels.agreementStatus,
      flex: 0.85,
      minWidth: 110,
      maxWidth: 140,
      sortable: true,
      filter: false,
      cellRenderer: (params: { data: ItemWithIdName }) => (
        <IcMappingAgreementCell
          data={params.data}
          labels={labels}
          onOpenPendingAgreement={onOpenPendingAgreement}
          onOpenCompletedAgreement={onOpenCompletedAgreement}
        />
      ),
    },
    {
      colId: "bankMatch",
      headerName: labels.bankMatch,
      flex: 1,
      minWidth: 150,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: ItemWithIdName }) => (
        <IcMappingBankMatchCell
          data={params.data}
          labels={labels}
          onCompareBankMatch={onCompareBankMatch}
        />
      ),
    },
  ];
}

function buildMappingGridColumnDefs(options: {
  labels: IcMappingGridLabels;
  canWrite: boolean;
  restrictionIconScheme: RestrictionIconColorScheme;
  primaryNameHeader: string;
  showInsuranceCompany?: boolean;
  onView: (item: ItemWithIdName) => void;
  onRestrictionAction: (item: ItemWithIdName) => void;
  onUnmap: (item: ItemWithIdName) => void;
  onOpenPendingAgreement?: (item: ItemWithIdName) => void;
  onOpenCompletedAgreement?: (item: ItemWithIdName) => void;
  onCompareBankMatch?: (item: ItemWithIdName) => void;
}): object[] {
  const {
    labels,
    canWrite,
    restrictionIconScheme,
    primaryNameHeader,
    showInsuranceCompany = false,
    onView,
    onRestrictionAction,
    onUnmap,
    onOpenPendingAgreement,
    onOpenCompletedAgreement,
    onCompareBankMatch,
  } = options;

  return [
    buildMappingActionsColumn({
      labels,
      canWrite,
      restrictionIconScheme,
      onView,
      onRestrictionAction,
      onUnmap,
    }),
    ...buildMappingDataColumns(
      labels,
      primaryNameHeader,
      showInsuranceCompany,
      onOpenPendingAgreement,
      onOpenCompletedAgreement,
      onCompareBankMatch,
    ),
  ];
}

export function buildIcMappingGridColumnDefs(options: {
  labels: IcMappingGridLabels;
  canWrite: boolean;
  onView: (item: ItemWithIdName) => void;
  /** Opens the provider restrictions list for this mapped insurer/corporate. */
  onRestrictionAction: (item: ItemWithIdName) => void;
  onUnmap: (item: ItemWithIdName) => void;
  onOpenPendingAgreement?: (item: ItemWithIdName) => void;
  onOpenCompletedAgreement?: (item: ItemWithIdName) => void;
  onCompareBankMatch?: (item: ItemWithIdName) => void;
}): object[] {
  return buildMappingGridColumnDefs({
    ...options,
    restrictionIconScheme: "ic",
    primaryNameHeader: options.labels.insuranceCompany,
  });
}
