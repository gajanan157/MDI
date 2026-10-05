import { useEffect, useMemo } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import { DiscountSectionCard } from "./DiscountSectionCard";
import {
    getAgreementNameFlags,
    isAllInsurerAllPolicyholderDiscountScope,
    isAllPolicyholderOnlyDiscountScope,
    isInsurerBipartiteDiscountScopeHidden,
    type AgreementListRow,
} from "../../../agreement/utils/agreementHelpers";
import type {
    DiscountComponentRow,
    DiscountDetailRecord,
    DiscountFormValues,
} from "../types/discountTypes";
import {
    mapInclusionExclusionRecordToCodes,
    pruneStringArrayRecord,
    setStringArrayRecordValue,
    stringArrayRecordsEqual,
} from "../utils/discountInclusionExclusionHelpers";
import { mergeNamedDiscountOptions } from "../utils/discountDisplayLabel";
import {
    DISCOUNT_PAGE_CLASS,
    DISCOUNT_SECTION_BODY_CLASS,
} from "../utils/discountConfig";
import { mapAgreementInsurerOptions, type DiscountAgreementOption } from "../hooks/useDiscountFormOptions";
import { useDiscountTypeMasterOptions } from "../hooks/useDiscountTypeMasterOptions";
import { useDiscountIndividualSubtypeOptions } from "../hooks/useDiscountIndividualSubtypeOptions";
import { useDiscountOpdSubtypeOptions } from "../hooks/useDiscountOpdSubtypeOptions";
import { useDiscountInclusionExclusionOptions } from "../hooks/useDiscountInclusionExclusionOptions";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchDiscountTypeMaster } from "@/store/features/discountTypeMaster/discountTypeMasterSlice";
import {
    enforceExclusiveIpdDiscountTypes,
    isIpdSelectDiscountType,
    syncBulkDiscountByType,
} from "../utils/discountBulkConfig";
import { resolveDiscountTypeTone } from "../utils/discountTypeStyles";
import { DiscountAllTypesConfigSection } from "./DiscountAllTypesConfigSection";
import { DiscountServiceSelectSection } from "./DiscountOpdRowsSection";
import { DiscountTypePicker } from "./DiscountTypePicker";
import { DiscountScopeSection } from "./DiscountScopeSection";
import { DiscountSupportingDocumentField } from "./DiscountSupportingDocumentField";
import { DiscountTabViewContent } from "./DiscountTabViewContent";
import { mergeInsurerScopeIds } from "../utils/discountScopeHelpers";

type DiscountTabContentProps = {
    isViewMode: boolean;
    providerId?: string;
    form: UseFormReturn<DiscountFormValues>;
    setOpdPercentByKey: (
        v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
    ) => void;
    setIpdPercentByKey: (
        v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
    ) => void;
    componentDiscounts: DiscountComponentRow[];
    setComponentDiscounts: (
        v: DiscountComponentRow[] | ((prev: DiscountComponentRow[]) => DiscountComponentRow[]),
    ) => void;
    supportingDocumentFile: File | null;
    setSupportingDocumentFile: (file: File | null) => void;
    onSupportingDocumentUploaded?: (payload: {
        file: File;
        supportingFileMetadataId: string;
        supportingDocumentName: string;
    }) => void | Promise<void>;
    agreementOptions: DiscountAgreementOption[];
    socOptions?: { value: string; label: string }[];
    agreementRowsById: Map<string, AgreementListRow>;
    /** Fallback when agreement has no insurer mappings (full IC master list). */
    fallbackInsurerOptions?: { value: string; label: string }[];
    corporateOptions: { value: string; label: string }[];
    optionsByInsurerId: Record<string, { value: string; label: string }[]>;
    selectedDetail?: DiscountDetailRecord | null;
};

function labelOf(options: { value: string; label: string }[], value: string) {
    return options.find((o) => o.value === value)?.label ?? value;
}

function getIpdSelectedTypes(types: string[], ipdTypeIds: readonly string[]) {
    return types.filter((type) => isIpdSelectDiscountType(type, ipdTypeIds));
}

const EMPTY_INCL_EXCL_CODES: string[] = [];

