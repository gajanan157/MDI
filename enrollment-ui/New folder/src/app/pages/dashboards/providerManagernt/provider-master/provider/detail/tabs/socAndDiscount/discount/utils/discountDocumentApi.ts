import type { DiscountFormValues } from "../types/discountTypes";
import { SUPPORTING_DOCUMENT_REQUIRED_MESSAGE } from "../../../icCorporateMapping/shared";
import {
  deleteRestrictionSupportingDocumentFile,
  fetchRestrictionSupportingDocumentPresign,
  uploadRestrictionSupportingDocument,
} from "../../../icCorporateMapping/restriction/documents";

export {
  deleteRestrictionSupportingDocumentFile as deleteDiscountSupportingDocumentFile,
  fetchRestrictionSupportingDocumentPresign as fetchDiscountSupportingDocumentPresign,
  uploadRestrictionSupportingDocument as uploadDiscountSupportingDocument,
};

export type ResolveDiscountSupportingDocumentResult =
  | { ok: true; supportingFileMetadataId: string }
  | { ok: false; message?: string };

/** Upload pending file (if any) and ensure a metadata id exists before save. */
export async function resolveDiscountSupportingDocumentForSave(
  providerId: string,
  values: Pick<DiscountFormValues, "supportingFileMetadataId" | "supportingDocumentName">,
  pendingFile: File | null,
  originalMetadataId?: string,
): Promise<ResolveDiscountSupportingDocumentResult> {
  const trimmedProviderId = providerId.trim();
  const existingMetadataId = String(values.supportingFileMetadataId ?? "").trim();
  let supportingFileMetadataId =
    existingMetadataId || String(originalMetadataId ?? "").trim();

  // Field upload already stored a metadata id; do not upload the same file again.
  if (pendingFile && trimmedProviderId && !existingMetadataId) {
    const uploadResult = await uploadRestrictionSupportingDocument(
      pendingFile,
      trimmedProviderId,
    );
    if (!uploadResult.ok) {
      return { ok: false, message: uploadResult.message };
    }
    supportingFileMetadataId = uploadResult.fileMetadataId;
  }

  if (!supportingFileMetadataId) {
    return { ok: false, message: SUPPORTING_DOCUMENT_REQUIRED_MESSAGE };
  }

  return { ok: true, supportingFileMetadataId };
}
