import { Input } from "@/components/ui";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";
import { AddressSection } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import type { HospitalRegistrationFormValues } from "./schema";

interface HospitalDetailsStepProps {
  /** When false, section title is rendered by parent (e.g. single-form layout) */
  showSectionHeader?: boolean;
}

export function HospitalDetailsStep({ showSectionHeader = true }: Readonly<HospitalDetailsStepProps>) {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<HospitalRegistrationFormValues>();

  return (
    <div className={showSectionHeader ? "space-y-3" : "space-y-1.5"}>
      {showSectionHeader && (
        <div className="mb-3 flex flex-col items-center text-center">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Providers Details</h2>
          <p className="text-[12px] text-gray-600">
            Enter your hospital&apos;s basic information
          </p>
        </div>
      )}
      <Input
          label="Provider Name"
          {...register("hospitalName")}
          error={errors.hospitalName?.message}
          isRequired
          placeholder="Enter provider name"
        />

        <AddressSection
          register={register}
          control={control}
          errors={errors}
          watch={watch}
          setValue={setValue}
          isAddressType={false}
          compact={!showSectionHeader}
        />
    </div>
  );
}