export function DiscountTabContent({
    isViewMode,
    providerId,
    form,
    setOpdPercentByKey,
    setIpdPercentByKey,
    componentDiscounts,
    setComponentDiscounts,
    supportingDocumentFile,
    setSupportingDocumentFile,
    onSupportingDocumentUploaded,
    agreementOptions,
    socOptions = [],
    agreementRowsById,
    fallbackInsurerOptions = [],
    corporateOptions,
    optionsByInsurerId = {},
    selectedDetail = null,
}: Readonly<DiscountTabContentProps>) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const D = "providerMaster.soc.discount";
    const ipdTone = resolveDiscountTypeTone("individual");
    const { ipdDiscountTypeOptions, opdDiscountTypeOptions } = useDiscountTypeMasterOptions();
    const ipdTypeIds = useMemo(
        () => (ipdDiscountTypeOptions ?? []).map((option) => option.value),
        [ipdDiscountTypeOptions],
    );

    const values = form.watch();
    const isExistingDiscount = Boolean(selectedDetail?.id && selectedDetail.id !== "new");
    const savedIpdIndividualGroups = useMemo(
        () =>
            (selectedDetail?.discountTypeGroups ?? []).filter(
                (group) => group.serviceType === "IPD" && group.typeKey === "individual",
            ),
        [selectedDetail?.discountTypeGroups],
    );
    const savedOpdGroups = useMemo(
        () =>
            (selectedDetail?.discountTypeGroups ?? []).filter(
                (group) => group.serviceType === "OPD",
            ),
        [selectedDetail?.discountTypeGroups],
    );
    const selectedDiscountTypes = values.discountTypes ?? [];
    const bulkDiscountByType = values.bulkDiscountByType ?? {};
    const packageApplicableOn = String(
        values.bulkDiscountByType?.package?.applicableOn ?? "",
    ).trim();
    const socApplicableOnOptions = useMemo(() => {
        const packageGroup = (selectedDetail?.discountTypeGroups ?? []).find(
            (group) => group.typeKey === "package",
        );
        const savedSocId = String(
            packageGroup?.socId || values.socId || packageApplicableOn || "",
        ).trim();
        const savedSocName = String(packageGroup?.socName ?? "").trim();
        const options = [
            { value: "", label: t("providerMaster.soc.discount.fields.selectSoc") },
            ...socOptions.map((option) =>
                savedSocId && option.value === savedSocId && savedSocName
                    ? { ...option, label: savedSocName }
                    : option,
            ),
        ];
        if (
            savedSocId &&
            savedSocName &&
            !options.some((option) => option.value === savedSocId)
        ) {
            options.push({ value: savedSocId, label: savedSocName });
        }
        return options;
    }, [
        packageApplicableOn,
        selectedDetail?.discountTypeGroups,
        socOptions,
        t,
        values.socId,
    ]);
    const individualMasterId = useMemo(
        () =>
            ipdDiscountTypeOptions.find((option) => option.value === "individual")
                ?.masterId ?? "",
        [ipdDiscountTypeOptions],
    );
    const individualSelected = selectedDiscountTypes.includes("individual");
    const { componentOptions: individualComponentOptions } =
        useDiscountIndividualSubtypeOptions(
            individualMasterId,
            !isViewMode && values.ipdEnabled && individualSelected,
        );
    const individualOptionsForEdit = useMemo(
        () =>
            mergeNamedDiscountOptions(
                savedIpdIndividualGroups.flatMap((group) =>
                    group.subtypes.map((subtype) => ({ id: subtype.id, name: subtype.name })),
                ),
                individualComponentOptions ?? [],
            ),
        [individualComponentOptions, savedIpdIndividualGroups],
    );
    const { opdDropdownOptions } = useDiscountOpdSubtypeOptions(
        opdDiscountTypeOptions,
        !isViewMode && Boolean(values.opdEnabled),
    );
    const opdOptionsForEdit = useMemo(
        () =>
            mergeNamedDiscountOptions(
                savedOpdGroups.flatMap((group) => {
                    const subtypes = group.subtypes.map((subtype) => ({
                        id: subtype.id,
                        name: subtype.name,
                    }));
                    if (subtypes.length > 0) return subtypes;
                    return group.typeKey
                        ? [{ id: group.typeKey, name: group.typeName }]
                        : [];
                }),
                opdDropdownOptions ?? [],
            ),
        [opdDropdownOptions, savedOpdGroups],
    );
    const {
        uniqueOptions: inclusionExclusionOptions,
        list: inclusionExclusionMasterList,
    } = useDiscountInclusionExclusionOptions(
        EMPTY_INCL_EXCL_CODES,
        EMPTY_INCL_EXCL_CODES,
        !isViewMode,
    );
    const resolvedOpdOptions = opdOptionsForEdit;
    const discountTypeOptions = useMemo(
        () => [...ipdDiscountTypeOptions, ...resolvedOpdOptions],
        [ipdDiscountTypeOptions, resolvedOpdOptions],
    );

    useEffect(() => {
        if (isViewMode || !values.ipdEnabled) return;
        dispatch(
            fetchDiscountTypeMaster({ download: true, providerServiceType: "IPD" }),
        ).catch(() => undefined);
    }, [dispatch, isViewMode, values.ipdEnabled]);

    useEffect(() => {
        if (isViewMode || !values.opdEnabled) return;
        dispatch(
            fetchDiscountTypeMaster({ download: true, providerServiceType: "OPD" }),
        ).catch(() => undefined);
    }, [dispatch, isViewMode, values.opdEnabled]);

    useEffect(() => {
        if (isViewMode || inclusionExclusionMasterList.length === 0) return;
        const currentInclusion = form.getValues("inclusionByType") ?? {};
        const nextInclusion = mapInclusionExclusionRecordToCodes(
            currentInclusion,
            inclusionExclusionMasterList,
        );
        if (!stringArrayRecordsEqual(currentInclusion, nextInclusion)) {
            form.setValue("inclusionByType", nextInclusion, { shouldDirty: false });
        }
        const currentExclusion = form.getValues("exclusionByType") ?? {};
        const nextExclusion = mapInclusionExclusionRecordToCodes(
            currentExclusion,
            inclusionExclusionMasterList,
        );
        if (!stringArrayRecordsEqual(currentExclusion, nextExclusion)) {
            form.setValue("exclusionByType", nextExclusion, { shouldDirty: false });
        }
    }, [form, inclusionExclusionMasterList, isViewMode]);

    const applyDiscountTypes = (next: string[]) => {
        form.setValue("discountTypes", next, { shouldDirty: true, shouldValidate: true });
    };
    const applyIpdTypes = (nextIpdTypes: string[]) => {
        const preserved = selectedDiscountTypes.filter(
            (type) => !isIpdSelectDiscountType(type, ipdTypeIds),
        );
        applyDiscountTypes([
            ...preserved,
            ...enforceExclusiveIpdDiscountTypes(nextIpdTypes),
        ]);
    };
    const applyBulkDiscount = (next: Record<string, typeof bulkDiscountByType[string]>) => {
        form.setValue("bulkDiscountByType", next, { shouldDirty: true, shouldValidate: true });
        const packageSocId = String(next.package?.applicableOn ?? "").trim();
        if (packageSocId !== String(form.getValues("socId") ?? "")) {
            form.setValue("socId", packageSocId, { shouldDirty: true });
        }
        if (values.opdEnabled) {
            setOpdPercentByKey((prev) => {
                const updated = { ...prev };
                (selectedDiscountTypes ?? []).forEach((typeKey) => {
                    const percent = next[typeKey]?.discountPercent;
                    if (percent != null) updated[typeKey] = percent;
                });
                return updated;
            });
        }
    };

    // Drop types that are no longer visible after IPD/OPD changes.
    useEffect(() => {
        if (isViewMode || isExistingDiscount) return;
        const allowed = new Set<string>();
        if (values.ipdEnabled) {
            ipdDiscountTypeOptions.forEach((option) => allowed.add(option.value));
        }
        if (values.opdEnabled) {
            resolvedOpdOptions.forEach((option) => allowed.add(option.value));
        }
        const current = form.getValues("discountTypes") ?? [];
        const next = current.filter((typeId) => allowed.has(typeId));
        if (next.length === current.length) return;
        form.setValue("discountTypes", next, { shouldDirty: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- prune when visible type groups change
    }, [ipdDiscountTypeOptions, resolvedOpdOptions, values.ipdEnabled, values.opdEnabled, isExistingDiscount, isViewMode]);

    // Keep per-type bulk config in sync with selected discount types.
    useEffect(() => {
        if (isViewMode) return;
        const synced = syncBulkDiscountByType(selectedDiscountTypes, bulkDiscountByType);
        if (JSON.stringify(bulkDiscountByType) !== JSON.stringify(synced)) {
            form.setValue("bulkDiscountByType", synced, { shouldDirty: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when selected types change
    }, [selectedDiscountTypes, isViewMode]);

    useEffect(() => {
        if (isViewMode) return;
        const keepKeys = new Set<string>();
        if (values.ipdEnabled) {
            getIpdSelectedTypes(selectedDiscountTypes, ipdTypeIds)
                .filter((type) => type !== "individual")
                .forEach((type) => keepKeys.add(type));
        }

        const currentInclusion = form.getValues("inclusionByType") ?? {};
        const nextInclusion = pruneStringArrayRecord(currentInclusion, keepKeys);
        if (!stringArrayRecordsEqual(currentInclusion, nextInclusion)) {
            form.setValue("inclusionByType", nextInclusion, { shouldDirty: true });
        }
        const currentExclusion = form.getValues("exclusionByType") ?? {};
        const nextExclusion = pruneStringArrayRecord(currentExclusion, keepKeys);
        if (!stringArrayRecordsEqual(currentExclusion, nextExclusion)) {
            form.setValue("exclusionByType", nextExclusion, { shouldDirty: true });
        }
    }, [
        form,
        ipdTypeIds,
        isViewMode,
        selectedDiscountTypes,
        values.ipdEnabled,
    ]);

    const applyTypeInclusion = (typeKey: string, next: string[]) => {
        form.setValue(
            "inclusionByType",
            setStringArrayRecordValue(form.getValues("inclusionByType"), typeKey, next),
            { shouldDirty: true },
        );
    };
    const applyTypeExclusion = (typeKey: string, next: string[]) => {
        form.setValue(
            "exclusionByType",
            setStringArrayRecordValue(form.getValues("exclusionByType"), typeKey, next),
            { shouldDirty: true },
        );
    };

    const selectedAgreement = useMemo(
        () => agreementRowsById.get(String(values.agreementId ?? "").trim()) ?? null,
        [agreementRowsById, values.agreementId],
    );

    const insurerOptions = useMemo(() => {
        const savedItems = selectedDetail?.insurerItems ?? [];
        const fallback = fallbackInsurerOptions ?? [];
        const fromAgreement = selectedAgreement
            ? mapAgreementInsurerOptions(selectedAgreement)
            : [];

        // When the agreement is scoped to selected insurers/PSUs, the discount
        // can only target the insurers mapped on that agreement — never the full
        // insurer master list. Only fall back to the master pool for all-scope
        // agreements or when no agreement is selected.
        const agreementScope = String(selectedAgreement?.scope ?? "")
            .trim()
            .toUpperCase();
        const isSelectedInsurerScope =
            agreementScope === "SELECTED_INSURER" ||
            agreementScope === "SELECTED_PSU";
        const master =
            isSelectedInsurerScope && fromAgreement.length > 0
                ? fromAgreement
                : [...fromAgreement, ...fallback];

        const combinedMaster = mergeNamedDiscountOptions([], master);
        return mergeNamedDiscountOptions(savedItems, combinedMaster);
    }, [fallbackInsurerOptions, selectedAgreement, selectedDetail?.insurerItems]);

    const selectedInsurerIds = useMemo(
        () => (values.insurerIds ?? []).filter(Boolean),
        [values.insurerIds],
    );

    const effectiveInsurerIds = useMemo(() => {
        if (values.insurerAll) {
            return (insurerOptions ?? []).map((option) => option.value).filter(Boolean);
        }
        return selectedInsurerIds;
    }, [insurerOptions, selectedInsurerIds, values.insurerAll]);

    const namedCorporateIdsByInsurer = useMemo(() => {
        const map: Record<string, string[]> = {};
        (selectedDetail?.corporateItems ?? []).forEach((item) => {
            const insurerId = String(item.insurerId ?? "").trim();
            const corporateId = String(item.id ?? "").trim();
            if (!insurerId || !corporateId) return;
            const existing = map[insurerId] ?? [];
            if (!existing.includes(corporateId)) {
                map[insurerId] = [...existing, corporateId];
            }
        });
        return map;
    }, [selectedDetail?.corporateItems]);

    const syncCorporateInsurersFromInsuranceCo = (insurerIds: string[]) => {
        const prevByInsurer = form.getValues("corporateIdsByInsurer") ?? {};
        const nextByInsurer: Record<string, string[]> = { ...prevByInsurer };
        const sameLoadedAgreement =
            String(form.getValues("agreementId") ?? "").trim() ===
            String(selectedDetail?.agreementId ?? "").trim();
        insurerIds.forEach((insurerId) => {
            if (insurerId in nextByInsurer) return;
            nextByInsurer[insurerId] = sameLoadedAgreement
                ? [...(namedCorporateIdsByInsurer[insurerId] ?? [])]
                : [];
        });
        form.setValue("corporateInsurerIds", insurerIds);
        form.setValue("corporateIdsByInsurer", nextByInsurer);
    };

    const onInsurerSelectionChange = (insurerIds: string[]) => {
        if (form.getValues("corporateAll")) return;
        const corporateByInsurer = form.getValues("corporateIdsByInsurer") ?? {};
        syncCorporateInsurersFromInsuranceCo(
            mergeInsurerScopeIds(insurerIds, corporateByInsurer),
        );
    };

    useEffect(() => {
        if (isViewMode || !values.insurerAll) return;
        const allIds = (insurerOptions ?? []).map((option) => option.value).filter(Boolean);
        const current = values.insurerIds ?? [];
        const same =
            current.length === allIds.length && current.every((id) => allIds.includes(id));
        if (same) return;
        form.setValue("insurerIds", allIds, { shouldDirty: true });
        if (!values.corporateAll) {
            syncCorporateInsurersFromInsuranceCo(allIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when all IC scope or options change
    }, [isViewMode, values.insurerAll, insurerOptions, values.corporateAll]);

    const isGipsaAgreement = useMemo(
        () => getAgreementNameFlags(values.agreementName).isGipsaPpnTripartite,
        [values.agreementName],
    );
    const isAllIcAllPolicyholderScope = useMemo(
        () => isAllInsurerAllPolicyholderDiscountScope(values.agreementName),
        [values.agreementName],
    );
    const isAllPolicyholderOnlyScope = useMemo(
        () => isAllPolicyholderOnlyDiscountScope(values.agreementName),
        [values.agreementName],
    );

    // GIC Standard: insurer step stays user-selectable, corporate scope is forced
    // to All policyholders (Step 2 is hidden).
    useEffect(() => {
        if (isViewMode || !isAllPolicyholderOnlyScope || values.corporateAll) return;
        form.setValue("corporateAll", true, { shouldDirty: true });
        form.setValue("corporateInsurerIds", []);
        form.setValue("corporateIdsByInsurer", {});
        // eslint-disable-next-line react-hooks/exhaustive-deps -- enforce All policyholders for GIC Standard
    }, [isViewMode, isAllPolicyholderOnlyScope, values.corporateAll]);

    useEffect(() => {
        if (isViewMode) return;
        const currentPackage = form.getValues("bulkDiscountByType")?.package;
        if (!currentPackage) return;

        const currentVariant = String(currentPackage.ppnVariant ?? "").trim();
        if (!isGipsaAgreement) {
            if (!currentVariant) return;
            applyBulkDiscount({
                ...form.getValues("bulkDiscountByType"),
                package: { ...currentPackage, ppnVariant: "" },
            });
            return;
        }
        if (currentVariant === "ppn" || currentVariant === "nonPpn") return;
        applyBulkDiscount({
            ...form.getValues("bulkDiscountByType"),
            package: { ...currentPackage, ppnVariant: "ppn" },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- default/clear GIPSA package PPN toggle
    }, [isGipsaAgreement, isViewMode, bulkDiscountByType.package]);

    const isInsurerBipartiteAgreement = useMemo(
        () => isInsurerBipartiteDiscountScopeHidden(values.agreementName),
        [values.agreementName],
    );

    useEffect(() => {
        if (isViewMode || !isInsurerBipartiteAgreement) return;

        const defaultId = (insurerOptions ?? []).find((option) => option.value)?.value;
        if (!defaultId) return;

        let dirty = false;
        if (values.insurerAll) {
            form.setValue("insurerAll", false, { shouldDirty: true });
            dirty = true;
        }
        const current = values.insurerIds ?? [];
        if (current.length !== 1 || current[0] !== defaultId) {
            form.setValue("insurerIds", [defaultId], { shouldDirty: true });
            dirty = true;
        }
        if (dirty && !values.corporateAll) {
            syncCorporateInsurersFromInsuranceCo([defaultId]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-select single IC for insurer bipartite
    }, [
        isViewMode,
        isInsurerBipartiteAgreement,
        insurerOptions,
        values.insurerAll,
        values.insurerIds,
        values.corporateAll,
    ]);

    useEffect(() => {
        if (isViewMode || !isAllIcAllPolicyholderScope) return;

        let dirty = false;
        if (!values.insurerAll) {
            form.setValue("insurerAll", true, { shouldDirty: true });
            dirty = true;
        }
        if (!values.corporateAll) {
            form.setValue("corporateAll", true, { shouldDirty: true });
            dirty = true;
        }

        const allIds = (insurerOptions ?? []).map((option) => option.value).filter(Boolean);
        const current = values.insurerIds ?? [];
        const sameIds =
            current.length === allIds.length && current.every((id) => allIds.includes(id));
        if (!sameIds && allIds.length > 0) {
            form.setValue("insurerIds", allIds, { shouldDirty: true });
            dirty = true;
        }

        if (dirty) {
            form.setValue("corporateInsurerIds", []);
            form.setValue("corporateIdsByInsurer", {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- enforce All IC + All policyholders for GIPSA/GIC
    }, [isViewMode, isAllIcAllPolicyholderScope, insurerOptions, values.insurerAll, values.corporateAll, values.insurerIds]);

    // Keep corporate insurer ids aligned with Step 1. Corporate mappings are kept
    // so they reappear when an IC is selected again.
    useEffect(() => {
        if (isViewMode || values.corporateAll) return;
        const scopeInsurerIds = values.insurerAll
            ? effectiveInsurerIds
            : mergeInsurerScopeIds(
                  values.insurerIds ?? [],
                  values.corporateIdsByInsurer ?? {},
              );
        const current = values.corporateInsurerIds ?? [];
        const same =
            current.length === scopeInsurerIds.length &&
            current.every((id) => scopeInsurerIds.includes(id));
        if (same) return;
        syncCorporateInsurersFromInsuranceCo(scopeInsurerIds);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when effective ICs change
    }, [
        isViewMode,
        effectiveInsurerIds,
        values.corporateAll,
        values.insurerAll,
        values.insurerIds,
        values.corporateIdsByInsurer,
    ]);

    const applyAgreementSelection = (agreementId: string) => {
        const trimmedId = agreementId.trim();
        if (!trimmedId) {
            form.setValue("agreementId", "");
            form.setValue("agreementName", "");
            form.setValue("agreementType", "");
            form.setValue("insurerAll", true);
            form.setValue("insurerIds", []);
            form.setValue("corporateInsurerIds", []);
            form.setValue("corporateIdsByInsurer", {});
            return;
        }

        const row = agreementRowsById.get(trimmedId);
        if (!row) {
            form.setValue("agreementId", trimmedId);
            return;
        }

        form.setValue("agreementId", row.id);
        form.setValue("agreementName", String(row.agreementName ?? "").trim());
        form.setValue("agreementType", String(row.type ?? "").trim());
        const flags = getAgreementNameFlags(row.agreementName);
        const lockAllIcAllPolicyholders = flags.isGipsaPpnTripartite || flags.isGicStandard;
        const isInsurerBipartite = flags.isInsurerBipartite;
        const agreementInsurerIds = mapAgreementInsurerOptions(row)
            .map((option) => option.value)
            .filter(Boolean);

        // Insurer–Provider Bipartite hides All IC and uses a single Selected IC.
        // All other agreements default to All IC.
        if (isInsurerBipartite) {
            const defaultInsurerIds =
                agreementInsurerIds.length > 0 ? [agreementInsurerIds[0]] : [];
            form.setValue("insurerAll", false);
            form.setValue("insurerIds", defaultInsurerIds);
            form.setValue("corporateInsurerIds", defaultInsurerIds);
        } else {
            form.setValue("insurerAll", true);
            form.setValue("insurerIds", agreementInsurerIds);
            form.setValue("corporateInsurerIds", []);
        }

        form.setValue(
            "corporateAll",
            lockAllIcAllPolicyholders ? true : form.getValues("corporateAll"),
        );
        form.setValue("corporateIdsByInsurer", {});
    };

    const agreementNavState = location.state as
        | { fromAgreement?: boolean; agreementId?: string }
        | null;
    const lockAgreementFromNav = Boolean(agreementNavState?.fromAgreement);

    useEffect(() => {
        if (isViewMode || !lockAgreementFromNav) return;
        const agreementId = String(agreementNavState?.agreementId ?? "").trim();
        if (!agreementId) return;

        const currentId = String(form.getValues("agreementId") ?? "").trim();
        const currentName = String(form.getValues("agreementName") ?? "").trim();
        if (currentId === agreementId && currentName) return;

        applyAgreementSelection(agreementId);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- apply once rows/nav are ready
    }, [agreementRowsById, isViewMode, lockAgreementFromNav, agreementNavState?.agreementId]);

    if (isViewMode) {
        return (
            <DiscountTabViewContent
                values={values}
                detail={selectedDetail}
                agreementOptions={agreementOptions}
                insurerOptions={insurerOptions}
                corporateOptions={corporateOptions}
                optionsByInsurerId={optionsByInsurerId}
                socOptions={socOptions}
            />
        );
    }

    return (
        <div className={DISCOUNT_PAGE_CLASS}>
            <DiscountScopeSection
                form={form}
                values={values}
                agreementOptions={agreementOptions}
                applyAgreementSelection={applyAgreementSelection}
                agreementDisabled={isExistingDiscount || lockAgreementFromNav}
                insurerOptions={insurerOptions}
                effectiveInsurerIds={effectiveInsurerIds}
                optionsByInsurerId={optionsByInsurerId}
                labelOf={labelOf}
                onInsurerSelectionChange={onInsurerSelectionChange}
                syncCorporateInsurersFromInsuranceCo={syncCorporateInsurersFromInsuranceCo}
                onClearIpd={() => setIpdPercentByKey({})}
                onClearOpd={() => setOpdPercentByKey({})}
                namedCorporates={selectedDetail?.corporateItems}
                namedInsurers={selectedDetail?.insurerItems}
            />

            {values.ipdEnabled || values.opdEnabled ? (
                <DiscountSectionCard title={t(`${D}.sections.discount`)} bodyClassName={DISCOUNT_SECTION_BODY_CLASS}>
                    <div className="space-y-2">
                        {values.ipdEnabled ? (
                            <div className={`space-y-1.5 rounded-sm border p-2 ${ipdTone.panel}`}>
                                <p className={`text-[10px] font-semibold ${ipdTone.panelTitle}`}>
                                    {t(`${D}.ipd`)}
                                </p>
                                <DiscountTypePicker
                                    value={getIpdSelectedTypes(selectedDiscountTypes, ipdTypeIds)}
                                    onChange={applyIpdTypes}
                                    groups={[
                                        {
                                            id: "ipd",
                                            title: "",
                                            options: ipdDiscountTypeOptions,
                                        },
                                    ]}
                                />
                                <DiscountAllTypesConfigSection
                                    selectedDiscountTypes={selectedDiscountTypes}
                                    bulkDiscountByType={bulkDiscountByType}
                                    onBulkChange={(next) => {
                                        const resolved =
                                            typeof next === "function"
                                                ? next(bulkDiscountByType)
                                                : next;
                                        applyBulkDiscount(resolved);
                                    }}
                                    componentDiscounts={componentDiscounts}
                                    onComponentDiscountsChange={setComponentDiscounts}
                                    discountTypeOptions={discountTypeOptions}
                                    discountApplicableOnOptions={socApplicableOnOptions}
                                    ipdTypeIds={ipdTypeIds}
                                    componentOptions={individualOptionsForEdit}
                                    inclusionByType={values.inclusionByType ?? {}}
                                    exclusionByType={values.exclusionByType ?? {}}
                                    onInclusionChange={applyTypeInclusion}
                                    onExclusionChange={applyTypeExclusion}
                                    inclusionExclusionOptions={inclusionExclusionOptions}
                                    showPackagePpnToggle={isGipsaAgreement}
                                />
                            </div>
                        ) : null}

                        {values.opdEnabled ? (
                            <DiscountServiceSelectSection
                                title={t(`${D}.opd`)}
                                placeholder={t(`${D}.selectOpdDiscount`)}
                                toneTypeId="opd"
                                options={resolvedOpdOptions}
                                isOwnedType={(type) =>
                                    resolvedOpdOptions.some((option) => option.value === type) ||
                                    (!isIpdSelectDiscountType(type, ipdTypeIds) &&
                                        Boolean(bulkDiscountByType[type]))
                                }
                                selectedDiscountTypes={selectedDiscountTypes}
                                bulkDiscountByType={bulkDiscountByType}
                                onDiscountTypesChange={applyDiscountTypes}
                                onBulkChange={applyBulkDiscount}
                            />
                        ) : null}
                    </div>
                </DiscountSectionCard>
            ) : null}

            <DiscountSectionCard title={t(`${D}.sections.details`)} bodyClassName={DISCOUNT_SECTION_BODY_CLASS}>
                <div className="grid grid-cols-1 items-start gap-x-3 gap-y-1 lg:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-1">
                        <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
                            <ProviderDatePicker
                                label={t(`${D}.effectiveFrom`)}
                                control={form.control}
                                name="effectiveFrom"
                                isRequired
                                rules={{ required: t(`${D}.effectiveFromRequired`) }}
                                className="h-8 w-full text-xs"
                                max={values.effectiveTo?.trim() || undefined}
                            />
                            <ProviderDatePicker
                                label={t(`${D}.effectiveTo`)}
                                control={form.control}
                                name="effectiveTo"
                                className="h-8 w-full text-xs"
                                min={values.effectiveFrom?.trim() || undefined}
                            />
                        </div>
                        <DiscountSupportingDocumentField
                            providerId={providerId}
                            isRequired
                            fileName={
                                supportingDocumentFile?.name ??
                                values.supportingDocumentName ??
                                ""
                            }
                            supportingFileMetadataId={values.supportingFileMetadataId ?? ""}
                            onUploaded={async ({ file, supportingFileMetadataId, supportingDocumentName }) => {
                                if (onSupportingDocumentUploaded) {
                                    await onSupportingDocumentUploaded({
                                        file,
                                        supportingFileMetadataId,
                                        supportingDocumentName,
                                    });
                                    return;
                                }
                                setSupportingDocumentFile(file);
                                form.setValue("supportingFileMetadataId", supportingFileMetadataId, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                                form.setValue("supportingDocumentName", supportingDocumentName, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }}
                            onClear={() => {
                                setSupportingDocumentFile(null);
                                form.setValue("supportingFileMetadataId", "", {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                                form.setValue("supportingDocumentName", "", {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }}
                        />
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <Textarea
                            label={t(`${D}.remarks`)}
                            placeholder={t(`${D}.remarksPlaceholder`)}
                            rows={3}
                            maxLength={500}
                            {...form.register("remarks", { required: "Remark is required" })}
                            isRequired
                            error={form.formState.errors.remarks?.message}
                            className="min-h-[4.25rem] w-full min-w-0 resize-y text-xs"
                        />
                        <p className="mt-0.5 text-right text-[10px] text-gray-500">
                            {(values.remarks ?? "").length}/500
                        </p>
                    </div>
                </div>
            </DiscountSectionCard>
        </div>
    );
}

