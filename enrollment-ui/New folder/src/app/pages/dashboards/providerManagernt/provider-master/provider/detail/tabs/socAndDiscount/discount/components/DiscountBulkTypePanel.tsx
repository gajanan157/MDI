import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui";
import type { BulkDiscountTypeConfig } from "../types/discountTypes";
import {
  DISCOUNT_BULK_PANEL_CLASS,
  DISCOUNT_FIELD_CONTROL_CLASS,
  DISCOUNT_FIELD_LABEL_CLASS,
  DISCOUNT_TYPE_CARD_CLASS,
} from "../utils/discountConfig";
import { isBulkDiscountConfigComplete, resolveDiscountTypeTone } from "../utils/discountTypeStyles";
import { isZeroPercent, sanitizeDiscountPercentInput } from "../utils/discountHelpers";
import { DiscountControlledDropdown } from "./DiscountControlledDropdown";
import { DiscountPanelHeader } from "./DiscountPanelHeader";
import { DiscountInclusionExclusionPair } from "./DiscountInclusionExclusionPair";
import { DiscountPpnVariantToggle } from "./DiscountPpnVariantToggle";
import type { BillScopeOption } from "../../../../../../ic-corporate-mapping/components/BillScopeMultiSelect";

type DiscountBulkTypePanelProps = {
  type: string;
  typeLabel: string;
  config: BulkDiscountTypeConfig;
  onChange: (patch: Partial<BulkDiscountTypeConfig>) => void;
  discountApplicableOnOptions: { value: string; label: string }[];
  isViewMode?: boolean;
  inclusion?: string[];
  exclusion?: string[];
  onInclusionChange?: (next: string[]) => void;
  onExclusionChange?: (next: string[]) => void;
  inclusionExclusionOptions?: BillScopeOption[];
  showPpnToggle?: boolean;
};

function labelOf(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function DiscountBulkTypePanel({
  type,
  typeLabel,
  config,
  onChange,
  discountApplicableOnOptions,
  isViewMode = false,
  inclusion = [],
  exclusion = [],
  onInclusionChange,
  onExclusionChange,
  inclusionExclusionOptions = [],
  showPpnToggle = false,
}: Readonly<DiscountBulkTypePanelProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const tone = resolveDiscountTypeTone(type);
  const panelClass = DISCOUNT_BULK_PANEL_CLASS[type] ?? tone.panel;
  const showApplicableOn = type === "package";
  const isComplete = isBulkDiscountConfigComplete(config, type, {
    requirePpnVariant: showPpnToggle,
  });
  const panelTitle = t(`${D}.panelTitles.${type}`, { defaultValue: typeLabel });

  const ppnToggle = showPpnToggle ? (
    <DiscountPpnVariantToggle
      value={config.ppnVariant}
      onChange={(next) => onChange({ ppnVariant: next })}
      readOnly={isViewMode}
    />
  ) : null;

  if (isViewMode) {
    return (
      <div className={`${DISCOUNT_TYPE_CARD_CLASS} ${panelClass}`}>
        <DiscountPanelHeader
          title={panelTitle}
          tone={tone}
          typeId={type}
          isViewMode
          end={ppnToggle}
        />
        <dl className={showApplicableOn ? "grid grid-cols-2 gap-1.5" : "grid grid-cols-1 gap-1.5"}>
          <div className="min-w-0">
            <dt className={DISCOUNT_FIELD_LABEL_CLASS}>{t(`${D}.discountPercent`)}</dt>
            <dd className="text-[11px] text-gray-900">
              {config.discountPercent ? `${config.discountPercent}%` : "—"}
            </dd>
          </div>
          {showApplicableOn ? (
            <div className="min-w-0">
              <dt className={DISCOUNT_FIELD_LABEL_CLASS}>{t(`${D}.applicableOn`)}</dt>
              <dd className="text-[11px] text-gray-900">
                {labelOf(discountApplicableOnOptions, config.applicableOn) || "—"}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    );
  }

  return (
    <div className={`${DISCOUNT_TYPE_CARD_CLASS} ${panelClass}`}>
      <DiscountPanelHeader
        title={panelTitle}
        tone={tone}
        typeId={type}
        isComplete={isComplete}
        showStatus={!showPpnToggle}
        end={ppnToggle}
      />
      <div className={showApplicableOn ? "grid grid-cols-2 gap-1.5" : "grid grid-cols-1"}>
        <div className="min-w-0">
          <Input
            label={t(`${D}.discountPercent`)}
            isRequired
            placeholder={t(`${D}.enterDiscountPercent`)}
            type="text"
            inputMode="decimal"
            value={config.discountPercent}
            onChange={(event) =>
              onChange({ discountPercent: sanitizeDiscountPercentInput(event.target.value) })
            }
            error={
              isZeroPercent(config.discountPercent)
                ? t(`${D}.zeroPercentNotAllowed`)
                : undefined
            }
            suffix={<span className="shrink-0 text-[11px] text-gray-500">%</span>}
            className={DISCOUNT_FIELD_CONTROL_CLASS}
          />
        </div>
        {showApplicableOn ? (
          <div className="min-w-0">
            <DiscountControlledDropdown
              label={t(`${D}.applicableOn`)}
              isRequired
              options={discountApplicableOnOptions}
              value={config.applicableOn}
              onChange={(next) => onChange({ applicableOn: next })}
              className={DISCOUNT_FIELD_CONTROL_CLASS}
              defaultValue={t(`${D}.fields.selectSoc`)}
            />
          </div>
        ) : null}
      </div>
      {onInclusionChange && onExclusionChange ? (
        <div className="mt-1.5">
          <DiscountInclusionExclusionPair
            inclusion={inclusion}
            exclusion={exclusion}
            onInclusionChange={onInclusionChange}
            onExclusionChange={onExclusionChange}
            uniqueOptions={inclusionExclusionOptions}
          />
        </div>
      ) : null}
    </div>
  );
}
