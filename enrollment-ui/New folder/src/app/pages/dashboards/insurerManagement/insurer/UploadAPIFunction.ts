import {
  deleteApi,
  documentApi,
  documentApi2,
  getApi,
  postApi,
} from "@/app/api/apiService";
import { showErrorMessage } from "@/utils/errorHandler";
import { AxiosRequestConfig } from "axios";

interface UploadPdfParams {
  file: File;
  documentType: string;
  insurerId: string | undefined;
}

export const uploadInsurerPdf = async ({
  file,
  documentType,
  insurerId,
}: UploadPdfParams) => {
  const formData = new FormData();
  formData.append("file", file);

  const config: AxiosRequestConfig = {
    params: {},
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  config.params.s3BucketName = "insurer";
  config.params!.entityType = "INSURER";
  if (documentType) config.params!.s3SubBucketName = documentType;
  if (insurerId) config.params!.entityId = insurerId;

  const response = await postApi<any, FormData>(
    documentApi,
    "v1/scan/files/upload",
    formData,
    config,
  );

  return response.data;
};

export const deleteInsurerFile = async (insurerId: string) => {
  const url = `v1/files/${insurerId}`;
  const response = await deleteApi<any>(documentApi2, url);
  return response?.data;
};

export const getInsurerFiles = async (insurerId: string) => {
  const url = `v1/files/presigned-url?s3BucketName=insurer&entityId=${insurerId}`;
  const response = await getApi<any>(documentApi2, url);
  if (!response.success) {
    if (response?.status === 404) {
      //new
    } else {
      showErrorMessage(response);
    }
  }
  return response?.data;
};
