import { useTranslation } from "react-i18next";
import { DiscountPanelHeader } from "./DiscountPanelHeader";
import { DiscountPpnVariantToggle } from "./DiscountPpnVariantToggle";
import { DiscountViewChipList } from "./DiscountViewChips";
import type { DiscountTypeViewGroup } from "../types/discountTypes";
import {
  DISCOUNT_FIELD_LABEL_CLASS,
  DISCOUNT_TYPE_CARD_CLASS,
} from "../utils/discountConfig";
import {
  DISCOUNT_TYPE_DISPLAY_ORDER,
  resolveDiscountTypeTone,
} from "../utils/discountTypeStyles";
import {
  isIndividualOnlyIpdDiscount,
  isPackageDiscountGroup,
  rowsForTypeGroup,
} from "../utils/discountIpdOpdViewHelpers";

function formatPercent(value?: string): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "—";
  return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
}

function DiscountTypeGroupRow({
  row,
  allowWrap = false,
}: Readonly<{ row: { id: string; name: string; percent: string }; allowWrap?: boolean }>) {
  return (
    <li className="flex min-w-0 items-center justify-between gap-2">
      <span
        className={
          allowWrap
            ? "min-w-0 text-[11px] leading-snug text-gray-800"
            : "min-w-0 truncate text-[11px] leading-snug text-gray-800"
        }
        title={row.name}
      >
        {row.name}
      </span>
      <span className="shrink-0 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-gray-900">
        {formatPercent(row.percent)}
      </span>
    </li>
  );
}

function subtypeGridClass(
  group: DiscountTypeViewGroup,
  rowCount: number,
  individualOnly: boolean,
): string {
  if (group.typeKey === "individual" && rowCount > 1) {
    return individualOnly
      ? "grid grid-cols-2 gap-x-3 gap-y-1 md:grid-cols-4"
      : "grid grid-cols-2 gap-x-3 gap-y-1";
  }
  if (group.serviceType === "OPD" && rowCount > 1) {
    if (rowCount === 2) return "grid grid-cols-2 gap-x-3 gap-y-1";
    return "grid grid-cols-3 gap-x-3 gap-y-1";
  }
  return "divide-y divide-gray-200/80 [&>li]:py-1.5 [&>li]:first:pt-0 [&>li]:last:pb-0";
}

