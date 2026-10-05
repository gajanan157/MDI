import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { usePermission, useRole } from "@/app/auth/usePermission";
import type { ConfirmMessages } from "@/components/shared/ConfirmModal";
import { useDisclosure } from "@/hooks";
import { showSuccessMessage } from "@/utils/errorHandler";
import { showProviderErrorMessage } from "../shared/ProviderAlertDialog";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  fetchProviderIdentifierTypeMaster,
  fetchProviderTaxonomyMaster,
  fetchInsurerProviderNetworkMode,
  fetchProviderDiscountTypeMaster,
  fetchProviderDiscountSubtypeMaster,
  fetchProviderDiscountInclusionExclusionMaster,
} from "@/store/features/providerMasters/providerMastersSlice";
import type { SearchField } from "../shared/providerShell";
import {
  PROVIDER_GRID_DEFAULT_PAGE_SIZE,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
} from "../shared/providerGridPagination.constants";
import {
  DEFAULT_PROVIDER_MASTER_KEY,
  PROVIDER_MASTER_CONFIGS,
  getProviderMastersListPath,
  isProviderMasterKey,
  type ProviderMasterKey,
  type ProviderMasterRecord,
  type ProviderMasterRecordStatus,
} from "./utils/masterConfig";
import { readProviderMasterRows, writeProviderMasterRows } from "./utils/storage";
import { buildTaxonomyListParams } from "./utils/taxonomyFormConfig";
import { buildNetworkModeListParams } from "./utils/insurerProviderNetworkModeFormConfig";
import { buildDiscountTypeListParams } from "./utils/discountTypeFormConfig";
import {
  buildDiscountSubtypeListParams,
  DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
  DISCOUNT_SUBTYPE_TYPE_NAME_FIELD,
} from "./utils/discountSubtypeFormConfig";
import {
  buildDiscountInclusionExclusionListParams,
  DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD,
  DISCOUNT_INCLUSION_EXCLUSION_TYPES,
} from "./utils/discountInclusionExclusionFormConfig";
import { getProviderMasterConfig, getProviderMasterOptions } from "../shared/providerMasterI18n";
import {
  buildMasterSpecificColumns,
  buildViewFields,
  filterClientSideRows,
  getMasterTypeFlags,
  isDiscountFamilyMaster,
  resolveTotalItems,
} from "./utils/providerMastersPageHelpers";
import { deleteRemoteMasterRecord, isRemoteMaster } from "./utils/providerMasterDelete";
import { resolveMutationError } from "./utils/saveProviderMasterHelpers";
import ProviderMastersRowActions from "./components/ProviderMastersRowActions";

