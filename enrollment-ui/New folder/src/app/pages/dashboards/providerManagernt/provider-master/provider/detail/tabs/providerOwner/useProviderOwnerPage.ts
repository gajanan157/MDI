import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { Source } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import { showSuccessMessage } from "@/utils/errorHandler";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { fetchCitiesByState } from "@/store/features/stateCity/stateCitySlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  createProviderOwner,
  fetchProviderOwnerById,
  fetchProviderOwnerList,
  patchProviderOwner,
} from "@/store/features/providerOwner/providerOwnerSlice";
import type {
  NormalizedProviderOwner,
  ProviderOwnerRejectPayload,
} from "@/store/features/providerOwner/providerOwnerTypes";
import {
  PROVIDER_OWNER_KEYS as K,
  buildProviderOwnerCreateBody,
  buildProviderOwnerPatchBody,
  mapProviderOwnerToFormValues,
  providerOwnerEditPath,
  providerOwnerListPath,
  providerOwnerNewPath,
  type ProviderOwnerFormValues,
} from "./providerOwnerSchema";

const EMPTY_FILTERS = {
  providerOwnerName: "",
  providerOwnerDesignation: "",
  providerOwnerQualification: "",
};

function showOwnerMutateError(
  payload: ProviderOwnerRejectPayload | undefined,
  fallbackMessage?: string,
) {
  const message =
    payload?.message?.trim() ||
    fallbackMessage?.trim() ||
    "Request failed.";
  showProviderError(message, payload?.status);
}

export function useProviderOwnerTab(providerId: string | undefined) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const listState = useAppSelector((state) => state.providerOwner.list);

  const loadOwners = useCallback(() => {
    if (!providerId?.trim()) return;
    dispatch(fetchProviderOwnerList({ providerId, filters: EMPTY_FILTERS }));
  }, [dispatch, providerId]);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  useEffect(() => {
    if (!listState.error) return;
    showProviderError(listState.error);
  }, [listState.error]);

  const openCreateForm = () => {
    if (!providerId?.trim()) return;
    navigate(providerOwnerNewPath(providerId));
  };

  const openEditForm = (owner: NormalizedProviderOwner) => {
    if (!providerId?.trim()) return;
    const ownerId = owner.providerOwnerId.trim();
    if (!ownerId) return;
    navigate(providerOwnerEditPath(providerId, ownerId));
  };

  return {
    owners: listState.rows,
    loading: listState.loading,
    openCreateForm,
    openEditForm,
    reloadOwners: loadOwners,
  };
}

type UseProviderOwnerFormPageArgs = {
  providerId?: string;
  ownerId?: string;
  isEditMode: boolean;
};

export function useProviderOwnerFormPage({
  providerId,
  ownerId,
  isEditMode,
}: UseProviderOwnerFormPageArgs) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const detailState = useAppSelector((state) => state.providerOwner.detail);
  const mutateState = useAppSelector((state) => state.providerOwner.mutate);

  useEffect(() => {
    if (!isEditMode || !providerId?.trim() || !ownerId?.trim()) return;
    dispatch(fetchProviderOwnerById({ providerId, ownerId }));
  }, [dispatch, isEditMode, ownerId, providerId]);

  useEffect(() => {
    if (!detailState.error) return;
    showProviderError(detailState.error);
    if (providerId?.trim()) {
      navigate(providerOwnerListPath(providerId));
    }
  }, [detailState.error, navigate, providerId]);

  const editingOwner = useMemo((): NormalizedProviderOwner | null => {
    if (!isEditMode) return null;
    if (detailState.ownerId !== ownerId?.trim()) return null;
    return detailState.row;
  }, [detailState.ownerId, detailState.row, isEditMode, ownerId]);

  const handleCancel = () => {
    if (!providerId?.trim() || mutateState.saving) return;
    navigate(providerOwnerListPath(providerId));
  };

  const handleSaveOwner = async (values: ProviderOwnerFormValues) => {
    if (!providerId?.trim()) return;

    if (isEditMode && editingOwner?.providerOwnerId) {
      const result = await dispatch(
        patchProviderOwner({
          providerId,
          body: buildProviderOwnerPatchBody(values, editingOwner, providerId),
        }),
      );
      if (patchProviderOwner.rejected.match(result)) {
        showOwnerMutateError(result.payload, result.error?.message);
        return;
      }
      if (result.payload.message) {
        showSuccessMessage(result.payload.message);
      }
    } else {
      const result = await dispatch(
        createProviderOwner({
          providerId,
          body: buildProviderOwnerCreateBody(values),
        }),
      );
      if (createProviderOwner.rejected.match(result)) {
        showOwnerMutateError(result.payload, result.error?.message);
        return;
      }
      if (result.payload.message) {
        showSuccessMessage(result.payload.message);
      }
    }

    navigate(providerOwnerListPath(providerId));
  };

  const defaultFormValues = useMemo(
    () => (editingOwner ? mapProviderOwnerToFormValues(editingOwner) : undefined),
    [editingOwner],
  );

  return {
    loading: isEditMode ? detailState.loading : false,
    saving: mutateState.saving,
    editingOwner,
    defaultFormValues,
    handleCancel,
    handleSaveOwner,
  };
}

export function useProviderOwnerPincodeLookup(
  watch: UseFormWatch<ProviderOwnerFormValues>,
  setValue: UseFormSetValue<ProviderOwnerFormValues>,
  enabled: boolean,
) {
  const dispatch = useAppDispatch();
  const { cityList } = useAppSelector((state) => state.stateCity);
  const pinCode = watch(K.providerOwnerPincode);
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
    setValue(K.providerOwnerCity, match.city, { shouldDirty: false, shouldValidate: true });
    setValue(K.providerOwnerState, match.stateName, { shouldDirty: false, shouldValidate: true });
    programmaticRef.current = false;
    sourceRef.current = null;
  }, [enabled, pinCode, cityList, setValue]);
}
