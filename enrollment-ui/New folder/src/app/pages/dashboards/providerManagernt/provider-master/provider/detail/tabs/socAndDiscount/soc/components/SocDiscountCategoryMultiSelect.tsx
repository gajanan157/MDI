import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select, { components } from "react-select";
import { CHIP_MULTI_SELECT_STYLES } from "../../../../../../ic-corporate-mapping/components/discountFormBlockStyles";
import type { DiscountFormValues } from "../types/socDiscountTypes";
import { DISCOUNT_CATEGORY_OPTIONS } from "../utils/socDiscountConfig";

type SocDiscountCategoryMultiSelectProps = {
  control: Control<DiscountFormValues>;
};

export function SocDiscountCategoryMultiSelect({ control }: Readonly<SocDiscountCategoryMultiSelectProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">
        {t(`${D}.categoryMultiSelect`)}
      </label>
      <Controller
        name="discountCategories"
        control={control}
        render={({ field }) => {
          const value = (field.value ?? []).map((v: string) => {
            const opt = DISCOUNT_CATEGORY_OPTIONS.find((o) => o.value === v);
            return opt ?? { label: v, value: v };
          });
          return (
            <Select
              isMulti
              isSearchable
              placeholder={t(`${D}.searchSelect`)}
              value={value}
              options={DISCOUNT_CATEGORY_OPTIONS}
              onChange={(selected) => field.onChange(selected?.map((s) => s.value) ?? [])}
              components={{
                Option: (optionProps) => (
                  <components.Option {...optionProps} className="flex items-center p-0">
                    <div
                      className={`flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 ${
                        optionProps.isSelected
                          ? "bg-blue-50 text-gray-900"
                          : "text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={optionProps.isSelected}
                        readOnly
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-[13px]">{optionProps.label}</span>
                    </div>
                  </components.Option>
                ),
                IndicatorSeparator: () => null,
              }}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              classNamePrefix="select-form"
              className="select-form-containers rounded-lg border border-gray-200 bg-white text-sm"
              styles={CHIP_MULTI_SELECT_STYLES}
            />
          );
        }}
      />
    </div>
  );
}
