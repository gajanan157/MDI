import { masterApi, patchApi, postApi } from "@/app/api/apiService";
import { showErrorMessage } from "@/utils/errorHandler";

interface TPABranchResponse {
  status?: number;
  success: boolean;
  data?: any;
  error?: string | null;
}
export const saveTpaBranch = async <T extends object>(
  payload: T,
  id?: string,
  tpaId?: string,
): Promise<TPABranchResponse> => {
  try {
    const endpoint = id ? `v1/tpa-branch/${id}` : `v1/tpa/${tpaId}/tpa-branch`;
    const method = id ? "patch" : "post";
    const response =
      method === "patch"
        ? await patchApi<any, T>(masterApi, endpoint, payload)
        : await postApi<any, T>(masterApi, endpoint, payload);

    if (!response.success) {
      showErrorMessage(response);
    }

    return response;
  } catch (error: any) {
    showErrorMessage(error.response);
    return { success: false, error: error.message || "An error occurred" };
  }
};

const mobileRegex = /^[6-9]\d{9}$/;
const landlineRegex = /^\d{2,4}-\d{6,8}$/;

function isAllSameDigit(str: string): boolean {
  if (!str || str.length === 0) return true;
  const first = str[0];
  return str.split("").every((c) => c === first);
}

export const normalizePhonesToArray = (
  phones?: string | string[] | null,
): string[] => {
  if (!phones) return [];

  const parts = Array.isArray(phones)
    ? phones.map((p) => (typeof p === "string" ? p.trim() : String(p).trim()))
    : phones.split(",").map((p) => p.trim());

  const result: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    const digitsOnly = p.replace(/\D/g, "");
    if (landlineRegex.test(p)) {
      result.push(p);
    } else if (
      digitsOnly.length === 10 &&
      mobileRegex.test(digitsOnly) &&
      !isAllSameDigit(digitsOnly)
    ) {
      result.push(digitsOnly);
    }
  }
  return result;
};

export const normalizeEmailsToArray = (
  emails?: string | string[] | null,
): string[] => {
  if (!emails) return [];

  if (Array.isArray(emails)) {
    return emails.map((e) => e.trim()).filter(Boolean);
  }

  return emails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
};

export function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(value);
      } else {
        ref.current = value;
      }
    });
  };
}

export function handleApiError(
  response: Parameters<typeof showErrorMessage>[0],
) {
  showErrorMessage(response);
}
