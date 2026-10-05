import { useEffect, useRef } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { Source } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import { fetchCitiesByState } from "@/store/features/stateCity/stateCitySlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import type { GeneralInfoFormValues } from "../../schemas";

/** Pincode → city/state lookup — same flow as Add Provider / Provider Owner address. */
export function useProviderDetailsPincodeLookup(
  watch: UseFormWatch<GeneralInfoFormValues>,
  setValue: UseFormSetValue<GeneralInfoFormValues>,
  enabled: boolean,
) {
  const dispatch = useAppDispatch();
  const { cityList } = useAppSelector((state) => state.stateCity);
  const pinCode = watch("providerPostalCode");
  const sourceRef = useRef<Source>(null);
  const programmaticRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (!programmaticRef.current && pinCode) {
      sourceRef.current = "pin";
    }
  }, [enabled, pinCode]);

  useEffect(() => {
    if (!enabled) return;
    const trimmedPin = String(pinCode ?? "").trim();
    if (sourceRef.current !== "pin" || trimmedPin.length !== 6) return;
    dispatch(fetchCitiesByState({ pinCode: trimmedPin, stateName: "", size: 300 }));
  }, [enabled, pinCode, dispatch]);

  useEffect(() => {
    if (!enabled) return;
    const trimmedPin = String(pinCode ?? "").trim();
    if (sourceRef.current !== "pin" || !trimmedPin || cityList.length === 0) return;

    const match = cityList.find((city) => String(city.postalCode) === trimmedPin);
    if (!match) return;

    programmaticRef.current = true;
    setValue("providerCity", match.city, { shouldDirty: false, shouldValidate: true });
    setValue("providerStateName", match.stateName, { shouldDirty: false, shouldValidate: true });
    programmaticRef.current = false;
    sourceRef.current = null;
  }, [enabled, pinCode, cityList, setValue]);
}
