import type { TFunction } from "i18next";
import {
  createExpiryAlertCellRendererEn,
  createRohiniCodeCellRenderer,
  expiryAlertTooltipEn,
  msUntilExpiry,
} from "../../../../shared/providerAgGrid";
import {
  formatNetworkSourceDisplay,
  formatProviderNetworkTypeDisplay,
  isNetworkProviderType,
} from "../../../../shared/providerGridDisplayLabels";
import type { NetworkProviderRow } from "@/store/features/provider/providerTypes";
import { formatProviderTaxonomyLabel } from "../../utils/providerTypeConstants";

export type ProviderNetworkType = "NETWORK" | "NON_NETWORK";
export type ProviderGridRow = NetworkProviderRow;

const createProviderTypeCellRenderer = () => (params: { value?: string | null }) => {
  const value = String(params.value ?? "").trim();
  if (!value) return "—";
  return (
    <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
      {formatProviderTaxonomyLabel(value)}
    </span>
  );
};

const createProviderNetworkTypeCellRenderer = () => (params: { value?: string | null }) => {
  const label = formatProviderNetworkTypeDisplay(params.value);
  if (!label) return "—";
  const isNetwork = isNetworkProviderType(params.value);
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs ${
        isNetwork
          ? "bg-purple-100 text-purple-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {label}
    </span>
  );
};

type CreateProviderGridColumnsOptions = {
  onOpenProvider?: (row: ProviderGridRow) => void;
};

const createProviderCodeLinkCellRenderer =
  (onOpenProvider?: (row: ProviderGridRow) => void) =>
  (params: { value?: string | null; data?: ProviderGridRow }) => {
    const value = String(params.value ?? "").trim();
    if (!value) return "—";
    if (!onOpenProvider || !params.data) return value;
    return (
      <button
        type="button"
        className="cursor-pointer text-left text-primary-700 underline-offset-2 hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          onOpenProvider(params.data!);
        }}
      >
        {value}
      </button>
    );
  };

export function createProviderGridColumns(
  t: TFunction,
  options: CreateProviderGridColumnsOptions = {},
) {
  const rohiniCodeCellRenderer = createRohiniCodeCellRenderer<ProviderGridRow>(t);
  const { onOpenProvider } = options;

  return [
    {
      field: "providerCode",
      headerName: t("providerMaster.table.providerCode"),
      minWidth: 140,
      pinned: "left",
      cellRenderer: createProviderCodeLinkCellRenderer(onOpenProvider),
    },
    {
      field: "providerName",
      headerName: t("providerMaster.table.providerName"),
      minWidth: 160,
      flex: 2,
    },
    {
      field: "providerType",
      headerName: t("providerMaster.table.providerType"),
      minWidth: 104,
      flex: 1,
      cellRenderer: createProviderTypeCellRenderer(),
    },
    {
      field: "providerNetworkType",
      headerName: t("providerMaster.table.providerNetworkType"),
      minWidth: 130,
      flex: 1,
      cellRenderer: createProviderNetworkTypeCellRenderer(),
    },
    {
      field: "networkSource",
      headerName: t("providerMaster.table.networkSource"),
      minWidth: 110,
      flex: 1,
      valueFormatter: (params: { value?: string | null }) =>
        formatNetworkSourceDisplay(params.value),
    },
    {
      field: "providerRohiniCode",
      headerName: t("providerMaster.table.providerRohiniCode"),
      minWidth: 130,
      flex: 1.5,
      cellRenderer: rohiniCodeCellRenderer,
    },
    {
      headerName: t("providerMaster.table.rohiniExpiryAlert"),
      field: "expiryAlert",
      minWidth: 135,
      flex: 1.4,
      sortable: false,
      filter: false,
      tooltipValueGetter: (params: { data?: ProviderGridRow }) => {
        const ms = msUntilExpiry(params.data?.effectiveToDate ?? "");
        return expiryAlertTooltipEn(ms);
      },
      cellRenderer: createExpiryAlertCellRendererEn<ProviderGridRow>(
        (row) => row.effectiveToDate ?? "",
        msUntilExpiry,
      ),
    },
    {
      field: "noOfBeds",
      headerName: t("providerMaster.table.noOfBeds"),
      minWidth: 80,
      flex: 0.8,
    },
    {
      field: "city",
      headerName: t("providerMaster.table.city"),
      minWidth: 80,
      flex: 1,
    },
    {
      field: "state",
      headerName: t("providerMaster.table.state"),
      minWidth: 90,
      flex: 1.05,
    },
    {
      field: "address",
      headerName: t("providerMaster.table.address"),
      minWidth: 200,
      flex: 3,
    },
  ];
}
