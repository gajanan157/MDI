import { PlusIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import { usePermission } from "@/app/auth/usePermission";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { Button } from "@/components/ui";
import { AgGridSuperWrapper, Page, PageContent, PROVIDER_GRID_DEFAULT_PAGE_SIZE, PROVIDER_GRID_PAGE_SIZE_OPTIONS } from "../../shared/providerShell";
import { createIcProvisioningColumns } from "./grid";
import type { IcProvisionRow } from "./dummyData";
import { loadIcProvisionRows } from "./storage";

export default function IcProvisioningPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const { canWrite } = usePermission("provider-ic-provisioning");
  const pageTitle = t("nav.dashboards.provider-masters-ic-provisioning");
  const [rows, setRows] = useState<IcProvisionRow[]>(() => loadIcProvisionRows());

  useEffect(() => {
    setBreadcrumbs([
      { title: t("providerMaster.moduleName") },
      { title: t("providerMaster.providerMasterLabel") },
      { title: pageTitle },
    ]);
    return () => setBreadcrumbs([]);
  }, [pageTitle, setBreadcrumbs, t]);

  useEffect(() => {
    setRows(loadIcProvisionRows());
  }, [location.pathname]);

  const handleOpenProvision = useCallback(
    (row: IcProvisionRow) => {
      navigate(`/provider-masters/ic-provisioning/${row.id}/edit`);
    },
    [navigate],
  );

  const columnDefs = useMemo(
    () => createIcProvisioningColumns(t, handleOpenProvision),
    [handleOpenProvision, t],
  );

  return (
    <Page title={pageTitle}>
      <PageContent className="flex min-h-0 flex-1 flex-col p-1">
        <div className="flex min-h-0 w-full flex-1 flex-col gap-1">
          {canWrite && (
            <div className="flex shrink-0 justify-end">
              <Button
                color="primary"
                className="flex h-8 items-center gap-1.5 px-3 text-xs"
                onClick={() => navigate("/provider-masters/ic-provisioning/add")}
              >
                <PlusIcon className="size-4" />
                {t("providerMaster.icProvisioning.addNewConfiguration")}
              </Button>
            </div>
          )}

          <div className="flex min-h-0 min-h-[12rem] flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-dark-500 dark:bg-dark-700">
            <div className="shrink-0 border-b border-gray-200 px-4 py-3 dark:border-dark-500">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-50">
                {t("providerMaster.icProvisioning.configuredProvisions")}
              </h2>
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-1">
              <AgGridSuperWrapper
                rowData={rows}
                columnDefs={columnDefs}
                pageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
                height="100%"
                pagination
                pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
                getRowId={({ data }) => String((data as IcProvisionRow).id)}
                onRowClick={(row) => handleOpenProvision(row as IcProvisionRow)}
                openOnRowClick={false}
              />
            </div>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
