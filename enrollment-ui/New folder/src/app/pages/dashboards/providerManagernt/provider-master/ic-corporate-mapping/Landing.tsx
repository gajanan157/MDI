import {
  AgGridSuperWrapper,
  CommonSearch,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
  type SearchField,
  useDisclosure,
} from "../../shared/providerShell";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { ProviderDataToolbar } from "../../shared/ProviderDataToolbar";
import { PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS } from "../../shared/providerButtonStyles";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
// import { DocumentChartBarIcon } from "@heroicons/react/24/outline";
import { createIcWiseGridColumns } from "./gridColumns";
// import { downloadBlobFile } from "@/utils/dom/downloadBlobFile";
import { usePermission } from "@/app/auth/usePermission";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { LoadingState } from "@/components/shared/LoadingState";
import { useGlobalNetworkMappingList } from "./networkMapping/useList";

type IcCorporateMappingLandingProps = {
  onAddNewNetwork: () => void;
};

export default function IcCorporateMappingLanding({
  onAddNewNetwork,
}: Readonly<IcCorporateMappingLandingProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { canWrite } = usePermission("provider-ic-corporate-mapping");
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const insurerList = useAppSelector((state) => state.insurerList.insurerList);

  const {
    rows,
    page,
    pageSize,
    totalItems,
    loading,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
  } = useGlobalNetworkMappingList();

  useEffect(() => {
    if ((insurerList?.length ?? 0) > 0) return;
    dispatch(fetchInsurerList());
  }, [dispatch, insurerList]);

  const icOptions = useMemo(
    () =>
      (insurerList ?? []).map((insurer) => ({
        value: insurer.insurerId,
        label: insurer.insurerName,
      })),
    [insurerList],
  );

  const searchFields: SearchField[] = useMemo(
    () => [
      {
        name: "providerName",
        label: t("providerMaster.icMapping.search.providerName"),
        type: "text",
      },
      {
        name: "rohiniNumber",
        label: t("providerMaster.icMapping.search.rohiniNumber"),
        type: "text",
      },
      {
        name: "icId",
        label: t("providerMaster.icMapping.search.insuranceCompany"),
        type: "dropdown",
        options: icOptions,
      },
    ],
    [icOptions, t],
  );

  const gridColumns = useMemo(
    () => createIcWiseGridColumns(t),
    [t],
  );

  // const handleExport = useCallback(() => {
  //   const header = [
  //     t("providerMaster.icMapping.columns.insuranceCompany"),
  //     t("providerMaster.icMapping.columns.providerName"),
  //     t("providerMaster.icMapping.columns.providerCode"),
  //     t("providerMaster.icMapping.columns.networkSource"),
  //     t("providerMaster.icMapping.columns.networkMode"),
  //     t("providerMaster.icMapping.columns.networkActive"),
  //   ];
  //   const lines = rows.map((r) => [
  //     r.icName,
  //     r.providerName,
  //     r.providerCode,
  //     r.providerNetworkSource,
  //     r.providerNetworkMode,
  //     r.providerNetworkIsActive,
  //   ]);
  //   const csv = [header, ...lines]
  //     .map((cols) =>
  //       cols.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","),
  //     )
  //     .join("\r\n");
  //   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  //   downloadBlobFile({ blob, filename: "ic-corporate-network-summary.csv" });
  // }, [rows, t]);

  return (
    <>
      <CompactPageHeader
        title={t("providerMaster.title.icCorporateMapping")}
        totalCount={totalItems}
        countLabel="Mappings"
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
            onClick={onAddNewNetwork}
            label={t("providerMaster.icMapping.bulkMapping")}
            bgColor="bg-blue-600"
            textColor="text-white"
            size="text-xs"
            className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
          />
        )}
      </CompactPageHeader>

      {isSearchOpen ? (
        <CommonSearch
          key="ic-corp-landing-search"
          fields={searchFields}
          onSearch={(data) => handleSearch(data as Record<string, unknown>)}
          isSubmitting={loading}
          title={t("providerMaster.icMapping.search.networkSummaryTitle")}
          showToggleButton={false}
          isOpen={true}
          onToggle={toggleSearch}
          allowEmptySearch
        />
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <LoadingState message={t("providerMaster.icMapping.loading.networkMappings")} />
          </div>
        ) : null}
        <AgGridSuperWrapper
          rowData={rows}
          columnDefs={gridColumns}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
          height="100%"
          domLayout="normal"
        />
      </div>
    </>
  );
}
