import {
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import FormLayout from "@/components/shared/form/FormLayout";
import { Button, Checkbox } from "@/components/ui";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import {
  PROVIDER_ACTION_BUTTON_CLASS,
  PROVIDER_FORM_BUTTON_CLASS,
} from "../../shared/providerButtonStyles";
import {
  COMM_MODE_OPTIONS,
  CONFIG_TYPE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  getConfigTypeLabel,
  getDocumentTypeLabel,
  getIcCodesFromInsurerIds,
  getIcCodeFromName,
  getMatchingFieldsLabel,
  normalizeFormValues,
  type NewConfigurationFormValues,
} from "./config";
import type { IcProvisionRow } from "./dummyData";

type ConfigurationFormProps = {
  initialValues?: NewConfigurationFormValues;
  recordId?: string;
  icCode?: string;
  canWrite?: boolean;
  onCancel: () => void;
  onSave: (row: IcProvisionRow, formValues: NewConfigurationFormValues) => void;
};

function FormSection({
  title,
  children,
  className,
}: Readonly<{
  title: string;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <section className={clsx("space-y-3", className)}>
      <h3 className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:text-dark-300">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FieldBox({
  label,
  required,
  error,
  children,
}: Readonly<{ label?: string; required?: boolean; error?: string; children: ReactNode }>) {
  return (
    <div
      className={clsx(
        "rounded-lg border bg-gray-50/60 p-3 dark:bg-dark-600/20",
        error
          ? "border-red-400 dark:border-red-500/70"
          : "border-gray-200 dark:border-dark-500",
      )}
    >
      {label ? (
        <p className="mb-2 text-xs font-medium text-gray-700 dark:text-dark-100">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </p>
      ) : null}
      {children}
      {error ? <p className="mt-1 text-[10px] text-red-600">{error}</p> : null}
    </div>
  );
}

export function ConfigurationForm({
  initialValues,
  recordId,
  icCode,
  canWrite = true,
  onCancel,
  onSave,
}: Readonly<ConfigurationFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const insurerList = useAppSelector((state) => state.insurerList.insurerList);
  const [showAddIcPanel, setShowAddIcPanel] = useState(false);
  const isEdit = Boolean(recordId);
  const [isEditing, setIsEditing] = useState(!isEdit);
  const readOnly = isEdit && !isEditing;

  const {
    control,
    handleSubmit,
    register,
    setValue,
    clearErrors,
    watch,
    reset,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<NewConfigurationFormValues>({
    defaultValues: normalizeFormValues(initialValues),
  });

  const insuranceCompanies = watch("insuranceCompany");

  useEffect(() => {
    reset(normalizeFormValues(initialValues));
  }, [initialValues, reset]);

  useEffect(() => {
    if ((insurerList?.length ?? 0) > 0) return;
    dispatch(fetchInsurerList());
  }, [dispatch, insurerList]);

  const icOptions = useMemo(
    () =>
      (insurerList ?? []).map((insurer) => ({
        value: insurer.insurerId,
        label: insurer.insurerName,
      })),
    [insurerList],
  );

  useEffect(() => {
    if (insuranceCompanies?.length || !icOptions.length) return;

    if (isEdit && icCode) {
      const matched = icOptions.filter(
        (option) =>
          icCode
            .split(",")
            .map((code) => code.trim())
            .includes(getIcCodeFromName(String(option.label))),
      );
      if (matched.length) {
        setValue(
          "insuranceCompany",
          matched.map((option) => String(option.value)),
        );
        return;
      }
    }

    if (isEdit) return;

    const unitedIndia = icOptions.find((option) =>
      String(option.label).toLowerCase().includes("united india"),
    );
    const defaultId = unitedIndia?.value ?? icOptions[0]?.value;
    if (defaultId) setValue("insuranceCompany", [String(defaultId)]);
  }, [icCode, icOptions, insuranceCompanies, isEdit, setValue]);

  const onSubmit = (values: NewConfigurationFormValues) => {
    const normalized = normalizeFormValues(values);

    onSave(
      {
        id: recordId ?? crypto.randomUUID(),
        icCode: getIcCodesFromInsurerIds(normalized.insuranceCompany, icOptions),
        configType: getConfigTypeLabel(normalized.configType),
        fileType: getDocumentTypeLabel(normalized.documentType),
        matchingFields: getMatchingFieldsLabel(
          normalized.matchingPan,
          normalized.matchingRohini,
        ),
        frequency: normalized.frequency === "DAILY" ? "Daily" : normalized.frequency,
        commMode: normalized.commMode,
        passwordProtected: normalized.passwordProtected,
        formValues: normalized,
      },
      normalized,
    );
  };

  const handleApplyNewIc = () => {
    const selectedIds = watch("newIcFromMaster");
    if (!selectedIds?.length) return;
    const merged = [...new Set([...(insuranceCompanies ?? []), ...selectedIds.map(String)])];
    setValue("insuranceCompany", merged);
    setShowAddIcPanel(false);
    setValue("newIcFromMaster", []);
  };

  const arrayRequiredRule = (message: string) => ({
    validate: (value: string[]) =>
      (Array.isArray(value) && value.length > 0) || message,
  });

  const validateMatchingFields = () => {
    const { matchingPan, matchingRohini } = getValues();
    return (
      matchingPan ||
      matchingRohini ||
      t("providerMaster.icProvisioning.validation.matchingFieldsRequired")
    );
  };

  const matchingPanField = register("matchingPan", {
    validate: validateMatchingFields,
  });
  const matchingRohiniField = register("matchingRohini");

  const handleFooterCancel = () => {
    if (isEdit && isEditing) {
      reset(normalizeFormValues(initialValues));
      setShowAddIcPanel(false);
      setIsEditing(false);
      clearErrors();
      return;
    }
    onCancel();
  };

  const dropdownClass = "text-xs";
  const fieldDisabled = readOnly;

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-200/60 dark:border-dark-500 dark:bg-dark-700 dark:ring-dark-500/40">
      <div className="border-b border-gray-200 bg-gray-50/80 px-5 py-3.5 dark:border-dark-500 dark:bg-dark-600/30">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-50">
          {isEdit
            ? t("providerMaster.icProvisioning.editConfigurationTitle")
            : t("providerMaster.icProvisioning.newConfigurationTitle")}
        </h2>
      </div>

      <FormLayout FormClassName="px-5 py-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
          <FormSection title={t("providerMaster.icProvisioning.form.fileConfiguration")}>
            <DropdownSelect
              name="configType"
              control={control}
              label={t("providerMaster.icProvisioning.form.configurationType")}
              options={CONFIG_TYPE_OPTIONS}
              formClassName={dropdownClass}
              multiselect
              is_select_checkbox
              multiselectHorizontalScroll
              isRequired
              disabled={fieldDisabled}
              errors={errors.configType}
              rules={arrayRequiredRule(
                t("providerMaster.icProvisioning.validation.configTypeRequired"),
              )}
            />
            <DropdownSelect
              name="documentType"
              control={control}
              label={t("providerMaster.icProvisioning.form.documentType")}
              options={DOCUMENT_TYPE_OPTIONS}
              formClassName={dropdownClass}
              multiselect
              is_select_checkbox
              multiselectHorizontalScroll
              isRequired
              disabled={fieldDisabled}
              errors={errors.documentType}
              rules={arrayRequiredRule(
                t("providerMaster.icProvisioning.validation.documentTypeRequired"),
              )}
            />
            <DropdownSelect
              name="frequency"
              control={control}
              label={t("providerMaster.icProvisioning.form.frequency")}
              options={FREQUENCY_OPTIONS}
              formClassName={dropdownClass}
              isRequired
              disabled={fieldDisabled}
              errors={errors.frequency}
              rules={{
                required: t("providerMaster.icProvisioning.validation.frequencyRequired"),
              }}
            />
            <FieldBox>
              <Checkbox
                {...register("passwordProtected")}
                disabled={fieldDisabled}
                label={t("providerMaster.icProvisioning.form.passwordProtected")}
              />
            </FieldBox>
          </FormSection>

          <FormSection title={t("providerMaster.icProvisioning.form.insuranceSetup")}>
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <DropdownSelect
                  name="insuranceCompany"
                  control={control}
                  label={t("providerMaster.icProvisioning.form.insuranceCompany")}
                  options={icOptions}
                  formClassName={dropdownClass}
                  multiselect
                  is_select_checkbox
                  multiselectHorizontalScroll
                  isRequired
                  disabled={fieldDisabled}
                  errors={errors.insuranceCompany}
                  rules={arrayRequiredRule(
                    t("providerMaster.icProvisioning.validation.insuranceCompanyRequired"),
                  )}
                />
              </div>
              {!readOnly && (
              <Button
                type="button"
                variant="outlined"
                className="mb-0.5 h-9 w-9 shrink-0 px-0"
                onClick={() => setShowAddIcPanel((open) => !open)}
                title={t("providerMaster.icProvisioning.form.addNewIc")}
              >
                <PlusIcon className="size-4" />
              </Button>
              )}
            </div>

            {showAddIcPanel && !readOnly && (
              <div className="rounded-md border border-primary-200 bg-primary-50/60 px-2.5 py-2 dark:border-primary-500/30 dark:bg-primary-500/10">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-dark-100">
                    {t("providerMaster.icProvisioning.form.addNewIc")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddIcPanel(false);
                      setValue("newIcFromMaster", []);
                    }}
                    className="text-gray-500 hover:text-gray-800 dark:text-dark-200"
                    aria-label={t("providerMaster.button.cancel")}
                  >
                    <XMarkIcon className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-end gap-1.5">
                  <div className="min-w-0 flex-1">
                    <DropdownSelect
                      name="newIcFromMaster"
                      control={control}
                      options={icOptions}
                      label={t("providerMaster.icProvisioning.form.selectIcFromMaster")}
                      formClassName={dropdownClass}
                      multiselect
                      is_select_checkbox
                      multiselectHorizontalScroll
                    />
                  </div>
                  <Button
                    type="button"
                    color="primary"
                    className="mb-0.5 h-8 shrink-0 px-3 text-xs"
                    onClick={handleApplyNewIc}
                  >
                    {t("providerMaster.button.add")}
                  </Button>
                </div>
              </div>
            )}

            <FieldBox
              label={t("providerMaster.icProvisioning.form.matchingFields")}
              required
              error={errors.matchingPan?.message}
            >
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Checkbox
                  {...matchingPanField}
                  disabled={fieldDisabled}
                  onChange={(event) => {
                    matchingPanField.onChange(event);
                    trigger("matchingPan").catch(() => undefined);
                  }}
                  label={t("providerMaster.icProvisioning.form.panNumber")}
                />
                <Checkbox
                  {...matchingRohiniField}
                  disabled={fieldDisabled}
                  onChange={(event) => {
                    matchingRohiniField.onChange(event);
                    trigger("matchingPan").catch(() => undefined);
                  }}
                  label={t("providerMaster.icProvisioning.form.rohiniCode")}
                />
              </div>
            </FieldBox>

            <DropdownSelect
              name="commMode"
              control={control}
              label={t("providerMaster.icProvisioning.form.communicationMode")}
              options={COMM_MODE_OPTIONS}
              formClassName={dropdownClass}
              isRequired
              disabled={fieldDisabled}
              errors={errors.commMode}
              rules={{
                required: t("providerMaster.icProvisioning.validation.commModeRequired"),
              }}
            />
          </FormSection>
        </div>

        <div className="-mx-5 mt-2 flex justify-end gap-2 border-t border-gray-200 px-2.5 py-2 dark:border-dark-500">
          <Button
            type="button"
            variant="outlined"
            className={PROVIDER_FORM_BUTTON_CLASS}
            onClick={handleFooterCancel}
          >
            {t("providerMaster.button.cancel")}
          </Button>
          {isEdit && !isEditing && canWrite ? (
            <Button
              type="button"
              variant="outlined"
              className={PROVIDER_ACTION_BUTTON_CLASS}
              onClick={() => setIsEditing(true)}
            >
              <PencilSquareIcon className="h-3 w-3" />
              {t("providerMaster.common.edit")}
            </Button>
          ) : null}
          {(!isEdit || isEditing) && canWrite ? (
            <Button type="submit" color="primary" className={PROVIDER_FORM_BUTTON_CLASS}>
              {isEdit
                ? t("providerMaster.button.save")
                : t("providerMaster.icProvisioning.form.saveConfiguration")}
            </Button>
          ) : null}
        </div>
      </FormLayout>
    </div>
  );
}
