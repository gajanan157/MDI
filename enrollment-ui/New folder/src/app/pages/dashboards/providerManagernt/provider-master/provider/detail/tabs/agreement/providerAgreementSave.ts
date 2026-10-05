import type { AgreementFullFormValues } from "./utils/agreementFormConfig";
import { emptyToNull } from "../icCorporateMapping/config";
import {
  mapFormAgreementTypeToApi,
  mapFormStatusToApi,
} from "./utils/providerAgreementHelpers";
import {
  getAgreementNameFlags,
  shouldSendProviderGipsaPpnCity,
  shouldSendProviderGipsaPpnFields,
  shouldSendProviderGipsaPpnState,
} from "./utils/agreementHelpers";
import type {
  NormalizedProviderAgreement,
  ProviderAgreementInsurerMapping,
} from "@/store/features/providerAgreement/providerAgreementTypes";

/** Fields used to build create/update agreement API bodies (UI + API shared). */
export type AgreementSaveFormValues = {
  agreementName: string;
  agreementVersion: string;
  agreementType: string;
  applicableScope: string;
  selectedIcIds: string[];
  status: string;
  effectiveFrom: string;
  effectiveTo: string;
  agreementDurationDays: string;
  empanelmentDate: string;
  signAgreementSentDate: string;
  providerSignatoryName: string;
  providerSignatoryDesignation: string;
  agreementCopyAvailable: string;
  infrastructureAuditDone: string;
  remarks: string;
  ppnState: string;
  ppnCity: string;
  creditPeriodDays?: string;
  interestPeriod?: string;
};

export type CreateProviderAgreementBody = {
  providerId: string;
  providerGipsaPpnCity?: string | null;
  providerGipsaPpnState?: string | null;
  tpaId: string | null;
  providerAgreementName: string;
  providerAgreementType: string;
  applicableScope: string;
  providerAgreementStatus: string;
  providerAgreementEffectiveFrom: string;
  providerAgreementEffectiveTo: string | null;
  providerEmpanellmentDate: string | null;
  providerAgreementSignedDate: string | null;
  providerSignatoryName: string | null;
  providerSignatoryDesignation: string | null;
  providerAgreementCreditPeriod: number | null;
  providerAgreementServicePeriod: number | null;
  providerAgreementDuration: number | null;
  providerAgreementVersion: string;
  providerAgreementCopyAvailableFlag: boolean;
  infraAuditDoneFlag: boolean;
  remark: string | null;
  fileMetadataId?: string | null;
  supportingFileMetadataId?: string | null;
  inwardNo?: string | null;
  insurerMappings?: ProviderAgreementInsurerMapping[];
};

/** Shared agreement payload shape used for PATCH diffing. */
export type ProviderAgreementPayload = Omit<
  CreateProviderAgreementBody,
  "insurerMappings"
> & {
  insurerMappings: ProviderAgreementInsurerMapping[];
};

export type PatchProviderAgreementBody = {
  providerAgreementId: string;
} & Partial<Omit<ProviderAgreementPayload, "providerId">> & {
    providerId?: string;
    fileMetadataId?: string | null;
    supportingFileMetadataId?: string | null;
    inwardNo?: string | null;
    recordStatus?: string;
  };

type BuildCreateProviderAgreementBodyInput = {
  providerId: string;
  tpaId: string;
  formValues: AgreementSaveFormValues;
  fileMetadataId?: string | null;
  supportingFileMetadataId?: string | null;
  inwardNo?: string | null;
};

