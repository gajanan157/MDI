import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ModernFileField } from "@/components/shared/dialog/commonDialog";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Button } from "@/components/ui";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import { PROVIDER_FORM_BUTTON_CLASS } from "../../shared/providerButtonStyles";
import { useProviderInwardContextIds } from "../../shared/providerInwardDefaults";
import { getInwardContextErrorMessage } from "../ic-corporate-mapping/components/addNetworkDialogSubmitHelpers";
import {
  DATA_FILE_ACCEPT,
  EMAIL_FILE_ACCEPT,
  isBankVerificationDataFile,
  isBankVerificationEmailFile,
} from "./config";
import { submitBulkBankDetailsUpload } from "./upload";

type UploadFormValues = {
  configuredIc: string;
};

type UploadSectionProps = {
  disabled?: boolean;
  onCancel?: () => void;
  onUploaded: () => void;
};

export function UploadSection({
  disabled = false,
  onCancel,
  onUploaded,
}: Readonly<UploadSectionProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const insurerList = useAppSelector((state) => state.insurerList.insurerList);
  const {
    departmentId,
    inwardReceivedTpaBranchId,
    ready: inwardContextReady,
    branchMissing,
    departmentMissing,
  } = useProviderInwardContextIds();
  const dataFileRef = useRef<HTMLInputElement | null>(null);
  const emailFileRef = useRef<HTMLInputElement | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [emailFile, setEmailFile] = useState<File | null>(null);
  const [dataFileError, setDataFileError] = useState("");
  const [emailFileError, setEmailFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const configuredIcOptions = useMemo(
    () =>
      (insurerList ?? []).map((insurer) => ({
        value: insurer.insurerId,
        label: insurer.insurerName,
      })),
    [insurerList],
  );

  useEffect(() => {
    if ((insurerList?.length ?? 0) > 0) return;
    dispatch(fetchInsurerList());
  }, [dispatch, insurerList]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadFormValues>({
    defaultValues: { configuredIc: "" },
  });

  const clearDataFileInput = useCallback(() => {
    if (dataFileRef.current) dataFileRef.current.value = "";
  }, []);

  const clearEmailFileInput = useCallback(() => {
    if (emailFileRef.current) emailFileRef.current.value = "";
  }, []);

  const applyDataFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) {
        setDataFile(null);
        setDataFileError("");
        clearDataFileInput();
        return;
      }
      if (!isBankVerificationDataFile(file)) {
        setDataFile(null);
        setDataFileError(t("providerMaster.bankVerification.validation.dataFileInvalidFormat"));
        clearDataFileInput();
        return;
      }
      setDataFileError("");
      setDataFile(file);
    },
    [clearDataFileInput, t],
  );

  const applyEmailFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) {
        setEmailFile(null);
        setEmailFileError("");
        clearEmailFileInput();
        return;
      }
      if (!isBankVerificationEmailFile(file)) {
        setEmailFile(null);
        setEmailFileError(t("providerMaster.bankVerification.validation.emailFileInvalidFormat"));
        clearEmailFileInput();
        return;
      }
      setEmailFileError("");
      setEmailFile(file);
    },
    [clearEmailFileInput, t],
  );

  const resetFiles = useCallback(() => {
    clearDataFileInput();
    clearEmailFileInput();
    setDataFile(null);
    setEmailFile(null);
    setDataFileError("");
    setEmailFileError("");
  }, [clearDataFileInput, clearEmailFileInput]);

  const resolveUploadFiles = useCallback((): { dataFile: File; emailFile: File } | null => {
    if (!dataFile) {
      setDataFileError(t("providerMaster.bankVerification.validation.dataFileRequired"));
      return null;
    }
    if (!isBankVerificationDataFile(dataFile)) {
      setDataFileError(t("providerMaster.bankVerification.validation.dataFileInvalidFormat"));
      applyDataFile(null);
      return null;
    }
    setDataFileError("");

    if (!emailFile) {
      setEmailFileError(t("providerMaster.bankVerification.validation.emailFileRequired"));
      return null;
    }
    if (!isBankVerificationEmailFile(emailFile)) {
      setEmailFileError(t("providerMaster.bankVerification.validation.emailFileInvalidFormat"));
      applyEmailFile(null);
      return null;
    }
    setEmailFileError("");

    return { dataFile, emailFile };
  }, [applyDataFile, applyEmailFile, dataFile, emailFile, t]);

  const onSubmit = async (values: UploadFormValues) => {
    const files = resolveUploadFiles();
    if (!files) return;

    const insurerId = values.configuredIc.trim();
    if (!insurerId) return;

    if (!inwardReceivedTpaBranchId || !departmentId) {
      showErrorMessage({
        error: getInwardContextErrorMessage(t, branchMissing, departmentMissing),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitResult = await submitBulkBankDetailsUpload(
        files.dataFile,
        {
          insurerId,
          inwardReceivedTpaBranchId,
          departmentId,
        },
        files.emailFile,
      );

      if (!submitResult.ok) {
        showErrorMessage({
          error:
            submitResult.message ?? t("providerMaster.bankVerification.errors.uploadFailed"),
        });
        return;
      }

      showSuccessMessage(
        submitResult.message ??
          t("providerMaster.bankVerification.uploadSuccess", {
            inwardNo: submitResult.inwardNo,
          }),
      );

      reset({ configuredIc: "" });
      resetFiles();
      onUploaded();
    } catch (error) {
      showErrorMessage({
        error:
          error instanceof Error && error.message.trim()
            ? error.message
            : t("providerMaster.bankVerification.errors.uploadFailed"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formDisabled = disabled || isSubmitting;

  return (
    <div className="w-full rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-gray-100 dark:border-dark-500 dark:bg-dark-700">
      <div className="space-y-2 px-3 py-2 sm:px-4 sm:py-2.5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 items-end gap-x-2 gap-y-3 border-t border-gray-100 pt-2 md:grid-cols-12"
        >
        <div className="min-w-0 md:col-span-3">
          <DropdownSelect
            name="configuredIc"
            control={control}
            label={t("providerMaster.bankVerification.selectConfiguredIc")}
            options={configuredIcOptions}
            isRequired
            disabled={formDisabled}
            errors={errors.configuredIc}
            rules={{
              required: t("providerMaster.bankVerification.validation.configuredIcRequired"),
            }}
            formClassName="[&_.react-select__control]:min-h-[36px] [&_.react-select__control]:text-sm"
          />
        </div>

        <div className="min-w-0 md:col-span-3">
          <ModernFileField
            label={t("providerMaster.bankVerification.dataFile")}
            isRequired
            accept={DATA_FILE_ACCEPT}
            disabled={formDisabled}
            inputRef={dataFileRef}
            fileName={dataFile?.name ?? null}
            error={dataFileError}
            className="!h-9 !min-h-[36px]"
            onChange={(event) => {
              applyDataFile(event.target.files?.[0]);
            }}
            onClear={() => {
              applyDataFile(null);
            }}
          />
        </div>

        <div className="min-w-0 md:col-span-3">
          <ModernFileField
            label={t("providerMaster.bankVerification.emailFile")}
            isRequired
            accept={EMAIL_FILE_ACCEPT}
            disabled={formDisabled}
            inputRef={emailFileRef}
            fileName={emailFile?.name ?? null}
            error={emailFileError}
            className="!h-9 !min-h-[36px]"
            onChange={(event) => {
              applyEmailFile(event.target.files?.[0]);
            }}
            onClear={() => {
              applyEmailFile(null);
            }}
          />
        </div>

        <div className="flex justify-end gap-1.5 md:col-span-3">
          {onCancel ? (
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={formDisabled}
              className={PROVIDER_FORM_BUTTON_CLASS}
            >
              {t("providerMaster.button.cancel")}
            </Button>
          ) : null}
          <Button
            type="submit"
            color="primary"
            disabled={formDisabled || !inwardContextReady}
            className={`${PROVIDER_FORM_BUTTON_CLASS} flex items-center`}
          >
            <ArrowUpTrayIcon className="size-4" />
            {isSubmitting
              ? t("providerMaster.bankVerification.uploading")
              : t("providerMaster.bankVerification.upload")}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
}
