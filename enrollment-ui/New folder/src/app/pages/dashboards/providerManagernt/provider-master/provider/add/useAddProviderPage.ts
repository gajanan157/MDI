import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseFormSetError, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useNavigate, type NavigateFunction } from "react-router";
import type { Source } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import {
    createProvider as createProviderApi,
    getProviderList,
    unwrapProviderEntity,
} from "@/store/features/provider/providerAPI";
import type { ProviderListQuery } from "@/store/features/provider/providerTypes";
import { fetchProviderClinicalSpecialties } from "@/store/features/providerClinicalSpecialties/providerClinicalSpecialtiesSlice";
import {
    buildRohiniMasterQueryParams,
    extractRohiniListFromEnvelope,
    getProviderRohiniMasterList,
} from "@/store/features/providerRohini/providerRohiniAPI";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { fetchCitiesByState } from "@/store/features/stateCity/stateCitySlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import {
    DEFAULT_PROVIDER_TYPE,
    fetchProviderClassOptions,
    type ProviderTaxonomyOption,
} from "../detail/tabs/providerDetails/options";
import { formatProviderTaxonomyLabel } from "../utils/providerTypeConstants";
import { PROVIDERS_LIST_PATH, providerDetailDefaultPath } from "../utils/providersPaths";
import {
    ADD_PROVIDER_FIELD_KEYS as K,
    applyAddProviderApiFieldErrors,
    buildAddProviderCreateBody,
    type AddProviderFormValues,
} from "./addProviderSchema";

const ROHINI_LOOKUP_REGEX = /^\d{13}$/;

type BooleanRef = { current: boolean };

function readCreatedProviderId(responseData: unknown): string {
    const entity = unwrapProviderEntity(responseData);
    if (entity == null || typeof entity !== "object") return "";
    const record = entity as Record<string, unknown>;
    const providerId = record.providerId ?? record.provider_id;
    return typeof providerId === "string" ? providerId.trim() : "";
}

function readProviderIdFromListItem(item: unknown): string {
    if (item == null || typeof item !== "object") return "";
    const record = item as Record<string, unknown>;
    const providerId = record.providerId ?? record.provider_id ?? record.id;
    return typeof providerId === "string" ? providerId.trim() : "";
}

function extractFirstProviderIdFromListPayload(data: unknown): string {
    const fromArray = (list: unknown): string => {
        if (!Array.isArray(list) || list.length === 0) return "";
        return readProviderIdFromListItem(list[0]);
    };

    if (Array.isArray(data)) return fromArray(data);
    if (data == null || typeof data !== "object") return "";

    const envelope = data as Record<string, unknown>;
    for (const key of ["data", "content", "items", "result", "payload"]) {
        const value = envelope[key];
        const direct = fromArray(value);
        if (direct) return direct;
        if (value != null && typeof value === "object" && !Array.isArray(value)) {
            const nested = value as Record<string, unknown>;
            const nestedId =
                fromArray(nested.content) ||
                fromArray(nested.data) ||
                fromArray(nested.items);
            if (nestedId) return nestedId;
        }
    }
    return "";
}

async function findExistingProviderIdByRohini(rohiniCode: string): Promise<string> {
    const query: ProviderListQuery = {
        providerName: "",
        providerRohiniCode: rohiniCode,
        providerCode: "",
        page: 1,
        size: 5,
    };
    const res = await getProviderList(query);
    if (!res.success) return "";
    return extractFirstProviderIdFromListPayload(res.data);
}

type CreateProviderApiResult = Awaited<ReturnType<typeof createProviderApi>>;
type DuplicateRohiniHandler = (providerId: string) => void;

async function resolveExistingProviderId(
    knownProviderId: string,
    rohiniNumber: string,
): Promise<string> {
    const known = knownProviderId.trim();
    if (known) return known;
    return findExistingProviderIdByRohini(rohiniNumber);
}

async function tryOpenDuplicateRohiniDialog(
    knownProviderId: string,
    rohiniNumber: string,
    onDuplicate: DuplicateRohiniHandler,
): Promise<boolean> {
    if (!rohiniNumber) return false;
    const existingId = await resolveExistingProviderId(knownProviderId, rohiniNumber);
    if (!existingId) return false;
    onDuplicate(existingId);
    return true;
}

