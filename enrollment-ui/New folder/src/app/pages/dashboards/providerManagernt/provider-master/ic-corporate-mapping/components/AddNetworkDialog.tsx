import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
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
import { useProviderInwardContextIds } from "../../../shared/providerInwardDefaults";
import {
  BULK_IC_MAPPING_HOSPITAL_LIST_ACCEPT,
  isBulkIcMappingHospitalListFile,
  submitBulkIcMappingHospitalList,
} from "../upload";
import {
  resolveBulkIcMappingType,
  type BulkIcMappingType,
} from "../types";
import {
  isEffectiveFromOnOrBeforeEffectiveTo,
} from "../../../shared/effectiveDateRange";
import {
  getInwardContextErrorMessage,
  getTriggerFields,
  getUploadErrorMessage,
  resolveEntityLabel,
  resolveSubmitEntityIds,
  validateEffectiveDateRange,
  type MappingEntity,
} from "./addNetworkDialogSubmitHelpers";

const BULK_IC_MAPPING_CHECKBOX_LABEL_CLASS = "!text-[11px] font-normal text-black";

export type AddNewNetworkFormShape = {
  selectedIc: string;
  selectedCorporate: string;
  /** When true, bulk upload is for de-empanelment; otherwise empanel (default). */
  isDepanel: boolean;
  /** Shown after IC is selected (`tpa` | `ic` | `hybrid`). */
  providerNetwork: string;
  providerTariff: string;
  /** Empanel source: `ic` | `tpa` | `both` */
  empanelSource: string;
  discountTypeIc: string;
  discountTypeCorporate: string;
  /** IC tab SOC remark fields — parent form only; not edited in add-network flow */
  socRemarkCategoryIc: string;
  socRemarkIc: string;
  effectiveFrom: string;
  effectiveTo: string;
  remarkCategory: string;
  remarks: string;
};

type AddNewNetworkFormProps = {
  /** When true, local form state resets (same as when dialog opened). */
  active: boolean;
  onCancel: () => void;
  control: Control<AddNewNetworkFormShape>;
  /** From parent `useForm` `formState.errors` (same pattern as Agreement / CommonSearch). */
  errors: FieldErrors<AddNewNetworkFormShape>;
  register: UseFormRegister<AddNewNetworkFormShape>;
  setValue?: UseFormSetValue<AddNewNetworkFormShape>;
  setError?: UseFormSetError<AddNewNetworkFormShape>;
  clearErrors?: UseFormClearErrors<AddNewNetworkFormShape>;
  trigger: UseFormTrigger<AddNewNetworkFormShape>;
  onSubmitSuccess: (payload: {
    entity: MappingEntity;
    hospitalListFile: File;
    mappingType: BulkIcMappingType;
    empanelSource: string;
    providerNetwork: string;
    providerTariff: string;
    insurerLabel: string;
    corporateLabel: string;
    inwardNo: string;
    message?: string;
  }) => void;
};

