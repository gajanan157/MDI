import { useForm, SubmitHandler, Resolver, UseFormSetError } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { DropzonePDF } from "@/app/pages/forms/file-upload/DropzonePDF";
import { yupResolver } from "@hookform/resolvers/yup";
import { addMasterProductSchema } from "./schema";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useEffect } from "react";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { createMasterProduct } from "@/store/features/masterProduct/masterProductSlice";
import { handleApiResponse } from "@/utils/errorHandler";
import { showErrorMessage } from "@/utils/errorHandler";

export interface FormValues {
  productName: string;
  insurerId: string;
  uin: string;
  documents: File[] | undefined;
}

interface AddPolicyModalProps {
  initialValues?: Partial<FormValues>;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface CreateMasterProductErrorPayload  {
  status?: number;
  message?: string;
  error?: string | { fields?: Record<string, string> } | null;
  errorPayload?: {
    error?: {
      fields?: Record<string, string>;
    };
  };
};

export function applyCreateMasterProductFieldErrors(
  payload: CreateMasterProductErrorPayload | undefined,
  setError: UseFormSetError<FormValues>,
): boolean {
  const apiFields = {
    ...(payload?.errorPayload?.error?.fields ?? {}),
    ...((payload?.error &&
    typeof payload.error === "object" &&
    !Array.isArray(payload.error)
      ? payload.error.fields
      : undefined) ?? {}),
  };
  let hasFieldError = false;
  if (apiFields.uin) {
    setError("uin", { type: "server", message: String(apiFields.uin) });
    hasFieldError = true;
  }
  if (apiFields.productName) {
    setError("productName", {
      type: "server",
      message: String(apiFields.productName),
    });
    hasFieldError = true;
  }
  if (apiFields.insurerId) {
    setError("insurerId", {
      type: "server",
      message: String(apiFields.insurerId),
    });
    hasFieldError = true;
  }
  if (!hasFieldError) {
    showErrorMessage({
      status: payload?.status,
      error:
        payload?.message ??
        (typeof payload?.error === "string" ? payload.error : null) ??
        "Unable to create master product.",
    });
  }
  return hasFieldError;
}

export const AddNewPolicyModal = ({
  initialValues = {},
  onClose,
  onSuccess,
}: AddPolicyModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(addMasterProductSchema) as Resolver<FormValues>,
    defaultValues: {
      productName: initialValues.productName ?? "",
      insurerId: initialValues.insurerId ?? "",
      uin: initialValues.uin ?? "",
      documents: initialValues.documents ?? [],
    },
  });
  const dispatch = useAppDispatch();
  const creating = useAppSelector((s) => s.masterProduct.creating);

  const { insurerMainList } = useAppSelector((state) => state.insurer);

  useEffect(() => {
    dispatch(fetchInsurers({ size: "200" }));
  }, [dispatch]);

  const insurerListNew = insurerMainList?.map((i: any) => ({
    value: i?.id,
    label: i?.name,
  }));

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const file = data.documents?.[0];

    const result = await dispatch(
      createMasterProduct({
        uin: data.uin,
        insurerId: data.insurerId,
        productName: data.productName,
        file,
      }),
    );

    if (!createMasterProduct.fulfilled.match(result)) {
      applyCreateMasterProductFieldErrors(
        result.payload as CreateMasterProductErrorPayload | undefined,
        setError,
      );
      return;
    }

    const normalized = {
      success: true,
      data: result.payload ?? null,
      error: null,
    };
    if (handleApiResponse(normalized, "Master product created successfully")) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4 sm:p-6">
      <div className="relative max-h-[95vh] w-full max-w-[700px] overflow-y-auto rounded-lg bg-white p-4 shadow-lg sm:p-6">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-semibold">Add New Master Product</h2>
          <XMarkIcon className="h-6 w-6 cursor-pointer shrink-0" onClick={onClose} />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          <div className="mt-2 md:col-span-2">
            <DropzonePDF control={control} name="documents" />
          </div>

          <DropdownSelect
            label="Insurance Company"
            name_key="insurerId"
            defaultValue="Insurance Company"
            options={insurerListNew ?? []}
            control={control}
            rules={{ required: "Insurance company is required" }}
            name="insurerId"
            errors={errors.insurerId}
            className="h-[42px] rounded-lg"
            isRequired
          />
          <Input
            label="Product Name"
            isRequired
            placeholder="Enter Product Name"
            {...register("productName", { required: "Product name is required" })}
            error={errors.productName?.message}
          />
          <div className="md:col-span-2">
            <Input
              label="UIN"
              isRequired
              placeholder="Enter UIN"
              {...register("uin", { required: "UIN is required" })}
              error={errors.uin?.message}
            />
          </div>
          <div className="mt-4 flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-primary-600 px-6 py-2 text-white disabled:opacity-50"
            >
              {creating ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
