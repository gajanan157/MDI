import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui";
import { BillScopeMultiSelect } from "../../../../../../ic-corporate-mapping/components/BillScopeMultiSelect";
import type { BulkDiscountTypeConfig } from "../types/discountTypes";
import {
  DISCOUNT_FIELD_CONTROL_CLASS,
  DISCOUNT_PERCENT_GRID_CLASS,
  DISCOUNT_TYPE_CARD_CLASS,
} from "../utils/discountConfig";
import {
  isBulkDiscountConfigComplete,
  resolveDiscountTypeTone,
} from "../utils/discountTypeStyles";
import { isZeroPercent, sanitizeDiscountPercentInput } from "../utils/discountHelpers";
import { humanDiscountLabel } from "../utils/discountDisplayLabel";
import { DiscountPanelHeader } from "./DiscountPanelHeader";

type DiscountServiceSelectSectionProps = {
  title: string;
  placeholder: string;
  toneTypeId: string;
  options: { value: string; label: string }[];
  isOwnedType: (type: string) => boolean;
  selectedDiscountTypes: string[];
  bulkDiscountByType: Record<string, BulkDiscountTypeConfig>;
  onDiscountTypesChange: (next: string[]) => void;
  onBulkChange: (next: Record<string, BulkDiscountTypeConfig>) => void;
  isViewMode?: boolean;
  showPercentForType?: (type: string) => boolean;
};

function labelOf(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function ownedTypePercentText(showPercent: boolean, percent?: string) {
  if (!showPercent) return "";
  return percent ? `${percent}%` : "—";
}

export function DiscountServiceSelectSection({
  title,
  placeholder,
  toneTypeId,
  options,
  isOwnedType,
  selectedDiscountTypes,
  bulkDiscountByType,
  onDiscountTypesChange,
  onBulkChange,
  isViewMode = false,
  showPercentForType = () => true,
}: Readonly<DiscountServiceSelectSectionProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const tone = resolveDiscountTypeTone(toneTypeId);
  const preservedTypes = (selectedDiscountTypes ?? []).filter((type) => type && !isOwnedType(type));
  const selectedOwnedTypes = (selectedDiscountTypes ?? []).filter(
    (type) => isOwnedType(type) && Boolean(humanDiscountLabel(labelOf(options, type), type)),
  );
  const percentTypes = selectedOwnedTypes.filter(showPercentForType);
  const isComplete =
    selectedOwnedTypes.length > 0 &&
    percentTypes.every((type) =>
      isBulkDiscountConfigComplete(bulkDiscountByType[type] ?? {}, type),
    );

  const resolvedOptions = useMemo(() => {
    const map = new Map(
      (options ?? [])
        .filter((option) => option.value)
        .map((option) => [option.value, option.label]),
    );
    selectedOwnedTypes.forEach((type) => {
      if (!map.has(type)) map.set(type, type);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [options, selectedOwnedTypes]);

  const applyOwnedTypes = (nextOwnedTypes: string[]) => {
    onDiscountTypesChange([...preservedTypes, ...nextOwnedTypes]);
    const nextBulk = { ...bulkDiscountByType };
    Object.keys(nextBulk).forEach((key) => {
      if (isOwnedType(key) && !nextOwnedTypes.includes(key)) {
        delete nextBulk[key];
      }
    });
    nextOwnedTypes.forEach((type) => {
      nextBulk[type] = {
        discountPercent: nextBulk[type]?.discountPercent ?? "",
        applicableOn: type === "package" ? (nextBulk[type]?.applicableOn ?? "") : "",
      };
    });
    onBulkChange(nextBulk);
  };

  const removeOwnedType = (type: string) => {
    applyOwnedTypes(selectedOwnedTypes.filter((id) => id !== type));
  };

  const applyPercent = (type: string, percent: string) => {
    onBulkChange({
      ...bulkDiscountByType,
      [type]: {
        discountPercent: percent,
        applicableOn: bulkDiscountByType[type]?.applicableOn ?? "",
      },
    });
  };

  if (isViewMode) {
    if (selectedOwnedTypes.length === 0) return null;
    return (
      <div className={`${DISCOUNT_TYPE_CARD_CLASS} ${tone.panel}`}>
        <DiscountPanelHeader title={title} tone={tone} typeId={toneTypeId} isViewMode />
        <div className={DISCOUNT_PERCENT_GRID_CLASS}>
          {selectedOwnedTypes.map((type) => (
            <div key={type} className="min-w-0 text-[11px] text-gray-900">
              <p className="text-[10px] text-gray-600">{labelOf(resolvedOptions, type) || "—"}</p>
              <p>
                {ownedTypePercentText(
                  showPercentForType(type),
                  bulkDiscountByType[type]?.discountPercent,
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${DISCOUNT_TYPE_CARD_CLASS} ${tone.panel}`}>
      <DiscountPanelHeader
        title={title}
        tone={tone}
        typeId={toneTypeId}
        isComplete={isComplete}
        showStatus
      />
      <BillScopeMultiSelect
        label=""
        placeholder={placeholder}
        value={selectedOwnedTypes}
        onChange={applyOwnedTypes}
        options={resolvedOptions}
        size="sm"
        menuPlacement="top"
      />
      {percentTypes.length > 0 ? (
        <div className={DISCOUNT_PERCENT_GRID_CLASS}>
          {percentTypes.map((type) => {
            const typeLabel = labelOf(resolvedOptions, type);
            return (
              <div key={type} className="flex min-w-0 items-end gap-1">
                <div className="min-w-0 flex-1">
                  <Input
                    label={typeLabel}
                    isRequired
                    type="text"
                    inputMode="decimal"
                    placeholder={t(`${D}.enterDiscountPercent`)}
                    value={bulkDiscountByType[type]?.discountPercent ?? ""}
                    error={
                      isZeroPercent(bulkDiscountByType[type]?.discountPercent)
                        ? t(`${D}.zeroPercentNotAllowed`)
                        : undefined
                    }
                    onChange={(event) =>
                      applyPercent(type, sanitizeDiscountPercentInput(event.target.value))
                    }
                    suffix={<span className="shrink-0 text-[11px] text-gray-500">%</span>}
                    className={DISCOUNT_FIELD_CONTROL_CLASS}
                  />
                </div>
                <button
                  type="button"
                  aria-label={t(`${D}.componentDiscounts.removeRow`, {
                    defaultValue: `Remove ${typeLabel}`,
                  })}
                  title={t(`${D}.componentDiscounts.removeRow`, {
                    defaultValue: `Remove ${typeLabel}`,
                  })}
                  onClick={() => removeOwnedType(type)}
                  className="mb-0.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-gray-200 text-base leading-none text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[10px] leading-relaxed text-red-600" role="alert">
          {t(`${D}.componentDiscounts.emptyHint`)}
        </p>
      )}
    </div>
  );
}
