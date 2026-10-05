import { useMemo } from "react";
import { useDiscountSubtypeOptions } from "./useDiscountSubtypeOptions";

type DiscountOption = { value: string; label: string; masterId?: string };

/**
 * When OPD is enabled, uses the OPD discount-type master id to load
 * discount-subtype-master rows for the OPD multi-select dropdown.
 */
export function useDiscountOpdSubtypeOptions(
  opdDiscountTypeOptions: DiscountOption[],
  enabled: boolean,
) {
  const fallbackOptions = useMemo(
    () =>
      (opdDiscountTypeOptions ?? [])
        .filter((option) => option.value)
        .map((option) => ({ value: option.value, label: option.label })),
    [opdDiscountTypeOptions],
  );

  const opdMasterId = useMemo(() => {
    const withId = (opdDiscountTypeOptions ?? []).find(
      (option) => String(option.masterId ?? "").trim() !== "",
    );
    return String(withId?.masterId ?? "").trim();
  }, [opdDiscountTypeOptions]);

  const { options, loading } = useDiscountSubtypeOptions(
    opdMasterId,
    enabled && Boolean(opdMasterId),
    fallbackOptions,
  );

  return { opdDropdownOptions: options, loading, opdMasterId };
}
