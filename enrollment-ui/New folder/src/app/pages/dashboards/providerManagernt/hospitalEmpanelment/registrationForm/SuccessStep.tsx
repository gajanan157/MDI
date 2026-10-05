import { CheckIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui";
import { useFormContext } from "react-hook-form";
import type { HospitalRegistrationFormValues } from "./schema";

const detailRows: {
  key: keyof HospitalRegistrationFormValues | "location";
  label: string;
  getValue: (data: HospitalRegistrationFormValues) => string;
}[] = [
  { key: "hospitalName", label: "Hospital", getValue: (d) => d.hospitalName || "—" },
  {
    key: "location",
    label: "Location",
    getValue: (d) => {
      const addr = d.address;
      if (!addr?.city && !addr?.stateName) return "—";
      return [addr.city, addr.stateName].filter(Boolean).join(", ");
    },
  },
  {
    key: "rohini",
    label: "ROHINI Code",
    getValue: (d) => d.rohini?.rohiniCode?.trim() || "—",
  },
  {
    key: "contact",
    label: "Contact Person",
    getValue: (d) => d.contact?.contactPerson?.trim() || "—",
  },
  {
    key: "contact",
    label: "Email",
    getValue: (d) => d.contact?.email?.trim() || "—",
  },
  {
    key: "contact",
    label: "Contact Number",
    getValue: (d) => d.contact?.contactNumber?.trim() || "—",
  },
];

interface SuccessStepProps {
  /** When &gt; 1, show "X providers registered" instead of single hospital details */
  submittedCount?: number;
}

export function SuccessStep({ submittedCount = 1 }: Readonly<SuccessStepProps>) {
  const { watch } = useFormContext<HospitalRegistrationFormValues>();
  const formValues = watch();
  const navigate = useNavigate();

  return (
    <div className="mx-auto rounded-xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-lg ring-4 ring-green-100 animate-pulse">
          <CheckIcon className="h-8 w-8" />
        </div>
        <h2 className="mb-1 text-xl font-bold text-gray-900">
          Registration Complete!
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          {submittedCount > 1
            ? `${submittedCount} providers have been successfully registered.`
            : "Your hospital has been successfully registered"}
        </p>

        {submittedCount <= 1 && (
          <>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-5 py-4 shadow-sm">
              <h3 className="mb-3 text-center text-sm font-semibold text-gray-900">
                Registration Details
              </h3>
              <dl className="space-y-2.5">
                {detailRows.map(({ label, getValue }) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                  >
                    <dt className="text-xs text-gray-600">{label}</dt>
                    <dd
                      className="max-w-[60%] truncate text-right text-xs font-medium text-gray-900"
                      title={getValue(formValues)}
                    >
                      {getValue(formValues)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-5 flex w-full justify-center">
              <Button
                type="button"
                color="primary"
                className="px-6"
                onClick={() => navigate("/provider-masters/empanel")}
              >
                Back to main form
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
