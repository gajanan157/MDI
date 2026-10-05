import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input, Textarea } from "@/components/ui";
import { createProviderOwnerFieldLabels } from "../../../../../shared/providerMasterI18n";
import { StatusEditVerifyBar } from "../../shared/StatusEditVerifyBar";
import { ProviderCard } from "../providerDetails/Cards";
import {
  PROVIDER_OWNER_FORM_DEFAULTS,
  PROVIDER_OWNER_KEYS as K,
  providerOwnerFormSchema,
  syncProviderOwnerFieldErrors,
  type ProviderOwnerFormValues,
} from "./providerOwnerSchema";
import { useProviderOwnerPincodeLookup } from "./useProviderOwnerPage";

const OWNER_FORM_CARD_BODY = "px-2 py-1.5";
const OWNER_FORM_GRID = "grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-5";
const OWNER_FORM_SECTIONS = "space-y-1 p-1.5";

type ProviderOwnerFormPageProps = {
  providerBarSection: ReactNode;
  providerId?: string;
  providerStatus: string;
  blacklistedByIcs: string[];
  canVerify?: boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  loading: boolean;
  saving: boolean;
  defaultFormValues?: ProviderOwnerFormValues;
  onCancel: () => void;
  onSubmit: (values: ProviderOwnerFormValues) => void;
};

