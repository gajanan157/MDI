import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchBulkIcMappingInwards } from "@/store/features/bulkIcMapping/bulkIcMappingSlice";
import { buildBulkIcMappingStagingBreadcrumbs } from "./config";
import {
  createMinimalBulkIcMappingInwardRow,
  type BulkIcMappingInwardRow,
} from "./inward/rows";

type UseBulkIcMappingBreadcrumbsParams = {
  stagingInwardNo: string | null;
  onBackFromStaging: () => void;
};

/** Staging drill-in uses custom crumbs; list view falls back to nav-generated breadcrumbs. */
export function useIcCorporateMappingBreadcrumbs({
  stagingInwardNo,
  onBackFromStaging,
}: UseBulkIcMappingBreadcrumbsParams) {
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    if (!stagingInwardNo) {
      setBreadcrumbs([]);
      return () => setBreadcrumbs([]);
    }

    setBreadcrumbs(
      buildBulkIcMappingStagingBreadcrumbs(stagingInwardNo, onBackFromStaging),
    );
    return () => setBreadcrumbs([]);
  }, [stagingInwardNo, onBackFromStaging, setBreadcrumbs]);
}

type BulkIcMappingRouteInwardState = {
  inward?: BulkIcMappingInwardRow;
  /** When true, stay on staging even if list lookup fails (e.g. opened from Provider Dashboard). */
  fromProviderDashboard?: boolean;
};

function readRouteInwardState(
  locationState: unknown,
  inwardNo: string,
): BulkIcMappingInwardRow | null {
  const state = locationState as BulkIcMappingRouteInwardState | null;
  if (!state?.inward || state.inward.inwardNo !== inwardNo) {
    return null;
  }
  return state.inward;
}

function isFromProviderDashboard(locationState: unknown): boolean {
  return Boolean(
    (locationState as BulkIcMappingRouteInwardState | null)?.fromProviderDashboard,
  );
}

export function useIcCorporateMappingRouteInward() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { inwardNo: inwardNoParam } = useParams<{ inwardNo?: string }>();
  const location = useLocation();

  const inwardNo = inwardNoParam ? decodeURIComponent(inwardNoParam).trim() : "";

  const [stagingInward, setStagingInward] = useState<BulkIcMappingInwardRow | null>(() =>
    inwardNo ? readRouteInwardState(location.state, inwardNo) : null,
  );
  const [loading, setLoading] = useState(Boolean(inwardNo));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inwardNo) {
      setStagingInward(null);
      setLoading(false);
      setError(null);
      return;
    }

    const routeInward = readRouteInwardState(location.state, inwardNo);
    const fromDashboard = isFromProviderDashboard(location.state);
    if (routeInward) {
      setStagingInward(routeInward);
    } else if (fromDashboard) {
      setStagingInward(createMinimalBulkIcMappingInwardRow(inwardNo));
    }

    let cancelled = false;

    const loadInward = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await dispatch(
          fetchBulkIcMappingInwards({
            page: 1,
            size: 1,
            inwardNo,
          }),
        ).unwrap();

        if (cancelled) return;

        const row = result.rows.find((item) => item.inwardNo === inwardNo) ?? result.rows[0];
        if (!row) {
          if (routeInward || fromDashboard) {
            setStagingInward(
              routeInward ?? createMinimalBulkIcMappingInwardRow(inwardNo),
            );
            setError(null);
            return;
          }
          setError(t("providerMaster.icMapping.errors.inwardNotFound"));
          setStagingInward(null);
          return;
        }

        setStagingInward(row);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (routeInward || fromDashboard) {
          setStagingInward(
            routeInward ?? createMinimalBulkIcMappingInwardRow(inwardNo),
          );
          setError(null);
          return;
        }
        const message = typeof err === "string" ? err : "";
        setError(message || t("providerMaster.icMapping.errors.loadInwardFailed"));
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
