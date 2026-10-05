import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import Select, {
  components,
  type OptionProps,
  type StylesConfig,
} from "react-select";
import CommonSearch, {
  type SearchField,
} from "@/app/pages/dashboards/CommonSearch";
import { Button, Input } from "@/components/ui";
import {
  AgGridSuperWrapper,
  CheckListButton,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
} from "../../../../../../shared/providerShell";
import {
  PROVIDER_ACTION_BUTTON_CLASS,
  PROVIDER_FORM_BUTTON_CLASS,
  PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS,
} from "../../../../../../shared/providerButtonStyles";
import { ProviderAuditLogButton } from "../../../shared/ProviderAuditLogButton";
import { ProviderTabEmptyState } from "../../../shared/ProviderTabEmptyState";
import { ProviderTabLoadingState } from "../../../shared/ProviderTabLoadingState";
import {
  getMappingSubTabLabel,
  resolveMappingEmptyState,
} from "../../../../../../shared/providerMasterI18n";
import type { ItemWithIdName } from "../types";
import { MappingMobileView } from "./MappingMobileView";

type IcMappingSubTabBarProps = {
  mappingSubTab: "ic" | "corporate";
  setMappingSubTab: (v: "ic" | "corporate") => void;
  toolbar: React.ReactNode;
};

function subTabToggleClass(isActive: boolean): string {
  const base =
    "cursor-pointer rounded px-2.5 py-1 text-[11px] font-semibold leading-tight transition-all sm:px-3 sm:text-xs";
  if (isActive) {
    return `${base} bg-white text-primary-700 shadow-sm ring-1 ring-gray-200/80`;
  }
  return `${base} text-gray-600 hover:text-gray-900`;
}

export function IcMappingSubTabBar({
  mappingSubTab,
  setMappingSubTab,
  toolbar,
}: Readonly<IcMappingSubTabBarProps>) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-gray-200 bg-white px-2 py-1 shadow-sm xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-1">
        {toolbar}
      </div>
      <div
        className="inline-flex rounded-md border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/80 p-0.5 shadow-sm xl:ml-auto"
        role="group"
        aria-label={t("providerMaster.icMapping.toolbar.networkMappingTypeAria")}
      >
        <button
          type="button"
          onClick={() => setMappingSubTab("ic")}
          className={subTabToggleClass(mappingSubTab === "ic")}
          aria-pressed={mappingSubTab === "ic"}
        >
          {getMappingSubTabLabel("ic", t)}
        </button>
        <button
          type="button"
          onClick={() => setMappingSubTab("corporate")}
          className={subTabToggleClass(mappingSubTab === "corporate")}
          aria-pressed={mappingSubTab === "corporate"}
        >
          {getMappingSubTabLabel("corporate", t)}
        </button>
      </div>
    </div>
  );
}

type MappingToolbarProps = {
  canWrite: boolean;
  canVerify?: boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  providerId?: string;
  mappingSubTab: "ic" | "corporate";
  mappingSearchOpen: boolean;
  showSearch: boolean;
  toggleMappingSearch: () => void;
  setIcMappingCreateMode: (v: boolean) => void;
};

export const MappingToolbar = memo(function MappingToolbar({
  canWrite,
  canVerify = false,
  verifyDisabled = false,
  verifyDisabledTitle,
  providerId,
  mappingSubTab,
  mappingSearchOpen,
  showSearch,
  toggleMappingSearch,
  setIcMappingCreateMode,
}: Readonly<MappingToolbarProps>) {
  const { t } = useTranslation();

  return (
    <>
      {showSearch ? (
        <CheckListButton
          onClick={toggleMappingSearch}
          label={
            mappingSearchOpen
              ? t("providerMaster.button.hideSearch")
              : t("providerMaster.button.search")
          }
          bgColor="bg-blue-600"
          textColor="text-white"
          size="text-xs"
          className={PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS}
          isSearch
        />
      ) : null}
      {canWrite ? (
        <CheckListButton
          onClick={() => setIcMappingCreateMode(true)}
          label={
            mappingSubTab === "ic"
              ? t("providerMaster.icMapping.toolbar.newIcMapping")
              : t("providerMaster.icMapping.toolbar.newCorporate")
          }
          bgColor="bg-blue-600"
          textColor="text-white"
          size="text-xs"
          className={PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS}
        />
      ) : null}
      <ProviderAuditLogButton providerId={providerId} tabId="ic-corporate" />
      {canVerify ? (
        <Button
          type="button"
          color="primary"
          className={PROVIDER_ACTION_BUTTON_CLASS}
          onClick={() => undefined}
          disabled={verifyDisabled}
          title={verifyDisabled ? verifyDisabledTitle : undefined}
        >
          <CheckCircleIcon className="h-3 w-3" />
          {t("providerMaster.toolbar.verify")}
        </Button>
      ) : null}
    </>
  );
});

type MappingFormToolbarProps = {
  providerId?: string;
  isExistingMapping?: boolean;
  isViewMode?: boolean;
  canWrite?: boolean;
  canVerify?: boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  onEdit?: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  detailLoading?: boolean;
  saveDisabled?: boolean;
};

