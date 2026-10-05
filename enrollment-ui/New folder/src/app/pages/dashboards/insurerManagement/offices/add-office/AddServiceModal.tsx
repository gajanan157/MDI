import * as yup from "yup";

export const servicesList = [
  { name: "mediclaim", label: "MEDICLAIM" },
  { name: "uhis", label: "UHIS" },
  { name: "bank", label: "Bank Policy" },
  { name: "online", label: "Online Policy" },
];
export const buildServiceTypesPayload = (servicesData: any[]) => {
  const serviceKeys = ["mediclaim", "uhis", "bank", "online"];

  const payload: Record<string, any> = {};

  serviceKeys.forEach(key => {
    const service = servicesData.find(s => s.serviceName === key);

    if (service && service.enabled) {
      payload[key] = {
        enabled: true,
        ...(service.startDate && { startDate: service.startDate }),
        ...(service.endDate && { endDate: service.endDate }),
        ...(service.servicingAllocationFor && { servicingAllocationFor: service.servicingAllocationFor }),
        ...(service.allocationId && { allocationId: service.allocationId }) // only if exists
      };
    } else {
      payload[key] = { enabled: false };
    }
  });

  return payload;
};



export const servicingAllocationFor = [
  { label: "Corporate", value: "corporate" },
  { label: "Retail", value: "retail" },
  { label: "Both (Corporate, Retail)", value: "both" },
  { label: "Government", value: "government" },
];

const serviceSchema = yup.object({
  enabled: yup.boolean(),

  startDate: yup.string().when("enabled", ([enabled], s) =>
    enabled === true ? s.required("Start Date is required") : s,
  ),

  endDate: yup
    .string()
    .when(["enabled", "startDate"], ([enabled, startDate], s) =>
      enabled && startDate
        ? s
            .required("End Date is required")
            .test(
              "end-after-start",
              "End Date cannot be before Start Date",
              function (endDate) {
                const { startDate } = this.parent;
                if (!startDate || !endDate) return true;

                return new Date(endDate) >= new Date(startDate);
              }
            )
        : s,
    ),

  servicingAllocationFor: yup.string().when("enabled", ([enabled], s) =>
    enabled === true ? s.required("Servicing Allocation is required") : s,
  ),
});


export const schema = yup.object({
  serviceTypes: yup
    .object(
      servicesList.reduce((acc, service) => {
        acc[service.name] = serviceSchema;
        return acc;
      }, {} as Record<string, any>)
    )
    .test(
      "at-least-one",
      "Please select at least one service",
      (value) =>
        !!value && Object.values(value).some((s: any) => s.enabled)
    ),
});


import DropdownSelect from "@/components/shared/form/DropdownSelect";
import FormLayout from "@/components/shared/form/FormLayout";
import { Button, Input } from "@/components/ui";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  defaultValues: any,
}

const mapEditDataToForm = (editData: any) => {
  return {
    serviceTypes: servicesList?.reduce((acc, s) => {
      if (s?.name === editData?.serviceName) {
        acc[s?.name] = {
          enabled: true,
          startDate: editData?.startDate || "",
          endDate: editData?.endDate || "",
          servicingAllocationFor: editData?.servicingAllocationFor || "",
          allocationId: editData?.allocationId,
        };
      } else {
        acc[s?.name] = {
          enabled: false,
          startDate: "",
          endDate: "",
          servicingAllocationFor: "",
        };
      }
      return acc;
    }, {} as Record<string, any>),
  };
};

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultValues
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      serviceTypes: servicesList.reduce((acc, s) => {
        acc[s.name] = {
          enabled: false,
          startDate: "",
          endDate: "",
          servicingAllocationFor: "",
        };
        return acc;
      }, {} as Record<string, any>),
    },
  });

  const watchServices = watch("serviceTypes");
  React.useEffect(() => {
    if (isOpen && defaultValues) {
      const formValues = mapEditDataToForm(defaultValues);
      reset(formValues);
    }
  }, [isOpen, defaultValues, reset]);

  const handleFormSubmit = (data: any) => {
    const payload = Object.entries(data.serviceTypes).reduce(
      (acc, [key, val]: any) => {
        if (val.enabled) {
          acc[key] = {
            enabled: true,
            startDate: val.startDate,
            endDate: val.endDate,
            servicingAllocationFor: val.servicingAllocationFor,
          };
        } else {
          acc[key] = { enabled: false };
        }
        return acc;
      },
      {} as Record<string, any>
    );

    onSubmit(payload);
    onClose();
  };
  const { t } = useTranslation()

  if (!isOpen) return null;

  return (
    <FormLayout
      onSubmit={handleSubmit(handleFormSubmit)}
      FormClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-lg p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-700">{t("contactPerson.addButton")}</h4>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {servicesList.map((service) => {
          const err = errors.serviceTypes?.[service.name] as any;
          const err2 = {
            message: err?.servicingAllocationFor?.message
          }
          return (
            <div
              key={service.name}
              className="border rounded-lg p-4 mb-4 bg-muted/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  {...register(`serviceTypes.${service.name}.enabled`)}
                />
                <span className="font-semibold">{service.label}</span>
              </div>

              {watchServices?.[service.name]?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t("servicesForm.fields.startDate.label")}
                    type="date"
                    {...register(`serviceTypes.${service.name}.startDate`)}
                    error={err?.startDate?.message}
                    isRequired
                  />

                  <Input
                    label={t("servicesForm.fields.endDate.label")}
                    type="date"
                    {...register(`serviceTypes.${service.name}.endDate`)}
                    error={err?.endDate?.message}
                    isRequired
                  />
                  <DropdownSelect
                    control={control}
                    label={t("servicesForm.fields.servicingAllocation.label")}
                    defaultValue={t("servicesForm.fields.servicingAllocation.defaultValue")}
                    options={servicingAllocationFor}
                    name={`serviceTypes.${service.name}.servicingAllocationFor`}
                    name_key={`serviceTypes.${service.name}.servicingAllocationFor`}
                    isRequired
                    errors={err2}
                    className="h-[42px]"
                  />
                </div>
              )}
            </div>
          );
        })}
        {errors.serviceTypes && "message" in errors.serviceTypes && (
          <p className="text-red-500 text-sm text-center mb-2">
            {(errors.serviceTypes as any).message}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border rounded cursor-pointer"
          >
            {t("branchForm.buttons.cancel")}

          </button>
          <Button type="submit" disabled={isSubmitting}
            color="primary"
            className="bg-primary hover:bg-primary/90  cursor-pointer px-8"

          >
            {isSubmitting ? `${t("branchForm.buttons.save")}...` : t("branchForm.buttons.save")}
          </Button>
        </div>
      </div>
    </FormLayout>
  );
};

export default AddServiceModal;

