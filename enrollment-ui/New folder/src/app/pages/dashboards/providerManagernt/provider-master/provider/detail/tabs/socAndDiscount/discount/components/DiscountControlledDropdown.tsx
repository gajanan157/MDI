import { useEffect } from "react";
import { useForm } from "react-hook-form";
import DropdownSelect from "@/components/shared/form/DropdownSelect";

type DiscountControlledDropdownProps = {
  label?: string;
  options: { value: string; label: string; searchText?: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  formClassName?: string;
  menuPlacement?: "auto" | "bottom" | "top";
  defaultValue?: string;
  disabled?: boolean;
  isRequired?: boolean;
};

export function DiscountControlledDropdown({
  label,
  options,
  value,
  onChange,
  className = "h-8 w-full text-xs",
  formClassName = "",
  menuPlacement = "auto",
  defaultValue,
  disabled = false,
  isRequired = false,
}: Readonly<DiscountControlledDropdownProps>) {
  const { control, setValue } = useForm<{ selected: string }>({
    defaultValues: { selected: value },
  });

  useEffect(() => {
    setValue("selected", value);
  }, [setValue, value]);

  return (
    <DropdownSelect
      name="selected"
      name_key="selected"
      control={control}
      options={options}
      label={label}
      value={value}
      onChange={(next) => onChange(String(next ?? ""))}
      className={className}
      formClassName={formClassName}
      menuPlacement={menuPlacement}
      defaultValue={defaultValue}
      disabled={disabled}
      isRequired={isRequired}
    />
  );
}
