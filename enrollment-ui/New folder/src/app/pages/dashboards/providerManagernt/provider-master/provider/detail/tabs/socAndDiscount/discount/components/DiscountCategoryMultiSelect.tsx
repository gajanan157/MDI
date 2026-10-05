import { useTranslation } from "react-i18next";
import type { Control } from "react-hook-form";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { DISCOUNT_CATEGORY_OPTIONS } from "../../../../../../ic-corporate-mapping/discountOptions";
import type { DiscountFormValues } from "../types/discountTypes";

type DiscountCategoryMultiSelectProps = {
  control: Control<DiscountFormValues>;
};

export function DiscountCategoryMultiSelect({
  control,
}: Readonly<DiscountCategoryMultiSelectProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";

  return (
    <DropdownSelect
      name="discountCategories"
      name_key="discountCategories"
      control={control}
      options={DISCOUNT_CATEGORY_OPTIONS}
      label={t(`${D}.categoryMultiSelect`)}
      defaultValue={t(`${D}.searchSelect`)}
      multiselect
      multiselectHorizontalScroll
      is_select_checkbox
      className="h-8 rounded-md text-xs"
      formClassName="min-w-0"
    />
  );
}
