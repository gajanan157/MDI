import { Input } from "@/components/ui";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";
import { Controller, useFormContext } from "react-hook-form";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import type { HospitalRegistrationFormValues } from "./schema";

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface RohiniStepProps {
  showSectionHeader?: boolean;
  /** Single-column layout for side-by-side grid (ROHINI + Contact) */
  compact?: boolean;
}

function handleCertificateFileChange(
  file: File | undefined,
  onChange: (value: string) => void,
) {
  if (!file) {
    onChange("");
    return;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return;
  }
  onChange(file.name);
}

function RohiniBasicFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<HospitalRegistrationFormValues>();
  const rohiniErrors = errors?.rohini;

  return (
    <>
      <Input
        label="ROHINI Code"
        {...register("rohini.rohiniCode")}
        error={rohiniErrors?.rohiniCode?.message}
        isRequired
        placeholder="Enter ROHINI code"
      />
      <ProviderDatePicker
        label="Registration Valid Till"
        control={control}
        name="rohini.registrationValidTill"
        error={rohiniErrors?.registrationValidTill?.message}
        isRequired
      />
    </>
  );
}

function RohiniCertificateUpload({ compact = false }: Readonly<{ compact?: boolean }>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<HospitalRegistrationFormValues>();
  const certificateError = errors?.rohini?.rohiniCertificate?.message;

  return (
    <Controller
      control={control}
      name="rohini.rohiniCertificate"
      render={({ field }) => (
        <div>
          <label className="input-label">
            Upload ROHINI Certificate <span className="text-red-600">*</span>
          </label>
          <label
            className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 py-3 transition-colors hover:border-primary-500 hover:bg-gray-50/80 ${compact ? "" : "mt-1.5"}`}
          >
            <CloudArrowUpIcon className="h-5 w-5 text-gray-400" />
            <span className="mt-1 text-xs text-gray-600">Click to upload</span>
            <span className="mt-0.5 text-[11px] text-gray-500">
              PDF, JPG, PNG (Max {MAX_SIZE_MB}MB)
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleCertificateFileChange(e.target.files?.[0], field.onChange)}
            />
          </label>
          {field.value && (
            <p className="mt-1 text-xs text-green-600">Selected: {field.value}</p>
          )}
          {certificateError && (
            <p className="mt-1 text-xs text-red-600">{certificateError}</p>
          )}
        </div>
      )}
    />
  );
}

export function RohiniStep({
  showSectionHeader = true,
  compact = false,
}: Readonly<RohiniStepProps>) {
  return (
    <div className="space-y-3">
      {showSectionHeader && (
        <div className="mb-3 flex flex-col items-center text-center">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <DocumentTextIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">ROHINI Registration</h2>
          <p className="text-[12px] text-gray-600">
            Provide your ROHINI registration details.
          </p>
        </div>
      )}
      <div
        className={`grid items-start gap-2.5 ${compact ? "grid-cols-1" : "grid-cols-1 gap-4 md:grid-cols-3"}`}
      >
        {compact ? (
          <>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <RohiniBasicFields />
            </div>
            <RohiniCertificateUpload compact />
          </>
        ) : (
          <>
            <RohiniBasicFields />
            <RohiniCertificateUpload />
          </>
        )}
      </div>
    </div>
  );
}
