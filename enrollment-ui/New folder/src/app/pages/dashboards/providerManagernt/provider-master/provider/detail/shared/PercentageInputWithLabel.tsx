import { Input } from "@/components/ui";

export interface PercentageInputWithLabelProps {
  /** Label shown above the input (selected option name, e.g. "ICU charges", "Discount on total bill") */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Placeholder (default empty to avoid duplicate % with suffix) */
  placeholder?: string;
  /** Optional id for the input (for a11y) */
  id?: string;
  className?: string;
  disabled?: boolean;
  /** `md` matches BillScopeMultiSelect / category row control height (40px). */
  controlSize?: "sm" | "md";
}

/**
 * Input field with label on top and "%" suffix – for "Enter discount % for each selected category".
 * Uses the same stacked layout as other form fields (label above, input below) for a consistent look.
 */
export function PercentageInputWithLabel({
  label,
  value,
  onChange,
  placeholder = "",
  id,
  className = "",
  disabled = false,
  controlSize = "sm",
}: Readonly<PercentageInputWithLabelProps>) {
  const inputId = id ?? `percent-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const labelTextCls = controlSize === "md" ? "text-xs font-medium text-gray-700" : undefined;
  const inputClass =
    controlSize === "md"
      ? `!h-10 min-h-[40px] w-full min-w-0 !text-sm !rounded-lg !border-gray-200 ${className}`.trim()
      : `h-8 w-full min-w-0 text-xs ${className}`.trim();
  return (
    <div className="flex flex-col gap-1">
      <Input
        id={inputId}
        label={label}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        suffix={
          <span className={`shrink-0 text-gray-500 ${controlSize === "md" ? "text-xs" : "text-[11px]"}`}>
            %
          </span>
        }
        className={inputClass}
        classNames={{
          root: controlSize === "md" ? "!h-auto min-h-0" : undefined,
          ...(labelTextCls ? { labelText: labelTextCls } : {}),
        }}
        aria-label={`${label} percentage`}
      />
    </div>
  );
}
