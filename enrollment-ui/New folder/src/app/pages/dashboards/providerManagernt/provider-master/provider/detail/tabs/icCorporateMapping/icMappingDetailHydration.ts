import { showErrorMessage } from "@/utils/errorHandler";
import { fetchInsurerProviderCode, fetchProviderNetworkMappingById } from "./api";
import {
  buildIcMappingFormFromItem,
  cloneIcMappingFormState,
  mapProviderNetworkMappingToForm,
} from "./mapping/utils";
import {
  mapCorporateNetworkMappingToGridRow,
  mapNetworkMappingToGridRow,
} from "./mapping/network";
import type { IcMappingFormState } from "./types";

type MappingSubTab = "ic" | "corporate";

type HydrateMappingDetailParams = {
  providerId: string;
  providerNetworkMappingId: string;
  mappingSubTab: MappingSubTab;
  detailMappingItem: {
    icProviderCode?: string;
    id?: string;
    name?: string;
  };
  isEditing: boolean;
  hydrateIcMappingDetailItem?: (item: unknown) => void;
  setIcMappingForm: (form: IcMappingFormState) => void;
  setOriginalFormRef: (form: IcMappingFormState | null) => void;
  onLoadFailed: () => void;
  onComplete: () => void;
};

export async function hydrateNetworkMappingDetail(
  params: HydrateMappingDetailParams,
): Promise<void> {
  const {
    providerId,
    providerNetworkMappingId,
    mappingSubTab,
    detailMappingItem,
    isEditing,
    hydrateIcMappingDetailItem,
    setIcMappingForm,
    setOriginalFormRef,
    onLoadFailed,
    onComplete,
  } = params;

  try {
    const result = await fetchProviderNetworkMappingById(providerId, providerNetworkMappingId);
    if (!result.ok) {
      onLoadFailed();
      showErrorMessage({ error: result.message });
      return;
    }

    const gridItem =
      mappingSubTab === "corporate"
        ? mapCorporateNetworkMappingToGridRow(result.row)
        : mapNetworkMappingToGridRow(result.row);

    hydrateIcMappingDetailItem?.(gridItem);

    const formState = mapProviderNetworkMappingToForm(result.row);
    const gridFallback = buildIcMappingFormFromItem(detailMappingItem, mappingSubTab);

    let icProviderCode = formState.icProviderCode.trim();
    if (!icProviderCode) {
      icProviderCode = detailMappingItem.icProviderCode?.trim() ?? "";
    }
    if (!icProviderCode && result.row.insurerId.trim()) {
      icProviderCode = await fetchInsurerProviderCode(providerId, result.row.insurerId);
    }

    const nextForm: IcMappingFormState = {
      ...formState,
      icName: formState.icName.trim() || gridFallback.icName,
      empanelmentSource: formState.empanelmentSource.trim() || gridFallback.empanelmentSource,
      effectiveFrom: formState.effectiveFrom.trim() || gridFallback.effectiveFrom,
      icProviderCode,
    };
    setIcMappingForm(nextForm);
    if (isEditing) {
      setOriginalFormRef(cloneIcMappingFormState(nextForm));
    }
  } catch (error) {
    showErrorMessage({
      error: error instanceof Error ? error.message : undefined,
    });
  } finally {
    onComplete();
  }
}
