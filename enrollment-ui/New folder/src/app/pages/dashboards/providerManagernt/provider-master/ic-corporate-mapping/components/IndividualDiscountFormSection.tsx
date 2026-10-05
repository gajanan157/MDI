import type { Control, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { DISCOUNT_APPLICABLE_ON_OPTIONS } from "../discountOptions";
import type { DiscountDetailForm, DiscountFormLayout } from "./discountFormBlockHelpers";
import { DiscountBillScopeFields } from "./DiscountBillScopeFields";
import { DiscountOpdAdditionalBlock } from "./DiscountOpdBlock";

type IndividualDiscountFormSectionProps = {
  control: Control<DiscountDetailForm>;
  register: UseFormRegister<DiscountDetailForm>;
  setValue: UseFormSetValue<DiscountDetailForm>;
  watch: UseFormWatch<DiscountDetailForm>;
  layout: DiscountFormLayout;
  compact: boolean;
  embedded: boolean;
};

export function IndividualDiscountFormSection({
  control,
  register,
  setValue,
  watch,
  layout,
  embedded,
}: Readonly<IndividualDiscountFormSectionProps>) {
  return (
    <div className={layout.individualFieldsSection}>
      <div className={layout.individualTopGrid}>
        <Input
          label="PPN Discount"
          placeholder="Enter PPN"
          {...register("ppnDiscount")}
          className={layout.input}
        />
        <Input
          label="TAT for discount"
          placeholder="Enter days..."
          suffix={<span className="shrink-0 text-[11px] text-gray-500">days</span>}
          {...register("tatForDiscount")}
          className={layout.input}
        />
        <DropdownSelect
          control={control}
          name="discountApplicableOn"
          name_key="discountApplicableOn"
          label="Discount applicable on"
          options={DISCOUNT_APPLICABLE_ON_OPTIONS}
          className={layout.input}
          formClassName={layout.embeddedDd}
        />
      </div>
      <div className={layout.individualBillGrid}>
        <DiscountBillScopeFields control={control} layout={layout} />
      </div>
      <DiscountOpdAdditionalBlock
        control={control}
        setValue={setValue}
        ipdEnabled={!!watch("ipdEnabled")}
        opdEnabled={!!watch("opdEnabled")}
        additionalDiscountEnabled={!!watch("additionalDiscountEnabled")}
        size={layout.billScopeSize}
        selectClassName={layout.embeddedDd}
        compactLabels={embedded}
      />
    </div>
  );
}
