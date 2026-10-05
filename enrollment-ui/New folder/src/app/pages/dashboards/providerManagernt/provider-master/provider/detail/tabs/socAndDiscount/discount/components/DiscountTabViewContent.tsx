import { useMemo } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { DiscountSectionCard } from "./DiscountSectionCard";
import {
  DiscountViewChip,
  DiscountViewChipList,
  DiscountViewField,
} from "./DiscountViewChips";
import { DiscountIpdOpdGroupsView } from "./DiscountIpdOpdGroupsView";
import { DiscountSupportingDocumentView } from "./DiscountSupportingDocumentView";
import type {
  DiscountDetailRecord,
  DiscountFormValues,
  DiscountNamedItem,
} from "../types/discountTypes";
import {
  DISCOUNT_PAGE_CLASS,
  DISCOUNT_SECTION_BODY_CLASS,
} from "../utils/discountConfig";
import { formatToDDMMMYYYY } from "../../../../../../../shared/dateFormat";
import { formatAgreementNameForDisplay } from "../../../../shared/agreementTypeChip.helpers";
import { isInsurerBipartiteDiscountScopeHidden, usesPsuInsurerScopeLabels } from "../../../agreement/utils/agreementHelpers";
import { humanDiscountLabel, looksLikeUuid } from "../utils/discountDisplayLabel";
import { enrichDiscountTypeGroupsWithSocNames } from "../utils/discountIpdOpdViewHelpers";
import type { DiscountAgreementOption } from "../hooks/useDiscountFormOptions";

type Option = { value: string; label: string };

type DiscountTabViewContentProps = {
  values: DiscountFormValues;
  detail: DiscountDetailRecord | null;
  agreementOptions?: DiscountAgreementOption[];
  insurerOptions: Option[];
  corporateOptions: Option[];
  optionsByInsurerId: Record<string, Option[]>;
  socOptions?: Option[];
};

function labelOf(options: Option[], value: string): string {
  return humanDiscountLabel(
    options.find((option) => option.value === value)?.label,
    looksLikeUuid(value) ? "" : value,
  );
}

function uniqueNamed(items: DiscountNamedItem[]): DiscountNamedItem[] {
  const seen = new Set<string>();
  const next: DiscountNamedItem[] = [];
  items.forEach((item) => {
    const name = humanDiscountLabel(item.name, item.id);
    if (!name || seen.has(name)) return;
    seen.add(name);
    next.push({ id: item.id || name, name });
  });
  return next;
}

function resolveInsurerItems(
  detail: DiscountDetailRecord | null,
  values: DiscountFormValues,
  insurerOptions: Option[],
): DiscountNamedItem[] {
  const fromDetail = uniqueNamed(detail?.insurerItems ?? []);
  if (fromDetail.length > 0) return fromDetail;

  const insurerIds =
    (detail?.insurerIds?.length ? detail.insurerIds : values.insurerIds) ?? [];
  const fromIds = uniqueNamed(
    insurerIds.map((id) => ({
      id,
      name: labelOf(insurerOptions, id),
    })),
  );
  if (fromIds.length > 0) return fromIds;

  if (detail?.insurerAll || values.insurerAll) return [];
  return [];
}

function resolveCorporateItems(
  detail: DiscountDetailRecord | null,
  values: DiscountFormValues,
  insurerOptions: Option[],
  corporateOptions: Option[],
  optionsByInsurerId: Record<string, Option[]>,
): { name: string; detail?: string }[] {
  if (detail?.corporateItems && detail.corporateItems.length > 0) {
    return detail.corporateItems
      .map((item) => ({
        name: humanDiscountLabel(item.name, item.id),
        detail: humanDiscountLabel(item.insurerName),
      }))
      .filter((item) => item.name);
  }
  if (values.corporateAll) return [];
  const items: { name: string; detail?: string }[] = [];
  Object.entries(values.corporateIdsByInsurer ?? {}).forEach(([insurerId, corpIds]) => {
    const insurerName = labelOf(insurerOptions, insurerId);
    (corpIds ?? []).forEach((corpId) => {
      const name = labelOf(optionsByInsurerId[insurerId] ?? corporateOptions, corpId);
      if (!name) return;
      items.push({ name, detail: insurerName || undefined });
    });
  });
  return items;
}

