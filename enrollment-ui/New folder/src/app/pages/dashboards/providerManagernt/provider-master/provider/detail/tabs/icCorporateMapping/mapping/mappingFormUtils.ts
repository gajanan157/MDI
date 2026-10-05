import type {
  CreateCorporateNetworkMappingBody,
  CreateInsurerNetworkMappingBody,
  CreateProviderNetworkMappingBody,
  PatchProviderNetworkMappingBody,
} from "../api";
import { emptyToNull } from "../shared";
import { filterAlphanumericCodeInput } from "../../../../../../shared/alphanumericCodeInput";
import { IC_MAPPING_FORM_DEFAULTS } from "./config";
import { uploadRestrictionSupportingDocument } from "../restriction/documents";
import type { NormalizedProviderNetworkMapping } from "./network";
import { toRestrictionDateInputValue } from "../restriction/utils";
import type { IcMappingFormState, ItemWithIdName } from "../types";

export function cloneIcMappingFormState(form: IcMappingFormState): IcMappingFormState {
  return {
    ...form,
    corporateIds: [...form.corporateIds],
  };
}

/** Uploads supporting document on save when a file was chosen but upload did not finish. */
export async function resolveIcMappingFormForSave(
  providerId: string,
  form: IcMappingFormState,
): Promise<{ ok: true; form: IcMappingFormState } | { ok: false; message?: string }> {
  if (form.supportingDocument && !form.supportingFileMetadataId.trim()) {
    const uploadResult = await uploadRestrictionSupportingDocument(
      form.supportingDocument,
      providerId,
    );
    if (!uploadResult.ok) {
      return { ok: false, message: uploadResult.message };
    }

    return {
      ok: true,
      form: {
        ...form,
        supportingFileMetadataId: uploadResult.fileMetadataId,
        supportingDocumentName: form.supportingDocument.name,
        inwardNo: uploadResult.inwardNo?.trim() ?? "",
      },
    };
  }

  return { ok: true, form };
}

/**
 * Fixed identifier type for the "IC Provider Code" entered on this form,
 * per the POST /v1/provider/{providerId}/network-mapping contract.
 */
const IC_MAPPING_IDENTIFIER_TYPE_CODE = "INSURER_PROVIDER_CODE";

/**
 * The form stores "Insurer" / "TPA" (display values), while the API contract
 * uses the uppercase enum "INSURER" / "TPA" (see `providerNetworkSource` in
 * the GET network-mapping response).
 */
function toProviderNetworkSource(empanelmentSource: string): string {
  if (empanelmentSource === "Insurer") return "INSURER";
  return empanelmentSource;
}

function readSharedNetworkMappingFields(form: IcMappingFormState) {
  return {
    insurerId: form.icName.trim() ? form.icName : null,
    providerNetworkSource: toProviderNetworkSource(form.empanelmentSource),
    providerNetworkEffectiveFrom: form.effectiveFrom.trim(),
    providerNetworkEffectiveTo: emptyToNull(form.effectiveTo),
    insurerProviderCode: emptyToNull(filterAlphanumericCodeInput(form.icProviderCode)),
    identifierTypeCode: IC_MAPPING_IDENTIFIER_TYPE_CODE,
    remark: emptyToNull(form.remarks),
    inwardNo: emptyToNull(form.inwardNo),
    supportingFileMetadataId: emptyToNull(form.supportingFileMetadataId),
  };
}

/** Builds POST body for the Insurance Company sub-tab. */
export function buildInsurerNetworkMappingCreateBody(
  providerId: string,
  form: IcMappingFormState,
): CreateInsurerNetworkMappingBody {
  return {
    providerId,
    providerMappingType: "INSURER",
    ...readSharedNetworkMappingFields(form),
  };
}

/** Builds POST body for the Corporate sub-tab — one request with all selected corporate ids. */
export function buildCorporateNetworkMappingCreateBody(
  providerId: string,
  form: IcMappingFormState,
): CreateCorporateNetworkMappingBody {
  return {
    providerId,
    providerMappingType: "CORPORATE",
    corporateIds: form.corporateIds.map((corporateId) => corporateId.trim()).filter(Boolean),
    ...readSharedNetworkMappingFields(form),
  };
}

function buildNetworkMappingCreateBody(
  providerId: string,
  form: IcMappingFormState,
  mappingSubTab: "ic" | "corporate",
): CreateProviderNetworkMappingBody {
  if (mappingSubTab === "corporate") {
    return buildCorporateNetworkMappingCreateBody(providerId, form);
  }
  return buildInsurerNetworkMappingCreateBody(providerId, form);
}

/** PATCH update — sends only fields that changed vs the form snapshot at Edit. */
export function buildNetworkMappingUpdateBody(
  providerNetworkMappingId: string,
  providerId: string,
  originalForm: IcMappingFormState,
  currentForm: IcMappingFormState,
  mappingSubTab: "ic" | "corporate",
): PatchProviderNetworkMappingBody | null {
  const originalBody = buildNetworkMappingCreateBody(providerId, originalForm, mappingSubTab);
  const currentBody = buildNetworkMappingCreateBody(providerId, currentForm, mappingSubTab);
  const patch: Record<string, unknown> = {};

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

  if (Object.keys(patch).length === 0) {
    return null;
  }

  if (patch.insurerProviderCode !== undefined) {
    patch.identifierTypeCode = IC_MAPPING_IDENTIFIER_TYPE_CODE;
  }

  return {
    providerNetworkMappingId,
    providerMappingType: toProviderMappingType(mappingSubTab),
    ...patch,
  } as PatchProviderNetworkMappingBody;
}

