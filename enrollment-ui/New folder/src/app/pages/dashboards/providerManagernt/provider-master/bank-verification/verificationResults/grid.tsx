import { BuildingOffice2Icon, EnvelopeIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { TFunction } from "i18next";
import { BANK_VERIFICATION_GRID_CELL_STYLE } from "../config";
import type { VerificationResultGridRow } from "./ResultsGridSection";
import type { BankVerificationResultRow, BankVerificationResultStatus } from "./types";

const VIEW_ACTION_BUTTON_CLASS =
  "cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-blue-600 hover:bg-blue-100";
const EMAIL_ACTION_BUTTON_CLASS =
  "cursor-pointer rounded border border-violet-200 bg-violet-50 px-2 py-1 text-violet-700 hover:bg-violet-100";

function resolveStatusClassName(status: BankVerificationResultStatus): string {
  switch (status) {
    case "MATCHED":
      return "bg-emerald-100 text-emerald-800";
    case "NOT_MATCHED":
      return "bg-red-100 text-red-800";
    case "PENDING":
      return "bg-amber-100 text-amber-900";
    case "BANK_DETAILS_MISSING":
      return "bg-slate-200 text-slate-800";
    case "PROVIDER_NOT_FOUND":
      return "bg-orange-100 text-orange-800";
    case "FAILED":
    case "VALIDATION_FAILED":
    case "PROCESSING_FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-200 text-slate-800";
  }
}

function resolveStatusLabel(status: BankVerificationResultStatus, t: TFunction): string {
  switch (status) {
    case "MATCHED":
      return t("providerMaster.bankVerification.results.statusMatched");
    case "NOT_MATCHED":
      return t("providerMaster.bankVerification.results.statusNotMatched");
    case "PENDING":
      return t("providerMaster.bankVerification.results.statusPending");
    case "BANK_DETAILS_MISSING":
      return t("providerMaster.bankVerification.results.statusBankDetailsMissing");
    case "PROVIDER_NOT_FOUND":
      return t("providerMaster.bankVerification.results.statusProviderNotFound");
    case "FAILED":
      return t("providerMaster.bankVerification.results.statusFailed");
    case "VALIDATION_FAILED":
      return t("providerMaster.bankVerification.results.statusValidationFailed");
    case "PROCESSING_FAILED":
      return t("providerMaster.bankVerification.results.statusProcessingFailed");
    default:
      return status;
  }
}

function renderStatusBadge(status: BankVerificationResultStatus, t: TFunction) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-[11px] font-medium ${resolveStatusClassName(status)}`}
    >
      {resolveStatusLabel(status, t)}
    </span>
  );
}

export function createVerificationResultColumns(
  t: TFunction,
  onViewRow: (row: BankVerificationResultRow) => void,
  onEmailRow: (row: BankVerificationResultRow) => void,
  showRemarkColumn = false,
): ColDef<VerificationResultGridRow>[] {
  const cellStyle = BANK_VERIFICATION_GRID_CELL_STYLE;
  const emptyValue = t("providerMaster.expiry.emptyValue");
  const formatEmpty = (
    params: ValueFormatterParams<VerificationResultGridRow>,
  ) => String(params.value ?? "").trim() || emptyValue;

  const columns: ColDef<VerificationResultGridRow>[] = [
    {
      field: "uiSerialNo",
      headerName: "#",
      width: 52,
      sortable: false,
      filter: false,
      cellStyle,
    },
    {
      field: "insurerProviderCode",
      headerName: t("providerMaster.bankVerification.results.insurerCode"),
      minWidth: 140,
      flex: 1,
      cellStyle,
      valueFormatter: formatEmpty,
    },
    {
      field: "providerIibRohiniCode",
      headerName: t("providerMaster.bankVerification.results.rohini"),
      minWidth: 120,
      flex: 0.9,
      cellStyle,
      valueFormatter: formatEmpty,
    },
    {
      field: "providerName",
      headerName: t("providerMaster.bankVerification.results.providerName"),
      minWidth: 180,
      flex: 1.3,
      cellStyle,
      cellRenderer: (params: { data?: VerificationResultGridRow }) => {
        const row = params.data;
        if (!row) return null;
        return (
          <div className="flex h-full items-center gap-1.5">
            <BuildingOffice2Icon className="size-3.5 shrink-0 text-gray-400" aria-hidden />
            <span className="truncate font-medium text-blue-700">
              {String(row.providerName ?? "").trim() || emptyValue}
            </span>
          </div>
        );
      },
    },
    {
      field: "providerPanNumber",
      headerName: t("providerMaster.bankVerification.results.pan"),
      minWidth: 110,
      flex: 0.8,
      cellStyle,
      valueFormatter: formatEmpty,
    },
    {
      field: "providerBankAccountNumber",
      headerName: t("providerMaster.bankVerification.results.accountNo"),
      minWidth: 140,
      flex: 1,
      cellStyle,
      valueFormatter: formatEmpty,
    },
    {
      field: "providerBankAccountIfscCode",
      headerName: t("providerMaster.bankVerification.results.ifsc"),
      minWidth: 110,
      flex: 0.8,
      cellStyle,
      valueFormatter: formatEmpty,
    },
    {
      field: "providerBankAccountType",
      headerName: t("providerMaster.bankVerification.results.accountType"),
      minWidth: 90,
      flex: 0.7,
      cellStyle,
      valueFormatter: formatEmpty,
    },
    {
      field: "providerAddressCity",
      headerName: t("providerMaster.bankVerification.results.city"),
      minWidth: 120,
      flex: 0.9,
      cellStyle,
      valueFormatter: formatEmpty,
    },
    {
      field: "providerAddressStateName",
      headerName: t("providerMaster.bankVerification.results.state"),
      minWidth: 120,
      flex: 0.9,
      cellStyle,
      valueFormatter: formatEmpty,
    },
    {
      field: "providerStatus",
      headerName: t("providerMaster.bankVerification.results.providerStatus"),
      minWidth: 100,
      flex: 0.7,
      cellStyle,
      valueFormatter: formatEmpty,
    },
    {
      colId: "status",
      field: "status",
      headerName: t("providerMaster.common.status"),
      minWidth: 120,
      flex: 0.9,
      cellStyle,
      cellRenderer: (params: { data?: VerificationResultGridRow }) => {
        const row = params.data;
        if (!row) return null;
        return (
          <div className="flex h-full items-center">
            {renderStatusBadge(row.status, t)}
          </div>
        );
      },
    },
  ];

  if (showRemarkColumn) {
    columns.push({
      field: "providerBankRemark",
      headerName: t("providerMaster.bankVerification.results.remark"),
      minWidth: 220,
      flex: 1.4,
      sortable: false,
      filter: false,
      cellStyle,
      tooltipField: "providerBankRemark",
      valueFormatter: (params) => {
        const remark = String(params.value ?? "").trim();
        return remark || t("providerMaster.expiry.emptyValue");
      },
    });
  }

  columns.push({
    colId: "actions",
    headerName: t("providerMaster.common.actions"),
      pinned: "right",
      width: 104,
      minWidth: 104,
      maxWidth: 104,
      suppressSizeToFit: true,
      sortable: false,
      filter: false,
      cellStyle,
      cellRenderer: (params: { data?: VerificationResultGridRow }) => {
        const row = params.data;
        if (!row) return null;
        const canView = row.status === "MATCHED" || row.status === "NOT_MATCHED";
        return (
          <div className="flex h-full items-center justify-center gap-2 text-[11px]">
            {canView ? (
              <button
                type="button"
                className={VIEW_ACTION_BUTTON_CLASS}
                onClick={(event) => {
                  event.stopPropagation();
                  onViewRow(row);
                }}
                aria-label={t("providerMaster.common.view")}
                title={t("providerMaster.common.view")}
              >
                <EyeIcon className="h-3.5 w-3.5" />
              </button>
            ) : null}
            <div className="flex w-[34px] justify-center">
              {row.status === "NOT_MATCHED" ? (
                <button
                  type="button"
                  className={EMAIL_ACTION_BUTTON_CLASS}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEmailRow(row);
                  }}
                  aria-label={t("providerMaster.bankVerification.results.sendEmail")}
                  title={t("providerMaster.bankVerification.results.sendEmail")}
                >
                  <EnvelopeIcon className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        );
      },
  });

  return columns;
}
