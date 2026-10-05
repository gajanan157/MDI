import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useParams } from "react-router";
import CreatableSelect from "react-select/creatable";
import Select, { type OptionProps, type StylesConfig } from "react-select";
import { Controller, type Control, type FieldErrors, type UseFormReturn } from "react-hook-form";
import { showErrorMessage } from "@/utils/errorHandler";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { verifyRestrictionPolicy } from "@/store/features/providerRestriction/providerRestrictionSlice";
import {
  RESTRICTION_APPLICABLE_OPTIONS,
  RESTRICTION_DOCUMENT_ACCEPT,
  RESTRICTION_DOCUMENT_INVALID_MESSAGE,
} from "./config";
import {
  SUPPORTING_DOCUMENT_ACCEPT,
  SUPPORTING_DOCUMENT_INVALID_MESSAGE,
  isAllowedSupportingDocument,
} from "../shared";
import { fetchRestrictionSupportingDocumentPresign, uploadRestrictionSupportingDocument, deleteRestrictionSupportingDocumentFile } from "./documents";
import { ChooseFileField } from "../../../shared/ChooseFileField";
import type { IcMappingFormState, RestrictionDetailsState, RestrictionFormValues } from "../types";

function resolveSelectControlBorderColor(
  isDisabled: boolean | undefined,
  isFocused: boolean | undefined,
  fallbackColor: unknown,
): string {
  if (isDisabled) return "#cad5e2";
  if (isFocused) return "#cdcdcd";
  if (typeof fallbackColor === "string") return fallbackColor;
  return "#cbd5e1";
}

function buildPolicyLabelsFromIds(
  prev: Record<string, string>,
  nextIds: string[],
): Record<string, string> {
  const nextLabels: Record<string, string> = {};
  nextIds.forEach((id) => {
    if (prev[id]) nextLabels[id] = prev[id];
  });
  return nextLabels;
}

function syncPolicySelectChange(
  next: readonly { value: string }[] | null | undefined,
  fieldOnChange: (value: string[]) => void,
  setPolicyLabels: Dispatch<SetStateAction<Record<string, string>>>,
  setLocalError: Dispatch<SetStateAction<string>>,
): void {
  const nextIds = next?.map((item) => item.value.trim()).filter(Boolean) ?? [];
  fieldOnChange(nextIds);
  setPolicyLabels((prev) => buildPolicyLabelsFromIds(prev, nextIds));
  setLocalError("");
}

// --- from components/RestrictionApplicableFields.tsx ---

type ApplicableOption = { label: string; value: string };

type RestrictionApplicableFieldsProps = {
  restrictionForm: UseFormReturn<RestrictionFormValues>;
  restrictionType: string;
  applicableError?: string;
  disabled?: boolean;
  options?: { label: string; value: string }[];
};

function ApplicableCheckboxOption(props: OptionProps<ApplicableOption, true>) {
  const { innerProps, isSelected, label } = props;
  return (
    <div
      {...innerProps}
      className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[13px] text-slate-700 hover:bg-slate-100"
    >
      <input type="checkbox" checked={isSelected} readOnly tabIndex={-1} className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

const applicableSelectStyles = {
  control: (base: Record<string, unknown>, state: { isDisabled?: boolean; isFocused?: boolean }) => ({
    ...base,
    minHeight: 32,
    maxHeight: 32,
    fontSize: 12,
    opacity: state.isDisabled ? 0.6 : 1,
    fontWeight: state.isDisabled ? 700 : 400,
    color: state.isDisabled ? "#000" : "black",
    backgroundColor: state.isDisabled ? "#e9eef5" : base.backgroundColor,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: resolveSelectControlBorderColor(
      state.isDisabled,
      state.isFocused,
      "#cbd5e1",
    ),
    borderRadius: 4,
    padding: "0.08rem",
    flexWrap: "nowrap",
    overflow: "visible",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(0,0,0,0.04)" : "none",
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 99999,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
  }),
  menuPortal: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 99999,
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: "#ffffff",
    maxHeight: 240,
    padding: 0,
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 28,
    maxHeight: 28,
    padding: "0 6px",
    flexWrap: "nowrap",
    overflowX: "auto",
    overflowY: "hidden",
    flex: "1 1 0%",
    minWidth: 0,
    gap: 2,
    WebkitOverflowScrolling: "touch",
  }),
  indicatorsContainer: (base: Record<string, unknown>) => ({
    ...base,
    alignSelf: "center",
    flexShrink: 0,
    height: 28,
  }),
  multiValue: (base: Record<string, unknown>) => ({
    ...base,
    margin: "1px 2px",
    flexShrink: 0,
  }),
  multiValueLabel: (base: Record<string, unknown>) => ({
    ...base,
    fontSize: 11,
    padding: "1px 4px",
    whiteSpace: "nowrap",
  }),
  option: () => ({
    padding: 0,
    backgroundColor: "transparent",
  }),
} as StylesConfig<ApplicableOption, true>;

