import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import CommonSearch from "@/app/pages/dashboards/CommonSearch";
import { AgGridSuperWrapper, PROVIDER_GRID_DEFAULT_PAGE_SIZE } from "@/app/pages/dashboards/providerManagernt/shared/providerShell";
import {
  createSocGridColumnLabels,
  createSocListSearchFields,
  resolveSocEmptyState,
} from "../../../../../../../shared/providerMasterI18n";
import { ProviderTabEmptyState } from "../../../../shared/ProviderTabEmptyState";
import { ProviderTabLoadingState } from "../../../../shared/ProviderTabLoadingState";
import { filterSocRows, type SocListFilters, type SocListRow } from "../data/socListData";
import { useProviderSocList } from "../hooks/useProviderSocList";
import { getSocMasterColumns } from "../utils/socMasterGrid";

const EMPTY_SOC_FILTERS: SocListFilters = {
  socIdVersion: "",
  socName: "",
  applicableIcs: "",
  status: "",
};

export type SocEmbeddedListProps = {
  providerId?: string;
  onViewSoc: (id: string) => void;
  /** Used only when `fillAvailableHeight` is false. */
  gridHeight?: number;
  /** Stretch grid to fill remaining tab height. */
  fillAvailableHeight?: boolean;
  searchOpen?: boolean;
  onSearchToggle?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  loading?: boolean;
};

export function SocEmbeddedList({
  providerId,
  onViewSoc,
  gridHeight = 360,
  fillAvailableHeight = false,
  searchOpen = false,
  onSearchToggle,
  emptyStateTitle,
  emptyStateDescription,
  loading: loadingProp = false,
}: Readonly<SocEmbeddedListProps>) {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState<SocListFilters>(EMPTY_SOC_FILTERS);
  const { listRows, loading: listLoading } = useProviderSocList(providerId, {
    download: true,
  });
  const loading = loadingProp || listLoading;

  const emptyState = useMemo(() => resolveSocEmptyState(t), [t]);
  const searchFields = useMemo(() => createSocListSearchFields(t), [t]);
  const columnLabels = useMemo(() => createSocGridColumnLabels(t), [t]);

  const filteredRows = useMemo(
    () => filterSocRows(listRows, filters),
    [filters, listRows],
  );

  const columns = useMemo(
    () => getSocMasterColumns(onViewSoc, columnLabels),
    [columnLabels, onViewSoc],
  );
  const showEmptyState = !loading && filteredRows.length === 0;
  const showGrid = !loading && filteredRows.length > 0;

  const handleSearch = useCallback((data: Record<string, unknown>) => {
    setFilters({
      socIdVersion: String(data.socIdVersion ?? ""),
      socName: String(data.socName ?? ""),
      applicableIcs: String(data.applicableIcs ?? ""),
      status: String(data.status ?? ""),
    });
  }, []);

  return (
    <div
      className={`flex min-h-0 flex-col ${fillAvailableHeight ? "flex-1" : ""} ${searchOpen ? "gap-2" : "gap-0"}`}
    >
      {searchOpen ? (
        <CommonSearch
          key={`soc-list-search-${i18n.language}`}
          fields={searchFields}
          onSearch={handleSearch}
          title={t("providerMaster.soc.search.title")}
          showToggleButton={false}
          isOpen={true}
          onToggle={onSearchToggle}
          allowEmptySearch
        />
      ) : null}

      {loading ? (
        <ProviderTabLoadingState />
      ) : null}

      {showEmptyState ? (
        <ProviderTabEmptyState
          icon={DocumentTextIcon}
          title={emptyStateTitle ?? emptyState.title}
          description={emptyStateDescription ?? emptyState.description}
        />
      ) : null}

      {showGrid ? (
        <div
          className={`soc-list-grid overflow-hidden rounded-md border border-gray-200 bg-white ${fillAvailableHeight ? "min-h-0 flex-1" : ""}`}
        >
          <div className={fillAvailableHeight ? "flex h-full min-h-0 flex-col" : undefined}>
            <AgGridSuperWrapper
              rowData={filteredRows}
              columnDefs={columns}
              height={fillAvailableHeight ? "100%" : gridHeight}
              pagination
              pageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
              onRowClick={(row: SocListRow) => {
                if (row?.id) onViewSoc(row.id);
              }}
              openOnRowClick={false}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
