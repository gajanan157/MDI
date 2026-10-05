import { RefObject, useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useForm, UseFormReturn } from "react-hook-form";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Checkbox } from "@/components/ui";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import { formatAgreementNameForDisplay } from "../../../../shared/agreementTypeChip.helpers";
import type { SocAgreementNavigationPayload, SocAgreementNavInsurerMapping } from "../utils/socConfig";
import { getAgreementNameFlags, isSocIcSelectionOptional, normalizeAgreementNameKey, type AgreementListRow } from "../../../agreement/utils/agreementHelpers";
import { useProviderAgreementList } from "../../../agreement/hooks/useProviderAgreementList";
import type { SocApplicableIc, SocGipsaSocVariant, SocVersionItem } from "../data/socListData";
import { useSocCorporateOptions } from "../hooks/socTabHooks";
import type { SocCorporateSelection } from "../utils/socAgreementCorporateRules";
import {
  getSocDateRangeError,
  isSocCorporateEligible,
  mapInsurerMappingsToDropdownOptions,
  collectInsurerMappingsForSelectedAgreement,
  shouldShowSocDetailsInsurerDropdown,
} from "../utils/socAgreementCorporateRules";
import {
    getSocDetailFieldClass,
    getSocDetailFieldsGridClass,
    getSocSecondRowColSpans,
    SOC_DETAIL_BODY_PADDING,
    SOC_DETAIL_FIELD_LABEL_CLASS,
    SOC_DETAIL_GRID_CLASS,
    SOC_DETAIL_ROW_CARD_BODY_CLASS,
    SOC_DETAIL_ROW_CARD_CLASS,
} from "../utils/socDetailTheme";
import { SocDetailViewFields } from "./SocDetailTable";
import { SocApplicableIcSection } from "./SocApplicableIcSection";
import { SocDocumentUploadPanel } from "./SocDocumentUploadPanel";
import { SocIconCard } from "./SocIconCard";
import { SocVersionHistoryCard } from "./SocVersionHistoryCard";

const EMPTY_PROVIDER_AGREEMENT_FILTERS = {
    agreementType: "",
    scope: "",
    status: "",
} as const;

function formatProviderAgreementOptionLabel(row: AgreementListRow): {
    label: ReactNode;
    searchText: string;
} {
    const baseLabel = formatAgreementNameForDisplay(row.agreementName);
    if (!getAgreementNameFlags(row.agreementName).isInsurerBipartite) {
        return { label: baseLabel, searchText: baseLabel };
    }

    const icNames = (row.insurerMappings ?? [])
        .map((mapping) => String(mapping.insurerName ?? "").trim())
        .filter(Boolean);
    if (icNames.length === 0) {
        return { label: baseLabel, searchText: baseLabel };
    }

    const icLabel = icNames.join(", ");
    return {
        label: (
            <span className="inline-flex max-w-full flex-wrap items-baseline gap-x-1 leading-tight">
                <span className="text-[10px] font-medium text-primary-700">{icLabel}</span>
                <span className="text-[11px] font-normal text-slate-700">{baseLabel}</span>
            </span>
        ),
        searchText: `${icLabel} ${baseLabel}`,
    };
}

const SOC_FIELD_CONTROL_CLASS = "h-[30px] w-full text-xs";

function resolveSocSelectedAgreementId(
    agreementName: string,
    rows: AgreementListRow[],
    selectedApplicableIcIds: string[],
): string {
    const trimmed = agreementName.trim();
    if (!trimmed) return "";

    const nameMatches = rows.filter(
        (row) => String(row.agreementName ?? "").trim() === trimmed,
    );
    if (nameMatches.length === 0) return "";
    if (nameMatches.length === 1) return nameMatches[0]?.id ?? "";

    const selectedIcIds = new Set(
        selectedApplicableIcIds.map((id) => id.trim()).filter(Boolean),
    );
    if (selectedIcIds.size > 0) {
        const byIc = nameMatches.find((row) =>
            (row.insurerMappings ?? []).some((mapping) =>
                selectedIcIds.has(String(mapping.insurerId ?? "").trim()),
            ),
        );
        if (byIc?.id) return byIc.id;
    }

    return nameMatches[0]?.id ?? "";
}

