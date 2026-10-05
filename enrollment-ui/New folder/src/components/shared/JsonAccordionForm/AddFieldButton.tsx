import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import AddFieldModal from "./AddFieldModal";
import { makeExtensible } from "@/app/pages/dashboards/mbmmanagement/dashboard/utils/dynamicDataHelpers";

export interface AddFieldButtonProps {
  fieldPath: string; // Path where field will be added (e.g., "policy_metadata", "exclusions.permanent_exclusions[0]")
  sectionTitle?: string;
  onAddField: (fieldPath: string, fieldName: string, fieldValue: any, metadata?: any) => void;
  existingFields?: string[];
  className?: string;
  buttonLabel?: string;
  variant?: "default" | "outlined" | "icon";
  disabled?: boolean;
}

export default function AddFieldButton(props: Readonly<AddFieldButtonProps>) {
  const {
    fieldPath,
    sectionTitle,
    onAddField,
    existingFields = [],
    className = "",
    buttonLabel = "Add Field",
    variant = "outlined",
    disabled = false,
  } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddField = (fieldName: string, fieldValue: any, metadata?: any) => {
    // Make the field value extensible if it's an object
    let finalValue = fieldValue;
    if (typeof fieldValue === "object" && fieldValue !== null && !Array.isArray(fieldValue)) {
      finalValue = makeExtensible(fieldValue);
    }

    // Add metadata if provided
    // Exclude: references, limits, notes, _field_metadata, _section_metadata
    if (metadata) {
      if (typeof finalValue === "object" && finalValue !== null) {
        finalValue = {
          ...finalValue,
          sources: metadata.sources || [],
          conditions: metadata.conditions || [],
          // Explicitly exclude: references, limits, notes, _field_metadata, _section_metadata
        };
      }
    }

    onAddField(fieldPath, fieldName, finalValue, metadata);
  };

  const buttonContent = variant === "icon" ? (
    <PlusIcon className="w-5 h-5" />
  ) : (
    <>
      <PlusIcon className="w-4 h-4" />
      <span>{buttonLabel}</span>
    </>
  );

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsModalOpen(true)}
        variant={variant === "outlined" ? "outlined" : "filled"}
        className={`flex items-center gap-2 ${variant === "outlined" ? "border-dashed" : ""} ${className}`}
        disabled={disabled}
      >
        {buttonContent}
      </Button>

      <AddFieldModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddField={handleAddField}
        fieldPath={fieldPath}
        sectionTitle={sectionTitle}
        existingFields={existingFields}
      />
    </>
  );
}

AddFieldButton.displayName = "AddFieldButton";

