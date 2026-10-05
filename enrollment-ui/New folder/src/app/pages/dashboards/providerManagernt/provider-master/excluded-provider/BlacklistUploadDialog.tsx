import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ConfigFormDialog,
  ModernFileField,
  type FieldConfig,
} from "@/components/shared/dialog/commonDialog";
import { Textarea } from "@/components/ui";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import {
  EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION,
  EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST,
  EXCLUDED_PROVIDER_LIST_ACCEPT,
  isExcludedProviderWatchlist,
} from "./config";
import { SUPPORTING_DOCUMENT_ACCEPT } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/icCorporateMapping/config";
import type { BlacklistUploadFormValues } from "./blacklistUploadHelpers";
import { ExclusionFlagCheckboxGroup } from "./ExclusionFlagCheckboxGroup";

export type { BlacklistUploadFormValues } from "./blacklistUploadHelpers";

export type BlacklistUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  uploading: boolean;
  error: string | null;
  onClearError: () => void;
  form: UseFormReturn<BlacklistUploadFormValues>;
  effectiveFrom: string;
  onEffectiveFromChange: (value: string) => void;
  remark: string;
  onRemarkChange: (value: string) => void;
  primaryFileName: string | null;
  primaryFileError: string;
  supportingFileName: string | null;
  supportingFileError: string;
  onPrimaryFileChange: (file: File | null) => void;
  onSupportingFileChange: (file: File | null) => void;
  canSubmit: boolean;
  onSubmit: () => void;
  /** Shown when this upload follows create-inward (excluded hospitals flow). */
  inwardNo?: string | null;
};

