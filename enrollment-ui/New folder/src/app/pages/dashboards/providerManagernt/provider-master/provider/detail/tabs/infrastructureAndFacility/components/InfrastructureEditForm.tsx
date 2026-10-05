import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui";
import type { InfrastructureFormValues } from "../../../schemas";
import type { DynamicInfrastructureFormValues } from "../../../schemas";
import { INFRASTRUCTURE_STANDARD_BED_ROWS } from "../../../utils/sectionMerges/infrastructure/infrastructureConfig";

type InfrastructureEditFormProps = {
  useDynamicForm: boolean;
  staticForm: UseFormReturn<InfrastructureFormValues>;
  dynamicForm: UseFormReturn<DynamicInfrastructureFormValues>;
};

export function InfrastructureEditForm({
  useDynamicForm,
  staticForm,
  dynamicForm,
}: Readonly<InfrastructureEditFormProps>) {
  if (useDynamicForm) {
    const dynamicRoomRows = dynamicForm.watch("roomRows");

    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          label="Total Beds"
          type="number"
          min={0}
          {...dynamicForm.register("totalBeds")}
          className="h-8 text-xs"
        />
        {dynamicRoomRows.map((row, index) => (
          <div key={`${row.bedTypeName}-${index}`}>
            <input type="hidden" {...dynamicForm.register(`roomRows.${index}.bedTypeName`)} />
            <Input
              label={row.bedTypeName?.trim() || "Bed Count"}
              type="number"
              min={0}
              {...dynamicForm.register(`roomRows.${index}.bedCount`)}
              className="h-8 text-xs"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Input
        label="Total Beds"
        type="number"
        min={0}
        {...staticForm.register("totalBeds")}
        className="h-8 text-xs"
      />
      {INFRASTRUCTURE_STANDARD_BED_ROWS.map((row) => (
        <Input
          key={row.formKey}
          label={row.viewLabel}
          type="number"
          min={0}
          {...staticForm.register(row.formKey)}
          className="h-8 text-xs"
        />
      ))}
    </div>
  );
}
