import { useEffect, useState } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchProviderCheckPpnStateCity } from "@/store/features/providerAgreement/providerAgreementSlice";
import type { NormalizedCheckPpnStateCityValidation } from "@/store/features/providerAgreement/providerAgreementTypes";
import type { AgreementFullFormValues } from "../utils/agreementFormConfig";
import type { GipsaPpnDropdownOption } from "../utils/agreementGipsaPpnNormalizer";
import type { PpnCheckValidationScope } from "../utils/agreementHelpers";
import {
  mapCheckPpnToFormHydration,
  resolvePpnHydrationForForm,
} from "../utils/agreementPpnHydration";

export type PpnCriteriaStatus = "verified" | "not_verified" | null;

type UseAgreementGipsaPpnCheckArgs = {
  providerId?: string;
  /** When false, skip the check API entirely. */
  enabled?: boolean;
  /** PSU tripartite checks state only; GIPSA checks city only. */
  validationScope?: PpnCheckValidationScope;
  setValue: UseFormSetValue<AgreementFullFormValues>;
  getValues?: UseFormGetValues<AgreementFullFormValues>;
  /** Keep agreement-saved PPN values on edit; only fill blanks from the check API. */
  preserveExistingValues?: boolean;
};

export function isGipsaPpnValidationPassed(
  validation:
    | Pick<
        NormalizedCheckPpnStateCityValidation,
        "providerGipsaPpnCityAvailable"
      >
    | null
    | undefined,
): boolean {
  return validation?.providerGipsaPpnCityAvailable === true;
}

export function isPsuPpnStateValidationPassed(
  validation:
    | Pick<
        NormalizedCheckPpnStateCityValidation,
        "providerGipsaPpnStateAvailable"
      >
    | null
    | undefined,
): boolean {
  return validation?.providerGipsaPpnStateAvailable === true;
}

/** PSU Tripartite requires PPN state only — city must not be available. */
export function isPsuPpnValidationPassed(
  validation:
    | Pick<
        NormalizedCheckPpnStateCityValidation,
        "providerGipsaPpnStateAvailable" | "providerGipsaPpnCityAvailable"
      >
    | null
    | undefined,
): boolean {
  if (!isPsuPpnStateValidationPassed(validation)) return false;
  return validation?.providerGipsaPpnCityAvailable !== true;
}


function resolveFieldStatus(available: boolean | null, message: string): PpnCriteriaStatus {
  if (available === true) return "verified";
  if (available === false) return "not_verified";
  if (message.trim()) return "not_verified";
  return null;
}

function resolveFieldMessage(available: boolean | null, message: string): string {
  if (available === false && message.trim()) return message;
  return "";
}

function applyPpnHydrationToForm(
  hydration: ReturnType<typeof mapCheckPpnToFormHydration>,
  setValue: UseFormSetValue<AgreementFullFormValues>,
  shouldDirty: boolean,
) {
  setValue("ppnState", hydration.ppnState, {
    shouldDirty,
    shouldValidate: true,
  });
  setValue("ppnCity", hydration.ppnCity, {
    shouldDirty,
    shouldValidate: true,
  });
  setValue("ppnStateName", hydration.ppnStateName, {
    shouldDirty,
    shouldValidate: false,
  });
  setValue("ppnCityName", hydration.ppnCityName, {
    shouldDirty,
    shouldValidate: false,
  });
}

function resolveCityValidationResult(
  validationScope: PpnCheckValidationScope,
  data: NormalizedCheckPpnStateCityValidation,
  cityMessage: string,
  psuPpnCityRequirementMessage: string,
): { status: PpnCriteriaStatus; message: string } {
  if (validationScope === "state-only") {
    if (data.providerGipsaPpnCityAvailable === true) {
      return {
        status: "not_verified",
        message: psuPpnCityRequirementMessage,
      };
    }
    return { status: null, message: "" };
  }

  return {
    status: resolveFieldStatus(data.providerGipsaPpnCityAvailable, cityMessage),
    message: cityMessage,
  };
}

function isPpnValidationPassedForScope(
  validationScope: PpnCheckValidationScope,
  data: NormalizedCheckPpnStateCityValidation,
): boolean {
  return validationScope === "state-only"
    ? isPsuPpnValidationPassed(data)
    : isGipsaPpnValidationPassed(data);
}

