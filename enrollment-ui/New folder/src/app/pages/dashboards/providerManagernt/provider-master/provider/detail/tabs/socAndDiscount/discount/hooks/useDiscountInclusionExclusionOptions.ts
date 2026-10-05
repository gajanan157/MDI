import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchDiscountInclusionExclusionMaster } from "@/store/features/discountInclusionExclusionMaster/discountInclusionExclusionMasterSlice";
import { DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS } from "../../../../../../ic-corporate-mapping/discountOptions";
import type { BillScopeOption } from "../../../../../../ic-corporate-mapping/components/BillScopeMultiSelect";
import {
  buildMasterRecordByCode,
  buildUniqueInclusionExclusionOptions,
  withOppositeSelectionDisabled,
} from "../utils/discountInclusionExclusionHelpers";
import { selectInclusionExclusionMasterList } from "../utils/discountSelectorUtils";

const FALLBACK_OPTIONS = DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS.filter(
  (option) => option.value,
);

/**
 * Loads the shared inclusion/exclusion master once and builds unique category
 * options (by code) for both dropdowns, with mutual disable by opposite selection.
 */
export function useDiscountInclusionExclusionOptions(
  selectedInclusions: string[],
  selectedExclusions: string[],
  enabled = true,
) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const list = useAppSelector(selectInclusionExclusionMasterList);
  const loading = useAppSelector(
    (state) => state.discountInclusionExclusionMaster?.loading ?? false,
  );

  useEffect(() => {
    if (!enabled) return;
    dispatch(
      fetchDiscountInclusionExclusionMaster({
        download: true,
        page: 1,
        size: 20,
      }),
    ).catch(() => undefined);
  }, [dispatch, enabled]);

  const uniqueOptions = useMemo(() => {
    const fromApi = buildUniqueInclusionExclusionOptions(list);
    return fromApi.length > 0 ? fromApi : FALLBACK_OPTIONS;
  }, [list]);

  const masterByCode = useMemo(() => buildMasterRecordByCode(list), [list]);

  const inclusionOptions: BillScopeOption[] = useMemo(
    () =>
      withOppositeSelectionDisabled(
        uniqueOptions,
        selectedExclusions,
        t("providerMaster.soc.discount.alreadySelectedInExclusion"),
      ),
    [selectedExclusions, t, uniqueOptions],
  );

  const exclusionOptions: BillScopeOption[] = useMemo(
    () =>
      withOppositeSelectionDisabled(
        uniqueOptions,
        selectedInclusions,
        t("providerMaster.soc.discount.alreadySelectedInInclusion"),
      ),
    [selectedInclusions, t, uniqueOptions],
  );

    return {
    uniqueOptions,
    inclusionOptions,
    exclusionOptions,
    masterByCode,
    list,
    loading,
  };
}