function resolveMappingUpdateLabel(
  saving: boolean,
  detailLoading: boolean,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  if (saving) return t("providerMaster.icMapping.formToolbar.updating");
  if (detailLoading) return t("providerMaster.icMapping.formToolbar.loading");
  return t("providerMaster.icMapping.formToolbar.updateMapping");
}

function renderMappingPrimaryAction(
  props: MappingFormToolbarProps,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const {
    isExistingMapping = false,
    isViewMode = false,
    canWrite = false,
    canVerify = false,
    verifyDisabled = false,
    verifyDisabledTitle,
    onEdit,
    onSave,
    saving,
    detailLoading = false,
    saveDisabled = false,
  } = props;

  if (isExistingMapping && isViewMode) {
    return (
      <>
        {canVerify ? (
          <Button
            type="button"
            color="primary"
            className={PROVIDER_ACTION_BUTTON_CLASS}
            onClick={() => undefined}
            disabled={verifyDisabled}
            title={verifyDisabled ? verifyDisabledTitle : undefined}
          >
            <CheckCircleIcon className="h-3 w-3" />
            {t("providerMaster.toolbar.verify")}
          </Button>
        ) : null}
        {canWrite ? (
          <Button
            type="button"
            variant="filled"
            color="primary"
            className={PROVIDER_FORM_BUTTON_CLASS}
            onClick={onEdit}
            disabled={detailLoading}
          >
            {t("providerMaster.common.edit")}
          </Button>
        ) : null}
      </>
    );
  }

  if (!canWrite) return null;

  if (isExistingMapping) {
    return (
      <Button
        type="button"
        variant="filled"
        color="primary"
        className={PROVIDER_FORM_BUTTON_CLASS}
        onClick={onSave}
        disabled={saveDisabled}
      >
        {resolveMappingUpdateLabel(saving, detailLoading, t)}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="filled"
      color="primary"
      className={PROVIDER_FORM_BUTTON_CLASS}
      onClick={onSave}
      disabled={saveDisabled}
    >
      {saving ? t("providerMaster.button.saving") : t("providerMaster.button.save")}
    </Button>
  );
}

export const MappingFormToolbar = memo(function MappingFormToolbar(props: MappingFormToolbarProps) {
  const { providerId, onCancel, saving } = props;
  const { t } = useTranslation();

  return (
    <>
      <ProviderAuditLogButton providerId={providerId} tabId="ic-corporate" />
      <Button
        type="button"
        variant="outlined"
        className={PROVIDER_FORM_BUTTON_CLASS}
        onClick={onCancel}
        disabled={saving}
      >
        {t("providerMaster.button.cancel")}
      </Button>
      {renderMappingPrimaryAction(props, t)}
    </>
  );
});

type MappingResultsPanelProps = {
  mappingSubTab: "ic" | "corporate";
  mappingSearchOpen: boolean;
  mappingSearchFields: SearchField[];
  onMappingSearch: (data: Record<string, unknown>) => void;
  toggleMappingSearch: () => void;
  filteredMappedForGrid: ItemWithIdName[];
  mappingGridColumnDefs: object[];
  loading?: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  canWrite: boolean;
  onView: (item: ItemWithIdName) => void;
  onRestrictionAction: (item: ItemWithIdName) => void;
  onUnmap: (item: ItemWithIdName) => void;
  onOpenPendingAgreement: (item: ItemWithIdName) => void;
  onCompareBankMatch: (item: ItemWithIdName) => void;
};

function getMappingEmptyStateCopy(
  mappingSubTab: "ic" | "corporate",
  t: ReturnType<typeof useTranslation>["t"],
) {
  return resolveMappingEmptyState(mappingSubTab, t);
}

export const MappingResultsPanel = memo(function MappingResultsPanel({
  mappingSubTab,
  mappingSearchOpen,
  mappingSearchFields,
  onMappingSearch,
  toggleMappingSearch,
  filteredMappedForGrid,
  mappingGridColumnDefs,
  loading = false,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  canWrite,
  onView,
  onRestrictionAction,
  onUnmap,
  onOpenPendingAgreement,
  onCompareBankMatch,
}: Readonly<MappingResultsPanelProps>) {
  const { t } = useTranslation();
  const showEmptyState = !loading && totalItems === 0;
  const showGrid = !loading && totalItems > 0;
  const emptyStateCopy = getMappingEmptyStateCopy(mappingSubTab, t);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1">
      {mappingSearchOpen ? (
        <CommonSearch
          key={
            mappingSubTab === "ic"
              ? "ic-mapping-search"
              : "corporate-mapping-search"
          }
          fields={mappingSearchFields}
          onSearch={onMappingSearch}
          showToggleButton={false}
          isOpen={true}
          onToggle={toggleMappingSearch}
          allowEmptySearch
        />
      ) : null}

      {loading ? <ProviderTabLoadingState /> : null}

      {showEmptyState ? (
        <ProviderTabEmptyState
          icon={GlobeAltIcon}
          title={emptyStateCopy.title}
          description={emptyStateCopy.description}
        />
      ) : null}

      {showGrid ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col md:hidden">
            <MappingMobileView
              mappingSubTab={mappingSubTab}
              rows={filteredMappedForGrid}
              canWrite={canWrite}
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
              onView={onView}
              onRestrictionAction={onRestrictionAction}
              onUnmap={onUnmap}
              onOpenPendingAgreement={onOpenPendingAgreement}
              onCompareBankMatch={onCompareBankMatch}
            />
          </div>
          <div className="hidden min-h-0 flex-1 flex-col md:flex">
            <AgGridSuperWrapper
              rowData={filteredMappedForGrid}
              columnDefs={mappingGridColumnDefs}
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
              height="100%"
              domLayout="normal"
              onRowClick={(row) => onView(row as ItemWithIdName)}
              openOnRowClick={false}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
});

type MappingSelectOption = { value: string; label: string };

function mappingSelectOptionBackgroundColor(isSelected: boolean, isFocused: boolean): string {
  if (isSelected) return "#eff6ff";
  if (isFocused) return "#f3f4f6";
  return "#fff";
}

const addMappingSelectStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 40,
    fontSize: 13,
    minWidth: 0,
    alignItems: "flex-start",
    paddingTop: 4,
    paddingBottom: 4,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    "&:hover": { borderColor: "#d1d5db" },
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    flexWrap: "nowrap" as const,
    maxHeight: 88,
    overflowY: "auto",
    overflowX: "auto",
    minWidth: 0,
    flex: "1 1 0",
    paddingLeft: 10,
    paddingRight: 6,
  }),
  multiValue: (base: Record<string, unknown>) => ({
    ...base,
    flexShrink: 0,
    minWidth: 0,
  }),
  multiValueRemove: (base: Record<string, unknown>) => ({
    ...base,
    cursor: "pointer",
    paddingLeft: 4,
    paddingRight: 4,
    color: "#6b7280",
    ":hover": { backgroundColor: "#fef2f2", color: "#dc2626" },
  }),
  indicatorsContainer: (base: Record<string, unknown>) => ({
    ...base,
    flexShrink: 0,
    alignSelf: "stretch",
    paddingTop: 6,
    paddingBottom: 6,
  }),
  dropdownIndicator: (base: Record<string, unknown>) => ({
    ...base,
    padding: 6,
    color: "#6b7280",
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 9999,
    borderRadius: 8,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    maxHeight: 220,
    padding: 4,
  }),
  option: (
    base: Record<string, unknown>,
    state: { isSelected: boolean; isFocused: boolean },
  ) => ({
    ...base,
    borderRadius: 6,
    backgroundColor: mappingSelectOptionBackgroundColor(state.isSelected, state.isFocused),
    color: "#111827",
  }),
};

