import { Controller, type Control } from "react-hook-form";
import { BillScopeMultiSelect } from "./BillScopeMultiSelect";
import { DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS } from "../discountOptions";
import type { DiscountDetailForm, DiscountFormLayout } from "./discountFormBlockHelpers";

type DiscountBillScopeFieldsProps = {
  control: Control<DiscountDetailForm>;
  layout: DiscountFormLayout;
};

export function DiscountBillScopeFields({ control, layout }: Readonly<DiscountBillScopeFieldsProps>) {
  return (
    <>
      <Controller
        name="billInclusion"
        control={control}
        render={({ field }) => (
          <BillScopeMultiSelect
            label="Inclusion"
            placeholder="Search and select inclusion"
            value={field.value ?? []}
            onChange={field.onChange}
            options={DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS}
            size={layout.billScopeSize}
            selectClassName={layout.embeddedDd}
          />
        )}
      />
      <Controller
        name="billExclusion"
        control={control}
        render={({ field }) => (
          <BillScopeMultiSelect
            label="Exclusion"
            placeholder="Search and select exclusion"
            value={field.value ?? []}
            onChange={field.onChange}
            options={DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS}
            size={layout.billScopeSize}
            selectClassName={layout.embeddedDd}
          />
        )}
      />
    </>
  );
}