function mapAgreementRowInsurerMappings(row: AgreementListRow) {
    return (row.insurerMappings ?? []).map((mapping) => ({
        insurerId: String(mapping.insurerId ?? "").trim(),
        insurerName: mapping.insurerName?.trim() || undefined,
        mappingEffectiveFrom: mapping.mappingEffectiveFrom?.trim() || undefined,
    }));
}

function buildSiblingAgreementMappingRows(rows: AgreementListRow[]) {
    return rows.map((item) => ({
        agreementName: String(item.agreementName ?? "").trim(),
        insurerMappings: mapAgreementRowInsurerMappings(item),
        agreementEffectiveFrom:
            String(item.effectiveFromDisplay ?? "").trim() || undefined,
    }));
}

function rehydrateAgreementMappingsFromList(args: {
    isSocViewMode: boolean;
    agreementName: string;
    agreementInsurerMappingsLength: number;
    rows: AgreementListRow[];
    selectedAgreementId: string;
    applyAgreementNameFromNavigation: (
        payload: string | SocAgreementNavigationPayload,
    ) => void;
}): void {
    if (args.isSocViewMode) return;
    const trimmed = args.agreementName.trim();
    if (!trimmed) return;
    if (args.agreementInsurerMappingsLength > 0) return;
    if (args.rows.length === 0) return;

    const nameMatches = args.rows.filter((row) => {
        const rowName = String(row.agreementName ?? "").trim();
        return (
            rowName === trimmed ||
            normalizeAgreementNameKey(rowName) === normalizeAgreementNameKey(trimmed)
        );
    });
    if (nameMatches.length === 0) return;

    const selectedRow =
        nameMatches.find((row) => row.id === args.selectedAgreementId) ??
        nameMatches[0];
    if (!selectedRow) return;

    const insurerMappings = collectInsurerMappingsForSelectedAgreement({
        agreementName: trimmed,
        selectedRowMappings: mapAgreementRowInsurerMappings(selectedRow),
        siblingRows: buildSiblingAgreementMappingRows(args.rows),
    });
    if (insurerMappings.length === 0) return;

    args.applyAgreementNameFromNavigation({
        agreementName: trimmed,
        insurerMappings,
    });
}

function buildAgreementDropdownOptions(
    rows: AgreementListRow[],
    agreementName: string,
    selectedAgreementId: string,
) {
    const options = rows
        .filter(
            (row) =>
                String(row.id ?? "").trim() && String(row.agreementName ?? "").trim(),
        )
        .map((row) => {
            const formatted = formatProviderAgreementOptionLabel(row);
            return {
                value: row.id,
                label: formatted.label,
                searchText: formatted.searchText,
            };
        });

    if (!agreementName.trim() || selectedAgreementId) return options;

    const fallbackLabel = formatAgreementNameForDisplay(agreementName);
    const alreadyPresent = options.some(
        (option) =>
            option.searchText === fallbackLabel || option.label === fallbackLabel,
    );
    if (!alreadyPresent) {
        options.unshift({
            value: `__selected__:${agreementName}`,
            label: fallbackLabel,
            searchText: fallbackLabel,
        });
    }
    return options;
}

function applyAgreementSelectionFromDropdown(
    value: string | number | (string | number)[],
    rows: AgreementListRow[],
    applyAgreementNameFromNavigation: (
        payload: string | SocAgreementNavigationPayload,
    ) => void,
): void {
    const selectedId = String(
        Array.isArray(value) ? (value[0] ?? "") : (value ?? ""),
    ).trim();
    if (!selectedId) {
        applyAgreementNameFromNavigation({ agreementName: "", insurerMappings: [] });
        return;
    }
    if (selectedId.startsWith("__selected__:")) {
        applyAgreementNameFromNavigation({
            agreementName: selectedId.slice("__selected__:".length),
            insurerMappings: [],
        });
        return;
    }

    const row = rows.find((item) => item.id === selectedId);
    if (!row) {
        applyAgreementNameFromNavigation({ agreementName: "", insurerMappings: [] });
        return;
    }

    const agreementNameValue = String(row.agreementName ?? "").trim();
    applyAgreementNameFromNavigation({
        agreementName: agreementNameValue,
        insurerMappings: collectInsurerMappingsForSelectedAgreement({
            agreementName: agreementNameValue,
            selectedRowMappings: mapAgreementRowInsurerMappings(row),
            siblingRows: buildSiblingAgreementMappingRows(rows),
        }),
    });
}

