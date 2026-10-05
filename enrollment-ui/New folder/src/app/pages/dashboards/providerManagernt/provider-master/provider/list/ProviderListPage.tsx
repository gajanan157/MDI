import { useCallback, useEffect, useMemo, useState } from "react";
import { usePermission } from "@/app/auth/usePermission";
// import { DocumentChartBarIcon } from "@heroicons/react/24/outline";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  // exportProviderList,
  fetchProviderList,
} from "@/store/features/provider/providerSlice";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import type { NetworkProviderRow } from "@/store/features/provider/providerTypes";
import { showErrorMessage } from "@/utils/errorHandler";
import {
  AgGridSuperWrapper,
  CommonSearch,
  Page,
  PageContent,
  Pagination,
  PROVIDER_GRID_AUTO_SIZE_FIT_WIDTH,
  PROVIDER_GRID_DEFAULT_PAGE_SIZE,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
  ProviderDataToolbar,
  useAppDispatch,
  useAppSelector,
  useDisclosure,
} from "../../../shared/providerShell";
import { PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS } from "../../../shared/providerButtonStyles";
import {
  PROVIDERS_ADD_PATH,
  providerDetailDefaultPath,
} from "../utils/providersPaths";
import ProvidersMobileView from "./ProvidersMobileView";
import {
  createProviderGridColumns,
  type ProviderGridRow,
} from "./utils/providerGridColumns";
import { createProviderSearchFields } from "./utils/providerListConfig";
import {
  buildProviderListQuery,
  toProviderGridRow,
  type ProviderSearchFilters,
} from "./utils/providerListHelpers";

const PROVIDER_ROLE_PROVIDER_TYPE = "HOSPITAL" as const;

export default function ProvidersTabbed() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const providerList = useAppSelector((state) => state.providerList);
  const stateList = useAppSelector((state) => state.stateCity.stateList);
  const { canWrite } = usePermission("provider-list");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PROVIDER_GRID_DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<ProviderSearchFilters>(() => ({
    providerType: PROVIDER_ROLE_PROVIDER_TYPE,
  }));
  /** Hide stale rows while a new search is in flight (filters remapped before API returns). */
  const [isSearchApplying, setIsSearchApplying] = useState(false);
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const stateOptions = useMemo(
    () =>
      stateList.map((item) => ({
        label: item.stateName,
        value: item.stateName,
      })),
    [stateList],
  );
  const providerSearchFields = useMemo(
    () => createProviderSearchFields(t, { stateOptions }),
    [t, stateOptions],
  );
  const handleOpenProvider = useCallback(
    (row: ProviderGridRow) => {
      navigate(providerDetailDefaultPath(String(row.id)), {
        state: row.providerNetworkType
          ? { providerNetworkType: row.providerNetworkType }
          : undefined,
      });
    },
    [navigate],
  );

  const providerColumns = useMemo(
    () => createProviderGridColumns(t, { onOpenProvider: handleOpenProvider }),
    [t, handleOpenProvider],
  );

  useEffect(() => {
    if (!providerList.error) return;
    showErrorMessage({
      error: providerList.error,
      status: providerList.errorStatus ?? undefined,
    });
  }, [providerList.error, providerList.errorStatus]);

  useEffect(() => {
    dispatch(
      fetchProviderList(buildProviderListQuery(filters, page, pageSize)),
    );
  }, [page, pageSize, filters, dispatch]);

  useEffect(() => {
    // Only clear after a fetch finishes — do not depend on isSearchApplying,
    // or the flag resets before pending flips loading to true.
    if (!providerList.loading) {
      setIsSearchApplying(false);
    }
  }, [providerList.loading]);

  const gridRows = useMemo(() => {
    // Avoid remapping old rows with the new Network Source (e.g. TPA → Non-Network)
    // for ~2s while Apply is still fetching matching results.
    if (isSearchApplying) return [];
    return providerList.rows.map((row: NetworkProviderRow) =>
      toProviderGridRow(row, filters.networkSource),
    );
  }, [isSearchApplying, providerList.rows, filters.networkSource]);

  let totalRecords = gridRows.length;
  if (isSearchApplying) {
    totalRecords = 0;
  } else if (providerList.totalElements > 0) {
    totalRecords = providerList.totalElements;
  }

  const handleSearch = useCallback((data: ProviderSearchFilters) => {
    setIsSearchApplying(true);
    setFilters({ ...data, providerType: PROVIDER_ROLE_PROVIDER_TYPE });
    setPage(1);
  }, []);

  // const handleExport = useCallback(async () => {
  //   if (
  //     providerList.loading ||
  //     providerList.exportLoading ||
  //     totalRecords === 0
  //   ) {
  //     return;
  //   }
  //
  //   try {
  //     await dispatch(exportProviderList(providerList.query)).unwrap();
  //   } catch (error) {
  //     showErrorMessage({
  //       error:
  //         error instanceof Error
  //           ? error.message
  //           : t("providerMaster.export.failed"),
  //     });
  //   }
  // }, [
  //   dispatch,
  //   providerList.exportLoading,
  //   providerList.loading,
  //   providerList.query,
  //   totalRecords,
  //   t,
  // ]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchProviderList(buildProviderListQuery(filters, page, pageSize)));
  }, [dispatch, filters, page, pageSize]);

  return (
    <Page title={t("providerMaster.title.providers")}>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title={t("providerMaster.title.providers")}
          totalCount={totalRecords}
          countLabel="Providers"
          onRefresh={handleRefresh}
          isRefreshing={providerList.loading}
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
              onClick={() => navigate(PROVIDERS_ADD_PATH)}
              label={t("providerMaster.button.addProvider")}
              bgColor="bg-blue-600"
              textColor="text-white"
              size="text-xs"
              className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
            />
          )}
        </CompactPageHeader>

        {isSearchOpen ? (
          <CommonSearch
            fields={providerSearchFields}
            onSearch={handleSearch}
            isSubmitting={providerList.loading}
            title={t("providerMaster.search.filterTitle")}
            showToggleButton={false}
            isOpen
            onToggle={toggleSearch}
            isInsurer
            isState
            allowEmptySearch
          />
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <div className="block md:hidden min-h-0 flex-1 overflow-y-auto">
            <ProvidersMobileView rows={gridRows} onView={handleOpenProvider} />
          </div>
          <div className="hidden min-h-0 flex-1 flex-col md:flex">
            <AgGridSuperWrapper
              rowData={gridRows}
              columnDefs={providerColumns}
              onRowClick={handleOpenProvider}
              openOnRowClick={false}
              pageSize={pageSize}
              height="100%"
              pagination={false}
              autoSizeStrategy={PROVIDER_GRID_AUTO_SIZE_FIT_WIDTH}
            />
          </div>
        </div>

        <Pagination
          className="shrink-0"
          page={page}
          pageSize={pageSize}
          totalItems={totalRecords}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
        />
      </div>
    </Page>
  );
}