/** One POST body — Corporate tab sends all selected corporates in `corporateIds`. */
export function buildNetworkMappingCreateBodies(
  providerId: string,
  form: IcMappingFormState,
  mappingSubTab: "ic" | "corporate",
): CreateProviderNetworkMappingBody[] {
  if (mappingSubTab !== "corporate") {
    return [buildInsurerNetworkMappingCreateBody(providerId, form)];
  }

  const body = buildCorporateNetworkMappingCreateBody(providerId, form);
  if (body.corporateIds.length === 0) return [];

  return [body];
}

/** `providerMappingType` on PATCH unmap — tab-wise for backend routing. */
export function toProviderMappingType(mappingSubTab: "ic" | "corporate"): "INSURER" | "CORPORATE" {
  if (mappingSubTab === "corporate") return "CORPORATE";
  return "INSURER";
}

/** Builds the body for `PATCH /v1/provider/{providerId}/network-mapping` (unmap). */
export function buildNetworkMappingUnmapBody(
  item: ItemWithIdName,
  mappingSubTab: "ic" | "corporate",
  options: {
    effectiveFrom: string;
    remark: string;
    supportingFileMetadataId: string;
    inwardNo: string;
  },
): PatchProviderNetworkMappingBody {
  const restrictionId = item.providerRestrictionId?.trim() ?? "";

  const body: PatchProviderNetworkMappingBody = {
    providerNetworkMappingId: item.providerNetworkMappingId ?? "",
    providerNetworkIsActive: false,
    providerNetworkEffectiveFrom: emptyToNull(options.effectiveFrom),
    remark: emptyToNull(options.remark),
    supportingFileMetadataId: emptyToNull(options.supportingFileMetadataId),
    inwardNo: emptyToNull(options.inwardNo),
    providerMappingType: toProviderMappingType(mappingSubTab),
  };

  if (restrictionId) {
    body.providerRestrictionId = restrictionId;
    body.providerRestrictionApplicableFor = "CASHLESS";
  }

  return body;
}

/**
 * GET response uses uppercase enums ("INSURER" / "TPA"); the form stores
 * display values ("Insurer" / "TPA") used by the Empanelment Source dropdown.
 */
function fromProviderNetworkSource(apiValue: string): string {
  const value = apiValue.trim().toUpperCase();
  if (value === "INSURER") return "Insurer";
  if (value === "TPA") return "TPA";
  return IC_MAPPING_FORM_DEFAULTS.empanelmentSource;
}

/** Maps `GET /v1/provider/{providerId}/network-mapping/{id}` to the edit form. */
export function mapProviderNetworkMappingToForm(
  row: NormalizedProviderNetworkMapping,
): IcMappingFormState {
  return {
    icName: row.insurerId,
    corporateIds: row.corporateId ? [row.corporateId] : [],
    icProviderCode: row.insurerProviderCode,
    empanelmentSource: fromProviderNetworkSource(row.providerNetworkSource),
    networkMode: row.providerNetworkMode,
    tariffType: row.providerNetworkTariffType,
    effectiveFrom: toRestrictionDateInputValue(row.providerNetworkEffectiveFrom),
    effectiveTo: toRestrictionDateInputValue(row.providerNetworkEffectiveTo),
    remarks: row.remark,
    supportingDocument: null,
    supportingFileMetadataId: row.supportingFileMetadataId,
    supportingDocumentName: "",
    inwardNo: row.inwardNo,
  };
}

function resolveEmpanelmentSource(networkSource: ItemWithIdName["networkSource"]): string {
  const value = String(networkSource ?? "").trim().toUpperCase();
  if (value === "TPA") return "TPA";
  if (value === "IC" || value === "INSURER") return "Insurer";
  return IC_MAPPING_FORM_DEFAULTS.empanelmentSource;
}

export function buildIcMappingFormFromItem(
  item: ItemWithIdName,
  mappingVariant: "ic" | "corporate" = "ic",
): IcMappingFormState {
  return {
    icName: mappingVariant === "corporate" ? (item.insurerId ?? "") : (item.insurerId ?? item.id),
    corporateIds: mappingVariant === "corporate" ? [item.id] : [],
    icProviderCode: filterAlphanumericCodeInput(item.icProviderCode ?? ""),
    empanelmentSource: resolveEmpanelmentSource(item.networkSource),
    networkMode: item.networkMode ?? "",
    tariffType: item.tariffType ?? "",
    effectiveFrom: "",
    effectiveTo: "",
    remarks: "",
    supportingDocument: null,
    supportingFileMetadataId: item.supportingFileMetadataId ?? "",
    supportingDocumentName: "",
    inwardNo: item.inwardNo ?? "",
  };
}

/** Row id from GET list when `providerNetworkMappingId` is the grid row key. */
export function resolveProviderNetworkMappingId(item: ItemWithIdName): string {
  const fromField = item.providerNetworkMappingId?.trim() ?? "";
  if (fromField) return fromField;

  const rowId = item.id?.trim() ?? "";
  const insurerId = item.insurerId?.trim() ?? "";
  if (rowId && rowId !== insurerId) return rowId;

  return "";
}

/** Grid-only fields for the “Provider Mapped with IC” table. */
export type IcMappingGridExtras = {
  partyCode: string;
  partyCodeStatus: "available" | "pending";
  insurerType?: string;
  networkSource: string;
  networkMode: string;
  tariffType: string;
  providerNetworkIsActive: boolean;
  cashless: boolean;
  reimbursement: boolean;
  agreement: string;
  agreementStatus: "completed" | "pending" | "active" | "other";
  providerAgreementId?: string;
  providerAgreementName?: string;
  bankMatch: "matched" | "mismatch" | "pending";
  providerRestrictionId: string;
  providerNetworkMappingId: string;
  providerRestrictionApplicableFor: string;
  supportingFileMetadataId: string;
  inwardNo: string;
};
