import { insurerApi, postApi, patchApi } from "@/app/api/apiService";
import { PostAndPutResponse } from "@/app/pages/AdminDepartment/tpa/funcation";

export const createAndUpdateInsurerApi = async <T extends object>(
  payload: T,
  id?: string,
): Promise<PostAndPutResponse> => {
  try {
    const endpoint = id ? `/v1/insurer/${id}` : `/v1/insurer`;
    const method = id ? "patch" : "post";
    const response =
      method === "patch"
        ? await patchApi<any, T>(insurerApi, endpoint, payload)
        : await postApi<any, T>(insurerApi, endpoint, payload);
    return response;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
export const documentTypeMap: Record<string, string> = {
  "PRINCIPLE_AGREEMENT": "PRINCIPAL_AGGREMENT",
  "ADDENDUM": "ADDENDUM",
  "RENEWAL": "RENEWAL",
  "OTHER": "OTHERS",
};
export const getDocumentType = (uploadDocument: string|undefined): string => {
  switch (uploadDocument) {
    case "PRINCIPAL_AGGREMENT":
      return "PRINCIPLE_AGREEMENT";
    case "ADDENDUM":
      return "ADDENDUM";
    case "RENEWAL":
      return "RENEWAL";
    case "OTHERS":
      return "OTHER";
    default:
      return "OTHER";
  }
};
export const transformDocuments = (files: any[]) => {
  const typeCounters: Record<string, number> = {};
  return files
   ?.filter((file) => file?.documentType !== "BRAND_LOGO")
  ?.map((file) => {
    const category =
      documentTypeMap[file?.documentType] || "other";
      typeCounters[category] = (typeCounters[category] || 0) + 1;
    return {
      id: file?.fileMetadataId,
      name:file?.fileName,
      category,
      url: file?.downloadUrl,
      fileMetadataId: file?.fileMetadataId,
      showCondition: () => true,
    };
  });
};