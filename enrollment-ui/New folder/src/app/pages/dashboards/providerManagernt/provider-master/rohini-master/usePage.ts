import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { useAppDispatch, useAppSelector, PROVIDER_GRID_DEFAULT_PAGE_SIZE } from "../../shared/providerShell";
import {
  exportRohiniMaster,
  fetchRohiniDetail,
  fetchRohiniList,
  type FetchRohiniListArgs,
} from "@/store/features/providerRohini/providerRohiniSlice";
import { isAxiosError } from "axios";
import { showErrorMessage } from "@/utils/errorHandler";
import { getRohiniMasterBreadcrumbs } from "../../shared/providerMasterI18n";
import {
  buildRohiniExportFilters,
  buildRohiniListQuery,
  buildRohiniViewFields,
  normalizeRohiniSearchFilters,
  sortRohiniRowsByExpiry,
  type RohiniRow,
} from "./config";

export function useRohiniMasterPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const {
    rows: rohiniRows,
    totalItems,
    loading: rohiniLoading,
    exportLoading: rohiniExportLoading,
  } = useAppSelector((state) => state.providerRohini);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PROVIDER_GRID_DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filterExpiring30Days, setFilterExpiring30Days] = useState(false);
  const [searchApplyPending, setSearchApplyPending] = useState(false);
  const [exportPending, setExportPending] = useState(false);

  const [viewRow, setViewRow] = useState<RohiniRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false);
  const [locationMapCoords, setLocationMapCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [createInwardOpen, setCreateInwardOpen] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [listRefreshToken, setListRefreshToken] = useState(0);

  useEffect(() => {
    setBreadcrumbs([...getRohiniMasterBreadcrumbs(t)]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs, t]);

  const listQuery = useMemo(
    (): FetchRohiniListArgs =>
      buildRohiniListQuery(page, pageSize, filters, filterExpiring30Days),
    [page, pageSize, filters, filterExpiring30Days],
  );

  const sortedRohiniData = useMemo(
    () => sortRohiniRowsByExpiry(rohiniRows),
    [rohiniRows],
  );

  const viewDialogFields = useMemo(
    () => buildRohiniViewFields(viewRow, t),
    [viewRow, t],
  );

  const handleSearch = useCallback((data: Record<string, unknown>) => {
    setSearchApplyPending(true);
    setFilters(normalizeRohiniSearchFilters(data));
    setFilterExpiring30Days(false);
    setPage(1);
  }, []);

  const openLocationMap = useCallback((latitude: number, longitude: number) => {
    setLocationMapCoords({ latitude, longitude });
    setIsLocationMapOpen(true);
  }, []);

  const handleViewRow = useCallback(
    async (row: RohiniRow) => {
      try {
        const detail = await dispatch(fetchRohiniDetail(row.id)).unwrap();
        setViewRow((detail as RohiniRow) ?? row);
      } catch {
        setViewRow(row);
      }
      setIsViewOpen(true);
    },
    [dispatch],
  );

  const handleExportXlsx = useCallback(async () => {
    if (exportPending || rohiniExportLoading || totalItems === 0) return;

    setExportPending(true);
    try {
      await dispatch(
        exportRohiniMaster({
          filters: buildRohiniExportFilters(filters),
          countExpiringInDays: filterExpiring30Days || undefined,
        }),
      ).unwrap();
    } catch (err: unknown) {
      showErrorMessage(
        isAxiosError(err)
          ? {
              status: err.response?.status,
              error:
                (err.response?.data as { message?: string } | undefined)?.message ??
                err.message ??
                t("providerMaster.export.failed"),
            }
          : { error: t("providerMaster.export.failed") },
      );
    } finally {
      setExportPending(false);
    }
  }, [
    dispatch,
    exportPending,
    filterExpiring30Days,
    filters,
    rohiniExportLoading,
    totalItems,
    t,
  ]);

  useEffect(() => {
    dispatch(fetchRohiniList(listQuery))
      .unwrap()
      .catch((err: unknown) => {
        showErrorMessage(
          isAxiosError(err)
            ? {
                status: err.response?.status,
                error:
                  (err.response?.data as { message?: string } | undefined)?.message ??
                  err.message ??
                  t("providerMaster.rohiniMaster.fetchListFailed"),
              }
            : { error: t("providerMaster.rohiniMaster.fetchListFailed") },
        );
      });
  }, [dispatch, listQuery, listRefreshToken, t]);

  const handleRohiniUploadSuccess = useCallback(() => {
    setPage(1);
    setListRefreshToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!rohiniLoading) {
      setSearchApplyPending(false);
    }
  }, [rohiniLoading]);

  return {
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
    handleExportXlsx,
    openLocationMap,
    isViewOpen,
    setIsViewOpen,
    viewDialogFields,
    isLocationMapOpen,
    setIsLocationMapOpen,
    locationMapCoords,
    createInwardOpen,
    openCreateInwardModal: () => setCreateInwardOpen(true),
    closeCreateInwardModal: () => setCreateInwardOpen(false),
    handleRohiniUploadSuccess,
    activityLogOpen,
    openActivityLog: () => setActivityLogOpen(true),
    closeActivityLog: () => setActivityLogOpen(false),
  };
}
