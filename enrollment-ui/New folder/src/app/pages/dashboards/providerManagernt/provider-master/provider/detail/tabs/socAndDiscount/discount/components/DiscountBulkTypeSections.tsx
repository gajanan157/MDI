import type { BulkDiscountTypeConfig } from "../types/discountTypes";
import { getSelectedBulkDiscountTypes } from "../utils/discountBulkConfig";
import { DISCOUNT_BULK_GRID_CLASS } from "../utils/discountConfig";
import { DiscountBulkTypePanel } from "./DiscountBulkTypePanel";

type DiscountBulkTypeSectionsProps = {
  selectedDiscountTypes: string[];
  bulkDiscountByType: Record<string, BulkDiscountTypeConfig>;
  onChange: (
    next:
      | Record<string, BulkDiscountTypeConfig>
      | ((
          prev: Record<string, BulkDiscountTypeConfig>,
        ) => Record<string, BulkDiscountTypeConfig>),
  ) => void;
  discountTypeOptions: { value: string; label: string }[];
  discountApplicableOnOptions: { value: string; label: string }[];
  isViewMode?: boolean;
};

function labelOf(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function DiscountBulkTypeSections({
  selectedDiscountTypes,
  bulkDiscountByType,
  onChange,
  discountTypeOptions,
  discountApplicableOnOptions,
  isViewMode = false,
}: Readonly<DiscountBulkTypeSectionsProps>) {
  const bulkTypes = getSelectedBulkDiscountTypes(selectedDiscountTypes);

  if (bulkTypes.length === 0) return null;

  const updateType = (type: string, patch: Partial<BulkDiscountTypeConfig>) => {
    onChange((prev) => ({
      ...prev,
      [type]: { ...EMPTY_FALLBACK(prev[type]), ...patch },
    }));
  };

  return (
    <div className={DISCOUNT_BULK_GRID_CLASS}>
      {bulkTypes.map((type) => {
        const config = bulkDiscountByType[type] ?? {
          discountPercent: "",
          applicableOn: "",
          ppnVariant: "",
        };
        const typeLabel = labelOf(discountTypeOptions, type) || type;

        return (
          <DiscountBulkTypePanel
            key={type}
            type={type}
            typeLabel={typeLabel}
            config={config}
            onChange={(patch) => updateType(type, patch)}
            discountApplicableOnOptions={discountApplicableOnOptions}
            isViewMode={isViewMode}
          />
        );
      })}
    </div>
  );
}

function EMPTY_FALLBACK(value: BulkDiscountTypeConfig | undefined): BulkDiscountTypeConfig {
  return value ?? { discountPercent: "", applicableOn: "", ppnVariant: "" };
}
