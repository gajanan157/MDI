import { EyeIcon } from "@heroicons/react/24/outline";
import type { DiscountGridColumnLabels } from "../../../../../../../shared/providerMasterI18n";
import type { DiscountListRow } from "../types/discountTypes";
import {
  DiscountScopeNamesCell,
} from "../components/DiscountScopeNamesCell";
import { splitDiscountScopeNames } from "./discountScopeNames";
import { discountStatusTone, formatDiscountStatusLabel } from "./discountStatus";

function renderScopeNamesCell(
  row: DiscountListRow | undefined,
  field: "insuranceCo" | "corporate",
  labels: DiscountGridColumnLabels,
) {
  if (!row) return null;
  const names =
    field === "insuranceCo"
      ? (row.insuranceNames ?? splitDiscountScopeNames(row.insuranceCo))
      : (row.corporateItems?.map((item) => ({
          name: item.name,
          detail: item.insurerName,
        })) ?? splitDiscountScopeNames(row.corporate));

  return (
    <DiscountScopeNamesCell
      names={names}
      scope={field === "insuranceCo" ? "insurance" : "corporate"}
      title={field === "insuranceCo" ? labels.insuranceCo : labels.corporate}
    />
  );
}

export function getDiscountMasterColumns(
  view: (id: string) => void,
  labels: DiscountGridColumnLabels,
) {
  return [
    {
      field: "actions",
      headerName: labels.actions,
      width: 72,
      pinned: "left" as const,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: DiscountListRow }) => {
        const row = params.data;
        if (!row) return null;
        return (
          <div className="flex h-full items-center justify-center">
            <button
              type="button"
              className="cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
              onClick={(e) => {
                e.stopPropagation();
                view(row.id);
              }}
              title={labels.viewDiscount}
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
    {
      field: "agreementName",
      headerName: labels.agreementName,
      minWidth: 220,
      flex: 1.3,
      sortable: true,
    },
    {
      field: "insuranceCo",
      headerName: labels.insuranceCo,
      minWidth: 260,
      flex: 1.4,
      sortable: true,
      cellClass: "discount-scope-cell",
      cellStyle: {
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        paddingLeft: 8,
        paddingRight: 8,
      },
      cellRenderer: (params: { data?: DiscountListRow }) =>
        renderScopeNamesCell(params.data, "insuranceCo", labels),
    },
    {
      field: "corporate",
      headerName: labels.corporate,
      minWidth: 260,
      flex: 1.4,
      sortable: true,
      cellClass: "discount-scope-cell",
      cellStyle: {
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        paddingLeft: 8,
        paddingRight: 8,
      },
      cellRenderer: (params: { data?: DiscountListRow }) =>
        renderScopeNamesCell(params.data, "corporate", labels),
    },
    {
      field: "discountTypes",
      headerName: labels.discountType,
      minWidth: 180,
      flex: 1.2,
      sortable: true,
      valueFormatter: (params: { value?: string }) => {
        const raw = String(params.value ?? "").trim();
        if (!raw) return "—";
        return raw
          .split(",")
          .map((part) => {
            const type = part.trim();
            return labels.discountTypeLabels[type] ?? type;
          })
          .filter(Boolean)
          .join(", ");
      },
    },
    {
      field: "effectiveFrom",
      headerName: labels.effectiveFrom,
      minWidth: 120,
      flex: 0.8,
      sortable: true,
    },
    {
      field: "status",
      headerName: labels.status,
      width: 120,
      sortable: true,
      cellRenderer: (params: { value?: string }) => {
        const status = String(params.value ?? "").trim();
        if (!status) return null;
        return (
          <span
            className={`inline-flex rounded px-2 py-1 text-xs ${discountStatusTone(status)}`}
          >
            {formatDiscountStatusLabel(status)}
          </span>
        );
      },
    },
  ];
}