function readCreateProviderErrorMessage(result: CreateProviderApiResult): string {
    if (typeof result.message === "string" && result.message.trim()) {
        return result.message;
    }
    return typeof result.error === "string" ? result.error : "";
}

function isDuplicateRohiniApiMessage(message: string): boolean {
    return /rohini/i.test(message) && /already\s+exists|duplicate|exist/i.test(message);
}

function readCreateProviderErrorText(result: CreateProviderApiResult): string | null {
    return typeof result.error === "string" ? result.error : null;
}

async function handleCreateProviderFailure(
    result: CreateProviderApiResult,
    rohiniNumber: string,
    knownProviderId: string,
    setError: UseFormSetError<AddProviderFormValues>,
    onDuplicate: DuplicateRohiniHandler,
): Promise<void> {
    const shouldLookupDuplicate =
        Boolean(rohiniNumber) &&
        isDuplicateRohiniApiMessage(readCreateProviderErrorMessage(result));
    if (shouldLookupDuplicate) {
        const opened = await tryOpenDuplicateRohiniDialog(
            knownProviderId,
            rohiniNumber,
            onDuplicate,
        );
        if (opened) return;
    }

    const appliedFieldErrors = applyAddProviderApiFieldErrors(
        {
            errorPayload: result.errorPayload,
            message: result.message,
            error: readCreateProviderErrorText(result),
        },
        setError,
    );
    if (appliedFieldErrors) return;

    showErrorMessage({
        status: result.status,
        error: result.error ?? result.message,
    });
}

function toProviderDetailNavState(
    networkType: AddProviderFormValues["providerNetworkType"],
): { providerNetworkType: "NETWORK" | "NON_NETWORK" } | undefined {
    if (networkType !== "NETWORK" && networkType !== "NON_NETWORK") return undefined;
    return { providerNetworkType: networkType };
}

function navigateAfterProviderCreate(
    navigate: NavigateFunction,
    responseData: unknown,
    networkType: AddProviderFormValues["providerNetworkType"],
): void {
    const providerId = readCreatedProviderId(responseData);
    if (!providerId) {
        navigate(PROVIDERS_LIST_PATH);
        return;
    }
    navigate(providerDetailDefaultPath(providerId), {
        state: toProviderDetailNavState(networkType),
    });
}

function useAddProviderFormOptions(open: boolean, lockedTypeCode = DEFAULT_PROVIDER_TYPE) {
    const dispatch = useAppDispatch();
    const clinicalSpecialtiesList = useAppSelector(
        (state) => state.providerClinicalSpecialties.clinicalSpecialtiesList,
    );
    const clinicalLoading = useAppSelector(
        (state) => state.providerClinicalSpecialties.loading,
    );
    const insurerList = useAppSelector((state) => state.insurerList.insurerList);
    const insurerLoading = useAppSelector((state) => state.insurerList.loading);

    const [categoryRows, setCategoryRows] = useState<ProviderTaxonomyOption[]>([]);
    const [categoryLoading, setCategoryLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        if ((insurerList?.length ?? 0) > 0) return;
        dispatch(fetchInsurerList());
    }, [dispatch, insurerList, open]);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        (async () => {
            setCategoryLoading(true);
            const result = await fetchProviderClassOptions();
            if (cancelled) return;

            if ("error" in result) {
                showErrorMessage({ error: result.error });
                setCategoryRows([]);
            } else {
                setCategoryRows(result);
            }
            setCategoryLoading(false);
        })().catch(() => { });

        return () => {
            cancelled = true;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        dispatch(
            fetchProviderClinicalSpecialties({
                page: 1,
                size: 20,
                onlyName: true,
            }),
        );
    }, [open, dispatch]);

    const providerTypeOptions = useMemo(
        () => [
            {
                value: lockedTypeCode,
                label: formatProviderTaxonomyLabel(lockedTypeCode),
            },
        ],
        [lockedTypeCode],
    );

    const providerCategoryOptions = useMemo(() => {
        const seen = new Set<string>();
        const options: Array<{ label: string; value: string }> = [];
        const ordered = [...categoryRows].sort(
            (a, b) => Number(b.isActive) - Number(a.isActive),
        );

        for (const row of ordered) {
            const value = row.providerTypeId.trim();
            if (!value || seen.has(value)) continue;
            seen.add(value);
            options.push({
                value,
                label: row.displayName || formatProviderTaxonomyLabel(row.classCode),
            });
        }

        return [{ value: "", label: "Select" }, ...options];
    }, [categoryRows]);

    const clinicalSpecialityOptions = useMemo(
        () =>
            clinicalSpecialtiesList.map((row) => ({
                value: row.id,
                label: row.name,
            })),
        [clinicalSpecialtiesList],
    );

    const insurerOptions = useMemo(
        () =>
            (insurerList ?? [])
                .map((insurer) => ({
                    value: String(insurer.insurerId ?? "").trim(),
                    label: String(insurer.insurerName ?? "").trim(),
                }))
                .filter((option) => option.value && option.label),
        [insurerList],
    );

    return {
        providerTypeOptions,
        providerCategoryOptions,
        clinicalSpecialityOptions,
        insurerOptions,
        defaultProviderType: lockedTypeCode,
        loading: categoryLoading || clinicalLoading || insurerLoading,
    };
}

