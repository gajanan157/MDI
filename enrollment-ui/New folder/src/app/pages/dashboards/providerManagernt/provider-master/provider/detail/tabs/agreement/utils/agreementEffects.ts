import { useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  parseSelectedIcInvolvementJson,
  resolveAgreementTypeUpdate,
  resolveApplicableScopeFromFlags,
  resolveAutoSelectedIcIds,
  resolveAllowedSelectedIcIds,
  resolveBipartiteGicReset,
  resolveGicScopeOnBipartite,
  resolveGicScopeUpdate,
  resolveSingleModeSelectedIcIds,
  resolveTripartiteTransitionSelectedIcIds,
  type AgreementNameFlags,
  type AgreementScopeEffectFields,
} from "./agreementHelpers";
import {
  normalizeSelectedIcIds,
  type InsurerDropdownOption,
} from "../hooks/useAgreementInsurer";
import type { NewAgreementFromMappingNavState } from "./providerAgreementHelpers";

type AgreementTypeEffectFields = Pick<
  AgreementScopeEffectFields,
  "agreementName" | "agreementType" | "applicableScope" | "selectedIcIds"
>;

type AgreementTypeEffectFormApi = Pick<
  UseFormReturn<AgreementTypeEffectFields>,
  "setValue" | "getValues"
>;

type StandaloneTypeEffectFields = AgreementTypeEffectFields & {
  gic: string;
  gipsaPpn: string;
};

type StandaloneTypeEffectFormApi = Pick<
  UseFormReturn<StandaloneTypeEffectFields>,
  "setValue"
>;

type UseAgreementTypeEffectsParams<T extends AgreementTypeEffectFields> = {
  form: Pick<UseFormReturn<T>, "setValue" | "getValues">;
  agreementName: string;
  agreementType: string;
  applicableScope: string;
  rawRows: unknown[];
  requireAgreementName?: boolean;
};

