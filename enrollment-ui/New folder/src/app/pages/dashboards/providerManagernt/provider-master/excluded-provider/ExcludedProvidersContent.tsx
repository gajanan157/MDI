import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  AgGridSuperWrapper,
  CommonSearch,
  Pagination,
  PROVIDER_GRID_AUTO_SIZE_FIT_WIDTH,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
  type SearchField,
  useDisclosure,
  ViewDialog,
} from "../../shared/providerShell";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { ProviderDataToolbar } from "../../shared/ProviderDataToolbar";
import { formatProviderDateTimeDisplay } from "../../shared/dateFormat";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
import { PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS } from "../../shared/providerButtonStyles";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { type BlacklistedRow, getBlacklistedHospitalViewDialogFields } from "./blacklistedHospital";
import { fetchExcludedProviders } from "@/store/features/excludedProvider/excludedProviderSlice";
import type { ExcludedProviderQuery } from "@/store/features/excludedProvider/excludedProviderTypes";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { usePermission } from "@/app/auth/usePermission";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { createExcludedProviderSearchFields } from "../../shared/providerMasterI18n";
import { showErrorMessage } from "@/utils/errorHandler";

function asSearchText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

function mapSearchToQuery(
  data: Record<string, unknown>,
): Partial<ExcludedProviderQuery> {
  const blacklistedBy = asSearchText(data.blacklistedBy) || undefined;
  const matchingStatus = asSearchText(data.providerMatchingStatus);
  const insurerId =
    blacklistedBy === "INSURER"
      ? asSearchText(data.insurerId) || undefined
      : undefined;
  return {
    providerName: asSearchText(data.providerName) || undefined,
    insurerId: insurerId ?? null,
    providerBlacklistSource: blacklistedBy,
    providerMatchingStatus:
      insurerId &&
      (matchingStatus === "MATCHED_WITH_TPA" ||
        matchingStatus === "NOT_MATCHED_WITH_TPA")
        ? matchingStatus
        : undefined,
    state: asSearchText(data.state) || undefined,
    city: asSearchText(data.city) || undefined,
    pincode: asSearchText(data.pincode).replace(/\D/g, "") || undefined,
    page: 1,
  };
}

