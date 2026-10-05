import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { usePermission } from "@/app/auth/usePermission";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import AlertDialogComponent from "@/components/shared/dialog/AlertDialog/AlertDialog";
import { Button, Input, Textarea } from "@/components/ui";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { showErrorMessage } from "@/utils/errorHandler";
import { bindAlphabetOnlyRegister } from "@/utils/alphabetOnlyInput";
import { ProviderCard } from "../detail/tabs/providerDetails/Cards";
import {
  handleE164PhoneInput,
  handleFaxInput,
} from "../detail/tabs/providerDetails/helpers";
import { useAddProviderPage } from "./useAddProviderPage";
import { Page, PageContent } from "../../../shared/providerShell";
import { PROVIDER_FORM_BUTTON_CLASS } from "../../../shared/providerButtonStyles";
import {
  ADD_PROVIDER_DEFAULT_VALUES,
  ADD_PROVIDER_FIELD_KEYS as K,
  addProviderFormResolver,
  addProviderSchema,
  type AddProviderFormValues,
} from "./addProviderSchema";
import { PROVIDERS_LIST_PATH } from "../utils/providersPaths";
import { OWNERSHIP_TYPE_OPTIONS } from "../detail/tabs/providerDetails/config";
import { isSingleSpecialtyProviderCategory } from "../detail/tabs/providerDetails/options";

const ADD_PROVIDER_FORM_CARD_BODY = "px-2 py-1.5";
const ADD_PROVIDER_FORM_ROW_4 =
  "grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-4";
const ADD_PROVIDER_FORM_ROW_5 =
  "grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-5";
const ADD_PROVIDER_FORM_SECTIONS = "min-h-0 flex-1 space-y-1 overflow-y-auto p-1.5";
const ADD_PROVIDER_FORM_FOOTER =
  "shrink-0 border-t border-gray-200 bg-white px-2 py-1.5";

