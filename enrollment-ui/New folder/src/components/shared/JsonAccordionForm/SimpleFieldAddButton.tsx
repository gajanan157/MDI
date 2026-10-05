import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import { PlusIcon } from "@heroicons/react/20/solid";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { useForm } from "react-hook-form";

export type FieldType = "string" | "object" | "arrayOfObjects" | "listingArray";

export interface SimpleFieldAddButtonProps {
  fieldKey: string;
  onAddField: (key: string, fieldName: string, fieldValue: any) => void;
}

const FIELD_TYPE_OPTIONS = [
  { label: "String", value: "string" },
  { label: "Object", value: "object" },
  { label: "Array of Objects", value: "arrayOfObjects" },
  { label: "Listing Array", value: "listingArray" },
];

const getDefaultValueForType = (type: FieldType): any => {
  switch (type) {
    case "string":
      return "";
    case "object":
      return {};
    case "arrayOfObjects":
      return [{}];
    case "listingArray":
      return [];
    default:
      return "";
  }
};

export default function SimpleFieldAddButton({
  fieldKey,
  onAddField,
}: SimpleFieldAddButtonProps) {
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const { control, watch, setValue } = useForm({
    defaultValues: {
      fieldType: "string" as FieldType,
    },
  });

  const selectedFieldType = watch("fieldType") as FieldType;

  return (
    <div className="mt-2">
      {!showAddField ? (
        <Button
          type="button"
          onClick={() => setShowAddField(true)}
          variant="outlined"
          className="flex items-center gap-2 border-dashed"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Field</span>
        </Button>
      ) : (
        <div className="dark:border-dark-600 dark:bg-dark-800 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="space-y-1">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Field Name
              </label>
              <Input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Enter field name"
                className="w-full text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFieldName.trim()) {
                    const defaultValue =
                      getDefaultValueForType(selectedFieldType);
                    onAddField(fieldKey, newFieldName.trim(), defaultValue);
                    setNewFieldName("");
                    setValue("fieldType", "string");
                    setShowAddField(false);
                  } else if (e.key === "Escape") {
                    setShowAddField(false);
                    setNewFieldName("");
                    setValue("fieldType", "string");
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Field Type
              </label>
              <DropdownSelect
                control={control}
                name="fieldType"
                options={FIELD_TYPE_OPTIONS}
                className="h-[38px] text-xs"
                formClassName="mb-2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  if (newFieldName.trim()) {
                    const defaultValue =
                      getDefaultValueForType(selectedFieldType);
                    onAddField(fieldKey, newFieldName.trim(), defaultValue);
                    setNewFieldName("");
                    setValue("fieldType", "string");
                    setShowAddField(false);
                  }
                }}
                color="primary"
                className="px-3 py-1 text-sm"
                disabled={!newFieldName.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowAddField(false);
                  setNewFieldName("");
                  setValue("fieldType", "string");
                }}
                variant="outlined"
                className="rounded-md border-gray-400 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