type AddMappingDropdownProps = {
  unmappedItems: ItemWithIdName[];
  leftSelected: Set<string>;
  onSelectionChange: (ids: string[]) => void;
  onAddToMapped: () => void;
  title: string;
  disableAddButton?: boolean;
};

export const AddMappingDropdown = memo(function AddMappingDropdown({
  unmappedItems,
  leftSelected,
  onSelectionChange,
  onAddToMapped,
  title,
  disableAddButton = false,
}: Readonly<AddMappingDropdownProps>) {
  const options = useMemo(
    () => unmappedItems.map((i) => ({ value: i.id, label: i.name })),
    [unmappedItems],
  );
  const value = useMemo(
    () => options.filter((opt) => leftSelected.has(opt.value)),
    [options, leftSelected],
  );

  const OptionWithCheckbox = useCallback(
    (props: OptionProps<MappingSelectOption, true>) => (
      <components.Option {...props} className="flex items-center p-0">
        <div
          className={`flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 ${
            props.isSelected
              ? "bg-blue-50 text-gray-900"
              : "text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Input
            type="checkbox"
            checked={props.isSelected}
            readOnly
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-[13px]">{props.label}</span>
        </div>
      </components.Option>
    ),
    [],
  );

  const selectComponents = useMemo(
    () => ({ Option: OptionWithCheckbox, IndicatorSeparator: () => null }),
    [OptionWithCheckbox],
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-800">{title}</label>
      <Select<MappingSelectOption, true>
        isMulti
        isSearchable
        placeholder="Search and select..."
        value={value}
        options={options}
        onChange={(selected) =>
          onSelectionChange(selected?.map((s) => s.value) ?? [])
        }
        components={selectComponents}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        classNamePrefix="select-form"
        className="select-form-containers rounded-lg border border-gray-200 bg-white text-sm"
        styles={
          addMappingSelectStyles as StylesConfig<MappingSelectOption, true>
        }
      />
      <Button
        type="button"
        color="primary"
        onClick={onAddToMapped}
        disabled={leftSelected.size === 0 || disableAddButton}
        className="w-full rounded-lg py-2.5 text-sm font-medium"
      >
        Add to Mapped
      </Button>
    </div>
  );
});
