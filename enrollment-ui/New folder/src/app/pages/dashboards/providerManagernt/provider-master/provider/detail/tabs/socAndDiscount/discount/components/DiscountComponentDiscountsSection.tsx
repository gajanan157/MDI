import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui";
import { BillScopeMultiSelect } from "../../../../../../ic-corporate-mapping/components/BillScopeMultiSelect";
import { DISCOUNT_COMPONENT_OPTIONS } from "../../../../../../ic-corporate-mapping/discountOptions";
import type { DiscountComponentRow } from "../types/discountTypes";
import {
  DISCOUNT_FIELD_CONTROL_CLASS,
  DISCOUNT_INDIVIDUAL_PANEL_CLASS,
  DISCOUNT_PERCENT_GRID_CLASS,
} from "../utils/discountConfig";
import { resolveDiscountTypeTone } from "../utils/discountTypeStyles";
import { isZeroPercent, sanitizeDiscountPercentInput } from "../utils/discountHelpers";
import { DiscountPanelHeader } from "./DiscountPanelHeader";

type DiscountComponentDiscountsSectionProps = {
  rows: DiscountComponentRow[];
  onChange: (
    next: DiscountComponentRow[] | ((prev: DiscountComponentRow[]) => DiscountComponentRow[]),
  ) => void;
  componentOptions?: { value: string; label: string }[];
  isViewMode?: boolean;
};

const DEFAULT_COMPONENT_OPTIONS = DISCOUNT_COMPONENT_OPTIONS.filter((option) => option.value);

function createComponentRow(component: string): DiscountComponentRow {
  return {
    id: `comp-${component}`,
    component,
    discountPercent: "",
    applicableOn: "",
  };
}

function labelOf(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function isIndividualConfigComplete(rows: DiscountComponentRow[]): boolean {
  if (rows.length === 0) return false;
  return rows.every((row) => {
    const percent = String(row.discountPercent ?? "").trim();
    if (!percent || percent === ".") return false;
    const numeric = Number(percent);
    return !Number.isNaN(numeric) && numeric > 0 && numeric <= 100;
  });
}

export function DiscountComponentDiscountsSection({
  rows,
  onChange,
  componentOptions,
  isViewMode = false,
}: Readonly<DiscountComponentDiscountsSectionProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const C = "providerMaster.soc.discount.componentDiscounts";
  const tone = resolveDiscountTypeTone("individual");
  const heading = t(`${D}.panelTitles.individual`);
  const resolvedComponentOptions = useMemo(() => {
    const base =
      componentOptions && componentOptions.length > 0
        ? componentOptions
        : DEFAULT_COMPONENT_OPTIONS;
    const map = new Map(base.filter((option) => option.value).map((option) => [option.value, option.label]));
    rows.forEach((row) => {
      if (!row.component || map.has(row.component)) return;
      map.set(row.component, row.component);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [componentOptions, rows]);

  const selectedComponents = rows.map((row) => row.component).filter(Boolean);
  const isComplete = isIndividualConfigComplete(rows);

  const applySelectedComponents = (nextComponents: string[]) => {
    const nextRows = nextComponents.map((component) => {
      const existing = rows.find((row) => row.component === component);
      return existing ?? createComponentRow(component);
    });
    onChange(nextRows);
  };

  const removeComponent = (component: string) => {
    applySelectedComponents(selectedComponents.filter((id) => id !== component));
  };

  const applyPercent = (component: string, percent: string) => {
    onChange((prev) =>
      prev.map((row) =>
        row.component === component ? { ...row, discountPercent: percent } : row,
      ),
    );
  };

  if (isViewMode) {
    if (selectedComponents.length === 0) return null;
    return (
      <div className={DISCOUNT_INDIVIDUAL_PANEL_CLASS}>
        <DiscountPanelHeader title={heading} tone={tone} typeId="individual" isViewMode />
        <div className={DISCOUNT_PERCENT_GRID_CLASS}>
          {selectedComponents.map((component) => {
            const row = rows.find((entry) => entry.component === component);
            return (
              <div key={component} className="min-w-0 text-[11px] text-gray-900">
                <p className="text-[10px] text-gray-600">{labelOf(resolvedComponentOptions, component) || "—"}</p>
                <p>{row?.discountPercent ? `${row.discountPercent}%` : "—"}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={DISCOUNT_INDIVIDUAL_PANEL_CLASS}>
      <DiscountPanelHeader
        title={heading}
        tone={tone}
        typeId="individual"
        isComplete={isComplete}
        showStatus
      />
      <BillScopeMultiSelect
        label=""
        placeholder={t(`${C}.selectComponent`)}
        value={selectedComponents}
        onChange={applySelectedComponents}
        options={resolvedComponentOptions}
        size="sm"
        menuPlacement="top"
      />
      {selectedComponents.length > 0 ? (
        <div className={DISCOUNT_PERCENT_GRID_CLASS}>
          {selectedComponents.map((component) => {
            const row = rows.find((entry) => entry.component === component);
            const componentLabel = labelOf(resolvedComponentOptions, component);
            return (
              <div key={component} className="flex min-w-0 items-end gap-1">
                <div className="min-w-0 flex-1">
                  <Input
                    label={componentLabel}
                    isRequired
                    type="text"
                    inputMode="decimal"
                    placeholder={t(`${D}.enterDiscountPercent`)}
                    value={row?.discountPercent ?? ""}
                    error={
                      isZeroPercent(row?.discountPercent)
                        ? t(`${D}.zeroPercentNotAllowed`)
                        : undefined
                    }
                    onChange={(event) =>
                      applyPercent(component, sanitizeDiscountPercentInput(event.target.value))
                    }
                    suffix={<span className="shrink-0 text-[11px] text-gray-500">%</span>}
                    className={DISCOUNT_FIELD_CONTROL_CLASS}
                  />
                </div>
                <button
                  type="button"
                  aria-label={t(`${C}.removeRow`, {
                    defaultValue: `Remove ${componentLabel}`,
                  })}
                  title={t(`${C}.removeRow`, {
                    defaultValue: `Remove ${componentLabel}`,
                  })}
                  onClick={() => removeComponent(component)}
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
          {t(`${C}.emptyHint`)}
        </p>
      )}
    </div>
  );
}
