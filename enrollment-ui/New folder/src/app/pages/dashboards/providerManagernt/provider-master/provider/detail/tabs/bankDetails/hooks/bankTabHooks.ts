import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { validateProviderBankIfsc } from "@/store/features/provider/providerAPI";
import { showErrorMessage } from "@/utils/errorHandler";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { isDuplicateFileName } from "@/app/pages/dashboards/providerManagernt/shared/duplicateFileName";
import { bankSchema, type BankFormValues } from "../../../schemas";
import type { BankTabFieldsFromApi } from "../../../utils/providerDetailSectionMerges";
import { EMPTY_BANK_FORM, BANK_DOCUMENT_UPLOAD_HINT } from "../utils/bankDetailsConfig";
import {
  fetchBankDocumentPresign,
  uploadCancelChequeDocument,
  uploadPanCardDocument,
} from "../utils/bankDocumentApi";
import {
  bankFormValuesFromApiFields,
  documentPreviewsFromApiFields,
  ifscVerificationFromApi,
  ifscVerifiedForSave,
  isAllowedBankDocumentFile,
  isPdfUrl,
  revokeBlobPreview,
  type BankDocumentPreview,
  type IfscVerificationStatus,
} from "../utils/bankDetailsHelpers";

export type BankSaveResult =
  | boolean
  | {
      ok: boolean;
      fieldErrors?: Partial<Record<keyof BankFormValues, string>>;
    };

export type BankSaveDocuments = {
  cancelChequeFileMetadataId?: string;
  panCardFileMetadataId?: string;
};

type UseBankDetailsFormArgs = {
  bankFieldsFromApi: BankTabFieldsFromApi | null;
  ifscVerificationStatus: IfscVerificationStatus;
  onSaveBankDetails?: (
    values: BankFormValues,
    ifscVerifiedStatus?: boolean | null,
    documents?: BankSaveDocuments,
  ) => Promise<BankSaveResult> | BankSaveResult;
  getSaveDocuments?: () => BankSaveDocuments;
  onSaveComplete: () => void;
};

export type BankDetailsFormHandle = UseFormReturn<BankFormValues> & {
  resetFromApi: () => void;
  handleSave: (values: BankFormValues) => Promise<void>;
};

