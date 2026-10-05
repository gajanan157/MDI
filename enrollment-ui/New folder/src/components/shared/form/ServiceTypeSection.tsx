// components/shared/form/ServiceTypeSection.tsx
import { Input } from "@/components/ui";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  BriefcaseIcon,
  CalendarIcon,
  // PencilIcon,
} from "@heroicons/react/24/outline";
import React, { Dispatch, useEffect, useRef } from "react";
import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormSetError,
  UseFormClearErrors,
  useWatch,
} from "react-hook-form";

interface ServiceTypeSectionProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
  errors: FieldErrors<any>;
  isEditing: boolean;
  isAssign: boolean;
  finalServiceTypesData: any[];
  assignedData?: any[];
  setAssignObj: Dispatch<any>;
  open: Dispatch<any>;
}

export const SERVICE_TYPES = [
  { name: "mediclaim", label: "MEDICLAIM" },
  { name: "uhis", label: "UHIS" },
  { name: "bank", label: "Bank Policy" },
  { name: "online", label: "Online Policy" },
  // { name: "corporate", label: "Corporate" },
  // { name: "renewal", label: "Renewal" },
];

export const ServiceTypeSection: React.FC<ServiceTypeSectionProps> = ({
  register,
  control,
  setValue,
  setError,
  clearErrors,
  errors,
  isEditing,
  setAssignObj,
  finalServiceTypesData,
  assignedData,
  open,
}) => {
  // watch serviceTypes object; parent should provide defaultValues so this isn't undefined
  const watchedServices = useWatch({ control, name: "serviceTypes" });
  const prevEnabledRef = useRef<Record<string, boolean>>({});
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!watchedServices) return;

    if (!didMountRef.current) {
      // initialize previous states on first real mount
      SERVICE_TYPES.forEach((s) => {
        prevEnabledRef.current[s.name] = Boolean(
          watchedServices?.[s.name]?.enabled,
        );
      });
      didMountRef.current = true;
      return;
    }

    SERVICE_TYPES.forEach((s) => {
      const prev = Boolean(prevEnabledRef.current[s.name]);
      const current = Boolean(watchedServices?.[s.name]?.enabled);

      // clear dates only when it changed from true -> false
      if (prev && !current) {
        setValue(`serviceTypes.${s.name}.startDate`, "", {
          shouldValidate: false,
          shouldDirty: true,
          shouldTouch: false,
        });
        setValue(`serviceTypes.${s.name}.endDate`, "", {
          shouldValidate: false,
          shouldDirty: true,
          shouldTouch: false,
        });
        // Clear errors when service is disabled
        clearErrors(`serviceTypes.${s.name}.startDate`);
        clearErrors(`serviceTypes.${s.name}.endDate`);
      }

      prevEnabledRef.current[s.name] = current;
    });
  }, [watchedServices, setValue, clearErrors]);

  // Validate date ranges when dates change
  useEffect(() => {
    if (!watchedServices) return;

    SERVICE_TYPES.forEach((service) => {
      const serviceData = watchedServices[service.name];
      if (!serviceData?.enabled) return;

      const startDate = serviceData.startDate;
      const endDate = serviceData.endDate;

      // Only validate if both dates are provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check if dates are valid
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          if (start >= end) {
            // Start date is not before end date
            setError(`serviceTypes.${service.name}.startDate`, {
              type: "manual",
              message: "Start Date must be before End Date",
            });
            setError(`serviceTypes.${service.name}.endDate`, {
              type: "manual",
              message: "End Date must be after Start Date",
            });
          } else {
            // Dates are valid, clear errors
            clearErrors(`serviceTypes.${service.name}.startDate`);
            clearErrors(`serviceTypes.${service.name}.endDate`);
          }
        }
      } else {
        // If one date is missing, clear errors (let yup handle required validation)
        clearErrors(`serviceTypes.${service.name}.startDate`);
        clearErrors(`serviceTypes.${service.name}.endDate`);
      }
    });
  }, [watchedServices, setError, clearErrors]);


  return (
      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle title="Policy Coverage & Services" icon={<BriefcaseIcon className="h-4 w-4" />}/>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4">
          {SERVICE_TYPES.map((service) => {
            const disabled = !isEditing;
            return (
              <label
                key={service.name}
                className={`border-border bg-card group flex items-center gap-2.5 rounded-lg border p-3 transition-all ${
                  disabled
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-muted/30 hover:border-primary/30 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  {...register(`serviceTypes.${service.name}.enabled`)}
                  disabled={disabled}
                  className="border-input text-primary focus:ring-primary h-4 w-4 rounded focus:ring-offset-0"
                />
                <span className="group-hover:text-primary text-sm font-medium transition-colors">
                  {service.label}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-4 space-y-3">
          {finalServiceTypesData?.map((service) => {
            const isEnabled = Boolean(watchedServices?.[service.name]?.enabled);
            if (!isEnabled) return null;

            return (
              <div
                key={service.name}
                className="border-border bg-muted/20 animate-in fade-in slide-in-from-top-2 rounded-lg border p-4 duration-200"
              >
                <div className="mb-3 flex items-center gap-2">
                  <CalendarIcon className="text-primary h-4 w-4" />
                  <span className="text-foreground sub_section_title font-semibold">
                    {service.label} - Service Period
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Start Date"
                    type="date"
                    {...register(`serviceTypes.${service.name}.startDate`)}
                    error={
                      (errors as any).serviceTypes?.[service.name]?.startDate
                        ?.message
                    }
                    disabled={!isEditing}
                  />

                  <Input
                    label="End Date"
                    type="date"
                    {...register(`serviceTypes.${service.name}.endDate`)}
                    error={
                      (errors as any).serviceTypes?.[service.name]?.endDate
                        ?.message
                    }
                    disabled={!isEditing}
                  />
                </div>
           
              </div>
            );
          })}
        </div>
      </div>
  );
};

export default ServiceTypeSection;
