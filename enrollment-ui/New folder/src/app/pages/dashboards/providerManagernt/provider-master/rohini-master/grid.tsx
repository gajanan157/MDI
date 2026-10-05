import type { TFunction } from "i18next";
import type { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import {
  createExpiryAlertCellRenderer,
  msUntilExpiry,
} from "../../shared/providerAgGrid";
import { formatProviderDateTimeDisplay } from "../../shared/dateFormat";
import type { RohiniRow } from "./config";
import { RohiniLocationPinCell } from "./RohiniLocationPinCell";

export function createRohiniMasterColumns(
  onView: (row: RohiniRow) => void,
  onOpenMap: ((latitude: number, longitude: number) => void) | undefined,
  t: TFunction,
): ColDef<RohiniRow>[] {
  return [
    {
      field: "providerName",
      headerName: t("providerMaster.table.providerName"),
      flex: 1.4,
      minWidth: 180,
      sortable: true,
      filter: false,
      cellRenderer: (params: ICellRendererParams<RohiniRow>) => {
        const value = String(params.value ?? "").trim();
        if (!value) return "—";
        return (
          <button
            type="button"
            className="cursor-pointer text-primary-700 hover:underline underline-offset-2"
            onClick={(event) => {
              event.stopPropagation();
              if (params.data) onView(params.data);
            }}
          >
            {value}
          </button>
        );
      },
    },
    {
      field: "providerRohiniCode",
      headerName: t("providerMaster.rohiniMaster.rohiniCode"),
      flex: 1,
      minWidth: 130,
      sortable: true,
      filter: false,
    },
    {
      colId: "expiryAlert",
      headerName: t("providerMaster.table.rohiniExpiryAlert"),
      minWidth: 190,
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: createExpiryAlertCellRenderer<RohiniRow>(
        (row) => row.rohiniExpiryDate,
        msUntilExpiry,
        t,
      ),
    },
    {
      field: "rohiniExpiryDate",
      headerName: t("providerMaster.rohiniMaster.rohiniExpiryDate"),
      flex: 1,
      minWidth: 160,
      sortable: true,
      filter: false,
      valueFormatter: (params: ValueFormatterParams<RohiniRow>) =>
        formatProviderDateTimeDisplay(String(params.value ?? "")),
    },
    {
      field: "rohiniNextRenewalDate",
      headerName: t("providerMaster.rohiniMaster.nextRenewalDue"),
      flex: 1,
      minWidth: 160,
      sortable: true,
      filter: false,
      valueFormatter: (params: ValueFormatterParams<RohiniRow>) =>
        formatProviderDateTimeDisplay(String(params.value ?? "")),
    },
    {
      field: "beds",
      headerName: t("providerMaster.table.noOfBeds"),
      flex: 0.7,
      minWidth: 110,
      sortable: true,
      filter: false,
    },
    {
      colId: "location",
      headerName: t("providerMaster.rohiniMaster.location"),
      flex: 0.6,
      minWidth: 110,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<RohiniRow>) => (
        <RohiniLocationPinCell
          latitude={params.data?.latitude}
          longitude={params.data?.longitude}
          onOpenMap={onOpenMap}
          t={t}
        />
      ),
    },
    {
      field: "address",
      headerName: t("providerMaster.table.address"),
      flex: 1.6,
      minWidth: 220,
      sortable: true,
      filter: false,
    },
    {
      field: "email",
      headerName: t("providerMaster.rohiniMaster.emailId"),
      flex: 1.2,
      minWidth: 180,
      sortable: true,
      filter: false,
    },
    {
      field: "contactNumber",
      headerName: t("providerMaster.rohiniMaster.contactNumber"),
      flex: 1,
      minWidth: 130,
      sortable: true,
      filter: false,
    },
    {
      field: "state",
      headerName: t("providerMaster.addForm.state"),
      flex: 0.9,
      minWidth: 110,
      sortable: true,
      filter: false,
    },
    {
      field: "district",
      headerName: t("providerMaster.addForm.district"),
      flex: 0.9,
      minWidth: 110,
      sortable: true,
      filter: false,
    },
    {
      field: "city",
      headerName: t("providerMaster.rohiniMaster.cityTown"),
      flex: 0.9,
      minWidth: 120,
      sortable: true,
      filter: false,
    },
    {
      field: "pincode",
      headerName: t("providerMaster.rohiniMaster.pinCode"),
      flex: 0.7,
      minWidth: 100,
      sortable: true,
      filter: false,
    },
  ] satisfies ColDef<RohiniRow>[];
}