export function RestrictionApplicableFields({
  restrictionForm,
  restrictionType,
  applicableError,
  disabled = false,
  options = RESTRICTION_APPLICABLE_OPTIONS,
}: Readonly<RestrictionApplicableFieldsProps>) {
  const isBlacklist = restrictionType === "Blacklist";
  const isFieldDisabled = disabled || isBlacklist;
  const fieldError =
    applicableError ?? restrictionForm.formState.errors.restrictionApplicable?.message;

  return (
    <Controller
      name="restrictionApplicable"
      control={restrictionForm.control}
      render={({ field }) => {
        const selectedValues = Array.isArray(field.value) ? field.value : [];
        const selectedOptions = selectedValues.map((value) => {
          const option = options.find((item) => item.value === value);
          return option ?? { label: value, value };
        });

        return (
          <div className="flex flex-col">
            <label className="input-label dropdown-label font-medium text-black">
              Restriction Applicable For <span className="text-red-500"> *</span>
            </label>
            <div className="mt-[3px] w-full">
              <Select<ApplicableOption, true>
                isMulti
                isSearchable={false}
                isDisabled={isFieldDisabled}
                placeholder="Select one or more"
                options={options}
                value={selectedOptions}
                onChange={(next) => field.onChange(next?.map((item) => item.value) ?? [])}
                onBlur={field.onBlur}
                components={{
                  Option: ApplicableCheckboxOption,
                  IndicatorSeparator: () => null,
                }}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                menuPlacement="bottom"
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                menuPosition="fixed"
                className={`w-full rounded-md text-[12px] ${
                  fieldError ? "border-error border" : ""
                }`}
                classNamePrefix="restriction-applicable"
                styles={applicableSelectStyles}
              />
            </div>
            {fieldError ? (
              <p className="input-text-error text-error text-left text-[10px]">{fieldError}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
}

// --- from components/RestrictionMultiValueField.tsx ---

type MultiValueOption = { label: string; value: string };

type RestrictionMultiValueFieldProps = {
  control: Control<RestrictionFormValues>;
  name: "policyNumbers" | "ccnNumbers";
  label: string;
  placeholder?: string;
  errors?: FieldErrors<RestrictionFormValues>;
  disabled?: boolean;
};

const multiValueSelectStyles = {
  control: (base: Record<string, unknown>, state: { isDisabled?: boolean; isFocused?: boolean }) => ({
    ...base,
    minHeight: 32,
    height: 32,
    fontSize: 12,
    opacity: state.isDisabled ? 0.6 : 1,
    backgroundColor: state.isDisabled ? "#e9eef5" : (base.backgroundColor as string | undefined),
    borderColor: resolveSelectControlBorderColor(
      state.isDisabled,
      state.isFocused,
      base.borderColor,
    ),
    borderRadius: 4,
    padding: "0.08rem",
    boxShadow: state.isFocused
      ? "0 0 0 1px rgba(0,0,0,0.04)"
      : (base.boxShadow as string | undefined),
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 28,
    height: 28,
    padding: "0 6px",
  }),
  indicatorsContainer: (base: Record<string, unknown>) => ({
    ...base,
    height: 28,
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    fontSize: 11,
    color: "#9ca3af",
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    fontSize: 12,
    margin: 0,
    padding: 0,
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 99999,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
  }),
  menuPortal: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 99999,
  }),
} as StylesConfig<MultiValueOption, true>;

function toSelectedOptions(values: string[]): MultiValueOption[] {
  return values.map((value) => ({ label: value, value }));
}

export function RestrictionMultiValueField({
  control,
  name,
  label,
  placeholder = "Type and press Enter",
  errors,
  disabled = false,
}: Readonly<RestrictionMultiValueFieldProps>) {
  const fieldError = errors?.[name]?.message;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedValues = Array.isArray(field.value) ? field.value : [];
        const selectedOptions = toSelectedOptions(selectedValues);

        return (
          <div className="flex flex-col">
            <label className="input-label dropdown-label font-medium text-black">
              {label} <span className="text-red-500"> *</span>
            </label>
            <div className="mt-[3px] h-auto w-full">
              <CreatableSelect<MultiValueOption, true>
                isMulti
                isDisabled={disabled}
                placeholder={placeholder}
                value={selectedOptions}
                options={selectedOptions}
                onChange={(next) => field.onChange(next?.map((item) => item.value.trim()).filter(Boolean) ?? [])}
                onBlur={field.onBlur}
                formatCreateLabel={(inputValue) => `Add "${inputValue.trim()}"`}
                menuPlacement="bottom"
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                menuPosition="fixed"
                className={`w-full text-sm select-form-containers rounded-md text-[12px] ${
                  fieldError ? "border-error border" : ""
                }`}
                classNamePrefix="select-form"
                styles={multiValueSelectStyles}
              />
            </div>
            {fieldError ? (
              <p className="input-text-error text-error text-left text-[10px]">{fieldError}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
}

type RestrictionPolicyNumberFieldProps = {
  control: Control<RestrictionFormValues>;
  insurerId: string;
  label?: string;
  placeholder?: string;
  errors?: FieldErrors<RestrictionFormValues>;
  disabled?: boolean;
};

export function RestrictionPolicyNumberField({
  control,
  insurerId,
  label = "Policy Number",
  placeholder = "Type policy number and press Enter",
  errors,
  disabled = false,
}: Readonly<RestrictionPolicyNumberFieldProps>) {
  const dispatch = useAppDispatch();
  const [validating, setValidating] = useState(false);
  const [localError, setLocalError] = useState("");
  const [policyLabels, setPolicyLabels] = useState<Record<string, string>>({});
  const fieldError = errors?.policyNumbers?.message;
  const displayError = localError || fieldError;

  return (
    <Controller
      name="policyNumbers"
      control={control}
      render={({ field }) => {
        const selectedIds = Array.isArray(field.value) ? field.value : [];
        const selectedOptions = selectedIds.map((policyId) => ({
          value: policyId,
          label: policyLabels[policyId] ?? policyId,
        }));

        const handleCreateOption = async (inputValue: string) => {
          const policyNo = inputValue.trim();
          if (!policyNo || validating) return;

          if (!insurerId.trim()) {
            setLocalError("Insurance company is required.");
            return;
          }

          const duplicatePolicyNo = selectedOptions.some(
            (option) => option.label.trim().toLowerCase() === policyNo.toLowerCase(),
          );
          if (duplicatePolicyNo) {
            setLocalError("Policy number is already added.");
            return;
          }

          setValidating(true);
          setLocalError("");

          try {
            const result = await dispatch(
              verifyRestrictionPolicy({ insurerId, policyNo }),
            ).unwrap();

            if (selectedIds.includes(result.policyId)) {
              setLocalError("Policy is already added.");
              return;
            }

            setPolicyLabels((prev) => ({
              ...prev,
              [result.policyId]: result.policyNo,
            }));
            field.onChange([...selectedIds, result.policyId]);
          } catch (err) {
            const message = typeof err === "string" ? err : "";
            if (message) setLocalError(message);
          } finally {
            setValidating(false);
          }
        };

        return (
          <div className="flex flex-col">
            <label className="input-label dropdown-label font-medium text-black">
              {label} <span className="text-red-500"> *</span>
            </label>
            <div className="mt-[3px] h-auto w-full">
              <CreatableSelect<MultiValueOption, true>
                isMulti
                isDisabled={disabled || validating}
                placeholder={validating ? "Verifying policy..." : placeholder}
                value={selectedOptions}
                options={selectedOptions}
                onChange={(next) => {
                  syncPolicySelectChange(next, field.onChange, setPolicyLabels, setLocalError);
                }}
                onCreateOption={(inputValue) => {
                  handleCreateOption(inputValue);
                }}
                onBlur={field.onBlur}
                formatCreateLabel={(inputValue) => `Verify "${inputValue.trim()}"`}
                menuPlacement="bottom"
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                menuPosition="fixed"
                className={`w-full text-sm select-form-containers rounded-md text-[12px] ${
                  displayError ? "border-error border" : ""
                }`}
                classNamePrefix="select-form"
                styles={multiValueSelectStyles}
              />
            </div>
            {displayError ? (
              <p className="input-text-error text-error text-left text-[10px]">{displayError}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
}

// --- from components/RestrictionSupportingDocumentField.tsx ---

type RestrictionSupportingDocumentFieldProps = {
  providerId?: string;
  restrictionDetails: RestrictionDetailsState;
  setRestrictionDetails: React.Dispatch<React.SetStateAction<RestrictionDetailsState>>;
  disabled?: boolean;
  isRequired?: boolean;
  error?: string;
  onErrorClear?: () => void;
};

type FetchedSupportingDocument = {
  fileName: string;
  presignedUrl: string;
};

type SupportingDocumentSource = {
  supportingDocument: File | null;
  supportingFileMetadataId: string;
  supportingDocumentName: string;
};

function resolveDisplayName(
  details: SupportingDocumentSource,
  fetchedDocument: FetchedSupportingDocument | null,
  loadingDocument: boolean,
): string {
  if (details.supportingDocument?.name) return details.supportingDocument.name;
  if (details.supportingDocumentName.trim()) return details.supportingDocumentName.trim();
  if (fetchedDocument?.fileName) return fetchedDocument.fileName;
  if (loadingDocument && details.supportingFileMetadataId.trim()) {
    return "Loading document...";
  }
  return "";
}

function clearStaleSupportingDocumentMetadata<T extends SupportingDocumentSource>(
  details: T,
): T {
  return {
    ...details,
    supportingDocument: null,
    supportingFileMetadataId: "",
    supportingDocumentName: "",
    inwardNo: "",
  };
}

function isPresignDocumentMissingMessage(message: string | undefined): boolean {
  if (!message?.trim()) return false;
  const normalized = message.trim().toLowerCase();
  return (
    normalized.includes("no files found") ||
    normalized.includes("not found") ||
    normalized.includes("no file found")
  );
}

export function RestrictionSupportingDocumentField({
  providerId,
  restrictionDetails,
  setRestrictionDetails,
  disabled = false,
  isRequired = true,
  error: externalError = "",
  onErrorClear,
}: Readonly<RestrictionSupportingDocumentFieldProps>) {
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [error, setError] = useState("");
  const [fetchedDocument, setFetchedDocument] = useState<FetchedSupportingDocument | null>(null);

  const fileMetadataId = restrictionDetails.supportingFileMetadataId.trim();
  const hasLocalFile = Boolean(restrictionDetails.supportingDocument);

  useEffect(() => {
    if (!fileMetadataId || hasLocalFile) {
      setFetchedDocument(null);
      setLoadingDocument(false);
      return;
    }

    let cancelled = false;
    setLoadingDocument(true);
    setError("");

    fetchRestrictionSupportingDocumentPresign(fileMetadataId).then((result) => {
      if (cancelled) return;

      if (!result.ok) {
        setFetchedDocument(null);
        if (result.message && !isPresignDocumentMissingMessage(result.message)) {
          setError(result.message);
        } else if (!disabled) {
          setRestrictionDetails((prev) => clearStaleSupportingDocumentMetadata(prev));
        }
        setLoadingDocument(false);
        return;
      }

      setFetchedDocument({
        fileName: result.fileName,
        presignedUrl: result.presignedUrl,
      });
      setLoadingDocument(false);
    });

    return () => {
      cancelled = true;
    };
  }, [fileMetadataId, hasLocalFile, disabled, setRestrictionDetails]);

  const displayName = resolveDisplayName(restrictionDetails, fetchedDocument, loadingDocument);
  const viewUrl = fetchedDocument?.presignedUrl ?? "";

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return;

    if (!isAllowedSupportingDocument(file)) {
      setError(RESTRICTION_DOCUMENT_INVALID_MESSAGE);
      return;
    }

    const resolvedProviderId = providerId?.trim();
    if (!resolvedProviderId) {
      setError("Provider id is required to upload a document.");
      return;
    }

    setError("");
    setUploading(true);
    setFetchedDocument(null);
    onErrorClear?.();
    setRestrictionDetails((prev) => ({
      ...prev,
      supportingDocument: file,
      supportingFileMetadataId: "",
      supportingDocumentName: "",
      inwardNo: "",
    }));

    try {
      const result = await uploadRestrictionSupportingDocument(file, resolvedProviderId);
      if (!result.ok) {
        setError(result.message ?? "");
        showErrorMessage({ error: result.message });
        setRestrictionDetails((prev) => ({
          ...prev,
          supportingDocument: null,
          supportingFileMetadataId: "",
          supportingDocumentName: "",
          inwardNo: "",
        }));
        return;
      }

      setRestrictionDetails((prev) => ({
        ...prev,
        supportingDocument: file,
        supportingFileMetadataId: result.fileMetadataId,
        supportingDocumentName: file.name,
        inwardNo: result.inwardNo?.trim() ?? "",
      }));
      onErrorClear?.();
    } finally {
      setUploading(false);
    }
  };

  const clearSupportingDocument = () => {
    setFetchedDocument(null);
    setRestrictionDetails((prev) => ({
      ...prev,
      supportingDocument: null,
      supportingFileMetadataId: "",
      supportingDocumentName: "",
      inwardNo: "",
    }));
  };

  const handleClear = async () => {
    if (disabled || uploading || clearing) return;

    setError("");
    setClearing(true);
    try {
      const metadataId = restrictionDetails.supportingFileMetadataId.trim();
      if (metadataId) {
        const result = await deleteRestrictionSupportingDocumentFile(metadataId);
        if (!result.ok) {
          showErrorMessage({ error: result.message ?? "Failed to delete document." });
          return;
        }
      }
      clearSupportingDocument();
    } finally {
      setClearing(false);
    }
  };

  return (
    <ChooseFileField
      label="Supporting Document"
      accept={RESTRICTION_DOCUMENT_ACCEPT}
      disabled={disabled}
      uploading={uploading}
      clearing={clearing}
      displayName={displayName}
      viewUrl={viewUrl}
      isRequired={isRequired}
      error={externalError || error}
      onChange={(event) => {
        handleFileChange(event);
      }}
      onClear={() => {
        handleClear();
      }}
    />
  );
}

// --- from components/SupportingDocumentField.tsx ---

type SupportingDocumentFieldProps = {
  providerId?: string;
  icMappingForm: Pick<
    IcMappingFormState,
    "supportingDocument" | "supportingFileMetadataId" | "supportingDocumentName" | "inwardNo"
  >;
  setIcMappingForm: React.Dispatch<React.SetStateAction<IcMappingFormState>>;
  disabled?: boolean;
  isRequired?: boolean;
};

export function SupportingDocumentField({
  providerId,
  icMappingForm,
  setIcMappingForm,
  disabled = false,
  isRequired = true,
}: Readonly<SupportingDocumentFieldProps>) {
  const { id: routeProviderId } = useParams<{ id: string }>();
  const resolvedProviderId = providerId?.trim() || routeProviderId?.trim() || "";

  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [error, setError] = useState("");
  const [fetchedDocument, setFetchedDocument] = useState<FetchedSupportingDocument | null>(null);

  const fileMetadataId = icMappingForm.supportingFileMetadataId.trim();
  const hasLocalFile = Boolean(icMappingForm.supportingDocument);

  useEffect(() => {
    if (!fileMetadataId || hasLocalFile) {
      setFetchedDocument(null);
      setLoadingDocument(false);
      return;
    }

    let cancelled = false;
    setLoadingDocument(true);
    setError("");

    fetchRestrictionSupportingDocumentPresign(fileMetadataId).then((result) => {
      if (cancelled) return;

      if (!result.ok) {
        setFetchedDocument(null);
        if (result.message && !isPresignDocumentMissingMessage(result.message)) {
          setError(result.message);
        } else if (!disabled) {
          setIcMappingForm((prev) => clearStaleSupportingDocumentMetadata(prev));
        }
        setLoadingDocument(false);
        return;
      }

      setFetchedDocument({
        fileName: result.fileName,
        presignedUrl: result.presignedUrl,
      });
      setLoadingDocument(false);
    });

    return () => {
      cancelled = true;
    };
  }, [fileMetadataId, hasLocalFile, disabled, setIcMappingForm]);

  const displayName = resolveDisplayName(icMappingForm, fetchedDocument, loadingDocument);
  const viewUrl = fetchedDocument?.presignedUrl ?? "";

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return;

    if (!isAllowedSupportingDocument(file)) {
      setError(SUPPORTING_DOCUMENT_INVALID_MESSAGE);
      return;
    }

    const resolvedProviderIdForUpload = resolvedProviderId;
    if (!resolvedProviderIdForUpload) {
      setError("Provider id is required to upload a document.");
      return;
    }

    setError("");
    setUploading(true);
    setFetchedDocument(null);
    setIcMappingForm((prev) => ({
      ...prev,
      supportingDocument: file,
      supportingFileMetadataId: "",
      supportingDocumentName: "",
      inwardNo: "",
    }));

    try {
      const result = await uploadRestrictionSupportingDocument(
        file,
        resolvedProviderIdForUpload,
      );
      if (!result.ok) {
        setError(result.message ?? "");
        showErrorMessage({ error: result.message });
        setIcMappingForm((prev) => ({
          ...prev,
          supportingDocument: null,
          supportingFileMetadataId: "",
          supportingDocumentName: "",
          inwardNo: "",
        }));
        return;
      }

      setIcMappingForm((prev) => ({
        ...prev,
        supportingDocument: file,
        supportingFileMetadataId: result.fileMetadataId,
        supportingDocumentName: file.name,
        inwardNo: result.inwardNo?.trim() ?? "",
      }));
    } finally {
      setUploading(false);
    }
  };

  const clearSupportingDocument = () => {
    setFetchedDocument(null);
    setIcMappingForm((prev) => ({
      ...prev,
      supportingDocument: null,
      supportingFileMetadataId: "",
      supportingDocumentName: "",
      inwardNo: "",
    }));
  };

  const handleClear = async () => {
    if (disabled || uploading || clearing) return;

    setError("");
    setClearing(true);
    try {
      const metadataId = icMappingForm.supportingFileMetadataId.trim();
      if (metadataId) {
        const result = await deleteRestrictionSupportingDocumentFile(metadataId);
        if (!result.ok) {
          showErrorMessage({ error: result.message ?? "Failed to delete document." });
          return;
        }
      }
      clearSupportingDocument();
    } finally {
      setClearing(false);
    }
  };

  return (
    <ChooseFileField
      label="Supporting Document"
      accept={SUPPORTING_DOCUMENT_ACCEPT}
      disabled={disabled}
      uploading={uploading}
      clearing={clearing}
      displayName={displayName}
      viewUrl={viewUrl}
      isRequired={isRequired}
      error={error}
      onChange={(event) => {
        handleFileChange(event);
      }}
      onClear={() => {
        handleClear();
      }}
    />
  );
}

// --- from components/UnmapSupportingDocumentField.tsx ---

type UnmapSupportingDocumentFieldProps = {
  providerId?: string;
  fileName?: string;
  disabled?: boolean;
  isRequired?: boolean;
  error?: string;
  onErrorClear?: () => void;
  onFileMetadataIdChange: (
    fileMetadataId: string,
    fileName: string,
    inwardNo?: string,
  ) => void;
  onClear: () => void;
};

export function UnmapSupportingDocumentField({
  providerId,
  fileName,
  disabled = false,
  isRequired = true,
  error: externalError = "",
  onErrorClear,
  onFileMetadataIdChange,
  onClear,
}: Readonly<UnmapSupportingDocumentFieldProps>) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return;

    if (!isAllowedSupportingDocument(file)) {
      setError(SUPPORTING_DOCUMENT_INVALID_MESSAGE);
      onClear();
      return;
    }

    const resolvedProviderId = providerId?.trim();
    if (!resolvedProviderId) {
      setError("Provider id is required to upload a document.");
      return;
    }

    setError("");
    onErrorClear?.();
    setUploading(true);
    onClear();

    try {
      const result = await uploadRestrictionSupportingDocument(file, resolvedProviderId);
      if (!result.ok) {
        setError(result.message ?? "");
        if (result.message) showErrorMessage({ error: result.message });
        return;
      }

      onFileMetadataIdChange(result.fileMetadataId, file.name, result.inwardNo);
      onErrorClear?.();
    } finally {
      setUploading(false);
    }
  };

  return (
    <ChooseFileField
      label="Supporting Document"
      accept={SUPPORTING_DOCUMENT_ACCEPT}
      disabled={disabled}
      uploading={uploading}
      displayName={fileName?.trim() || null}
      isRequired={isRequired}
      error={externalError || error || undefined}
      onChange={(event) => {
        handleFileChange(event);
      }}
      onClear={
        fileName?.trim()
          ? () => {
              onClear();
            }
          : undefined
      }
    />
  );
}
