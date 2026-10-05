import { useTranslation } from "react-i18next";
import { useDiscountSupportingDocumentView } from "../hooks/useDiscountSupportingDocumentView";

type DiscountSupportingDocumentViewProps = {
  supportingFileMetadataId: string;
  supportingDocumentName: string;
};

export function DiscountSupportingDocumentView({
  supportingFileMetadataId,
  supportingDocumentName,
}: Readonly<DiscountSupportingDocumentViewProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const { loading, error, displayName, viewUrl, hasDocument } =
    useDiscountSupportingDocumentView(supportingFileMetadataId, supportingDocumentName);

  if (!hasDocument) {
    return <span className="text-xs text-gray-500">—</span>;
  }

  if (loading && !displayName) {
    return (
      <span className="text-xs text-gray-500">{t(`${D}.supportingDocumentLoading`)}</span>
    );
  }

  const label = displayName || t(`${D}.supportingDocument`);

  if (viewUrl) {
    return (
      <a
        href={viewUrl}
        target="_blank"
        rel="noreferrer"
        className="text-xs font-medium text-primary-600 underline hover:text-primary-800"
        title={label}
      >
        {label}
      </a>
    );
  }

  if (error) {
    return <span className="text-xs text-red-600">{error}</span>;
  }

  return <span className="text-xs text-gray-900">{label}</span>;
}
