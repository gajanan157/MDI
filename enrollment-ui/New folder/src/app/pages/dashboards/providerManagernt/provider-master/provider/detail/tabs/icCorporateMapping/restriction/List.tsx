import { memo, useMemo } from "react";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
import CommonSearch, { type SearchField } from "@/app/pages/dashboards/CommonSearch";
import { Button } from "@/components/ui";
import { AgGridSuperWrapper, PROVIDER_GRID_DEFAULT_PAGE_SIZE } from "../../../../../../shared/providerShell";
import {
  PROVIDER_ACTION_BUTTON_CLASS,
  PROVIDER_FORM_BUTTON_CLASS,
  PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS,
} from "../../../../../../shared/providerButtonStyles";
import { ProviderAuditLogButton } from "../../../shared/ProviderAuditLogButton";
import { ProviderTabEmptyState } from "../../../shared/ProviderTabEmptyState";
import { ProviderTabLoadingState } from "../../../shared/ProviderTabLoadingState";
import type { ItemWithIdName } from "../types";
import type { NormalizedProviderRestriction } from "./utils";
import {
  buildRestrictionListGridColumnDefs,
  getRestrictionListRowId,
} from "./utils";

/** Orange action button — same height as provider module toolbar. */
const RESTRICTION_ACTION_BTN_CLASS =
  `${PROVIDER_FORM_BUTTON_CLASS} border-0 bg-orange-500 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70`;

type RestrictionFormToolbarProps = {
  providerId?: string;
  isExistingRestriction?: boolean;
  isViewMode?: boolean;
  canWrite?: boolean;
  onEdit?: () => void;
  onCancel: () => void;
  onSave: () => void;
  onRemove?: () => void;
  saving: boolean;
  removing?: boolean;
  saveDisabled?: boolean;
};

function renderRestrictionPrimaryAction({
  isExistingRestriction = false,
  isViewMode = false,
  canWrite = false,
  onEdit,
  onSave,
  saving,
  removing = false,
  saveDisabled = false,
}: Readonly<RestrictionFormToolbarProps>) {
  if (!canWrite) return null;
  if (isExistingRestriction && isViewMode) {
    return (
      <Button
        type="button"
        unstyled
        className={RESTRICTION_ACTION_BTN_CLASS}
        onClick={onEdit}
        disabled={removing}
      >
        Edit
      </Button>
    );
  }
  if (isExistingRestriction) {
    return (
      <Button
        type="button"
        unstyled
        className={RESTRICTION_ACTION_BTN_CLASS}
        onClick={onSave}
        disabled={saveDisabled}
      >
        {saving ? "Updating..." : "Update Restriction"}
      </Button>
    );
  }
  return (
    <Button
      type="button"
      unstyled
      className={RESTRICTION_ACTION_BTN_CLASS}
      onClick={onSave}
      disabled={saveDisabled}
    >
      {saving ? "Saving..." : "Save Restriction"}
    </Button>
  );
}

export const RestrictionFormToolbar = memo(function RestrictionFormToolbar(props: RestrictionFormToolbarProps) {
  const {
    providerId,
    isExistingRestriction = false,
    canWrite = false,
    onCancel,
    onRemove,
    saving,
    removing = false,
  } = props;
  return (
    <>
      <ProviderAuditLogButton providerId={providerId} tabId="ic-corporate" />
      <Button
        type="button"
        variant="outlined"
        className={PROVIDER_FORM_BUTTON_CLASS}
        onClick={onCancel}
        disabled={saving || removing}
      >
        Cancel
      </Button>
      {isExistingRestriction && canWrite && onRemove ? (
        <Button
          type="button"
          variant="outlined"
          color="error"
          className={PROVIDER_FORM_BUTTON_CLASS}
          onClick={onRemove}
          disabled={saving || removing}
        >
          {removing ? "Removing..." : "Remove Restriction"}
        </Button>
      ) : null}
      {renderRestrictionPrimaryAction(props)}
    </>
  );
});

type RestrictionContextHeaderProps = {
  mappingSubTab: "ic" | "corporate";
  entityName: string;
};

export function RestrictionContextHeader({
  mappingSubTab,
  entityName,
}: Readonly<RestrictionContextHeaderProps>) {
  const entityLabel = mappingSubTab === "ic" ? "Insurance Company" : "Corporate";
  const displayName = entityName.trim() || "—";

  return (
    <div className="flex min-h-8 items-center justify-between gap-2 border-b border-gray-100 bg-slate-50/60 px-2 py-1">
      <div className="flex min-w-0 items-center gap-1.5">
        <LockClosedIcon className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden />
        <h3 className="shrink-0 text-xs font-semibold text-gray-900">Provider Restrictions</h3>
      </div>

      <p
        className="min-w-0 truncate text-right text-[11px] text-gray-700"
        title={`${entityLabel}: ${displayName}`}
      >
        <span className="font-semibold uppercase tracking-wide text-gray-900">{entityLabel}</span>
        <span className="mx-1 text-gray-300">·</span>
        <span className="font-semibold text-blue-600">{displayName}</span>
      </p>
    </div>
  );
}

