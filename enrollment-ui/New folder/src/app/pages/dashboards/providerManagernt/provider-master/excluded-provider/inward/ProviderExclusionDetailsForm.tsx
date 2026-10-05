import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useRole } from "@/app/auth/usePermission";
import DocumentDropdown from "@/app/pages/dashboards/enrollmentsystem/dashboard/corporate/DocumentDropdown";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Button, Textarea } from "@/components/ui";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ProviderDatePicker } from "../../../shared/ProviderDatePicker";
import { showProviderError } from "../../../shared/ProviderAlertDialog";
import {
  EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION,
  EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST,
  isExcludedProviderWatchlist,
} from "../config";
import { canSubmitExclusionInwardForm } from "../blacklistUploadHelpers";
import { ExclusionFlagCheckboxGroup } from "../ExclusionFlagCheckboxGroup";
import {
  buildProviderExclusionInwardPath,
  resolveListingTypeFromDocumentType,
} from "./paths";
import {
  saveProviderExclusionDetails,
  submitProviderExclusionDetails,
  type ProviderExclusionDetailsFormValues,
} from "./useProviderExclusionDetails";

const FIELD_CLASS = "h-[34px] rounded-sm";
const FORM_FIELD_GRID_CLASS =
  "grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 [&_.dropdown-label]:!text-[11px] [&_.dropdown-label]:font-normal [&_.input-root]:min-h-0";

function resolveInsurerIdFromSource(
  sourceEntityId: string,
  sourceEntity: string,
  sourceEntityType: string,
  insurerOptions: Array<{ value?: string; label: string }>,
): string {
  const entityId = String(sourceEntityId ?? "").trim();
  const entityType = String(sourceEntityType ?? "").trim().toUpperCase();
  if (entityId && (!entityType || entityType === "INSURER")) {
    const known = insurerOptions.some((option) => String(option.value) === entityId);
    if (known || !entityType || entityType === "INSURER") {
      return entityId;
    }
  }

  const name = String(sourceEntity ?? "").trim().toLowerCase();
  if (!name || name === "—") return "";

  const exact = insurerOptions.find(
    (option) => String(option.label ?? "").trim().toLowerCase() === name,
  );
  if (exact?.value) return String(exact.value).trim();

  const partial = insurerOptions.find((option) => {
    const label = String(option.label ?? "").trim().toLowerCase();
    return label.includes(name) || name.includes(label);
  });
  return partial?.value ? String(partial.value).trim() : "";
}

function resolveLockedInsurerLabel(
  sourceEntity: string,
  lockedInsurerId: string,
): string {
  const trimmed = String(sourceEntity ?? "").trim();
  if (trimmed && trimmed !== "—") return trimmed;
  return lockedInsurerId;
}

function buildUploadIcOptions(
  baseUploadIcOptions: Array<{ value?: string; label: string }>,
  lockedInsurerId: string,
  lockedInsurerLabel: string,
): Array<{ value?: string; label: string }> {
  if (
    !lockedInsurerId ||
    baseUploadIcOptions.some((option) => String(option.value) === lockedInsurerId)
  ) {
    return baseUploadIcOptions;
  }
  return [
    { value: lockedInsurerId, label: lockedInsurerLabel || lockedInsurerId },
    ...baseUploadIcOptions,
  ];
}

function resolveStageMessage(
  isQC: boolean,
  isProcessor: boolean,
  t: (key: string) => string,
): string {
  if (isQC) return t("stepNavigation.messages.qcReviewPending");
  if (isProcessor) return t("stepNavigation.messages.processingInProgress");
  return "";
}

function resolveSubmitActionType(
  isQC: boolean,
  isProcessor: boolean,
): "PROCESSOR_PENDING" | "QC_PENDING" | "COMPLETED" | "REASSIGNED" {
  if (isQC) return "COMPLETED";
  if (isProcessor) return "QC_PENDING";
  return "QC_PENDING";
}

type Props = {
  inwardNo: string;
  documentType: string;
  sourceEntity: string;
  sourceEntityId?: string;
  sourceEntityType?: string;
  s3BucketName?: string;
  s3SubBucketName?: string;
  status: string;
};

