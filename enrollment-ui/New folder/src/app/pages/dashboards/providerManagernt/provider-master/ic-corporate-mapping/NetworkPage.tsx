import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
// import { DocumentChartBarIcon } from "@heroicons/react/24/outline";
import { usePermission } from "@/app/auth/usePermission";
import type {
  UseFormClearErrors,
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetError,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";
import { BulkIcMappingInwardGridSection } from "./inward/GridSection";
import type { BulkIcMappingInwardRow } from "./inward/rows";
import {
  CommonSearch,
  Pagination,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
  type SearchField,
  useDisclosure,
} from "../../shared/providerShell";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { ProviderDataToolbar } from "../../shared/ProviderDataToolbar";
import { PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS } from "../../shared/providerButtonStyles";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
// import { downloadBulkIcMappingInwardReport } from "./inward/export";
import { useBulkIcMappingInwardList } from "./inward/useList";
import { showErrorMessage } from "@/utils/errorHandler";
import {
  AddNewNetworkForm,
  type AddNewNetworkFormShape,
} from "./components/AddNetworkDialog";
import { BulkIcMappingStagingView } from "./staging/View";
import { useIcCorporateMappingBreadcrumbs, useIcCorporateMappingRouteInward } from "./usePage";
import {
  BULK_IC_MAPPING_ADD_PATH,
  buildBulkIcMappingInwardDocumentViewPath,
  buildBulkIcMappingStagingPath,
  isBulkIcMappingProcessPath,
  type BulkIcMappingInwardDocumentNavState,
} from "./config";
import { BulkIcMappingProcessForm } from "./process/ProcessForm";

type BulkIcMappingPageContentProps = {
  control: Control<AddNewNetworkFormShape>;
  errors: FieldErrors<AddNewNetworkFormShape>;
  register: UseFormRegister<AddNewNetworkFormShape>;
  setValue: UseFormSetValue<AddNewNetworkFormShape>;
  setError: UseFormSetError<AddNewNetworkFormShape>;
  clearErrors: UseFormClearErrors<AddNewNetworkFormShape>;
  trigger: UseFormTrigger<AddNewNetworkFormShape>;
  refreshToken: number;
  onSubmitSuccess: (payload: {
    entity: "ic" | "corporate";
    hospitalListFile: File;
    empanelSource: string;
    providerNetwork: string;
    providerTariff: string;
    insurerLabel: string;
    corporateLabel: string;
    inwardNo: string;
    message?: string;
  }) => void;
};

export function BulkIcMappingPageContent({
  control,
  errors,
  register,
  setValue,
  setError,
  clearErrors,
  trigger,
  refreshToken,
  onSubmitSuccess,
}: Readonly<BulkIcMappingPageContentProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { canWrite } = usePermission("provider-ic-corporate-mapping");
  const { inwardNo: stagingInwardNo, stagingInward, loading: stagingInwardLoading, error: stagingInwardError } =
    useIcCorporateMappingRouteInward();
  const isProcessRoute = isBulkIcMappingProcessPath(location.pathname);
  const [uploadFormOpen, setUploadFormOpen] = useState(false);
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const [searchSubmitting, setSearchSubmitting] = useState(false);

  const {
    filteredRows,
    handleSearch,
    page,
    pageSize,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
    loading,
  } = useBulkIcMappingInwardList(refreshToken);

  const onView = useCallback(
    (row: BulkIcMappingInwardRow) => {
      navigate(buildBulkIcMappingStagingPath(row.inwardNo), {
        state: { inward: row },
      });
    },
    [navigate],
  );

  const onViewInwardDocuments = useCallback(
    (row: BulkIcMappingInwardRow) => {
      const navState: BulkIcMappingInwardDocumentNavState = {
        returnPath: BULK_IC_MAPPING_ADD_PATH,
      };
      navigate(buildBulkIcMappingInwardDocumentViewPath(row.inwardNo), {
        state: navState,
      });
    },
    [navigate],
  );

  const searchFields: SearchField[] = useMemo(
    () => [
      {
        name: "inwardNo",
        label: t("providerMaster.icMapping.search.inwardNo"),
        type: "text",
      },
      {
        name: "insurerName",
        label: t("providerMaster.icMapping.search.insurerName"),
        type: "text",
      },
    ],
    [t],
  );

  const handleSearchSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      setSearchSubmitting(true);
      handleSearch(data);
      setSearchSubmitting(false);
    },
    [handleSearch],
  );

  const handleUploadClick = useCallback(() => {
    setUploadFormOpen((open) => !open);
  }, []);

  const handleFormCancel = useCallback(() => {
    setUploadFormOpen(false);
  }, []);

  const handleFormSubmitSuccess = useCallback(
    (payload: Parameters<BulkIcMappingPageContentProps["onSubmitSuccess"]>[0]) => {
      onSubmitSuccess(payload);
      setUploadFormOpen(false);
    },
    [onSubmitSuccess],
  );

  // const handleDownloadReport = useCallback(() => {
  //   downloadBulkIcMappingInwardReport(filteredRows);
  // }, [filteredRows]);

  const handleBackFromStaging = useCallback(() => {
    const fromDashboard = Boolean(
      (location.state as { fromProviderDashboard?: boolean } | null)
        ?.fromProviderDashboard,
    );
    if (fromDashboard) {
      navigate("/provider-masters/dashboard");
      return;
    }
    navigate(BULK_IC_MAPPING_ADD_PATH);
  }, [navigate, location.state]);

  const handleProcessCancel = useCallback(() => {
    handleBackFromStaging();
  }, [handleBackFromStaging]);

  const handleProcessSubmitSuccess = useCallback(
    (payload: { inwardNo: string }) => {
      navigate(buildBulkIcMappingStagingPath(payload.inwardNo), {
        replace: true,
        state: {
          fromProviderDashboard: Boolean(
            (location.state as { fromProviderDashboard?: boolean } | null)
              ?.fromProviderDashboard,
          ),
          inward: stagingInward ?? undefined,
        },
      });
    },
    [navigate, location.state, stagingInward],
  );

  useEffect(() => {
    if (!stagingInwardNo || stagingInwardLoading || stagingInward || !stagingInwardError) {
      return;
    }
    // Keep process/staging open from dashboard even when list lookup misses.
    const fromDashboard = Boolean(
      (location.state as { fromProviderDashboard?: boolean } | null)
        ?.fromProviderDashboard,
    );
    if (fromDashboard || isProcessRoute) {
      return;
    }
    showErrorMessage({ error: stagingInwardError });
    navigate(BULK_IC_MAPPING_ADD_PATH, { replace: true });
  }, [
    navigate,
    stagingInward,
    stagingInwardError,
    stagingInwardLoading,
    stagingInwardNo,
    location.state,
    isProcessRoute,
  ]);

  useIcCorporateMappingBreadcrumbs({
    stagingInwardNo,
    onBackFromStaging: handleBackFromStaging,
  });

  if (stagingInwardNo) {
    if (stagingInwardLoading && !stagingInward) {
      return (
        <div className="flex min-h-0 w-full flex-1 items-center justify-center p-4 text-xs text-gray-500">
          {t("providerMaster.icMapping.loading.inward", { inwardNo: stagingInwardNo })}
        </div>
      );
    }

    if (stagingInward) {
      if (isProcessRoute) {
        return (
          <div className="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-auto p-1">
            <BulkIcMappingProcessForm
              inward={stagingInward}
              control={control}
              errors={errors}
              register={register}
              setValue={setValue}
              setError={setError}
              clearErrors={clearErrors}
              trigger={trigger}
              onCancel={handleProcessCancel}
              onSubmitSuccess={handleProcessSubmitSuccess}
            />
          </div>
        );
      }

      return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <BulkIcMappingStagingView inward={stagingInward} />
        </div>
      );
    }

    return null;
  }

  return (
    <>
      <CompactPageHeader
        title={t("nav.dashboards.provider-masters-ic-corporate-mapping-add-new-network")}
        totalCount={totalItems}
        countLabel="Inwards"
        isRefreshing={loading}
      >
        <CheckListButton
          onClick={toggleSearch}
          label={
            isSearchOpen
              ? t("providerMaster.button.hideSearch")
              : t("providerMaster.button.search")
          }
          bgColor="bg-blue-600"
          textColor="text-white"
          size="text-xs"
          className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
          isSearch
        />
        {canWrite && (
          <CheckListButton
            onClick={handleUploadClick}
            label={t("providerMaster.icMapping.upload")}
            bgColor="bg-blue-600"
            textColor="text-white"
            size="text-xs"
            className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
          />
        )}
      </CompactPageHeader>

      {isSearchOpen ? (
        <CommonSearch
          fields={searchFields}
          onSearch={handleSearchSubmit}
          isSubmitting={searchSubmitting}
          title={t("providerMaster.icMapping.search.inwardTitle")}
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
          allowEmptySearch
        />
      ) : null}

      {uploadFormOpen ? (
        <AddNewNetworkForm
          active={uploadFormOpen}
          onCancel={handleFormCancel}
          control={control}
          errors={errors}
          register={register}
          setValue={setValue}
          setError={setError}
          clearErrors={clearErrors}
          trigger={trigger}
          onSubmitSuccess={handleFormSubmitSuccess}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800 overflow-hidden">
        <BulkIcMappingInwardGridSection
          rowData={filteredRows}
          onView={onView}
          onViewDocuments={onViewInwardDocuments}
          gridHeight={520}
          loading={loading}
        />
      </div>

      <Pagination
        className="shrink-0"
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
      />
    </>
  );
}
