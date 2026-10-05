import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ADDITIONAL_DISCOUNT_OPTIONS,
  DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS,
  OPD_LIST_OPTIONS,
} from "../../../../../../ic-corporate-mapping/discountOptions";
import {
  createSocDiscountApplicableOnOptions,
  createSocDiscountTypeOptions,
} from "../../../../../../../shared/providerMasterI18n";
import { DetailRow } from "../../../../shared/DetailRow";
import { formatToDDMMMYYYY } from "../../../../../../../shared/dateFormat";
import type { DiscountFormValues } from "../types/socDiscountTypes";
import { DISCOUNT_CATEGORY_OPTIONS } from "../utils/socDiscountConfig";

type SocDiscountViewContentProps = {
  discountFormHook: UseFormReturn<DiscountFormValues>;
  discountPercentByCategory: Record<string, string>;
  opdPercentByKey: Record<string, string>;
  additionalDiscountPercentByKey: Record<string, string>;
};

export function SocDiscountViewContent({
  discountFormHook,
  discountPercentByCategory,
  opdPercentByKey,
  additionalDiscountPercentByKey,
}: Readonly<SocDiscountViewContentProps>) {
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
  const tatForDiscount = discountFormHook.watch("tatForDiscount");
  const daysLabel = t(`${D}.days`);
  const tatDisplay = tatForDiscount ? `${tatForDiscount} ${daysLabel}` : undefined;

  const discountType = discountFormHook.watch("discountType");
  const selected = discountFormHook.watch("discountCategories") ?? [];
  const categoryLabels = selected
    .map((v: string) => DISCOUNT_CATEGORY_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);
  const billInclusion = discountFormHook.watch("billInclusion") ?? [];
  const billExclusion = discountFormHook.watch("billExclusion") ?? [];
  const inclusionLabels = billInclusion
    .map(
      (v: string) => DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS.find((o) => o.value === v)?.label ?? v,
    )
    .filter(Boolean);
  const exclusionLabels = billExclusion
    .map(
      (v: string) => DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS.find((o) => o.value === v)?.label ?? v,
    )
    .filter(Boolean);
  const opdEnabled = discountFormHook.watch("opdEnabled");
  const opdList = discountFormHook.watch("opdList") ?? [];
  const additionalDiscountEnabled = discountFormHook.watch("additionalDiscountEnabled");
  const additionalDiscountList = discountFormHook.watch("additionalDiscountList") ?? [];
  const applicableOn = discountFormHook.watch("discountApplicableOn");
  const yesLabel = t("providerMaster.common.yes");
  const noLabel = t("providerMaster.common.no");

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0 sm:col-span-2 lg:col-span-4">
            <DetailRow
              label={t(`${D}.type`)}
              value={
                discountType
                  ? discountTypeOptions.find((o) => o.value === discountType)?.label
                  : undefined
              }
            />
          </div>
        </dl>
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
        <h5 className="mb-2 text-xs font-semibold text-gray-800">{t(`${D}.category`)}</h5>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0 sm:col-span-2 lg:col-span-4">
            <DetailRow
              label={t(`${D}.category`)}
              value={categoryLabels.length > 0 ? categoryLabels.join(", ") : undefined}
            />
          </div>
          {selected.map((value: string) => {
            const option = DISCOUNT_CATEGORY_OPTIONS.find((o) => o.value === value);
            const label = option?.label ?? value;
            const pct = discountPercentByCategory[value];
            return (
              <div key={value} className="min-w-0">
                <DetailRow label={`${label} (%)`} value={pct ? `${pct}%` : undefined} />
              </div>
            );
          })}
        </dl>
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
        <dl className="flex flex-col gap-0 text-sm">
          <DetailRow label={t(`${D}.ppnDiscount`)} value={discountFormHook.watch("ppnDiscount") || undefined} />
          <DetailRow
            label={t(`${D}.inclusion`)}
            value={inclusionLabels.length > 0 ? inclusionLabels.join(", ") : undefined}
          />
          <DetailRow
            label={t(`${D}.exclusion`)}
            value={exclusionLabels.length > 0 ? exclusionLabels.join(", ") : undefined}
          />
          <DetailRow label={t(`${D}.opd`)} value={opdEnabled ? yesLabel : noLabel} />
          {opdEnabled
            ? opdList.map((value: string) => {
                const label = OPD_LIST_OPTIONS.find((o) => o.value === value)?.label ?? value;
                const pct = opdPercentByKey[value];
                return (
                  <DetailRow
                    key={value}
                    label={`${label} (%)`}
                    value={pct ? `${pct}%` : undefined}
                  />
                );
              })
            : null}
          <DetailRow
            label={t(`${D}.additionalDiscount`)}
            value={additionalDiscountEnabled ? yesLabel : noLabel}
          />
          {additionalDiscountEnabled
            ? additionalDiscountList.map((value: string) => {
                const label =
                  ADDITIONAL_DISCOUNT_OPTIONS.find((o) => o.value === value)?.label ?? value;
                const pct = additionalDiscountPercentByKey[value];
                return (
                  <DetailRow
                    key={value}
                    label={`${label} (%)`}
                    value={pct ? `${pct}%` : undefined}
                  />
                );
              })
            : null}
          <DetailRow
            label={t(`${D}.tatForDiscount`)}
            value={tatDisplay}
          />
          <DetailRow
            label={t(`${D}.applicableOn`)}
            value={
              applicableOn
                ? discountApplicableOnOptions.find((o) => o.value === applicableOn)?.label
                : undefined
            }
          />
          <DetailRow
            label={t(`${D}.effectiveFrom`)}
            value={
              discountFormHook.watch("effectiveFrom")
                ? formatToDDMMMYYYY(discountFormHook.watch("effectiveFrom"))
                : undefined
            }
          />
          <DetailRow label={t(`${D}.remarks`)} value={discountFormHook.watch("remarks") || undefined} />
        </dl>
      </div>
    </div>
  );
}
