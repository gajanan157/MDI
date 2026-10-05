import { useCallback } from "react";
import {
  patchProviderBankAccount,
  postProviderBankAccount,
  type ProviderBankAccountWritePayload,
} from "@/store/features/provider/providerAPI";
import {
  mapInfrastructureToProviderDetail,
  updateProviderInfrastructure,
} from "@/store/features/providerInfrastructure/providerInfrastructureSlice";
import type { ProviderInfrastructurePatchPayload } from "@/store/features/providerInfrastructure/providerInfrastructureTypes";
import { updateProviderManpower } from "@/store/features/providerManpower/providerManpowerSlice";
import type { ProviderManpowerPatchPayload } from "@/store/features/providerManpower/providerManpowerTypes";
import { updateProviderFacility } from "@/store/features/providerFacility/providerFacilitySlice";
import type { ProviderFacilityPatchPayload } from "@/store/features/providerFacility/providerFacilityTypes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import type { HospitalDetailRecord } from "../../hospitalData";
import type { BankFormValues } from "../schemas";
import {
  BANK_FORM_API_FIELDS,
  type BankTabFieldsFromApi,
} from "../utils/sectionMerges/bank/bankTypes";
import {
  PROVIDER_BANK_ACCOUNT_PAN_IDENTIFIER_TYPE_NAME,
  PROVIDER_BANK_ACCOUNT_TAN_IDENTIFIER_TYPE_NAME,
  mapProviderBankAccountToTabFields,
} from "../utils/sectionMerges/bank/bankAccountMapper";
import { parseInfrastructureBedFieldsFromPayload } from "../utils/providerDetailSectionMerges";

type BankSaveDocuments = {
  cancelChequeFileMetadataId?: string;
  panCardFileMetadataId?: string;
};

type UseViewHospitalBankSaveArgs = {
  id: string | undefined;
  bankTabFields: BankTabFieldsFromApi | null;
  canWriteBankDetails: boolean;
  setBankTabFields: React.Dispatch<React.SetStateAction<BankTabFieldsFromApi | null>>;
};

function normalizeValue(value: unknown): unknown {
  if (typeof value === "string") return value.trim();
  return value ?? undefined;
}

function readBankIdFromResponse(data: unknown): string {
  const mapped = mapProviderBankAccountToTabFields(
    data != null && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null,
  );
  if (mapped?.providerBankId) return mapped.providerBankId;

  if (data == null || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  const nested = record.data;
  if (nested != null && typeof nested === "object") {
    if (Array.isArray(nested)) {
      const first = nested.find(
        (item): item is Record<string, unknown> =>
          item != null && typeof item === "object" && !Array.isArray(item),
      );
      return first
        ? mapProviderBankAccountToTabFields(first)?.providerBankId ?? ""
        : "";
    }
    return (
      mapProviderBankAccountToTabFields(nested as Record<string, unknown>)
        ?.providerBankId ?? ""
    );
  }
  return "";
}

function buildBankWritePayload(
  values: BankFormValues,
  ifscVerifiedStatus: boolean | null | undefined,
  documents: BankSaveDocuments | undefined,
): ProviderBankAccountWritePayload {
  const cancelChequeFileMetadataId =
    documents?.cancelChequeFileMetadataId?.trim() || undefined;
  const panCardFileMetadataId =
    documents?.panCardFileMetadataId?.trim() || undefined;

  const payload: ProviderBankAccountWritePayload = {
    panIdentifierTypeName: PROVIDER_BANK_ACCOUNT_PAN_IDENTIFIER_TYPE_NAME,
    tanIdentifierTypeName: PROVIDER_BANK_ACCOUNT_TAN_IDENTIFIER_TYPE_NAME,
  };

  for (const key of BANK_FORM_API_FIELDS) {
    const value = String(values[key] ?? "").trim();
    if (value) payload[key] = value;
  }

  if (ifscVerifiedStatus != null) {
    payload.providerBankIfscIsVerified = ifscVerifiedStatus;
  }
  if (cancelChequeFileMetadataId) {
    payload.cancelChequeFileMetadataId = cancelChequeFileMetadataId;
  }
  if (panCardFileMetadataId) {
    payload.panCardFileMetadataId = panCardFileMetadataId;
  }

  return payload;
}

type BankFormApiFields = Pick<
  BankTabFieldsFromApi,
  (typeof BANK_FORM_API_FIELDS)[number]
>;

function pickBankFormApiFields(values: BankFormValues): BankFormApiFields {
  const fields = {} as BankFormApiFields;
  for (const key of BANK_FORM_API_FIELDS) {
    fields[key] = values[key];
  }
  return fields;
}

function mergeLocalBankTabFields(
  prev: BankTabFieldsFromApi | null,
  values: BankFormValues,
  ifscVerifiedStatus: boolean | null | undefined,
  documents: BankSaveDocuments | undefined,
  nextBankId?: string,
): BankTabFieldsFromApi {
  return {
    ...(prev ?? ({} as BankTabFieldsFromApi)),
    providerBankId: nextBankId?.trim() || prev?.providerBankId || "",
    providerBankIfscIsVerified: ifscVerifiedStatus ?? null,
    cancelChequeFileMetadataId:
      documents?.cancelChequeFileMetadataId?.trim() ||
      prev?.cancelChequeFileMetadataId,
    panCardFileMetadataId:
      documents?.panCardFileMetadataId?.trim() || prev?.panCardFileMetadataId,
    ...pickBankFormApiFields(values),
  };
}

function commitLocalBankFields(
  setBankTabFields: UseViewHospitalBankSaveArgs["setBankTabFields"],
  values: BankFormValues,
  ifscVerifiedStatus: boolean | null | undefined,
  documents: BankSaveDocuments | undefined,
  nextBankId?: string,
): void {
  setBankTabFields((prev) =>
    mergeLocalBankTabFields(prev, values, ifscVerifiedStatus, documents, nextBankId),
  );
}

type BankSaveApiResult = {
  errorPayload?: unknown;
  status?: number;
  error?: string | null;
};

function mapBankSaveFieldErrors(res: BankSaveApiResult) {
  const payload = res.errorPayload as
    | { error?: { fields?: Record<string, string> } }
    | undefined;
  const apiFields = payload?.error?.fields ?? {};
  const fieldErrors: Partial<Record<"providerPanNo" | "providerTanNo", string>> = {};
  if (apiFields.providerPanNo) fieldErrors.providerPanNo = apiFields.providerPanNo;
  if (apiFields.providerTanNo) fieldErrors.providerTanNo = apiFields.providerTanNo;
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors };
  }
  showErrorMessage({
    status: res.status,
    error: res.error ?? "Unable to save bank details.",
  });
  return false;
}

