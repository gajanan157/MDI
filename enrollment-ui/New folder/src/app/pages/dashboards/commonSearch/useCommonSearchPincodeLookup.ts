import { useEffect, useRef } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { fetchCitiesByState } from "@/store/features/stateCity/stateCitySlice";
import type { City } from "@/store/features/stateCity/stateCityTypes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";

type UseCommonSearchPincodeLookupOptions = {
  /** Keep CommonSearch state→city effect from clearing city/pincode after autofill. */
  syncPrevState?: (stateName: string) => void;
};

function asTrimmedText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

function findCityByPincode(cityList: City[], pinCode: string): City | undefined {
  return cityList.find((city) => String(city.postalCode ?? "").trim() === pinCode);
}

/**
 * CommonSearch filters: selected/entered pincode → pincode-master state + city.
 * Same API as Add Provider (`fetchCitiesByState` + `pinCode`).
 */
export function useCommonSearchPincodeLookup(
  watch: UseFormWatch<Record<string, unknown>>,
  setValue: UseFormSetValue<Record<string, unknown>>,
  enabled: boolean,
  options?: UseCommonSearchPincodeLookupOptions,
) {
  const dispatch = useAppDispatch();
  const { cityList } = useAppSelector((state) => state.stateCity);
  const pinCode = watch("pincode");
  const sourceRef = useRef<"pin" | null>(null);
  const programmaticRef = useRef(false);
  const syncPrevState = options?.syncPrevState;

  useEffect(() => {
    if (!enabled) return;
    if (!programmaticRef.current && pinCode) {
      sourceRef.current = "pin";
    }
  }, [enabled, pinCode]);

  useEffect(() => {
    if (!enabled) return;
    const trimmedPin = asTrimmedText(pinCode);
    if (sourceRef.current !== "pin" || !trimmedPin) return;

    const existing = findCityByPincode(cityList, trimmedPin);
    if (existing) return;

    if (trimmedPin.length !== 6 || !/^\d{6}$/.test(trimmedPin)) return;
    dispatch(
      fetchCitiesByState({ pinCode: trimmedPin, stateName: "", size: 2000 }),
    );
  }, [enabled, pinCode, cityList, dispatch]);

  useEffect(() => {
    if (!enabled) return;
    const trimmedPin = asTrimmedText(pinCode);
    if (sourceRef.current !== "pin" || !trimmedPin || cityList.length === 0) {
      return;
    }

    const match = findCityByPincode(cityList, trimmedPin);
    if (!match) return;

    const nextState = String(match.stateName ?? "").trim();
    const nextCity = String(match.city ?? "").trim();
    if (!nextState && !nextCity) return;

    programmaticRef.current = true;
    if (nextState) {
      syncPrevState?.(nextState);
      setValue("state", nextState, { shouldDirty: false });
    }
    if (nextCity) {
      setValue("city", nextCity, { shouldDirty: false });
    }
    programmaticRef.current = false;
    sourceRef.current = null;
  }, [enabled, pinCode, cityList, setValue, syncPrevState]);
}
