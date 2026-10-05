import type { ColDef } from "ag-grid-community";
import type { TFunction } from "i18next";
import { viewEyeCellRenderer } from "../../shared/providerAgGrid";
import type { IcProvisionRow } from "./dummyData";

function splitCellValues(value?: string | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function configTypePill(label: string) {
  return (
    <span
      key={label}
      className="inline-flex rounded bg-purple-100 px-2 py-1 text-xs leading-none whitespace-nowrap text-purple-700"
    >
      {label}
    </span>
  );
}

function configTypeCellRenderer(params: { value?: string | null }) {
  const items = splitCellValues(params.value);
  if (!items.length) return "—";

  return (
    <div className="flex h-full flex-wrap items-center gap-1 py-0.5">
      {items.map((item) => configTypePill(item))}
    </div>
  );
}

export function createIcProvisioningColumns(
  t: TFunction,
  onView: (row: IcProvisionRow) => void,
): ColDef<IcProvisionRow>[] {
  return [
    {
      colId: "actions",
      headerName: t("providerMaster.common.actions"),
      pinned: "left",
      minWidth: 40,
      maxWidth: 100,
      sortable: false,
      filter: false,
      cellRenderer: viewEyeCellRenderer(onView, {
        title: t("providerMaster.common.view"),
        ariaLabel: t("providerMaster.common.view"),
      }),
    },
    {
      field: "icCode",
      headerName: t("providerMaster.icProvisioning.table.icCode"),
      minWidth: 100,
      cellClass: "font-semibold",
    },
    {
      field: "configType",
      headerName: t("providerMaster.icProvisioning.table.configType"),
      minWidth: 180,
      flex: 1.2,
      cellRenderer: configTypeCellRenderer,
    },
    {
      field: "fileType",
      headerName: t("providerMaster.icProvisioning.table.fileType"),
      minWidth: 100,
    },
    {
      field: "matchingFields",
      headerName: t("providerMaster.icProvisioning.table.matchingFields"),
      minWidth: 140,
    },
    {
      field: "frequency",
      headerName: t("providerMaster.icProvisioning.table.frequency"),
      minWidth: 100,
    },
    {
      field: "commMode",
      headerName: t("providerMaster.icProvisioning.table.commMode"),
      minWidth: 110,
    },
    {
      field: "passwordProtected",
      headerName: t("providerMaster.icProvisioning.table.passwordProtected"),
      minWidth: 150,
      valueFormatter: (params) =>
        params.value ? t("providerMaster.common.yes") : t("providerMaster.common.no"),
    },
  ];
}