function resolveSocTabVisibility(args: {
    agreementName: string;
    isCorporateSoc: boolean;
    isSocViewMode: boolean;
    lockApplicableIcsFromAgreement: boolean;
    applicableIcsCount: number;
}) {
    const agreementFlags = getAgreementNameFlags(args.agreementName);
    const icSelectionOptional = isSocIcSelectionOptional(args.agreementName);
    const corporateEligible = isSocCorporateEligible(args.agreementName);
    const showDetailsInsurerDropdown = shouldShowSocDetailsInsurerDropdown(
        args.agreementName,
        args.isCorporateSoc,
    );
    const showCorporateDropdown = corporateEligible && args.isCorporateSoc;
    const agreementDrivenApplicableIcs =
        args.lockApplicableIcsFromAgreement || corporateEligible;
    const showApplicableIcSection =
        corporateEligible ||
        args.isCorporateSoc ||
        !icSelectionOptional ||
        args.applicableIcsCount > 0 ||
        args.lockApplicableIcsFromAgreement;
    const icRequired =
        !agreementDrivenApplicableIcs &&
        (!icSelectionOptional || args.isCorporateSoc);
    const canSelectIc =
        !args.isSocViewMode &&
        showApplicableIcSection &&
        !agreementDrivenApplicableIcs &&
        (args.isCorporateSoc || !agreementFlags.isGipsaPpnTripartite);

    return {
        agreementFlags,
        isGipsaAgreement: agreementFlags.isGipsaPpnTripartite,
        corporateEligible,
        showDetailsInsurerDropdown,
        showCorporateDropdown,
        showApplicableCorporateSection: showCorporateDropdown,
        showApplicableIcSection,
        icRequired,
        canSelectIc,
    };
}

type SocDropdownFormValues = {
    agreementId: string;
    gipsaSocVariant: SocGipsaSocVariant;
    corporateInsurerId: string;
    corporateIds: string[];
};

type SocTabContentProps = {
    socForm: UseFormReturn<{ socVersionId: string }>;
    isSocViewMode: boolean;
    socSideBySide: boolean;
    agreementName: string;
    setAgreementName: (v: string) => void;
    applyAgreementNameFromNavigation: (
        payload: string | SocAgreementNavigationPayload,
    ) => void;
    providerId?: string;
    agreementNameDisabled?: boolean;
    gipsaSocVariant: SocGipsaSocVariant;
    onGipsaSocVariantChange: (variant: SocGipsaSocVariant) => void;
    isCorporateSoc: boolean;
    onIsCorporateSocChange: (checked: boolean) => void;
    selectedCorporateInsurerId: string;
    onSelectedCorporateInsurerIdChange: (insurerId: string) => void;
    onDetailsInsurerChange: (insurerId: string) => void;
    agreementInsurerMappings: SocAgreementNavInsurerMapping[];
    lockApplicableIcsFromAgreement?: boolean;
    selectedCorporates: SocCorporateSelection[];
    onSelectedCorporatesChange: (items: SocCorporateSelection[]) => void;
    socLastUpdatedOn: string;
    setSocLastUpdatedOn: (v: string) => void;
    socStartDate: string;
    setSocStartDate: (v: string) => void;
    socEndDate: string;
    setSocEndDate: (v: string) => void;
    socFileInputRef: RefObject<HTMLInputElement | null>;
    pendingSocDocumentFile: File | null;
    isSavingSocDocument: boolean;
    onSocFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearPendingSocDocument: () => void;
    socVersionHistory: SocVersionItem[];
    selectedSocVersionId: string;
    onSetActiveSocVersion: (item: SocVersionItem) => void;
    onPreviewSocVersion: (item: SocVersionItem) => void;
    canWrite: boolean;
    selectedApplicableIcIds: string[];
    onSelectedApplicableIcIdsChange: (ids: string[]) => void;
    applicableIcsSummary: string;
    applicableIcs: SocApplicableIc[];
    insurerMultiSelectOptions: { value: string; label: string }[];
    psuInsurerOptions: { value: string; label: string }[];
    insurerOptionsLoading?: boolean;
};

