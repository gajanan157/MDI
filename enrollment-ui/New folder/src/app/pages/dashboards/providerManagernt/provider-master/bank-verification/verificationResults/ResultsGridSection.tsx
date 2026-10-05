import { useMemo } from "react";
import type { TFunction } from "i18next";
import { AgGridSuperWrapper } from "../../../shared/providerShell";
import type { BankVerificationResultRow, BankVerificationSummaryFilter } from "./types";
import { createVerificationResultColumns } from "./grid";

export type VerificationResultGridRow = BankVerificationResultRow & {
  uiSerialNo: number;
};

function shouldShowRemarkColumn(filter: BankVerificationSummaryFilter): boolean {
  return filter === "VALIDATION_FAILED" || filter === "PROCESSING_FAILED";
}

type ResultsGridSectionProps = {
  rowData: VerificationResultGridRow[];
  t: TFunction;
  activeFilter: BankVerificationSummaryFilter;
  onViewRow: (row: BankVerificationResultRow) => void;
  onEmailRow: (row: BankVerificationResultRow) => void;
};

export function ResultsGridSection({
  rowData,
  t,
  activeFilter,
  onViewRow,
  onEmailRow,
}: Readonly<ResultsGridSectionProps>) {
  const showRemarkColumn = shouldShowRemarkColumn(activeFilter);
  const columnDefs = useMemo(
    () => createVerificationResultColumns(t, onViewRow, onEmailRow, showRemarkColumn),
    [onEmailRow, onViewRow, showRemarkColumn, t],
  );

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <AgGridSuperWrapper
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={false}
        height="100%"
        domLayout="normal"
        getRowId={({ data }) => String((data as VerificationResultGridRow).id)}
        onRowClick={(row) => onViewRow(row as BankVerificationResultRow)}
        openOnRowClick={false}
      />
    </div>
  );
}
