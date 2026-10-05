import { useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button, Input, Textarea } from "@/components/ui";
import { PROVIDER_FORM_BUTTON_CLASS, PROVIDER_FORM_FOOTER_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import {
  createSocDiscountApplicableOnOptions,
  createSocDiscountTypeOptions,
} from "../../../../../../../shared/providerMasterI18n";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { PercentageInputWithLabel } from "../../../../shared/PercentageInputWithLabel";
import { DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS } from "../../../../../../ic-corporate-mapping/discountOptions";
import { BillScopeMultiSelect } from "../../../../../../ic-corporate-mapping/components/BillScopeMultiSelect";
import { DiscountOpdAdditionalBlock as DiscountOpdBlock } from "../../../../../../ic-corporate-mapping/components/DiscountOpdBlock";
import type { DiscountFormValues } from "../types/socDiscountTypes";
import { DISCOUNT_CATEGORY_OPTIONS } from "../utils/socDiscountConfig";
import { SocDiscountCategoryMultiSelect } from "./SocDiscountCategoryMultiSelect";

type SocDiscountEditContentProps = {
  discountFormHook: UseFormReturn<DiscountFormValues>;
  discountPercentByCategory: Record<string, string>;
  setDiscountPercentByCategory: (
    v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  opdPercentByKey: Record<string, string>;
  setOpdPercentByKey: (
    v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  ipdPercentByKey: Record<string, string>;
  setIpdPercentByKey: (
    v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  additionalDiscountPercentByKey: Record<string, string>;
  setAdditionalDiscountPercentByKey: (
    v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
};

export function SocDiscountEditContent({
  discountFormHook,
  discountPercentByCategory,
  setDiscountPercentByCategory,
  opdPercentByKey,
  setOpdPercentByKey,
  ipdPercentByKey,
  setIpdPercentByKey,
  additionalDiscountPercentByKey,
  setAdditionalDiscountPercentByKey,
}: Readonly<SocDiscountEditContentProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const discountTypeOptions = useMemo(
    () => createSocDiscountTypeOptions(t),
    [t],
  );
  const discountApplicableOnOptions = useMemo(
    () => createSocDiscountApplicableOnOptions(t),
    [t],
  );
  const selectedCategories = discountFormHook.watch("discountCategories") ?? [];

  const handleDiscountFormCancel = () => {
    discountFormHook.reset();
    setDiscountPercentByCategory({});
    setOpdPercentByKey({});
    setAdditionalDiscountPercentByKey({});
  };

  const handleDiscountFormDone = () => {
    discountFormHook.handleSubmit(() => {})();
  };

  return (
    <>
      <div className="space-y-1">
        <DropdownSelect
          name="discountType"
          control={discountFormHook.control}
          options={discountTypeOptions}
          label={t(`${D}.type`)}
        />
      </div>
      <SocDiscountCategoryMultiSelect control={discountFormHook.control} />
      {selectedCategories.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-2">
          <p className="text-[11px] font-medium text-gray-700">
            {t(`${D}.enterPercentHint`)}
          </p>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-4">
            {selectedCategories.map((value: string) => {
              const option = DISCOUNT_CATEGORY_OPTIONS.find((o) => o.value === value);
              const label = option?.label ?? value;
              return (
                <PercentageInputWithLabel
                  key={value}
                  label={label}
                  value={discountPercentByCategory[value] ?? ""}
                  onChange={(v) =>
                    setDiscountPercentByCategory((prev) => ({ ...prev, [value]: v }))
                  }
                />
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label={t(`${D}.ppnDiscount`)}
            placeholder={t(`${D}.enterPpn`)}
            {...discountFormHook.register("ppnDiscount")}
            className="h-8 w-full text-xs"
          />
          <Input
            label={t(`${D}.tatForDiscount`)}
            placeholder={t(`${D}.tatDaysPlaceholder`)}
            suffix={<span className="shrink-0 text-[11px] text-gray-500">{t(`${D}.days`)}</span>}
            {...discountFormHook.register("tatForDiscount")}
            className="h-8 w-full text-xs"
          />
          <DropdownSelect
            control={discountFormHook.control}
            name="discountApplicableOn"
            name_key="discountApplicableOn"
            label={t(`${D}.applicableOn`)}
            options={discountApplicableOnOptions}
            className="h-8 w-full text-xs"
          />
        </div>
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 lg:grid-cols-2">
          <Controller
            name="billInclusion"
            control={discountFormHook.control}
            render={({ field }) => (
              <BillScopeMultiSelect
                label={t(`${D}.inclusion`)}
                placeholder={t(`${D}.searchInclusion`)}
                value={field.value ?? []}
                onChange={field.onChange}
                options={DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS}
                size="sm"
              />
            )}
          />
          <Controller
            name="billExclusion"
            control={discountFormHook.control}
            render={({ field }) => (
              <BillScopeMultiSelect
                label={t(`${D}.exclusion`)}
                placeholder={t(`${D}.searchExclusion`)}
                value={field.value ?? []}
                onChange={field.onChange}
                options={DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS}
                size="sm"
              />
            )}
          />
        </div>
        <DiscountOpdBlock
          control={discountFormHook.control}
          setValue={discountFormHook.setValue}
          ipdEnabled={!!discountFormHook.watch("ipdEnabled")}
          opdEnabled={!!discountFormHook.watch("opdEnabled")}
          additionalDiscountEnabled={!!discountFormHook.watch("additionalDiscountEnabled")}
          size="sm"
          compactLabels
          singleRow
          percentMaps={{
            ipd: [ipdPercentByKey, setIpdPercentByKey],
            opd: [opdPercentByKey, setOpdPercentByKey],
            additional: [additionalDiscountPercentByKey, setAdditionalDiscountPercentByKey],
          }}
        />
      </div>
      <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
        <ProviderDatePicker
          label={t(`${D}.effectiveFrom`)}
          control={discountFormHook.control}
          name="effectiveFrom"
          className="h-8 w-full text-xs"
        />
        <Textarea
          label={t(`${D}.remarks`)}
          placeholder={t(`${D}.remarksPlaceholder`)}
          rows={4}
          {...discountFormHook.register("remarks", {
            required: "Remark is required",
          })}
          isRequired
          error={discountFormHook.formState.errors.remarks?.message}
          className="w-full min-w-0 resize-y text-xs"
        />
      </div>
      <div className={PROVIDER_FORM_FOOTER_CLASS}>
        <Button
          type="button"
          variant="outlined"
          className={PROVIDER_FORM_BUTTON_CLASS}
          onClick={handleDiscountFormCancel}
        >
          {t("providerMaster.button.cancel")}
        </Button>
        <Button
          type="button"
          color="primary"
          className={PROVIDER_FORM_BUTTON_CLASS}
          onClick={handleDiscountFormDone}
        >
          {t(`${D}.done`)}
        </Button>
      </div>
    </>
  );
}
