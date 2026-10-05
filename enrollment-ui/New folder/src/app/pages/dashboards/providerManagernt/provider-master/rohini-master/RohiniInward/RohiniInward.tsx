import { yupResolver } from "@hookform/resolvers/yup";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { uploadInwardWithDocuments } from "../../../../enrollmentsystem/PolicyDetails/services/inwardUploadService";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import {
  extractFileMetadataIdFromScanUpload,
  extractInwardNoFromScanUpload,
  extractMessageFromRegisterResponse,
  registerRohiniMasterUpload,
} from "@/store/features/providerRohini/providerRohiniSlice";
import { useProviderInwardContextIds } from "../../../shared/providerInwardDefaults";
import { ROHINI_DOCUMENT_TYPE, ROHINI_S3_SUB_BUCKET } from "../config";
import {
  createRohiniInwardFormSchema,
  getRohiniInwardContextError,
  getRohiniInwardContextWarning,
  ROHINI_EXCEL_ACCEPT,
} from "./rohiniUploadSchema";

type InwardFormValues = {
  documents: FileList;
};

interface Props {
  onClose: () => void;
  onUploadSuccess?: () => void;
}

const ROHINI_STATIC_INWARD_PAYLOAD = {
  inwardReceivedChannel: "EMAIL",
  s3SubBucketName: ROHINI_S3_SUB_BUCKET,
  documentType: ROHINI_DOCUMENT_TYPE,
  s3BucketName: "provider",
  inwardPriority: "LOW",
} as const;

const RohiniInward: React.FC<Props> = ({ onClose, onUploadSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    departmentId,
    inwardReceivedTpaBranchId,
    ready: inwardContextReady,
    branchMissing,
    departmentMissing,
  } = useProviderInwardContextIds();

  const inwardFormSchema = useMemo(
    () => createRohiniInwardFormSchema(t),
    [t],
  );

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InwardFormValues>({
    resolver: yupResolver(inwardFormSchema as any),
  });
  const [busy, setBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onSubmit = async (data: InwardFormValues) => {
    if (!inwardReceivedTpaBranchId || !departmentId) {
      showProviderError(getRohiniInwardContextError(t, branchMissing, departmentMissing));
      return;
    }

    setBusy(true);
    try {
      const response = await uploadInwardWithDocuments({
        files: Array.from(data?.documents),
        payload: {
          ...ROHINI_STATIC_INWARD_PAYLOAD,
          inwardReceivedTpaBranchId,
          departmentId,
        },
      });

      if (!response.success) {
        showProviderError(
          response.message ??
            (typeof response.error === "string" ? response.error : null) ??
            t("providerMaster.rohiniMaster.uploadForm.uploadFailed"),
        );
        return;
      }

      const body = response.data;
      const envelope = body as { success?: boolean; message?: string } | undefined;
      if (envelope && typeof envelope.success === "boolean" && envelope.success === false) {
        showProviderError(
          envelope.message ?? t("providerMaster.rohiniMaster.uploadForm.uploadFailed"),
        );
        return;
      }

      const resolvedInward = extractInwardNoFromScanUpload(body);
      const fileMetadataId = extractFileMetadataIdFromScanUpload(body);
      if (!resolvedInward || !fileMetadataId) {
        showProviderError(t("providerMaster.rohiniMaster.uploadForm.uploadMissingInwardOrFile"));
        return;
      }

      const registerAction = await dispatch(
        registerRohiniMasterUpload({ inwardNo: resolvedInward, fileMetadataId }),
      );
      if (registerRohiniMasterUpload.rejected.match(registerAction)) {
        const errText =
          typeof registerAction.payload === "string" ? registerAction.payload.trim() : "";
        if (errText) {
          showProviderError(errText);
        }
        return;
      }

      const registered = registerAction.payload;
      const msg =
        extractMessageFromRegisterResponse(registered) ??
        (typeof envelope?.message === "string" ? envelope.message : undefined);
      toast.success(msg ?? t("providerMaster.rohiniMaster.uploadForm.registrationCompleted"), {
        position: "top-right",
        duration: 5000,
      });
      onUploadSuccess?.();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const files = watch("documents");

  const applyFiles = (list: FileList | null) => {
    if (!list?.length) return;
    setValue("documents", Array.from(list) as unknown as FileList, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    applyFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2 px-4 py-0">
      {!inwardContextReady ? (
        <p className="text-sm text-amber-700">
          {t("providerMaster.rohiniMaster.uploadForm.loadingBranchDepartment")}
        </p>
      ) : null}
      {branchMissing || departmentMissing ? (
        <p className="text-sm text-red-600">
          {getRohiniInwardContextWarning(t, branchMissing, departmentMissing)}
        </p>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <span className="font-medium">
            {t("providerMaster.rohiniMaster.uploadForm.uploadDocumentsLabel")}{" "}
            <span className="text-red-500">*</span>
          </span>
          <input
            id="rohini-inward-file-input"
            type="file"
            className="sr-only"
            accept={ROHINI_EXCEL_ACCEPT}
            onChange={handleFileChange}
          />
          <label
            htmlFor="rohini-inward-file-input"
            className={`mt-2 block w-full cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="block text-sm text-gray-500">
              {t("providerMaster.rohiniMaster.uploadForm.clickToUploadExcel")}
            </span>
            <span className="mt-1 block text-xs text-gray-400">
              {t("providerMaster.rohiniMaster.uploadForm.excelHint")}
            </span>
          </label>
          {errors.documents ? (
            <p className="mt-1 text-sm text-red-500">{errors.documents.message as string}</p>
          ) : null}
          {files && files.length > 0 ? (
            <div className="mt-4 space-y-2">
              {Array.from(files).map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-gray-100 p-2"
                >
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="col-span-2 mt-4 flex justify-end">
          <button
            type="submit"
            disabled={busy || !inwardContextReady}
            className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-white disabled:opacity-50"
          >
            {busy
              ? t("providerMaster.rohiniMaster.uploadForm.processing")
              : t("providerMaster.rohiniMaster.upload")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RohiniInward;
