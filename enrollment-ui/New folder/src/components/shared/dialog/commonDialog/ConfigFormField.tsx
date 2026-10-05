import type { ReactNode } from "react";
import clsx from "clsx";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Input, Textarea } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import { ModernFileField } from "./ModernFileField";
import type { ConfigFormDialogMaxColumns, FieldConfig, FieldOption } from "./fieldTypes";
import { getColSpanClass } from "./gridUtils";

export type ConfigFormFieldProps = {
  field: FieldConfig;
  form: UseFormReturn<Record<string, unknown>>;
  /** Global busy / upload state */
  disabled: boolean;
  maxColumns: ConfigFormDialogMaxColumns;
  fileRefs?: Record<string, React.RefObject<HTMLInputElement | null>>;
  onFileChange?: (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearError?: () => void;
};

type FieldError = { message?: string } | undefined;

type FieldRenderContext = {
  field: FieldConfig;
  form: UseFormReturn<Record<string, unknown>>;
  values: Record<string, unknown>;
  disabled: boolean;
  fieldError: FieldError;
  wrap: (node: ReactNode) => ReactNode;
  fileRefs?: ConfigFormFieldProps["fileRefs"];
  onFileChange?: ConfigFormFieldProps["onFileChange"];
  onClearError?: ConfigFormFieldProps["onClearError"];
};

function getValuesRecord(form: UseFormReturn<Record<string, unknown>>) {
  return form.getValues() as Record<string, unknown>;
}

function isFieldVisible(field: FieldConfig, values: Record<string, unknown>) {
  if (!field.showWhen) return true;
  const dep = field.dependsOn ? values[field.dependsOn] : undefined;
  return field.showWhen(dep, values);
}

function getIsRequired(
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  if (field.requiredWhen) return field.requiredWhen(values);
  return Boolean(field.required);
}

function resolveFieldDisabled(
  globalDisabled: boolean,
  visible: boolean,
  whenHidden: "hide" | "disable",
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  const conditionallyDisabled = !visible && whenHidden === "disable";
  const ruleDisabled = field.disabledWhen?.(values) ?? false;
  return globalDisabled || conditionallyDisabled || ruleDisabled;
}

function RequiredMark({ required }: { required: boolean }) {
  return required ? <span className="text-red-500"> *</span> : null;
}

function labeledNode(label: string, required: boolean) {
  return (
    <>
      {label}
      <RequiredMark required={required} />
    </>
  );
}

/** Solid surface on gray dialog body; `!resize-y` overrides global `.form-textarea { resize: none }`. */
function textareaClassName(
  disabled: boolean,
  field: Extract<FieldConfig, { type: "textarea" }>,
) {
  return clsx(
    "w-full text-sm !resize-y",
    !disabled && "bg-white",
    field.minHeightClassName ?? "min-h-[7.5rem]",
    field.className,
  );
}

function inputSurfaceClassName(disabled: boolean) {
  return clsx("w-full text-sm", !disabled && "bg-white");
}

function resolveInputError(
  field: Extract<FieldConfig, { type: "input" }>,
  fieldError: FieldError,
): string | undefined {
  if (field.error && field.error.length > 0) return field.error;
  return fieldError?.message;
}

function renderInputField(ctx: FieldRenderContext): ReactNode {
  const { field, form, values, disabled, fieldError, wrap } = ctx;
  if (field.type !== "input") return null;

  const registered = form.register(field.name);
  const inputProps = field.bindRegister
    ? field.bindRegister(registered)
    : registered;

  return wrap(
    <Input
      label={field.label}
      isRequired={getIsRequired(field, values)}
      type={field.inputType ?? "text"}
      autoComplete="off"
      placeholder={field.placeholder}
      disabled={disabled}
      error={resolveInputError(field, fieldError)}
      className={inputSurfaceClassName(disabled)}
      {...inputProps}
    />,
  );
}

function renderTextareaField(ctx: FieldRenderContext): ReactNode {
  const { field, form, values, disabled, wrap } = ctx;
  if (field.type !== "textarea") return null;

  const required = getIsRequired(field, values);
  const label = labeledNode(field.label, required);
  const commonProps = {
    label,
    placeholder: field.placeholder,
    rows: field.rows ?? 4,
    disabled,
    className: textareaClassName(disabled, field),
  };

  if (field.externalControl) {
    return wrap(
      <Textarea
        {...commonProps}
        value={field.externalControl.value}
        onChange={(e) => field.externalControl?.onChange(e.target.value)}
      />,
    );
  }

  return wrap(<Textarea {...commonProps} {...form.register(field.name)} />);
}

function renderDateField(ctx: FieldRenderContext): ReactNode {
  const { field, form, values, disabled, fieldError, wrap, onClearError } = ctx;
  if (field.type !== "date") return null;

  const commonProps = {
    label: field.label,
    isRequired: getIsRequired(field, values),
    disabled,
    className: clsx(
      "h-[38px] rounded-[10px] border border-gray-300 bg-white px-3 text-sm text-gray-800",
      "hover:border-gray-400 focus:border-primary-600",
      disabled && "cursor-not-allowed bg-gray-100 opacity-60",
    ),
    // Keep calendar in dialog DOM — portaled pickers trigger Headless UI outside-click close.
    disablePortal: true,
  };

  if (field.externalControl) {
    return wrap(
      <ProviderDatePicker
        {...commonProps}
        name={field.name}
        value={field.externalControl.value}
        onChange={(e) => {
          field.externalControl?.onChange(e.target.value);
          onClearError?.();
        }}
      />,
    );
  }

  return wrap(
    <ProviderDatePicker
      {...commonProps}
      control={form.control}
      name={field.name}
      error={fieldError?.message}
    />,
  );
}

function renderDropdownField(ctx: FieldRenderContext): ReactNode {
  const { field, form, values, disabled, fieldError, wrap, onClearError } = ctx;
  if (field.type !== "dropdown") return null;

  const multi = field.multiselect === true;
  const checkboxMulti = field.isSelectCheckbox ?? multi;
  const commonProps = {
    name: field.name,
    label: field.label,
    isRequired: getIsRequired(field, values),
    control: form.control,
    options: field.options,
    defaultValue: field.defaultValue,
    errors: fieldError,
    onSelect: onClearError,
    className: "w-full text-sm",
    disabled,
    multiselect: multi,
    is_select_checkbox: checkboxMulti,
  };

  if (field.externalControl) {
    return wrap(
      <DropdownSelect
        {...commonProps}
        value={field.externalControl.value}
        onChange={(v) => {
          const s = String(v ?? "");
          field.externalControl?.onChange(s);
          form.setValue(field.name, s, { shouldValidate: true });
        }}
      />,
    );
  }

  return wrap(<DropdownSelect {...commonProps} />);
}

function renderFileField(ctx: FieldRenderContext): ReactNode {
  const { field, values, disabled, wrap, fileRefs, onFileChange, onClearError } = ctx;
  if (field.type !== "file") return null;

  const ref = fileRefs?.[field.name];
  if (!ref) {
    return wrap(
      <p className="text-xs text-amber-700">
        Missing file ref for field &quot;{field.name}&quot;. Pass{" "}
        <code className="rounded bg-amber-100 px-1">fileRefs</code> from the
        dialog.
      </p>,
    );
  }

  return wrap(
    <ModernFileField
      label={field.label}
      isRequired={getIsRequired(field, values)}
      inputRef={ref}
      accept={field.accept}
      disabled={disabled}
      className={field.inputClassName}
      onChange={(e) => {
        onFileChange?.(field.name, e);
        onClearError?.();
      }}
    />,
  );
}

function renderCheckboxField(ctx: FieldRenderContext): ReactNode {
  const { field, form, values, disabled, wrap } = ctx;
  if (field.type !== "checkbox") return null;

  const required = getIsRequired(field, values);
  return wrap(
    <Controller
      name={field.name}
      control={form.control}
      render={({ field: f }) => (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={Boolean(f.value)}
            disabled={disabled}
            onChange={(e) => f.onChange(e.target.checked)}
          />
          <span>
            {field.label}
            <RequiredMark required={required} />
          </span>
        </label>
      )}
    />,
  );
}

function renderRadioField(ctx: FieldRenderContext): ReactNode {
  const { field, form, values, disabled, wrap } = ctx;
  if (field.type !== "radio") return null;

  const required = getIsRequired(field, values);
  return wrap(
    <Controller
      name={field.name}
      control={form.control}
      render={({ field: f }) => (
        <fieldset disabled={disabled} className="min-w-0 space-y-2">
          <legend className="mb-1 text-sm font-medium text-gray-700">
            {field.label}
            <RequiredMark required={required} />
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {field.options.map((opt: FieldOption) => (
              <label
                key={opt.value}
                className="inline-flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={field.groupName ?? field.name}
                  value={opt.value}
                  checked={f.value === opt.value}
                  onChange={() => f.onChange(opt.value)}
                  className="border-gray-300"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    />,
  );
}

const FIELD_RENDERERS: Record<
  FieldConfig["type"],
  (ctx: FieldRenderContext) => ReactNode
> = {
  input: renderInputField,
  textarea: renderTextareaField,
  date: renderDateField,
  dropdown: renderDropdownField,
  file: renderFileField,
  checkbox: renderCheckboxField,
  radio: renderRadioField,
};

function renderFieldContent(ctx: FieldRenderContext): ReactNode {
  return FIELD_RENDERERS[ctx.field.type]?.(ctx) ?? null;
}

export function ConfigFormField({
  field,
  form,
  disabled: globalDisabled,
  maxColumns,
  fileRefs,
  onFileChange,
  onClearError,
}: ConfigFormFieldProps) {
  const values = getValuesRecord(form);
  const visible = isFieldVisible(field, values);
  const whenHidden = field.whenHidden ?? "disable";

  if (!visible && whenHidden === "hide") {
    return null;
  }

  const disabled = resolveFieldDisabled(
    globalDisabled,
    visible,
    whenHidden,
    field,
    values,
  );
  const colClass = getColSpanClass(field.colSpan ?? 1, maxColumns);
  const fieldError = form.formState.errors?.[field.name] as FieldError;

  if (field.render) {
    return (
      <div className={colClass}>
        {field.render({ form, disabled })}
      </div>
    );
  }

  const wrap = (node: ReactNode) => (
    <div className={`${colClass} ${field.className ?? ""}`.trim()}>{node}</div>
  );

  return renderFieldContent({
    field,
    form,
    values,
    disabled,
    fieldError,
    wrap,
    fileRefs,
    onFileChange,
    onClearError,
  });
}
