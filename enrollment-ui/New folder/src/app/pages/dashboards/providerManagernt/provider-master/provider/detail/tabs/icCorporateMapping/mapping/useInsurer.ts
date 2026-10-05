import { useEffect, useState } from "react";
import { showErrorMessage } from "@/utils/errorHandler";
import { filterAlphanumericCodeInput } from "../../../../../../shared/alphanumericCodeInput";
import { fetchInsurerNetworkModeValues, fetchInsurerProviderCode } from "../api";
import type { IcMappingFormState } from "../types";

function normalizeInsurerId(value: unknown): string {
  return String(value ?? "").trim();
}

/**
 * Network Mode and Tariff Type come from the insurer network mode master and
 * are read-only on the New IC mapping form. Whenever the selected IC changes,
 * this re-fetches them and writes the values into the form state for display.
 */
export async function applyInsurerNetworkModeToForm(
  insurerId: string,
  setIcMappingForm: React.Dispatch<React.SetStateAction<IcMappingFormState>>,
): Promise<void> {
  const requestInsurerId = normalizeInsurerId(insurerId);
  if (!requestInsurerId) {
    setIcMappingForm((prev) => ({ ...prev, networkMode: "", tariffType: "" }));
    return;
  }

  const values = await fetchInsurerNetworkModeValues(requestInsurerId);
  setIcMappingForm((prev) => ({
    ...prev,
    networkMode: values.networkMode,
    tariffType: values.tariffType,
  }));
}

export function useInsurerNetworkMode(
  insurerId: string,
  setIcMappingForm: React.Dispatch<React.SetStateAction<IcMappingFormState>>,
  enabled = true,
) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const requestInsurerId = normalizeInsurerId(insurerId);
    const clearNetworkModeValues = () =>
      setIcMappingForm((prev) => ({ ...prev, networkMode: "", tariffType: "" }));

    if (!requestInsurerId) {
      clearNetworkModeValues();
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadValues = async () => {
      setLoading(true);
      try {
        await applyInsurerNetworkModeToForm(requestInsurerId, setIcMappingForm);
      } catch (error) {
        if (cancelled) return;
        showErrorMessage({
          error: error instanceof Error ? error.message : undefined,
        });
        clearNetworkModeValues();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadValues().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [insurerId, setIcMappingForm, enabled]);

  return { networkModeLoading: loading };
}

/** * IC Provider Code from GET `/v1/provider/{providerId}/identifier?referenceEntityId=...`.
 * Create mode only — mapping detail loads identifier alongside network-mapping GET.
 */
export function useInsurerProviderCode(
  providerId: string | undefined,
  referenceEntityId: string,
  setIcMappingForm: React.Dispatch<React.SetStateAction<IcMappingFormState>>,
  enabled: boolean,
) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const clearValue = () =>
      setIcMappingForm((prev) => ({ ...prev, icProviderCode: "" }));

    if (!providerId?.trim() || !referenceEntityId.trim()) {
      clearValue();
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadValue = async () => {
      setLoading(true);
      try {
        const icProviderCode = await fetchInsurerProviderCode(
          providerId,
          referenceEntityId,
        );
        if (cancelled) return;
        setIcMappingForm((prev) => ({
          ...prev,
          icProviderCode: filterAlphanumericCodeInput(icProviderCode),
        }));
      } catch (error) {
        if (cancelled) return;
        showErrorMessage({
          error: error instanceof Error ? error.message : undefined,
        });
        clearValue();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadValue();

    return () => {
      cancelled = true;
    };
  }, [providerId, referenceEntityId, enabled, setIcMappingForm]);

  return { icProviderCodeLoading: loading };
}
