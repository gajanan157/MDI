import { ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { ColDef } from "ag-grid-community";
import type { TFunction } from "i18next";
import { formatProviderDateTimeDisplay } from "../../shared/dateFormat";
import type { BankVerificationInwardRow } from "./inwardTypes";

export function createBankVerificationColumns(
  t: TFunction,
  onView: (row: BankVerificationInwardRow) => void,
  onViewDocuments: (row: BankVerificationInwardRow) => void,
): ColDef<BankVerificationInwardRow>[] {
  return [
    {
      colId: "actions",
      headerName: t("providerMaster.common.actions"),
      pinned: "left",
      width: 104,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: BankVerificationInwardRow }) => {
        const row = params.data;
        if (!row) return null;
        return (
          <div className="flex h-full items-center justify-center gap-2 text-[11px]">
            <button
              type="button"
              className="cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-blue-600 hover:bg-blue-100"
              onClick={(event) => {
                event.stopPropagation();
                onView(row);
              }}
              aria-label={t("providerMaster.common.view")}
              title={t("providerMaster.common.view")}
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="cursor-pointer rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 hover:bg-emerald-100"
              onClick={(event) => {
                event.stopPropagation();
                onViewDocuments(row);
              }}
              aria-label={t("providerMaster.common.viewInwardDocuments", {
                inwardNo: row.inwardNo,
              })}
              title={t("providerMaster.common.viewInwardDocumentsTitle")}
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
    {
      field: "inwardNo",
      headerName: t("providerMaster.bankVerification.table.inwardNo"),
      minWidth: 150,
      flex: 1,
      cellClass: "font-semibold",
    },
    {
      field: "insurerName",
      headerName: t("providerMaster.bankVerification.table.insurerName"),
      minWidth: 180,
      flex: 1.2,
    },
    {
      field: "recordStatus",
      headerName: t("providerMaster.common.status"),
      minWidth: 100,
      flex: 0.8,
    },
    {
      field: "createdAt",
      headerName: t("providerMaster.bankVerification.table.uploadedAt"),
      minWidth: 160,
      flex: 1,
      valueFormatter: (params) => formatProviderDateTimeDisplay(params.value),
    },
    {
      field: "uploadedByName",
      headerName: t("providerMaster.bankVerification.table.uploadedBy"),
      minWidth: 130,
      flex: 1,
    },
  ];
}