export function useProviderMastersPage() {
  const { t } = useTranslation();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const { canWrite } = usePermission("provider-list");
  const { isSuperAdmin } = useRole();
  const canMasterEditDelete = isSuperAdmin;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const masterFromUrl = searchParams.get("master") ?? "";
  const dispatch = useAppDispatch();
  const {
    providerIdentifierTypeRows,
    providerIdentifierTypeTotal,
    providerTaxonomyRows,
    providerTaxonomyTotal,
    insurerProviderNetworkModeRows,
    insurerProviderNetworkModeTotal,
    providerDiscountTypeRows,
    providerDiscountTypeTotal,
    providerDiscountSubtypeRows,
    providerDiscountSubtypeTotal,
    providerDiscountInclusionExclusionRows,
    providerDiscountInclusionExclusionTotal,
  } = useAppSelector((state) => state.providerMasters);

  const masterForm = useForm<{ masterKey: ProviderMasterKey; status: ProviderMasterRecordStatus }>({
    defaultValues: { masterKey: DEFAULT_PROVIDER_MASTER_KEY, status: "ACTIVE" },
  });

  const [selectedMasterKey, setSelectedMasterKey] = useState<ProviderMasterKey>(() =>
    isProviderMasterKey(masterFromUrl) ? masterFromUrl : DEFAULT_PROVIDER_MASTER_KEY,
  );
  const [rowsByMaster, setRowsByMaster] = useState(readProviderMasterRows);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PROVIDER_GRID_DEFAULT_PAGE_SIZE);
  const [viewRecord, setViewRecord] = useState<ProviderMasterRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProviderMasterRecord | null>(null);
  const [isDeleteOpen, { open: openDeleteConfirm, close: closeDeleteConfirm }] = useDisclosure(false);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);

  const masterFlags = getMasterTypeFlags(selectedMasterKey);
  const selectedConfig = useMemo(
    () => getProviderMasterConfig(selectedMasterKey, t),
    [selectedMasterKey, t],
  );
  const isServerPaginatedMaster =
    masterFlags.isTaxonomyMaster ||
    masterFlags.isNetworkModeMaster ||
    masterFlags.isDiscountTypeMaster ||
    masterFlags.isDiscountSubtypeMaster ||
    masterFlags.isDiscountInclusionExclusionMaster ||
    (masterFlags.isIdentifierTypeMaster && !Object.keys(filters).length);

  useEffect(() => {
    setBreadcrumbs([
      { title: t("providerMaster.moduleName") },
      { title: t("providerMaster.mastersPage.breadcrumbMasters") },
    ]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs, t]);

  useEffect(() => {
    if (!isProviderMasterKey(masterFromUrl)) return;
    setSelectedMasterKey(masterFromUrl);
  }, [masterFromUrl]);

  useEffect(() => {
    masterForm.setValue("masterKey", selectedMasterKey);
  }, [masterForm, selectedMasterKey]);

  useEffect(() => {
    if (!masterFlags.isIdentifierTypeMaster) return;
    dispatch(fetchProviderIdentifierTypeMaster({ page, size: pageSize }));
  }, [dispatch, masterFlags.isIdentifierTypeMaster, page, pageSize]);

  useEffect(() => {
    if (!masterFlags.isTaxonomyMaster) return;
    dispatch(fetchProviderTaxonomyMaster(buildTaxonomyListParams(page, pageSize, filters)));
  }, [dispatch, filters, masterFlags.isTaxonomyMaster, page, pageSize]);

  useEffect(() => {
    if (!masterFlags.isNetworkModeMaster) return;
    dispatch(fetchInsurerProviderNetworkMode(buildNetworkModeListParams(page, pageSize, filters)));
  }, [dispatch, filters, masterFlags.isNetworkModeMaster, page, pageSize]);

  useEffect(() => {
    if (!masterFlags.isDiscountTypeMaster) return;
    dispatch(fetchProviderDiscountTypeMaster(buildDiscountTypeListParams(page, pageSize, filters)));
  }, [dispatch, filters, masterFlags.isDiscountTypeMaster, page, pageSize]);

  useEffect(() => {
    if (!masterFlags.isDiscountSubtypeMaster) return;
    dispatch(fetchProviderDiscountTypeMaster({ page: 1, size: 200, download: true }));
  }, [dispatch, masterFlags.isDiscountSubtypeMaster]);

  useEffect(() => {
    if (!masterFlags.isDiscountSubtypeMaster) return;
    dispatch(
      fetchProviderDiscountSubtypeMaster(buildDiscountSubtypeListParams(page, pageSize, filters)),
    );
  }, [dispatch, filters, masterFlags.isDiscountSubtypeMaster, page, pageSize]);

  useEffect(() => {
    if (!masterFlags.isDiscountInclusionExclusionMaster) return;
    dispatch(
      fetchProviderDiscountInclusionExclusionMaster(
        buildDiscountInclusionExclusionListParams(page, pageSize, filters),
      ),
    );
  }, [dispatch, filters, masterFlags.isDiscountInclusionExclusionMaster, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [selectedMasterKey, filters]);

  const masterOptions = useMemo(() => getProviderMasterOptions(t), [t]);
  const statusOptions = useMemo(
    () => [
      { label: t("providerMaster.common.active"), value: "ACTIVE" },
      { label: t("providerMaster.common.inactive"), value: "INACTIVE" },
    ],
    [t],
  );

  const discountTypeSearchOptions = useMemo(
    () =>
      providerDiscountTypeRows.map((row) => ({
        value: row.id,
        label: row.name || row.code || row.id,
      })),
    [providerDiscountTypeRows],
  );

  const inclusionExclusionTypeSearchOptions = useMemo(
    () =>
      DISCOUNT_INCLUSION_EXCLUSION_TYPES.map((value) => ({
        value,
        label:
          value === "INCLUSION"
            ? t("providerMaster.mastersPage.inclusion")
            : t("providerMaster.mastersPage.exclusion"),
      })),
    [t],
  );

  const leadingSearchFields = useMemo<SearchField[]>(() => {
    if (masterFlags.isDiscountSubtypeMaster) {
      return [
        {
          name: DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
          label: t("providerMaster.mastersPage.discountType"),
          type: "dropdown",
          options: discountTypeSearchOptions,
        },
      ];
    }
    if (masterFlags.isDiscountInclusionExclusionMaster) {
      return [
        {
          name: DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD,
          label: t("providerMaster.mastersPage.inclusionExclusionType"),
          type: "dropdown",
          options: inclusionExclusionTypeSearchOptions,
        },
      ];
    }
    return [
      {
        name: "masterKey",
        label: t("providerMaster.common.master"),
        type: "dropdown",
        options: masterOptions,
      },
    ];
  }, [
    discountTypeSearchOptions,
    inclusionExclusionTypeSearchOptions,
    masterFlags.isDiscountInclusionExclusionMaster,
    masterFlags.isDiscountSubtypeMaster,
    masterOptions,
    t,
  ]);

  const searchFields = useMemo<SearchField[]>(
    () => [
      ...leadingSearchFields,
      { name: "code", label: selectedConfig.codeLabel, type: "text" },
      ...(masterFlags.isDiscountTypeMaster
        ? [{ name: "serviceType", label: t("providerMaster.mastersPage.serviceType"), type: "text" as const }]
        : []),
      { name: "name", label: selectedConfig.nameLabel, type: "text" },
      {
        name: "status",
        label: isDiscountFamilyMaster(masterFlags)
          ? t("providerMaster.mastersPage.isActive")
          : t("providerMaster.common.status"),
        type: "dropdown",
        options: statusOptions,
      },
    ],
    [
      leadingSearchFields,
      masterFlags,
      selectedConfig.codeLabel,
      selectedConfig.nameLabel,
      statusOptions,
      t,
    ],
  );

  const currentRows = useMemo(() => {
    if (masterFlags.isTaxonomyMaster) return providerTaxonomyRows;
    if (masterFlags.isNetworkModeMaster) return insurerProviderNetworkModeRows;
    if (masterFlags.isIdentifierTypeMaster) return providerIdentifierTypeRows;
    if (masterFlags.isDiscountTypeMaster) return providerDiscountTypeRows;
    if (masterFlags.isDiscountSubtypeMaster) {
      const typeNameById = new Map(
        providerDiscountTypeRows.map((row) => [row.id, row.name || row.code || row.id]),
      );
      return providerDiscountSubtypeRows.map((row) => {
        const typeId = String(row.extra?.[DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD] ?? "").trim();
        const resolvedName =
          typeNameById.get(typeId) ||
          String(row.extra?.[DISCOUNT_SUBTYPE_TYPE_NAME_FIELD] ?? "").trim() ||
          typeId;
        return {
          ...row,
          extra: {
            ...row.extra,
            [DISCOUNT_SUBTYPE_TYPE_NAME_FIELD]: resolvedName,
          },
        };
      });
    }
    if (masterFlags.isDiscountInclusionExclusionMaster) {
      return providerDiscountInclusionExclusionRows;
    }
    return rowsByMaster[selectedMasterKey] ?? [];
  }, [
    masterFlags,
    insurerProviderNetworkModeRows,
    providerDiscountInclusionExclusionRows,
    providerDiscountSubtypeRows,
    providerDiscountTypeRows,
    providerIdentifierTypeRows,
    providerTaxonomyRows,
    rowsByMaster,
    selectedMasterKey,
  ]);

  const filteredRows = useMemo(() => {
    if (
      masterFlags.isTaxonomyMaster ||
      masterFlags.isNetworkModeMaster ||
      masterFlags.isDiscountTypeMaster ||
      masterFlags.isDiscountSubtypeMaster ||
      masterFlags.isDiscountInclusionExclusionMaster
    ) {
      return currentRows;
    }
    return filterClientSideRows(currentRows, filters);
  }, [
    currentRows,
    filters,
    masterFlags.isDiscountInclusionExclusionMaster,
    masterFlags.isDiscountSubtypeMaster,
    masterFlags.isDiscountTypeMaster,
    masterFlags.isNetworkModeMaster,
    masterFlags.isTaxonomyMaster,
  ]);

  const pagedRows = useMemo(() => {
    if (isServerPaginatedMaster) return filteredRows;
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, isServerPaginatedMaster, page, pageSize]);

  const totalItems = resolveTotalItems({
    isServerPaginatedMaster,
    flags: masterFlags,
    providerIdentifierTypeTotal,
    providerTaxonomyTotal,
    insurerProviderNetworkModeTotal,
    providerDiscountTypeTotal,
    providerDiscountSubtypeTotal,
    providerDiscountInclusionExclusionTotal,
    filteredCount: filteredRows.length,
  });

  const openEditForm = useCallback(
    (row: ProviderMasterRecord) => {
      if (!canMasterEditDelete) return;
      navigate(`/provider-masters/masters/${selectedMasterKey}/edit?id=${encodeURIComponent(row.id)}`);
    },
    [canMasterEditDelete, navigate, selectedMasterKey],
  );

  const deleteConfirmMessages = useMemo((): ConfirmMessages => {
    const label = deleteTarget?.name || deleteTarget?.code || t("providerMaster.mastersPage.thisRecord");
    return {
      pending: {
        Icon: ExclamationTriangleIcon,
        title: t("providerMaster.mastersPage.deleteTitle"),
        description: t("providerMaster.mastersPage.deleteDescription", { label }),
        actionText: t("providerMaster.mastersPage.deleteAction"),
      },
      error: {
        description: t("providerMaster.mastersPage.deleteError"),
      },
    };
  }, [deleteTarget, t]);

  const handleDeleteRow = useCallback(
    (row: ProviderMasterRecord) => {
      if (!canMasterEditDelete) return;
      setDeleteTarget(row);
      setDeleteError(false);
      openDeleteConfirm();
    },
    [canMasterEditDelete, openDeleteConfirm],
  );

  const handleDeleteConfirmClose = useCallback(() => {
    closeDeleteConfirm();
    setDeleteTarget(null);
    setDeleteError(false);
    setDeleteConfirmLoading(false);
  }, [closeDeleteConfirm]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !canMasterEditDelete) return;

    setDeleteConfirmLoading(true);
    try {
      if (isRemoteMaster(masterFlags)) {
        const message = await deleteRemoteMasterRecord(
          dispatch,
          deleteTarget.id,
          masterFlags,
          page,
          pageSize,
          filters,
        );
        showSuccessMessage(message ?? t("providerMaster.mastersPage.recordDeleted"));
      } else {
        setRowsByMaster((prev) => {
          const nextRows = (prev[selectedMasterKey] ?? []).filter((item) => item.id !== deleteTarget.id);
          const nextByMaster = { ...prev, [selectedMasterKey]: nextRows };
          writeProviderMasterRows(nextByMaster);
          return nextByMaster;
        });
        showSuccessMessage("Record deleted successfully.");
      }
      handleDeleteConfirmClose();
    } catch (error) {
      setDeleteError(true);
      const { message, status } = resolveMutationError(error, "Delete failed");
      showProviderErrorMessage({ status, error: message, message });
    } finally {
      setDeleteConfirmLoading(false);
    }
  }, [
    canMasterEditDelete,
    deleteTarget,
    dispatch,
    filters,
    handleDeleteConfirmClose,
    masterFlags,
    page,
    pageSize,
    selectedMasterKey,
    t,
  ]);

  const columnDefs = useMemo(
    () => [
      {
        field: "actions",
        headerName: t("providerMaster.common.actions"),
        width: 140,
        pinned: "left" as const,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: ProviderMasterRecord }) => {
          if (!params.data) return null;
          return createElement(ProviderMastersRowActions, {
            row: params.data,
            canMasterEditDelete,
            viewLabel: t("providerMaster.common.view"),
            editLabel: t("providerMaster.common.edit"),
            deleteLabel: t("providerMaster.common.delete"),
            onView: setViewRecord,
            onEdit: openEditForm,
            onDelete: handleDeleteRow,
          });
        },
      },
      { field: "code", headerName: selectedConfig.codeLabel, minWidth: 150, flex: 1 },
      ...(isDiscountFamilyMaster(masterFlags)
        ? buildMasterSpecificColumns(masterFlags, t)
        : []),
      { field: "name", headerName: selectedConfig.nameLabel, minWidth: 220, flex: 1.5 },
      { field: "description", headerName: selectedConfig.descriptionLabel, minWidth: 260, flex: 2 },
      ...(!isDiscountFamilyMaster(masterFlags)
        ? buildMasterSpecificColumns(masterFlags, t)
        : []),
      {
        field: "recordStatus",
        headerName: isDiscountFamilyMaster(masterFlags)
          ? t("providerMaster.mastersPage.isActive")
          : t("providerMaster.common.status"),
        width: 120,
      },
    ],
    [canMasterEditDelete, handleDeleteRow, masterFlags, openEditForm, selectedConfig, t],
  );

  const viewFields = viewRecord ? buildViewFields(viewRecord, masterFlags, selectedConfig, t) : [];

  const handleMasterChange = useCallback(
    (value: unknown) => {
      const next = String(value);
      if (!isProviderMasterKey(next)) return;
      setSelectedMasterKey(next);
      setFilters({});
      navigate(getProviderMastersListPath(next), { replace: true });
    },
    [navigate],
  );

  const handleSearch = useCallback((data: Record<string, unknown>) => {
    const nextMasterKey = String(data.masterKey ?? "").trim();
    if (nextMasterKey && PROVIDER_MASTER_CONFIGS.some((config) => config.key === nextMasterKey)) {
      setSelectedMasterKey(nextMasterKey as ProviderMasterKey);
    }
    setFilters(data);
  }, []);

  return {
    t,
    canWrite,
    navigate,
    searchOpen,
    setSearchOpen,
    selectedMasterKey,
    selectedConfig,
    masterForm,
    masterOptions,
    searchFields,
    columnDefs,
    pagedRows,
    pageSize,
    page,
    setPage,
    setPageSize,
    totalItems,
    pageSizeOptions: [...PROVIDER_GRID_PAGE_SIZE_OPTIONS],
    viewRecord,
    setViewRecord,
    viewFields,
    isDeleteOpen,
    deleteConfirmMessages,
    handleDeleteConfirmClose,
    handleDeleteConfirm,
    deleteConfirmLoading,
    deleteModalState: deleteError ? "error" as const : "pending" as const,
    activityLogOpen,
    setActivityLogOpen,
    handleMasterChange,
    handleSearch,
  };
}

export { PROVIDER_GRID_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from "../shared/providerGridPagination.constants";
