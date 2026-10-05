import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  UseFormClearErrors,
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetError,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Button, Checkbox } from "@/components/ui";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import { PROVIDER_FORM_BUTTON_CLASS } from "../../../shared/providerButtonStyles";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { fetchCorporateDatas } from "@/store/features/Broker/BrokerSlice";
import type { AddNewNetworkFormShape } from "../components/AddNetworkDialog";
import {
  getTriggerFields,
  getUploadErrorMessage,
  resolveEntityLabel,
  resolveSubmitEntityIds,
  type MappingEntity,
} from "../components/addNetworkDialogSubmitHelpers";
import { resolveBulkIcMappingType, type BulkIcMappingType } from "../types";
import { processBulkIcMappingExistingInward } from "../upload";
import type { BulkIcMappingInwardRow } from "../inward/rows";

const BULK_IC_MAPPING_CHECKBOX_LABEL_CLASS = "!text-[11px] font-normal text-black";

function resolveLockedInsurerId(
  inward: BulkIcMappingInwardRow,
  insurerOptions: Array<{ value?: string; label: string }>,
): string {
  const entityId = String(inward.inwardSourceEntityId ?? "").trim();
  const entityType = String(inward.inwardSourceEntityType ?? "").trim().toUpperCase();
  if (entityId && (!entityType || entityType === "INSURER")) {
    return entityId;
  }

  const name = String(inward.insurerName ?? "").trim().toLowerCase();
  if (!name || name === "—") return entityId;

  const match = insurerOptions.find(
    (option) => String(option.label ?? "").trim().toLowerCase() === name,
  );
  return match?.value ? String(match.value).trim() : entityId;
}

export type BulkIcMappingProcessFormProps = {
  inward: BulkIcMappingInwardRow;
  control: Control<AddNewNetworkFormShape>;
  errors: FieldErrors<AddNewNetworkFormShape>;
  register: UseFormRegister<AddNewNetworkFormShape>;
  setValue?: UseFormSetValue<AddNewNetworkFormShape>;
  setError?: UseFormSetError<AddNewNetworkFormShape>;
  clearErrors?: UseFormClearErrors<AddNewNetworkFormShape>;
  trigger: UseFormTrigger<AddNewNetworkFormShape>;
  onCancel: () => void;
  onSubmitSuccess: (payload: {
    entity: MappingEntity;
    mappingType: BulkIcMappingType;
    insurerLabel: string;
    corporateLabel: string;
    inwardNo: string;
    message?: string;
  }) => void;
};

