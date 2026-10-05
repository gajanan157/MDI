import { ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import type { NavigateFunction } from "react-router";
import {
  applyBulkIcMappingGridCellStyle,
  buildBulkIcMappingProcessPath,
  buildBulkIcMappingStagingPath,
} from "../../provider-master/ic-corporate-mapping/config";
import { isBulkIcMappingDocumentType } from "../../provider-master/ic-corporate-mapping/upload";
import { createMinimalBulkIcMappingInwardRow } from "../../provider-master/ic-corporate-mapping/inward/rows";
import { buildInwardDocumentViewPath } from "../../shared/inwardDocumentView";
import { formatInwardDateTimeDisplay } from "../../shared/dateFormat";
import {
  buildProviderExclusionInwardPath,
  PROVIDER_DASHBOARD_PATH,
  shouldOpenProviderExclusionInward,
} from "../../provider-master/excluded-provider/inward/paths";
import {
  PROVIDER_INWARD_GRID_STATUS_PILL_BASE_CLASS,
  PROVIDER_INWARD_STATUS_CLASS,
  PROVIDER_INWARD_STATUS_DOT_CLASS,
} from "./providerInwardDashboardConfig";
import type { ProviderInwardRow } from "./providerInwardTypes";
import { ProviderInwardAssignedToCell } from "./taskAssignment/ProviderInwardAssignedToCell";
import {
  formatUnderscoredLabel,
  ProviderStatusPill,
} from "../../shared/dashboard";

export const PROVIDER_INWARD_GRID_AUTO_SIZE = {
  type: "fitGridWidth" as const,
};

function cellWrap(content: ReactNode, center = false) {
  return (
    <div
      className={`flex h-full min-w-0 items-center overflow-hidden ${center ? "justify-center" : ""}`}
    >
      {content}
    </div>
  );
}

/** Opens the inward workflow (exclusion / IC mapping / document list) for a dashboard row. */
export function navigateToProviderInward(
  navigate: NavigateFunction,
  row: ProviderInwardRow,
): void {
  if (shouldOpenProviderExclusionInward(row.documentType)) {
    navigate(
      buildProviderExclusionInwardPath(row.inwardNo, {
        status: row.status,
        documentType: row.documentType,
        sourceEntity: row.sourceEntity,
      }),
      { state: { row } },
    );
    return;
  }

  if (isBulkIcMappingDocumentType(row.documentType)) {
    const inward = createMinimalBulkIcMappingInwardRow(row.inwardNo, {
      documentType: row.documentType,
      insurerName: row.sourceEntity,
      createdAt: row.createdDate,
      uploadedByName: row.createdBy,
      status: row.status,
      departmentId: row.departmentId,
      s3BucketName: row.s3BucketName,
      s3SubBucketName: row.s3SubBucketName,
      inwardSourceEntityId: row.sourceEntityId,
      inwardSourceEntityType: row.sourceEntityType,
    });
    const path =
      row.status === "COMPLETED"
        ? buildBulkIcMappingStagingPath(row.inwardNo)
        : buildBulkIcMappingProcessPath(row.inwardNo);
    navigate(path, {
      state: {
        fromProviderDashboard: true,
        inward,
      },
    });
    return;
  }

  navigate(buildInwardDocumentViewPath(row.inwardNo), {
    state: { returnPath: PROVIDER_DASHBOARD_PATH },
  });
}

export function createProviderInwardGridColumns(
  t: TFunction,
  navigate: NavigateFunction,
  onAssignClick?: (row: ProviderInwardRow) => void,
  summaryRefreshKey?: number,
): ColDef<ProviderInwardRow>[] {
  return applyBulkIcMappingGridCellStyle([
    {
      field: "actions",
      headerName: t("providerMaster.common.actions"),
      width: 84,
      minWidth: 80,
      pinned: "left" as const,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: ProviderInwardRow }) => {
        const row = params.data;
        if (!row) return null;
        return (
          <div className="flex h-full items-center justify-center text-tiny">
            <button
              type="button"
              className="cursor-pointer rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-emerald-700 shadow-2xs transition hover:bg-emerald-100 active:scale-95"
              onClick={(event) => {
                event.stopPropagation();
                navigate(buildInwardDocumentViewPath(row.inwardNo), {
                  state: { returnPath: PROVIDER_DASHBOARD_PATH },
                });
              }}
              aria-label={t("providerMaster.common.viewInwardDocuments", {
                inwardNo: row.inwardNo,
              })}
              title={t("providerMaster.common.viewInwardDocumentsTitle")}
            >
              <ArrowDownTrayIcon className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      },
    },
    {
      field: "inwardNo",
      headerName: t("providerMaster.dashboard.inward.table.inwardNo"),
      pinned: "left",
      minWidth: 155,
      flex: 1.2,
      cellRenderer: (params: { data?: ProviderInwardRow; value?: string }) => {
        const row = params.data;
        if (!row) return null;
        return cellWrap(
          <button
            type="button"
            className="cursor-pointer truncate font-medium text-blue-600 hover:text-blue-800 hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              navigateToProviderInward(navigate, row);
            }}
          >
            {row.inwardNo}
          </button>,
        );
      },
    },
    {
      field: "createdDate",
      headerName: t("providerMaster.dashboard.inward.table.createdDate"),
      minWidth: 145,
      flex: 1.1,
      valueFormatter: (params: ValueFormatterParams<ProviderInwardRow>) =>
        formatInwardDateTimeDisplay(String(params.value ?? "")),
    },
    {
      field: "sourceEntity",
      headerName: t("providerMaster.dashboard.inward.table.sourceEntity"),
      minWidth: 190,
      flex: 1.4,
    },
    {
      field: "documentType",
      headerName: t("providerMaster.dashboard.inward.table.documentType"),
      minWidth: 175,
      flex: 1.25,
      valueFormatter: (params: ValueFormatterParams<ProviderInwardRow, string>) =>
        formatUnderscoredLabel(params.value),
    },
    {
      field: "subcategory",
      headerName: t("providerMaster.dashboard.inward.table.subcategory"),
      minWidth: 160,
      flex: 1.15,
    },
    {
      field: "statusLabel",
      headerName: t("providerMaster.dashboard.inward.table.status"),
      minWidth: 110,
      flex: 0.85,
      headerClass: "ag-header-cell-center",
      cellClass: "ag-cell-center",
      cellRenderer: (params: { data?: ProviderInwardRow }) => {
        const row = params.data;
        if (!row) return null;
        return cellWrap(
          <ProviderStatusPill
            label={row.statusLabel}
            dotClassName={PROVIDER_INWARD_STATUS_DOT_CLASS[row.status]}
            className={`${PROVIDER_INWARD_GRID_STATUS_PILL_BASE_CLASS} ${PROVIDER_INWARD_STATUS_CLASS[row.status]}`}
          />,
          true,
        );
      },
    },
    {
      field: "assignedTo",
      headerName: t("providerMaster.dashboard.inward.table.assignedTo"),
      minWidth: 155,
      flex: 1.15,
      sortable: false,
      headerClass: "ag-header-cell-center",
      cellClass: "ag-cell-center",
      cellRenderer: (params: { data?: ProviderInwardRow }) => {
        const row = params.data;
        if (!row || !onAssignClick) return null;
        return cellWrap(
          <ProviderInwardAssignedToCell
            row={row}
            onAssignClick={onAssignClick}
            refreshKey={summaryRefreshKey}
          />,
          true,
        );
      },
    },
    {
      field: "createdBy",
      headerName: t("providerMaster.dashboard.inward.table.createdBy"),
      minWidth: 120,
      flex: 0.9,
    },
  ]) as ColDef<ProviderInwardRow>[];
}
