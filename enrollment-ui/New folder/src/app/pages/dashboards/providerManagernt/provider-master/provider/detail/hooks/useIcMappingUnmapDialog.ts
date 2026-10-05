import { useCallback, useState } from "react";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import type { ItemWithIdName } from "../tabs/icCorporateMapping/types";
import { patchProviderNetworkMapping } from "../tabs/icCorporateMapping/api";
import { buildNetworkMappingUnmapBody, resolveProviderNetworkMappingId } from "../tabs/icCorporateMapping/mapping";
import {
  REMARK_REQUIRED_MESSAGE,
  SUPPORTING_DOCUMENT_REQUIRED_MESSAGE,
} from "../tabs/icCorporateMapping/shared";

type UseIcMappingUnmapDialogArgs = {
  providerId?: string;
  mappingSubTab: "ic" | "corporate";
  reloadNetworkMapping: () => Promise<void>;
};

export function useIcMappingUnmapDialog({
  providerId,
  mappingSubTab,
  reloadNetworkMapping,
}: Readonly<UseIcMappingUnmapDialogArgs>) {
  const [unmapDialogOpen, setUnmapDialogOpen] = useState(false);
  const [unmapDialogItem, setUnmapDialogItem] = useState<ItemWithIdName | null>(null);
  const [unmapEffectiveFrom, setUnmapEffectiveFrom] = useState("");
  const [unmapRemark, setUnmapRemark] = useState("");
  const [unmapSupportingFileMetadataId, setUnmapSupportingFileMetadataId] = useState("");
  const [unmapSupportingFileName, setUnmapSupportingFileName] = useState("");
  const [unmapInwardNo, setUnmapInwardNo] = useState("");
  const [unmapSaving, setUnmapSaving] = useState(false);
  const [unmapEffectiveFromError, setUnmapEffectiveFromError] = useState("");
  const [unmapRemarkError, setUnmapRemarkError] = useState("");
  const [unmapSupportingDocumentError, setUnmapSupportingDocumentError] = useState("");

  const openUnmapForItem = useCallback((item: ItemWithIdName) => {
    setUnmapDialogItem(item);
    setUnmapEffectiveFrom("");
    setUnmapEffectiveFromError("");
    setUnmapRemark("");
    setUnmapRemarkError("");
    setUnmapSupportingFileMetadataId("");
    setUnmapSupportingFileName("");
    setUnmapSupportingDocumentError("");
    setUnmapInwardNo("");
    setUnmapDialogOpen(true);
  }, []);

  const setUnmapSupportingFileMetadata = useCallback(
    (fileMetadataId: string, fileName: string, inwardNo?: string) => {
      setUnmapSupportingFileMetadataId(fileMetadataId);
      setUnmapSupportingFileName(fileName);
      setUnmapInwardNo(inwardNo?.trim() ?? "");
      if (fileMetadataId.trim()) setUnmapSupportingDocumentError("");
    },
    [],
  );

  const clearUnmapSupportingDocument = useCallback(() => {
    setUnmapSupportingFileMetadataId("");
    setUnmapSupportingFileName("");
    setUnmapInwardNo("");
  }, []);

  const resetUnmapDialog = useCallback(() => {
    setUnmapDialogOpen(false);
    setUnmapDialogItem(null);
    setUnmapEffectiveFrom("");
    setUnmapEffectiveFromError("");
    setUnmapRemark("");
    setUnmapRemarkError("");
    setUnmapSupportingFileMetadataId("");
    setUnmapSupportingFileName("");
    setUnmapSupportingDocumentError("");
    setUnmapInwardNo("");
  }, []);

  const closeUnmapDialog = useCallback(() => {
    if (unmapSaving) return;
    resetUnmapDialog();
  }, [unmapSaving, resetUnmapDialog]);

  const handleUnmapEffectiveFromChange = useCallback((value: string) => {
    setUnmapEffectiveFrom(value);
    if (value.trim()) setUnmapEffectiveFromError("");
  }, []);

  const handleUnmapRemarkChange = useCallback((value: string) => {
    setUnmapRemark(value);
    if (value.trim()) setUnmapRemarkError("");
  }, []);

  const handleUnmapSave = useCallback(async (): Promise<boolean> => {
    const resolvedProviderId = providerId?.trim();
    if (!resolvedProviderId || !unmapDialogItem) return false;

    let hasError = false;
    if (!unmapEffectiveFrom.trim()) {
      setUnmapEffectiveFromError("Effective From is required");
      hasError = true;
    }
    if (!unmapRemark.trim()) {
      setUnmapRemarkError(REMARK_REQUIRED_MESSAGE);
      hasError = true;
    }
    if (!unmapSupportingFileMetadataId.trim()) {
      setUnmapSupportingDocumentError(SUPPORTING_DOCUMENT_REQUIRED_MESSAGE);
      hasError = true;
    }
    if (hasError) return false;

    const mappingId = resolveProviderNetworkMappingId(unmapDialogItem);
    if (!mappingId) {
      showErrorMessage({ error: "Network mapping id is missing for this row." });
      return false;
    }

    setUnmapSaving(true);
    try {
      const body = buildNetworkMappingUnmapBody(unmapDialogItem, mappingSubTab, {
        effectiveFrom: unmapEffectiveFrom,
        remark: unmapRemark,
        supportingFileMetadataId: unmapSupportingFileMetadataId,
        inwardNo: unmapInwardNo,
      });

      const result = await patchProviderNetworkMapping(resolvedProviderId, body);
      if (!result.ok) {
        if (result.message) showErrorMessage({ error: result.message });
        return false;
      }

      if (result.message) {
        showSuccessMessage(result.message);
      }
      resetUnmapDialog();
      await reloadNetworkMapping();
      return true;
    } finally {
      setUnmapSaving(false);
    }
  }, [
    providerId,
    unmapDialogItem,
    mappingSubTab,
    unmapEffectiveFrom,
    unmapRemark,
    unmapSupportingFileMetadataId,
    unmapInwardNo,
    resetUnmapDialog,
    reloadNetworkMapping,
  ]);

  return {
    unmapDialogOpen,
    setUnmapDialogOpen,
    unmapDialogItem,
    unmapEffectiveFrom,
    setUnmapEffectiveFrom: handleUnmapEffectiveFromChange,
    unmapEffectiveFromError,
    unmapRemark,
    setUnmapRemark: handleUnmapRemarkChange,
    unmapRemarkError,
    unmapSupportingFileName,
    setUnmapSupportingFileMetadata,
    clearUnmapSupportingDocument,
    unmapSupportingDocumentError,
    setUnmapSupportingDocumentError,
    unmapSaving,
    closeUnmapDialog,
    handleUnmapSave,
    openUnmapForItem,
  };
}
