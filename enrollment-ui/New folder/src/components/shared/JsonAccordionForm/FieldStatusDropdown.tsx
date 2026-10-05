// src/components/shared/JsonAccordionForm/FieldStatusDropdown.tsx
import { StatusValue } from "@/hooks/useStatus";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface FieldStatusDropdownProps {
  fieldPath: string;
  status: StatusValue;
  onStatusChange: (fieldPath: string, status: StatusValue) => void;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
  isEditing?: boolean;
}

export default function FieldStatusDropdown({
  fieldPath,
  status,
  onStatusChange,
  userRole: userRoleProp,
  isEditing = false,
}: FieldStatusDropdownProps) {
  // IMPORTANT: All hooks must be called before any conditional returns
  // Use react-hook-form for DropdownSelect (must be called unconditionally)
  const { control, setValue } = useForm({
    defaultValues: {
      fieldStatus: status || "",
    },
  });

  // Sync form value when status prop changes
  useEffect(() => {
    setValue("fieldStatus", status || "");
  }, [status, setValue]);

  // Show for both maker, checker, and super admin roles
  const isMaker = userRoleProp === "maker1" || userRoleProp === "maker2";
  const isChecker =
    userRoleProp === "checker" || userRoleProp === "superadmin";

  // Don't show if neither maker nor checker/superadmin
  if (!isMaker && !isChecker) {
    return null;
  }

  const statusOptions: Array<{ value: string; label: string; color: string }> = [
    { value: "", label: "—", color: "bg-gray-100 text-gray-800" },
    { value: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
    { value: "approve_with_pendency", label: "Approve with Pendency", color: "bg-yellow-100 text-yellow-800" },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
    { value: "reverse_to_maker", label: "Reverse to Maker", color: "bg-blue-100 text-blue-800" },
  ];

  const currentStatus = statusOptions.find((opt) => opt.value === (status || "")) || statusOptions[0];

  // When NOT in edit mode: show read-only badge (for both maker and checker)
  if (!isEditing) {
    // Always show badge, even if status is null (show "—")
    const displayLabel = status ? currentStatus.label : "—";
    const displayColor = status ? currentStatus.color : "bg-gray-100 text-gray-800";
    

    
    return (
      <div className="flex items-center" style={{ minHeight: "24px" }}>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${displayColor} dark:bg-opacity-20`}
          title="Status (read-only)"
          style={{ border: "1px solid #ccc" }}
        >
          {displayLabel}
        </span>
      </div>
    );
  }

  // When IN edit mode: show DropdownSelect (editable) - for checker and super admin
  if (isEditing && isChecker) {
    return (
      <div className="w-40">
        <DropdownSelect
          name="fieldStatus"
          control={control}
          options={statusOptions}
          value={status || ""}
          onChange={(value) => {
            const statusValue = value === "" ? null : (value as StatusValue);
            onStatusChange(fieldPath, statusValue);
          }}
          placeholder="Select Status"
          className="text-xs"
          formClassName="!mt-0"
        />
      </div>
    );
  }

  // Maker in edit mode: still show readonly
  return (
    <div className="flex items-center">
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${currentStatus.color} dark:bg-opacity-20`}
        title="Status (read-only)"
      >
        {status ? currentStatus.label : "—"}
      </span>
    </div>
  );
}

FieldStatusDropdown.displayName = "FieldStatusDropdown";