function clearPpnFormFieldsOnCheckError(
  setValue: UseFormSetValue<AgreementFullFormValues>,
  setPpnStateOptions: (options: GipsaPpnDropdownOption[]) => void,
  setPpnCityOptions: (options: GipsaPpnDropdownOption[]) => void,
) {
  setValue("ppnState", "", { shouldDirty: true, shouldValidate: true });
  setValue("ppnCity", "", { shouldDirty: true, shouldValidate: true });
  setValue("ppnStateName", "", { shouldDirty: true, shouldValidate: false });
  setValue("ppnCityName", "", { shouldDirty: true, shouldValidate: false });
  setPpnStateOptions([]);
  setPpnCityOptions([]);
}

type ApplyPpnCheckSuccessArgs = {
  data: NormalizedCheckPpnStateCityValidation;
  validationScope: PpnCheckValidationScope;
  hydration: ReturnType<typeof mapCheckPpnToFormHydration>;
  setValue: UseFormSetValue<AgreementFullFormValues>;
  preserveExistingValues: boolean;
  setPpnStateStatus: (status: PpnCriteriaStatus) => void;
  setPpnCityStatus: (status: PpnCriteriaStatus) => void;
  setPpnStateMessage: (message: string) => void;
  setPpnCityMessage: (message: string) => void;
  setPpnStateOptions: (options: GipsaPpnDropdownOption[]) => void;
  setPpnCityOptions: (options: GipsaPpnDropdownOption[]) => void;
  setIsPpnValidationPassed: (passed: boolean) => void;
  psuPpnCityRequirementMessage: string;
};

function applyPpnCheckSuccess({
  data,
  validationScope,
  hydration,
  setValue,
  preserveExistingValues,
  setPpnStateStatus,
  setPpnCityStatus,
  setPpnStateMessage,
  setPpnCityMessage,
  setPpnStateOptions,
  setPpnCityOptions,
  setIsPpnValidationPassed,
  psuPpnCityRequirementMessage,
}: ApplyPpnCheckSuccessArgs) {
  applyPpnHydrationToForm(hydration, setValue, !preserveExistingValues);
  setPpnStateOptions(hydration.stateOptions);
  setPpnCityOptions(hydration.cityOptions);

  const stateMessage = resolveFieldMessage(
    data.providerGipsaPpnStateAvailable,
    data.providerGipsaPpnStateMessage,
  );
  const cityMessage = resolveFieldMessage(
    data.providerGipsaPpnCityAvailable,
    data.providerGipsaPpnCityMessage,
  );
  const cityValidation = resolveCityValidationResult(
    validationScope,
    data,
    cityMessage,
    psuPpnCityRequirementMessage,
  );

  setPpnStateStatus(
    validationScope === "city-only"
      ? null
      : resolveFieldStatus(data.providerGipsaPpnStateAvailable, stateMessage),
  );
  setPpnCityStatus(cityValidation.status);
  setPpnCityMessage(cityValidation.message);
  setPpnStateMessage(validationScope === "city-only" ? "" : stateMessage);
  setIsPpnValidationPassed(isPpnValidationPassedForScope(validationScope, data));
}

type ApplyPpnCheckFailureArgs = {
  error: unknown;
  validationScope: PpnCheckValidationScope;
  preserveExistingValues: boolean;
  setValue: UseFormSetValue<AgreementFullFormValues>;
  setPpnStateStatus: (status: PpnCriteriaStatus) => void;
  setPpnCityStatus: (status: PpnCriteriaStatus) => void;
  setPpnStateMessage: (message: string) => void;
  setPpnStateOptions: (options: GipsaPpnDropdownOption[]) => void;
  setPpnCityOptions: (options: GipsaPpnDropdownOption[]) => void;
  setIsPpnValidationPassed: (passed: boolean) => void;
};