export function BlacklistUploadDialog({
  open,
  onClose,
  uploading,
  error,
  onClearError,
  form,
  effectiveFrom,
  onEffectiveFromChange,
  remark,
  onRemarkChange,
  primaryFileName,
  primaryFileError,
  supportingFileName,
  supportingFileError,
  onPrimaryFileChange,
  onSupportingFileChange,
  canSubmit,
  onSubmit,
  inwardNo,
}: Readonly<BlacklistUploadDialogProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { setValue } = form;
  const { insurerMainList } = useAppSelector((state) => state.insurer);

  const uploadIcOptions = useMemo(
    () =>
      (insurerMainList ?? []).map((insurer) => ({
        value: insurer.id,
        label: insurer.name,
      })),
    [insurerMainList],
  );
  useEffect(() => {
    if (!open) return;
    if ((insurerMainList?.length ?? 0) > 0) return;
    dispatch(fetchInsurers({ size: "100" }));
  }, [open, insurerMainList?.length, dispatch]);

  const blacklistedByRaw = form.watch("blacklistedBy");
  const listingTypeRaw = form.watch("listingType");
  const blacklistedBy = String(blacklistedByRaw ?? "").trim();
  const listingType = String(listingTypeRaw ?? "").trim();
  const investigationRequired = Boolean(form.watch("investigationRequired"));
  const emergencyExceptionAllowed = Boolean(form.watch("emergencyExceptionAllowed"));

  const insurerCompanyEnabled =
    blacklistedBy === "INSURER" || blacklistedBy === "GLOBAL";
  const lockForEnabled = isExcludedProviderWatchlist(listingType);

  const blacklistedByOptions = useMemo(
    () => [
      {
        label: t("providerMaster.excludedProvider.uploadDialog.selectBlacklistedBy"),
        value: "",
      },
      { label: t("providerMaster.excludedProvider.restrictedBy.tpa"), value: "TPA" },
      {
        label: t("providerMaster.excludedProvider.restrictedBy.insurer"),
        value: "INSURER",
      },
    ],
    [t],
  );

  const listingTypeOptions = useMemo(
    () => [
      {
        label: t("providerMaster.excludedProvider.uploadDialog.selectRestrictionType"),
        value: "",
      },
      {
        label: t("providerMaster.excludedProvider.uploadDialog.excluded"),
        value: EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION,
      },
      {
        label: t("providerMaster.excludedProvider.uploadDialog.watchlisted"),
        value: EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST,
      },
    ],
    [t],
  );

  const uploadStatusOptions = useMemo(
    () => [
      {
        label: t("providerMaster.excludedProvider.uploadDialog.cashlessOnHold"),
        value: "cashless",
      },
      {
        label: t("providerMaster.excludedProvider.uploadDialog.reimbursement"),
        value: "reimbursement",
      },
    ],
    [t],
  );

  useEffect(() => {
    if (!insurerCompanyEnabled) {
      setValue("uploadIcId", "");
    }
  }, [insurerCompanyEnabled, setValue]);

  useEffect(() => {
    if (lockForEnabled) return;
    setValue("status", []);
    setValue("investigationRequired", false);
    setValue("emergencyExceptionAllowed", false);
    setValue("investigationApplicableFor", []);
  }, [lockForEnabled, setValue]);

  useEffect(() => {
    if (investigationRequired) return;
    setValue("investigationApplicableFor", []);
  }, [investigationRequired, setValue]);

  const fields: FieldConfig[] = useMemo(
    () => [
      {
        name: "listingType",
        type: "dropdown",
        label: t("providerMaster.excludedProvider.uploadDialog.restrictionType"),
        defaultValue: t("providerMaster.excludedProvider.uploadDialog.selectRestrictionType"),
        required: true,
        options: listingTypeOptions,
        colSpan: 1,
      },
      {
        name: "blacklistedBy",
        type: "dropdown",
        label: t("providerMaster.excludedProvider.uploadDialog.restrictedBy"),
        defaultValue: t("providerMaster.excludedProvider.uploadDialog.selectBlacklistedBy"),
        required: true,
        options: blacklistedByOptions,
        colSpan: 1,
      },
      {
        name: "_effectiveFrom",
        type: "date",
        label: t("providerMaster.excludedProvider.uploadDialog.effectiveFrom"),
        required: true,
        colSpan: 1,
        externalControl: {
          value: effectiveFrom,
          onChange: (v) => {
            onEffectiveFromChange(v);
            onClearError();
          },
        },
      },
      {
        name: "uploadIcId",
        type: "dropdown",
        label: t("providerMaster.excludedProvider.uploadDialog.insurerCompany"),
        defaultValue: t("providerMaster.excludedProvider.uploadDialog.selectIc"),
        dependsOn: "blacklistedBy",
        showWhen: (v) => v === "INSURER" || v === "GLOBAL",
        requiredWhen: (vals) =>
          vals.blacklistedBy === "INSURER" ||
          vals.blacklistedBy === "GLOBAL",
        options: [
          { label: t("providerMaster.excludedProvider.uploadDialog.selectIc"), value: "" },
          ...uploadIcOptions,
        ],
        whenHidden: "hide",
        colSpan: 1,
      },
      {
        name: "status",
        type: "dropdown",
        label: t("providerMaster.excludedProvider.uploadDialog.restrictionApplicableFor"),
        defaultValue: t(
          "providerMaster.excludedProvider.uploadDialog.selectRestrictionApplicableFor",
        ),
        dependsOn: "listingType",
        showWhen: (value) => isExcludedProviderWatchlist(String(value ?? "")),
        whenHidden: "hide",
        multiselect: true,
        isSelectCheckbox: true,
        required: false,
        requiredWhen: (vals) =>
          isExcludedProviderWatchlist(String(vals.listingType ?? "")),
        options: uploadStatusOptions,
        colSpan: 1,
      },
      {
        name: "investigationRequired",
        type: "checkbox",
        label: t("providerMaster.excludedProvider.uploadDialog.investigationRequired"),
        dependsOn: "listingType",
        showWhen: (value) => isExcludedProviderWatchlist(String(value ?? "")),
        whenHidden: "hide",
        colSpan: 1,
        render: ({ form: dialogForm, disabled }) => (
          <ExclusionFlagCheckboxGroup
            investigationRequired={Boolean(dialogForm.watch("investigationRequired"))}
            emergencyExceptionAllowed={Boolean(
              dialogForm.watch("emergencyExceptionAllowed"),
            )}
            onInvestigationRequiredChange={(checked) => {
              dialogForm.setValue("investigationRequired", checked, { shouldDirty: true });
              if (!checked) {
                dialogForm.setValue("investigationApplicableFor", [], {
                  shouldDirty: true,
                });
              }
            }}
            onEmergencyExceptionChange={(checked) =>
              dialogForm.setValue("emergencyExceptionAllowed", checked, {
                shouldDirty: true,
              })
            }
            disabled={disabled}
          />
        ),
      },
      {
        name: "investigationApplicableFor",
        type: "dropdown",
        label: t("providerMaster.excludedProvider.uploadDialog.investigationApplicableFor"),
        defaultValue: t(
          "providerMaster.excludedProvider.uploadDialog.selectInvestigationApplicableFor",
        ),
        dependsOn: "investigationRequired",
        showWhen: (value, all) =>
          Boolean(value) &&
          isExcludedProviderWatchlist(String(all.listingType ?? "")),
        whenHidden: "hide",
        multiselect: true,
        isSelectCheckbox: true,
        required: false,
        requiredWhen: (vals) =>
          Boolean(vals.investigationRequired) &&
          isExcludedProviderWatchlist(String(vals.listingType ?? "")),
        options: [
          {
            label: t("providerMaster.excludedProvider.uploadDialog.cashless"),
            value: "cashless",
          },
          {
            label: t("providerMaster.excludedProvider.uploadDialog.reimbursement"),
            value: "reimbursement",
          },
        ],
        colSpan: 1,
      },
    ],
    [
      t,
      effectiveFrom,
      onEffectiveFromChange,
      onClearError,
      listingTypeOptions,
      blacklistedByOptions,
      uploadStatusOptions,
      uploadIcOptions,
      investigationRequired,
      emergencyExceptionAllowed,
    ],
  );

  const inwardNoTrimmed = String(inwardNo ?? "").trim();

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      title={t("providerMaster.excludedProvider.uploadListTitle")}
      titleId="blacklist-upload-dialog-title"
      fields={fields}
      form={form as unknown as UseFormReturn<Record<string, unknown>>}
      onSubmit={onSubmit}
      loading={uploading}
      canSubmit={canSubmit}
      error={error}
      maxColumns={2}
      submitLabel={t("providerMaster.excludedProvider.uploadDialog.submit")}
      loadingSubmitLabel={t("providerMaster.excludedProvider.uploadDialog.submitting")}
      submitButtonColor="primary"
      submitButtonClassName="px-6 py-2 rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
      onClearError={onClearError}
      widthClassName="w-full max-w-6xl sm:w-[75%]"
      topContent={
        inwardNoTrimmed ? (
          <div className="mb-2 rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-sm text-gray-800">
            <span className="font-medium text-gray-700">
              {t("providerMaster.excludedProvider.uploadDialog.inwardNoLabel")}
            </span>{" "}
            <span className="font-semibold text-blue-700">{inwardNoTrimmed}</span>
          </div>
        ) : null
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ModernFileField
            label={t("providerMaster.excludedProvider.uploadDialog.document")}
            isRequired
            accept={EXCLUDED_PROVIDER_LIST_ACCEPT}
            disabled={uploading}
            fileName={primaryFileName}
            error={primaryFileError}
            className="!h-9 !min-h-[36px]"
            onChange={(event) => {
              onPrimaryFileChange(event.target.files?.[0] ?? null);
              onClearError();
            }}
            onClear={() => {
              onPrimaryFileChange(null);
              onClearError();
            }}
          />
          <ModernFileField
            label={t("providerMaster.excludedProvider.uploadDialog.supportingDocument")}
            isRequired
            accept={SUPPORTING_DOCUMENT_ACCEPT}
            disabled={uploading}
            fileName={supportingFileName}
            error={supportingFileError}
            className="!h-9 !min-h-[36px]"
            onChange={(event) => {
              onSupportingFileChange(event.target.files?.[0] ?? null);
              onClearError();
            }}
            onClear={() => {
              onSupportingFileChange(null);
              onClearError();
            }}
          />
        </div>
        <Textarea
          label={t("providerMaster.excludedProvider.uploadDialog.remark")}
          placeholder={t("providerMaster.excludedProvider.uploadDialog.remarkPlaceholder")}
          rows={4}
          disabled={uploading}
          value={remark}
          onChange={(e) => onRemarkChange(e.target.value)}
          isRequired
          classNames={{
            wrapper: "!mt-2",
          }}
          className={`w-full min-h-[3rem] bg-white !px-3 !py-2 text-sm ${canSubmit ? "!resize-y" : "resize-none"}`}
        />
      </div>
    </ConfigFormDialog>
  );
}
