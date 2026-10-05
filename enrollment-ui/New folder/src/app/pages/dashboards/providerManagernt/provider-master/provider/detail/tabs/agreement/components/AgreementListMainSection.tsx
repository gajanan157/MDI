import {
  AgGridSuperWrapper,
  CommonSearch,
  PROVIDER_GRID_DEFAULT_PAGE_SIZE,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
} from "../../../../../../shared/providerShell";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { ProviderTabEmptyState } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/shared/ProviderTabEmptyState";
import { ProviderTabLoadingState } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/shared/ProviderTabLoadingState";
import { AgreementListToolbar } from "./AgreementListToolbar";
import { AgreementMobileView } from "./AgreementMobileView";
import type { useAgreementListPage } from "../hooks/useAgreementListPage";

type AgreementListMainSectionProps = ReturnType<typeof useAgreementListPage>;

function resolveAgreementListMainClassName(
  fillAvailableHeight: boolean,
  showAgreementGrid: boolean,
  showAgreementLoading: boolean,
  showAgreementEmpty: boolean,
) {
  if (
    fillAvailableHeight &&
    (showAgreementGrid || showAgreementLoading || showAgreementEmpty)
  ) {
    return "min-h-0 flex-1";
  }
  return "";
}

export function AgreementListMainSection(
  props: Readonly<AgreementListMainSectionProps>,
) {
  const {
    fillAvailableHeight,
    showAgreementGrid,
    showAgreementLoading,
    showAgreementEmpty,
    agreementEmptyTitle,
    agreementEmptyDescription,
    filteredRows,
    columns,
    gridHeight,
    view,
  } = props;

  return (
    <div
      className={`flex flex-col ${resolveAgreementListMainClassName(
        fillAvailableHeight,
        showAgreementGrid,
        showAgreementLoading,
        showAgreementEmpty,
      )}`}
    >
      {showAgreementLoading ? <ProviderTabLoadingState /> : null}
      {showAgreementEmpty ? (
        <ProviderTabEmptyState
          icon={ClipboardDocumentListIcon}
          title={agreementEmptyTitle}
          description={agreementEmptyDescription}
        />
      ) : null}
      {showAgreementGrid ? (
        <div
          className={
            fillAvailableHeight
              ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
              : ""
          }
        >
          <div className="flex min-h-0 flex-1 flex-col md:hidden">
            <AgreementMobileView
              rows={filteredRows}
              onView={view}
              onOpenSocDiscount={props.openSocDiscount}
              onAddDiscount={props.openAddDiscount}
              defaultPageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
              pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
            />
          </div>
          <div
            className={`hidden overflow-hidden rounded-md border border-gray-200 bg-white md:flex ${
              fillAvailableHeight ? "min-h-0 min-w-0 flex-1 flex-col" : ""
            }`}
          >
            <div
              className={
                fillAvailableHeight ? "flex min-h-0 min-w-0 flex-1 flex-col" : undefined
              }
            >
              <AgGridSuperWrapper
                rowData={filteredRows}
                columnDefs={columns}
                pagination
                pageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
                pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
                height={fillAvailableHeight ? "100%" : gridHeight}
                domLayout="normal"
                onRowClick={(row) => {
                  const id = String((row as { id?: string })?.id ?? "").trim();
                  if (id) view(id);
                }}
                openOnRowClick={false}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AgreementListSearchSection({
  suppressToolbar,
  isSearchOpen,
  toggleSearch,
  newAgreement,
  showSearchButton,
  searchFields,
  setFilters,
  useApiList,
  apiListLoading,
}: Pick<
  AgreementListMainSectionProps,
  | "suppressToolbar"
  | "isSearchOpen"
  | "toggleSearch"
  | "newAgreement"
  | "showSearchButton"
  | "searchFields"
  | "setFilters"
  | "useApiList"
> & { apiListLoading: boolean }) {
  return (
    <>
      {!suppressToolbar ? (
        <div className="mb-0 flex flex-wrap items-center justify-end gap-2">
          <AgreementListToolbar
            isSearchOpen={isSearchOpen}
            onToggleSearch={toggleSearch}
            onNewAgreement={newAgreement}
            showSearch={showSearchButton}
          />
        </div>
      ) : null}
      {showSearchButton ? (
        <CommonSearch
          fields={searchFields}
          onSearch={(data) =>
            setFilters({
              agreementType: String(data.agreementType ?? ""),
              scope: String(data.scope ?? ""),
              status: String(data.status ?? ""),
            })
          }
          isSubmitting={useApiList ? apiListLoading : false}
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
        />
      ) : null}
    </>
  );
}
