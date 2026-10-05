import { useEffect, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchProviderDiscountConfigurationList } from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationSlice";
import type { DiscountListRow } from "../types/discountTypes";
import { mapProviderDiscountConfigurationToListRow } from "../utils/mapProviderDiscountConfigurationToListRow";

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;

export function useProviderDiscountConfigurationList(providerId?: string) {
  const dispatch = useAppDispatch();
  const listState = useAppSelector((state) => state.providerDiscountConfiguration.list);
  const resolvedProviderId = providerId?.trim() ?? "";

  useEffect(() => {
    if (!resolvedProviderId) return;
    dispatch(
      fetchProviderDiscountConfigurationList({
        providerId: resolvedProviderId,
        page: DEFAULT_PAGE,
        size: DEFAULT_SIZE,
      }),
    ).catch(() => undefined);
  }, [dispatch, resolvedProviderId]);

  const rows = useMemo<DiscountListRow[]>(() => {
    if (!resolvedProviderId || listState.providerId !== resolvedProviderId) return [];
    return (listState.rows ?? []).map(mapProviderDiscountConfigurationToListRow);
  }, [listState.providerId, listState.rows, resolvedProviderId]);

  const loading =
    !!resolvedProviderId &&
    listState.providerId === resolvedProviderId &&
    listState.loading;

  return {
    rows,
    loading,
    totalRecords: listState.providerId === resolvedProviderId ? listState.totalRecords : 0,
    error: listState.providerId === resolvedProviderId ? (listState.error ?? "") : "",
  };
}
