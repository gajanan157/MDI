import { EyeIcon /* , PencilSquareIcon */ } from "@heroicons/react/24/outline";
import type { TFunction } from "i18next";
import type { IcWiseGridRow } from "../ic-corporate-mapping/types";
import type { BankAccountSearchRow } from "@/store/features/providerBankAccountSearch/providerBankAccountSearchApi";
import { BANK_VERIFICATION_GRID_CELL_STYLE } from "./config";

const VIEW_ACTION_BUTTON_CLASS =
  "cursor-pointer rounded border border-blue-200 bg-blue-50 p-1 text-blue-600 hover:bg-blue-100";
// const EDIT_ACTION_BUTTON_CLASS =
//   "cursor-pointer rounded border border-emerald-200 bg-emerald-50 p-1 text-emerald-700 hover:bg-emerald-100";
const ACTION_BUTTON_DISABLED_CLASS =
  "cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-1 text-gray-400";

function bankMatchBadgeClass(status: IcWiseGridRow["bankMatch"]): string {
  if (status === "matched") return "bg-green-100 text-green-700";
  if (status === "mismatch") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

function bankMatchLabel(
  status: IcWiseGridRow["bankMatch"],
  t: TFunction,
): string {
  if (status === "matched") {
    return t("providerMaster.icMapping.bankMatch.matched", {
      defaultValue: "Matched",
    });
  }
  if (status === "mismatch") {
    return t("providerMaster.icMapping.bankMatch.mismatch", {
      defaultValue: "Not Matched",
    });
  }
  return t("providerMaster.icMapping.bankMatch.pending", {
    defaultValue: "Pending",
  });
}

const emptyText = (t: TFunction) => (params: { value?: string }) =>
  params.value?.trim() || t("providerMaster.expiry.emptyValue");

export function createBankDetailsLandingColumns(
  t: TFunction,
  options: {
    onView: (row: BankAccountSearchRow) => void;
    onEdit: (row: BankAccountSearchRow) => void;
  },
) {
  return [
    {
      colId: "actions",
      field: "actions",
      headerName: t("providerMaster.common.actions"),
      pinned: "left" as const,
      width: 92,
      sortable: false,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      cellRenderer: (params: { data?: BankAccountSearchRow }) => {
        const row = params.data;
        if (!row) return null;
        const hasProvider = Boolean(row.providerId?.trim());
        return (
          <div className="flex h-full items-center justify-center gap-1.5">
            <button
              type="button"
              className={hasProvider ? VIEW_ACTION_BUTTON_CLASS : ACTION_BUTTON_DISABLED_CLASS}
              disabled={!hasProvider}
              onClick={(event) => {
                event.stopPropagation();
                if (hasProvider) options.onView(row);
              }}
              aria-label={t("providerMaster.common.view")}
              title={t("providerMaster.common.view")}
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </button>
            {/* Edit action temporarily disabled
            <button
              type="button"
              className={hasProvider ? EDIT_ACTION_BUTTON_CLASS : ACTION_BUTTON_DISABLED_CLASS}
              disabled={!hasProvider}
              onClick={(event) => {
                event.stopPropagation();
                if (hasProvider) options.onEdit(row);
              }}
              aria-label={t("providerMaster.common.edit")}
              title={t("providerMaster.common.edit")}
            >
              <PencilSquareIcon className="h-3.5 w-3.5" />
            </button>
            */}
          </div>
        );
      },
    },
    {
      field: "icName",
      headerName: t("providerMaster.icMapping.columns.insuranceCompany"),
      flex: 1.2,
      minWidth: 220,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
    },
    {
      field: "providerName",
      headerName: t("providerMaster.icMapping.columns.providerName"),
      flex: 1.2,
      minWidth: 200,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
    },
    {
      field: "providerCode",
      headerName: t("providerMaster.icMapping.columns.providerCode"),
      flex: 0.9,
      minWidth: 140,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      valueFormatter: (params: { value?: string }) =>
        params.value?.trim() || t("providerMaster.expiry.emptyValue"),
    },
    {
      field: "rohiniRegistryCode",
      headerName: t("providerMaster.icMapping.columns.rohiniNumber"),
      flex: 0.9,
      minWidth: 130,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      valueFormatter: emptyText(t),
    },
    {
      field: "panNo",
      headerName: t("providerMaster.bankVerification.columns.panNumber", {
        defaultValue: "PAN Number",
      }),
      flex: 0.9,
      minWidth: 130,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      valueFormatter: emptyText(t),
    },
    {
      field: "panHolderName",
      headerName: t("providerMaster.bankVerification.columns.panHolderName", {
        defaultValue: "PAN Holder Name",
      }),
      flex: 1,
      minWidth: 170,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      valueFormatter: emptyText(t),
    },
    {
      field: "bankAccountNo",
      headerName: t("providerMaster.bankVerification.columns.accountNo", {
        defaultValue: "Account Number",
      }),
      flex: 1,
      minWidth: 160,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      valueFormatter: emptyText(t),
    },
    {
      field: "bankIfscCode",
      headerName: t("providerMaster.bankVerification.columns.ifscCode", {
        defaultValue: "IFSC Code",
      }),
      flex: 0.8,
      minWidth: 130,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      valueFormatter: emptyText(t),
    },
    {
      field: "bankHolderName",
      headerName: t("providerMaster.bankVerification.columns.accountHolderName", {
        defaultValue: "Account Holder Name",
      }),
      flex: 1,
      minWidth: 180,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      valueFormatter: emptyText(t),
    },
    {
      field: "recordSource",
      headerName: t("providerMaster.bankVerification.columns.recordSource", {
        defaultValue: "Record Source",
      }),
      flex: 0.9,
      minWidth: 140,
      sortable: true,
      filter: false,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      valueFormatter: emptyText(t),
    },
    {
      field: "bankMatch",
      headerName: t("providerMaster.icMapping.columns.bankMatch"),
      pinned: "right" as const,
      width: 140,
      minWidth: 120,
      sortable: true,
      filter: false,
      lockPinned: true,
      cellStyle: BANK_VERIFICATION_GRID_CELL_STYLE,
      cellRenderer: (params: { data?: BankAccountSearchRow }) => {
        const status = params.data?.bankMatch ?? "pending";
        const label = bankMatchLabel(status, t);
        return (
          <div className="flex h-full items-center py-0.5">
            <span
              className={`inline-flex min-w-[70px] items-center justify-center rounded px-2 py-1 text-xs ${bankMatchBadgeClass(status)}`}
              title={label}
            >
              {label}
            </span>
          </div>
        );
      },
    },
  ];
}
