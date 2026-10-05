import type { ICellRendererParams } from "ag-grid-community";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import type { InfrastructureGridRow } from "./infrastructureCategoryGrid";
import { formatInfrastructureDisplayValue } from "./mergeInfrastructureCategoryItems";
import {
  CellAlign,
  OperationalStatusBadge,
  VerifiedBadge,
  YesNoBadge,
} from "./infrastructureCategoryGridCellUi";
import { formatVerifiedOnDate } from "./infrastructureCategoryGridCell.helpers";

function isChildGridRow(row?: InfrastructureGridRow): boolean {
  return Boolean(row && !row.isCategory);
}

export function infrastructureAvailabilityCell(
  params: ICellRendererParams<InfrastructureGridRow, boolean>,
) {
  if (!isChildGridRow(params.data)) return null;
  return (
    <CellAlign align="center">
      <YesNoBadge value={Boolean(params.value)} />
    </CellAlign>
  );
}

export function infrastructureVerifiedCell(
  params: ICellRendererParams<InfrastructureGridRow, boolean>,
) {
  if (!isChildGridRow(params.data)) return null;
  return (
    <CellAlign align="center">
      <VerifiedBadge value={Boolean(params.value)} />
    </CellAlign>
  );
}

export function infrastructureOperationalStatusCell(
  params: ICellRendererParams<InfrastructureGridRow, string>,
) {
  if (!isChildGridRow(params.data)) return null;
  return (
    <CellAlign align="center">
      <OperationalStatusBadge value={String(params.value ?? "")} />
    </CellAlign>
  );
}

export function infrastructureVerifiedOnCell(
  params: ICellRendererParams<InfrastructureGridRow, string>,
) {
  if (!isChildGridRow(params.data)) return null;
  const formatted = formatVerifiedOnDate(String(params.value ?? ""));
  if (formatted === "-") {
    return (
      <CellAlign align="center">
        <span className="text-[10px] leading-tight text-gray-400">-</span>
      </CellAlign>
    );
  }
  return (
    <CellAlign align="center">
      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight text-sky-800 ring-1 ring-sky-200/70 bg-sky-50`}>
        <CalendarDaysIcon className="h-3 w-3 shrink-0 text-sky-500" aria-hidden />
        {formatted}
      </span>
    </CellAlign>
  );
}

export function infrastructureVerifiedByCell(
  params: ICellRendererParams<InfrastructureGridRow, string>,
) {
  if (!isChildGridRow(params.data)) return null;
  const text = formatInfrastructureDisplayValue(String(params.value ?? ""));
  if (text === "-") {
    return (
      <CellAlign align="center">
        <span className="text-[10px] leading-tight text-gray-400">-</span>
      </CellAlign>
    );
  }
  return (
    <CellAlign align="center">
      <span className="truncate text-[10px] leading-tight text-slate-700">{text}</span>
    </CellAlign>
  );
}

export function infrastructureTotalCountCell(
  params: ICellRendererParams<InfrastructureGridRow, number | null>,
) {
  if (!isChildGridRow(params.data)) return null;
  if (params.value === null || params.value === undefined) {
    return (
      <CellAlign align="center">
        <span className="text-[10px] leading-tight text-gray-400">-</span>
      </CellAlign>
    );
  }
  return (
    <CellAlign align="center">
      <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-tight text-slate-800 ring-1 ring-slate-200/80">
        {params.value}
      </span>
    </CellAlign>
  );
}
