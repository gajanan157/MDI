import { useMemo } from "react";
import { AgGridSuperWrapper } from "../../shared/providerShell";
import type { BankVerificationInwardRow } from "./inwardTypes";
import { createBankVerificationColumns } from "./grid";
import type { TFunction } from "i18next";

type InwardGridSectionProps = {
  rowData: BankVerificationInwardRow[];
  t: TFunction;
  onView: (row: BankVerificationInwardRow) => void;
  onViewDocuments: (row: BankVerificationInwardRow) => void;
  loading?: boolean;
};

export function InwardGridSection({
  rowData,
  t,
  onView,
  onViewDocuments,
  loading = false,
}: Readonly<InwardGridSectionProps>) {
  const columnDefs = useMemo(
    () => createBankVerificationColumns(t, onView, onViewDocuments),
    [onViewDocuments, onView, t],
  );

  return (
    <div className="bank-verification-inward-grid relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
      {loading ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : null}
      <AgGridSuperWrapper
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={false}
        height="100%"
        domLayout="normal"
        getRowId={({ data }) => String((data as BankVerificationInwardRow).id)}
        onRowClick={(row) => onView(row as BankVerificationInwardRow)}
        openOnRowClick={false}
      />
    </div>
  );
}
