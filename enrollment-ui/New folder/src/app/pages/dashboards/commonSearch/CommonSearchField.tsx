import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import { DateInput, formatDateForDatePicker } from "@/components/ui/Form/DateInput";
import { lazy, Suspense } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormWatch } from "react-hook-form";
import type { Option, SearchField } from "../CommonSearch";
import {
  buildTextFieldRegisterOptions,
  getFieldErrorMessage,
  handleNumericKeyDown,
  handleNumericPaste,
  isInsurerFieldRequired,
  resolveDropdownOptions,
  resolveFieldLabel,
  shouldRenderSearchField,
  shouldUseVirtualizedDropdown,
  type DropdownOptionsContext,
  type OfficeBuckets
} from "./commonSearchFieldHelpers";

const VirtualizedDropdownSelect = lazy(() =>
  import("@/components/shared/form/VirtualizedDropdownSelect").then((module) => ({
    default: module.default,
  })),
);

type CommonSearchFieldProps = {
  field: SearchField;
  watch: UseFormWatch<Record<string, unknown>>;
  register: UseFormRegister<Record<string, unknown>>;
  control: Control<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  insurerOfficeList: unknown[];
  officeBuckets: OfficeBuckets;
  insurerListNew: Option[];
  cityList: Array<{ city?: string; name?: string; stateName?: string }>;
  stateNameWatch?: string;
  pathname: string;
  requiredPaths: string[];
  fetchInwardDropdown: (value: string) => void;
};

function CommonSearchTextField({
  field,
  watch,
  register,
  errors,
}: Readonly<Pick<CommonSearchFieldProps, "field" | "watch" | "register" | "errors">>) {
  const fieldLabel = resolveFieldLabel(field, watch);
  const registration = buildTextFieldRegisterOptions(field, register);
  const isLocked = Boolean(field.disabled);

  return (
    <div className="flex h-[60px] flex-col">
      <label className="input-label block">{fieldLabel}</label>
      <Input
        type="text"
        inputMode={field.numericOnly ? "numeric" : undefined}
        pattern={field.numericOnly ? "[0-9]*" : undefined}
        placeholder={isLocked ? undefined : `Enter ${fieldLabel}`}
        maxLength={field.name === "pincode" ? 6 : undefined}
        {...registration}
        // Keep after register() so paste/keydown are not overwritten.
        onKeyDown={field.numericOnly && !isLocked ? handleNumericKeyDown : undefined}
        onPaste={field.numericOnly && !isLocked ? handleNumericPaste : undefined}
        readOnly={isLocked}
        className={
          isLocked
            ? "mt-[3px] h-10 rounded-sm bg-gray-100 text-gray-700"
            : "mt-[3px] h-10 rounded-sm"
        }
      />
      {errors[field.name] && (
        <p className="mt-1 text-xs text-red-500">
          {getFieldErrorMessage(field.name, errors)}
        </p>
      )}
    </div>
  );
}

function CommonSearchDateField({
  field,
  watch,
  errors,
  control
}: Readonly<Pick<CommonSearchFieldProps, "field" | "watch" | "register" | "errors" | "control">>) {
  const fieldLabel = resolveFieldLabel(field, watch);

  return (
    <div className="flex h-[60px] flex-col">
      <Controller
        name={field.name}
        control={control}
        render={({ field: controllerField }) => (
          <DateInput
            label={fieldLabel}
            value={controllerField.value}
            onChange={(date) =>
              controllerField.onChange(formatDateForDatePicker(date))
            }
            placeholder="Select date"
            disabled={field.disabled}
            error={
              errors[field.name]
                ? getFieldErrorMessage(field.name, errors)
                : undefined
            }
          />
        )}
      />
    </div>
  );
}

function CommonSearchDropdownField(props: Readonly<CommonSearchFieldProps>) {
  const {
    field,
    watch,
    control,
    errors,
    pathname,
    requiredPaths,
    fetchInwardDropdown,
  } = props;

  const context: DropdownOptionsContext = {
    field,
    watch,
    insurerOfficeList: props.insurerOfficeList,
    officeBuckets: props.officeBuckets,
    insurerListNew: props.insurerListNew,
    cityList: props.cityList,
    stateNameWatch: props.stateNameWatch,
  };

  const fieldOptions = resolveDropdownOptions(context);
  if (field.name === "city" && field.dependsOn === "state" && !watch(field.dependsOn)) {
    return null;
  }
  if (field.dependsOn && field.getOptions && fieldOptions.length === 0 && field.name !== "city") {
    return null;
  }

  const fieldLabel = resolveFieldLabel(field, watch);
  let dropdownOptions = fieldOptions;

  if (field.name === "insurerId") {
    dropdownOptions = props.insurerListNew;
  } else if (field.name === "city") {
    dropdownOptions = fieldOptions;
  }
  if (shouldUseVirtualizedDropdown(field)) {
    return (
      <div className="flex flex-col">
        <Suspense
          fallback={
            <div className="flex h-[34px] w-full items-center rounded-[10px] border border-gray-300 bg-white px-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          }
        >
          <VirtualizedDropdownSelect
            label={fieldLabel}
            defaultValue={fieldLabel}
            name_key={field.name}
            name={field.name}
            control={control}
            options={dropdownOptions}
            rules={field.rules}
            errors={errors[field.name]}
            multiselect={field.isMulti}
            disabled={field.disabled}
            className={
              field.isMulti
                ? "min-h-[34px] rounded-[10px]"
                : "h-[34px] rounded-[10px]"
            }
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <DropdownSelect
        label={fieldLabel}
        defaultValue={fieldLabel}
        name_key={field.name}
        name={field.name}
        control={control}
        options={dropdownOptions}
        rules={field.rules}
        errors={errors[field.name]}
        multiselect={field.isMulti}
        multiselectHorizontalScroll={Boolean(field.isMulti)}
        disabled={field.disabled}
        allowCustomValue={field.allowCustomValue}
        className={
          field.isMulti
            ? "min-h-[34px] rounded-[10px]"
            : "h-[34px] rounded-[10px]"
        }
        enableSearchFetch={field.name === "inwardNo"}
        fetchPayload={field.name === "inwardNo" ? fetchInwardDropdown : undefined}
        isRequired={isInsurerFieldRequired(field.name, pathname, requiredPaths)||field?.isRequired}
      />
    </div>
  );
}

export default function CommonSearchField(props: Readonly<CommonSearchFieldProps>) {
  const context: DropdownOptionsContext = {
    field: props.field,
    watch: props.watch,
    insurerOfficeList: props.insurerOfficeList,
    officeBuckets: props.officeBuckets,
    insurerListNew: props.insurerListNew,
    cityList: props.cityList,
    stateNameWatch: props.stateNameWatch,
  };

  if (!shouldRenderSearchField(props.field, context)) {
    return null;
  }

  if (props.field.type === "text") {
    return (
      <CommonSearchTextField
        field={props.field}
        watch={props.watch}
        register={props.register}
        errors={props.errors}
      />
    );
  }

  if (props.field.type === "date") {
    return (
      <CommonSearchDateField
        field={props.field}
        watch={props.watch}
        register={props.register}
        errors={props.errors}
        control={props.control}
      />

    );
  }

  if (props.field.type === "dropdown") {
    return <CommonSearchDropdownField {...props} />;
  }

  return null;
}
