import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BulkDiscountFormSection } from "./BulkDiscountFormSection";
import { DiscountApplyToAllSection } from "./DiscountApplyToAllSection";
import {
  defaultDiscountDetail,
  getDiscountFormLayout,
} from "./discountFormBlockHelpers";
import { IndividualDiscountCategorySection } from "./IndividualDiscountCategorySection";
import { IndividualDiscountFormSection } from "./IndividualDiscountFormSection";

export function IcCorporateDiscountFormBlock({
  discountType,
  compact = false,
  /** No outer card/title — use inside a parent section (e.g. Add New Network) */
  embedded = false,
  showApplyToAll,
  discountAppliedToAll,
  onApplyToAll,
}: Readonly<{
  discountType: string;
  compact?: boolean;
  embedded?: boolean;
  /** When set, show Apply to all + applied banner (IC/Corporate full flow) */
  showApplyToAll?: boolean;
  discountAppliedToAll?: boolean;
  onApplyToAll?: () => void;
}>) {
  const { control, register, watch, setValue } = useForm({
    defaultValues: defaultDiscountDetail,
  });
  const [percentByCategory, setPercentByCategory] = useState<Record<string, string>>({});
  const layout = useMemo(() => getDiscountFormLayout(compact, embedded), [compact, embedded]);
  const selectedCats = watch("discountCategories") ?? [];
  const isIndividualDiscount = discountType === "individual";

  useEffect(() => {
    if (isIndividualDiscount) return;
    setValue("discountCategories", []);
    setPercentByCategory({});
  }, [isIndividualDiscount, setValue]);

  const handleCategoriesChange = useCallback((nextCategories: string[]) => {
    setPercentByCategory((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (!nextCategories.includes(key)) delete next[key];
      });
      return next;
    });
  }, []);

  const handlePercentChange = useCallback((category: string, value: string) => {
    setPercentByCategory((prev) => ({ ...prev, [category]: value }));
  }, []);

  if (!discountType) return null;

  return (
    <div className={layout.root}>
      {!embedded ? <h4 className={`${layout.title} font-semibold text-gray-800`}>Discount</h4> : null}
      <div className={layout.content}>
        {isIndividualDiscount ? (
          <IndividualDiscountCategorySection
            control={control}
            layout={layout}
            compact={compact}
            embedded={embedded}
            selectedCats={selectedCats}
            percentByCategory={percentByCategory}
            onPercentChange={handlePercentChange}
            onCategoriesChange={handleCategoriesChange}
          />
        ) : null}

        {isIndividualDiscount ? (
          <IndividualDiscountFormSection
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
            layout={layout}
            compact={compact}
            embedded={embedded}
          />
        ) : (
          <BulkDiscountFormSection
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
            layout={layout}
            compact={compact}
            embedded={embedded}
          />
        )}

        {showApplyToAll ? (
          <DiscountApplyToAllSection
            layout={layout}
            discountAppliedToAll={discountAppliedToAll}
            onApplyToAll={onApplyToAll}
          />
        ) : null}
      </div>
    </div>
  );
}