export function useBankDetailsForm({
  bankFieldsFromApi,
  ifscVerificationStatus,
  onSaveBankDetails,
  getSaveDocuments,
  onSaveComplete,
}: UseBankDetailsFormArgs): BankDetailsFormHandle {
  const form = useForm<BankFormValues>({
    resolver: yupResolver(bankSchema) as unknown as Resolver<BankFormValues>,
    defaultValues: EMPTY_BANK_FORM,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const resetFromApi = useCallback(() => {
    if (bankFieldsFromApi) {
      form.reset(bankFormValuesFromApiFields(bankFieldsFromApi));
    } else {
      form.reset(EMPTY_BANK_FORM);
    }
  }, [bankFieldsFromApi, form]);

  useEffect(() => {
    resetFromApi();
  }, [resetFromApi]);

  const handleSave = async (values: BankFormValues) => {
    if (onSaveBankDetails) {
      const result = await onSaveBankDetails(
        values,
        ifscVerifiedForSave(ifscVerificationStatus),
        getSaveDocuments?.(),
      );
      if (typeof result === "boolean") {
        if (!result) return;
      } else if (!result.ok) {
        const fieldErrors = result.fieldErrors ?? {};
        (
          Object.entries(fieldErrors) as Array<
            [keyof BankFormValues, string | undefined]
          >
        ).forEach(([name, message]) => {
          if (!message || String(message).trim() === "") return;
          form.setError(name, { type: "server", message: String(message) });
        });
        return;
      }
    }
    onSaveComplete();
  };

  return {
    ...form,
    resetFromApi,
    handleSave,
  };
}

type UseBankDocumentPreviewsArgs = {
  bankFieldsFromApi: BankTabFieldsFromApi | null;
  providerId?: string;
  /** Called after a successful cancel cheque / PAN card upload. */
  onDocumentUploaded?: () => void;
};

async function resolveMissingDocumentUrl(
  preview: BankDocumentPreview | null,
  setPreview: (next: BankDocumentPreview | null) => void,
  fallbackFileName: string,
  isCancelled?: () => boolean,
) {
  const fileMetadataId = preview?.fileMetadataId?.trim() ?? "";
  if (!fileMetadataId || preview?.url) return;

  const result = await fetchBankDocumentPresign(fileMetadataId, fallbackFileName);
  if (isCancelled?.() || !result.ok) return;

  setPreview({
    url: result.presignedUrl,
    isPdf: isPdfUrl(result.presignedUrl) || isPdfUrl(result.fileName ?? ""),
    fileMetadataId,
    fileName: result.fileName,
  });
}

/** Keep an already-loaded URL when cancel resets to the same file metadata id. */
function mergePreviewKeepingUrl(
  fromApi: BankDocumentPreview | null,
  current: BankDocumentPreview | null,
): BankDocumentPreview | null {
  if (!fromApi) return null;
  if (fromApi.url) return fromApi;

  const apiId = fromApi.fileMetadataId?.trim() ?? "";
  const currentId = current?.fileMetadataId?.trim() ?? "";
  if (apiId && apiId === currentId && current?.url) {
    return {
      ...fromApi,
      url: current.url,
      isPdf: current.isPdf,
      fileName: current.fileName ?? fromApi.fileName,
    };
  }

  return fromApi;
}

export function useBankDocumentPreviews({
  bankFieldsFromApi,
  providerId,
  onDocumentUploaded,
}: UseBankDocumentPreviewsArgs) {
  const { t } = useTranslation();
  const [cancelledChequePreview, setCancelledChequePreview] =
    useState<BankDocumentPreview | null>(null);
  const [panCardPreview, setPanCardPreview] = useState<BankDocumentPreview | null>(
    null,
  );
  const [isUploadingCancelledCheque, setIsUploadingCancelledCheque] = useState(false);
  const [isUploadingPanCard, setIsUploadingPanCard] = useState(false);
  // Inward created by the first bank document upload in this edit session; the
  // second document is attached to it so both share a single inward.
  const [bankInwardNo, setBankInwardNo] = useState("");

  useEffect(() => {
    const previews = documentPreviewsFromApiFields(bankFieldsFromApi);
    setCancelledChequePreview(previews.cancelledCheque);
    setPanCardPreview(previews.panCard);
    setBankInwardNo("");

    let cancelled = false;
    const isCancelled = () => cancelled;

    resolveMissingDocumentUrl(
      previews.cancelledCheque,
      setCancelledChequePreview,
      "Cancel Cheque",
      isCancelled,
    ).catch(() => {});
    resolveMissingDocumentUrl(
      previews.panCard,
      setPanCardPreview,
      "PAN Card",
      isCancelled,
    ).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [bankFieldsFromApi]);

  useEffect(
    () => () => {
      revokeBlobPreview(cancelledChequePreview);
      revokeBlobPreview(panCardPreview);
    },
    [cancelledChequePreview, panCardPreview],
  );

  const resetPreviewsFromApi = useCallback(() => {
    const previews = documentPreviewsFromApiFields(bankFieldsFromApi);
    const nextCheque = mergePreviewKeepingUrl(
      previews.cancelledCheque,
      cancelledChequePreview,
    );
    const nextPan = mergePreviewKeepingUrl(previews.panCard, panCardPreview);

    if (cancelledChequePreview?.url !== nextCheque?.url) {
      revokeBlobPreview(cancelledChequePreview);
    }
    if (panCardPreview?.url !== nextPan?.url) {
      revokeBlobPreview(panCardPreview);
    }

    setCancelledChequePreview(nextCheque);
    setPanCardPreview(nextPan);
    setBankInwardNo("");

    resolveMissingDocumentUrl(
      nextCheque,
      setCancelledChequePreview,
      "Cancel Cheque",
    ).catch(() => {});
    resolveMissingDocumentUrl(nextPan, setPanCardPreview, "PAN Card").catch(() => {});
  }, [bankFieldsFromApi, cancelledChequePreview, panCardPreview]);

  const uploadBankDocument = useCallback(
    async (
      file: File | undefined,
      current: BankDocumentPreview | null,
      setPreview: (preview: BankDocumentPreview | null) => void,
      setUploading: (uploading: boolean) => void,
      uploadFn: (
        file: File,
        providerId: string,
        inwardNo?: string,
      ) => ReturnType<typeof uploadCancelChequeDocument>,
    ) => {
      if (!file) return;
      if (!isAllowedBankDocumentFile(file)) {
        showErrorMessage({
          error: `Only ${BANK_DOCUMENT_UPLOAD_HINT} files are allowed.`,
        });
        return;
      }

      const resolvedProviderId = providerId?.trim() ?? "";
      if (!resolvedProviderId) {
        showErrorMessage({ error: "Provider id is required to upload a document." });
        return;
      }

      setUploading(true);
      try {
        const result = await uploadFn(
          file,
          resolvedProviderId,
          bankInwardNo || undefined,
        );
        if (!result.ok) {
          showErrorMessage({
            error: result.message ?? "Failed to upload document.",
          });
          return;
        }

        if (result.inwardNo?.trim()) {
          setBankInwardNo(result.inwardNo.trim());
        }

        revokeBlobPreview(current);
        const isPdf =
          file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const url = result.previewUrl ?? URL.createObjectURL(file);
        setPreview({
          url,
          isPdf,
          fileMetadataId: result.fileMetadataId,
          fileName: file.name,
        });
        onDocumentUploaded?.();
      } finally {
        setUploading(false);
      }
    },
    [bankInwardNo, providerId, onDocumentUploaded],
  );

  const uploadCancelledCheque = (file: File | undefined) => {
    if (file && isDuplicateFileName(file.name, panCardPreview?.fileName)) {
      showProviderError(t("providerMaster.common.duplicateFileName"));
      return;
    }
    uploadBankDocument(
      file,
      cancelledChequePreview,
      setCancelledChequePreview,
      setIsUploadingCancelledCheque,
      uploadCancelChequeDocument,
    );
  };

  const uploadPanCard = (file: File | undefined) => {
    if (file && isDuplicateFileName(file.name, cancelledChequePreview?.fileName)) {
      showProviderError(t("providerMaster.common.duplicateFileName"));
      return;
    }
    uploadBankDocument(
      file,
      panCardPreview,
      setPanCardPreview,
      setIsUploadingPanCard,
      uploadPanCardDocument,
    );
  };

  return {
    cancelledChequePreview,
    panCardPreview,
    isUploadingCancelledCheque,
    isUploadingPanCard,
    resetPreviewsFromApi,
    uploadCancelledCheque,
    uploadPanCard,
  };
}

type UseIfscVerificationArgs = {
  bankFieldsFromApi: BankTabFieldsFromApi | null;
  isBankViewMode: boolean;
  getIfscCode: () => string;
};

export function useIfscVerification({
  bankFieldsFromApi,
  isBankViewMode,
  getIfscCode,
}: UseIfscVerificationArgs) {
  const [isIfscVerifying, setIsIfscVerifying] = useState(false);
  const [ifscVerificationStatus, setIfscVerificationStatus] =
    useState<IfscVerificationStatus>(null);

  useEffect(() => {
    setIfscVerificationStatus(
      ifscVerificationFromApi(bankFieldsFromApi?.providerBankIfscIsVerified),
    );
  }, [bankFieldsFromApi]);

  const verifyIfsc = async () => {
    if (isBankViewMode || ifscVerificationStatus !== null) return;

    const ifsc = getIfscCode().trim().toUpperCase();
    if (!ifsc) {
      setIfscVerificationStatus("not_verified");
      return;
    }

    setIsIfscVerifying(true);
    const res = await validateProviderBankIfsc(ifsc);
    if (!res.success || !res.data) {
      setIfscVerificationStatus("not_verified");
      setIsIfscVerifying(false);
      return;
    }

    const returnedIfsc = String(res.data.IFSC ?? "").trim().toUpperCase();
    if (returnedIfsc && returnedIfsc !== ifsc) {
      setIfscVerificationStatus("not_verified");
      setIsIfscVerifying(false);
      return;
    }

    setIfscVerificationStatus("verified");
    setIsIfscVerifying(false);
  };

  const resetIfscVerification = () => {
    setIfscVerificationStatus(
      ifscVerificationFromApi(bankFieldsFromApi?.providerBankIfscIsVerified),
    );
  };

  const clearIfscVerification = () => {
    setIfscVerificationStatus(null);
  };

  return {
    isIfscVerifying,
    ifscVerificationStatus,
    verifyIfscDisabled: isIfscVerifying || ifscVerificationStatus !== null,
    verifyIfsc,
    resetIfscVerification,
    clearIfscVerification,
  };
}
