/**
 * Reusable data saving utilities
 * Extracted from duplicated save logic in maker-checker detail
 */

import { putApi, mainApi } from "@/app/api/apiService";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";
import { ensureCommentsArray } from "./dataProcessing";

export interface SaveDataParams<T> {
  id: string;
  requestId: string;
  data: T;
  endpoint?: string;
  onSuccess?: (data: T) => void;
}

/**
 * Saves data with comments array ensured
 */
export async function saveDataWithComments<T extends Record<string, unknown>>({
  id,
  requestId,
  data,
  endpoint = `/mbm/v1/maker-checker/${id}/save`,
  onSuccess,
}: SaveDataParams<T>): Promise<boolean> {
  try {
    // Ensure all sections have comments array
    const dataToSave = ensureCommentsArray(data);

    // API call to save data
    const response = await putApi<
      { message: string; data: T },
      { requestId: string; data: T }
    >(mainApi, endpoint, {
      requestId,
      data: dataToSave,
    });

    if (handleApiResponse(response, "Data saved successfully")) {
      onSuccess?.(dataToSave);
      return true;
    }
    return false;
  } catch (error) {
    showErrorMessage(error, "Failed to save data");
    return false;
  }
}

