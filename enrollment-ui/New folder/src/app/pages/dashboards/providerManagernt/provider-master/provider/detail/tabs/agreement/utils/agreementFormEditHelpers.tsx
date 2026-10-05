import type { ChangeEvent, FocusEvent, ReactNode } from "react";
import type { TFunction } from "i18next";
import type { Control, FieldError, FieldErrors, UseFormReturn } from "react-hook-form";
import { TrashIcon } from "@heroicons/react/24/outline";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import type { AgreementFullFormValues, StandaloneAgreementFormValues } from "./agreementFormConfig";
import { formatToDDMMMYYYY } from "../../../../../../shared/dateFormat";
import type { AgreementFormLogic } from "../hooks/useAgreement";
import { AgreementDocumentFields } from "../components/AgreementDocumentFields";
import { StandaloneAgreementDocumentUploadFields } from "../components/StandaloneAgreementDocumentUploadFields";

type DurationInputParams = {
  t: TFunction;
  agreementDurationDaysRegister: AgreementFormLogic["agreementDurationDaysRegister"];
  durationEditingRef: AgreementFormLogic["durationEditingRef"];
  scheduleAgreementDurationApply: AgreementFormLogic["scheduleAgreementDurationApply"];
  clearDurationApplyTimer: AgreementFormLogic["clearDurationApplyTimer"];
  applyAgreementDurationToDates: AgreementFormLogic["applyAgreementDurationToDates"];
  error?: string;
};

export function buildAgreementDurationInput({
  t,
  agreementDurationDaysRegister,
  durationEditingRef,
  scheduleAgreementDurationApply,
  clearDurationApplyTimer,
  applyAgreementDurationToDates,
  error,
}: DurationInputParams) {
  return (
    <Input
      label={t("providerMaster.agreement.fields.agreementDurationDays")}
      inputMode="numeric"
      placeholder=""
      error={error}
      {...agreementDurationDaysRegister}
      onFocus={() => {
        durationEditingRef.current = true;
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        agreementDurationDaysRegister.onChange(e);
        durationEditingRef.current = true;
        scheduleAgreementDurationApply();
      }}
      onBlur={(e: FocusEvent<HTMLInputElement>) => {
        clearDurationApplyTimer();
        agreementDurationDaysRegister.onBlur(e);
        applyAgreementDurationToDates();
        queueMicrotask(() => {
          durationEditingRef.current = false;
        });
      }}
      className="h-8 rounded-md text-xs"
    />
  );
}

type ScopeIcDropdownParams = {
  t: TFunction;
  showSelectedIcScopeUi: boolean;
  applicableScope: string;
  selectedIcSingleMode: boolean;
  control: Control<AgreementFullFormValues>;
  effectiveIcOptions: AgreementFormLogic["effectiveIcOptions"];
  dropdownFieldError: (name: keyof AgreementFullFormValues) => FieldError | undefined;
  insurerIcLoading: boolean;
  isGicStandard: boolean;
  isHospital: boolean;
  setValue: UseFormReturn<AgreementFullFormValues>["setValue"];
};