/** Sync agreement type from name and handle bipartite ↔ tripartite transitions. */
export function useAgreementTypeEffects<T extends AgreementTypeEffectFields>({
  form,
  agreementName,
  agreementType,
  applicableScope,
  rawRows,
  requireAgreementName = false,
}: UseAgreementTypeEffectsParams<T>) {
  const { setValue, getValues } = form as unknown as AgreementTypeEffectFormApi;
  const prevAgreementTypeRef = useRef(agreementType);

  useEffect(() => {
    const nextType = resolveAgreementTypeUpdate(agreementName, agreementType);
    if (nextType) {
      setValue("agreementType", nextType, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [agreementName, agreementType, requireAgreementName, setValue]);

  useEffect(() => {
    const prev = prevAgreementTypeRef.current;
    prevAgreementTypeRef.current = agreementType;

    const nextScope = resolveGicScopeOnBipartite(agreementType, applicableScope);
    if (nextScope) {
      setValue("applicableScope", nextScope, { shouldDirty: true, shouldValidate: true });
    }

    const nextIds = resolveTripartiteTransitionSelectedIcIds(
      prev,
      agreementType,
      rawRows,
      getValues("selectedIcIds"),
    );
    if (nextIds) {
      setValue("selectedIcIds", nextIds, { shouldDirty: true, shouldValidate: true });
    }
  }, [agreementType, applicableScope, rawRows, setValue, getValues]);
}

/** Standalone-only: reset GIC/GIPSA when agreement type is bipartite. */
export function useStandaloneAgreementTypeEffects<
  T extends StandaloneTypeEffectFields,
>({
  form,
  agreementType,
}: {
  form: Pick<UseFormReturn<T>, "setValue">;
  agreementType: string;
}) {
  const { setValue } = form as unknown as StandaloneTypeEffectFormApi;

  useEffect(() => {
    const reset = resolveBipartiteGicReset(agreementType);
    if (!reset) return;
    setValue("gic", reset.gic, { shouldDirty: false });
    setValue("gipsaPpn", reset.gipsaPpn, { shouldDirty: false });
  }, [agreementType, setValue]);
}

type ScopeRulesFormFields = Pick<AgreementScopeEffectFields, "applicableScope">;

type ScopeRulesFormApi = Pick<UseFormReturn<ScopeRulesFormFields>, "setValue">;

type UseAgreementScopeRulesParams<T extends ScopeRulesFormFields> = {
  form: Pick<UseFormReturn<T>, "setValue">;
  flags: AgreementNameFlags;
  applicableScope: string;
};

/** Auto-set applicable scope from agreement name flags. */
export function useAgreementScopeRules<T extends ScopeRulesFormFields>({
  form,
  flags,
  applicableScope,
}: UseAgreementScopeRulesParams<T>) {
  const { setValue } = form as unknown as ScopeRulesFormApi;

  useEffect(() => {
    const nextScope = resolveApplicableScopeFromFlags(flags, applicableScope);
    if (nextScope) {
      setValue("applicableScope", nextScope, { shouldDirty: true, shouldValidate: true });
      // GIC keeps insurerMappings-driven selectedIcIds; do not wipe them when forcing ALL_INSURER.
      if (nextScope === "ALL_INSURER" && !flags.isGicStandard) {
        setValue("selectedIcIds", [], { shouldDirty: true, shouldValidate: true });
      }
    }
  }, [flags, applicableScope, setValue]);
}

type StandaloneScopeRulesFormFields = ScopeRulesFormFields & {
  gic: string;
  gipsaPpn: string;
};

type StandaloneScopeRulesFormApi = Pick<
  UseFormReturn<StandaloneScopeRulesFormFields>,
  "setValue"
>;

/** Standalone-only: GIC / GIPSA toggles drive applicable scope. */
export function useStandaloneGicScopeRules<T extends StandaloneScopeRulesFormFields>({
  form,
  isTripartite,
  gic,
  gipsaPpn,
}: {
  form: Pick<UseFormReturn<T>, "setValue">;
  isTripartite: boolean;
  gic: string;
  gipsaPpn: string;
}) {
  const { setValue } = form as unknown as StandaloneScopeRulesFormApi;

  useEffect(() => {
    const update = resolveGicScopeUpdate(isTripartite, gic, gipsaPpn);
    if (!update) return;
    if (update.applicableScope) {
      setValue("applicableScope", update.applicableScope, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (update.gipsaPpn) {
      setValue("gipsaPpn", update.gipsaPpn, { shouldDirty: true });
    }
  }, [isTripartite, gic, gipsaPpn, setValue]);
}

type IcRulesFormFields = Pick<AgreementScopeEffectFields, "selectedIcIds"> & {
  selectedIcInvolvementJson?: string;
};

type IcRulesFormApi = Pick<UseFormReturn<IcRulesFormFields>, "setValue" | "getValues">;

type UseAgreementIcRulesParams<T extends IcRulesFormFields> = {
  form: Pick<UseFormReturn<T>, "setValue" | "getValues">;
  flags: AgreementNameFlags;
  effectiveIcOptions: InsurerDropdownOption[];
};

/** Sync selected IC ids for GIC/GIPSA, single-select mode, and allowed options. */
export function useAgreementIcRules<T extends IcRulesFormFields>({
  form,
  flags,
  effectiveIcOptions,
}: UseAgreementIcRulesParams<T>) {
  const { setValue, getValues } = form as unknown as IcRulesFormApi;
  const { selectedIcSingleMode, isGicStandard } = flags;

  useEffect(() => {
    const nextIds = resolveAutoSelectedIcIds();
    if (nextIds) {
      setValue("selectedIcIds", nextIds, { shouldDirty: true, shouldValidate: true });
    }
  }, [setValue]);

  useEffect(() => {
    const currentIds = getValues("selectedIcIds");
    const nextIds = resolveSingleModeSelectedIcIds(
      selectedIcSingleMode,
      currentIds,
    );
    if (nextIds) {
      setValue("selectedIcIds", nextIds, { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedIcSingleMode, getValues, setValue]);

  useEffect(() => {
    const involvementIds =
      parseSelectedIcInvolvementJson(getValues("selectedIcInvolvementJson"))?.map(
        (row) => row.insurerId,
      ) ?? [];

    // Restore mapped ICs from API involvement JSON when selection was cleared.
    const currentIds = normalizeSelectedIcIds(getValues("selectedIcIds"));
    if (currentIds.length === 0 && involvementIds.length > 0) {
      setValue("selectedIcIds", involvementIds, {
        shouldDirty: false,
        shouldValidate: true,
      });
      return;
    }

    // GIC / mapped agreements: never drop API insurer ids just because dropdown options differ.
    if (isGicStandard) return;

    const nextIds = resolveAllowedSelectedIcIds(
      effectiveIcOptions,
      currentIds,
      involvementIds,
    );
    if (nextIds) {
      setValue("selectedIcIds", nextIds, { shouldDirty: true, shouldValidate: true });
    }
  }, [effectiveIcOptions, getValues, isGicStandard, setValue]);
}

type BaseScopeEffectsParams<T extends AgreementScopeEffectFields> = {
  form: Pick<UseFormReturn<T>, "setValue" | "getValues">;
  agreementName: string;
  agreementType: string;
  applicableScope: string;
  flags: AgreementNameFlags;
  effectiveIcOptions: InsurerDropdownOption[];
  rawRows: unknown[];
  requireAgreementName?: boolean;
};

/** Prefill Select insurer when opening New Agreement from a pending network mapping. */
export function useAgreementMappingInsurerPrefill<
  T extends Pick<AgreementScopeEffectFields, "selectedIcIds" | "applicableScope">,
>({
  form,
  mappingInsurer,
  showSelectedIcScopeUi,
  agreementName,
}: {
  form: Pick<UseFormReturn<T>, "setValue" | "getValues">;
  mappingInsurer?: NewAgreementFromMappingNavState | null;
  showSelectedIcScopeUi: boolean;
  agreementName: string;
}) {
  const prefilledRef = useRef(false);
  const { setValue, getValues } = form as unknown as Pick<
    UseFormReturn<AgreementScopeEffectFields>,
    "setValue" | "getValues"
  >;

  useEffect(() => {
    if (prefilledRef.current) return;

    const insurerId = String(mappingInsurer?.insurerId ?? "").trim();
    if (!insurerId || !showSelectedIcScopeUi || !agreementName.trim()) return;

    if (getValues("applicableScope") !== "SELECTED_INSURER") {
      setValue("applicableScope", "SELECTED_INSURER", {
        shouldDirty: false,
        shouldValidate: true,
      });
    }

    const current = normalizeSelectedIcIds(getValues("selectedIcIds"));
    if (current.length !== 1 || current[0] !== insurerId) {
      setValue("selectedIcIds", [insurerId], {
        shouldDirty: false,
        shouldValidate: true,
      });
    }

    prefilledRef.current = true;
  }, [mappingInsurer, showSelectedIcScopeUi, agreementName, setValue, getValues]);
}

/** Shared scope/type/IC/document effects used by hospital and standalone flows. */
export function useBaseAgreementScopeEffects<T extends AgreementScopeEffectFields>({
  form,
  agreementName,
  agreementType,
  applicableScope,
  flags,
  effectiveIcOptions,
  rawRows,
  requireAgreementName = false,
}: BaseScopeEffectsParams<T>) {
  useAgreementTypeEffects({
    form,
    agreementName,
    agreementType,
    applicableScope,
    rawRows,
    requireAgreementName,
  });

  useAgreementScopeRules({
    form,
    flags,
    applicableScope,
  });

  useAgreementIcRules({
    form,
    flags,
    effectiveIcOptions,
  });
}
