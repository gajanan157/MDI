import {
  ClipboardDocumentListIcon,
  CloudArrowUpIcon,
  // DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { usePermission } from "@/app/auth/usePermission";
import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AgGridSuperWrapper,
  CheckListButton,
  CommonSearch,
  Page,
  PageContent,
  Pagination,
  ProviderDataToolbar,
  useDisclosure,
} from "../../shared/providerShell";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { createRohiniSearchFields } from "../../shared/providerMasterI18n";
import { ROHINI_PAGE_SIZE_OPTIONS } from "./config";
import { RohiniMasterDialogs } from "./Dialogs";
import { createRohiniMasterColumns } from "./grid";
import { useRohiniMasterPage } from "./usePage";

export default function RohiniMasterPage() {
  const { t } = useTranslation();
  const { canWrite } = usePermission("provider-rohini-master");
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    sortedRohiniData,
    rohiniLoading,
    rohiniExportLoading,
    searchApplyPending,
    exportPending,
    handleSearch,
    handleViewRow,
    // handleExportXlsx,
    openLocationMap,
    isViewOpen,
    setIsViewOpen,
    viewDialogFields,
    isLocationMapOpen,
    setIsLocationMapOpen,
    locationMapCoords,
    createInwardOpen,
    openCreateInwardModal,
    closeCreateInwardModal,
    handleRohiniUploadSuccess,
    activityLogOpen,
    openActivityLog,
    closeActivityLog,
  } = useRohiniMasterPage();

  const rohiniSearchFields = useMemo(
    () => createRohiniSearchFields(t),
    [t],
  );

  const columnDefs = useMemo<ColDef[]>(
    () =>
      createRohiniMasterColumns((row) => {
        handleViewRow(row);
      }, openLocationMap, t),
    [handleViewRow, openLocationMap, t],
  );

  // const exportDisabled = rohiniExportLoading || exportPending || totalItems === 0;
  //
  // const exportTitle =
  //   totalItems === 0
  //     ? t("providerMaster.export.noData")
  //     : t("providerMaster.rohiniMaster.exportHint");

  return (
    <Page title={t("providerMaster.rohiniMaster.title")}>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title={t("providerMaster.rohiniMaster.title")}
          totalCount={totalItems}
          countLabel="Hospitals"
          isRefreshing={searchApplyPending && rohiniLoading}
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
            <button
              type="button"
              onClick={openCreateInwardModal}
              className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-white transition-colors bg-emerald-600 hover:bg-emerald-700 shadow-2xs cursor-pointer"
            >
              <CloudArrowUpIcon className="size-3.5" />
              <span>{t("providerMaster.rohiniMaster.upload")}</span>
            </button>
          )}
          <button
            type="button"
            onClick={openActivityLog}
            className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-700 dark:text-dark-200 transition-colors border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-700 shadow-2xs cursor-pointer"
          >
            <ClipboardDocumentListIcon className="size-3.5" />
            <span>{t("providerMaster.rohiniMaster.versionLog")}</span>
          </button>
        </CompactPageHeader>

        {isSearchOpen && (
          <CommonSearch
            fields={rohiniSearchFields}
            onSearch={handleSearch}
            isSubmitting={searchApplyPending && rohiniLoading}
            title={t("providerMaster.rohiniMaster.filterTitle")}
            showToggleButton={false}
            isOpen={true}
            onToggle={toggleSearch}
          />
        )}

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <AgGridSuperWrapper
            rowData={sortedRohiniData}
            columnDefs={columnDefs}
            pageSize={pageSize}
            height="100%"
            pagination={false}
            onRowClick={(row) => handleViewRow(row)}
            openOnRowClick={false}
          />
        </div>

        <Pagination
          className="shrink-0"
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[...ROHINI_PAGE_SIZE_OPTIONS]}
        />
      </div>

      <RohiniMasterDialogs
        canWrite={canWrite}
        activityLogOpen={activityLogOpen}
        onCloseActivityLog={closeActivityLog}
        isViewOpen={isViewOpen}
        onCloseView={() => setIsViewOpen(false)}
        viewDialogFields={viewDialogFields}
        isLocationMapOpen={isLocationMapOpen}
        onCloseLocationMap={() => setIsLocationMapOpen(false)}
        locationLatitude={locationMapCoords?.latitude}
        locationLongitude={locationMapCoords?.longitude}
        busy={exportPending || rohiniExportLoading}
        createInwardOpen={createInwardOpen}
        onCloseCreateInward={closeCreateInwardModal}
        onRohiniUploadSuccess={handleRohiniUploadSuccess}
      />
    </Page>
  );
}