export function ProviderExclusionDetailsForm({
  inwardNo,
  documentType,
  sourceEntity,
  sourceEntityId = "",
  sourceEntityType = "",
  s3BucketName = "",
  s3SubBucketName = "",
  status,
}: Readonly<Props>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isProcessor, isQC } = useRole();
  const { insurerMainList } = useAppSelector((state) => state.insurer);
  const [submitting, setSubmitting] = useState(false);

  const defaultListingType = resolveListingTypeFromDocumentType(documentType);
  const isInsurerSource =
    String(sourceEntityType ?? "").trim().toUpperCase() === "INSURER";

  const {
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderExclusionDetailsFormValues>({
    defaultValues: {
      listingType: defaultListingType,
      blacklistedBy: isInsurerSource ? "INSURER" : "",
      uploadIcId: "",
      status: [],
      investigationRequired: false,
      emergencyExceptionAllowed: false,
      investigationApplicableFor: [],
      effectiveFrom: "",
      remark: "",
    },
  });

  useEffect(() => {
    if ((insurerMainList?.length ?? 0) > 0) return;
    dispatch(fetchInsurers({ size: "100" }));
  }, [dispatch, insurerMainList?.length]);

  useEffect(() => {
    setValue("listingType", defaultListingType);
  }, [defaultListingType, setValue]);

  const baseUploadIcOptions = useMemo(
    () =>
      (insurerMainList ?? []).map((insurer) => ({
        value: insurer.id,
        label: insurer.name,
      })),
    [insurerMainList],
  );

  const lockedInsurerId = useMemo(
    () =>
      resolveInsurerIdFromSource(
        sourceEntityId,
        sourceEntity,
        sourceEntityType,
        baseUploadIcOptions,
      ),
    [sourceEntityId, sourceEntity, sourceEntityType, baseUploadIcOptions],
  );

  const lockedInsurerLabel = resolveLockedInsurerLabel(sourceEntity, lockedInsurerId);

  const uploadIcOptions = useMemo(
    () =>
      buildUploadIcOptions(
        baseUploadIcOptions,
        lockedInsurerId,
        lockedInsurerLabel,
      ),
    [baseUploadIcOptions, lockedInsurerId, lockedInsurerLabel],
  );

  const blacklistedBy = String(watch("blacklistedBy") ?? "").trim().toUpperCase();
  const listingType = String(watch("listingType") ?? "").trim();
  const insurerCompanyEnabled =
    blacklistedBy === "INSURER" || blacklistedBy === "GLOBAL";
  // Restricted by = INSURER → Insurer Company is locked (prefilled from source when available).
  const lockInsurerCompany = blacklistedBy === "INSURER";
  const lockForEnabled = isExcludedProviderWatchlist(listingType);
  const investigationRequired = Boolean(watch("investigationRequired"));
  const emergencyExceptionAllowed = Boolean(watch("emergencyExceptionAllowed"));
  const investigationApplicableFor = watch("investigationApplicableFor");

  useEffect(() => {
    if (!insurerCompanyEnabled) {
      setValue("uploadIcId", "");
      return;
    }
    if (blacklistedBy === "INSURER" && lockedInsurerId) {
      setValue("uploadIcId", lockedInsurerId, { shouldValidate: true });
    }
  }, [insurerCompanyEnabled, blacklistedBy, lockedInsurerId, setValue]);

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

  const listingTypeOptions = useMemo(
    () => [
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

  const blacklistedByOptions = useMemo(
    () => [
      { label: t("providerMaster.excludedProvider.restrictedBy.tpa"), value: "TPA" },
      {
        label: t("providerMaster.excludedProvider.restrictedBy.insurer"),
        value: "INSURER",
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

  const investigationApplicableOptions = useMemo(
    () => [
      {
        label: t("providerMaster.excludedProvider.uploadDialog.cashless"),
        value: "cashless",
      },
      {
        label: t("providerMaster.excludedProvider.uploadDialog.reimbursement"),
        value: "reimbursement",
      },
    ],
    [t],
  );

  const watchedUploadIcId = watch("uploadIcId");
  const watchedBlacklistedBy = watch("blacklistedBy");
  const watchedListingType = watch("listingType");
  const watchedStatus = watch("status");
  const watchedEffectiveFrom = watch("effectiveFrom");
  const watchedRemark = watch("remark");

  const canSubmitMeta = canSubmitExclusionInwardForm(
    {
      uploadIcId: watchedUploadIcId,
      blacklistedBy: watchedBlacklistedBy,
      listingType: watchedListingType,
      investigationRequired,
      emergencyExceptionAllowed,
      investigationApplicableFor: Array.isArray(investigationApplicableFor)
        ? investigationApplicableFor
        : [],
      status: watchedStatus,
    },
    String(watchedEffectiveFrom ?? ""),
    String(watchedRemark ?? ""),
  );

  const onSubmit = async (
    actionType?: "PROCESSOR_PENDING" | "QC_PENDING" | "COMPLETED" | "REASSIGNED",
  ) => {
    if (!canSubmitMeta) {
      showProviderError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const formValues = getValues();
      const insurerName =
        uploadIcOptions.find((option) => option.value === formValues.uploadIcId)
          ?.label ??
        lockedInsurerLabel ??
        "";
      const result = await submitProviderExclusionDetails(
        {
          inwardNo,
          form: formValues,
          insurerName,
          sourceEntity,
          s3BucketName,
          s3SubBucketName,
          actionType,
        },
        { isProcessor, isQC },
      );

      if (!result.ok) {
        showProviderError(result.message);
        return;
      }

      saveProviderExclusionDetails({
        inwardNo,
        listingType: result.listingType,
        blacklistedBy: result.blacklistedBy,
        insurerId: result.insurerId,
        insurerName: result.insurerName,
        effectiveFrom: result.effectiveFrom,
        status: result.status,
        investigationRequired: result.investigationRequired,
        emergencyExceptionAllowed: result.emergencyExceptionAllowed,
        investigationApplicableFor: result.investigationApplicableFor,
        remark: result.remark,
        sourceEntity: result.sourceEntity,
        workflowStatus: result.workflowStatus,
      });

      toast.success(result.message, { position: "top-right", duration: 4000 });
      navigate(
        buildProviderExclusionInwardPath(inwardNo, {
          status: result.workflowStatus,
          documentType: result.listingType,
          sourceEntity,
          view: "summary",
        }),
        { replace: true },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-100 px-4 py-2">
        <DocumentDropdown inwardNo={inwardNo} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-3">
        <p className="mb-3 text-xs text-gray-500">
          {t("providerMaster.excludedProvider.inward.statusLabel", {
            defaultValue: "Status",
          })}
          :{" "}
          <span className="font-semibold text-gray-800">
            {status || "—"}
          </span>
        </p>

        <form
          className="max-w-5xl"
          onSubmit={handleSubmit(() => {
            onSubmit().catch((error) => {
              showProviderError(
                error instanceof Error ? error.message : "Submit failed.",
              );
            });
          })}
        >
          <div className={FORM_FIELD_GRID_CLASS}>
            <div className="min-w-0">
            <DropdownSelect
              label={t(
                "providerMaster.excludedProvider.uploadDialog.restrictionType",
              )}
              name_key="listingType"
              name="listingType"
              control={control}
              options={listingTypeOptions}
              defaultValue={t(
                "providerMaster.excludedProvider.uploadDialog.selectRestrictionType",
              )}
              errors={errors.listingType}
              isRequired
              disabled
              className={FIELD_CLASS}
            />
            </div>
            <div className="min-w-0">
            <DropdownSelect
              label={t(
                "providerMaster.excludedProvider.uploadDialog.restrictedBy",
              )}
              name_key="blacklistedBy"
              name="blacklistedBy"
              control={control}
              options={blacklistedByOptions}
              defaultValue={t(
                "providerMaster.excludedProvider.uploadDialog.selectBlacklistedBy",
              )}
              errors={errors.blacklistedBy}
              isRequired
              disabled
              className={FIELD_CLASS}
            />
            </div>
            <div className="min-w-0">
            <ProviderDatePicker
              label={t(
                "providerMaster.excludedProvider.uploadDialog.effectiveFrom",
              )}
              name="effectiveFrom"
              control={control}
              isRequired
              className={FIELD_CLASS}
            />
            </div>
            {insurerCompanyEnabled ? (
              <div className="min-w-0">
              <DropdownSelect
                key={`uploadIcId-${lockInsurerCompany ? "locked" : "open"}`}
                label={t(
                  "providerMaster.excludedProvider.uploadDialog.insurerCompany",
                )}
                name_key="uploadIcId"
                name="uploadIcId"
                control={control}
                options={uploadIcOptions}
                defaultValue={t(
                  "providerMaster.excludedProvider.uploadDialog.selectIc",
                )}
                errors={errors.uploadIcId}
                isRequired
                disabled={lockInsurerCompany}
                className={FIELD_CLASS}
              />
              </div>
            ) : null}
            {lockForEnabled ? (
              <div className="min-w-0">
              <DropdownSelect
                label={t(
                  "providerMaster.excludedProvider.uploadDialog.restrictionApplicableFor",
                )}
                name_key="status"
                name="status"
                control={control}
                options={uploadStatusOptions}
                defaultValue={t(
                  "providerMaster.excludedProvider.uploadDialog.selectRestrictionApplicableFor",
                )}
                errors={errors.status as { message?: string } | undefined}
                isRequired
                multiselect
                is_select_checkbox
                className={FIELD_CLASS}
              />
              </div>
            ) : null}
            {lockForEnabled ? (
              <ExclusionFlagCheckboxGroup
                investigationRequired={investigationRequired}
                emergencyExceptionAllowed={emergencyExceptionAllowed}
                onInvestigationRequiredChange={(checked) => {
                  setValue("investigationRequired", checked, { shouldDirty: true });
                  if (!checked) {
                    setValue("investigationApplicableFor", [], { shouldDirty: true });
                  }
                }}
                onEmergencyExceptionChange={(checked) =>
                  setValue("emergencyExceptionAllowed", checked, { shouldDirty: true })
                }
                disabled={submitting}
              />
            ) : null}
            {lockForEnabled && investigationRequired ? (
              <div className="min-w-0">
                <DropdownSelect
                  label={t(
                    "providerMaster.excludedProvider.uploadDialog.investigationApplicableFor",
                  )}
                  name_key="investigationApplicableFor"
                  name="investigationApplicableFor"
                  control={control}
                  options={investigationApplicableOptions}
                  defaultValue={t(
                    "providerMaster.excludedProvider.uploadDialog.selectInvestigationApplicableFor",
                  )}
                  errors={errors.investigationApplicableFor as { message?: string } | undefined}
                  isRequired
                  multiselect
                  is_select_checkbox
                  className={FIELD_CLASS}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-3 max-w-3xl">
            <Textarea
              label={t("providerMaster.excludedProvider.uploadDialog.remark")}
              placeholder={t(
                "providerMaster.excludedProvider.uploadDialog.remarkPlaceholder",
              )}
              rows={3}
              disabled={submitting}
              value={watch("remark")}
              onChange={(event) => setValue("remark", event.target.value)}
              isRequired
              classNames={{
                wrapper: "!mt-2",
              }}
              className="min-h-[4.5rem] w-full resize-y rounded-[10px] border border-gray-300 bg-white !px-3 !py-2 text-sm"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between bg-white p-2">
        <div
          className={`mb-2 w-[60%] rounded-md px-3 py-2 text-xs font-medium ${
            isQC ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {isQC
            ? t("stepNavigation.stages.qcReviewStage")
            : t("stepNavigation.stages.processingStage")}
          <div className="mt-1 text-[10px]">
            {resolveStageMessage(isQC, isProcessor, t)}
          </div>
        </div>

        <div className="flex gap-4">
          {isQC ? (
            <Button
              type="button"
              className="w-24"
              disabled={submitting || !canSubmitMeta}
              color="primary"
              onClick={() => {
                onSubmit("REASSIGNED").catch((error) => {
                  showProviderError(
                    error instanceof Error ? error.message : "Submit failed.",
                  );
                });
              }}
            >
              {t("stepNavigation.buttons.reassign")}
            </Button>
          ) : null}

          <Button
            type="button"
            className="w-24"
            color="primary"
            disabled={submitting || !canSubmitMeta}
            onClick={() => {
              onSubmit(resolveSubmitActionType(isQC, isProcessor)).catch((error) => {
                showProviderError(
                  error instanceof Error ? error.message : "Submit failed.",
                );
              });
            }}
          >
            {isQC
              ? t("stepNavigation.buttons.approve")
              : t("stepNavigation.buttons.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
