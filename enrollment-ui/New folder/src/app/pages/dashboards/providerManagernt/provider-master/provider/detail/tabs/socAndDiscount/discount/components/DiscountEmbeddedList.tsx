import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TagIcon } from "@heroicons/react/24/outline";
import CommonSearch from "@/app/pages/dashboards/CommonSearch";
import {
  AgGridSuperWrapper,
  PROVIDER_GRID_DEFAULT_PAGE_SIZE,
} from "@/app/pages/dashboards/providerManagernt/shared/providerShell";
import {
  createDiscountGridColumnLabels,
  createDiscountListSearchFields,
  resolveDiscountEmptyState,
} from "../../../../../../../shared/providerMasterI18n";
import { ProviderTabEmptyState } from "../../../../shared/ProviderTabEmptyState";
import { ProviderTabLoadingState } from "../../../../shared/ProviderTabLoadingState";
import type { DiscountListFilters, DiscountListRow } from "../types/discountTypes";
import { filterDiscountRows } from "../utils/discountHelpers";
import { getDiscountMasterColumns } from "../utils/discountMasterGrid";
import { useProviderDiscountConfigurationList } from "../hooks/useProviderDiscountConfigurationList";

const EMPTY_DISCOUNT_FILTERS: DiscountListFilters = {
  agreementName: "",
  agreementType: "",
  insuranceCo: "",
  corporate: "",
  discountTypes: "",
  status: "",
};

export type DiscountEmbeddedListProps = {
  providerId?: string;
  onViewDiscount: (id: string) => void;
  gridHeight?: number;
  fillAvailableHeight?: boolean;
  searchOpen?: boolean;
  onSearchToggle?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  loading?: boolean;
};

export function DiscountEmbeddedList({
  providerId,
  onViewDiscount,
  gridHeight = 360,
  fillAvailableHeight = false,
  searchOpen = false,
  onSearchToggle,
  emptyStateTitle,
  emptyStateDescription,
  loading: loadingProp = false,
}: Readonly<DiscountEmbeddedListProps>) {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState<DiscountListFilters>(EMPTY_DISCOUNT_FILTERS);
  const { rows, loading: listLoading } = useProviderDiscountConfigurationList(providerId);
  const loading = loadingProp || listLoading;

  const emptyState = useMemo(() => resolveDiscountEmptyState(t), [t]);
  const searchFields = useMemo(() => createDiscountListSearchFields(t), [t]);
  const columnLabels = useMemo(() => createDiscountGridColumnLabels(t), [t]);

  const filteredRows = useMemo(() => filterDiscountRows(rows, filters), [filters, rows]);

  const columns = useMemo(
    () => getDiscountMasterColumns(onViewDiscount, columnLabels),
    [columnLabels, onViewDiscount],
  );
  const showEmptyState = !loading && filteredRows.length === 0;
  const showGrid = !loading && filteredRows.length > 0;

  const handleSearch = useCallback((data: Record<string, unknown>) => {
    setFilters({
      agreementName: String(data.agreementName ?? data.agreementType ?? ""),
      agreementType: String(data.agreementType ?? ""),
      insuranceCo: String(data.insuranceCo ?? ""),
      corporate: String(data.corporate ?? ""),
      discountTypes: String(data.discountTypes ?? ""),
      status: String(data.status ?? ""),
    });
  }, []);

  return (
    <div
      className={`flex min-h-0 flex-col ${fillAvailableHeight ? "flex-1" : ""} ${searchOpen ? "gap-2" : "gap-0"}`}
    >
      {searchOpen ? (
        <CommonSearch
          key={`discount-list-search-${i18n.language}`}
          fields={searchFields}
          onSearch={handleSearch}
          title={t("providerMaster.soc.discount.search.title")}
          showToggleButton={false}
          isOpen={true}
          onToggle={onSearchToggle}
          allowEmptySearch
        />
      ) : null}

      {loading ? <ProviderTabLoadingState /> : null}

      {showEmptyState ? (
        <ProviderTabEmptyState
          icon={TagIcon}
          title={emptyStateTitle ?? emptyState.title}
          description={emptyStateDescription ?? emptyState.description}
        />
      ) : null}

      {showGrid ? (
        <div
          className={`discount-list-grid overflow-hidden rounded-md border border-gray-200 bg-white ${fillAvailableHeight ? "min-h-0 flex-1" : ""}`}
        >
          <style>{`
            .discount-list-grid .ag-cell.discount-scope-cell {
              overflow: hidden !important;
            }
            .discount-list-grid .ag-cell.discount-scope-cell .ag-cell-wrapper {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              overflow: hidden !important;
              display: flex !important;
              align-items: center !important;
            }
            .discount-list-grid .ag-cell.discount-scope-cell .ag-cell-value {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              overflow: hidden !important;
            }
            .discount-list-grid .ag-cell.discount-scope-cell .discount-scope-names-root {
              width: 100% !important;
              max-width: 100% !important;
            }
          `}</style>
          <div className={fillAvailableHeight ? "flex h-full min-h-0 flex-col" : undefined}>
            <AgGridSuperWrapper
              rowData={filteredRows}
              columnDefs={columns}
              height={fillAvailableHeight ? "100%" : gridHeight}
              pagination
              pageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
              onRowClick={(row: DiscountListRow) => {
                if (row?.id) onViewDiscount(row.id);
              }}
              openOnRowClick={false}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
