import { Input } from "@/components/ui";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";
import type { HospitalRegistrationFormValues } from "./schema";

interface ContactStepProps {
  showSectionHeader?: boolean;
  /** Single-column layout for side-by-side grid (ROHINI + Contact) */
  compact?: boolean;
}

export function ContactStep({ showSectionHeader = true, compact = false }: Readonly<ContactStepProps>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<HospitalRegistrationFormValues>();

  const contactErrors = errors?.contact;

  return (
    <div className="space-y-3">
      {showSectionHeader && (
        <div className="mb-3 flex flex-col items-center text-center">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <UserCircleIcon className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Contact Details</h2>
          <p className="text-[12px] text-gray-600">
            Provide contact person and communication details
          </p>
        </div>
      )}
      <div className={`grid gap-2.5 ${compact ? "grid-cols-1" : "grid-cols-1 gap-4 md:grid-cols-3"}`}>
        <Input
          label="Contact Person"
          {...register("contact.contactPerson")}
          error={contactErrors?.contactPerson?.message}
          isRequired
          placeholder="Enter contact person name"
        />
        <Input
          label="Email"
          type="email"
          {...register("contact.email")}
          error={contactErrors?.email?.message}
          isRequired
          placeholder="Enter email address"
        />
        <Input
          label="Contact Number"
          type="tel"
          {...register("contact.contactNumber", {
            setValueAs: (v) => (typeof v === "string" ? v.replace(/\D/g, "") : v),
          })}
          inputMode="numeric"
          maxLength={10}
          error={contactErrors?.contactNumber?.message}
          isRequired
          placeholder="Enter 10-digit contact number (digits only)"
        />
      </div>
    </div>
  );
}
