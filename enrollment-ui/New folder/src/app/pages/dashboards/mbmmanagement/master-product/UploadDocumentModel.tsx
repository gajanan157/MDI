import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DropzonePDF } from "@/app/pages/forms/file-upload/DropzonePDF";
import { yupResolver } from "@hookform/resolvers/yup";
import { documentSchema } from "./documentSchema";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import {
  applyChangesMasterProduct,
  fetchMasterProductById,
  fetchMasterProductDocuments,
  fetchMasterProducts,
} from "@/store/features/masterProduct/masterProductSlice";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";
import { useState } from "react";
// import DropdownSelect from "@/components/shared/form/DropdownSelect";
// export const DOCUMENT_TYPE_OPTIONS = [
//   { label: "Master Product", value: "MASTER_PRODUCT" },
//   { label: "Addendum", value: "ADDENDUM" },
// ];

export interface FormValues {
  documentType: string;
  documents: File[] | undefined;
}

interface AddPolicyModalProps {
  masterProductId: string;
  onClose: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const PDF_TYPE = "application/pdf";

export const UploadDocumentModel = ({
  masterProductId,
  onClose,
}: AddPolicyModalProps) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(documentSchema) as Resolver<FormValues>,
    defaultValues: {
      documentType: "MASTER_PRODUCT",
      documents: [],
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!data.documents?.length) return;

    // ✅ VALIDATION
    for (const file of data.documents) {
      if (file.type !== PDF_TYPE) {
        showErrorMessage({ error: "Only PDF files are allowed" });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        showErrorMessage({ error: "File size must be less than 50 MB" });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // ✅ SAVE RESPONSE INTO MASTER PRODUCT
      const payload = {
        id: masterProductId,
        masterProductJson: undefined, // ✅ not sent
        documentType: data.documentType || "MASTER_PRODUCT",
        documents: data.documents?.length ? data.documents : undefined,
      };
      //   const payload = { id, masterProductJson: updatedData };
      const result: any = await dispatch(applyChangesMasterProduct(payload));
      //   const result: any = await dispatch(applyChangesMasterProduct(payload));

      const normalized = {
        success: result?.payload?.success ?? result?.success ?? !result?.error,
        data: result?.payload ?? null,
        error: result?.error ?? null,
      };

      const successMessage =
        result?.payload?.message ?? "Document uploaded successfully";
      if (handleApiResponse(normalized, successMessage)) {
        await dispatch(fetchMasterProductById({ id: masterProductId }));
        await dispatch(fetchMasterProductDocuments({ id: masterProductId }));
        await dispatch(fetchMasterProducts({}));
        onClose();
      }
    } catch (err: unknown) {
      showErrorMessage({
        error:
          err instanceof Error ? err.message : "Failed to upload document",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40">
      <div className="relative w-[700px] rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-semibold">Upload Document</h2>
          <XMarkIcon className="h-6 w-6 cursor-pointer" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Document Type dropdown commented – using MASTER_PRODUCT by default
            <DropdownSelect ... />
          */}

          <DropzonePDF control={control} name="documents" />

          <div className="mt-4 flex justify-end">
            <button
              disabled={isSubmitting}
              className="bg-primary-600 rounded-md px-6 py-2 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