export default function AddProviderPage() {
  const { t } = useTranslation();
  useBreadcrumb([
    { title: t("providerMaster.breadcrumb.providers"), path: PROVIDERS_LIST_PATH },
    { title: t("providerMaster.breadcrumb.addProvider") },
  ]);

  const navigate = useNavigate();
  const { canWrite } = usePermission("provider-list");

  useEffect(() => {
    if (canWrite) return;
    showErrorMessage({ error: t("providerMaster.errors.noWritePermission") });
    navigate(PROVIDERS_LIST_PATH, { replace: true });
  }, [canWrite, navigate, t]);

  const form = useForm<AddProviderFormValues>({
    resolver: addProviderFormResolver,
    defaultValues: ADD_PROVIDER_DEFAULT_VALUES,
    mode: "onChange",
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = form;

  const {
    saving,
    handleCancel,
    handleSaveProvider,
    rohiniFieldsLocked,
    duplicateRohiniDialog,
    closeDuplicateRohiniDialog,
    redirectToExistingProvider,
    providerTypeOptions,
    providerCategoryOptions,
    clinicalSpecialityOptions,
    insurerOptions,
    defaultProviderType,
    loading: optionsLoading,
  } = useAddProviderPage({ canWrite, watch, setValue });

  const formValues = watch();
  const providerCategoryValue = watch(K.providerTypeId);
  const providerNetworkType = watch(K.providerNetworkType);
  const clinicalSpecialtyIds = watch(K.providerClinicalSpecialityIds);
  const isNetworkProvider = providerNetworkType === "NETWORK";
  const selectedInsurerIds = watch(K.insurerIds);

  useEffect(() => {
    if (isNetworkProvider) return;
    if (!Array.isArray(selectedInsurerIds) || selectedInsurerIds.length === 0) return;
    setValue(K.insurerIds, [], { shouldDirty: true, shouldValidate: true });
  }, [isNetworkProvider, selectedInsurerIds, setValue]);
  const networkTypeOptions = useMemo(
    () => [
      {
        label: t("providerMaster.addForm.networkProvider"),
        value: "NETWORK",
      },
      {
        label: t("providerMaster.addForm.nonNetworkProvider"),
        value: "NON_NETWORK",
      },
    ],
    [t],
  );
  const isSingleSpecialtyCategory = isSingleSpecialtyProviderCategory(
    providerCategoryValue,
    providerCategoryOptions,
  );

  useEffect(() => {
    if (!isSingleSpecialtyCategory) return;
    const selected = (clinicalSpecialtyIds ?? [])
      .map((id) => String(id).trim())
      .filter(Boolean);
    if (selected.length <= 1) return;
    setValue(K.providerClinicalSpecialityIds, [selected[0]], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [isSingleSpecialtyCategory, clinicalSpecialtyIds, setValue]);

  const canSave = useMemo(
    () => addProviderSchema.isValidSync(formValues),
    [formValues],
  );

  useEffect(() => {
    if (!canWrite) return;
    reset({
      ...ADD_PROVIDER_DEFAULT_VALUES,
      [K.providerType]: defaultProviderType,
    });
  }, [canWrite, defaultProviderType, reset]);

  if (!canWrite) {
    return null;
  }

  return (
    <Page title={t("providerMaster.title.addProvider")}>
      <PageContent className="flex min-h-0 flex-1 flex-col bg-gray-50 p-1">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-sm ring-1 ring-slate-900/[0.06]">
          <form
            onSubmit={handleSubmit(() =>
              handleSaveProvider(getValues(), setError),
            )}
            autoComplete="off"
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className={ADD_PROVIDER_FORM_SECTIONS}>
              <ProviderCard
                title={t("providerMaster.addForm.providerDetails")}
                bodyClassName={ADD_PROVIDER_FORM_CARD_BODY}
              >
                <div className="space-y-1">
                  <div className={ADD_PROVIDER_FORM_ROW_5}>
                    <Input
                      label={t("providerMaster.addForm.rohiniNumber")}
                      isRequired={isNetworkProvider}
                      {...register(K.providerRohiniNumber)}
                      error={errors[K.providerRohiniNumber]?.message}
                      className="h-8 text-xs"
                      classNames={{ root: "min-w-0" }}
                      inputMode="numeric"
                      maxLength={13}
                      placeholder={t("providerMaster.addForm.rohiniPlaceholder")}
                    />
                    <Input
                      label={t("providerMaster.addForm.providerName")}
                      isRequired
                      {...register(K.providerName)}
                      error={errors[K.providerName]?.message}
                      className="h-8 text-xs"
                      classNames={{ root: "min-w-0" }}
                      maxLength={255}
                      disabled={rohiniFieldsLocked}
                      autoComplete="off"
                      placeholder={t("providerMaster.addForm.providerNamePlaceholder")}
                    />
                    <DropdownSelect
                      label={t("providerMaster.addForm.providerType")}
                      isRequired
                      name={K.providerType}
                      name_key={K.providerType}
                      defaultValue={t("providerMaster.addForm.providerTypeDefault")}
                      options={providerTypeOptions}
                      control={control}
                      errors={errors[K.providerType]}
                      disabled
                      className="h-[30px] text-xs"
                      formClassName="min-w-0"
                    />
                    <DropdownSelect
                      label={t("providerMaster.addForm.providerNetworkType")}
                      isRequired
                      name={K.providerNetworkType}
                      name_key={K.providerNetworkType}
                      defaultValue={t("providerMaster.addForm.providerNetworkTypeDefault")}
                      options={networkTypeOptions}
                      control={control}
                      errors={errors[K.providerNetworkType]}
                      className="h-[30px] text-xs"
                      formClassName="min-w-0"
                    />
                    {isNetworkProvider ? (
                      <DropdownSelect
                        label={t("providerMaster.addForm.icSelection")}
                        isRequired
                        name={K.insurerIds}
                        name_key={K.insurerIds}
                        defaultValue={t("providerMaster.addForm.icSelectionDefault")}
                        options={insurerOptions}
                        control={control}
                        errors={errors[K.insurerIds]}
                        disabled={optionsLoading}
                        multiselect
                        multiselectHorizontalScroll
                        is_select_checkbox
                        className="h-[30px] text-xs"
                        formClassName="min-w-0"
                      />
                    ) : (
                      <DropdownSelect
                        label={t("providerMaster.addForm.providerCategory")}
                        isRequired
                        name={K.providerTypeId}
                        defaultValue={t("providerMaster.addForm.providerCategoryDefault")}
                        options={providerCategoryOptions}
                        control={control}
                        errors={errors[K.providerTypeId]}
                        disabled={optionsLoading}
                        className="h-[30px] text-xs"
                        formClassName="min-w-0"
                      />
                    )}
                  </div>
                  <div className={ADD_PROVIDER_FORM_ROW_5}>
                    {isNetworkProvider ? (
                      <DropdownSelect
                        label={t("providerMaster.addForm.providerCategory")}
                        isRequired
                        name={K.providerTypeId}
                        defaultValue={t("providerMaster.addForm.providerCategoryDefault")}
                        options={providerCategoryOptions}
                        control={control}
                        errors={errors[K.providerTypeId]}
                        disabled={optionsLoading}
                        className="h-[30px] text-xs"
                        formClassName="min-w-0"
                      />
                    ) : null}
                    <DropdownSelect
                      label={t("providerMaster.addForm.clinicalSpeciality")}
                      name={K.providerClinicalSpecialityIds}
                      name_key={K.providerClinicalSpecialityIds}
                      defaultValue={
                        isSingleSpecialtyCategory
                          ? t("providerMaster.addForm.clinicalSpecialitySingleDefault")
                          : t("providerMaster.addForm.clinicalSpecialityDefault")
                      }
                      options={clinicalSpecialityOptions}
                      control={control}
                      errors={errors[K.providerClinicalSpecialityIds]}
                      disabled={optionsLoading}
                      multiselect={!isSingleSpecialtyCategory}
                      multiselectHorizontalScroll={!isSingleSpecialtyCategory}
                      is_select_checkbox={!isSingleSpecialtyCategory}
                      className="h-[30px] text-xs"
                      formClassName="min-w-0"
                      onChange={(value) => {
                        if (!isSingleSpecialtyCategory) return;
                        const id = Array.isArray(value)
                          ? String(value[0] ?? "").trim()
                          : String(value ?? "").trim();
                        setValue(K.providerClinicalSpecialityIds, id ? [id] : [], {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                    <DropdownSelect
                      label={t("providerMaster.addForm.ownershipType")}
                      name={K.providerOwnershipType}
                      name_key={K.providerOwnershipType}
                      defaultValue={t("providerMaster.addForm.ownershipType")}
                      options={OWNERSHIP_TYPE_OPTIONS}
                      control={control}
                      errors={errors[K.providerOwnershipType]}
                      className="h-[30px] text-xs"
                      formClassName="min-w-0"
                    />
                    <Input
                      label={t("providerMaster.addForm.panNo")}
                      {...register(K.providerPanNo, {
                        onChange: (event) => {
                          event.target.value = String(event.target.value ?? "")
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 10);
                        },
                        setValueAs: (value) =>
                          typeof value === "string"
                            ? value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)
                            : value,
                      })}
                      error={errors[K.providerPanNo]?.message}
                      className="h-8 text-xs"
                      classNames={{ root: "min-w-0" }}
                      maxLength={10}
                      autoCapitalize="characters"
                      placeholder={t("providerMaster.addForm.panPlaceholder")}
                    />
                  </div>
                </div>
              </ProviderCard>

              <ProviderCard
                title={t("providerMaster.addForm.contactDetails")}
                bodyClassName={ADD_PROVIDER_FORM_CARD_BODY}
              >
                <div className={ADD_PROVIDER_FORM_ROW_5}>
                  <Input
                    label={t("providerMaster.addForm.websiteUrl")}
                    {...register(K.providerWebsiteUrl)}
                    error={errors[K.providerWebsiteUrl]?.message}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                    placeholder={t("providerMaster.addForm.websitePlaceholder")}
                  />
                  <Input
                    label={t("providerMaster.addForm.mobileNo")}
                    isRequired
                    {...register(K.providerOfficialContactMobileNo)}
                    error={errors[K.providerOfficialContactMobileNo]?.message}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                    autoComplete="off"
                    placeholder={t("providerMaster.addForm.mobilePlaceholder")}
                  />
                  <Input
                    label={t("providerMaster.addForm.telephoneNo")}
                    {...register(K.providerOfficialContactTelephoneNo)}
                    error={errors[K.providerOfficialContactTelephoneNo]?.message}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                    onInput={handleFaxInput}
                    inputMode="tel"
                    autoComplete="off"
                    placeholder={t("providerMaster.addForm.telephonePlaceholder")}
                  />
                  <Input
                    label={t("providerMaster.addForm.faxNo")}
                    {...register(K.providerOfficialFaxNo)}
                    error={errors[K.providerOfficialFaxNo]?.message}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                    onInput={handleE164PhoneInput}
                    inputMode="tel"
                    autoComplete="off"
                    placeholder={t("providerMaster.addForm.faxPlaceholder")}
                  />
                  <Input
                    label={t("providerMaster.addForm.email")}
                    isRequired
                    {...register(K.providerOfficialContactEmailId)}
                    error={errors[K.providerOfficialContactEmailId]?.message}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                    type="email"
                    autoComplete="off"
                    placeholder={t("providerMaster.addForm.emailPlaceholder")}
                  />
                </div>
              </ProviderCard>

              <ProviderCard
                title={t("providerMaster.addForm.addressDetails")}
                bodyClassName={ADD_PROVIDER_FORM_CARD_BODY}
              >
                <div className="space-y-1">
                  <Textarea
                    label={t("providerMaster.addForm.address")}
                    isRequired
                    {...register(K.providerAddress)}
                    error={errors[K.providerAddress]?.message}
                    rows={2}
                    disabled={rohiniFieldsLocked}
                    autoComplete="off"
                    className="min-h-18 resize-y py-1.5 text-xs"
                    classNames={{ root: "min-w-0" }}
                    placeholder={t("providerMaster.addForm.addressPlaceholder")}
                  />
                  <div className={ADD_PROVIDER_FORM_ROW_4}>
                    <Input
                      label={t("providerMaster.addForm.pincode")}
                      isRequired
                      {...register(K.providerPostalCode, {
                        onChange: (event) => {
                          event.target.value = String(event.target.value ?? "")
                            .replace(/\D/g, "")
                            .slice(0, 6);
                        },
                        setValueAs: (value) =>
                          typeof value === "string"
                            ? value.replace(/\D/g, "").slice(0, 6)
                            : value,
                      })}
                      error={errors[K.providerPostalCode]?.message}
                      className="h-8 text-xs"
                      classNames={{ root: "min-w-0" }}
                      inputMode="numeric"
                      maxLength={6}
                      disabled={rohiniFieldsLocked}
                      autoComplete="off"
                      placeholder={t("providerMaster.addForm.pincodePlaceholder")}
                    />
                    <Input
                      label={t("providerMaster.addForm.city")}
                      isRequired
                      {...register(K.providerCity)}
                      error={errors[K.providerCity]?.message}
                      className="h-8 text-xs"
                      classNames={{ root: "min-w-0" }}
                      disabled
                      autoComplete="off"
                      placeholder={t("providerMaster.addForm.cityPlaceholder")}
                    />
                    <Input
                      label={t("providerMaster.addForm.state")}
                      isRequired
                      {...register(K.providerStateName)}
                      error={errors[K.providerStateName]?.message}
                      className="h-8 text-xs"
                      classNames={{ root: "min-w-0" }}
                      disabled
                      autoComplete="off"
                      placeholder={t("providerMaster.addForm.statePlaceholder")}
                    />
                    <Input
                      label={t("providerMaster.addForm.district")}
                      isRequired
                      {...bindAlphabetOnlyRegister(register(K.providerDistrict))}
                      error={errors[K.providerDistrict]?.message}
                      className="h-8 text-xs"
                      classNames={{ root: "min-w-0" }}
                      disabled={rohiniFieldsLocked}
                      autoComplete="off"
                      placeholder={t("providerMaster.addForm.districtPlaceholder")}
                    />
                  </div>
                </div>
              </ProviderCard>
            </div>

            <div className={ADD_PROVIDER_FORM_FOOTER}>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outlined"
                  className={PROVIDER_FORM_BUTTON_CLASS}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  {t("providerMaster.button.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className={PROVIDER_FORM_BUTTON_CLASS}
                  disabled={saving || optionsLoading || !canSave}
                >
                  {saving ? t("providerMaster.button.saving") : t("providerMaster.button.saveProvider")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </PageContent>

      <AlertDialogComponent
        type="error"
        variant="prominent"
        hideCloseIcon
        title={t("providerMaster.addForm.duplicateRohiniTitle")}
        message={t("providerMaster.addForm.duplicateRohiniMessage")}
        isOpen={duplicateRohiniDialog.open}
        onClose={closeDuplicateRohiniDialog}
        closeText={t("providerMaster.addForm.duplicateRohiniCancel")}
        onConfirm={redirectToExistingProvider}
        confirmText={t("providerMaster.addForm.duplicateRohiniRedirect")}
        confirmDisabled={!duplicateRohiniDialog.providerId}
      />
    </Page>
  );
}