type DiscountViewModel = {
  ipdEnabled: boolean;
  opdEnabled: boolean;
  agreementType: string;
  agreementName: string;
  usesPsuLabels: boolean;
  insurerItems: DiscountNamedItem[];
  showInsurerField: boolean;
  showAllInsurersChip: boolean;
  corporateItems: { name: string; detail?: string }[];
  typeGroups: NonNullable<DiscountDetailRecord["discountTypeGroups"]>;
  effectiveFrom: string;
  effectiveTo: string;
  remarks: string;
  supportingDocumentName: string;
  supportingFileMetadataId: string;
  showAllPolicyholders: boolean;
};

/** Resolves every "detail value, falling back to form value" display field. */
function resolveDiscountViewModel(
  props: Pick<
    DiscountTabViewContentProps,
    | "values"
    | "detail"
    | "agreementOptions"
    | "insurerOptions"
    | "corporateOptions"
    | "optionsByInsurerId"
  >,
): DiscountViewModel {
  const {
    values,
    detail,
    agreementOptions = [],
    insurerOptions,
    corporateOptions,
    optionsByInsurerId,
  } = props;

  const rawAgreementName = values.agreementName || detail?.agreementName || "";
  const agreementId = detail?.agreementId || values.agreementId;
  const agreementName = formatAgreementNameForDisplay(
    rawAgreementName ||
      agreementOptions.find((option) => option.value === agreementId)?.searchText ||
      "",
  );
  const insurerItems = resolveInsurerItems(detail, values, insurerOptions);
  const showInsurerNames = insurerItems.length > 0;
  const corporateItems = resolveCorporateItems(
    detail,
    values,
    insurerOptions,
    corporateOptions,
    optionsByInsurerId,
  );

  return {
    ipdEnabled: detail?.ipdEnabled ?? values.ipdEnabled,
    opdEnabled: detail?.opdEnabled ?? values.opdEnabled,
    agreementType: detail?.agreementType || values.agreementType,
    agreementName,
    usesPsuLabels: usesPsuInsurerScopeLabels(rawAgreementName),
    insurerItems,
    showInsurerField:
      !isInsurerBipartiteDiscountScopeHidden(rawAgreementName) || showInsurerNames,
    showAllInsurersChip:
      !showInsurerNames && Boolean(detail?.insurerAll ?? values.insurerAll),
    corporateItems,
    typeGroups: detail?.discountTypeGroups ?? [],
    effectiveFrom: detail?.effectiveFrom || values.effectiveFrom,
    effectiveTo: detail?.effectiveTo || values.effectiveTo,
    remarks: detail?.remarks || values.remarks,
    supportingDocumentName:
      detail?.supportingDocumentName || values.supportingDocumentName,
    supportingFileMetadataId:
      detail?.supportingFileMetadataId || values.supportingFileMetadataId,
    showAllPolicyholders:
      (detail?.corporateAll ?? values.corporateAll) && corporateItems.length === 0,
  };
}

/** IPD / OPD service-type chips (or an em dash when neither is enabled). */
function ServiceTypeChips({
  ipdEnabled,
  opdEnabled,
  ipdLabel,
  opdLabel,
}: Readonly<{
  ipdEnabled: boolean;
  opdEnabled: boolean;
  ipdLabel: string;
  opdLabel: string;
}>) {
  if (!ipdEnabled && !opdEnabled) return <>—</>;
  return (
    <>
      {ipdEnabled ? <DiscountViewChip tone="blue">{ipdLabel}</DiscountViewChip> : null}
      {opdEnabled ? <DiscountViewChip tone="teal">{opdLabel}</DiscountViewChip> : null}
    </>
  );
}

