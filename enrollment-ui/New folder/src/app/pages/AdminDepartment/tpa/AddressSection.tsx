import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  fetchCitiesByState,
  fetchStates,
} from "@/store/features/stateCity/stateCitySlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { MapPinIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

export type Source = "pin" | "city" | "state" | null;

interface AddressSectionProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  isAddressType?: boolean;
  isDisable?: boolean;
  isFieldRequired?: boolean;
  ErrorMsg?: string;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  register,
  control,
  errors,
  watch,
  setValue,
  isAddressType = true,
  isDisable,
  ErrorMsg,
  isFieldRequired,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { cityList, stateList } = useAppSelector((s) => s.stateCity);

  const pinCode = watch("address.postalCode");
  const city = watch("address.city");
  const stateName = watch("address.stateName");

  const sourceRef = useRef<Source>(null);
  const programmaticRef = useRef(false);

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  /* ---------- FETCH CITIES ON INITIAL LOAD IF STATE EXISTS ---------- */

  /* ---------- USER INTENT ---------- */
  useEffect(() => {
    if (!programmaticRef.current && pinCode) sourceRef.current = "pin";
  }, [pinCode]);

  useEffect(() => {
    if (!programmaticRef.current && city) sourceRef.current = "city";
  }, [city]);

  useEffect(() => {
    if (programmaticRef.current) return;
    if (stateName) sourceRef.current = "state";
  }, [stateName]);

  /* ---------- STATE → FETCH CITIES ---------- */
  // useEffect(() => {
  //   if (sourceRef.current !== "state" || !stateName) return;

  //   dispatch(fetchCitiesByState({ stateName, size: 300 }));
  //   sourceRef.current = null;
  // }, [stateName, dispatch]);

  /* ---------- PIN → FETCH CITY ---------- */
  useEffect(() => {
    if (sourceRef.current !== "pin" || pinCode?.length !== 6) return;

    dispatch(fetchCitiesByState({ pinCode, stateName: "", size: 300 }));
  }, [pinCode, dispatch]);

  /* ---------- PIN → AUTO CITY + STATE ---------- */
  useEffect(() => {
    if (sourceRef.current !== "pin" || !pinCode || cityList.length === 0)
      return;

    const match = cityList.find((c) => c.postalCode === pinCode);
    if (!match) return;

    programmaticRef.current = true;
    setValue("address.city", match.city, {
      shouldDirty: false,
      shouldValidate: true,
    });
    setValue("address.stateName", match.stateName, {
      shouldDirty: false,
      shouldValidate: true,
    });
    programmaticRef.current = false;

    sourceRef.current = null;
  }, [pinCode, cityList, setValue]);

  /* ---------- CITY → AUTO PIN + STATE ---------- */
  useEffect(() => {
    if (sourceRef.current !== "city" || !city || cityList.length === 0) return;

    const match = cityList.find((c) => c.city === city);
    if (!match) return;

    programmaticRef.current = true;
    setValue("address.postalCode", match.postalCode, {
      shouldDirty: false,
    });
    setValue("address.stateName", match.stateName, {
      shouldDirty: false,
    });
    programmaticRef.current = false;

    sourceRef.current = null;
  }, [city, cityList, setValue]);

  /* ---------- OPTIONS ---------- */
  const cityOptions = useMemo(() => {
    const options = cityList?.map((c: any) => ({
      label: c?.city,
      value: c?.city,
    }));

    // If city value exists but isn't in options, add it to ensure it displays correctly
    if (city && !options.some((opt) => opt.value === city)) {
      options.unshift({ label: city, value: city });
    }

    return options;
  }, [cityList, city]);

  const stateOptions = useMemo(
    () =>
      stateList?.map((s: any) => ({
        label: s?.stateName,
        value: s?.stateName,
      })),
    [stateList],
  );

  const addrErrors = errors?.address as FieldErrors<any>;

  return (
    <div className="bg-card mt-4 rounded-xl border p-4 shadow-sm">
      <SectionTitle
        title={t("nav.address.title")}
        errormsg={ErrorMsg}
        icon={<MapPinIcon className="h-5 w-5 text-green-500" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("nav.address.fields.address.label")}
          placeholder={t("nav.address.fields.address.placeholder")}
          {...register("address.address")}
          error={addrErrors?.address?.message as string}
          disabled={isDisable}
          isRequired={!isFieldRequired}
        />

        {isAddressType && (
          <DropdownSelect
            name="address.addressType"
            label={t("nav.address.fields.addressType.label")}
            defaultValue={t("nav.address.fields.addressType.placeholder")}
            options={[
              {
                label: t("nav.address.types.physical"),
                value: "physical",
              },
              {
                label: t("nav.address.types.postal"),
                value: "postal",
              },
              {
                label: t("nav.address.types.both"),
                value: "both",
              },
            ]} control={control}
            errors={addrErrors?.addressType}
            disabled={isDisable}
            isRequired={!isFieldRequired}
          />
        )}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label={t("nav.address.fields.postalCode.label")}
          placeholder={t("nav.address.fields.postalCode.placeholder")}
          {...register("address.postalCode")}
          error={addrErrors?.postalCode?.message as string}
          type="number"
          disabled={isDisable}
          isRequired={!isFieldRequired}
        />
        <DropdownSelect
          label={t("nav.address.fields.state.label")}
          defaultValue={t("nav.address.fields.state.placeholder")}
          name="address.stateName"
          options={stateOptions}
          control={control}
          errors={addrErrors?.stateName}
          disabled={true}
          isRequired={!isFieldRequired}
        />

        <DropdownSelect
          label={t("nav.address.fields.city.label")}
          defaultValue={t("nav.address.fields.city.placeholder")}
          name="address.city"
          options={cityOptions}
          control={control}
          errors={addrErrors?.city}
          disabled={true}
          isRequired={!isFieldRequired}
        />
      </div>
    </div>
  );
};