export function SocTabContent({
    socForm,
    isSocViewMode,
    socSideBySide,
    agreementName,
    applyAgreementNameFromNavigation,
    providerId,
    agreementNameDisabled = false,
    gipsaSocVariant,
    onGipsaSocVariantChange,
    isCorporateSoc,
    onIsCorporateSocChange,
    selectedCorporateInsurerId,
    onDetailsInsurerChange,
    agreementInsurerMappings,
    lockApplicableIcsFromAgreement = false,
    selectedCorporates,
    onSelectedCorporatesChange,
    socLastUpdatedOn,
    setSocLastUpdatedOn,
    socStartDate,
    setSocStartDate,
    socEndDate,
    setSocEndDate,
    socFileInputRef,
    pendingSocDocumentFile,
    isSavingSocDocument,
    onSocFileSelect,
    onClearPendingSocDocument,
    socVersionHistory,
    selectedSocVersionId,
    onSetActiveSocVersion,
    onPreviewSocVersion,
    canWrite,
    selectedApplicableIcIds,
    onSelectedApplicableIcIdsChange,
    applicableIcsSummary,
    applicableIcs,
    insurerMultiSelectOptions,
    psuInsurerOptions,
    insurerOptionsLoading = false,
}: Readonly<SocTabContentProps>) {
    const { t } = useTranslation();
    const secondRowSpans = getSocSecondRowColSpans();
    const D = "providerMaster.soc.details";
    const AI = "providerMaster.soc.applicableIc";

    const providerAgreements = useProviderAgreementList({
        providerId,
        filters: EMPTY_PROVIDER_AGREEMENT_FILTERS,
    });

    const {
        agreementFlags,
        isGipsaAgreement,
        corporateEligible,
        showDetailsInsurerDropdown,
        showCorporateDropdown,
        showApplicableCorporateSection,
        showApplicableIcSection,
        icRequired,
        canSelectIc,
    } = resolveSocTabVisibility({
        agreementName,
        isCorporateSoc,
        isSocViewMode,
        lockApplicableIcsFromAgreement,
        applicableIcsCount: applicableIcs.length,
    });
    const corporateInsurerId = selectedCorporateInsurerId.trim();
    const agreementInsurerOptions = useMemo(() => {
        const fromAgreement = mapInsurerMappingsToDropdownOptions(agreementInsurerMappings);
        if (fromAgreement.length > 0) return fromAgreement;
        if (applicableIcs.length > 0) {
            return applicableIcs.map((row) => ({
                value: row.insurerId,
                label: row.insurerName || row.insurerId,
            }));
        }
        return psuInsurerOptions.length > 0 ? psuInsurerOptions : insurerMultiSelectOptions;
    }, [
        agreementInsurerMappings,
        applicableIcs,
        insurerMultiSelectOptions,
        psuInsurerOptions,
    ]);
    const dateRangeError = useMemo(
        () => getSocDateRangeError(socStartDate, socEndDate, t),
        [socEndDate, socStartDate, t],
    );
    const editFieldCount =
        (isGipsaAgreement ? 5 : 4) +
        1 +
        (showDetailsInsurerDropdown ? 1 : 0) +
        (showCorporateDropdown ? 1 : 0);
    const fieldsGridClass = getSocDetailFieldsGridClass(editFieldCount);
    const fieldClass = getSocDetailFieldClass();
    const selectedCorporateIds = useMemo(
        () => selectedCorporates.map((item) => item.id),
        [selectedCorporates],
    );

    const { options: corporateOptions } = useSocCorporateOptions({
        enabled: showCorporateDropdown,
        insurerId: corporateInsurerId,
    });

    const selectedAgreementId = useMemo(
        () =>
            resolveSocSelectedAgreementId(
                agreementName,
                providerAgreements.rows,
                selectedApplicableIcIds,
            ),
        [agreementName, providerAgreements.rows, selectedApplicableIcIds],
    );

    const { control, setValue } = useForm<SocDropdownFormValues>({
        defaultValues: {
            agreementId: selectedAgreementId,
            gipsaSocVariant,
            corporateInsurerId: selectedCorporateInsurerId,
            corporateIds: selectedCorporateIds,
        },
    });

    useEffect(() => {
        setValue("agreementId", selectedAgreementId);
    }, [selectedAgreementId, setValue]);

    useEffect(() => {
        setValue("gipsaSocVariant", gipsaSocVariant);
    }, [gipsaSocVariant, setValue]);

    useEffect(() => {
        setValue("corporateInsurerId", selectedCorporateInsurerId);
    }, [selectedCorporateInsurerId, setValue]);

    useEffect(() => {
        setValue("corporateIds", selectedCorporateIds);
    }, [selectedCorporateIds, setValue]);

    useEffect(() => {
        if (!isGipsaAgreement && gipsaSocVariant) {
            onGipsaSocVariantChange("");
        }
    }, [gipsaSocVariant, isGipsaAgreement, onGipsaSocVariantChange]);

    useEffect(() => {
        if (!isCorporateSoc) return;
        if (!corporateInsurerId && selectedCorporates.length > 0) {
            onSelectedCorporatesChange([]);
        }
    }, [
        corporateInsurerId,
        isCorporateSoc,
        onSelectedCorporatesChange,
        selectedCorporates.length,
    ]);

    /**
     * Re-hydrate Applicable ICs from the provider agreement list when the
     * agreement is selected but mappings were empty/missing on first apply
     * (list still loading, nav without mappings, etc.).
     */
    useEffect(() => {
        rehydrateAgreementMappingsFromList({
            isSocViewMode,
            agreementName,
            agreementInsurerMappingsLength: agreementInsurerMappings.length,
            rows: providerAgreements.rows,
            selectedAgreementId,
            applyAgreementNameFromNavigation,
        });
    }, [
        agreementInsurerMappings.length,
        agreementName,
        applyAgreementNameFromNavigation,
        isSocViewMode,
        providerAgreements.rows,
        selectedAgreementId,
    ]);

    const agreementOptions = useMemo(
        () =>
            buildAgreementDropdownOptions(
                providerAgreements.rows,
                agreementName,
                selectedAgreementId,
            ),
        [agreementName, providerAgreements.rows, selectedAgreementId],
    );

    const socTypeOptions = useMemo(
        () => [
            { value: "ppnSoc", label: t(`${AI}.gipsaVariants.ppnSoc`) },
            { value: "nonPpnSoc", label: t(`${AI}.gipsaVariants.nonPpnSoc`) },
        ],
        [AI, t],
    );

    const handleAgreementSelect = (
        value: string | number | (string | number)[],
    ) => {
        applyAgreementSelectionFromDropdown(
            value,
            providerAgreements.rows,
            applyAgreementNameFromNavigation,
        );
    };

    return (
        <>
            <input type="hidden" {...socForm.register("socVersionId")} />
            <div className={`${SOC_DETAIL_BODY_PADDING} space-y-1.5`}>
                <SocIconCard
                    title={t(`${D}.title`)}
                    icon={<CalendarDaysIcon className="h-3.5 w-3.5" aria-hidden />}
                    iconWrapClassName="bg-sky-100 text-sky-700"
                    className={SOC_DETAIL_ROW_CARD_CLASS}
                    bodyClassName={SOC_DETAIL_ROW_CARD_BODY_CLASS}
                >
                    <SocTabDetailsBody
                        isSocViewMode={isSocViewMode}
                        agreementName={agreementName}
                        socStartDate={socStartDate}
                        setSocStartDate={setSocStartDate}
                        socEndDate={socEndDate}
                        setSocEndDate={setSocEndDate}
                        socLastUpdatedOn={socLastUpdatedOn}
                        setSocLastUpdatedOn={setSocLastUpdatedOn}
                        isCorporateSoc={isCorporateSoc}
                        corporateEligible={corporateEligible}
                        isGipsaAgreement={isGipsaAgreement}
                        showDetailsInsurerDropdown={showDetailsInsurerDropdown}
                        showCorporateDropdown={showCorporateDropdown}
                        selectedCorporateInsurerId={selectedCorporateInsurerId}
                        selectedCorporates={selectedCorporates}
                        onSelectedCorporatesChange={onSelectedCorporatesChange}
                        onIsCorporateSocChange={onIsCorporateSocChange}
                        onGipsaSocVariantChange={onGipsaSocVariantChange}
                        onDetailsInsurerChange={onDetailsInsurerChange}
                        agreementNameDisabled={agreementNameDisabled}
                        agreementInsurerOptions={agreementInsurerOptions}
                        psuInsurerOptions={psuInsurerOptions}
                        agreementOptions={agreementOptions}
                        socTypeOptions={socTypeOptions}
                        corporateOptions={corporateOptions}
                        corporateInsurerId={corporateInsurerId}
                        insurerOptionsLoading={insurerOptionsLoading}
                        dateRangeError={dateRangeError}
                        fieldsGridClass={fieldsGridClass}
                        fieldClass={fieldClass}
                        control={control}
                        onAgreementSelect={handleAgreementSelect}
                    />
                </SocIconCard>

                <div
                    className={
                        socSideBySide ? SOC_DETAIL_GRID_CLASS : "grid grid-cols-1 gap-1.5"
                    }
                >
                    <SocVersionHistoryCard
                        versions={socVersionHistory}
                        isSocViewMode={isSocViewMode}
                        activeVersionId={selectedSocVersionId}
                        onSetActiveVersion={onSetActiveSocVersion}
                        onPreviewVersion={onPreviewSocVersion}
                        canWrite={canWrite}
                        className={`${secondRowSpans.versionHistory} ${SOC_DETAIL_ROW_CARD_CLASS}`}
                        uploadPanel={
                            <SocDocumentUploadPanel
                                fileInputRef={socFileInputRef}
                                pendingFile={pendingSocDocumentFile}
                                isSaving={isSavingSocDocument}
                                onFileSelect={onSocFileSelect}
                                onClear={onClearPendingSocDocument}
                            />
                        }
                    />
                    {showApplicableIcSection ? (
                        <div
                            className={`${secondRowSpans.applicableIc} ${SOC_DETAIL_ROW_CARD_CLASS} flex min-h-0 flex-col gap-1.5`}
                        >
                            <SocApplicableIcSection
                                isSocViewMode={isSocViewMode}
                                gipsaSocVariant={gipsaSocVariant}
                                selectedApplicableIcIds={selectedApplicableIcIds}
                                onSelectedApplicableIcIdsChange={onSelectedApplicableIcIdsChange}
                                applicableIcsSummary={applicableIcsSummary}
                                applicableIcs={applicableIcs}
                                corporates={
                                    showApplicableCorporateSection ? selectedCorporates : []
                                }
                                isCorporateMode={showApplicableCorporateSection}
                                insurerOptions={insurerMultiSelectOptions}
                                insurerOptionsLoading={insurerOptionsLoading}
                                canSelectIc={canSelectIc}
                                singleIcMode={agreementFlags.selectedIcSingleMode}
                                icRequired={icRequired}
                                className="min-h-0 flex-1"
                            />
                        </div>
                    ) : (
                        <div className={`${secondRowSpans.applicableIc}`} />
                    )}
                </div>
            </div>
        </>
    );
}

