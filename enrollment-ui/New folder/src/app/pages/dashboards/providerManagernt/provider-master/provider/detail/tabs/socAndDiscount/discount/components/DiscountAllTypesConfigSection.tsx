import type { BulkDiscountTypeConfig, DiscountComponentRow } from "../types/discountTypes";
import { isIpdSelectDiscountType } from "../utils/discountBulkConfig";
import { DISCOUNT_BULK_GRID_CLASS } from "../utils/discountConfig";
import { getOrderedSelectedDiscountTypes } from "../utils/discountTypeStyles";
import { DiscountBulkTypePanel } from "./DiscountBulkTypePanel";
import { DiscountComponentDiscountsSection } from "./DiscountComponentDiscountsSection";
import type { BillScopeOption } from "../../../../../../ic-corporate-mapping/components/BillScopeMultiSelect";

type DiscountAllTypesConfigSectionProps = {
  selectedDiscountTypes: string[];
  bulkDiscountByType: Record<string, BulkDiscountTypeConfig>;
  onBulkChange: (
    next:
      | Record<string, BulkDiscountTypeConfig>
      | ((
          prev: Record<string, BulkDiscountTypeConfig>,
        ) => Record<string, BulkDiscountTypeConfig>),
  ) => void;
  componentDiscounts: DiscountComponentRow[];
  onComponentDiscountsChange: (
    next: DiscountComponentRow[] | ((prev: DiscountComponentRow[]) => DiscountComponentRow[]),
  ) => void;
  discountTypeOptions: { value: string; label: string }[];
  discountApplicableOnOptions: { value: string; label: string }[];
  componentOptions?: { value: string; label: string }[];
  ipdTypeIds?: readonly string[];
  isViewMode?: boolean;
  showIndividualComponents?: boolean;
  inclusionByType?: Record<string, string[]>;
  exclusionByType?: Record<string, string[]>;
  onInclusionChange?: (typeKey: string, next: string[]) => void;
  onExclusionChange?: (typeKey: string, next: string[]) => void;
  inclusionExclusionOptions?: BillScopeOption[];
  showPackagePpnToggle?: boolean;
};

function labelOf(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function DiscountAllTypesConfigSection({
  selectedDiscountTypes,
  bulkDiscountByType,
  onBulkChange,
  componentDiscounts,
  onComponentDiscountsChange,
  discountTypeOptions,
  discountApplicableOnOptions,
  componentOptions,
  ipdTypeIds,
  isViewMode = false,
  showIndividualComponents = true,
  inclusionByType = {},
  exclusionByType = {},
  onInclusionChange,
  onExclusionChange,
  inclusionExclusionOptions = [],
  showPackagePpnToggle = false,
}: Readonly<DiscountAllTypesConfigSectionProps>) {
  const orderedTypes = getOrderedSelectedDiscountTypes(selectedDiscountTypes).filter(
    (typeId) => isIpdSelectDiscountType(typeId, ipdTypeIds),
  );

  const updateBulkType = (type: string, patch: Partial<BulkDiscountTypeConfig>) => {
    onBulkChange((prev) => ({
      ...prev,
      [type]: {
        discountPercent: prev[type]?.discountPercent ?? "",
        applicableOn: prev[type]?.applicableOn ?? "",
        ppnVariant: prev[type]?.ppnVariant ?? "",
        ...patch,
      },
    }));
  };

  if (orderedTypes.length === 0) return null;

  const individualSelected = orderedTypes.includes("individual");
  const bulkTypes = orderedTypes.filter((typeId) => typeId !== "individual");
  const showIndividual = individualSelected && showIndividualComponents;

  if (!showIndividual && bulkTypes.length === 0) return null;

  return (
    <div className="mt-2 flex w-full flex-col gap-1.5 border-t border-gray-200 pt-2">
      {showIndividual ? (
        <DiscountComponentDiscountsSection
          rows={componentDiscounts}
          onChange={onComponentDiscountsChange}
          componentOptions={componentOptions}
          isViewMode={isViewMode}
        />
      ) : null}
      {bulkTypes.length > 0 ? (
        <div className={DISCOUNT_BULK_GRID_CLASS}>
          {bulkTypes.map((typeId) => {
            const config = bulkDiscountByType[typeId] ?? {
              discountPercent: "",
              applicableOn: "",
              ppnVariant: "",
            };
            return (
              <DiscountBulkTypePanel
                key={typeId}
                type={typeId}
                typeLabel={labelOf(discountTypeOptions, typeId) || typeId}
                config={config}
                onChange={(patch) => updateBulkType(typeId, patch)}
                discountApplicableOnOptions={discountApplicableOnOptions}
                isViewMode={isViewMode}
                inclusion={inclusionByType[typeId] ?? []}
                exclusion={exclusionByType[typeId] ?? []}
                onInclusionChange={
                  onInclusionChange ? (next) => onInclusionChange(typeId, next) : undefined
                }
                onExclusionChange={
                  onExclusionChange ? (next) => onExclusionChange(typeId, next) : undefined
                }
                inclusionExclusionOptions={inclusionExclusionOptions}
                showPpnToggle={typeId === "package" && showPackagePpnToggle}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
