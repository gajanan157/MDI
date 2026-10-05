import { useMemo } from "react";
import { DISCOUNT_COMPONENT_OPTIONS } from "../../../../../../ic-corporate-mapping/discountOptions";
import { useDiscountSubtypeOptions } from "./useDiscountSubtypeOptions";

const FALLBACK_COMPONENT_OPTIONS = DISCOUNT_COMPONENT_OPTIONS.filter(
  (option) => option.value,
);

/** Loads individual-discount component options from discount-subtype-master. */
export function useDiscountIndividualSubtypeOptions(
  providerDiscountTypeMasterId: string,
  enabled: boolean,
) {
  const { options, loading } = useDiscountSubtypeOptions(
    providerDiscountTypeMasterId,
    enabled,
    FALLBACK_COMPONENT_OPTIONS,
  );

  return useMemo(
    () => ({ componentOptions: options, loading }),
    [loading, options],
  );
}