function useAddProviderPincodeLookup(
    watch: UseFormWatch<AddProviderFormValues>,
    setValue: UseFormSetValue<AddProviderFormValues>,
    enabled: boolean,
    skipPinSourceRef: BooleanRef,
) {
    const dispatch = useAppDispatch();
    const { cityList } = useAppSelector((state) => state.stateCity);

    const pinCode = watch(K.providerPostalCode);
    const sourceRef = useRef<Source>(null);
    const programmaticRef = useRef(false);

    useEffect(() => {
        if (!enabled) return;
        if (skipPinSourceRef.current) {
            skipPinSourceRef.current = false;
            return;
        }
        if (!programmaticRef.current && pinCode) {
            sourceRef.current = "pin";
        }
    }, [enabled, pinCode, skipPinSourceRef]);

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
        setValue(K.providerCity, match.city, { shouldDirty: false, shouldValidate: true });
        setValue(K.providerStateName, match.stateName, {
            shouldDirty: false,
            shouldValidate: true,
        });
        programmaticRef.current = false;
        sourceRef.current = null;
    }, [enabled, pinCode, cityList, setValue]);
}

function clearRohiniDerivedFields(
    setValue: UseFormSetValue<AddProviderFormValues>,
    skipPinSourceRef: BooleanRef,
) {
    const clearField = (
        field:
            | typeof K.providerName
            | typeof K.providerAddress
            | typeof K.providerCity
            | typeof K.providerStateName
            | typeof K.providerDistrict
            | typeof K.providerPostalCode,
    ) => {
        setValue(field, "", { shouldDirty: true, shouldValidate: true });
    };

    clearField(K.providerName);
    clearField(K.providerAddress);
    skipPinSourceRef.current = true;
    clearField(K.providerPostalCode);
    clearField(K.providerCity);
    clearField(K.providerStateName);
    clearField(K.providerDistrict);
}

type RohiniLockedAddressSnapshot = {
    providerName: string;
    providerAddress: string;
    providerPostalCode: string;
    providerCity: string;
    providerStateName: string;
    providerDistrict: string;
};

const ROHINI_LOCKED_ADDRESS_FIELDS = [
    K.providerName,
    K.providerAddress,
    K.providerPostalCode,
    K.providerCity,
    K.providerStateName,
    K.providerDistrict,
] as const;

function applyRohiniMasterToAddForm(
    item: {
        providerName?: string;
        providerAddress?: string;
        postalCode?: string;
        city?: string;
        stateName?: string;
        district?: string;
    },
    setValue: UseFormSetValue<AddProviderFormValues>,
    skipPinSourceRef: BooleanRef,
): RohiniLockedAddressSnapshot {
    const setIfPresent = (
        field:
            | typeof K.providerName
            | typeof K.providerAddress
            | typeof K.providerCity
            | typeof K.providerStateName
            | typeof K.providerDistrict,
        value: string | undefined,
    ) => {
        const trimmed = String(value ?? "").trim();
        if (!trimmed) return "";
        setValue(field, trimmed, { shouldDirty: true, shouldValidate: true });
        return trimmed;
    };

    const providerName = setIfPresent(K.providerName, item.providerName);
    const providerAddress = setIfPresent(K.providerAddress, item.providerAddress);

    const postal = String(item.postalCode ?? "").trim();
    if (postal) {
        skipPinSourceRef.current = true;
        setValue(K.providerPostalCode, postal, { shouldDirty: true, shouldValidate: true });
    }

    const providerCity = setIfPresent(K.providerCity, item.city);
    const providerStateName = setIfPresent(K.providerStateName, item.stateName);
    const providerDistrict = setIfPresent(K.providerDistrict, item.district);

    return {
        providerName,
        providerAddress,
        providerPostalCode: postal,
        providerCity,
        providerStateName,
        providerDistrict,
    };
}