function readNumberOrNull(value: string): number | null {
  const trimmed = String(value).trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolvePeriodDays(primary: string | undefined, fallback: string): number | null {
  const primaryDays = readNumberOrNull(primary ?? "");
  if (primaryDays != null) return primaryDays;
  return readNumberOrNull(fallback);
}

function readYesNoFlag(value: string): boolean {
  return value.trim().toLowerCase() === "yes";
}

function buildInsurerMappings(
  formValues: Pick<AgreementSaveFormValues, "applicableScope" | "selectedIcIds">,
): ProviderAgreementInsurerMapping[] {
  // Form scope stays SELECTED_INSURER for IC picker; PSU_TRIPARTITE still sends mappings
  // even though API applicableScope is "PSU".
  if (formValues.applicableScope.trim().toUpperCase() !== "SELECTED_INSURER") return [];
  return formValues.selectedIcIds
    .map((insurerId) => insurerId.trim())
    .filter(Boolean)
    .map((insurerId) => ({ insurerId }));
}

/**
 * PSU_TRIPARTITE → "PSU";
 * GIPSA_PPN_TRIPARTITE → "ALL_PSU";
 * TPA_PROVIDER_BIPARTITE → "SELECTED_INSURER";
 * else form radio.
 */
function resolveApplicableScopeForApi(
  agreementName: string,
  formScope: string,
): string {
  const flags = getAgreementNameFlags(agreementName);
  if (flags.isPsuTripartite) {
    return "SELECTED_PSU";
  }
  if (flags.isGipsaPpnTripartite) {
    return "ALL_PSU";
  }
  if (flags.isTpaBipartite) {
    return "SELECTED_INSURER";
  }
  return formScope.trim();
}

/** GIC edit: keep remaining mapped ICs (with mapping ids) so removals persist on PATCH. */
function buildGicInsurerMappingsForUpdate(
  formValues: Pick<AgreementSaveFormValues, "selectedIcIds">,
  original: NormalizedProviderAgreement,
): ProviderAgreementInsurerMapping[] {
  const selectedIds = formValues.selectedIcIds
    .map((insurerId) => insurerId.trim())
    .filter(Boolean);
  const selectedSet = new Set(selectedIds);
  const kept = original.insurerMappings.filter((mapping) =>
    selectedSet.has(mapping.insurerId),
  );
  const keptIds = new Set(kept.map((mapping) => mapping.insurerId));
  const additions = selectedIds
    .filter((insurerId) => !keptIds.has(insurerId))
    .map((insurerId) => ({ insurerId }));
  return [...kept, ...additions];
}

function appendGipsaPpnFields(
  body: CreateProviderAgreementBody,
  agreementName: string,
  ppnCity: string,
  ppnState: string,
): void {
  if (!shouldSendProviderGipsaPpnFields(agreementName)) return;
  if (shouldSendProviderGipsaPpnState(agreementName)) {
    body.providerGipsaPpnState = emptyToNull(ppnState);
  }
  if (shouldSendProviderGipsaPpnCity(agreementName)) {
    body.providerGipsaPpnCity = emptyToNull(ppnCity);
  }
}

/** Builds the body for `POST /v1/provider/{providerId}/agreement`. */
export function buildCreateProviderAgreementBody(
  input: BuildCreateProviderAgreementBodyInput,
): CreateProviderAgreementBody {
  const { formValues, providerId, tpaId } = input;

  const agreementDuration = readNumberOrNull(formValues.agreementDurationDays);
  const creditPeriod = resolvePeriodDays(formValues.creditPeriodDays, formValues.agreementDurationDays);
  const servicePeriod = resolvePeriodDays(formValues.interestPeriod, formValues.agreementDurationDays);
  const insurerMappings = buildInsurerMappings(formValues);

  const body: CreateProviderAgreementBody = {
    providerId,
    tpaId: emptyToNull(tpaId),
    providerAgreementName: formValues.agreementName.trim(),
    providerAgreementType: mapFormAgreementTypeToApi(formValues.agreementType),
    applicableScope: resolveApplicableScopeForApi(
      formValues.agreementName,
      formValues.applicableScope,
    ),
    providerAgreementStatus: mapFormStatusToApi(formValues.status),
    providerAgreementEffectiveFrom: formValues.effectiveFrom.trim(),
    providerAgreementEffectiveTo: emptyToNull(formValues.effectiveTo),
    providerEmpanellmentDate: emptyToNull(formValues.empanelmentDate),
    providerAgreementSignedDate: emptyToNull(formValues.signAgreementSentDate),
    providerSignatoryName: emptyToNull(formValues.providerSignatoryName),
    providerSignatoryDesignation: emptyToNull(formValues.providerSignatoryDesignation),
    providerAgreementCreditPeriod: creditPeriod,
    providerAgreementServicePeriod: servicePeriod,
    providerAgreementDuration: agreementDuration,
    providerAgreementVersion: formValues.agreementVersion.trim(),
    providerAgreementCopyAvailableFlag: readYesNoFlag(formValues.agreementCopyAvailable),
    infraAuditDoneFlag: readYesNoFlag(formValues.infrastructureAuditDone),
    remark: emptyToNull(formValues.remarks),
  };

  appendGipsaPpnFields(
    body,
    formValues.agreementName,
    formValues.ppnCity,
    formValues.ppnState,
  );

  if (insurerMappings.length > 0) {
    body.insurerMappings = insurerMappings;
  }

  if (input.fileMetadataId?.trim()) {
    body.fileMetadataId = input.fileMetadataId.trim();
  }
  if (input.supportingFileMetadataId?.trim()) {
    body.supportingFileMetadataId = input.supportingFileMetadataId.trim();
  }
  if (input.inwardNo?.trim()) {
    body.inwardNo = input.inwardNo.trim();
  }

  return body;
}

function buildProviderAgreementPayload(
  providerId: string,
  tpaId: string,
  formValues: AgreementSaveFormValues,
): ProviderAgreementPayload {
  const body = buildCreateProviderAgreementBody({ providerId, tpaId, formValues });
  return {
    ...body,
    insurerMappings: buildInsurerMappings(formValues),
  };
}

/** Maps a normalized agreement row to the PATCH-comparable payload shape. */
export function buildProviderAgreementPayloadFromNormalizedRow(
  row: NormalizedProviderAgreement,
): ProviderAgreementPayload {
  const body: ProviderAgreementPayload = {
    providerId: row.providerId,
    tpaId: emptyToNull(row.tpaId),
    providerAgreementName: row.providerAgreementName.trim(),
    providerAgreementType: row.providerAgreementType.trim(),
    applicableScope: row.applicableScope.trim(),
    providerAgreementStatus: row.providerAgreementStatus.trim(),
    providerAgreementEffectiveFrom: row.providerAgreementEffectiveFrom.trim(),
    providerAgreementEffectiveTo: emptyToNull(row.providerAgreementEffectiveTo),
    providerEmpanellmentDate: emptyToNull(row.providerEmpanellmentDate),
    providerAgreementSignedDate: emptyToNull(row.providerAgreementSignedDate),
    providerSignatoryName: emptyToNull(row.providerSignatoryName),
    providerSignatoryDesignation: emptyToNull(row.providerSignatoryDesignation),
    providerAgreementCreditPeriod: row.providerAgreementCreditPeriod,
    providerAgreementServicePeriod: row.providerAgreementServicePeriod,
    providerAgreementDuration: row.providerAgreementDuration,
    providerAgreementVersion: row.providerAgreementVersion.trim(),
    providerAgreementCopyAvailableFlag: row.providerAgreementCopyAvailableFlag,
    infraAuditDoneFlag: row.infraAuditDoneFlag,
    remark: emptyToNull(row.remark),
    insurerMappings: row.insurerMappings,
  };

  appendGipsaPpnFields(
    body,
    row.providerAgreementName,
    row.providerGipsaPpnCity,
    row.providerGipsaPpnState,
  );

  return body;
}

type BuildProviderAgreementPayloadFromFullFormInput = {
  providerId: string;
  tpaId: string;
  formValues: AgreementFullFormValues;
  originalRow: NormalizedProviderAgreement;
};

export function buildProviderAgreementPayloadFromFullForm(
  input: BuildProviderAgreementPayloadFromFullFormInput,
): ProviderAgreementPayload {
  const formValues: AgreementSaveFormValues = {
    ...input.formValues,
    creditPeriodDays: String(input.originalRow.providerAgreementCreditPeriod),
    interestPeriod: String(input.originalRow.providerAgreementServicePeriod),
  };

  const payload = buildProviderAgreementPayload(
    input.providerId,
    input.tpaId,
    formValues,
  );

  if (getAgreementNameFlags(formValues.agreementName).isGicStandard) {
    return {
      ...payload,
      insurerMappings: buildGicInsurerMappingsForUpdate(
        formValues,
        input.originalRow,
      ),
    };
  }

  return payload;
}

/** PATCH update — sends only fields that changed vs the loaded agreement row. */
export function buildUpdateProviderAgreementPatchBody(
  original: NormalizedProviderAgreement,
  currentForm: AgreementFullFormValues,
  input: {
    providerId: string;
    tpaId: string;
    fileMetadataId?: string;
    supportingFileMetadataId?: string;
    inwardNo?: string;
  },
): PatchProviderAgreementBody | null {
  const originalBody = buildProviderAgreementPayloadFromNormalizedRow(original);
  const currentBody = buildProviderAgreementPayloadFromFullForm({
    providerId: input.providerId,
    tpaId: input.tpaId,
    formValues: currentForm,
    originalRow: original,
  });

  const patch: Record<string, unknown> = {
    providerAgreementId: original.providerAgreementId,
  };

  const allKeys = new Set([
    ...Object.keys(originalBody),
    ...Object.keys(currentBody),
  ]);

  for (const key of allKeys) {
    if (key === "providerId") continue;
    const left = (originalBody as Record<string, unknown>)[key];
    const right = (currentBody as Record<string, unknown>)[key];
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      patch[key] = right;
    }
  }

  if (!shouldSendProviderGipsaPpnFields(currentForm.agreementName)) {
    delete patch.providerGipsaPpnCity;
    delete patch.providerGipsaPpnState;
  } else if (!shouldSendProviderGipsaPpnCity(currentForm.agreementName)) {
    delete patch.providerGipsaPpnCity;
  }

  const documentFields: Array<{
    key: "fileMetadataId" | "supportingFileMetadataId" | "inwardNo";
    next: string;
    previous: string;
  }> = [
    {
      key: "fileMetadataId",
      next: input.fileMetadataId?.trim() ?? original.fileMetadataId.trim(),
      previous: original.fileMetadataId.trim(),
    },
    {
      key: "supportingFileMetadataId",
      next: input.supportingFileMetadataId?.trim() ?? original.supportingFileMetadataId.trim(),
      previous: original.supportingFileMetadataId.trim(),
    },
    {
      key: "inwardNo",
      next: input.inwardNo?.trim() ?? original.inwardNo.trim(),
      previous: original.inwardNo.trim(),
    },
  ];

  for (const field of documentFields) {
    if (field.next !== field.previous) {
      patch[field.key] = emptyToNull(field.next);
    }
  }

  if (Object.keys(patch).length <= 1) {
    return null;
  }

  return patch as PatchProviderAgreementBody;
}