type SocTabDetailsBodyProps = {
    isSocViewMode: boolean;
    agreementName: string;
    socStartDate: string;
    setSocStartDate: (v: string) => void;
    socEndDate: string;
    setSocEndDate: (v: string) => void;
    socLastUpdatedOn: string;
    setSocLastUpdatedOn: (v: string) => void;
    isCorporateSoc: boolean;
    corporateEligible: boolean;
    isGipsaAgreement: boolean;
    showDetailsInsurerDropdown: boolean;
    showCorporateDropdown: boolean;
    selectedCorporateInsurerId: string;
    selectedCorporates: SocCorporateSelection[];
    onSelectedCorporatesChange: (items: SocCorporateSelection[]) => void;
    onIsCorporateSocChange: (checked: boolean) => void;
    onGipsaSocVariantChange: (variant: SocGipsaSocVariant) => void;
    onDetailsInsurerChange: (insurerId: string) => void;
    agreementNameDisabled: boolean;
    agreementInsurerOptions: { value: string; label: string }[];
    psuInsurerOptions: { value: string; label: string }[];
    agreementOptions: { value: string; label: ReactNode; searchText: string }[];
    socTypeOptions: { value: string; label: string }[];
    corporateOptions: { value: string; label: string }[];
    corporateInsurerId: string;
    insurerOptionsLoading: boolean;
    dateRangeError: string | null;
    fieldsGridClass: string;
    fieldClass: string;
    control: UseFormReturn<SocDropdownFormValues>["control"];
    onAgreementSelect: (value: string | number | (string | number)[]) => void;
};