export function DiscountTabViewContent(
  props: Readonly<DiscountTabViewContentProps>,
) {
  const { socOptions = [] } = props;
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";

  const {
    ipdEnabled,
    opdEnabled,
    agreementType,
    agreementName,
    usesPsuLabels,
    insurerItems,
    showInsurerField,
    showAllInsurersChip,
    corporateItems,
    typeGroups,
    effectiveFrom,
    effectiveTo,
    remarks,
    supportingDocumentName,
    supportingFileMetadataId,
    showAllPolicyholders,
  } = resolveDiscountViewModel(props);

  const enrichedTypeGroups = useMemo(
    () => enrichDiscountTypeGroupsWithSocNames(typeGroups, socOptions),
    [socOptions, typeGroups],
  );
  const ipdGroups = enrichedTypeGroups.filter((group) => group.serviceType === "IPD");
  const opdGroups = enrichedTypeGroups.filter((group) => group.serviceType === "OPD");

  return (
    <div className={DISCOUNT_PAGE_CLASS}>
      <DiscountSectionCard title={t(`${D}.sections.scope`)} bodyClassName={DISCOUNT_SECTION_BODY_CLASS}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DiscountViewField label={t(`${D}.fields.agreementName`)}>
            {agreementName || "—"}
          </DiscountViewField>
          <DiscountViewField label={t(`${D}.fields.agreementType`)}>
            {agreementType || "—"}
          </DiscountViewField>
          <DiscountViewField label={t(`${D}.serviceType`)} className="sm:col-span-2">
            <div className="flex flex-wrap gap-1.5">
              <ServiceTypeChips
                ipdEnabled={ipdEnabled}
                opdEnabled={opdEnabled}
                ipdLabel={t(`${D}.ipd`)}
                opdLabel={t(`${D}.opd`)}
              />
            </div>
          </DiscountViewField>
        </div>

        <div
          className={clsx(
            "mt-3 grid grid-cols-1 gap-3 border-t border-gray-200 pt-3",
            showInsurerField && "lg:grid-cols-2",
          )}
        >
          {showInsurerField ? (
          <DiscountViewField label={t(`${D}.fields.insurers`)}>
            {showAllInsurersChip ? (
              <DiscountViewChip tone="sky">
                {t(`${D}.fields.${usesPsuLabels ? "allPsu" : "allIc"}`)}
              </DiscountViewChip>
            ) : (
              <DiscountViewChipList items={insurerItems} tone="sky" />
            )}
          </DiscountViewField>
          ) : null}
          <DiscountViewField label={t(`${D}.sections.corporate`)}>
            {showAllPolicyholders ? (
              <DiscountViewChip tone="violet">
                {t(`${D}.fields.allPolicyholders`)}
              </DiscountViewChip>
            ) : (
              <DiscountViewChipList items={corporateItems} tone="violet" />
            )}
          </DiscountViewField>
        </div>
      </DiscountSectionCard>

      {ipdEnabled || opdEnabled ? (
        <DiscountSectionCard title={t(`${D}.sections.discount`)} bodyClassName={DISCOUNT_SECTION_BODY_CLASS}>
          <DiscountIpdOpdGroupsView
            ipdEnabled={ipdEnabled}
            opdEnabled={opdEnabled}
            ipdGroups={ipdGroups}
            opdGroups={opdGroups}
          />
        </DiscountSectionCard>
      ) : null}

      <DiscountSectionCard
        title={t(`${D}.sections.details`)}
        bodyClassName={DISCOUNT_SECTION_BODY_CLASS}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DiscountViewField label={t(`${D}.effectiveFrom`)}>
            {effectiveFrom ? formatToDDMMMYYYY(effectiveFrom) : "—"}
          </DiscountViewField>
          <DiscountViewField label={t(`${D}.effectiveTo`)}>
            {effectiveTo ? formatToDDMMMYYYY(effectiveTo) : "—"}
          </DiscountViewField>
          <DiscountViewField label={t(`${D}.supportingDocument`)}>
            <DiscountSupportingDocumentView
              supportingFileMetadataId={supportingFileMetadataId}
              supportingDocumentName={supportingDocumentName}
            />
          </DiscountViewField>
          <DiscountViewField label={t(`${D}.remarks`)}>
            <p className="whitespace-pre-wrap break-words text-xs text-gray-900">
              {remarks || "—"}
            </p>
          </DiscountViewField>
        </div>
      </DiscountSectionCard>
    </div>
  );
}

