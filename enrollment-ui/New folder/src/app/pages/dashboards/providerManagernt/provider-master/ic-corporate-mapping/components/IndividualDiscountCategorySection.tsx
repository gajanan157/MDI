import { Controller, type Control } from "react-hook-form";
import Select, { components } from "react-select";
import { PercentageInputWithLabel } from "../../provider/detail/shared/PercentageInputWithLabel";
import { DISCOUNT_CATEGORY_OPTIONS } from "../discountOptions";
import type { DiscountDetailForm, DiscountFormLayout } from "./discountFormBlockHelpers";
import { DiscountCategoryMenuList } from "./DiscountCategoryMenuList";

type IndividualDiscountCategorySectionProps = {
  control: Control<DiscountDetailForm>;
  layout: DiscountFormLayout;
  compact: boolean;
  embedded: boolean;
  selectedCats: string[];
  percentByCategory: Record<string, string>;
  onPercentChange: (category: string, value: string) => void;
  onCategoriesChange: (nextCategories: string[]) => void;
};

function DiscountCategoryOptionRow({
  embedded,
  isSelected,
  label,
}: Readonly<{
  embedded: boolean;
  isSelected: boolean;
  label: string;
}>) {
  return (
    <div
      className={`flex w-full cursor-pointer items-start gap-1.5 px-1.5 py-1.5 ${
        isSelected ? "bg-blue-50 text-gray-900" : "text-gray-900 hover:bg-gray-100"
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        readOnly
        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-gray-300"
      />
      <span className={`min-w-0 flex-1 leading-snug ${embedded ? "text-[11px]" : "text-xs"}`}>
        {label}
      </span>
    </div>
  );
}

export function IndividualDiscountCategorySection({
  control,
  layout,
  compact,
  embedded,
  selectedCats,
  percentByCategory,
  onPercentChange,
  onCategoriesChange,
}: Readonly<IndividualDiscountCategorySectionProps>) {
  return (
    <div className={layout.categorySection}>
      <div className="space-y-1">
        <label className={`block font-medium text-gray-700 ${layout.categoryLabel}`}>Category</label>
        <Controller
          name="discountCategories"
          control={control}
          render={({ field }) => {
            const value = (field.value ?? []).map((categoryValue: string) => {
              const option = DISCOUNT_CATEGORY_OPTIONS.find((item) => item.value === categoryValue);
              return option ?? { label: categoryValue, value: categoryValue };
            });

            return (
              <Select
                isMulti
                isSearchable
                placeholder="Search and select category"
                value={value}
                options={DISCOUNT_CATEGORY_OPTIONS}
                onChange={(selected) => {
                  const next = selected?.map((item) => item.value) ?? [];
                  field.onChange(next);
                  onCategoriesChange(next);
                }}
                components={{
                  MenuList: DiscountCategoryMenuList,
                  Option: (optionProps) => (
                    <components.Option {...optionProps} className="flex items-start p-0">
                      <DiscountCategoryOptionRow
                        embedded={embedded}
                        isSelected={Boolean(optionProps.isSelected)}
                        label={String(optionProps.label)}
                      />
                    </components.Option>
                  ),
                  IndicatorSeparator: () => null,
                }}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                classNamePrefix="select-form"
                className={`select-form-containers rounded-lg border border-gray-200 bg-white ${layout.categorySelectText}`}
                styles={layout.chipSelectStyles}
              />
            );
          }}
        />
      </div>

      {selectedCats.length > 0 ? (
        <div className={layout.categoryPercentPanel}>
          <div className={layout.categoryPercentGrid}>
            {selectedCats.map((value) => {
              const option = DISCOUNT_CATEGORY_OPTIONS.find((item) => item.value === value);
              const label = option?.label ?? value;
              return (
                <div key={value} className="w-full min-w-0">
                  <PercentageInputWithLabel
                    label={label}
                    value={percentByCategory[value] ?? ""}
                    onChange={(nextValue) => onPercentChange(value, nextValue)}
                    className={compact ? "text-xs" : ""}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
