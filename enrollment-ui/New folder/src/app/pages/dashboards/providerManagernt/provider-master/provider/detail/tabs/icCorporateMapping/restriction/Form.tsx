import type { FieldErrors, UseFormReturn } from "react-hook-form";

import DropdownSelect from "@/components/shared/form/DropdownSelect";

import { Checkbox, Textarea } from "@/components/ui";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import {

    RESTRICTION_LEVEL_OPTIONS,

    RESTRICTION_TYPE_OPTIONS,

} from "./config";

import type { ItemWithIdName, RestrictionDetailsState, RestrictionFormValues } from "../types";

import {
    RestrictionApplicableFields,
    RestrictionMultiValueField,
    RestrictionPolicyNumberField,
    RestrictionSupportingDocumentField,
} from "./Fields";

const RESTRICTION_FIELD_LABEL_CLASS = "input-label block font-medium text-black";

const RESTRICTION_FIELD_WRAPPER_CLASS = "mt-[3px]";

const RESTRICTION_CONTROL_HEIGHT_CLASS = "h-8 rounded-md text-xs";

const RESTRICTION_CHECKBOX_LABEL_CLASS = "!text-[11px] font-normal text-black";

function resolveRestrictionCheckboxVisibility(params: {
    showRestrictionType: boolean;
    selectedRestrictionType: string;
    showRohDropdown: boolean;
    showCorporateDropdown: boolean;
    showPolicyNumbersField: boolean;
    showCcnNumbersField: boolean;
    showBlacklistCheckboxes: boolean;
}) {
    const isWatchlistType = params.selectedRestrictionType === "Watchlist";
    const showInvestigationRequired = params.showRestrictionType && isWatchlistType;
    const showEmergencyException =
        params.showRohDropdown ||
        params.showCorporateDropdown ||
        params.showPolicyNumbersField ||
        params.showCcnNumbersField ||
        (params.showRestrictionType && (isWatchlistType || params.showBlacklistCheckboxes));

    return {
        showInvestigationRequired,
        showEmergencyException,
        showRestrictionCheckboxGroup: showInvestigationRequired || showEmergencyException,
    };
}

type RestrictionCheckboxOption = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

type RestrictionCheckboxGroupProps = {
    options: RestrictionCheckboxOption[];
    disabled?: boolean;
    className?: string;
    /** When nested under another field, skip the invisible label spacer. */
    nested?: boolean;
};