export function DiscountTypeGroupCard({
  group,
  individualOnly = false,
}: Readonly<{ group: DiscountTypeViewGroup; individualOnly?: boolean }>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const tone = resolveDiscountTypeTone(group.typeKey);
  const rows = rowsForTypeGroup(group);
  const useInlineGrid =
    (group.typeKey === "individual" || group.serviceType === "OPD") && rows.length > 1;
  const packageGroup = isPackageDiscountGroup(group);
  const packageSocName = String(group.socName ?? "").trim();

  if (rows.length === 0) return null;

  return (
    <div className={`${DISCOUNT_TYPE_CARD_CLASS} ${tone.panel}`}>
      <DiscountPanelHeader
        title={group.typeName}
        tone={tone}
        typeId={group.typeKey}
        isViewMode
        end={
          packageGroup ? (
            <div className="flex items-center gap-1.5">
              {packageSocName ? (
                <span
                  className="max-w-[160px] truncate rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700"
                  title={packageSocName}
                >
                  {packageSocName}
                </span>
              ) : null}
              {group.ppnVariant === "ppn" || group.ppnVariant === "nonPpn" ? (
                <DiscountPpnVariantToggle value={group.ppnVariant} readOnly />
              ) : null}
            </div>
          ) : undefined
        }
      />
      {packageGroup ? (
        <dl className="grid grid-cols-2 gap-1">
          <div className="min-w-0">
            <dt className={DISCOUNT_FIELD_LABEL_CLASS}>{t(`${D}.discountPercent`)}</dt>
            <dd className="text-[11px] text-gray-900">{formatPercent(group.percent)}</dd>
          </div>
          <div className="min-w-0 text-right">
            <dt className={DISCOUNT_FIELD_LABEL_CLASS}>{t(`${D}.applicableOn`)}</dt>
            <dd
              className="truncate text-[11px] text-gray-900"
              title={packageSocName || undefined}
            >
              {packageSocName || "—"}
            </dd>
          </div>
        </dl>
      ) : (
        <ul className={subtypeGridClass(group, rows.length, individualOnly)}>
          {rows.map((row) => (
            <DiscountTypeGroupRow
              key={`${row.id}-${row.name}`}
              row={row}
              allowWrap={useInlineGrid}
            />
          ))}
        </ul>
      )}
      {(group.typeKey !== "individual" &&
        group.serviceType !== "OPD" &&
        (group.inclusionItems?.length || group.exclusionItems?.length)) ? (
        <div className="mt-1.5 grid grid-cols-1 gap-1 border-t border-gray-200/80 pt-1.5 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] text-gray-600">
              {t("providerMaster.soc.discount.inclusion")}
            </p>
            <DiscountViewChipList items={group.inclusionItems ?? []} tone="emerald" />
          </div>
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] text-gray-600">
              {t("providerMaster.soc.discount.exclusion")}
            </p>
            <DiscountViewChipList items={group.exclusionItems ?? []} tone="rose" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function sortGroupsForDisplay(groups: DiscountTypeViewGroup[]): DiscountTypeViewGroup[] {
  const order = new Map(DISCOUNT_TYPE_DISPLAY_ORDER.map((id, index) => [id, index]));
  return [...groups].sort((left, right) => {
    const leftOrder = order.get(left.typeKey) ?? 999;
    const rightOrder = order.get(right.typeKey) ?? 999;
    return leftOrder - rightOrder;
  });
}

export function DiscountTypeGroupCardList({
  groups,
  sideBySide = false,
  individualOnly = false,
}: Readonly<{
  groups: DiscountTypeViewGroup[];
  sideBySide?: boolean;
  individualOnly?: boolean;
}>) {
  const visible = sortGroupsForDisplay(
    groups.filter((group) => rowsForTypeGroup(group).length > 0),
  );
  if (visible.length === 0) return null;

  const individualGroup = sideBySide
    ? visible.find((group) => group.typeKey === "individual")
    : undefined;
  const sideGroups = individualGroup
    ? visible.filter((group) => group.typeKey !== "individual")
    : [];

  if (individualGroup && sideGroups.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <DiscountTypeGroupCard
          key={`${individualGroup.serviceType}-${individualGroup.typeKey}-${individualGroup.typeName}`}
          group={individualGroup}
          individualOnly={individualOnly}
        />
        <div className="grid min-w-0 grid-cols-1 gap-1.5">
          {sideGroups.map((group) => (
            <DiscountTypeGroupCard
              key={`${group.serviceType}-${group.typeKey}-${group.typeName}`}
              group={group}
              individualOnly={individualOnly}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        sideBySide && visible.length > 1
          ? "grid grid-cols-1 gap-1.5 sm:grid-cols-2"
          : "grid grid-cols-1 gap-1.5"
      }
    >
      {visible.map((group) => (
        <DiscountTypeGroupCard
          key={`${group.serviceType}-${group.typeKey}-${group.typeName}`}
          group={group}
          individualOnly={individualOnly}
        />
      ))}
    </div>
  );
}

export function DiscountServiceColumn({
  title,
  toneClass,
  titleClass,
  groups,
  sideBySide = false,
  individualOnly = false,
}: Readonly<{
  title: string;
  toneClass: string;
  titleClass: string;
  groups: DiscountTypeViewGroup[];
  sideBySide?: boolean;
  individualOnly?: boolean;
}>) {
  return (
    <div className={`space-y-1.5 rounded-sm border p-2 ${toneClass}`}>
      <p className={`text-[10px] font-semibold ${titleClass}`}>{title}</p>
      {groups.length > 0 ? (
        <DiscountTypeGroupCardList
          groups={groups}
          sideBySide={sideBySide}
          individualOnly={individualOnly}
        />
      ) : (
        <p className="text-[11px] text-gray-500">—</p>
      )}
    </div>
  );
}

export function DiscountIpdOpdGroupsView({
  ipdEnabled,
  opdEnabled,
  ipdGroups,
  opdGroups,
}: Readonly<{
  ipdEnabled: boolean;
  opdEnabled: boolean;
  ipdGroups: DiscountTypeViewGroup[];
  opdGroups: DiscountTypeViewGroup[];
}>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const ipdTone = resolveDiscountTypeTone("individual");
  const opdTone = resolveDiscountTypeTone("opd");
  const individualOnly = isIndividualOnlyIpdDiscount(ipdGroups);

  if (!ipdEnabled && !opdEnabled) return null;

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {ipdEnabled ? (
        <DiscountServiceColumn
          title={t(`${D}.ipd`)}
          toneClass={ipdTone.panel}
          titleClass={ipdTone.panelTitle}
          groups={ipdGroups}
          sideBySide
          individualOnly={individualOnly}
        />
      ) : null}
      {opdEnabled ? (
        <DiscountServiceColumn
          title={t(`${D}.opd`)}
          toneClass={opdTone.panel}
          titleClass={opdTone.panelTitle}
          groups={opdGroups}
          individualOnly={individualOnly}
        />
      ) : null}
    </div>
  );
}