export function buildScopeIcDropdown({
  t,
  showSelectedIcScopeUi,
  applicableScope,
  selectedIcSingleMode,
  control,
  effectiveIcOptions,
  dropdownFieldError,
  insurerIcLoading,
  isGicStandard,
  isHospital,
  setValue,
}: ScopeIcDropdownParams) {
  if (!showSelectedIcScopeUi || applicableScope !== "SELECTED_INSURER") return null;

  return (
    <div className="min-w-0 flex-1 basis-[min(100%,18rem)] sm:max-w-xl">
      <DropdownSelect
        label={
          selectedIcSingleMode
            ? t("providerMaster.agreement.fields.selectInsurer")
            : t("providerMaster.agreement.fields.selectInsurers")
        }
        name="selectedIcIds"
        name_key="selectedIcIds"
        control={control}
        options={effectiveIcOptions}
        defaultValue={
          selectedIcSingleMode
            ? t("providerMaster.agreement.fields.selectInsurer")
            : t("providerMaster.agreement.fields.selectInsurers")
        }
        isRequired
        multiselect={!selectedIcSingleMode}
        multiselectHorizontalScroll={isHospital}
        is_select_checkbox={!selectedIcSingleMode}
        errors={dropdownFieldError("selectedIcIds")}
        className="min-h-[36px] rounded-md text-xs"
        menuPlacement="auto"
        disabled={insurerIcLoading || isGicStandard}
        formClassName="w-full min-w-0"
        setValue={setValue}
        onChange={
          selectedIcSingleMode
            ? (value) => {
                const id =
                  typeof value === "string" || typeof value === "number"
                    ? String(value).trim()
                    : "";
                setValue("selectedIcIds", id ? [id] : [], {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            : undefined
        }
      />
    </div>
  );
}

type InvolvementTableParams = {
  t: TFunction;
  selectedIcInvolvementRows: AgreementFormLogic["selectedIcInvolvementRows"];
  effectiveFromWatch: string | undefined;
  onRemoveIc?: (insurerId: string) => void;
};

export function buildInvolvementTable({
  t,
  selectedIcInvolvementRows,
  effectiveFromWatch,
  onRemoveIc,
}: InvolvementTableParams) {
  const involvementRowCount = selectedIcInvolvementRows.rows.length;
  const involvementTableBodyClass =
    involvementRowCount > 4 ? "max-h-44 overflow-y-auto" : "";
  const showRemove = typeof onRemoveIc === "function";

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/80">
      <div className={involvementTableBodyClass}>
        <table className="w-full min-w-[240px] table-fixed border-collapse text-left text-[11px]">
          <colgroup>
            <col className={showRemove ? "w-[55%]" : "w-[58%]"} />
            <col className={showRemove ? "w-[35%]" : "w-[42%]"} />
            {showRemove ? <col className="w-[10%]" /> : null}
          </colgroup>
          <thead className="sticky top-0 z-[1] bg-gray-100/95">
            <tr className="border-b border-gray-200 text-gray-700">
              <th className="px-2 py-1.5 text-left font-semibold">
                {t("providerMaster.agreement.insuranceCompany")}
              </th>
              <th className="px-2 py-1.5 text-left font-semibold">
                {t("providerMaster.agreement.effectiveFromInvolvement")}
              </th>
              {showRemove ? (
                <th className="px-2 py-1.5 text-center font-semibold">
                  {t("providerMaster.common.actions")}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {selectedIcInvolvementRows.rows.length > 0 ? (
              selectedIcInvolvementRows.rows.map((r, idx) => (
                <tr
                  key={`${r.insurerId || r.name}-${idx}`}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-2 py-1.5 align-top text-gray-900">{r.name}</td>
                  <td className="px-2 py-1.5 align-top text-gray-900">
                    {formatToDDMMMYYYY(
                      r.effectiveFromIso || effectiveFromWatch || new Date().toISOString(),
                    )}
                  </td>
                  {showRemove ? (
                    <td className="px-2 py-1.5 align-top text-center">
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        onClick={() => onRemoveIc?.(r.insurerId)}
                        aria-label={t("providerMaster.agreement.removeIc", {
                          name: r.name,
                        })}
                        title={t("providerMaster.agreement.removeIc", { name: r.name })}
                      >
                        <TrashIcon className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-2 py-1.5 text-gray-500" colSpan={showRemove ? 3 : 2}>
                  {t("providerMaster.agreement.noDataAvailable")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type DocumentUploadSectionParams = {
  t: TFunction;
  isHospital: boolean;
  hospitalLogic: AgreementFormLogic | null;
  form: UseFormReturn<AgreementFullFormValues>;
  providerId?: string;
  agreementDocumentViewUrl?: string;
  supportingDocumentViewUrl?: string;
  documentUploadEnabled: boolean;
  agreementDocumentEnabled: boolean;
  control: Control<AgreementFullFormValues>;
  standaloneControl: Control<StandaloneAgreementFormValues>;
  agreementDocumentTypeError: string;
  supportingDocumentTypeError: string;
  setAgreementDocumentTypeError: (value: string) => void;
  setSupportingDocumentTypeError: (value: string) => void;
  fieldError: (name: keyof AgreementFullFormValues) => string | undefined;
  errors: FieldErrors<AgreementFullFormValues>;
  touchedFields: UseFormReturn<AgreementFullFormValues>["formState"]["touchedFields"];
  isSubmitted: boolean;
  onAgreementFileChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function buildAgreementDocumentUploadSection({
  t,
  isHospital,
  hospitalLogic,
  form,
  providerId,
  agreementDocumentViewUrl,
  supportingDocumentViewUrl,
  documentUploadEnabled,
  agreementDocumentEnabled,
  standaloneControl,
  agreementDocumentTypeError,
  supportingDocumentTypeError,
  setAgreementDocumentTypeError,
  setSupportingDocumentTypeError,
  fieldError,
  errors,
  touchedFields,
  isSubmitted,
  onAgreementFileChange,
}: DocumentUploadSectionParams): ReactNode {
  if (isHospital && hospitalLogic) {
    return (
      <AgreementDocumentFields
        providerId={providerId}
        form={form}
        agreementFileInputRef={hospitalLogic.fileInputRef}
        supportingFileInputRef={hospitalLogic.supportingFileInputRef}
        agreementFileDisplayName={hospitalLogic.agreementFileDisplayName}
        supportingFileDisplayName={hospitalLogic.supportingFileDisplayName}
        agreementDocumentViewUrl={agreementDocumentViewUrl}
        supportingDocumentViewUrl={supportingDocumentViewUrl}
        clearAgreementDocument={hospitalLogic.clearAgreementDocument}
        clearSupportingDocument={hospitalLogic.clearSupportingDocument}
        disabled={!documentUploadEnabled}
        agreementDocumentRequired={agreementDocumentEnabled}
        supportingDocumentRequired={documentUploadEnabled}
        agreementDocumentError={fieldError("agreementDocumentName")}
        supportingDocumentError={fieldError("supportingDocumentName")}
        onAgreementFileChange={onAgreementFileChange}
      />
    );
  }

  return (
    <StandaloneAgreementDocumentUploadFields
      control={standaloneControl}
      t={t}
      documentUploadEnabled={documentUploadEnabled}
      agreementDocumentEnabled={agreementDocumentEnabled}
      supportingDocumentRequired={documentUploadEnabled}
      agreementDocumentTypeError={agreementDocumentTypeError}
      supportingDocumentTypeError={supportingDocumentTypeError}
      setAgreementDocumentTypeError={setAgreementDocumentTypeError}
      setSupportingDocumentTypeError={setSupportingDocumentTypeError}
      fieldError={fieldError}
      errors={errors}
      touchedFields={touchedFields}
      isSubmitted={isSubmitted}
    />
  );
}

