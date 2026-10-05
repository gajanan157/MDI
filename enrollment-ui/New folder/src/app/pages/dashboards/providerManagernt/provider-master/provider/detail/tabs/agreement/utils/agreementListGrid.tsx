import type { TFunction } from "i18next";
import { PlusIcon } from "@heroicons/react/24/outline";
import { activeInactiveStatusPillRenderer } from "../../../../../../shared/providerAgGrid";
import { formatProviderDateTimeDisplay } from "../../../../../../shared/dateFormat";
import type { AgreementListRow } from "./agreementHelpers";
import { formatAgreementNameForDisplay } from "../../../shared/agreementTypeChip.helpers";
import { formatUnderscoredLabel } from "../../../../../../shared/dashboard";
import {
  getAgreementColumnLabel,
  type AgreementColumnKey,
} from "../../../../../../shared/providerMasterI18n";

export type { AgreementColumnKey };

function socDiscountStatusTone(status: string | undefined | null): string {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "complete" || normalized === "completed") {
    return "text-green-600 hover:text-green-800";
  }
  return "text-amber-600 hover:text-amber-800";
}

function formatSocDiscountStatusLabel(
  status: string | undefined | null,
  t: TFunction,
): string {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "complete" || normalized === "completed") {
    return t("providerMaster.agreement.socDiscountComplete");
  }
  return t("providerMaster.agreement.socDiscountPending");
}

export function getAgreementMasterColumns({
  view,
  onOpenSocDiscount,
  onAddDiscount,
  t,
}: Readonly<{
  view: (id: string) => void;
  onOpenSocDiscount: (row: AgreementListRow) => void;
  onAddDiscount: (row: AgreementListRow) => void;
  t: TFunction;
}>) {
  const label = (field: AgreementColumnKey) => getAgreementColumnLabel(field, t);

  return [
    {
      field: "agreementName",
      headerName: label("agreementName"),
      flex: 1.2,
      minWidth: 220,
      sortable: true,
      filter: false,
      cellRenderer: (params: { data?: AgreementListRow }) => {
        const row = params.data;
        if (!row) return null;
        const displayName = formatAgreementNameForDisplay(row.agreementName);
        return (
          <button
            type="button"
            className="h-full w-full min-w-0 cursor-pointer truncate text-left text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
            title={displayName}
            onClick={(event) => {
              event.stopPropagation();
              view(row.id);
            }}
          >
            {displayName}
          </button>
        );
      },
    },
    {
      field: "type",
      headerName: label("type"),
      flex: 0.7,
      minWidth: 100,
      sortable: true,
      filter: false,
    },
    {
      field: "scope",
      headerName: label("scope"),
      flex: 0.8,
      minWidth: 120,
      sortable: true,
      filter: false,
      valueFormatter: (params: { value?: string }) =>
        formatUnderscoredLabel(params.value),
    },
    {
      field: "effectiveFromDisplay",
      headerName: label("effectiveFromDisplay"),
      flex: 1,
      minWidth: 160,
      sortable: true,
      filter: false,
      valueFormatter: (params: { value?: string }) =>
        formatProviderDateTimeDisplay(params.value),
    },
    {
      field: "status",
      headerName: label("status"),
      flex: 0.6,
      minWidth: 100,
      sortable: true,
      filter: false,
      cellRenderer: activeInactiveStatusPillRenderer,
    },
    {
      field: "socDiscountStatus",
      headerName: label("socDiscountStatus"),
      flex: 0.6,
      minWidth: 90,
      sortable: true,
      filter: false,
      cellRenderer: (params: { data?: AgreementListRow }) => {
        const row = params.data;
        if (!row) return null;
        const display = formatSocDiscountStatusLabel(row.socDiscountStatus, t);
        return (
          <button
            type="button"
            className={`h-full w-full min-w-0 cursor-pointer truncate text-left text-xs font-semibold capitalize underline-offset-2 hover:underline ${socDiscountStatusTone(row.socDiscountStatus)}`}
            title={display}
            onClick={(event) => {
              event.stopPropagation();
              onOpenSocDiscount(row);
            }}
          >
            {display}
          </button>
        );
      },
    },
    {
      colId: "discount",
      headerName: label("discount"),
      flex: 0.5,
      minWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: AgreementListRow }) => {
        const row = params.data;
        if (!row) return null;
        const addLabel = t("providerMaster.agreement.addDiscount");
        return (
          <div className="flex h-full items-center">
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
              title={addLabel}
              aria-label={addLabel}
              onClick={(event) => {
                event.stopPropagation();
                onAddDiscount(row);
              }}
            >
              <PlusIcon className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      },
    },
  ];
}