function SocTabDetailsBody({
    isSocViewMode,
    agreementName,
    socStartDate,
    setSocStartDate,
    socEndDate,
    setSocEndDate,
    socLastUpdatedOn,
    setSocLastUpdatedOn,
    isCorporateSoc,
    corporateEligible,
    isGipsaAgreement,
    showDetailsInsurerDropdown,
    showCorporateDropdown,
    selectedCorporateInsurerId,
    selectedCorporates,
    onSelectedCorporatesChange,
    onIsCorporateSocChange,
    onGipsaSocVariantChange,
    onDetailsInsurerChange,
    agreementNameDisabled,
    agreementInsurerOptions,
    psuInsurerOptions,
    agreementOptions,
    socTypeOptions,
    corporateOptions,
    corporateInsurerId,
    insurerOptionsLoading,
    dateRangeError,
    fieldsGridClass,
    fieldClass,
    control,
    onAgreementSelect,
}: Readonly<SocTabDetailsBodyProps>) {
    const { t } = useTranslation();
    const D = "providerMaster.soc.details";

    if (isSocViewMode) {
        return (
            <SocDetailViewFields
                agreementName={agreementName}
                startDate={socStartDate}
                endDate={socEndDate}
                lastUpdatedOn={socLastUpdatedOn}
                showCorporateFields
                showDetailsInsurer={isCorporateSoc && corporateEligible}
                isCorporateSoc={isCorporateSoc && corporateEligible}
                corporateInsurerName={
                    agreementInsurerOptions.find(
                        (row) => row.value === selectedCorporateInsurerId,
                    )?.label ??
                    psuInsurerOptions.find((row) => row.value === selectedCorporateInsurerId)
                        ?.label
                }
                corporateNames={selectedCorporates.map((item) => item.name)}
            />
        );
    }

    return (
        <div className={fieldsGridClass}>
            <div className={fieldClass}>
                <label className={SOC_DETAIL_FIELD_LABEL_CLASS} htmlFor="soc-agreement-name">
                    {t(`${D}.agreementName`)}
                </label>
                <DropdownSelect
                    name="agreementId"
                    name_key="agreementId"
                    control={control}
                    options={agreementOptions}
                    defaultValue={t(`${D}.selectAgreementName`)}
                    formClassName="min-w-0"
                    className={SOC_FIELD_CONTROL_CLASS}
                    disabled={agreementNameDisabled}
                    onChange={onAgreementSelect}
                />
            </div>
            {isGipsaAgreement ? (
                <div className={fieldClass}>
                    <label className={SOC_DETAIL_FIELD_LABEL_CLASS} htmlFor="soc-type">
                        {t(`${D}.ppnVariantLabel`)}
                    </label>
                    <DropdownSelect
                        name="gipsaSocVariant"
                        name_key="gipsaSocVariant"
                        control={control}
                        options={socTypeOptions}
                        defaultValue={t(`${D}.selectSocType`)}
                        formClassName="min-w-0"
                        className={SOC_FIELD_CONTROL_CLASS}
                        onChange={(value) => {
                            onGipsaSocVariantChange(
                                String(value ?? "") as SocGipsaSocVariant,
                            );
                        }}
                    />
                </div>
            ) : null}
            <div className={fieldClass}>
                <label className={SOC_DETAIL_FIELD_LABEL_CLASS} htmlFor="soc-start-date">
                    {t(`${D}.startDate`)}
                    <span className="ms-0.5 text-red-600" aria-hidden="true">
                        *
                    </span>
                </label>
                <ProviderDatePicker
                    id="soc-start-date"
                    value={socStartDate || ""}
                    onChange={(e) => setSocStartDate(e.target.value)}
                    showIcon={false}
                    className={SOC_FIELD_CONTROL_CLASS}
                />
            </div>
            <div className={fieldClass}>
                <label className={SOC_DETAIL_FIELD_LABEL_CLASS} htmlFor="soc-end-date">
                    {t(`${D}.endDate`)}
                </label>
                <ProviderDatePicker
                    id="soc-end-date"
                    value={socEndDate || ""}
                    onChange={(e) => setSocEndDate(e.target.value)}
                    showIcon={false}
                    className={SOC_FIELD_CONTROL_CLASS}
                />
                {dateRangeError ? (
                    <p className="mt-0.5 text-[10px] leading-3 text-red-600" role="alert">
                        {dateRangeError}
                    </p>
                ) : null}
            </div>
            <div className={fieldClass}>
                <label className={SOC_DETAIL_FIELD_LABEL_CLASS} htmlFor="soc-last-updated">
                    {t(`${D}.lastUpdatedOn`)}
                </label>
                <ProviderDatePicker
                    id="soc-last-updated"
                    value={socLastUpdatedOn || ""}
                    onChange={(e) => setSocLastUpdatedOn(e.target.value)}
                    showIcon={false}
                    className={SOC_FIELD_CONTROL_CLASS}
                />
            </div>
            <div className={`${fieldClass} flex flex-col justify-end`}>
                <span className={SOC_DETAIL_FIELD_LABEL_CLASS}>{t(`${D}.corporate`)}</span>
                <label
                    htmlFor="soc-corporate-checkbox"
                    className={`flex h-[30px] items-center gap-2 text-[11px] ${
                        corporateEligible ? "text-slate-700" : "text-slate-400"
                    }`}
                >
                    <Checkbox
                        id="soc-corporate-checkbox"
                        checked={isCorporateSoc && corporateEligible}
                        disabled={!corporateEligible}
                        onChange={(e) => onIsCorporateSocChange(e.target.checked)}
                        classNames={{ input: "h-4 w-4 shrink-0" }}
                        aria-label={t(`${D}.corporate`)}
                    />
                    <span>{t(`${D}.corporateCheckboxLabel`)}</span>
                </label>
            </div>
            {showDetailsInsurerDropdown ? (
                <div className={fieldClass}>
                    <label className={SOC_DETAIL_FIELD_LABEL_CLASS} htmlFor="soc-insurer-psu">
                        {t(`${D}.insurerPsu`)}
                        <span className="ms-0.5 text-red-600" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <DropdownSelect
                        name="corporateInsurerId"
                        name_key="corporateInsurerId"
                        control={control}
                        options={agreementInsurerOptions}
                        defaultValue={t(`${D}.selectInsurerPsu`)}
                        formClassName="min-w-0"
                        className={SOC_FIELD_CONTROL_CLASS}
                        disabled={insurerOptionsLoading && agreementInsurerOptions.length === 0}
                        onChange={(value) => {
                            onDetailsInsurerChange(String(value ?? ""));
                        }}
                    />
                </div>
            ) : null}
            {showCorporateDropdown ? (
                <div className={fieldClass}>
                    <label className={SOC_DETAIL_FIELD_LABEL_CLASS} htmlFor="soc-corporate-name">
                        {t(`${D}.corporateName`)}
                        <span className="ms-0.5 text-red-600" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <DropdownSelect
                        name="corporateIds"
                        name_key="corporateIds"
                        control={control}
                        options={corporateOptions}
                        multiselect
                        multiselectHorizontalScroll
                        is_select_checkbox
                        defaultValue={t(`${D}.selectCorporate`)}
                        formClassName="min-w-0"
                        className={SOC_FIELD_CONTROL_CLASS}
                        disabled={!corporateInsurerId}
                        onChange={(value) => {
                            const ids = (Array.isArray(value) ? value : [value])
                                .map((item) => String(item ?? "").trim())
                                .filter(Boolean);
                            const next = ids.map((id) => {
                                const option = corporateOptions.find((row) => row.value === id);
                                const existing = selectedCorporates.find((row) => row.id === id);
                                return {
                                    id,
                                    name: option?.label ?? existing?.name ?? id,
                                };
                            });
                            onSelectedCorporatesChange(next);
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
}
