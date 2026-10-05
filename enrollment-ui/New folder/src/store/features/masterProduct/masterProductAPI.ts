import { masterBenefitApi, getApi, postApi, patchApi, documentApi2, type ApiResponse } from "@/app/api/apiService";
import { MasterProductResponse, MasterProduct, ApplyChangesResponse, ApproveProductResponse, FetchMasterProductDocumentsResponse, CreateMasterProductParams, CreateMasterProductResponse, MasterProductRemarksResponse,} from "./masterProductTypes";
import { showErrorMessage } from "@/utils/errorHandler";


export const fetchMasterProductsAPI = async (
  page?: number,
  size?: number,
  queryObj?: Record<string, any>,
): Promise<MasterProductResponse> => {
  const params = new URLSearchParams();

  if (typeof page !== "undefined" && page !== null) {
    const serverPage = Number(page) > 0 ? Number(page) - 1 : 0;
    params.append("page", String(serverPage));
  }

  if (size !== undefined && size !== null && String(size) !== "") {
    params.append("size", String(size));
  }
  if (queryObj && Object.keys(queryObj).length > 0) {
    Object.entries(queryObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }

  const url = params.toString()
    ? `v1/master-product?${params.toString()}`
    : `v1/master-product`;

  const res = await getApi<MasterProductResponse>(masterBenefitApi, url);

  if (!res.success) {
    showErrorMessage(res);
  }

  if (!res.data) {
    throw new Error("No data returned from server");
  }

  return res.data;
};


export const fetchMasterProductByIdAPI = async (
  id: string,
): Promise<MasterProduct> => {
  const url = `v1/master-product/${id}`;

  const res = await getApi<MasterProduct>(masterBenefitApi, url);

  if (!res.success) {
    showErrorMessage(res);
  }

  if (!res.data) {
    throw new Error("No data returned from server");
  }

  return res.data;
};

const MASTER_PRODUCT_PATCH_HEADERS = {
  headers: {
    "X-HTTP-Method-Override": "PATCH",
  },
};

function hasMasterProductDocuments(documents?: File | File[]): boolean {
  if (!documents) return false;
  return Array.isArray(documents)
    ? documents.length > 0
    : documents instanceof File;
}

function buildDocumentUploadFormData(
  documents: File | File[],
  documentType?: string,
): FormData {
  const formData = new FormData();
  if (documentType) {
    formData.append("documentType", documentType);
  }
  const files = Array.isArray(documents) ? documents : [documents];
  files.forEach((file) => {
    if (file instanceof File) {
      formData.append("file", file);
    }
  });
  return formData;
}

function buildJsonUpdateFormData(
  masterProductJson: Record<string, unknown>,
): FormData {
  const formData = new FormData();
  formData.append(
    "masterProductJson",
    new Blob([JSON.stringify(masterProductJson)], {
      type: "application/json",
    }),
  );
  return formData;
}

async function patchMasterProductFormData(
  url: string,
  formData: FormData,
): Promise<ApplyChangesResponse> {
  const res = await patchApi<ApplyChangesResponse, FormData>(
    masterBenefitApi,
    url,
    formData,
    MASTER_PRODUCT_PATCH_HEADERS,
  );
  if (!res.success) showErrorMessage(res);
  if (!res.data) throw new Error("No data returned from server");
  return res.data;
}

function buildApplyChangesFormData(
  masterProductJson?: Record<string, any>,
  documents?: File | File[],
  documentType?: string,
): FormData {
  if (hasMasterProductDocuments(documents)) {
    const formData = buildDocumentUploadFormData(documents as File | File[], documentType);
    if ([...formData.keys()].length === 0) {
      throw new Error("Nothing to update");
    }
    return formData;
  }

  if (!masterProductJson || Object.keys(masterProductJson).length === 0) {
    throw new Error("Nothing to update");
  }

  return buildJsonUpdateFormData(masterProductJson);
}

export const applyChangesMasterProductAPI = async (
  id: string,
  masterProductJson?: Record<string, any>,
  documents?: File | File[],
  documentType?: string,
): Promise<ApplyChangesResponse> => {
  const url = `v1/master-product/${id}`;
  const formData = buildApplyChangesFormData(masterProductJson, documents, documentType);
  return patchMasterProductFormData(url, formData);
};


export const approveMasterProductAPI = async (
  id: string,
  productId?: string,
): Promise<ApproveProductResponse> => {
  const url = `v1/master-product/${id}/approve`;

  const payload: { productId?: string } = {};
  if (productId) {
    payload.productId = productId;
  }

  const res = await patchApi<ApproveProductResponse, typeof payload>(
    masterBenefitApi,
    url,
    payload,
  );

  if (!res.success) {
    showErrorMessage(res);
  }

  if (!res.data) {
    throw new Error("No data returned from server");
  }

  return res.data;
};

export const createMasterProductAPI = async (
  params: CreateMasterProductParams,
): Promise<ApiResponse<CreateMasterProductResponse>> => {
  const url = "v1/master-product";
  const formData = new FormData();
  formData.append("uin", params.uin);
  formData.append("insurerId", params.insurerId);
  formData.append("productName", params.productName);
  if (params.file) {
    formData.append("file", params.file);
  }

  const res = await postApi<CreateMasterProductResponse, FormData>(
    masterBenefitApi,
    url,
    formData,
  );
  return res;
};

export const fetchMasterProductDocumentsAPI = async (
  id: string,
): Promise<FetchMasterProductDocumentsResponse> => {
  const url = `v1/files/presigned-url?entityId=${id}&s3BucketName=masterproduct`;

  const res = await getApi<FetchMasterProductDocumentsResponse>(
    documentApi2,
    url,
  );

  if (!res.success) {
    if (res?.status === 404) {
      console.log("error", res?.data?.message);
    } else {
      showErrorMessage(res);
    }
  }

  if (!res.data) {
    throw new Error("No data returned from server");
  }

  return res.data;
};

/**
 * Fetch remarks (chat messages) for Master Product with pagination
 * GET v1/master-product/{id}/remarks?page=0&size=10
 */
export const fetchMasterProductRemarksAPI = async (
  id: string,
  page?: number,
  size?: number,
): Promise<MasterProductRemarksResponse> => {
  const params = new URLSearchParams();
  if (typeof page !== "undefined" && page !== null) {
    const serverPage = Number(page) > 0 ? Number(page) - 1 : 0;
    params.append("page", String(serverPage));
  }
  if (size !== undefined && size !== null && String(size) !== "") {
    params.append("size", String(size));
  }
  const query = params.toString();
  const url = query
    ? `v1/master-product/${id}/remarks?${query}`
    : `v1/master-product/${id}/remarks`;

  const res = await getApi<MasterProductRemarksResponse>(masterBenefitApi, url);

  if (!res.success) {
    showErrorMessage(res);
  }

  return res.data ?? { data: [] };
};

/**
 * Send remark (chat message) for Master Product.
 * Uses same PATCH v1/master-product/{id} as document upload and masterProductJson.
 * Payload: { message, userId, userName, date } with current date.
 */
export const sendMasterProductRemarkAPI = async (params: {
  id: string;
  message: string;
  userId?: string;
  userName?: string;
}): Promise<MasterProductRemarksResponse> => {
  const url = `v1/master-product/${params.id}`;

  const currentDate = new Date().toISOString();
  const remarkPayload = {
    message: params.message,
    userId: params.userId ?? "",
    userName: params.userName ?? "",
    date: currentDate,
    currentDate,
  };

  const formData = new FormData();
  formData.append(
    "message",
    new Blob([JSON.stringify(remarkPayload)], { type: "application/json" }),
  );

  const res = await patchApi<MasterProductRemarksResponse, FormData>(
    masterBenefitApi,
    url,
    formData,
    {
      headers: {
        "X-HTTP-Method-Override": "PATCH",
      },
    },
  );

  if (!res.success) {
    showErrorMessage(res);
  }

  if (!res.data) {
    throw new Error("No data returned from server");
  }

  return res.data;
};
