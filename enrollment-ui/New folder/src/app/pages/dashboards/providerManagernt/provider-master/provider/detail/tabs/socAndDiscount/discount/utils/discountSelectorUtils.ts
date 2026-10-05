import type { DiscountSubtypeMasterRecord } from "@/store/features/discountSubtypeMaster/discountSubtypeMasterTypes";
import type { DiscountInclusionExclusionMasterRecord } from "@/store/features/discountInclusionExclusionMaster/discountInclusionExclusionMasterTypes";
import type { DiscountTypeMasterRecord } from "@/store/features/discountTypeMaster/discountTypeMasterTypes";
import type { RootState } from "@/store/store";

export const EMPTY_DISCOUNT_SUBTYPE_MASTER_LIST: DiscountSubtypeMasterRecord[] = [];
export const EMPTY_INCLUSION_EXCLUSION_MASTER_LIST: DiscountInclusionExclusionMasterRecord[] =
  [];
export const EMPTY_DISCOUNT_TYPE_MASTER_LIST: DiscountTypeMasterRecord[] = [];
export function selectDiscountSubtypeMasterList(
  state: RootState,
  masterId: string,
): DiscountSubtypeMasterRecord[] {
  if (!masterId.trim()) return EMPTY_DISCOUNT_SUBTYPE_MASTER_LIST;
  return (
    state.discountSubtypeMaster?.byMasterId?.[masterId] ??
    EMPTY_DISCOUNT_SUBTYPE_MASTER_LIST
  );
}

export function selectInclusionExclusionMasterList(
  state: RootState,
): DiscountInclusionExclusionMasterRecord[] {
  return (
    state.discountInclusionExclusionMaster?.list ?? EMPTY_INCLUSION_EXCLUSION_MASTER_LIST
  );
}

export function selectIpdDiscountTypeMasterList(state: RootState): DiscountTypeMasterRecord[] {
  return state.discountTypeMaster?.ipdList ?? EMPTY_DISCOUNT_TYPE_MASTER_LIST;
}

export function selectOpdDiscountTypeMasterList(state: RootState): DiscountTypeMasterRecord[] {
  return state.discountTypeMaster?.opdList ?? EMPTY_DISCOUNT_TYPE_MASTER_LIST;
}