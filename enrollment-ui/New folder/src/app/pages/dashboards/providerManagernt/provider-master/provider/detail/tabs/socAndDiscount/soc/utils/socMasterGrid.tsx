import { EyeIcon } from "@heroicons/react/24/outline";
import { activeInactiveStatusPillRenderer } from "@/app/pages/dashboards/providerManagernt/shared/providerAgGrid";
import { formatProviderDateTimeDisplay } from "@/app/pages/dashboards/providerManagernt/shared/dateFormat";
import type { SocGridColumnLabels } from "../../../../../../../shared/providerMasterI18n";
import type { SocListRow } from "../data/socListData";
import { formatSocListDuration } from "./socListUtils";

export function getSocMasterColumns(
  view: (id: string) => void,
  labels: SocGridColumnLabels,
) {
  return [
    {
      field: "actions",
      headerName: labels.actions,
      width: 72,
      pinned: "left" as const,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: SocListRow }) => {
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
              title={labels.viewSoc}
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
    {
      field: "socIdVersion",
      headerName: labels.version,
      minWidth: 140,
      flex: 1,
      sortable: true,
    },
    {
      field: "socName",
      headerName: labels.socName,
      minWidth: 180,
      flex: 1.2,
      sortable: true,
    },
    {
      field: "applicableIcs",
      headerName: labels.applicableIcs,
      minWidth: 160,
      flex: 1,
      sortable: true,
    },
    {
      field: "lastUpdatedOn",
      headerName: labels.lastUpdated,
      width: 160,
      sortable: true,
      valueFormatter: (params: { value?: string }) =>
        formatProviderDateTimeDisplay(String(params.value ?? "")),
    },
    {
      field: "startDate",
      headerName: labels.startDate,
      width: 160,
      sortable: true,
      valueFormatter: (params: { value?: string }) =>
        formatProviderDateTimeDisplay(String(params.value ?? "")),
    },
    {
      field: "endDate",
      headerName: labels.endDate,
      width: 160,
      sortable: true,
      valueFormatter: (params: { value?: string }) =>
        formatProviderDateTimeDisplay(String(params.value ?? "")),
    },
    {
      field: "duration",
      headerName: labels.duration,
      width: 100,
      sortable: true,
      valueGetter: (params: { data?: SocListRow }) => {
        const row = params.data;
        if (!row) return "";
        return formatSocListDuration(row.startDate, row.endDate);
      },
    },
    {
      field: "status",
      headerName: labels.status,
      width: 100,
      sortable: true,
      cellRenderer: activeInactiveStatusPillRenderer,
    },
  ];
}
