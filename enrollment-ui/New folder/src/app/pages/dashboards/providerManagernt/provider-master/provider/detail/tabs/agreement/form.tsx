import { useState, useCallback, useEffect, type ChangeEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { type Control, type UseFormReturn } from "react-hook-form";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input, Textarea } from "@/components/ui";
import { ProviderDatePicker } from "../../../../../shared/ProviderDatePicker";
import {
  AGREEMENT_FORM_YES_NO,
  AGREEMENT_NAME_OPTIONS,
  AGREEMENT_FORM_CARD_CLASS,
  AGREEMENT_FORM_SECTION_HEADER_CLASS,
  AGREEMENT_FORM_SECTION_TITLE_CLASS,
} from "./utils/agreementFormConfig";
import type { AgreementFullFormValues, StandaloneAgreementFormValues } from "./utils/agreementFormConfig";
import type { AgreementFormLogic, StandaloneAgreementFormLogic } from "./hooks/useAgreement";
import { useAgreementFormLogic } from "./hooks/useAgreement";
import { syncAgreementSignatoryFieldErrors } from "./utils/agreementFieldSync";
import {
  resolveVisibleDropdownError,
  resolveVisibleFieldError,
} from "../../../../../shared/resolveVisibleFieldError";
import { AgreementTermsPpnInfraFields } from "./components/AgreementTermsPpnInfraFields";
import { AgreementBasicFields } from "./components/AgreementBasicFields";
import { AgreementScopeFields } from "./components/AgreementScopeFields";
import { AgreementFormView } from "./formView";
import { shouldHideApplicableScopeSection, shouldHideScopeIcList, shouldShowRemarksBesideApplicableScope, shouldShowRemarksFullWidth, resolveEmpanelmentDateLabelKey, shouldDisableEmpanelmentDateEditing } from "./utils/agreementHelpers";
import {
  buildAgreementDocumentUploadSection,
  buildAgreementDurationInput,
  buildInvolvementTable,
  buildScopeIcDropdown,
} from "./utils/agreementFormEditHelpers";

export type AgreementFormEditProps = {
  variant?: "hospital" | "standalone";
  mode?: "create" | "edit";
  logic: AgreementFormLogic | StandaloneAgreementFormLogic;
  providerId?: string;
  agreementDocumentViewUrl?: string;
  supportingDocumentViewUrl?: string;
  onAgreementFileChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onPpnValidationChange?: (state: {
    isGipsaPpnTripartite: boolean;
    isPsuTripartite: boolean;
    isChecking: boolean;
    isPpnValidationPassed: boolean;
  }) => void;
  agreementNameOptions?: typeof AGREEMENT_NAME_OPTIONS;
  disableAgreementName?: boolean;
};

function DetailTableCard({
  title,
  children,
}: Readonly<{
  title: ReactNode;
  children: ReactNode;
}>) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-gray-200 bg-gray-200 px-2.5 py-1">
        <div className="text-[11px] font-semibold text-gray-700">{title}</div>
      </div>
      {children}
    </div>
  );
}