/** Watchlist/blacklist flags in one field-style box, stacked vertically. */
function RestrictionCheckboxGroup({
    options,
    disabled = false,
    className,
    nested = false,
}: Readonly<RestrictionCheckboxGroupProps>) {
    if (options.length === 0) return null;

    return (
        <div className={className}>
            {!nested ? (
                <span className={`${RESTRICTION_FIELD_LABEL_CLASS} invisible select-none`} aria-hidden="true">
                    Flags
                </span>
            ) : null}
            <div
                className={`${RESTRICTION_FIELD_WRAPPER_CLASS} ${RESTRICTION_CONTROL_HEIGHT_CLASS} flex w-full items-center gap-4 border border-slate-300 bg-white px-3`}
            >
                {options.map((option) => (
                    <Checkbox
                        key={option.label}
                        checked={option.checked}
                        onChange={(event) => option.onChange(event.target.checked)}
                        disabled={disabled}
                        label={option.label}
                        classNames={{
                            label: "cursor-pointer gap-2 !text-[11px] font-normal",
                            labelText: RESTRICTION_CHECKBOX_LABEL_CLASS,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

type IcRestrictionCreateFormProps = {

    providerId?: string;

    restrictionForm: UseFormReturn<RestrictionFormValues>;

    restrictionFormErrors: FieldErrors<RestrictionFormValues>;

    restrictionDetails: RestrictionDetailsState;

    setRestrictionDetails: React.Dispatch<React.SetStateAction<RestrictionDetailsState>>;

    effectiveFromError: string;

    setEffectiveFromError: (v: string) => void;

    remarkError?: string;

    setRemarkError?: (v: string) => void;

    supportingDocumentError?: string;

    setSupportingDocumentError?: (v: string) => void;

    insurerOptions: { value?: string; label?: string }[];

    insuranceCompanies: ItemWithIdName[];

    selectedIcId: string;

    selectedRestrictionLevel: string;

    selectedRestrictionType: string;

    showRestrictionType: boolean;

    showBlacklistCheckboxes: boolean;

    showCorporateDropdown: boolean;

    showRohDropdown: boolean;

    showPolicyNumbersField: boolean;

    showCcnNumbersField: boolean;

    applicableDisabled: boolean;

    restrictionApplicableOptions: { label: string; value: string }[];

    applicableError?: string;

    corporateList: { value?: string; label?: string }[];

    rohOfficeOptions: { label: string; value: string }[];

    icPrefilledFromRow?: boolean;

    isExistingRestriction?: boolean;

    isViewMode?: boolean;

    saving: boolean;

    removing?: boolean;

};



export function IcRestrictionCreateForm({

    providerId,

    restrictionForm,

    restrictionFormErrors,

    restrictionDetails,

    setRestrictionDetails,

    effectiveFromError,

    setEffectiveFromError,

    remarkError = "",

    setRemarkError,

    supportingDocumentError = "",

    setSupportingDocumentError,

    insurerOptions,

    insuranceCompanies,

    selectedIcId,

    selectedRestrictionLevel,

    selectedRestrictionType,

    showRestrictionType,

    showBlacklistCheckboxes,

    showCorporateDropdown,

    showRohDropdown,

    showPolicyNumbersField,

    showCcnNumbersField,

    applicableDisabled,

    restrictionApplicableOptions,

    applicableError,

    corporateList,

    rohOfficeOptions,

    icPrefilledFromRow = false,

    isExistingRestriction = false,

    isViewMode = false,

    saving,

    removing = false,

}: Readonly<IcRestrictionCreateFormProps>) {

    const icOptions =

        insurerOptions.length > 0

            ? insurerOptions

            : insuranceCompanies.map((ic) => ({ value: ic.id, label: ic.name }));

    const hasRestrictionLevel = Boolean(selectedRestrictionLevel?.trim());
    const hasRestrictionType = Boolean(selectedRestrictionType?.trim());
    const investigationRequired = restrictionForm.watch("investigationRequired");
    const emergencyExceptionAllowed = restrictionForm.watch("emergency_exception_allowed_flag");
    const fieldDisabled = isViewMode || saving || removing;
    const showRestrictionApplicableField =
        hasRestrictionLevel && (!showRestrictionType || hasRestrictionType);
    const restrictionApplicableDisabled =
        applicableDisabled ||
        fieldDisabled ||
        !selectedIcId ||
        (showRestrictionType && !hasRestrictionType);

    const icLocked = isViewMode || icPrefilledFromRow || saving || removing;
    const restrictionLevelDisabled = fieldDisabled || isExistingRestriction;
    const { showInvestigationRequired, showEmergencyException, showRestrictionCheckboxGroup } =
        resolveRestrictionCheckboxVisibility({
            showRestrictionType,
            selectedRestrictionType,
            showRohDropdown,
            showCorporateDropdown,
            showPolicyNumbersField,
            showCcnNumbersField,
            showBlacklistCheckboxes,
        });
    return (
        <div className="flex min-h-0 flex-col">
            <div className="grid grid-cols-1 items-start gap-x-3 gap-y-2 md:grid-cols-2 xl:grid-cols-4">

                <DropdownSelect
                    label="Restriction Level"
                    name_key="restrictionLevel"
                    defaultValue="Select"
                    options={RESTRICTION_LEVEL_OPTIONS}
                    control={restrictionForm.control}
                    rules={{ required: "Restriction Level is required" }}
                    name="restrictionLevel"
                    errors={restrictionFormErrors.restrictionLevel}
                    className="h-8 rounded-md text-xs"
                    isRequired
                    disabled={restrictionLevelDisabled}
                />

                <DropdownSelect
                    label="Insurance Company"
                    name_key="restrictionIcName"
                    defaultValue="Select Company"
                    options={icOptions}
                    control={restrictionForm.control}
                    rules={{ required: "Insurance Company is required" }}
                    name="icName"
                    errors={restrictionFormErrors.icName}
                    className="h-8 rounded-md text-xs"
                    isRequired
                    disabled={!hasRestrictionLevel || icLocked}
                />

                {showCorporateDropdown ? (
                    <DropdownSelect
                        label="Corporate Name"
                        name_key="restrictionCorporateName"
                        defaultValue="Select Corporate"
                        options={corporateList}
                        control={restrictionForm.control}
                        rules={{
                            validate: (value: string[] | undefined) =>
                                Array.isArray(value) && value.some((id) => String(id).trim() !== "")
                                    ? true
                                    : "Corporate is required",
                        }}
                        name="corporateIds"
                        errors={restrictionFormErrors.corporateIds}
                        className="min-h-8 rounded-md text-xs"
                        isRequired
                        multiselect
                        multiselectHorizontalScroll
                        is_select_checkbox
                        disabled={fieldDisabled || !selectedIcId}
                        setValue={restrictionForm.setValue}
                    />

                ) : null}

                {showRohDropdown ? (
                    <DropdownSelect
                        label="RO Office"
                        name_key="restrictionRohOffice"
                        defaultValue="Select RO Office"
                        options={rohOfficeOptions}
                        control={restrictionForm.control}
                        rules={{
                            validate: (value: string[] | undefined) =>
                                Array.isArray(value) && value.some((id) => String(id).trim() !== "")
                                    ? true
                                    : "RO Office is required",
                        }}
                        name="rohOfficeIds"
                        errors={restrictionFormErrors.rohOfficeIds}
                        className="min-h-8 rounded-md text-xs"
                        isRequired
                        multiselect
                        multiselectHorizontalScroll
                        is_select_checkbox
                        disabled={fieldDisabled || !selectedIcId}
                        setValue={restrictionForm.setValue}
                    />
                ) : null}
                {showPolicyNumbersField ? (
                    <RestrictionPolicyNumberField
                        control={restrictionForm.control}
                        insurerId={selectedIcId}
                        errors={restrictionFormErrors}
                        disabled={fieldDisabled || !selectedIcId}
                    />
                ) : null}
                {showCcnNumbersField ? (
                    <RestrictionMultiValueField
                        control={restrictionForm.control}
                        name="ccnNumbers"
                        label="CCN Number"
                        placeholder="Type CCN number and press Enter"
                        errors={restrictionFormErrors}
                        disabled={fieldDisabled || !selectedIcId}
                    />
                ) : null}
                {showRestrictionType ? (
                    <DropdownSelect
                        label="Restriction Type"
                        name_key="restrictionType"
                        defaultValue="Select"
                        options={RESTRICTION_TYPE_OPTIONS}
                        control={restrictionForm.control}
                        rules={{ required: "Restriction type is required" }}
                        name="restrictionType"
                        errors={restrictionFormErrors.restrictionType}
                        className="h-8 rounded-md text-xs"
                        isRequired
                        disabled={fieldDisabled}
                    />

                ) : null}

                {showRestrictionApplicableField ? (
                    <RestrictionApplicableFields
                        restrictionForm={restrictionForm}
                        restrictionType={selectedRestrictionType}
                        applicableError={applicableError}
                        disabled={restrictionApplicableDisabled}
                        options={restrictionApplicableOptions}
                    />
                ) : null}

                <ProviderDatePicker
                    label="Effective From"
                    value={restrictionDetails.effectiveFrom}
                    isRequired
                    className={`${RESTRICTION_CONTROL_HEIGHT_CLASS} !h-8 text-xs`}
                    onChange={(e) => {
                        setRestrictionDetails((p) => ({ ...p, effectiveFrom: e.target.value }));
                        if (e.target.value) setEffectiveFromError("");
                    }}
                    error={effectiveFromError}
                    disabled={fieldDisabled}
                />

                {showRestrictionCheckboxGroup ? (
                    <div className="flex min-w-0 flex-col">
                        <RestrictionCheckboxGroup
                            disabled={fieldDisabled}
                            options={[
                                ...(showInvestigationRequired
                                    ? [
                                        {
                                            label: "Investigation required",
                                            checked: investigationRequired,
                                            onChange: (checked: boolean) =>
                                                restrictionForm.setValue("investigationRequired", checked, {
                                                    shouldDirty: true,
                                                }),
                                        },
                                    ]
                                    : []),
                                ...(showEmergencyException
                                    ? [
                                        {
                                            label: "Emergency Exception",
                                            checked: emergencyExceptionAllowed,
                                            onChange: (checked: boolean) =>
                                                restrictionForm.setValue("emergency_exception_allowed_flag", checked, {
                                                    shouldDirty: true,
                                                }),
                                        },
                                    ]
                                    : []),
                            ]}
                        />
                    </div>
                ) : null}

                <div className="min-w-0 xl:col-span-1">
                    <RestrictionSupportingDocumentField
                        providerId={providerId}
                        restrictionDetails={restrictionDetails}
                        setRestrictionDetails={setRestrictionDetails}
                        disabled={fieldDisabled}
                        isRequired
                        error={supportingDocumentError}
                        onErrorClear={() => setSupportingDocumentError?.("")}
                    />
                </div>

                <div className="min-w-0 md:col-span-2 xl:col-span-4">
                    <Textarea
                        label="Remark"
                        value={restrictionDetails.remark}
                        onChange={(e) => {
                            setRestrictionDetails((p) => ({ ...p, remark: e.target.value }));
                            if (e.target.value.trim()) setRemarkError?.("");
                        }}
                        rows={2}
                        placeholder="Enter Remarks"
                        disabled={fieldDisabled}
                        isRequired
                        error={remarkError || undefined}
                        classNames={{
                            root: "!min-h-0",
                            label: RESTRICTION_FIELD_LABEL_CLASS,
                            labelText: "input-label flex",
                            wrapper: RESTRICTION_FIELD_WRAPPER_CLASS,
                            input: "rounded-sm text-xs !resize-y",
                        }}
                    />
                </div>

            </div>

        </div>

    );

}