export function BulkIcMappingProcessForm({
  inward,
  control,
  errors,
  register,
  setValue,
  clearErrors,
  trigger,
  onCancel,
  onSubmitSuccess,
}: Readonly<BulkIcMappingProcessFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const insurerList = useAppSelector((s) => s.insurerList);
  const { corporateData } = useAppSelector((state) => state.broker);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entityType, setEntityType] = useState<MappingEntity>("ic");

  const baseInsurerOptions = useMemo(
    () =>
      insurerList.insurerList?.map((i: { insurerId?: string; insurerName?: string }) => ({
        value: i?.insurerId,
        label: i?.insurerName ?? "",
      })) ?? [],
    [insurerList.insurerList],
  );
  const corporateOptions = useMemo(
    () =>
      corporateData?.map((c: { corporateId?: string; corporateName?: string }) => ({
        value: c?.corporateId,
        label: c?.corporateName ?? "",
      })) ?? [],
    [corporateData],
  );

  const lockedInsurerId = useMemo(
    () => resolveLockedInsurerId(inward, baseInsurerOptions),
    [inward, baseInsurerOptions],
  );
  const lockedInsurerLabel =
    String(inward.insurerName ?? "").trim() &&
    String(inward.insurerName ?? "").trim() !== "—"
      ? String(inward.insurerName).trim()
      : lockedInsurerId;

  const insurerOptions = useMemo(() => {
    if (
      !lockedInsurerId ||
      baseInsurerOptions.some((option) => String(option.value) === lockedInsurerId)
    ) {
      return baseInsurerOptions;
    }
    return [
      { value: lockedInsurerId, label: lockedInsurerLabel || lockedInsurerId },
      ...baseInsurerOptions,
    ];
  }, [baseInsurerOptions, lockedInsurerId, lockedInsurerLabel]);

  const isDepanel = useWatch({ control, name: "isDepanel" }) ?? false;
  const mappingType = resolveBulkIcMappingType(isDepanel);
  const selectedCorporate = useWatch({ control, name: "selectedCorporate" }) ?? "";

  useEffect(() => {
    if ((insurerList.insurerList?.length ?? 0) > 0) return;
    dispatch(fetchInsurerList());
  }, [dispatch, insurerList.insurerList]);

  useEffect(() => {
    if ((corporateData?.length ?? 0) > 0) return;
    dispatch(fetchCorporateDatas({ onlyName: true, page: 0, size: 20 }));
  }, [dispatch, corporateData]);

  useEffect(() => {
    setEntityType("ic");
    setValue?.("selectedIc", lockedInsurerId, { shouldValidate: Boolean(lockedInsurerId) });
    setValue?.("selectedCorporate", "");
    setValue?.("isDepanel", false);
    setValue?.("providerNetwork", "");
    setValue?.("providerTariff", "");
    setValue?.("empanelSource", "");
    clearErrors?.();
  }, [inward.inwardNo, lockedInsurerId, setValue, clearErrors]);

  const handleEntityTypeChange = (next: MappingEntity) => {
    setEntityType(next);
    if (next === "ic") {
      setValue?.("selectedCorporate", "");
      clearErrors?.("selectedCorporate");
    }
    if (lockedInsurerId) {
      setValue?.("selectedIc", lockedInsurerId, { shouldValidate: true });
    }
  };

  const entityTabClass = (isActive: boolean) => {
    const base =
      "min-w-[3.75rem] rounded px-2.5 py-1 text-center text-[11px] font-semibold leading-tight transition-all";
    if (isActive) {
      return `${base} bg-white text-primary-700 shadow-sm ring-1 ring-gray-200/80`;
    }
    return `${base} text-gray-600 hover:text-gray-900`;
  };

  const handleSubmit = async () => {
    const valid = await trigger(getTriggerFields(entityType), { shouldFocus: true });
    if (!valid) return;

    const insurerId = lockedInsurerId;
    const ids = resolveSubmitEntityIds(entityType, insurerId, selectedCorporate);
    if (!ids) return;

    setIsSubmitting(true);
    try {
      const result = await processBulkIcMappingExistingInward({
        inwardNo: inward.inwardNo,
        entityType,
        entityId: ids.entityId,
        insurerId: ids.insurerId,
        mappingType,
        s3BucketName: inward.s3BucketName,
        s3SubBucketName: inward.s3SubBucketName,
      });

      if (!result.ok) {
        showErrorMessage({
          error: result.message ?? t("providerMaster.icMapping.errors.uploadFailed"),
        });
        return;
      }

      showSuccessMessage(
        result.message ??
          t("providerMaster.icMapping.success.uploadWithInward", {
            inwardNo: result.inwardNo,
          }),
      );

      onSubmitSuccess({
        entity: entityType,
        mappingType,
        insurerLabel:
          lockedInsurerLabel || resolveEntityLabel(insurerOptions, ids.insurerId),
        corporateLabel: resolveEntityLabel(corporateOptions, selectedCorporate),
        inwardNo: result.inwardNo,
        message: result.message,
      });
    } catch (error) {
      showErrorMessage({
        error: getUploadErrorMessage(error, t("providerMaster.icMapping.errors.uploadFailed")),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-gray-100">
      <div className="space-y-2 px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <fieldset className="m-0 inline-flex min-w-0 rounded-md border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/80 p-0.5 shadow-sm">
              <legend className="sr-only">
                {t("providerMaster.icMapping.form.mappingEntityAria")}
              </legend>
              <button
                type="button"
                onClick={() => handleEntityTypeChange("ic")}
                className={entityTabClass(entityType === "ic")}
                aria-pressed={entityType === "ic"}
              >
                {t("providerMaster.network.insurer")}
              </button>
              <button
                type="button"
                onClick={() => handleEntityTypeChange("corporate")}
                className={entityTabClass(entityType === "corporate")}
                aria-pressed={entityType === "corporate"}
              >
                {t("providerMaster.mappingSubTab.corporate")}
              </button>
            </fieldset>

            <div className="min-w-0 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                {t("providerMaster.icMapping.search.inwardNo")}
              </p>
              <p className="truncate text-xs font-semibold text-gray-900">{inward.inwardNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 items-end gap-x-2 gap-y-1.5 border-t border-gray-100 pt-2 md:grid-cols-12">
            <div
              className={`min-w-0 ${entityType === "corporate" ? "md:col-span-3" : "md:col-span-4"}`}
            >
              <DropdownSelect
                name="selectedIc"
                name_key="selectedIc"
                control={control}
                options={insurerOptions}
                label={t("providerMaster.icMapping.form.insuranceCompany")}
                defaultValue={t("providerMaster.icMapping.form.selectInsuranceCompany")}
                isRequired
                disabled={Boolean(lockedInsurerId)}
                errors={errors.selectedIc}
                rules={{
                  required: t("providerMaster.icMapping.validation.insuranceCompanyRequired"),
                }}
                formClassName="[&_.react-select__control]:min-h-[36px] [&_.react-select__control]:text-sm"
              />
            </div>

            {entityType === "corporate" ? (
              <div className="min-w-0 md:col-span-3">
                <DropdownSelect
                  name="selectedCorporate"
                  name_key="selectedCorporate"
                  control={control}
                  options={corporateOptions}
                  label={t("providerMaster.icMapping.form.corporate")}
                  defaultValue={t("providerMaster.icMapping.form.selectCorporate")}
                  isRequired
                  errors={errors.selectedCorporate}
                  rules={{
                    required: t("providerMaster.icMapping.validation.corporateRequired"),
                  }}
                  formClassName="[&_.react-select__control]:min-h-[36px] [&_.react-select__control]:text-sm"
                />
              </div>
            ) : null}

            <div className="min-w-0 md:col-span-2">
              <span
                className="input-label dropdown-label invisible select-none font-normal text-[14px] text-black"
                aria-hidden="true"
              >
                {t("providerMaster.icMapping.form.isDepanel")}
              </span>
              <div className="mt-[3px] flex h-9 min-h-[36px] w-full items-center rounded-lg border border-slate-300 bg-white px-3">
                <Checkbox
                  {...register("isDepanel")}
                  label={t("providerMaster.icMapping.form.isDepanel")}
                  classNames={{
                    label: "cursor-pointer gap-2 !text-[11px] font-normal",
                    labelText: BULK_IC_MAPPING_CHECKBOX_LABEL_CLASS,
                  }}
                />
              </div>
            </div>

            <div
              className={`flex justify-end gap-1.5 ${
                entityType === "corporate" ? "md:col-span-4" : "md:col-span-6"
              }`}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={onCancel}
                className={PROVIDER_FORM_BUTTON_CLASS}
              >
                {t("providerMaster.button.cancel")}
              </Button>
              <Button
                type="button"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !lockedInsurerId}
                className={PROVIDER_FORM_BUTTON_CLASS}
              >
                {isSubmitting
                  ? t("providerMaster.icMapping.form.submitting")
                  : t("providerMaster.icMapping.form.submit")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
