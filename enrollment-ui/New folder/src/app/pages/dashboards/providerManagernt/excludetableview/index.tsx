import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { Page, PageContent } from "../shared/providerShell";
import { showProviderError } from "../shared/ProviderAlertDialog";
import { DynamicTable } from "./DynamicTable";
import { useDynamicTable } from "./useDynamicTable";

export default function ExcludeTableView() {
  const { setBreadcrumbs } = useBreadcrumbContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const table = useDynamicTable({
    initialData: { columns: [], rows: [] },
  });

  useEffect(() => {
    setBreadcrumbs([
      { title: "Provider Management" },
      { title: "Provider Master" },
      { title: "Exclude Table View" },
    ]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  const handleSubmit = useCallback(() => {
    if (!table.validateAll()) {
      showProviderError("Fix validation errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Placeholder until exclude-table save API is available.
      const payload = table.getSubmitPayload();
      console.info("Exclude table submit payload", payload);
      table.exitEditModes();
      toast.success("Exclude table submitted successfully.", {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [table]);

  return (
    <Page
      title="Exclude Table View"
      component="div"
      className="flex min-h-0 flex-1 flex-col"
    >
      <PageContent className="flex min-h-0 flex-1 flex-col !p-1 sm:!p-1.5">
        <DynamicTable
          columns={table.columns}
          rows={table.rows}
          errors={table.errors}
          isBulkEditMode={table.isBulkEditMode}
          isRowEditable={table.isRowEditable}
          onToggleBulkEdit={table.toggleBulkEdit}
          onSetSingleRowEdit={table.setSingleRowEdit}
          onCancelSingleRowEdit={table.cancelSingleRowEdit}
          onCellChange={table.updateCell}
          onAddRow={table.addRow}
          onAddColumn={table.addColumn}
          onRenameColumn={table.renameColumn}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </PageContent>
    </Page>
  );
}
