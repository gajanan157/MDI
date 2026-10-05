import { useEffect, useRef } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { fetchCitiesByState } from "@/store/features/stateCity/stateCitySlice";
import type { City } from "@/store/features/stateCity/stateCityTypes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";

type UseCommonSearchCityLookupOptions = {
  /** Keep CommonSearch state→city effect from clearing city/pincode after autofill. */
  syncPrevState?: (stateName: string) => void;
  /** Lock state-change clears while city autofill writes state/pincode. */
  setAutofillLock?: (locked: boolean) => void;
};

type CityLookupResolved = {
  city: string;
  /** Set only when every exact match shares one state. */
  stateName: string;
  /** Set only when every exact match shares one pincode. */
  postalCode: string;
};

function asTrimmedText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

function normalizeCityName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function normalizeStateName(value: string): string {
  return value.trim().toLowerCase();
}

function uniqueNonEmpty(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

/**
 * Exact city matches only. State/pincode filled only when all matches agree.
 * Does not use cityList[0].
 */
function resolveCityLookup(
  cityList: City[],
  cityName: string,
): CityLookupResolved | undefined {
  const needle = normalizeCityName(cityName);
  if (!needle) return undefined;

  const exactMatches = cityList.filter(
    (city) => normalizeCityName(String(city.city ?? "")) === needle,
  );
  if (exactMatches.length === 0) return undefined;

  const states = uniqueNonEmpty(
    exactMatches.map((city) => String(city.stateName ?? "")),
  );
  const pins = uniqueNonEmpty(
    exactMatches.map((city) => String(city.postalCode ?? "")),
  );
  const canonicalCity =
    exactMatches
      .map((city) => String(city.city ?? "").trim())
      .find(Boolean) ?? cityName.trim();

  return {
    city: canonicalCity,
    stateName: states.length === 1 ? states[0] : "",
    postalCode: pins.length === 1 ? pins[0] : "",
  };
}

/**
 * When both state and city are known, resolve pincode from that pair only.
 */
function resolvePincodeForStateAndCity(
  cityList: City[],
  stateName: string,
  cityName: string,
): string {
  const stateNeedle = normalizeStateName(stateName);
  const cityNeedle = normalizeCityName(cityName);
  if (!stateNeedle || !cityNeedle) return "";

  const matches = cityList.filter((city) => {
    const rowCity = normalizeCityName(String(city.city ?? ""));
    const rowState = normalizeStateName(String(city.stateName ?? ""));
    return rowCity === cityNeedle && rowState === stateNeedle;
  });

  const pins = uniqueNonEmpty(
    matches.map((city) => String(city.postalCode ?? "")),
  );
  return pins.length === 1 ? pins[0] : "";
}

/**
 * CommonSearch city helpers:
 * - City Enter → fill State + Pincode when unique
 * - State + City selected → fill Pincode when unique for that pair
 */
export function useCommonSearchCityLookup(
  watch: UseFormWatch<Record<string, unknown>>,
  setValue: UseFormSetValue<Record<string, unknown>>,
  enabled: boolean,
  options?: UseCommonSearchCityLookupOptions,
) {
  const dispatch = useAppDispatch();
  const { cityList } = useAppSelector((state) => state.stateCity);
  const city = watch("city");
  const state = watch("state");
  const pincode = watch("pincode");

  const pendingCityRef = useRef("");
  const lastFetchedRef = useRef("");
  const lastAppliedKeyRef = useRef("");
  const lastStateCityPinKeyRef = useRef("");
  const syncPrevStateRef = useRef(options?.syncPrevState);
  const setAutofillLockRef = useRef(options?.setAutofillLock);

  syncPrevStateRef.current = options?.syncPrevState;
  setAutofillLockRef.current = options?.setAutofillLock;

  const applyResolved = (resolved: CityLookupResolved) => {
    const nextState = resolved.stateName;
    const nextPincode = resolved.postalCode;
    const nextCity = resolved.city;
    if (!nextState && !nextPincode && !nextCity) return;

    const applyKey = `${normalizeCityName(nextCity)}|${nextState}|${nextPincode}`;
    if (lastAppliedKeyRef.current === applyKey) {
      pendingCityRef.current = "";
      return;
    }

    const currentState = asTrimmedText(state);
    const currentPin = asTrimmedText(pincode);
    const currentCity = asTrimmedText(city);
    const alreadyFilled =
      (!nextState || currentState === nextState) &&
      (!nextPincode || currentPin === nextPincode) &&
      (!nextCity || normalizeCityName(currentCity) === normalizeCityName(nextCity));

    if (alreadyFilled) {
      lastAppliedKeyRef.current = applyKey;
      pendingCityRef.current = "";
      return;
    }

    lastAppliedKeyRef.current = applyKey;
    pendingCityRef.current = "";
    setAutofillLockRef.current?.(true);
    if (nextState && currentState !== nextState) {
      syncPrevStateRef.current?.(nextState);
      setValue("state", nextState, { shouldDirty: false, shouldValidate: false });
    }
    if (nextPincode && currentPin !== nextPincode) {
      setValue("pincode", nextPincode, { shouldDirty: false, shouldValidate: false });
    }
    if (
      nextCity &&
      normalizeCityName(currentCity) !== normalizeCityName(nextCity)
    ) {
      setValue("city", nextCity, { shouldDirty: false, shouldValidate: false });
    }
    window.setTimeout(() => setAutofillLockRef.current?.(false), 0);
  };

  // User changed city → fetch by searchCity when needed.
  useEffect(() => {
    if (!enabled) return;
    const trimmedCity = asTrimmedText(city);
    if (!trimmedCity || trimmedCity.length < 2) {
      pendingCityRef.current = "";
      lastAppliedKeyRef.current = "";
      lastFetchedRef.current = "";
      return;
    }

    pendingCityRef.current = trimmedCity;

    const existing = resolveCityLookup(cityList, trimmedCity);
    if (existing && (existing.stateName || existing.postalCode)) {
      applyResolved(existing);
      return;
    }

    // Prefer state-scoped list when state is already selected.
    const trimmedState = asTrimmedText(state);
    if (trimmedState) {
      const pin = resolvePincodeForStateAndCity(cityList, trimmedState, trimmedCity);
      if (pin) {
        applyResolved({
          city: trimmedCity,
          stateName: "",
          postalCode: pin,
        });
        return;
      }
    }

    const lookupKey = normalizeCityName(trimmedCity);
    if (lastFetchedRef.current === lookupKey) return;
    lastFetchedRef.current = lookupKey;

    dispatch(
      fetchCitiesByState({
        stateName: trimmedState,
        searchCity: trimmedCity,
        size: 2000,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, city, dispatch]);

  // When search results arrive, fill from city lookup.
  useEffect(() => {
    if (!enabled) return;
    const pending = pendingCityRef.current;
    if (!pending || cityList.length === 0) return;

    const trimmedState = asTrimmedText(state);
    if (trimmedState) {
      const pin = resolvePincodeForStateAndCity(cityList, trimmedState, pending);
      if (pin) {
        applyResolved({ city: pending, stateName: "", postalCode: pin });
        return;
      }
    }

    const resolved = resolveCityLookup(cityList, pending);
    if (!resolved) return;
    applyResolved(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, cityList]);

  // State + City selected → populate Pincode when that pair has one unique pin.
  useEffect(() => {
    if (!enabled) return;
    const trimmedState = asTrimmedText(state);
    const trimmedCity = asTrimmedText(city);
    if (!trimmedState || !trimmedCity) {
      lastStateCityPinKeyRef.current = "";
      return;
    }

    const pairKey = `${normalizeStateName(trimmedState)}|${normalizeCityName(trimmedCity)}`;
    if (lastStateCityPinKeyRef.current === pairKey && asTrimmedText(pincode)) {
      return;
    }

    const pin = resolvePincodeForStateAndCity(cityList, trimmedState, trimmedCity);
    if (!pin) return;
    if (asTrimmedText(pincode) === pin) {
      lastStateCityPinKeyRef.current = pairKey;
      return;
    }

    lastStateCityPinKeyRef.current = pairKey;
    setAutofillLockRef.current?.(true);
    setValue("pincode", pin, { shouldDirty: false, shouldValidate: false });
    window.setTimeout(() => setAutofillLockRef.current?.(false), 0);
  }, [enabled, state, city, cityList, pincode, setValue]);
}