export default function ExcludedProvidersContent({
  onBulkExclude,
}: Readonly<{
  onBulkExclude: () => void;
}>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const lastDispatchedRef = useRef("");
  const { canWrite } = usePermission("provider-excluded");

  const tableData = useAppSelector((state) => state.excludedProvider.rows);
  const loadingExcluded = useAppSelector((state) => state.excludedProvider.loading);
  const totalElements = useAppSelector((state) => state.excludedProvider.totalElements);
  const query = useAppSelector((state) => state.excludedProvider.query);
  const stateList = useAppSelector((state) => state.stateCity.stateList);

  const buildAndDispatch = useCallback(
    (payload: Partial<ExcludedProviderQuery> = {}) => {
      const key = JSON.stringify(payload);
      if (lastDispatchedRef.current === key) return;
      lastDispatchedRef.current = key;
      dispatch(fetchExcludedProviders(payload))
        .unwrap()
        .catch((err: unknown) => {
          showErrorMessage({
            error:
              typeof err === "string"
                ? err
                : t("providerMaster.excludedProvider.requestFailed"),
          });
        });
    },
    [dispatch, t],
  );

  useEffect(() => {
    dispatch(fetchInsurers({ size: "100" }));
    dispatch(fetchExcludedProviders({}))
      .unwrap()
      .catch((err: unknown) => {
        showErrorMessage({
          error:
            typeof err === "string"
              ? err
              : t("providerMaster.excludedProvider.requestFailed"),
        });
      });
    lastDispatchedRef.current = JSON.stringify({});
  }, [dispatch, t]);

  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewRow, setViewRow] = useState<BlacklistedRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const stateOptions = useMemo(
    () =>
      stateList.map((item) => ({
        label: item.stateName,
        value: item.stateName,
      })),
    [stateList],
  );

  const searchFields: SearchField[] = useMemo(
    () =>
      createExcludedProviderSearchFields(t, {
        stateOptions,
      }),
    [t, stateOptions],
  );

  const handleSearchSubmit = async (data: Record<string, unknown>) => {
    setSearchLoading(true);
    lastDispatchedRef.current = "";
    buildAndDispatch(mapSearchToQuery(data));
    setSearchLoading(false);
  };

  const handlePageChange = (p: number) => {
    lastDispatchedRef.current = "";
    buildAndDispatch({ page: p });
  };

  const handlePageSizeChange = (size: number) => {
    lastDispatchedRef.current = "";
    buildAndDispatch({ size, page: 1 });
  };

  const columns = useMemo(
    () => [
      {
        field: "providerName",
        headerName: t("providerMaster.table.providerName"),
        minWidth: 130,
        flex: 2,
        sortable: true,
        filter: false,
        cellRenderer: (params: { value?: string | null }) => {
          const value = String(params.value ?? "").trim();
          if (!value) return "—";
          return (
            <span className="text-primary-700 underline-offset-2 hover:underline">
              {value}
            </span>
          );
        },
      },
      {
        field: "icName",
        headerName: t("providerMaster.excludedProvider.table.insurerCompanyName"),
        minWidth: 130,
        flex: 1.7,
        sortable: true,
        filter: false,
      },
      {
        field: "state",
        headerName: t("providerMaster.addForm.state"),
        flex: 0.8,
        minWidth: 100,
        sortable: true,
        filter: false,
      },
      {
        field: "city",
        headerName: t("providerMaster.addForm.city"),
        flex: 0.8,
        minWidth: 100,
        sortable: true,
        filter: false,
      },
      {
        field: "pincode",
        headerName: t("providerMaster.addForm.pincode"),
        flex: 0.65,
        minWidth: 90,
        sortable: true,
        filter: false,
      },
      {
        field: "effectiveFrom",
        headerName: t("providerMaster.excludedProvider.table.effectiveFrom"),
        minWidth: 160,
        flex: 1,
        sortable: true,
        filter: false,
        valueFormatter: (params: { value?: string }) =>
          formatProviderDateTimeDisplay(String(params.value ?? "")),
      },
      {
        field: "address",
        headerName: t("providerMaster.table.address"),
        minWidth: 330,
        flex: 1.6,
        sortable: true,
        filter: false,
      },
    ],
    [t],
  );

  return (
    <>
      <CompactPageHeader
        title={t("nav.dashboards.provider-masters-excluded-hospitals")}
        totalCount={totalElements}
        countLabel="Hospitals"
        isRefreshing={searchLoading || loadingExcluded}
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
            onClick={onBulkExclude}
            label={t("providerMaster.excludedProvider.bulkExclude.label", {
              defaultValue: "Bulk Exclude",
            })}
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
          isSubmitting={searchLoading || loadingExcluded}
          isInsurer
          isState
          allowEmptySearch
          title={t("providerMaster.excludedProvider.filterTitle")}
          showToggleButton={false}
          isOpen={true}
          onToggle={toggleSearch}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
        <AgGridSuperWrapper
          rowData={tableData}
          columnDefs={columns}
          onRowClick={(row) => {
            setViewRow(row as BlacklistedRow);
            setIsViewOpen(true);
          }}
          rowPointerOnClick
          pageSize={query.size}
          height="100%"
          pagination={false}
          autoSizeStrategy={PROVIDER_GRID_AUTO_SIZE_FIT_WIDTH}
        />
      </div>

      <Pagination
        className="shrink-0"
        page={query.page}
        pageSize={query.size}
        totalItems={totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
      />

      <ViewDialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={t("providerMaster.excludedProvider.viewDetails")}
        fields={getBlacklistedHospitalViewDialogFields(viewRow, t)}
        gridColumns={3}
        panelClassName="max-w-6xl"
      />
    </>
  );
}
