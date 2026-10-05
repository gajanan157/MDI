import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchProviderAgreementList } from "@/store/features/providerAgreement/providerAgreementSlice";
import { mapNormalizedAgreementToListRow } from "../providerAgreementMapper";
import type { AgreementListRow } from "../utils/agreementHelpers";
import {
  buildProviderAgreementListFilters,
  type AgreementColumnFilterInput,
} from "../utils/providerAgreementHelpers";

type UseProviderAgreementListArgs = {
  providerId?: string;
  filters: {
    agreementType: string;
    scope: string;
    status: string;
  };
  columnFilters?: AgreementColumnFilterInput;
};

export function useProviderAgreementList({
  providerId,
  filters,
  columnFilters,
}: UseProviderAgreementListArgs) {
  const dispatch = useAppDispatch();
  const listState = useAppSelector((state) => state.providerAgreement.list);

  // Primitive deps only — a new `filters` object each render would re-fetch forever.
  const agreementType = filters.agreementType ?? "";
  const scope = filters.scope ?? "";
  const status = filters.status ?? "";
  const columnFiltersKey = JSON.stringify(columnFilters ?? null);
  const columnFiltersRef = useRef(columnFilters);
  columnFiltersRef.current = columnFilters;

  const loadList = useCallback(
    (columnFiltersOverride?: AgreementColumnFilterInput) => {
      const resolvedProviderId = providerId?.trim();
      if (!resolvedProviderId) return;

      dispatch(
        fetchProviderAgreementList({
          providerId: resolvedProviderId,
          filters: buildProviderAgreementListFilters(
            resolvedProviderId,
            { agreementType, scope, status },
            columnFiltersOverride ?? columnFiltersRef.current,
            1,
            100,
          ),
        }),
      );
    },
    [dispatch, providerId, agreementType, scope, status],
  );

  useEffect(() => {
    loadList();
  }, [loadList, columnFiltersKey]);

  const rows = useMemo<AgreementListRow[]>(() => {
    const resolvedProviderId = providerId?.trim();
    if (!resolvedProviderId || listState.providerId !== resolvedProviderId) {
      return [];
    }
    return (listState.rows ?? []).map(mapNormalizedAgreementToListRow);
  }, [listState.providerId, listState.rows, providerId]);

  const loading =
    !!providerId?.trim() &&
    listState.providerId === providerId.trim() &&
    listState.loading;

  const error =
    providerId?.trim() && listState.providerId === providerId.trim()
      ? (listState.error ?? "")
      : "";

  const listMessage =
    providerId?.trim() && listState.providerId === providerId.trim()
      ? (listState.listMessage ?? "")
      : "";

  return {
    rows,
    loading,
    error,
    listMessage,
    reload: loadList,
  };
}