function AgreementFormSection({
  title,
  variant,
  children,
}: Readonly<{
  title: string;
  variant: "hospital" | "standalone";
  children: ReactNode;
}>) {
  if (variant === "hospital") {
    return <DetailTableCard title={title}>{children}</DetailTableCard>;
  }

  return (
    <div className={AGREEMENT_FORM_CARD_CLASS}>
      <div className={AGREEMENT_FORM_SECTION_HEADER_CLASS}>
        <h3 className={AGREEMENT_FORM_SECTION_TITLE_CLASS}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function isHospitalLogic(
  variant: "hospital" | "standalone",
  _logic: AgreementFormLogic | StandaloneAgreementFormLogic,
): _logic is AgreementFormLogic {
  return variant === "hospital";
}

type AgreementFormLayoutContent = {
  agreementBasicDetailsSection: ReactNode;
  agreementTermsSection: ReactNode;
  applicableScopeSection: ReactNode;
  agreementDocumentSection: ReactNode;
  remarksSection: ReactNode;
  formRowGridClass: string;
  hideApplicableScopeSection: boolean;
};

function renderAgreementScopeAndRemarksLayout(
  showRemarksFullWidth: boolean,
  showRemarksBesideScope: boolean,
  content: AgreementFormLayoutContent,
): ReactNode {
  const {
    agreementBasicDetailsSection,
    agreementTermsSection,
    applicableScopeSection,
    agreementDocumentSection,
    remarksSection,
    formRowGridClass,
    hideApplicableScopeSection,
  } = content;

  if (showRemarksFullWidth) {
    return (
      <>
        <div className={formRowGridClass}>
          <div className="space-y-1.5">
            {agreementBasicDetailsSection}
            {agreementTermsSection}
            {!hideApplicableScopeSection ? applicableScopeSection : null}
          </div>
          <div className="space-y-1.5">{agreementDocumentSection}</div>
        </div>
        {remarksSection}
      </>
    );
  }

  if (showRemarksBesideScope && !hideApplicableScopeSection) {
    return (
      <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2 lg:items-stretch">
        <div className="space-y-1.5">
          {agreementBasicDetailsSection}
          {agreementTermsSection}
          {applicableScopeSection}
        </div>
        <div className="flex flex-col gap-1.5">
          {agreementDocumentSection}
          <div className="mt-auto">{remarksSection}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={formRowGridClass}>
      <div className="space-y-1.5">
        {agreementBasicDetailsSection}
        {agreementTermsSection}
        {!hideApplicableScopeSection ? applicableScopeSection : null}
        {remarksSection}
      </div>
      <div className="space-y-1.5">{agreementDocumentSection}</div>
    </div>
  );
}

export function AgreementFormEdit({
  variant = "hospital",
  mode = "create",
  logic,
  providerId,
  agreementDocumentViewUrl,
  supportingDocumentViewUrl,
  onAgreementFileChange,
  onPpnValidationChange,
  agreementNameOptions,
  disableAgreementName,
}: Readonly<AgreementFormEditProps>) {
  const { t } = useTranslation();
  const isHospital = isHospitalLogic(variant, logic);
  const hospitalLogic = isHospital ? logic : null;

  const {
    form,
    insurerIcLoading,
    effectiveFromWatch,
    effectiveToWatch,
    applicableScope,
    agreementName,
    nameFlags,
    agreementDocumentEnabled,
    effectiveIcOptions,
    scopeRadioOptions,
    showSelectedIcScopeUi,
    selectedIcInvolvementRows,
    isScopeOptionDisabled,
    agreementDurationDaysRegister,
    durationEditingRef,
    applyAgreementDurationToDates,
    clearDurationApplyTimer,
    scheduleAgreementDurationApply,
  } = logic;

  const documentUploadEnabled =
    mode === "create" || mode === "edit" || agreementDocumentEnabled;

  const selectedIcLabelList = isHospital
    ? []
    : (logic as StandaloneAgreementFormLogic).selectedIcLabelList;

  const {
    register,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors, touchedFields, isSubmitted },
  } = form as UseFormReturn<AgreementFullFormValues>;

  const watchedSignatoryName = watch("providerSignatoryName");
  const watchedSignatoryDesignation = watch("providerSignatoryDesignation");
  const watchedDurationDays = watch("agreementDurationDays");
  const empanelmentDateWatch = watch("empanelmentDate");

  const [signatoryNameInputError, setSignatoryNameInputError] = useState("");
  const [signatoryDesignationInputError, setSignatoryDesignationInputError] =
    useState("");
  const [durationDaysInputError, setDurationDaysInputError] = useState("");

  useEffect(() => {
    const fieldErrors = syncAgreementSignatoryFieldErrors(
      (form as UseFormReturn<AgreementFullFormValues>).getValues(),
      { touchedFields, showRequiredErrors: isSubmitted },
    );
    setSignatoryNameInputError(fieldErrors.providerSignatoryName);
    setSignatoryDesignationInputError(fieldErrors.providerSignatoryDesignation);
    setDurationDaysInputError(fieldErrors.agreementDurationDays);
  }, [
    form,
    isSubmitted,
    touchedFields,
    watchedSignatoryName,
    watchedSignatoryDesignation,
    watchedDurationDays,
  ]);

  const fieldError = useCallback(
    (name: keyof AgreementFullFormValues) =>
      resolveVisibleFieldError(errors, touchedFields, isSubmitted, name),
    [errors, touchedFields, isSubmitted],
  );

  const dropdownFieldError = useCallback(
    (name: keyof AgreementFullFormValues) =>
      resolveVisibleDropdownError(errors, touchedFields, isSubmitted, name),
    [errors, touchedFields, isSubmitted],
  );

  const standaloneControl = control as unknown as Control<StandaloneAgreementFormValues>;
  const [agreementDocumentTypeError, setAgreementDocumentTypeError] = useState("");
  const [supportingDocumentTypeError, setSupportingDocumentTypeError] = useState("");

  const { isGicStandard, selectedIcSingleMode } = nameFlags;

  const hideScopeIcList = shouldHideScopeIcList(
    mode,
    nameFlags,
    selectedIcInvolvementRows.rows.length,
  );
  const hideApplicableScopeSection = shouldHideApplicableScopeSection(
    mode,
    nameFlags,
    agreementName,
  );
  const showRemarksFullWidth = shouldShowRemarksFullWidth(nameFlags);
  const showRemarksBesideScope =
    !showRemarksFullWidth && shouldShowRemarksBesideApplicableScope(nameFlags);

  const handleRemoveGicIc = useCallback(
    (insurerId: string) => {
      if (!insurerId || insurerId.startsWith("all-")) return;
      const currentIds = (getValues("selectedIcIds") ?? []).filter(Boolean);
      const nextIds = currentIds.filter((id) => id !== insurerId);
      setValue("selectedIcIds", nextIds, { shouldDirty: true, shouldValidate: true });

      const rawInvolvement = String(getValues("selectedIcInvolvementJson") ?? "");
      if (!rawInvolvement.trim()) return;
      try {
        const parsed = JSON.parse(rawInvolvement) as unknown;
        if (!Array.isArray(parsed)) return;
        const nextInvolvement = parsed.filter((item) => {
          if (!item || typeof item !== "object") return false;
          return String((item as { insurerId?: unknown }).insurerId ?? "") !== insurerId;
        });
        setValue("selectedIcInvolvementJson", JSON.stringify(nextInvolvement), {
          shouldDirty: true,
        });
      } catch {
        // Keep existing involvement json if parsing fails.
      }
    },
    [getValues, setValue],
  );

  const allowGicIcRemoval = mode === "edit" && isGicStandard;

  const termsSectionGridClass = "grid-cols-1 sm:grid-cols-2";
  // Span full parent width — without this, PPN sits in one cell and leaves an empty gap.
  const termsPpnRowClass =
    "col-span-full grid min-w-0 grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-2";
  const formRowGridClass = "grid grid-cols-1 gap-1.5 lg:grid-cols-2 lg:items-start";
  const basicFieldsGridClass =
    "grid grid-cols-1 gap-x-3 gap-y-1.5 px-3 py-1.5 sm:grid-cols-2";

  const durationInput = buildAgreementDurationInput({
    t,
    agreementDurationDaysRegister,
    durationEditingRef,
    scheduleAgreementDurationApply,
    clearDurationApplyTimer,
    applyAgreementDurationToDates,
    error: durationDaysInputError,
  });

  const scopeIcDropdown = buildScopeIcDropdown({
    t,
    showSelectedIcScopeUi,
    applicableScope,
    selectedIcSingleMode,
    control: control as Control<AgreementFullFormValues>,
    effectiveIcOptions,
    dropdownFieldError,
    insurerIcLoading,
    isGicStandard,
    isHospital,
    setValue,
  });

  const involvementTable = buildInvolvementTable({
    t,
    selectedIcInvolvementRows,
    effectiveFromWatch,
    onRemoveIc: allowGicIcRemoval ? handleRemoveGicIc : undefined,
  });

  const remarksSection = (
    <AgreementFormSection
      title={t("providerMaster.agreement.sections.remarks")}
      variant={variant}
    >
      <div className="px-3 py-1.5">
        <Textarea
          label={t("providerMaster.agreement.fields.remarks")}
          rows={2}
          placeholder={t("providerMaster.agreement.fields.enterRemarks")}
          isRequired
          error={fieldError("remarks")}
          {...register("remarks")}
          className="w-full resize-y rounded-md text-xs"
        />
      </div>
    </AgreementFormSection>
  );

  const applicableScopeSection = (
    <AgreementFormSection
      title={t("providerMaster.agreement.sections.scope")}
      variant={variant}
    >
      <AgreementScopeFields
        isHospital={isHospital}
        applicableScope={applicableScope}
        register={register}
        scopeRadioOptions={scopeRadioOptions}
        showSelectedIcScopeUi={showSelectedIcScopeUi}
        scopeIcDropdown={scopeIcDropdown}
        involvementTable={involvementTable}
        selectedIcLabelList={selectedIcLabelList}
        selectedIcInvolvementRows={selectedIcInvolvementRows}
        isScopeOptionDisabled={isScopeOptionDisabled}
        hideScopeIcList={hideScopeIcList}
        onRemoveIc={allowGicIcRemoval ? handleRemoveGicIc : undefined}
      />
    </AgreementFormSection>
  );

  const agreementTermsSection = (
    <AgreementFormSection
      title={t("providerMaster.agreement.sections.terms")}
      variant={variant}
    >
      <div className={`grid gap-x-3 gap-y-1.5 px-3 py-1.5 ${termsSectionGridClass}`}>
        <div className="min-w-0">
          <ProviderDatePicker
            label={t(resolveEmpanelmentDateLabelKey(nameFlags))}
            control={control}
            name="empanelmentDate"
            isRequired
            disabled={shouldDisableEmpanelmentDateEditing(mode)}
            max={
              effectiveFromWatch?.trim()
                ? effectiveFromWatch.slice(0, 10)
                : undefined
            }
            error={fieldError("empanelmentDate")}
            className="h-8 min-w-0 rounded-md text-xs"
          />
        </div>
        <div className="min-w-0">
          <ProviderDatePicker
            label={t("providerMaster.agreement.fields.signAgreementSentDate")}
            control={control}
            name="signAgreementSentDate"
            className="h-8 min-w-0 rounded-md text-xs"
          />
        </div>
        <AgreementTermsPpnInfraFields
          control={control as Control<AgreementFullFormValues>}
          errors={errors}
          getFieldError={fieldError}
          flags={nameFlags}
          mode={mode}
          providerId={providerId}
          setValue={setValue}
          getValues={getValues}
          onPpnValidationChange={onPpnValidationChange}
          agreementTermsPpnRowClass={termsPpnRowClass}
        />
      </div>
    </AgreementFormSection>
  );

  const agreementDocumentSection = (
    <AgreementFormSection
      title={t("providerMaster.agreement.sections.document")}
      variant={variant}
    >
      <div className="space-y-1.5 px-3 py-1.5">
        <div className="grid grid-cols-1 gap-x-3 gap-y-1.5 md:grid-cols-2">
        <ProviderDatePicker
            label={t("providerMaster.agreement.fields.effectiveFrom")}
            control={control}
            name="effectiveFrom"
            isRequired
            min={
              empanelmentDateWatch?.trim()
                ? empanelmentDateWatch.slice(0, 10)
                : undefined
            }
            max={effectiveToWatch?.trim() ? effectiveToWatch.slice(0, 10) : undefined}
            error={fieldError("effectiveFrom")}
            className="h-8 rounded-md text-xs"
          />
          <ProviderDatePicker
            label={t("providerMaster.agreement.fields.effectiveTo")}
            control={control}
            name="effectiveTo"
            min={effectiveFromWatch?.trim() ? effectiveFromWatch.slice(0, 10) : undefined}
            className="h-8 rounded-md text-xs"
          />
          <div className="min-w-0">
            
            <DropdownSelect
              label={t("providerMaster.agreement.fields.agreementCopyAvailable")}
              name="agreementCopyAvailable"
              name_key="agreementCopyAvailable"
              control={control as Control<AgreementFullFormValues>}
              options={AGREEMENT_FORM_YES_NO}
              defaultValue={t("providerMaster.agreement.fields.select")}
              errors={dropdownFieldError("agreementCopyAvailable")}
              formClassName={variant === "standalone" ? "min-w-0" : undefined}
              className="h-8 rounded-md text-xs"
            />
          </div>
          {durationInput}
          
          <Input
            label={t("providerMaster.agreement.fields.providerSignatoryName")}
            {...register("providerSignatoryName")}
            error={signatoryNameInputError}
            className="h-8 min-w-0 rounded-md text-xs"
          />
          <Input
            label={t("providerMaster.agreement.fields.providerSignatoryDesignation")}
            {...register("providerSignatoryDesignation")}
            error={signatoryDesignationInputError}
            className="h-8 min-w-0 rounded-md text-xs"
          />
        </div>
        <div className="grid grid-cols-1 gap-x-3 gap-y-1.5 md:grid-cols-2 md:items-start">
          {buildAgreementDocumentUploadSection({
            t,
            isHospital,
            hospitalLogic,
            form: form as UseFormReturn<AgreementFullFormValues>,
            providerId,
            agreementDocumentViewUrl,
            supportingDocumentViewUrl,
            documentUploadEnabled,
            agreementDocumentEnabled,
            control: control as Control<AgreementFullFormValues>,
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
          })}
        </div>
      </div>
    </AgreementFormSection>
  );

  const agreementBasicDetailsSection = (
    <AgreementFormSection
      title={t("providerMaster.agreement.sections.basicDetails")}
      variant={variant}
    >
      <AgreementBasicFields
        control={control as Control<AgreementFullFormValues>}
        errors={errors}
        dropdownFieldError={dropdownFieldError}
        variant={variant}
        mode={mode}
        agreementNameOptions={agreementNameOptions}
        disableAgreementName={disableAgreementName}
        fieldsGridClassName={basicFieldsGridClass}
      />
    </AgreementFormSection>
  );

  const scopeAndRemarksSections = renderAgreementScopeAndRemarksLayout(
    showRemarksFullWidth,
    showRemarksBesideScope,
    {
      agreementBasicDetailsSection,
      agreementTermsSection,
      applicableScopeSection,
      agreementDocumentSection,
      remarksSection,
      formRowGridClass,
      hideApplicableScopeSection,
    },
  );

  return (
    <div className={variant === "standalone" ? "space-y-1.5 pb-4" : "space-y-1.5"}>
      {isHospital ? <input type="hidden" {...register("selectedIcInvolvementJson")} /> : null}
      {scopeAndRemarksSections}
    </div>
  );
}

export type AgreementFormContentProps = {
  form: UseFormReturn<AgreementFullFormValues>;
  readOnly: boolean;
  providerId?: string;
  providerDisplay: string;
  tpaDisplay: string;
  pdfUrl?: string;
  supportingPdfUrl?: string;
  onViewDocument?: () => void;
  onDownloadDocument?: () => void;
  onViewSupportingDocument?: () => void;
  onDownloadSupportingDocument?: () => void;
  onAgreementFileChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function AgreementFormContent({
  form,
  readOnly,
  providerId,
  pdfUrl,
  supportingPdfUrl,
  onViewDocument,
  onDownloadDocument,
  onViewSupportingDocument,
  onDownloadSupportingDocument,
  onAgreementFileChange,
}: Readonly<AgreementFormContentProps>) {
  const logic = useAgreementFormLogic(form);

  if (readOnly) {
    return (
      <AgreementFormView
        logic={logic}
        values={logic.watched}
        onViewDocument={onViewDocument}
        onDownloadDocument={onDownloadDocument}
        onViewSupportingDocument={onViewSupportingDocument}
        onDownloadSupportingDocument={onDownloadSupportingDocument}
      />
    );
  }

  return (
    <AgreementFormEdit
      logic={logic}
      providerId={providerId}
      mode="edit"
      agreementDocumentViewUrl={pdfUrl}
      supportingDocumentViewUrl={supportingPdfUrl}
      onAgreementFileChange={onAgreementFileChange}
    />
  );
}
