import type { DiscountSubtypeMasterRecord } from "@/store/features/discountSubtypeMaster/discountSubtypeMasterTypes";
import type { DiscountInclusionExclusionMasterRecord } from "@/store/features/discountInclusionExclusionMaster/discountInclusionExclusionMasterTypes";
import type { CreateProviderDiscountConfigurationBody } from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationTypes";
import type {
  BulkDiscountTypeConfig,
  DiscountComponentRow,
  DiscountFormValues,
} from "../types/discountTypes";
import {
  resolveCorporateApplicability,
  resolveInsurerApplicability,
  resolveInsurerIds,
} from "./discountInsurerScopeHelpers";
import {
  buildOpdSubtypeAliasMap,
  getSelectedOpdSubtypeFormKeys,
  resolveFormPercentForOpdSubtype,
  resolveOpdSubtypeMasterIdForFormKey,
} from "./discountOpdHelpers";
import { isIpdSelectDiscountType, toProviderPpnFlag } from "./discountBulkConfig";
import { resolveMasterIdsFromSelected } from "./discountInclusionExclusionHelpers";
import { resolveDiscountTypeMasterId } from "./discountIpdBulkHelpers";

type DiscountTypeOption = { value: string; label: string; masterId?: string };

export type BuildProviderDiscountConfigurationCreatePayloadArgs = {
  providerId: string;
  values: DiscountFormValues;
  componentDiscounts: DiscountComponentRow[];
  ipdDiscountTypeOptions: DiscountTypeOption[];
  opdMasterId: string;
  inclusionExclusionMasterRecords: DiscountInclusionExclusionMasterRecord[];
  opdSubtypeMasterRecords: DiscountSubtypeMasterRecord[];
  ipdTypeIds: readonly string[];
  opdPercentByKey: Record<string, string>;
  supportingFileMetadataId?: string;
};