export function AddNewNetworkForm({
  active,
  onCancel,
  control,
  errors,
  register,
  setValue,
  setError,
  clearErrors,
  trigger,
  onSubmitSuccess,
}: Readonly<AddNewNetworkFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const insurerList = useAppSelector((s) => s.insurerList);
  const { corporateData } = useAppSelector((state) => state.broker);
  const {
    departmentId,
    inwardReceivedTpaBranchId,
    ready: inwardContextReady,
    branchMissing,
    departmentMissing,
  } = useProviderInwardContextIds();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insurerOptions =
    insurerList.insurerList?.map((i: any) => ({
      value: i?.insurerId,
      label: i?.insurerName,
    })) ?? [];
  const corporateOptions =
    corporateData?.map((c: any) => ({
      value: c?.corporateId,
      label: c?.corporateName,
    })) ?? [];

  const [entityType, setEntityType] = useState<MappingEntity>("ic");
  const [hospitalListFile, setHospitalListFile] = useState<File | null>(null);
  const [hospitalFileTouched, setHospitalFileTouched] = useState(false);
  const [hospitalFileFormatError, setHospitalFileFormatError] = useState<string | null>(null);
  const [isHospitalFileDragging, setIsHospitalFileDragging] = useState(false);
  const hospitalFileInputRef = useRef<HTMLInputElement>(null);

  const applyHospitalListFile = useCallback(
    (file: File | undefined | null) => {
      setHospitalFileTouched(false);
      if (!file) {
        setHospitalListFile(null);
        setHospitalFileFormatError(null);
        return;
      }
      if (!isBulkIcMappingHospitalListFile(file)) {
        setHospitalListFile(null);
        setHospitalFileFormatError(
          t("providerMaster.icMapping.validation.hospitalListFileInvalidFormat"),
        );
        return;
      }
      setHospitalListFile(file);
      setHospitalFileFormatError(null);
    },
    [t],
  );

  const openHospitalFilePicker = () => hospitalFileInputRef.current?.click();

  useEffect(() => {
    if ((insurerList.insurerList?.length ?? 0) > 0) return;
    dispatch(fetchInsurerList());
  }, [dispatch, insurerList.insurerList]);
  useEffect(() => {
    if ((corporateData?.length ?? 0) > 0) return;
    dispatch(fetchCorporateDatas({ onlyName: true, page: 0, size: 20 }));
  }, [dispatch, corporateData]);

  const empanelSource = useWatch({ control, name: "empanelSource" }) ?? "";
  const isDepanel = useWatch({ control, name: "isDepanel" }) ?? false;
  const mappingType = resolveBulkIcMappingType(isDepanel);
  const selectedIc = useWatch({ control, name: "selectedIc" }) ?? "";
  const selectedCorporate = useWatch({ control, name: "selectedCorporate" }) ?? "";
  const providerNetwork = useWatch({ control, name: "providerNetwork" }) ?? "";
  const providerTariff = useWatch({ control, name: "providerTariff" }) ?? "";
  const networkEffectiveFrom = useWatch({ control, name: "effectiveFrom" }) ?? "";
  const networkEffectiveTo = useWatch({ control, name: "effectiveTo" }) ?? "";

  useEffect(() => {
    if (!clearErrors) return;
    if (isEffectiveFromOnOrBeforeEffectiveTo(networkEffectiveFrom, networkEffectiveTo)) {
      clearErrors("effectiveTo");
    }
  }, [networkEffectiveFrom, networkEffectiveTo, clearErrors]);

  /** Same for IC and Corporate: insurer chosen first; corporate placeholder must not gate visibility. */
  const showProviderNetworkTariff = String(selectedIc).trim() !== "";

  const handleEntityTypeChange = (next: MappingEntity) => {
    setEntityType(next);
    if (next === "ic") {
      setValue?.("selectedCorporate", "");
      clearErrors?.("selectedCorporate");
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

  useEffect(() => {
    if (!setValue) return;
    if (String(selectedIc).trim() === "") {
      setValue("providerNetwork", "");
      setValue("providerTariff", "");
    }
  }, [selectedIc, setValue]);

  useEffect(() => {
    if (!active) return;
    setHospitalListFile(null);
    setHospitalFileTouched(false);
    setHospitalFileFormatError(null);
    setIsHospitalFileDragging(false);
    setEntityType("ic");
    setValue?.("selectedCorporate", "");
    setValue?.("isDepanel", false);
    setValue?.("providerNetwork", "");
    setValue?.("providerTariff", "");
    setValue?.("empanelSource", "");
    setValue?.("effectiveFrom", "");
    setValue?.("effectiveTo", "");
    setValue?.("remarkCategory", "");
    setValue?.("remarks", "");
  }, [active, setValue]);

  const handleSubmit = async () => {
    if (
      !validateEffectiveDateRange(
        networkEffectiveFrom,
        networkEffectiveTo,
        t,
        setError,
        clearErrors,
      )
    ) {
      return;
    }

    setHospitalFileTouched(true);

    const valid = await trigger(getTriggerFields(entityType), { shouldFocus: true });
    if (!valid || !hospitalListFile) return;

    if (!isBulkIcMappingHospitalListFile(hospitalListFile)) {
      setHospitalFileFormatError(
        t("providerMaster.icMapping.validation.hospitalListFileInvalidFormat"),
      );
      return;
    }

    if (!inwardReceivedTpaBranchId || !departmentId) {
      showErrorMessage({
        error: getInwardContextErrorMessage(t, branchMissing, departmentMissing),
      });
      return;
    }

    const ids = resolveSubmitEntityIds(entityType, selectedIc, selectedCorporate);
    if (!ids) return;

    setIsSubmitting(true);
    try {
      const submitResult = await submitBulkIcMappingHospitalList(hospitalListFile, {
        entityType,
        entityId: ids.entityId,
        insurerId: ids.insurerId,
        inwardReceivedTpaBranchId,
        departmentId,
        mappingType,
      });

      if (!submitResult.ok) {
        showErrorMessage({
          error: submitResult.message ?? t("providerMaster.icMapping.errors.uploadFailed"),
        });
        return;
      }

      const { inwardNo } = submitResult;

      showSuccessMessage(
        submitResult.message ??
          t("providerMaster.icMapping.success.uploadWithInward", { inwardNo }),
      );

      onSubmitSuccess({
        entity: entityType,
        hospitalListFile,
        mappingType,
        empanelSource,
        providerNetwork: showProviderNetworkTariff ? providerNetwork : "",
        providerTariff: showProviderNetworkTariff ? providerTariff : "",
        insurerLabel: resolveEntityLabel(insurerOptions, selectedIc),
        corporateLabel: resolveEntityLabel(corporateOptions, selectedCorporate),
        inwardNo,
        message: submitResult.message,
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
    <div className="w-full  rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-gray-100">
      <div className="space-y-2 px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-md border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/80 p-0.5 shadow-sm"
              role="group"
              aria-label={t("providerMaster.icMapping.form.mappingEntityAria")}
            >
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
            </div>
          </div>

          <div className="grid grid-cols-1 items-end gap-x-2 gap-y-1.5 border-t border-gray-100 pt-2 md:grid-cols-12">
            {/* Row 1: primary fields (IC & Corporate tabs) */}
            <div
              className={`min-w-0 ${entityType === "corporate" ? "md:col-span-2" : "md:col-span-3"}`}
            >
              <DropdownSelect
                name="selectedIc"
                name_key="selectedIc"
                control={control}
                options={insurerOptions}
                label={t("providerMaster.icMapping.form.insuranceCompany")}
                defaultValue={t("providerMaster.icMapping.form.selectInsuranceCompany")}
                isRequired
                errors={errors.selectedIc}
                rules={{ required: t("providerMaster.icMapping.validation.insuranceCompanyRequired") }}
                formClassName="[&_.react-select__control]:min-h-[36px] [&_.react-select__control]:text-sm"
              />
            </div>

            {entityType === "corporate" ? (
              <div className="min-w-0 md:col-span-2">
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
              className={`min-w-0 ${entityType === "corporate" ? "md:col-span-3" : "md:col-span-4"}`}
            >
              <label className="input-label dropdown-label font-normal text-[14px] text-black">
                {t("providerMaster.icMapping.form.hospitalListFile")}
                <span className="text-red-500"> *</span>
              </label>
              <div
                className={clsx(
                  "mt-[3px] flex h-9 min-h-[36px] cursor-pointer items-center gap-2 rounded-lg border border-dashed px-2.5 transition-colors",
                  hospitalFileFormatError || (hospitalFileTouched && !hospitalListFile)
                    ? "border-red-300 bg-red-50/50 text-red-900"
                    : isHospitalFileDragging
                      ? "border-primary-500 bg-primary-50/50 text-gray-700"
                      : "border-gray-300 bg-gray-50/90 text-gray-700 hover:border-primary-400 hover:bg-primary-50/40",
                )}
                onClick={openHospitalFilePicker}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsHospitalFileDragging(true);
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsHospitalFileDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsHospitalFileDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsHospitalFileDragging(false);
                  applyHospitalListFile(event.dataTransfer.files?.[0]);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openHospitalFilePicker();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={t("providerMaster.chooseFile.dropOrBrowseAria", {
                  label: t("providerMaster.icMapping.form.hospitalListFile"),
                })}
              >
                <CloudArrowUpIcon className="h-4 w-4 shrink-0 text-primary-500" />
                <span className="min-w-0 flex-1 truncate text-[11px] font-normal">
                  {hospitalListFile ? (
                    hospitalListFile.name
                  ) : (
                    <>
                      {t("providerMaster.chooseFile.dropFileHere")}{" "}
                      <span className="font-medium text-primary-600">
                        {t("providerMaster.chooseFile.browse")}
                      </span>
                    </>
                  )}
                </span>
                <input
                  ref={hospitalFileInputRef}
                  type="file"
                  accept={BULK_IC_MAPPING_HOSPITAL_LIST_ACCEPT}
                  className="hidden"
                  onChange={(event) => {
                    applyHospitalListFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </div>
              {hospitalFileFormatError ? (
                <p className="mt-0.5 text-[11px] text-red-600">{hospitalFileFormatError}</p>
              ) : hospitalFileTouched && !hospitalListFile ? (
                <p className="mt-0.5 text-[11px] text-red-600">
                  {t("providerMaster.icMapping.validation.hospitalListFileRequired")}
                </p>
              ) : null}
            </div>

            <div
              className={`flex justify-end gap-1.5 ${entityType === "corporate" ? "md:col-span-3" : "md:col-span-3"}`}
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
                disabled={isSubmitting || !inwardContextReady}
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
