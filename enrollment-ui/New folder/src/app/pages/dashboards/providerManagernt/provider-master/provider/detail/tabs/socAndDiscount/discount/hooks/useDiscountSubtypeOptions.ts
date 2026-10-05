import { useEffect, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  clearDiscountSubtypeMaster,
  fetchDiscountSubtypeMaster,
} from "@/store/features/discountSubtypeMaster/discountSubtypeMasterSlice";
import { selectDiscountSubtypeMasterList } from "../utils/discountSelectorUtils";

type DiscountOption = { value: string; label: string };

/**
 * Loads discount-subtype-master options for a given `providerDiscountTypeMasterId`.
 * Falls back to `fallbackOptions` until the API returns rows.
 */
export function useDiscountSubtypeOptions(
  providerDiscountTypeMasterId: string,
  enabled: boolean,
  fallbackOptions: DiscountOption[] = [],
) {
  const dispatch = useAppDispatch();
  const masterId = providerDiscountTypeMasterId.trim();
  const selectSubtypeList = useMemo(
    () => (state: Parameters<typeof selectDiscountSubtypeMasterList>[0]) =>
      selectDiscountSubtypeMasterList(state, masterId),
    [masterId],
  );
  const list = useAppSelector(selectSubtypeList);
  const loading = useAppSelector((state) =>
    masterId ? Boolean(state.discountSubtypeMaster?.loadingByMasterId?.[masterId]) : false,
  );

  useEffect(() => {
    if (!enabled || !masterId) {
      if (masterId) dispatch(clearDiscountSubtypeMaster(masterId));
      return;
    }
    dispatch(
      fetchDiscountSubtypeMaster({
        providerDiscountTypeMasterId: masterId,
        download: true,
        page: 1,
        size: 20,
      }),
    ).catch(() => undefined);
  }, [dispatch, enabled, masterId]);

  const options = useMemo(() => {
    if (!enabled || !masterId) return fallbackOptions;
    const active = list.filter((row) => row.recordStatus !== "INACTIVE");
    if (active.length === 0) return fallbackOptions;
    return active.map((row) => ({
      value: row.id || row.value,
      label: row.name || row.code || row.id,
    }));
  }, [enabled, fallbackOptions, list, masterId]);

  return { options, loading };
}