function buildPreviousBankPayload(
  bankTabFields: BankTabFieldsFromApi | null,
): Record<string, unknown> {
  return {
    providerAccountType: bankTabFields?.providerAccountType,
    providerBankAccountBeneficiaryType:
      bankTabFields?.providerBankAccountBeneficiaryType,
    providerBankName: bankTabFields?.providerBankName,
    providerBankBranch: bankTabFields?.providerBankBranch,
    providerBankIfscCode: bankTabFields?.providerBankIfscCode,
    providerBankMicrCode: bankTabFields?.providerBankMicrCode,
    providerBankHolderName: bankTabFields?.providerBankHolderName,
    providerBankAccountNo: bankTabFields?.providerBankAccountNo,
    providerBankAddress: bankTabFields?.providerBankAddress,
    providerPanNo: bankTabFields?.providerPanNo,
    providerPanHolderName: bankTabFields?.providerPanHolderName,
    providerTanNo: bankTabFields?.providerTanNo,
    providerBankIfscIsVerified: bankTabFields?.providerBankIfscIsVerified ?? undefined,
    cancelChequeFileMetadataId: bankTabFields?.cancelChequeFileMetadataId,
    panCardFileMetadataId: bankTabFields?.panCardFileMetadataId,
  };
}

function buildChangedBankPayload(
  currentPayload: Record<string, unknown>,
  previousPayload: Record<string, unknown>,
): Record<string, unknown> {
  const changed: Record<string, unknown> = {};
  for (const [key, nextRaw] of Object.entries(currentPayload)) {
    const next = normalizeValue(nextRaw);
    const prev = normalizeValue(previousPayload[key]);
    if (next !== prev) changed[key] = next;
  }
  return changed;
}

export function useViewHospitalBankSave({
  id,
  bankTabFields,
  canWriteBankDetails,
  setBankTabFields,
}: UseViewHospitalBankSaveArgs) {
  const handleBankDetailsSave = useCallback(
    async (
      values: BankFormValues,
      ifscVerifiedStatus?: boolean | null,
      documents?: BankSaveDocuments,
    ): Promise<
      | boolean
      | {
          ok: boolean;
          fieldErrors?: Partial<
            Record<"providerPanNo" | "providerTanNo", string>
          >;
        }
    > => {
      if (!id) {
        showErrorMessage({ error: "Provider ID is missing." });
        return false;
      }
      if (!canWriteBankDetails) {
        showErrorMessage({ error: "You do not have permission to update bank details." });
        return false;
      }

      const bankId = bankTabFields?.providerBankId?.trim() ?? "";
      const writePayload = buildBankWritePayload(
        values,
        ifscVerifiedStatus,
        documents,
      );

      if (!bankId) {
        const res = await postProviderBankAccount(id, writePayload);
        if (!res.success) {
          return mapBankSaveFieldErrors(res);
        }
        commitLocalBankFields(
          setBankTabFields,
          values,
          ifscVerifiedStatus,
          documents,
          readBankIdFromResponse(res.data),
        );
        showSuccessMessage("Bank details saved successfully.");
        return true;
      }

      const currentPayload: Record<string, unknown> = {
        ...values,
        providerBankIfscIsVerified: ifscVerifiedStatus ?? undefined,
        cancelChequeFileMetadataId:
          documents?.cancelChequeFileMetadataId?.trim() || undefined,
        panCardFileMetadataId: documents?.panCardFileMetadataId?.trim() || undefined,
      };
      const changedPayload = buildChangedBankPayload(
        currentPayload,
        buildPreviousBankPayload(bankTabFields),
      );
      if (Object.keys(changedPayload).length === 0) {
        showSuccessMessage("No changes to update.");
        return true;
      }

      const res = await patchProviderBankAccount(id, {
        providerBankId: bankId,
        panIdentifierTypeName: PROVIDER_BANK_ACCOUNT_PAN_IDENTIFIER_TYPE_NAME,
        tanIdentifierTypeName: PROVIDER_BANK_ACCOUNT_TAN_IDENTIFIER_TYPE_NAME,
        ...changedPayload,
      });
      if (!res.success) {
        return mapBankSaveFieldErrors(res);
      }
      commitLocalBankFields(
        setBankTabFields,
        values,
        ifscVerifiedStatus,
        documents,
        bankId,
      );
      showSuccessMessage("Bank details updated successfully.");
      return true;
    },
    [bankTabFields, canWriteBankDetails, id, setBankTabFields],
  );

  return { handleBankDetailsSave };
}