function parsePercent(raw: string | undefined): number | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed || trimmed === ".") return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function computeCreditPeriodDays(from: string, to: string): number | null {
  const start = from.trim();
  const end = to.trim();
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

function resolveDiscountServiceType(ipdEnabled: boolean, opdEnabled: boolean): string {
  if (ipdEnabled && opdEnabled) return "IPD";
  if (opdEnabled) return "OPD";
  return "IPD";
}

function buildCorporateMappings(values: DiscountFormValues) {
  if (values.corporateAll) return [];
  const mappings: NonNullable<
    CreateProviderDiscountConfigurationBody["providerInsurerCorporateDiscount"]
  > = [];
  Object.entries(values.corporateIdsByInsurer).forEach(([insurerId, corporateIds]) => {
    const trimmedInsurerId = insurerId.trim();
    if (!trimmedInsurerId) return;
    const ids: string[] = [];
    const seen = new Set<string>();
    (corporateIds ?? []).forEach((corporateId) => {
      const trimmedCorporateId = String(corporateId ?? "").trim();
      if (!trimmedCorporateId || seen.has(trimmedCorporateId)) return;
      seen.add(trimmedCorporateId);
      ids.push(trimmedCorporateId);
    });
    if (ids.length === 0) return;
    mappings.push({
      insurerId: trimmedInsurerId,
      corporateIds: ids,
    });
  });
  return mappings;
}

function buildIpdDiscountList(
  values: DiscountFormValues,
  componentDiscounts: DiscountComponentRow[],
  ipdDiscountTypeOptions: DiscountTypeOption[],
  inclusionExclusionMasterRecords: DiscountInclusionExclusionMasterRecord[],
) {
  const ipdTypeIds = ipdDiscountTypeOptions.map((option) => option.value);
  const selectedIpdTypes = values.discountTypes.filter((type) =>
    isIpdSelectDiscountType(type, ipdTypeIds),
  );

  return selectedIpdTypes
    .map((typeValue) => {
      const providerDiscountTypeMasterId = resolveDiscountTypeMasterId(
        typeValue,
        ipdDiscountTypeOptions,
      );
      if (!providerDiscountTypeMasterId) return null;
      const providerDiscountInclusionIds =
        typeValue === "individual"
          ? []
          : resolveMasterIdsFromSelected(
              values.inclusionByType?.[typeValue] ?? [],
              inclusionExclusionMasterRecords,
            );
      const providerDiscountExclusionIds =
        typeValue === "individual"
          ? []
          : resolveMasterIdsFromSelected(
              values.exclusionByType?.[typeValue] ?? [],
              inclusionExclusionMasterRecords,
            );

      if (typeValue === "individual") {
        const providerIndividualDiscountRequestDtoList = componentDiscounts
          .filter((row) => row.component.trim())
          .map((row) => ({
            providerDiscountSubTypeMasterId: row.component.trim(),
            providerDiscountPercentage: parsePercent(row.discountPercent),
          }))
          .filter((row) => row.providerDiscountSubTypeMasterId);

        if (providerIndividualDiscountRequestDtoList.length === 0) return null;

        return {
          providerDiscountTypeMasterId,
          providerDiscountPercentage: null,
          providerSocId: values.socId.trim() || null,
          providerIndividualDiscountRequestDtoList,
          providerDiscountInclusionIds,
          providerDiscountExclusionIds,
        };
      }

      const bulkConfig: BulkDiscountTypeConfig | undefined =
        values.bulkDiscountByType[typeValue];
      const providerDiscountPercentage = parsePercent(bulkConfig?.discountPercent);
      if (providerDiscountPercentage == null) return null;
      const providerPpnFlag =
        typeValue === "package" ? toProviderPpnFlag(bulkConfig?.ppnVariant) : undefined;

      return {
        providerDiscountTypeMasterId,
        providerDiscountPercentage,
        providerSocId:
          typeValue === "package"
            ? String(bulkConfig?.applicableOn ?? values.socId ?? "").trim() || null
            : null,
        providerIndividualDiscountRequestDtoList: [],
        providerDiscountInclusionIds,
        providerDiscountExclusionIds,
        ...(providerPpnFlag === undefined ? {} : { providerPpnFlag }),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);
}

function buildOpdDiscountDto(
  values: DiscountFormValues,
  opdMasterId: string,
  opdSubtypeMasterRecords: DiscountSubtypeMasterRecord[],
  ipdTypeIds: readonly string[],
  opdPercentByKey: Record<string, string>,
) {
  if (!values.opdEnabled || !opdMasterId.trim()) return null;

  const aliasMap = buildOpdSubtypeAliasMap(opdSubtypeMasterRecords);
  const selectedOpdFormKeys = getSelectedOpdSubtypeFormKeys(values, ipdTypeIds, aliasMap);
  if (selectedOpdFormKeys.length === 0) return null;

  const providerIndividualDiscountRequestDtoList = selectedOpdFormKeys
    .map((formKey) => ({
      providerDiscountSubTypeMasterId: resolveOpdSubtypeMasterIdForFormKey(
        formKey,
        aliasMap,
      ),
      providerDiscountPercentage: parsePercent(
        resolveFormPercentForOpdSubtype(
          resolveOpdSubtypeMasterIdForFormKey(formKey, aliasMap),
          values,
          opdPercentByKey,
          aliasMap,
        ) ?? values.bulkDiscountByType[formKey]?.discountPercent,
      ),
    }))
    .filter(
      (row) =>
        row.providerDiscountSubTypeMasterId &&
        row.providerDiscountPercentage != null,
    );

  if (providerIndividualDiscountRequestDtoList.length === 0) return null;

  return {
    providerDiscountTypeMasterId: opdMasterId.trim(),
    providerDiscountPercentage: null,
    providerSocId: null,
    providerIndividualDiscountRequestDtoList,
  };
}

export function buildProviderDiscountConfigurationCreatePayload({
  providerId,
  values,
  componentDiscounts,
  ipdDiscountTypeOptions,
  opdMasterId,
  inclusionExclusionMasterRecords,
  opdSubtypeMasterRecords,
  ipdTypeIds,
  opdPercentByKey,
  supportingFileMetadataId,
}: BuildProviderDiscountConfigurationCreatePayloadArgs): CreateProviderDiscountConfigurationBody {
  const trimmedProviderId = providerId.trim();
  const agreementId = String(values.agreementId ?? "").trim();

  return {
    providerId: trimmedProviderId,
    providerAgreementId: agreementId || null,
    discountServiceType: resolveDiscountServiceType(values.ipdEnabled, values.opdEnabled),
    insurerApplicability: resolveInsurerApplicability(values),
    insurerIds: resolveInsurerIds(values),
    corporateApplicability: resolveCorporateApplicability(values),
    providerInsurerCorporateDiscount: buildCorporateMappings(values),
    providerIpdDiscountRequestDtoList: values.ipdEnabled
      ? buildIpdDiscountList(
          values,
          componentDiscounts,
          ipdDiscountTypeOptions,
          inclusionExclusionMasterRecords,
        )
      : [],
    providerOpdDiscountRequestDto: buildOpdDiscountDto(
      values,
      opdMasterId,
      opdSubtypeMasterRecords,
      ipdTypeIds,
      opdPercentByKey,
    ),
    providerDiscountEffectiveFrom: values.effectiveFrom.trim(),
    providerDiscountEffectiveTo: values.effectiveTo.trim(),
    creditPeriodDays:
      computeCreditPeriodDays(values.effectiveFrom, values.effectiveTo) ?? 0,
    remark: values.remarks.trim(),
    supportingFileMetadataId:
      String(supportingFileMetadataId ?? values.supportingFileMetadataId ?? "").trim() || null,
  };
}
