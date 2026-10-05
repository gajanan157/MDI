import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { matchesTextFilter } from "@/app/pages/dashboards/providerManagernt/shared/matchesTextFilter";
import { useProviderInwardContextIds } from "@/app/pages/dashboards/providerManagernt/shared/providerInwardDefaults";
import { useProviderGridPagination } from "@/app/pages/dashboards/providerManagernt/shared/useProviderGridPagination";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchBulkExcludeInwards } from "@/store/features/excludedProvider/excludedProviderSlice";
import {
  buildBulkExcludeListBreadcrumbs,
  buildBulkExcludeStagingBreadcrumbs,
  parseBulkExcludeInwardNoFromPath,
} from "./config";
import type { BulkIcMappingInwardRow } from "../../ic-corporate-mapping/inward/rows";

type UseBulkExcludeBreadcrumbsParams = {
  stagingInwardNo: string | null;
  onBackFromStaging: () => void;
};

export function useBulkExcludeBreadcrumbs({
  stagingInwardNo,
  onBackFromStaging,
}: UseBulkExcludeBreadcrumbsParams) {
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    if (!stagingInwardNo) {
      setBreadcrumbs(buildBulkExcludeListBreadcrumbs());
      return () => setBreadcrumbs([]);
    }

    setBreadcrumbs(
      buildBulkExcludeStagingBreadcrumbs(stagingInwardNo, onBackFromStaging),
    );
    return () => setBreadcrumbs([]);
  }, [stagingInwardNo, onBackFromStaging, setBreadcrumbs]);
}

type BulkExcludeRouteInwardState = {
  inward?: BulkIcMappingInwardRow;
};

function readRouteInwardState(
  locationState: unknown,
  inwardNo: string,
): BulkIcMappingInwardRow | null {
  const state = locationState as BulkExcludeRouteInwardState | null;
  if (!state?.inward || state.inward.inwardNo !== inwardNo) {
    return null;
  }
  return state.inward;
}

export function useBulkExcludeRouteInward() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { inwardNo: inwardNoParam } = useParams<{ inwardNo?: string }>();
  const location = useLocation();

  const inwardNo = inwardNoParam ? decodeURIComponent(inwardNoParam).trim() : "";

  const [stagingInward, setStagingInward] = useState<BulkIcMappingInwardRow | null>(() =>
    inwardNo ? readRouteInwardState(location.state, inwardNo) : null,
  );
  const [loading, setLoading] = useState(() => {
    if (!inwardNo) return false;
    return readRouteInwardState(location.state, inwardNo) == null;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inwardNo) {
      setStagingInward(null);
      setLoading(false);
      setError(null);
      return;
    }

    const routeInward = readRouteInwardState(location.state, inwardNo);
    if (routeInward) {
      setStagingInward(routeInward);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadInward = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await dispatch(
          fetchBulkExcludeInwards({
            page: 1,
            size: 1,
            inwardNo,
          }),
        ).unwrap();

        if (cancelled) return;

        const row =
          result.rows.find((item) => item.inwardNo === inwardNo) ?? result.rows[0];
        if (!row) {
          setError(t("providerMaster.excludedProvider.bulkExclude.errors.inwardNotFound"));
          setStagingInward(null);
          return;
        }

        setStagingInward(row);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const message = typeof err === "string" ? err : "";
        setError(
          message ||
            t("providerMaster.excludedProvider.bulkExclude.errors.loadInwardFailed"),
        );
        setStagingInward(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInward();

    return () => {
      cancelled = true;
    };
  }, [dispatch, inwardNo, location.state, t]);

  return {
    inwardNo: inwardNo || null,
    stagingInward,
    loading,
    error,
  };
}

export function readBulkExcludeStagingInwardNo(pathname: string): string | null {
  return parseBulkExcludeInwardNoFromPath(pathname);
}

export type BulkExcludeInwardFilters = {
  inwardNo: string;
  insurerName: string;
};

const EMPTY_FILTERS: BulkExcludeInwardFilters = {
  inwardNo: "",
  insurerName: "",
};

function asSearchText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

export function useBulkExcludeInwardList(
  refreshToken: number,
  options: { enabled?: boolean } = {},
) {
  const enabled = options.enabled !== false;
  const dispatch = useAppDispatch();
  const { departmentId, ready: contextReady } = useProviderInwardContextIds();
  const {
    page,
    pageSize,
    resetPage,
    handlePageChange,
    handlePageSizeChange,
  } = useProviderGridPagination();
  const [filters, setFilters] = useState<BulkExcludeInwardFilters>(EMPTY_FILTERS);
  const [rows, setRows] = useState<BulkIcMappingInwardRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadInwards = useCallback(async () => {
    if (!enabled || !contextReady) return;

    setLoading(true);
    try {
      const result = await dispatch(
        fetchBulkExcludeInwards({
          page,
          size: pageSize,
          inwardNo: filters.inwardNo,
          departmentId: departmentId || undefined,
        }),
      ).unwrap();

      setRows(result.rows);
      setTotalRecords(result.totalRecords);
    } catch (err) {
      const message = typeof err === "string" ? err : "";
      if (message) {
        showProviderError(message);
      }
      setRows([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [
    contextReady,
    departmentId,
    dispatch,
    enabled,
    filters.inwardNo,
    page,
    pageSize,
  ]);

  useEffect(() => {
    if (!enabled) return;
    loadInwards().catch(() => undefined);
  }, [enabled, loadInwards, refreshToken]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => matchesTextFilter(row.insurerName, filters.insurerName));
  }, [rows, filters.insurerName]);

  const handleSearch = useCallback(
    (data: Record<string, unknown>) => {
      setFilters({
        inwardNo: asSearchText(data.inwardNo),
        insurerName: asSearchText(data.insurerName),
      });
      resetPage();
    },
    [resetPage],
  );

  return {
    page,
    pageSize,
    totalItems: filters.insurerName.trim() ? filteredRows.length : totalRecords,
    filteredRows,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    loading: enabled && (loading || !contextReady),
  };
}
