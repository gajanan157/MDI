import { useEffect, useState } from "react";
import { fetchDiscountSupportingDocumentPresign } from "../utils/discountDocumentApi";

type SupportingDocumentViewState = {
  loading: boolean;
  error: string;
  displayName: string;
  viewUrl: string;
  hasDocument: boolean;
};

export function useDiscountSupportingDocumentView(
  supportingFileMetadataId: string,
  supportingDocumentName: string,
  enabled = true,
): SupportingDocumentViewState {
  const metadataId = String(supportingFileMetadataId ?? "").trim();
  const savedName = String(supportingDocumentName ?? "").trim();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState<{ fileName: string; presignedUrl: string } | null>(
    null,
  );

  useEffect(() => {
    if (!enabled || !metadataId) {
      setFetched(null);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetchDiscountSupportingDocumentPresign(metadataId)
      .then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setFetched(null);
        if (result.message) setError(result.message);
        return;
      }
      setFetched({
        fileName: result.fileName,
        presignedUrl: result.presignedUrl,
      });
    })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [enabled, metadataId]);

  const displayName = savedName || fetched?.fileName || "";
  const viewUrl = fetched?.presignedUrl ?? "";

  return {
    loading,
    error,
    displayName,
    viewUrl,
    hasDocument: Boolean(metadataId || savedName),
  };
}