type RestrictionListToolbarProps = {
  canWrite: boolean;
  providerId?: string;
  restrictionSearchOpen: boolean;
  showSearch?: boolean;
  showAddRestriction?: boolean;
  toggleRestrictionSearch: () => void;
  onAddRestriction: () => void;
};

export const RestrictionListToolbar = memo(function RestrictionListToolbar({
  canWrite,
  providerId,
  restrictionSearchOpen,
  showSearch = true,
  showAddRestriction = true,
  toggleRestrictionSearch,
  onAddRestriction,
}: Readonly<RestrictionListToolbarProps>) {
  return (
    <>
      {showSearch ? (
        <CheckListButton
          onClick={toggleRestrictionSearch}
          label={restrictionSearchOpen ? "Hide Search" : "Search"}
          bgColor="bg-blue-600"
          textColor="text-white"
          size="text-xs"
          className={PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS}
          isSearch
        />
      ) : null}
      {canWrite && showAddRestriction ? (
        <Button
          type="button"
          color="primary"
          className={PROVIDER_ACTION_BUTTON_CLASS}
          onClick={onAddRestriction}
        >
          {/* <PlusIcon className="h-4 w-4" /> */}
          Add Restriction
        </Button>
      ) : null}
      <ProviderAuditLogButton providerId={providerId} tabId="ic-corporate" />
    </>
  );
});

type RestrictionListGridProps = {
  rows: NormalizedProviderRestriction[];
  onView: (row: NormalizedProviderRestriction) => void;
};

export function RestrictionListGrid({ rows, onView }: Readonly<RestrictionListGridProps>) {
  const columnDefs = useMemo(() => buildRestrictionListGridColumnDefs(onView), [onView]);

  return (
    <AgGridSuperWrapper
      rowData={rows}
      columnDefs={columnDefs}
      getRowId={(params) =>
        getRestrictionListRowId(params.data as NormalizedProviderRestriction)
      }
      pageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
      height="100%"
      pagination={true}
      autoSizeStrategy={{ type: "fitCellContents", colIds: ["restrictionScope"] }}
      onRowClick={(row) => onView(row as NormalizedProviderRestriction)}
      openOnRowClick={false}
    />
  );
}

type RestrictionListPageProps = {
  mappingSubTab: "ic" | "corporate";
  mappingItem: ItemWithIdName | null;
  rows: NormalizedProviderRestriction[];
  loading: boolean;
  errorMessage?: string;
  restrictionSearchOpen: boolean;
  restrictionSearchFields: SearchField[];
  onRestrictionSearch: (data: Record<string, unknown>) => void;
  toggleRestrictionSearch: () => void;
  onView: (row: NormalizedProviderRestriction) => void;
};

export function RestrictionListPage({
  mappingSubTab,
  mappingItem,
  rows,
  loading,
  errorMessage,
  restrictionSearchOpen,
  restrictionSearchFields,
  onRestrictionSearch,
  toggleRestrictionSearch,
  onView,
}: Readonly<RestrictionListPageProps>) {
  const entityName = mappingItem?.name?.trim() || "—";
  const showEmptyState = !loading && rows.length === 0;
  const showGrid = !loading && rows.length > 0;
  const emptyTitle = errorMessage?.trim() || "No restrictions found";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <RestrictionContextHeader mappingSubTab={mappingSubTab} entityName={entityName} />

      {restrictionSearchOpen ? (
        <div className="shrink-0 border-b border-gray-100 px-1.5 py-1">
          <CommonSearch
            fields={restrictionSearchFields}
            onSearch={onRestrictionSearch}
            showToggleButton={false}
            isOpen={true}
            onToggle={toggleRestrictionSearch}
            allowEmptySearch
          />
        </div>
      ) : null}

      {loading ? (
        <div className="shrink-0 p-1">
          <ProviderTabLoadingState fillHeight={false} />
        </div>
      ) : null}

      {showEmptyState ? (
        <div className="shrink-0 p-1">
          <ProviderTabEmptyState
            icon={LockClosedIcon}
            title={emptyTitle}
            description=""
          />
        </div>
      ) : null}

      {showGrid ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-1">
          <RestrictionListGrid rows={rows} onView={onView} />
        </div>
      ) : null}
    </div>
  );
}
