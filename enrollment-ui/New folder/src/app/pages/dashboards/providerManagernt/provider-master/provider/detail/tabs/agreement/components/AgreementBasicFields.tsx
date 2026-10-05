import { useMemo } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import {
  getAgreementFormTypeOptions,
  AGREEMENT_NAME_OPTIONS,
} from "../utils/agreementFormConfig";
import type { AgreementFullFormValues } from "../utils/agreementFormConfig";

type AgreementBasicFieldsProps = {
  control: Control<AgreementFullFormValues>;
  errors: FieldErrors<AgreementFullFormValues>;
  dropdownFieldError?: (
    name: keyof AgreementFullFormValues,
  ) => FieldErrors<AgreementFullFormValues>[keyof AgreementFullFormValues];
  variant: "hospital" | "standalone";
  mode: "create" | "edit";
  agreementNameOptions?: typeof AGREEMENT_NAME_OPTIONS;
  disableAgreementName?: boolean;
  /** When set, overrides the default responsive field grid (e.g. split-column layout). */
  fieldsGridClassName?: string;
};

export function AgreementBasicFields({
  control,
  errors,
  dropdownFieldError,
  variant,
  mode,
  agreementNameOptions,
  disableAgreementName = false,
  fieldsGridClassName,
}: Readonly<AgreementBasicFieldsProps>) {
  const { t } = useTranslation();
  const agreementType = useWatch({ control, name: "agreementType" });
  const agreementTypeOptions = useMemo(
    () => getAgreementFormTypeOptions(String(agreementType ?? "")),
    [agreementType],
  );
  const resolvedAgreementNameOptions = agreementNameOptions ?? AGREEMENT_NAME_OPTIONS;

  const gridClassName =
    fieldsGridClassName ??
    "grid grid-cols-1 gap-x-3 gap-y-1.5 px-3 py-1.5 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={gridClassName}>
      <div className={`min-w-0 ${variant === "standalone" ? "lg:col-span-1" : ""}`}>
        <DropdownSelect
          label={t("providerMaster.agreement.fields.agreementName")}
          name="agreementName"
          name_key="agreementName"
          control={control}
          options={resolvedAgreementNameOptions}
          defaultValue={t("providerMaster.agreement.fields.selectAgreementName")}
          isRequired={variant === "standalone"}
          errors={dropdownFieldError?.("agreementName") ?? errors.agreementName}
          disabled={mode === "edit" || disableAgreementName}
          formClassName={variant === "standalone" ? "min-w-0" : undefined}
          className="h-8 rounded-md text-xs"
        />
      </div>
      <div className="min-w-0">
        <DropdownSelect
          label={t("providerMaster.agreement.fields.agreementType")}
          name="agreementType"
          name_key="agreementType"
          control={control}
          options={agreementTypeOptions}
          defaultValue={t("providerMaster.agreement.fields.agreementType")}
          isRequired
          errors={dropdownFieldError?.("agreementType") ?? errors.agreementType}
          disabled
          formClassName={variant === "standalone" ? "min-w-0" : undefined}
          className="h-8 rounded-md text-xs"
        />
      </div>
    </div>
  );
}
