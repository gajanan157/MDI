import { useTranslation } from "react-i18next";
import type { BulkDiscountTypeConfig } from "../types/discountTypes";
import { isPackagePpnVariant } from "../utils/discountBulkConfig";

type DiscountPpnVariantToggleProps = {
  value: BulkDiscountTypeConfig["ppnVariant"];
  onChange?: (next: "ppn" | "nonPpn") => void;
  disabled?: boolean;
  readOnly?: boolean;
};

function toggleClass(isActive: boolean): string {
  const base =
    "rounded px-1.5 py-0.5 text-[9px] font-semibold leading-tight transition-all";
  if (isActive) {
    return `${base} bg-white text-amber-800 shadow-sm ring-1 ring-amber-200`;
  }
  return `${base} text-gray-600 hover:text-gray-900`;
}

export function DiscountPpnVariantToggle({
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: Readonly<DiscountPpnVariantToggleProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const selected = isPackagePpnVariant(value) ? value : "";
  const isDisabled = disabled || readOnly;

  return (
    <div
      className="inline-flex shrink-0 rounded-md border border-amber-200 bg-amber-50/80 p-0.5"
      role="tablist"
      aria-label={t(`${D}.packagePpnTypeAria`)}
    >
      {(
        [
          { id: "ppn" as const, label: t(`${D}.ppn`) },
          { id: "nonPpn" as const, label: t(`${D}.nonPpn`) },
        ] as const
      ).map((option) => {
        const isActive = selected === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={isDisabled}
            className={`${toggleClass(isActive)} ${
              isDisabled ? "cursor-default" : "cursor-pointer"
            }`}
            onClick={() => {
              if (!isDisabled) onChange?.(option.id);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