type UseViewHospitalInfrastructureSaveArgs = {
  id: string | undefined;
  canWrite: boolean;
  setProviderProfile: React.Dispatch<React.SetStateAction<HospitalDetailRecord | null>>;
  setHospital: React.Dispatch<React.SetStateAction<HospitalDetailRecord | null>>;
};

export function useViewHospitalInfrastructureSave({
  id,
  canWrite,
  setProviderProfile,
  setHospital,
}: UseViewHospitalInfrastructureSaveArgs) {
  const dispatch = useAppDispatch();

  const handleInfrastructureSave = useCallback(
    async (payload: ProviderInfrastructurePatchPayload) => {
      if (!id) {
        showErrorMessage({ error: "Provider ID is missing." });
        return false;
      }
      if (!canWrite) {
        showErrorMessage({ error: "You do not have permission to update infrastructure." });
        return false;
      }
      const result = await dispatch(updateProviderInfrastructure({ providerId: id, payload }));
      if (updateProviderInfrastructure.fulfilled.match(result)) {
        const detailInfra = mapInfrastructureToProviderDetail(result.payload);
        const bedPatch = parseInfrastructureBedFieldsFromPayload(result.payload);
        const hasBedPatch = Object.keys(bedPatch).length > 0;
        if (detailInfra || hasBedPatch) {
          setProviderProfile((prev) =>
            prev
              ? {
                  ...prev,
                  ...(detailInfra ? { providerDetailInfrastructure: detailInfra } : {}),
                  ...bedPatch,
                }
              : prev,
          );
          setHospital((prev) =>
            prev
              ? {
                  ...prev,
                  ...(detailInfra ? { providerDetailInfrastructure: detailInfra } : {}),
                  ...bedPatch,
                }
              : prev,
          );
        }
        showSuccessMessage("Infrastructure details updated successfully.");
        return true;
      }
      showErrorMessage({
        error:
          (result.payload as string | undefined) ?? "Failed to update provider infrastructure.",
      });
      return false;
    },
    [canWrite, dispatch, id, setHospital, setProviderProfile],
  );

  return { handleInfrastructureSave };
}

export function useViewHospitalManpowerSave({
  id,
  canWrite,
}: {
  id: string | undefined;
  canWrite: boolean;
}) {
  const dispatch = useAppDispatch();

  const handleManpowerSave = useCallback(
    async (payload: ProviderManpowerPatchPayload) => {
      if (!id) {
        showErrorMessage({ error: "Provider ID is missing." });
        return false;
      }
      if (!canWrite) {
        showErrorMessage({ error: "You do not have permission to update manpower." });
        return false;
      }
      const result = await dispatch(updateProviderManpower({ providerId: id, payload }));
      if (updateProviderManpower.fulfilled.match(result)) {
        showSuccessMessage("Manpower details updated successfully.");
        return true;
      }
      showErrorMessage({
        error:
          (result.payload as string | undefined) ?? "Failed to update provider manpower.",
      });
      return false;
    },
    [canWrite, dispatch, id],
  );

  return { handleManpowerSave };
}

export function useViewHospitalFacilitySave({
  id,
  canWrite,
}: {
  id: string | undefined;
  canWrite: boolean;
}) {
  const dispatch = useAppDispatch();

  const handleFacilitySave = useCallback(
    async (payload: ProviderFacilityPatchPayload) => {
      if (!id) {
        showErrorMessage({ error: "Provider ID is missing." });
        return false;
      }
      if (!canWrite) {
        showErrorMessage({ error: "You do not have permission to update facility." });
        return false;
      }
      const result = await dispatch(updateProviderFacility({ providerId: id, payload }));
      if (updateProviderFacility.fulfilled.match(result)) {
        showSuccessMessage("Facility details updated successfully.");
        return true;
      }
      showErrorMessage({
        error:
          (result.payload as string | undefined) ?? "Failed to update provider facility.",
      });
      return false;
    },
    [canWrite, dispatch, id],
  );

  return { handleFacilitySave };
}
