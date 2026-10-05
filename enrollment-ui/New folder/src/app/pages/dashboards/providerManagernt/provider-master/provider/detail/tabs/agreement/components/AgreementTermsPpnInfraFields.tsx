import { useEffect, useMemo } from "react";
import type {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import {
  CheckBadgeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import type { AgreementFullFormValues } from "../utils/agreementFormConfig";
import type { AgreementNameFlags } from "../utils/agreementHelpers";
import {
  resolvePpnCheckValidationScope,
  usesPpnStateCityFields,
} from "../utils/agreementHelpers";
import { mergePpnDropdownOption } from "../utils/agreementGipsaPpnNormalizer";
import {
  useAgreementGipsaPpnCheck,
  type PpnCriteriaStatus,
} from "../hooks/useAgreementGipsaPpnCheck";

type AgreementTermsPpnInfraFieldsProps = {
  control: Control<AgreementFullFormValues>;
  errors: FieldErrors<AgreementFullFormValues>;
  getFieldError?: (name: keyof AgreementFullFormValues) => string | undefined;
  flags: AgreementNameFlags;
  mode?: "create" | "edit";
  providerId?: string;
  setValue: UseFormSetValue<AgreementFullFormValues>;
  getValues?: UseFormGetValues<AgreementFullFormValues>;
  agreementTermsPpnRowClass: string;
  onPpnValidationChange?: (state: {
    isGipsaPpnTripartite: boolean;
    isPsuTripartite: boolean;
    isChecking: boolean;
    isPpnValidationPassed: boolean;
  }) => void;
};

const PPN_DROPDOWN_CLASS = "h-8 rounded-l-md rounded-r-none text-xs";

function resolvePpnFieldStatus(disabled: boolean): PpnCriteriaStatus {
  if (disabled) return "not_verified";
  return null;
}

function getPpnStatusButtonClass(status: PpnCriteriaStatus): string {
  if (status === "verified") {
    return "bg-emerald-600 text-white hover:bg-emerald-700";
  }
  if (status === "not_verified") {
    return "bg-red-600 text-white hover:bg-red-700";
  }
  return "bg-blue-600 text-white hover:bg-blue-700";
}

function getPpnStatusTitle(
  status: PpnCriteriaStatus,
  isGipsaCheck: boolean,
  errorMessage?: string,
): string {
  if (status === "not_verified" && errorMessage?.trim()) {
    return errorMessage.trim();
  }
  if (isGipsaCheck) {
    if (status === "verified") return "PPN criteria met";
    if (status === "not_verified") return "PPN criteria not met";
    return "Checking PPN criteria...";
  }
  if (status === "verified") return "PPN value selected";
  if (status === "not_verified") return "PPN field not applicable";
  return "Select a PPN value";
}

function renderPpnStatusIcon(status: PpnCriteriaStatus) {
  if (status === "verified") return <CheckCircleIcon className="h-4 w-4" />;
  if (status === "not_verified") return <XCircleIcon className="h-4 w-4" />;
  return <CheckBadgeIcon className="h-4 w-4" />;
}

function PpnFieldStatusIndicator({
  status,
  isGipsaCheck,
  errorMessage,
}: Readonly<{
  status: PpnCriteriaStatus;
  isGipsaCheck: boolean;
  errorMessage?: string;
}>) {
  const title = getPpnStatusTitle(status, isGipsaCheck, errorMessage);

  return (
    <div
      className={`flex h-full min-h-[34px] w-10 items-center justify-center rounded-r-sm ${getPpnStatusButtonClass(status)}`}
      title={title}
      aria-label={title}
    >
      {renderPpnStatusIcon(status)}
    </div>
  );
}

function resolvePpnCityFieldStatus(
  runPpnCheck: boolean,
  ppnValidationScope: ReturnType<typeof resolvePpnCheckValidationScope>,
  gipsaPpnCityStatus: PpnCriteriaStatus,
  defaultPpnCityStatus: PpnCriteriaStatus,
): PpnCriteriaStatus | null {
  if (runPpnCheck) return gipsaPpnCityStatus;
  return defaultPpnCityStatus;
}

function resolveDisplayedPpnStateStatus(
  runPpnCheck: boolean,
  validationScope: ReturnType<typeof resolvePpnCheckValidationScope>,
  checkStatus: PpnCriteriaStatus,
  isGipsaPpnTripartite: boolean,
  ppnStateValue: string,
  defaultStatus: PpnCriteriaStatus,
): PpnCriteriaStatus {
  if (runPpnCheck && validationScope !== "city-only") return checkStatus;
  if (isGipsaPpnTripartite) return ppnStateValue.trim() ? "verified" : null;
  return defaultStatus;
}

function mergeFieldError(
  apiMessage: string,
  formError: FieldErrors<AgreementFullFormValues>["ppnState"],
  visibleMessage?: string,
) {
  if (apiMessage) {
    return { type: "manual", message: apiMessage };
  }
  if (visibleMessage) {
    return { type: "validation", message: visibleMessage };
  }
  return formError;
}

export function AgreementTermsPpnInfraFields({
  control,
  errors,
  getFieldError,
  flags,
  mode = "create",
  providerId,
  setValue,
  getValues,
  agreementTermsPpnRowClass,
  onPpnValidationChange,
}: Readonly<AgreementTermsPpnInfraFieldsProps>) {
  const {
    isGipsaPpnTripartite,
    isPsuTripartite,
    isTpaBipartite,
    isInsurerBipartite,
  } = flags;
  const showPpnFields = usesPpnStateCityFields(flags);

  const ppnStateValue = String(useWatch({ control, name: "ppnState" }) ?? "");
  const ppnCityValue = String(useWatch({ control, name: "ppnCity" }) ?? "");
  const ppnStateName = String(useWatch({ control, name: "ppnStateName" }) ?? "");
  const ppnCityName = String(useWatch({ control, name: "ppnCityName" }) ?? "");

  const ppnStateDisabled =
    isTpaBipartite || isInsurerBipartite || isGipsaPpnTripartite;
  const ppnCityDisabled = ppnStateDisabled || isPsuTripartite;
  const ppnStateRequired = isGipsaPpnTripartite || isPsuTripartite;
  const ppnCityRequired = isGipsaPpnTripartite;

  const runPpnCheck =
    showPpnFields && (isGipsaPpnTripartite || isPsuTripartite);
  const ppnValidationScope = resolvePpnCheckValidationScope(flags);

  const {
    ppnStateStatus: gipsaPpnStateStatus,
    ppnCityStatus: gipsaPpnCityStatus,
    ppnStateMessage,
    ppnCityMessage,
    ppnStateOptions: checkStateOptions,
    ppnCityOptions: checkCityOptions,
    isPpnValidationPassed,
    isChecking,
  } = useAgreementGipsaPpnCheck({
    providerId,
    enabled: runPpnCheck,
    validationScope: ppnValidationScope,
    setValue,
    getValues,
    preserveExistingValues: mode === "edit",
  });

  const ppnStateOptions = useMemo(
    () =>
      mergePpnDropdownOption(
        checkStateOptions,
        ppnStateValue,
        ppnStateName,
      ),
    [checkStateOptions, ppnStateValue, ppnStateName],
  );

  const ppnCityOptions = useMemo(
    () =>
      mergePpnDropdownOption(checkCityOptions, ppnCityValue, ppnCityName),
    [checkCityOptions, ppnCityValue, ppnCityName],
  );

  const defaultPpnStateStatus = resolvePpnFieldStatus(ppnStateDisabled);
  const defaultPpnCityStatus = resolvePpnFieldStatus(ppnCityDisabled);

  const ppnStateStatus = resolveDisplayedPpnStateStatus(
    runPpnCheck,
    ppnValidationScope,
    gipsaPpnStateStatus,
    isGipsaPpnTripartite,
    ppnStateValue,
    defaultPpnStateStatus,
  );

  const ppnCityStatus = resolvePpnCityFieldStatus(
    runPpnCheck,
    ppnValidationScope,
    gipsaPpnCityStatus,
    defaultPpnCityStatus,
  );

  // GIPSA does not validate PPN state; PSU still shows the state check message.
  const visiblePpnStateMessage =
    runPpnCheck && !isGipsaPpnTripartite ? ppnStateMessage : "";
  const visiblePpnCityMessage = runPpnCheck ? ppnCityMessage : "";

  useEffect(() => {
    onPpnValidationChange?.({
      isGipsaPpnTripartite,
      isPsuTripartite,
      isChecking,
      isPpnValidationPassed,
    });
  }, [
    isGipsaPpnTripartite,
    isPsuTripartite,
    isChecking,
    isPpnValidationPassed,
    onPpnValidationChange,
  ]);

  if (!showPpnFields) {
    return null;
  }

  return (
    <div className={agreementTermsPpnRowClass}>
      <div className="min-w-0">
        <DropdownSelect
          label="PPN State"
          name="ppnState"
          name_key="ppnState"
          control={control}
          options={ppnStateOptions}
          defaultValue="Select state"
          isRequired={ppnStateRequired}
          errors={mergeFieldError(
            visiblePpnStateMessage,
            errors.ppnState,
            getFieldError?.("ppnState"),
          )}
          disabled={ppnStateDisabled}
          enableSearchFetch={false}
          className={PPN_DROPDOWN_CLASS}
          formClassName="min-w-0"
          suffix={
            <PpnFieldStatusIndicator
              status={ppnStateStatus}
              isGipsaCheck={runPpnCheck && ppnValidationScope !== "city-only"}
              errorMessage={visiblePpnStateMessage}
            />
          }
        />
      </div>
      <div className="min-w-0">
        <DropdownSelect
          label="PPN City"
          name="ppnCity"
          name_key="ppnCity"
          control={control}
          options={ppnCityOptions}
          defaultValue="Select city"
          isRequired={ppnCityRequired}
          errors={mergeFieldError(
            visiblePpnCityMessage,
            errors.ppnCity,
            getFieldError?.("ppnCity"),
          )}
          disabled={ppnCityDisabled}
          enableSearchFetch={false}
          className={PPN_DROPDOWN_CLASS}
          formClassName="min-w-0"
          suffix={
            <PpnFieldStatusIndicator
              status={ppnCityStatus}
              isGipsaCheck={
                runPpnCheck &&
                (ppnValidationScope !== "state-only" || Boolean(ppnCityMessage.trim()))
              }
              errorMessage={visiblePpnCityMessage}
            />
          }
        />
      </div>
    </div>
  );
}
