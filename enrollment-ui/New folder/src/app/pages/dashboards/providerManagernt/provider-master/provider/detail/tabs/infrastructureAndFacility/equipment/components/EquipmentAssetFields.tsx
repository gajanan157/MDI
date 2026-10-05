import type { ReactNode } from "react";

const inputClass =
  "h-7 w-full rounded border border-gray-300 bg-white px-2 text-[11px] text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

export function FieldShell({
  label,
  hint,
  children,
}: Readonly<{ label: string; hint?: string; children: ReactNode }>) {
  return (
    <label className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {hint ? <span className="ml-1 font-normal text-slate-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function ReadValue({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="block truncate text-[11.5px] font-medium text-slate-800">
      {children === "" || children == null ? "—" : children}
    </span>
  );
}

export function TextField({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  hint,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  placeholder?: string;
  hint?: string;
}>) {
  return (
    <FieldShell label={label} hint={hint}>
      {readOnly ? (
        <ReadValue>{value}</ReadValue>
      ) : (
        <input
          className={inputClass}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldShell>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  readOnly,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
}>) {
  return (
    <FieldShell label={label}>
      {readOnly ? (
        <ReadValue>{value}</ReadValue>
      ) : (
        <input
          inputMode="numeric"
          className={`${inputClass} text-right tabular-nums`}
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        />
      )}
    </FieldShell>
  );
}

export function DateField({
  label,
  value,
  displayValue,
  onChange,
  readOnly,
  disabled,
}: Readonly<{
  label: string;
  value: string;
  displayValue: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  disabled?: boolean;
}>) {
  return (
    <FieldShell label={label}>
      {readOnly ? (
        <ReadValue>{displayValue}</ReadValue>
      ) : (
        <input
          type="date"
          className={inputClass}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  readOnly,
}: Readonly<{
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  readOnly: boolean;
}>) {
  return (
    <FieldShell label={label}>
      {readOnly ? (
        <ReadValue>{value}</ReadValue>
      ) : (
        <select
          className={inputClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
  readOnly,
}: Readonly<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  readOnly: boolean;
}>) {
  if (readOnly) {
    return (
      <FieldShell label={label}>
        <span
          className={`inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            checked
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {checked ? "Yes" : "No"}
        </span>
      </FieldShell>
    );
  }
  return (
    <FieldShell label={label}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
          checked
            ? "border-primary-600 bg-primary-600"
            : "border-slate-300 bg-slate-200"
        }`}
      >
        <span
          className={`ml-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </FieldShell>
  );
}

export function GroupLabel({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="col-span-full mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </p>
  );
}