export function ProviderOwnerFormPage({
  providerBarSection,
  providerId,
  providerStatus,
  blacklistedByIcs,
  canVerify = false,
  verifyDisabled = false,
  verifyDisabledTitle,
  loading,
  saving,
  defaultFormValues,
  onCancel,
  onSubmit,
}: Readonly<ProviderOwnerFormPageProps>) {
  const { t } = useTranslation();
  const labels = useMemo(() => createProviderOwnerFieldLabels(t), [t]);

  const form = useForm<ProviderOwnerFormValues>({
    resolver: yupResolver(providerOwnerFormSchema) as Resolver<ProviderOwnerFormValues>,
    defaultValues: PROVIDER_OWNER_FORM_DEFAULTS,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { touchedFields, isSubmitted, errors },
  } = form;

  const [ownerNameInputError, setOwnerNameInputError] = useState("");
  const [designationInputError, setDesignationInputError] = useState("");
  const [qualificationInputError, setQualificationInputError] = useState("");
  const [telephoneInputError, setTelephoneInputError] = useState("");
  const [mobileInputError, setMobileInputError] = useState("");
  const [emailInputError, setEmailInputError] = useState("");
  const [addressInputError, setAddressInputError] = useState("");
  const [pincodeInputError, setPincodeInputError] = useState("");
  const [cityInputError, setCityInputError] = useState("");
  const [stateInputError, setStateInputError] = useState("");

  const watchedOwnerName = watch(K.providerOwnerName);
  const watchedDesignation = watch(K.providerOwnerDesignation);
  const watchedQualification = watch(K.providerOwnerQualification);
  const watchedTelephone = watch(K.providerOwnerTelephone);
  const watchedMobile = watch(K.providerOwnerMobile);
  const watchedEmail = watch(K.providerOwnerEmailId);
  const watchedAddress = watch(K.providerOwnerAddress);
  const watchedPincode = watch(K.providerOwnerPincode);
  const watchedCity = watch(K.providerOwnerCity);
  const watchedState = watch(K.providerOwnerState);
  const formValues = watch();

  useEffect(() => {
    const nextErrors = syncProviderOwnerFieldErrors(form.getValues(), {
      touchedFields,
      showRequiredErrors: isSubmitted,
    });
    setOwnerNameInputError(nextErrors.name);
    setDesignationInputError(nextErrors.designation);
    setQualificationInputError(nextErrors.qualification);
    setTelephoneInputError(nextErrors.telephone);
    setMobileInputError(nextErrors.mobile);
    setEmailInputError(nextErrors.email);
    setAddressInputError(nextErrors.address);
    setPincodeInputError(nextErrors.pincode);
    setCityInputError(nextErrors.city);
    setStateInputError(nextErrors.state);
  }, [
    form,
    isSubmitted,
    touchedFields,
    watchedOwnerName,
    watchedDesignation,
    watchedQualification,
    watchedTelephone,
    watchedMobile,
    watchedEmail,
    watchedAddress,
    watchedPincode,
    watchedCity,
    watchedState,
  ]);

  const canSubmit = useMemo(
    () => providerOwnerFormSchema.isValidSync(formValues),
    [formValues],
  );

  const genderOptions = useMemo(
    () => [
      { label: t("providerMaster.detailTabs.owner.fields.male"), value: "Male" },
      { label: t("providerMaster.detailTabs.owner.fields.female"), value: "Female" },
    ],
    [t],
  );

  useProviderOwnerPincodeLookup(watch, setValue, !loading);

  useEffect(() => {
    reset(defaultFormValues ?? PROVIDER_OWNER_FORM_DEFAULTS);
  }, [defaultFormValues, reset]);

  if (loading) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col gap-0.5 overflow-hidden bg-gray-50 p-1">
        <div className="shrink-0">{providerBarSection}</div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-sm">
            <div className="space-y-2 bg-gray-50 px-2 py-2">
              <div className="h-8 animate-pulse rounded bg-slate-200" />
              <div className="grid grid-cols-4 gap-2">
                <div className="h-8 animate-pulse rounded bg-slate-200" />
                <div className="h-8 animate-pulse rounded bg-slate-200" />
                <div className="h-8 animate-pulse rounded bg-slate-200" />
                <div className="h-8 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-0.5 overflow-hidden bg-gray-50 p-1">
      <div className="shrink-0">{providerBarSection}</div>

      <div className="shrink-0">
        <StatusEditVerifyBar
          providerStatus={providerStatus}
          blacklistedByIcs={blacklistedByIcs}
          canWrite
          canVerify={canVerify}
          isEditMode
          onEdit={() => undefined}
          onCancel={onCancel}
          onSave={() => {
            handleSubmit(onSubmit)().catch(() => {});
          }}
          hideEdit
          saveDisabled={saving || !canSubmit}
          verifyDisabled={verifyDisabled}
          verifyDisabledTitle={verifyDisabledTitle}
          auditLog={{
            providerId,
            tabId: "provider-owner",
          }}
        />
      </div>

      <section className="min-h-0 flex-1 overflow-y-auto">
        <div className="overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-sm ring-1 ring-slate-900/[0.06]">
          <form
            onSubmit={(e) => {
              handleSubmit(onSubmit)(e).catch(() => {});
            }}
            className="flex flex-col"
          >
            <div className={OWNER_FORM_SECTIONS}>
              <ProviderCard title={labels.ownerDetails} bodyClassName={OWNER_FORM_CARD_BODY}>
                <div className={OWNER_FORM_GRID}>
                  <Input
                    label={labels.ownerName}
                    isRequired
                    {...register(K.providerOwnerName)}
                    error={ownerNameInputError}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                  />
                  <Input
                    label={labels.designation}
                    {...register(K.providerOwnerDesignation)}
                    error={designationInputError}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                  />
                  <Input
                    label={labels.qualification}
                    {...register(K.providerOwnerQualification)}
                    error={qualificationInputError}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                  />
                  <DropdownSelect
                    label={labels.gender}
                    name={K.providerOwnerGender}
                    name_key={K.providerOwnerGender}
                    control={control}
                    options={genderOptions}
                    defaultValue={t("providerMaster.detailTabs.owner.fields.selectGender")}
                    errors={errors[K.providerOwnerGender]}
                    className="h-8 rounded-md text-xs"
                    formClassName="min-w-0"
                  />
                </div>
              </ProviderCard>

              <ProviderCard title={labels.contactDetails} bodyClassName={OWNER_FORM_CARD_BODY}>
                <div className={OWNER_FORM_GRID}>
                  <Input
                    label={labels.telePhoneNo}
                    {...register(K.providerOwnerTelephone)}
                    error={telephoneInputError}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                  />
                  <Input
                    label={labels.mobNo}
                    isRequired
                    {...register(K.providerOwnerMobile)}
                    error={mobileInputError}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                  />
                  <Input
                    label={labels.email}
                    isRequired
                    {...register(K.providerOwnerEmailId)}
                    error={emailInputError}
                    className="h-8 text-xs"
                    classNames={{ root: "min-w-0" }}
                  />
                </div>
              </ProviderCard>

              <ProviderCard title={labels.addressSection} bodyClassName={OWNER_FORM_CARD_BODY}>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
                  <div className="col-span-3 sm:col-span-2">
                    <Textarea
                      label={labels.address}
                      isRequired
                      {...register(K.providerOwnerAddress)}
                      error={addressInputError}
                      rows={1}
                      className="min-h-10 resize-y py-1.5 text-xs"
                      classNames={{ root: "w-full", input: "resize-y" }}
                    />
                  </div>
                  <div className="col-span-3 hidden sm:block" />
                  <Input
                    label={labels.pincode}
                    isRequired
                    {...register(K.providerOwnerPincode)}
                    error={pincodeInputError}
                    className="h-8 text-xs"
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <Input
                    label={labels.city}
                    isRequired
                    {...register(K.providerOwnerCity)}
                    error={cityInputError}
                    className="h-8 text-xs"
                    disabled
                  />
                  <Input
                    label={labels.state}
                    isRequired
                    {...register(K.providerOwnerState)}
                    error={stateInputError}
                    className="h-8 text-xs"
                    disabled
                  />
                  <div className="col-span-2 hidden sm:block" />
                </div>
              </ProviderCard>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