function applyPpnCheckFailure({
  error,
  validationScope,
  preserveExistingValues,
  setValue,
  setPpnStateStatus,
  setPpnCityStatus,
  setPpnStateMessage,
  setPpnStateOptions,
  setPpnCityOptions,
  setIsPpnValidationPassed,
}: ApplyPpnCheckFailureArgs) {
  setPpnStateStatus(validationScope === "city-only" ? null : "not_verified");
  setPpnCityStatus(validationScope === "state-only" ? null : "not_verified");
  setIsPpnValidationPassed(false);

  if (!preserveExistingValues) {
    clearPpnFormFieldsOnCheckError(setValue, setPpnStateOptions, setPpnCityOptions);
  }

  const message = typeof error === "string" ? error : "";
  if (message) {
    setPpnStateMessage(message);
  }
}

export function useAgreementGipsaPpnCheck({
  providerId,
  enabled = true,
  validationScope = "both",
  setValue,
  getValues,
  preserveExistingValues = false,
}: UseAgreementGipsaPpnCheckArgs) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const psuPpnCityRequirementMessage = t(
    "providerMaster.agreement.psuPpnCityCreateGipsaAgreement",
  );
  const { id: routeProviderId } = useParams<{ id: string }>();
  const [ppnStateStatus, setPpnStateStatus] = useState<PpnCriteriaStatus>(null);
  const [ppnCityStatus, setPpnCityStatus] = useState<PpnCriteriaStatus>(null);
  const [ppnStateMessage, setPpnStateMessage] = useState("");
  const [ppnCityMessage, setPpnCityMessage] = useState("");
  const [isPpnValidationPassed, setIsPpnValidationPassed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [ppnStateOptions, setPpnStateOptions] = useState<GipsaPpnDropdownOption[]>([]);
  const [ppnCityOptions, setPpnCityOptions] = useState<GipsaPpnDropdownOption[]>([]);

  useEffect(() => {
    if (!enabled) {
      setPpnStateStatus(null);
      setPpnCityStatus(null);
      setPpnStateMessage("");
      setPpnCityMessage("");
      setPpnStateOptions([]);
      setPpnCityOptions([]);
      setIsPpnValidationPassed(true);
      setIsChecking(false);
      return;
    }

    const resolvedProviderId = providerId?.trim() || routeProviderId?.trim();
    if (!resolvedProviderId) return;

    let cancelled = false;

    setIsChecking(true);
    setPpnStateStatus(null);
    setPpnCityStatus(null);
    setPpnStateMessage("");
    setPpnCityMessage("");
    setPpnStateOptions([]);
    setPpnCityOptions([]);
    setIsPpnValidationPassed(false);

    (async () => {
      try {
        const result = await dispatch(
          fetchProviderCheckPpnStateCity({
            providerId: resolvedProviderId,
            validationOnly: true,
          }),
        ).unwrap();

        if (cancelled) return;

        setIsChecking(false);

        const hydration = resolvePpnHydrationForForm(
          mapCheckPpnToFormHydration(result.data),
          getValues?.() ?? {
            ppnState: "",
            ppnCity: "",
            ppnStateName: "",
            ppnCityName: "",
          },
          preserveExistingValues,
        );

        applyPpnCheckSuccess({
          data: result.data,
          validationScope,
          hydration,
          setValue,
          preserveExistingValues,
          setPpnStateStatus,
          setPpnCityStatus,
          setPpnStateMessage,
          setPpnCityMessage,
          setPpnStateOptions,
          setPpnCityOptions,
          setIsPpnValidationPassed,
          psuPpnCityRequirementMessage,
        });
      } catch (error) {
        if (cancelled) return;

        setIsChecking(false);
        applyPpnCheckFailure({
          error,
          validationScope,
          preserveExistingValues,
          setValue,
          setPpnStateStatus,
          setPpnCityStatus,
          setPpnStateMessage,
          setPpnStateOptions,
          setPpnCityOptions,
          setIsPpnValidationPassed,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    providerId,
    routeProviderId,
    setValue,
    getValues,
    preserveExistingValues,
    dispatch,
    validationScope,
    psuPpnCityRequirementMessage,
  ]);

  return {
    ppnStateStatus: isChecking ? null : ppnStateStatus,
    ppnCityStatus: isChecking ? null : ppnCityStatus,
    ppnStateMessage: isChecking ? "" : ppnStateMessage,
    ppnCityMessage: isChecking ? "" : ppnCityMessage,
    ppnStateOptions,
    ppnCityOptions,
    isPpnValidationPassed: !enabled || (!isChecking && isPpnValidationPassed),
    isChecking,
  };
}
