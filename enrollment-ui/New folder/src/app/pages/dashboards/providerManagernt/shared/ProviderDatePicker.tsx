import clsx from "clsx";
import { forwardRef, useEffect, useId, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateInput, formatDateForDatePicker } from "@/components/ui/Form/DateInput";
import { InputErrorMsg } from "@/components/ui/Form/InputErrorMsg";
import {
  PROVIDER_DATE_PICKER_FORMAT,
  parseProviderDate,
  toProviderDateStorageValue,
} from "./dateFormat";

type ProviderDatePickerProps = {
  label?: React.ReactNode;
  /** Prefer with react-hook-form — accept any RHF control shape. */
  control?: any;
  name?: string;
  rules?: Record<string, unknown>;
  value?: string;
  defaultValue?: string;
  onChange?: (event: { target: { value: string; name: string } }) => void;
  onBlur?: (event: { target: { value: string; name: string } }) => void;
  error?: React.ReactNode | boolean;
  disabled?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
  id?: string;
  /** Render calendar in a portal — use inside AG Grid / overflow-hidden containers. */
  withPortal?: boolean;
  /** Attach calendar popper to a DOM node (e.g. `root`) — preferred in grids/drawers. */
  portalId?: string;
  /** Keep calendar in DOM tree — use inside Headless UI / modal dialogs. */
  disablePortal?: boolean;
  showIcon?: boolean;
  dateFormat?: string;
  /** Stop AG Grid row clicks when opening the picker inside a grid cell. */
  stopGridEventPropagation?: boolean;
};

const GridStopPropagationInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function GridStopPropagationInput(props, ref) {
  return (
    <input
      type="text"
      {...props}
      ref={ref}
      onMouseDown={(event) => {
        event.stopPropagation();
        props.onMouseDown?.(event);
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        props.onPointerDown?.(event);
      }}
    />
  );
});

/** Matches enrolment `DateInput` field styling (`CorporateInward` search filters). */
function enrollmentDateInputClassName(
  error?: React.ReactNode | boolean,
  disabled?: boolean,
  className?: string,
) {
  return clsx(
    "rounded-sm text-[11px] h-[34px] w-full form-input",
    error
      ? "border-error dark:border-error-lighter"
      : disabled
        ? "cursor-not-allowed border-gray-300 bg-gray-100 opacity-60 font-bold dark:border-dark-500 dark:bg-dark-600"
        : "border-gray-300 bg-white hover:border-gray-400 focus:border-primary-600 peer autofill:shadow-[inset_0_0_0px_1000px_white] autofill:[-webkit-text-fill-color:#000] dark:border-dark-450 dark:hover:border-dark-400 dark:focus:border-primary-500",
    className,
  );
}

function ProviderDatePickerInner({
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  name = "",
  error,
  disabled,
  isRequired,
  placeholder = "Select date",
  className,
  min,
  max,
  id,
  withPortal = false,
  portalId = "root",
  disablePortal = false,
  showIcon = false,
  dateFormat = PROVIDER_DATE_PICKER_FORMAT,
  stopGridEventPropagation = false,
}: Omit<ProviderDatePickerProps, "control">) {
  const inputId = useId();
  const resolvedId = id ?? inputId;
  const gridCustomInput = useMemo(
    () => (stopGridEventPropagation ? <GridStopPropagationInput /> : undefined),
    [stopGridEventPropagation],
  );
  const isControlled = value !== undefined;
  const [localValue, setLocalValue] = useState(() => String(value ?? defaultValue ?? ""));

  useEffect(() => {
    if (isControlled) setLocalValue(String(value ?? ""));
  }, [isControlled, value]);

  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setLocalValue(String(defaultValue ?? ""));
    }
  }, [defaultValue, isControlled]);

  const selected = parseProviderDate(localValue);
  const minDate = min ? parseProviderDate(min) : null;
  const maxDate = max ? parseProviderDate(max) : null;
  const hasBounds = Boolean(minDate || maxDate);

  const emit = (
    next: string,
    handler?: (event: { target: { value: string; name: string } }) => void,
  ) => {
    handler?.({ target: { value: next, name } });
  };

  const resolvedError =
    error && typeof error !== "boolean" ? error : undefined;

  if (!hasBounds) {
    return (
      <div className="w-full [&_.input-root]:min-h-0 [&_.react-datepicker-wrapper]:mt-0.5">
        <DateInput
          id={resolvedId}
          label={label}
          isRequired={isRequired}
          value={localValue || null}
          onChange={(date) => {
            const next = formatDateForDatePicker(date) ?? "";
            if (!isControlled) setLocalValue(next);
            emit(next, onChange);
          }}
          placeholder={placeholder}
          disabled={disabled}
          error={resolvedError}
          className={className}
          disablePortal={disablePortal}
          {...(gridCustomInput ? { customInput: gridCustomInput } : {})}
        />
      </div>
    );
  }

  return (
    <div className="input-root w-full min-w-0 min-h-0">
      {label ? (
        <label htmlFor={resolvedId} className="input-label">
          <span className="flex items-center">
            {label}
            {isRequired ? <span className="text-red-600">*</span> : null}
          </span>
        </label>
      ) : null}

      <DatePicker
        id={resolvedId}
        name={name}
        {...(gridCustomInput ? { customInput: gridCustomInput } : {})}
        selected={selected}
        onChange={(date: Date | null) => {
          const next = toProviderDateStorageValue(date);
          if (!isControlled) setLocalValue(next);
          emit(next, onChange);
        }}
        onBlur={() => emit(localValue, onBlur)}
        dateFormat={dateFormat}
        placeholderText={placeholder}
        disabled={disabled}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        yearDropdownItemNumber={100}
        scrollableYearDropdown
        withPortal={withPortal && !portalId && !disablePortal}
        {...(disablePortal ? {} : { portalId })}
        showIcon={showIcon}
        toggleCalendarOnIconClick={showIcon}
        popperPlacement="bottom-start"
        popperClassName="!z-[9999]"
        wrapperClassName="w-full"
        className={enrollmentDateInputClassName(error, disabled, className)}
      />

      <InputErrorMsg when={!!resolvedError}>{resolvedError}</InputErrorMsg>
    </div>
  );
}

/**
 * Provider Management date picker — same UI as enrolment `DateInput`
 * (`dd MMM yyyy`, placeholder "Select date"), stores `yyyy-MM-dd`.
 */
export function ProviderDatePicker({
  control,
  name,
  error,
  rules,
  ...rest
}: Readonly<ProviderDatePickerProps>) {
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => (
          <ProviderDatePickerInner
            {...rest}
            name={field.name}
            value={field.value == null ? "" : String(field.value)}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            error={error ?? fieldState.error?.message}
          />
        )}
      />
    );
  }

  return <ProviderDatePickerInner {...rest} name={name} error={error} />;
}
