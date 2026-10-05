import type { TFunction } from "i18next";
import { applyBulkIcMappingGridCellStyle } from "./config";
import { NetworkSourceCapsuleCell } from "./components/NetworkSourceCapsuleCell";

export function createIcWiseGridColumns(t: TFunction) {
  return applyBulkIcMappingGridCellStyle([
    {
      field: "icName",
      headerName: t("providerMaster.icMapping.columns.insuranceCompany"),
      flex: 1.2,
      minWidth: 220,
      sortable: true,
      filter: false,
    },
    {
      field: "providerName",
      headerName: t("providerMaster.icMapping.columns.providerName"),
      flex: 1.2,
      minWidth: 200,
      sortable: true,
      filter: false,
    },
    {
      field: "providerCode",
      headerName: t("providerMaster.icMapping.columns.providerCode"),
      flex: 0.9,
      minWidth: 140,
      sortable: true,
      filter: false,
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
      valueFormatter: (params: { value?: string }) =>
        params.value?.trim() || t("providerMaster.expiry.emptyValue"),
    },
    {
      field: "providerNetworkSource",
      headerName: t("providerMaster.icMapping.columns.networkSource"),
      flex: 0.75,
      minWidth: 110,
      sortable: true,
      filter: false,
      cellRenderer: (params: { value?: string }) => (
        <NetworkSourceCapsuleCell value={params.value} />
      ),
    },
    {
      field: "providerNetworkMode",
      headerName: t("providerMaster.icMapping.columns.networkMode"),
      flex: 0.75,
      minWidth: 110,
      sortable: true,
      filter: false,
      valueFormatter: (params: { value?: string }) =>
        params.value?.trim() || t("providerMaster.expiry.emptyValue"),
    },
    {
      field: "providerNetworkIsActive",
      headerName: t("providerMaster.icMapping.columns.networkActive"),
      flex: 0.65,
      minWidth: 100,
      sortable: true,
      filter: false,
      valueFormatter: (params: { value?: string }) =>
        params.value?.trim() || t("providerMaster.expiry.emptyValue"),
    },
  ]);
}