function useAddProviderRohiniLookup(
    watch: UseFormWatch<AddProviderFormValues>,
    setValue: UseFormSetValue<AddProviderFormValues>,
    enabled: boolean,
    skipPinSourceRef: BooleanRef,
) {
    const rohiniNumber = watch(K.providerRohiniNumber);
    const providerName = watch(K.providerName);
    const providerAddress = watch(K.providerAddress);
    const providerPostalCode = watch(K.providerPostalCode);
    const providerCity = watch(K.providerCity);
    const providerStateName = watch(K.providerStateName);
    const providerDistrict = watch(K.providerDistrict);
    const lastFetchedRef = useRef("");
    const lockedAddressSnapshotRef = useRef<RohiniLockedAddressSnapshot | null>(null);
    const [rohiniFieldsLocked, setRohiniFieldsLocked] = useState(false);
    const [existingProviderId, setExistingProviderId] = useState("");

    useEffect(() => {
        if (!enabled) return;

        const code = String(rohiniNumber ?? "").trim();

        if (rohiniFieldsLocked && lastFetchedRef.current !== code) {
            clearRohiniDerivedFields(setValue, skipPinSourceRef);
            lockedAddressSnapshotRef.current = null;
            setRohiniFieldsLocked(false);
            setExistingProviderId("");
            lastFetchedRef.current = "";
        }

        if (!ROHINI_LOOKUP_REGEX.test(code)) {
            setExistingProviderId("");
            return;
        }
        if (lastFetchedRef.current === code) return;

        let cancelled = false;

        const load = async () => {
            try {
                const params = buildRohiniMasterQueryParams(0, 20, false, {
                    providerRohiniCode: code,
                });
                const [body, providerId] = await Promise.all([
                    getProviderRohiniMasterList(params),
                    findExistingProviderIdByRohini(code),
                ]);
                if (cancelled) return;

                setExistingProviderId(providerId);

                const { items } = extractRohiniListFromEnvelope(body);
                const match =
                    items.find((item) => String(item.rohiniCode ?? "").trim() === code) ??
                    items[0];

                if (!match) {
                    lastFetchedRef.current = code;
                    lockedAddressSnapshotRef.current = null;
                    setRohiniFieldsLocked(false);
                    clearRohiniDerivedFields(setValue, skipPinSourceRef);
                    showErrorMessage({
                        error: "No Rohini master record found for this number.",
                    });
                    return;
                }

                lastFetchedRef.current = code;
                lockedAddressSnapshotRef.current = applyRohiniMasterToAddForm(
                    match,
                    setValue,
                    skipPinSourceRef,
                );
                setRohiniFieldsLocked(true);
            } catch (error: unknown) {
                if (cancelled) return;
                lastFetchedRef.current = code;
                lockedAddressSnapshotRef.current = null;
                setRohiniFieldsLocked(false);
                setExistingProviderId("");
                clearRohiniDerivedFields(setValue, skipPinSourceRef);
                const err = error as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                showErrorMessage({
                    error:
                        err.response?.data?.message ??
                        err.message ??
                        "Failed to fetch Rohini master details.",
                });
            }
        };

        load().catch(() => { });

        return () => {
            cancelled = true;
        };
    }, [enabled, rohiniNumber, setValue, skipPinSourceRef, rohiniFieldsLocked]);

    // Browser contact autofill (e.g. email pick) can overwrite address fields even when disabled.
    // Keep Rohini-derived values authoritative while the lock is active.
    useEffect(() => {
        if (!rohiniFieldsLocked) return;
        const snapshot = lockedAddressSnapshotRef.current;
        if (!snapshot) return;

        const currentByField: RohiniLockedAddressSnapshot = {
            providerName: String(providerName ?? ""),
            providerAddress: String(providerAddress ?? ""),
            providerPostalCode: String(providerPostalCode ?? ""),
            providerCity: String(providerCity ?? ""),
            providerStateName: String(providerStateName ?? ""),
            providerDistrict: String(providerDistrict ?? ""),
        };

        for (const field of ROHINI_LOCKED_ADDRESS_FIELDS) {
            const expected = snapshot[field];
            if (currentByField[field] === expected) continue;
            if (field === K.providerPostalCode) {
                skipPinSourceRef.current = true;
            }
            setValue(field, expected, { shouldDirty: true, shouldValidate: true });
        }
    }, [
        providerName,
        providerAddress,
        providerPostalCode,
        providerCity,
        providerStateName,
        providerDistrict,
        rohiniFieldsLocked,
        setValue,
        skipPinSourceRef,
    ]);

    return { rohiniFieldsLocked, existingProviderId };
}

