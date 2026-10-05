import { getApi, policySearchApi } from "@/app/api/apiService";
import { readFieldValue } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/readFieldValue";
import {
  extractNestedApiRows,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/apiPayloadHelpers";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import { POLICY_SEARCH_KEYS } from "./policySearchFieldKeys";

export type VerifyRestrictionPolicyResult =
  | { ok: true; policyId: string; policyNo: string }
  | { ok: false; message: string };

export type IcCorpDropdownOption = { id: string; name: string };

export type FetchIcCorpDropdownResult =
  | {
      ok: true;
      corporates: IcCorpDropdownOption[];
      policies: IcCorpDropdownOption[];
    }
  | { ok: false; message: string };

function readPolicyNo(row: Record<string, unknown>): string {
  const value = readFieldValue(row, [
    POLICY_SEARCH_KEYS.policyNumber,
    POLICY_SEARCH_KEYS.policyNo,
  ]);
  if (value == null) return "";
  return String(value).trim();
}

function readPolicyId(row: Record<string, unknown>): string {
  const value = readFieldValue(row, [POLICY_SEARCH_KEYS.policyId]);
  if (value == null) return "";
  return String(value).trim();
}

function findPolicyRow(rows: Record<string, unknown>[], policyNo: string) {
  const normalized = policyNo.trim().toLowerCase();
  return rows.find((row) => readPolicyNo(row).toLowerCase() === normalized);
}

function readDropdownItems(raw: unknown): IcCorpDropdownOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (item == null || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const id = String(record.id ?? record.corporateId ?? record.policyId ?? "").trim();
      const name = String(record.name ?? record.corporateName ?? record.policyNo ?? "").trim();
      if (!id || !name) return null;
      return { id, name };
    })
    .filter((item): item is IcCorpDropdownOption => item != null);
}

function unwrapIcCorpDropdownPayload(data: unknown): {
  corporates: IcCorpDropdownOption[];
  policies: IcCorpDropdownOption[];
} {
  if (data == null || typeof data !== "object") {
    return { corporates: [], policies: [] };
  }
  const root = data as Record<string, unknown>;
  const inner =
    root.data != null && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  return {
    corporates: readDropdownItems(inner.corporates),
    policies: readDropdownItems(inner.policies),
  };
}

/**
 * GET `/v1/policies/dropdown/filter/IC-Corp?insurerId=&corporateId=`
 * (policy-management-service) — corporates + policies for restriction level Insurer + Corporate.
 */
export async function fetchIcCorpDropdownApi(args: {
  insurerId: string;
  corporateId?: string;
}): Promise<FetchIcCorpDropdownResult> {
  const insurerId = args.insurerId.trim();
  if (!insurerId) {
    return { ok: false, message: "Insurance company is required." };
  }

  const params = new URLSearchParams({ insurerId });
  const corporateId = args.corporateId?.trim() ?? "";
  if (corporateId) params.set("corporateId", corporateId);

  const response = await getApi<unknown>(
    policySearchApi,
    `v1/policies/dropdown/filter/IC-Corp?${params.toString()}`,
  );

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : ""),
    };
  }

  return {
    ok: true,
    ...unwrapIcCorpDropdownPayload(response.data),
  };
}

/** GET `/v1/policies?insurerId=&policyNo=&page=0&size=20` */
export async function verifyRestrictionPolicyExistsApi(
  insurerId: string,
  policyNo: string,
): Promise<VerifyRestrictionPolicyResult> {
  const resolvedInsurerId = insurerId.trim();
  const resolvedPolicyNo = policyNo.trim();

  if (!resolvedInsurerId) {
    return { ok: false, message: "Insurance company is required." };
  }
  if (!resolvedPolicyNo) {
    return { ok: false, message: "Policy number is required." };
  }

  const params = new URLSearchParams({
    insurerId: resolvedInsurerId,
    policyNo: resolvedPolicyNo,
    page: "0",
    size: "20",
  });

  const response = await getApi<unknown>(
    policySearchApi,
    `v1/policies?${params.toString()}`,
  );

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : ""),
    };
  }

  const rows = extractNestedApiRows(response.data);
  const matched = findPolicyRow(rows, resolvedPolicyNo);

  if (!matched) {
    return { ok: false, message: "Policy not found." };
  }

  const policyId = readPolicyId(matched);
  if (!policyId) {
    return { ok: false, message: "Policy not found." };
  }

  return {
    ok: true,
    policyId,
    policyNo: readPolicyNo(matched) || resolvedPolicyNo,
  };
}
