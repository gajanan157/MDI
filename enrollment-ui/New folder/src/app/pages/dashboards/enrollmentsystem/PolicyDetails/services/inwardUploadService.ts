import { documentApi, postApi } from "@/app/api/apiService";

interface UploadResponse {
    success: boolean;
    message: string;
    data?: any;
}
export const uploadInwardWithDocuments = async ({ files, payload }: { files: File[]; payload: Record<string, any> }) => {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("file", file);
    });
    Object.keys(payload).forEach((key) => {
        if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") {
            formData.append(key, payload[key]);
        }
    });

    return await postApi<any, any>(
        documentApi,
        "v1/scan/files/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
};
export const uploadInwardWithDocumentsForLargeFile = async ({ payload }: { payload: Record<string, any> }) => {
    return await postApi<UploadResponse, any>(documentApi, "v1/scan/files/presigned-upload-init", payload);
};
export const completeLargeFileUpload = async (
    fileMetadataId: string,
    payload: any
) => {
    return await postApi<any, any>(documentApi, `v1/scan/files/${fileMetadataId}/complete`, payload);

};