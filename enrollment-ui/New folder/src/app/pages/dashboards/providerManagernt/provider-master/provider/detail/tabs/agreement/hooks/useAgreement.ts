import { useCallback, useEffect, useMemo, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import {
  addCalendarDays,
  diffDaysExclusive,
  formatHtmlDate,
  getAgreementTermsLayoutClasses,
} from "../utils/agreementFormConfig";
import { parseIsoDateOnlyLocal } from "../../../../../../shared/effectiveDateRange";
import {
  buildSelectedIcInvolvementDisplayRows,
  buildEffectiveIcOptions,
  buildScopeRadioOptions,
  getAgreementNameFlags,
  isScopeOptionDisabledForAgreement,
  isStandaloneScopeRadiosDisabled,
  usesSelectedIcScopeSelection,
  withMappingInsurerOption,
  type AgreementScopeEffectFields,
} from "../utils/agreementHelpers";
import type { NewAgreementFromMappingNavState } from "../utils/providerAgreementHelpers";
import type { AgreementFullFormValues, StandaloneAgreementFormValues } from "../utils/agreementFormConfig";
import {
  labelsForSelectedIcIds,
  normalizeSelectedIcIds,
  useAgreementInsurerOptions,
  type InsurerDropdownOption,
} from "./useAgreementInsurer";
import {
  useBaseAgreementScopeEffects,
  useStandaloneAgreementTypeEffects,
  useStandaloneGicScopeRules,
} from "../utils/agreementEffects";
import type { AgreementNameFlags } from "../utils/agreementHelpers";

type AgreementDurationFormFields = {
  agreementDurationDays: string;
  effectiveFrom: string;
  effectiveTo: string;
};

function useAgreementDurationSync<T extends AgreementDurationFormFields>(
  form: Pick<UseFormReturn<T>, "register" | "getValues" | "setValue">,
  effectiveFromWatch: string,
  effectiveToWatch: string,
) {
  const { register, getValues, setValue } = form as unknown as Pick<
    UseFormReturn<AgreementDurationFormFields>,
    "register" | "getValues" | "setValue"
  >;
  const durationEditingRef = useRef(false);
  const durationApplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const applyAgreementDurationToDates = useCallback(() => {
    const raw = (getValues("agreementDurationDays") ?? "").trim();
    if (raw === "") return;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 0) return;
    const from = parseIsoDateOnlyLocal(getValues("effectiveFrom"));
    const to = parseIsoDateOnlyLocal(getValues("effectiveTo"));
    if (from) {
      setValue("effectiveTo", formatHtmlDate(addCalendarDays(from, n)), {
        shouldDirty: true,
      });
    } else if (to) {
      setValue("effectiveFrom", formatHtmlDate(addCalendarDays(to, -n)), {
        shouldDirty: true,
      });
    }
  }, [getValues, setValue]);

  const clearDurationApplyTimer = useCallback(() => {
    if (durationApplyTimeoutRef.current) {
      clearTimeout(durationApplyTimeoutRef.current);
      durationApplyTimeoutRef.current = null;
    }
  }, []);

  const scheduleAgreementDurationApply = useCallback(() => {
    clearDurationApplyTimer();
    durationApplyTimeoutRef.current = setTimeout(() => {
      durationApplyTimeoutRef.current = null;
      applyAgreementDurationToDates();
      queueMicrotask(() => {
        durationEditingRef.current = false;
      });
    }, 280);
  }, [applyAgreementDurationToDates, clearDurationApplyTimer]);

  useEffect(() => {
    return () => clearDurationApplyTimer();
  }, [clearDurationApplyTimer]);

  useEffect(() => {
    if (durationEditingRef.current) return;
    const from = parseIsoDateOnlyLocal(effectiveFromWatch);
    const to = parseIsoDateOnlyLocal(effectiveToWatch);
    if (!from || !to) return;
    const days = diffDaysExclusive(from, to);
    if (days < 0) return;
    const next = String(days);
    const cur = (getValues("agreementDurationDays") ?? "").trim();
    if (cur !== next) {
      setValue("agreementDurationDays", next, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [effectiveFromWatch, effectiveToWatch, getValues, setValue]);

  const agreementDurationDaysRegister = register("agreementDurationDays");

  return {
    durationEditingRef,
    agreementDurationDaysRegister,
    applyAgreementDurationToDates,
    clearDurationApplyTimer,
    scheduleAgreementDurationApply,
  };
}

/** Fields watched and derived by both hospital and standalone agreement logic hooks. */
export type AgreementSharedFormFields = AgreementScopeEffectFields & {
  agreementDurationDays: string;
  effectiveFrom: string;
  effectiveTo: string;
};

type UseBaseAgreementLogicParams<T extends AgreementSharedFormFields> = {
  form: UseFormReturn<T>;
  scopeRadiosDisabled?: boolean;
  involvementJson?: string;
  applicableIcsSummary?: string;
  mappingInsurer?: NewAgreementFromMappingNavState | null;
};

export function useBaseAgreementLogic<T extends AgreementSharedFormFields>({
  form,
  scopeRadiosDisabled = false,
  involvementJson = "",
  applicableIcsSummary = "",
  mappingInsurer = null,
}: UseBaseAgreementLogicParams<T>) {
  const { isExpanded: isSidebarOpen } = useSidebarContext();
  const { watch } = form as unknown as UseFormReturn<AgreementSharedFormFields>;

  const {
    options: insurerIcOptions,
    loading: insurerIcLoading,
    rawRows,
  } = useAgreementInsurerOptions();

  const agreementType = watch("agreementType");
  const agreementName = watch("agreementName");
  const applicableScope = watch("applicableScope");
  const selectedIcIds = watch("selectedIcIds");
  const effectiveFromWatch = watch("effectiveFrom");
  const effectiveToWatch = watch("effectiveTo");
  const agreementCopyAvailable = watch("agreementCopyAvailable");

  const selectedIcIdsList = useMemo(
    () => normalizeSelectedIcIds(selectedIcIds),
    [selectedIcIds],
  );

  const nameFlags = useMemo(
    () => getAgreementNameFlags(agreementName),
    [agreementName],
  );

  const showSelectedIcScopeUi = usesSelectedIcScopeSelection(nameFlags);

  const isTripartite = agreementType === "tripartite";
  const agreementDocumentEnabled = agreementCopyAvailable === "Yes";

  const durationSync = useAgreementDurationSync(
    form,
    effectiveFromWatch,
    effectiveToWatch,
  );

  const effectiveIcOptions = useMemo(
    () =>
      withMappingInsurerOption(
        buildEffectiveIcOptions({
          agreementType,
          applicableScope,
          insurerIcOptions,
          rawRows,
          flags: nameFlags,
        }),
        mappingInsurer,
      ),
    [
      agreementType,
      applicableScope,
      insurerIcOptions,
      rawRows,
      nameFlags,
      mappingInsurer,
    ],
  );

  const scopeRadioOptions = useMemo(
    () => buildScopeRadioOptions(isTripartite, nameFlags),
    [isTripartite, nameFlags],
  );

  const selectedIcLabelList = useMemo(
    () => labelsForSelectedIcIds(selectedIcIdsList, effectiveIcOptions),
    [selectedIcIdsList, effectiveIcOptions],
  );

  const selectedIcInvolvementRows = useMemo(
    () =>
      buildSelectedIcInvolvementDisplayRows({
        applicableScope,
        selectedIcIds: selectedIcIdsList,
        insurerLabels: selectedIcLabelList,
        agreementEffectiveFrom: effectiveFromWatch,
        involvementJson,
        applicableIcsSummary,
      }),
    [
      applicableScope,
      selectedIcIdsList,
      selectedIcLabelList,
      effectiveFromWatch,
      involvementJson,
      applicableIcsSummary,
    ],
  );

  const isScopeOptionDisabled = (value: string) =>
    isScopeOptionDisabledForAgreement(value, nameFlags, scopeRadiosDisabled);

  return {
    form,
    isSidebarOpen,
    insurerIcLoading,
    rawRows,
    agreementName,
    agreementType,
    applicableScope,
    agreementCopyAvailable,
    effectiveFromWatch,
    effectiveToWatch,
    selectedIcIdsList,
    nameFlags,
    showSelectedIcScopeUi,
    isTripartite,
    agreementDocumentEnabled,
    effectiveIcOptions,
    scopeRadioOptions,
    selectedIcLabelList,
    selectedIcInvolvementRows,
    isScopeOptionDisabled,
    ...getAgreementTermsLayoutClasses(),
    ...durationSync,
  };
}

export type BaseAgreementLogic = ReturnType<
  typeof useBaseAgreementLogic<AgreementSharedFormFields>
>;

function useAgreementScopeEffects({
  form,
  agreementName,
  agreementType,
  applicableScope,
  flags,
  effectiveIcOptions,
  rawRows,
}: {
  form: UseFormReturn<AgreementFullFormValues>;
  agreementName: string;
  agreementType: string;
  applicableScope: string;
  flags: AgreementNameFlags;
  effectiveIcOptions: InsurerDropdownOption[];
  rawRows: unknown[];
}) {
  useBaseAgreementScopeEffects({
    form,
    agreementName,
    agreementType,
    applicableScope,
    flags,
    effectiveIcOptions,
    rawRows,
    requireAgreementName: true,
  });
}

function useStandaloneAgreementScopeEffects({
  form,
  agreementName,
  agreementType,
  applicableScope,
  isTripartite,
  gic,
  gipsaPpn,
  flags,
  effectiveIcOptions,
  rawRows,
}: {
  form: UseFormReturn<StandaloneAgreementFormValues>;
  agreementName: string;
  agreementType: string;
  applicableScope: string;
  isTripartite: boolean;
  gic: string;
  gipsaPpn: string;
  flags: AgreementNameFlags;
  effectiveIcOptions: InsurerDropdownOption[];
  rawRows: unknown[];
}) {
  useStandaloneAgreementTypeEffects({
    form,
    agreementType,
  });

  useStandaloneGicScopeRules({
    form,
    isTripartite,
    gic,
    gipsaPpn,
  });

  useBaseAgreementScopeEffects({
    form,
    agreementName,
    agreementType,
    applicableScope,
    flags,
    effectiveIcOptions,
    rawRows,
    requireAgreementName: true,
  });
}

function formatAgreementDocumentDisplayName(
  documentName: string,
  uploadedOn?: string,
): string {
  const uploadedSuffix = uploadedOn?.trim() ? ` (${uploadedOn})` : "";
  return `${documentName}${uploadedSuffix}`;
}

export function useAgreementFormLogic(
  form: UseFormReturn<AgreementFullFormValues>,
  mappingInsurer?: NewAgreementFromMappingNavState | null,
) {
  const { watch, setValue } = form;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supportingFileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedIcInvolvementJson = watch("selectedIcInvolvementJson");
  const applicableIcsSummaryWatch = watch("applicableIcsSummary");
  const agreementDocumentName = watch("agreementDocumentName");
  const agreementDocumentUploadedOn = watch("agreementDocumentUploadedOn");
  const supportingDocumentName = watch("supportingDocumentName");
  const supportingDocumentUploadedOn = watch("supportingDocumentUploadedOn");

  const base = useBaseAgreementLogic({
    form,
    scopeRadiosDisabled: false,
    involvementJson: selectedIcInvolvementJson ?? "",
    applicableIcsSummary: applicableIcsSummaryWatch ?? "",
    mappingInsurer,
  });

  useAgreementScopeEffects({
    form,
    agreementName: base.agreementName,
    agreementType: base.agreementType,
    applicableScope: base.applicableScope,
    flags: base.nameFlags,
    effectiveIcOptions: base.effectiveIcOptions,
    rawRows: base.rawRows,
  });

  const hasAgreementDocument = Boolean(agreementDocumentName?.trim());
  const hasSupportingDocument = Boolean(supportingDocumentName?.trim());

  const agreementFileDisplayName = hasAgreementDocument
    ? formatAgreementDocumentDisplayName(agreementDocumentName, agreementDocumentUploadedOn)
    : null;

  const supportingFileDisplayName = hasSupportingDocument
    ? formatAgreementDocumentDisplayName(supportingDocumentName, supportingDocumentUploadedOn)
    : null;

  const clearAgreementDocument = () => {
    setValue("agreementDocumentName", "", { shouldDirty: true, shouldValidate: true });
    setValue("agreementDocumentUploadedOn", "", { shouldDirty: true });
    setValue("pendingAgreementDocumentFile", null, { shouldDirty: true });
    setValue("fileMetadataId", "", { shouldDirty: true, shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearSupportingDocument = () => {
    setValue("supportingDocumentName", "", { shouldDirty: true, shouldValidate: true });
    setValue("supportingDocumentUploadedOn", "", { shouldDirty: true });
    setValue("pendingSupportingDocumentFile", null, { shouldDirty: true });
    setValue("supportingFileMetadataId", "", { shouldDirty: true, shouldValidate: true });
    if (supportingFileInputRef.current) supportingFileInputRef.current.value = "";
  };

  return {
    ...base,
    watched: watch(),
    fileInputRef,
    supportingFileInputRef,
    hasAgreementDocument,
    hasSupportingDocument,
    agreementFileDisplayName,
    supportingFileDisplayName,
    clearAgreementDocument,
    clearSupportingDocument,
  };
}

export type AgreementFormLogic = ReturnType<typeof useAgreementFormLogic>;

export function useStandaloneAgreementFormLogic(
  form: UseFormReturn<StandaloneAgreementFormValues>,
) {
  const { watch } = form;

  const agreementType = watch("agreementType");
  const gic = watch("gic");
  const gipsaPpn = watch("gipsaPpn");
  const isTripartite = agreementType === "tripartite";

  const base = useBaseAgreementLogic({
    form,
    scopeRadiosDisabled: isStandaloneScopeRadiosDisabled(isTripartite, gic, gipsaPpn),
  });

  useStandaloneAgreementScopeEffects({
    form,
    agreementName: base.agreementName,
    agreementType: base.agreementType,
    applicableScope: base.applicableScope,
    isTripartite: base.isTripartite,
    gic,
    gipsaPpn,
    flags: base.nameFlags,
    effectiveIcOptions: base.effectiveIcOptions,
    rawRows: base.rawRows,
  });

  return base;
}

export type StandaloneAgreementFormLogic = ReturnType<
  typeof useStandaloneAgreementFormLogic
>;
