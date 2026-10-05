import { useCallback, useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { normalizeApiErrorBody } from "@/app/api/apiService";
import {
  getProviderBankAccount,
  getProviderById,
  getProviderContactPerson,
  isProviderContactPersonOwnerNotFound,
} from "@/store/features/provider/providerAPI";
import {
  clearProviderInfrastructure,
  fetchProviderInfrastructure,
  mapInfrastructureToProviderDetail,
} from "@/store/features/providerInfrastructure/providerInfrastructureSlice";
import {
  clearProviderManpower,
  fetchProviderManpower,
} from "@/store/features/providerManpower/providerManpowerSlice";
import {
  clearProviderFacility,
  fetchProviderFacility,
} from "@/store/features/providerFacility/providerFacilitySlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { showErrorMessage } from "@/utils/errorHandler";
import { getHospitalDetail, type HospitalDetailRecord } from "../../hospitalData";
import {
  type BankTabFieldsFromApi,
  mapProviderBankAccountToTabFields,
  type ProviderDetailsFromApi,
  resolveProviderDetailsFromApi,
} from "../utils/providerDetailSectionMerges";
import {
  applyProviderContactPersonsToDetail,
  buildSharedProviderProfileFromDetails,
  minimalNetworkProviderShell,
  preserveLazyContactFields,
} from "../utils/viewHospitalHelpers";

type ProviderDetailsStateApplier = {
  setDetailLoadError: (value: string | null) => void;
  setNetworkProviderDetailsFetchOk: (value: boolean) => void;
  setProviderDetailsFields: (value: ProviderDetailsFromApi | null) => void;
  setProviderProfile: Dispatch<SetStateAction<HospitalDetailRecord | null>>;
  setHospital: Dispatch<SetStateAction<HospitalDetailRecord | null>>;
};

function applyLoadedProviderDetails(
  details: ProviderDetailsFromApi,
  applier: ProviderDetailsStateApplier,
): void {
  applier.setDetailLoadError(null);
  applier.setNetworkProviderDetailsFetchOk(true);
  applier.setProviderDetailsFields(details);
  applier.setProviderProfile((prev) =>
    preserveLazyContactFields(buildSharedProviderProfileFromDetails(details, prev), prev),
  );
  applier.setHospital((prev) =>
    preserveLazyContactFields(buildSharedProviderProfileFromDetails(details, prev), prev),
  );
}

function applyProviderDetailsLoadFailure(
  id: string,
  apiMsg: string,
  lazyTabHydrated: boolean,
  applier: ProviderDetailsStateApplier,
  status?: number,
): void {
  if (!lazyTabHydrated) {
    const shell = minimalNetworkProviderShell(id);
    applier.setProviderProfile(shell);
    applier.setHospital(shell);
    applier.setDetailLoadError(null);
    applier.setNetworkProviderDetailsFetchOk(false);
    showErrorMessage({ error: apiMsg, status });
    return;
  }
  applier.setDetailLoadError(null);
  applier.setNetworkProviderDetailsFetchOk(false);
}

type UseViewHospitalProviderDataArgs = {
  id: string | undefined;
  isNetworkRoute: boolean;
  isNonNetwork: boolean;
  activeTabId: string;
};

export function useViewHospitalProviderData({
  id,
  isNetworkRoute,
  isNonNetwork,
  activeTabId,
}: UseViewHospitalProviderDataArgs) {
  const dispatch = useAppDispatch();

  const [providerProfile, setProviderProfile] = useState<HospitalDetailRecord | null>(() => {
    if (!id) return null;
    if (isNonNetwork) return getHospitalDetail(id);
    return null;
  });

  const [hospital, setHospital] = useState<HospitalDetailRecord | null>(() => {
    if (!id) return null;
    if (isNonNetwork) return getHospitalDetail(id);
    return null;
  });

  const [detailLoading, setDetailLoading] = useState(() => Boolean(id && isNetworkRoute));
  const [detailLoadError, setDetailLoadError] = useState<string | null>(null);
  const [networkProviderDetailsFetchOk, setNetworkProviderDetailsFetchOk] = useState(
    () => !isNetworkRoute,
  );
  const [lazyOwnerLoading, setLazyOwnerLoading] = useState(false);
  const [ownerContactOwnerNotFound, setOwnerContactOwnerNotFound] = useState(false);
  const [ownerContactNotFoundMessage, setOwnerContactNotFoundMessage] = useState<string | null>(
    null,
  );
  const [lazyBankLoading, setLazyBankLoading] = useState(false);
  const [isBankDocumentsRefreshing, setIsBankDocumentsRefreshing] = useState(false);
  const [bankTabFields, setBankTabFields] = useState<BankTabFieldsFromApi | null>(null);
  const [providerDetailsFields, setProviderDetailsFields] =
    useState<ProviderDetailsFromApi | null>(null);

  const ownerFetchedForIdRef = useRef<string | null>(null);
  const bankFetchedForIdRef = useRef<string | null>(null);
  const infrastructureFetchedForIdRef = useRef<string | null>(null);
  const manpowerFetchedForIdRef = useRef<string | null>(null);
  const facilityFetchedForIdRef = useRef<string | null>(null);
  const bankPollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const BANK_ACCOUNT_POLL_INTERVAL_MS = 10000;
  const BANK_ACCOUNT_POLL_MAX_ATTEMPTS = 6;

  /**
   * Re-fetches `/bank-account` on a 10s interval. Used after a cancel cheque /
   * PAN card upload, where the record isn't created until the backend finishes
   * processing the inward — an immediate GET returns 404.
   */
  const pollBankTabFields = useCallback(
    (providerId: string, attemptsLeft: number = BANK_ACCOUNT_POLL_MAX_ATTEMPTS) => {
      if (bankPollTimeoutRef.current) {
        clearTimeout(bankPollTimeoutRef.current);
        bankPollTimeoutRef.current = null;
      }
      if (attemptsLeft <= 0) {
        setIsBankDocumentsRefreshing(false);
        return;
      }

      setIsBankDocumentsRefreshing(true);
      bankPollTimeoutRef.current = setTimeout(async () => {
        const bank = await getProviderBankAccount(providerId);
        if (bank) {
          setBankTabFields(mapProviderBankAccountToTabFields(bank));
          setIsBankDocumentsRefreshing(false);
          return;
        }
        pollBankTabFields(providerId, attemptsLeft - 1);
      }, BANK_ACCOUNT_POLL_INTERVAL_MS);
    },
    [],
  );

  useEffect(
    () => () => {
      if (bankPollTimeoutRef.current) {
        clearTimeout(bankPollTimeoutRef.current);
      }
      setIsBankDocumentsRefreshing(false);
    },
    [],
  );

  useEffect(() => {
    if (!id) {
      setProviderProfile(null);
      setHospital(null);
      setBankTabFields(null);
      setProviderDetailsFields(null);
      setDetailLoadError(null);
      setNetworkProviderDetailsFetchOk(!isNetworkRoute);
      setDetailLoading(false);
      ownerFetchedForIdRef.current = null;
      bankFetchedForIdRef.current = null;
      infrastructureFetchedForIdRef.current = null;
      manpowerFetchedForIdRef.current = null;
      facilityFetchedForIdRef.current = null;
      dispatch(clearProviderInfrastructure());
      dispatch(clearProviderManpower());
      dispatch(clearProviderFacility());
      setLazyOwnerLoading(false);
      setOwnerContactOwnerNotFound(false);
      setOwnerContactNotFoundMessage(null);
      setLazyBankLoading(false);
      return;
    }

    ownerFetchedForIdRef.current = null;
    bankFetchedForIdRef.current = null;
    infrastructureFetchedForIdRef.current = null;
    manpowerFetchedForIdRef.current = null;
    facilityFetchedForIdRef.current = null;
    dispatch(clearProviderInfrastructure());
    dispatch(clearProviderManpower());
    dispatch(clearProviderFacility());
    setLazyOwnerLoading(false);
    setOwnerContactOwnerNotFound(false);
    setOwnerContactNotFoundMessage(null);
    setLazyBankLoading(false);

    let cancelled = false;
    setDetailLoading(true);
    setNetworkProviderDetailsFetchOk(false);
    setDetailLoadError(null);
    setProviderProfile(null);
    setHospital(null);
    setBankTabFields(null);
    setProviderDetailsFields(null);

    (async () => {
      const res = await getProviderById(id);
      if (cancelled) return;

      const lazyTabHydrated =
        ownerFetchedForIdRef.current === id || bankFetchedForIdRef.current === id;

      const applier: ProviderDetailsStateApplier = {
        setDetailLoadError,
        setNetworkProviderDetailsFetchOk,
        setProviderDetailsFields,
        setProviderProfile,
        setHospital,
      };

      if (res.success && res.data != null) {
        const details = resolveProviderDetailsFromApi(res.data);
        if (details) {
          applyLoadedProviderDetails(details, applier);
        } else {
          const fallback = getHospitalDetail(id);
          if (fallback) {
            setDetailLoadError(null);
            setNetworkProviderDetailsFetchOk(true);
            setProviderProfile((prev) => preserveLazyContactFields(fallback, prev));
            setHospital((prev) => preserveLazyContactFields(fallback, prev));
          } else {
            applyProviderDetailsLoadFailure(id, "Unable to load provider details.", lazyTabHydrated, applier);
          }
        }
      } else {
        const fallback = getHospitalDetail(id);
        if (fallback) {
          setDetailLoadError(null);
          setNetworkProviderDetailsFetchOk(true);
          setProviderProfile((prev) => preserveLazyContactFields(fallback, prev));
          setHospital((prev) => preserveLazyContactFields(fallback, prev));
        } else {
          const apiMsg = (res.error ?? "").trim() || "Unable to load provider details.";
          applyProviderDetailsLoadFailure(id, apiMsg, lazyTabHydrated, applier, res.status);
        }
      }
      setDetailLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, dispatch, isNetworkRoute]);

  useLayoutEffect(() => {
    if (!id || activeTabId !== "owners-info") return;
    if (!isNetworkRoute && !providerProfile) return;
    if (ownerFetchedForIdRef.current === id) return;

    let cancelled = false;
    setLazyOwnerLoading(true);

    (async () => {
      const contactRes = await getProviderContactPerson(id);
      if (cancelled) return;

      if (!contactRes.success) {
        if (isProviderContactPersonOwnerNotFound(contactRes)) {
          const notFoundMsg =
            (typeof contactRes.error === "string" && contactRes.error.trim()) ||
            normalizeApiErrorBody(
              contactRes.errorPayload,
              "Provider contact person not found.",
            );
          setOwnerContactOwnerNotFound(true);
          setOwnerContactNotFoundMessage(notFoundMsg);
          ownerFetchedForIdRef.current = id;
          if (isNetworkRoute && !providerProfile) {
            setDetailLoadError(null);
            const shell = minimalNetworkProviderShell(id);
            const cleared = applyProviderContactPersonsToDetail(shell, []);
            setProviderProfile(cleared);
            setHospital(cleared);
          }
          setLazyOwnerLoading(false);
          return;
        }
        setOwnerContactOwnerNotFound(false);
        setOwnerContactNotFoundMessage(null);
        showErrorMessage({
          status: contactRes.status,
          error:
            (typeof contactRes.error === "string" && contactRes.error.trim()) ||
            normalizeApiErrorBody(
              contactRes.errorPayload,
              "Unable to load contact persons information.",
            ),
        });
        setLazyOwnerLoading(false);
        return;
      }

      setOwnerContactOwnerNotFound(false);
      setOwnerContactNotFoundMessage(null);
      ownerFetchedForIdRef.current = id;
      const contactPersons = contactRes.data ?? [];
      setDetailLoadError(null);
      setProviderProfile((prev) => {
        const base = prev ?? (isNetworkRoute ? minimalNetworkProviderShell(id) : null);
        if (!base) return prev;
        return applyProviderContactPersonsToDetail(base, contactPersons);
      });
      setHospital((prev) => {
        const base = prev ?? (isNetworkRoute ? minimalNetworkProviderShell(id) : null);
        if (!base) return prev;
        return applyProviderContactPersonsToDetail(base, contactPersons);
      });
      setLazyOwnerLoading(false);
    })();

    return () => {
      cancelled = true;
      setLazyOwnerLoading(false);
    };
  }, [id, activeTabId, providerProfile, isNetworkRoute]);

  useEffect(() => {
    if (!id || activeTabId !== "bank-details") return;
    if (!isNetworkRoute && !providerProfile) return;
    if (bankFetchedForIdRef.current === id) return;
    bankFetchedForIdRef.current = id;

    let cancelled = false;
    setLazyBankLoading(true);

    (async () => {
      const bank = await getProviderBankAccount(id);
      if (cancelled) return;
      setBankTabFields(mapProviderBankAccountToTabFields(bank));
      setDetailLoadError(null);
      setLazyBankLoading(false);
    })();

    return () => {
      cancelled = true;
      setLazyBankLoading(false);
    };
  }, [id, activeTabId, providerProfile, isNetworkRoute]);

  useEffect(() => {
    if (!id || activeTabId !== "infrastructure-facility") return;
    if (!isNetworkRoute && !providerProfile) return;
    if (infrastructureFetchedForIdRef.current === id) return;

    let cancelled = false;
    (async () => {
      const result = await dispatch(fetchProviderInfrastructure(id));
      if (cancelled) return;
      if (fetchProviderInfrastructure.fulfilled.match(result)) {
        infrastructureFetchedForIdRef.current = id;
        const detailInfra = mapInfrastructureToProviderDetail(result.payload);
        if (detailInfra) {
          setProviderDetailsFields((prev) =>
            prev ? { ...prev, infrastructure: detailInfra } : prev,
          );
          setProviderProfile((prev) =>
            prev ? { ...prev, providerDetailInfrastructure: detailInfra } : prev,
          );
          setHospital((prev) =>
            prev ? { ...prev, providerDetailInfrastructure: detailInfra } : prev,
          );
        }
      } else if (fetchProviderInfrastructure.rejected.match(result)) {
        const message = result.payload ?? "Failed to load provider infrastructure";
        const isNotFound = message.toLowerCase().includes("not found");
        if (!isNotFound) {
          showErrorMessage({ error: message });
        }
        infrastructureFetchedForIdRef.current = id;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, activeTabId, providerProfile, isNetworkRoute, dispatch]);

  useEffect(() => {
    if (!id || activeTabId !== "infrastructure-facility") return;
    if (!isNetworkRoute && !providerProfile) return;
    if (manpowerFetchedForIdRef.current === id) return;

    let cancelled = false;
    (async () => {
      const result = await dispatch(fetchProviderManpower(id));
      if (cancelled) return;
      if (fetchProviderManpower.fulfilled.match(result)) {
        manpowerFetchedForIdRef.current = id;
      } else if (fetchProviderManpower.rejected.match(result)) {
        const message = result.payload ?? "Failed to load provider manpower";
        if (!message.toLowerCase().includes("not found")) {
          showErrorMessage({ error: message });
        }
        manpowerFetchedForIdRef.current = id;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, activeTabId, providerProfile, isNetworkRoute, dispatch]);

  useEffect(() => {
    if (!id || activeTabId !== "infrastructure-facility") return;
    if (!isNetworkRoute && !providerProfile) return;
    if (facilityFetchedForIdRef.current === id) return;

    let cancelled = false;
    (async () => {
      const result = await dispatch(fetchProviderFacility(id));
      if (cancelled) return;
      if (fetchProviderFacility.fulfilled.match(result)) {
        facilityFetchedForIdRef.current = id;
      } else if (fetchProviderFacility.rejected.match(result)) {
        const message = result.payload ?? "Failed to load provider facility";
        if (!message.toLowerCase().includes("not found")) {
          showErrorMessage({ error: message });
        }
        facilityFetchedForIdRef.current = id;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, activeTabId, providerProfile, isNetworkRoute, dispatch]);

  const refreshProviderDetails = useCallback(async () => {
    if (!id) return;
    const res = await getProviderById(id);
    if (!res.success || !res.data) return;
    const details = resolveProviderDetailsFromApi(res.data);
    if (!details) return;
    setProviderDetailsFields(details);
    setProviderProfile((prev) =>
      preserveLazyContactFields(
        buildSharedProviderProfileFromDetails(details, prev),
        prev,
      ),
    );
    setHospital((prev) =>
      preserveLazyContactFields(
        buildSharedProviderProfileFromDetails(details, prev),
        prev,
      ),
    );
  }, [id]);

  return {
    providerProfile,
    setProviderProfile,
    hospital,
    setHospital,
    detailLoading,
    detailLoadError,
    networkProviderDetailsFetchOk,
    lazyOwnerLoading,
    ownerContactOwnerNotFound,
    ownerContactNotFoundMessage,
    setOwnerContactOwnerNotFound,
    setOwnerContactNotFoundMessage,
    lazyBankLoading,
    isBankDocumentsRefreshing,
    bankTabFields,
    setBankTabFields,
    pollBankTabFields,
    providerDetailsFields,
    setProviderDetailsFields,
    ownerFetchedForIdRef,
    refreshProviderDetails,
  };
}