type UseAddProviderPageArgs = {
    canWrite: boolean;
    watch: UseFormWatch<AddProviderFormValues>;
    setValue: UseFormSetValue<AddProviderFormValues>;
};

export function useAddProviderPage({
    canWrite,
    watch,
    setValue,
}: Readonly<UseAddProviderPageArgs>) {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const skipPinSourceRef = useRef(false);

    const options = useAddProviderFormOptions(canWrite, DEFAULT_PROVIDER_TYPE);
    useAddProviderPincodeLookup(watch, setValue, canWrite, skipPinSourceRef);
    const { rohiniFieldsLocked, existingProviderId } = useAddProviderRohiniLookup(
        watch,
        setValue,
        canWrite,
        skipPinSourceRef,
    );

    const handleCancel = useCallback(() => {
        if (saving) return;
        navigate(PROVIDERS_LIST_PATH);
    }, [navigate, saving]);

    const [duplicateRohiniDialog, setDuplicateRohiniDialog] = useState<{
        open: boolean;
        providerId: string;
    }>({ open: false, providerId: "" });

    const closeDuplicateRohiniDialog = useCallback(() => {
        setDuplicateRohiniDialog({ open: false, providerId: "" });
    }, []);

    const redirectToExistingProvider = useCallback(() => {
        const providerId = duplicateRohiniDialog.providerId.trim();
        closeDuplicateRohiniDialog();
        if (!providerId) return;
        navigate(providerDetailDefaultPath(providerId));
    }, [closeDuplicateRohiniDialog, duplicateRohiniDialog.providerId, navigate]);

    const openDuplicateRohiniDialog = useCallback((providerId: string) => {
        setDuplicateRohiniDialog({
            open: true,
            providerId: providerId.trim(),
        });
    }, []);

    const handleSaveProvider = useCallback(
        async (
            values: AddProviderFormValues,
            setError: UseFormSetError<AddProviderFormValues>,
        ) => {
            setSaving(true);
            try {
                const rohiniNumber = String(values.providerRohiniNumber ?? "").trim();
                const openedDuplicate = await tryOpenDuplicateRohiniDialog(
                    existingProviderId,
                    rohiniNumber,
                    openDuplicateRohiniDialog,
                );
                if (openedDuplicate) return;

                const result = await createProviderApi(buildAddProviderCreateBody(values));
                if (!result.success) {
                    await handleCreateProviderFailure(
                        result,
                        rohiniNumber,
                        existingProviderId,
                        setError,
                        openDuplicateRohiniDialog,
                    );
                    return;
                }

                showSuccessMessage(result.message ?? "Provider created successfully.");
                navigateAfterProviderCreate(
                    navigate,
                    result.data,
                    values.providerNetworkType,
                );
            } finally {
                setSaving(false);
            }
        },
        [existingProviderId, navigate, openDuplicateRohiniDialog],
    );

    return {
        saving,
        handleCancel,
        handleSaveProvider,
        rohiniFieldsLocked,
        duplicateRohiniDialog,
        closeDuplicateRohiniDialog,
        redirectToExistingProvider,
        ...options,
    };
}
