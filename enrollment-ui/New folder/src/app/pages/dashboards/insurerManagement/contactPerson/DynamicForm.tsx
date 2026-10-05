import { ReactNode } from "react";
import { Control, FieldErrors, FieldValues, Path, UseFormRegister,UseFormWatch } from "react-hook-form";
import { Preview } from "@/app/pages/forms/file-upload/Preview";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Checkbox, Input, Textarea } from "@/components/ui";
import MultiContactField from "./MultiContactField";
export type FieldType = "input" | "dropdown" | "uploadDocument" | "checkbox" | "multiContact" | "textArea";
export type FieldType1 = "yes";
import { useTranslation } from "react-i18next";
export interface OptionItem {
  label: string;
  value: string;
}
export interface DynamicField {
  name: string;
  label: string;
  type?: FieldType;
  subType?: FieldType1;
  placeholder?: string;
  options?: OptionItem[];
  isRequired?: boolean;
  hidden?: boolean;
  className?: string;
  inputType?: string;
  accept?: string;
  onChange?: (files: File[]) => void;
  value?: any;
}
export interface DynamicSection {
  title: string;
  icon?: ReactNode;
  fields: DynamicField[];
}
interface Props<T extends FieldValues> {
  section: DynamicSection;
  basePath: string;
  control: Control<T>;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  errors: FieldErrors<T>;
  showHeader?: boolean;
  onAddSection?: () => void;
  onRemoveSection?: () => void;
  isContactRequired?: boolean;
  editing?: boolean;
}

export function getFieldError(
  errors: FieldErrors,
  basePath: string,
  fieldName: string
): string | undefined {
  if (!errors) return undefined;
  const pathParts = basePath.split(".").map(p =>
    Number.isNaN(Number(p)) ? p : Number(p)
  );
  let current: any = errors;
  for (const key of pathParts) {
    if (!current) return undefined;
    current = current[key];
  }
  const fieldError = current?.[fieldName];
  if (!fieldError) return undefined;
  return fieldError.message;
}


function DynamicForm<T extends FieldValues>({
  section,
  basePath,
  control,
  register,
  watch,
  errors,
  showHeader = false,
  onAddSection,
  onRemoveSection,
  isContactRequired = false,
  editing = false,
}: Readonly<Props<T>>) {
  const { t } = useTranslation()

  return (
    <div className="bg-card px-4 pb-4  mb-4">
      {showHeader && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="sub_section_title font-semibold flex items-center gap-2 text-gray-700">
          </h3>
          {onAddSection && (
            <button
              type="button"
              onClick={onAddSection}
              className="text-blue-600 underline font-medium cursor-pointer">
              + {t("contactPersonform.title")}
            </button>
          )}
        </div>
      )}
      {onRemoveSection && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onRemoveSection}
            className="text-red-600 underline text-sm cursor-pointer">
            Remove Contact Person
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {section?.fields?.map((field) => {
          if (field?.hidden) return null;

          const fieldName = `${basePath}.${field?.name}` as Path<T>;
          const errorMessage = getFieldError(errors, basePath, field?.name);

          switch (field.type) {
            case "input": {
              return (
                <Input
                  key={fieldName}
                  label={field.label}
                  placeholder={field.placeholder}
                  type={field.inputType || "text"}
                  {...register(fieldName, {
                    required: field.isRequired
                      ? `${field.label} is required`
                      : false,
                  })}
                  error={errorMessage}
                  isRequired={field.isRequired}
                  className={field.className}
                  disabled={editing}
                />
              );
            }
            case "textArea": {
              return (
                <Textarea
                  key={fieldName}
                  label={t("contactPersonform.fields.remarks")}
                  placeholder={t("contactPersonform.placeholders.remarks")}
                  rows={3}
                  {...register(fieldName, {
                    required: field.isRequired
                      ? `${field.label} is required`
                      : false,
                  })}
                  error={errorMessage}
                  className="text-sx"
                />
              );
            }
            case "dropdown": {
              return (
                <DropdownSelect
                  key={fieldName}
                  label={field.label}
                  options={field.options || []}
                  isRequired={field.isRequired}
                  className={field.className}
                  rules={{
                    required: field.isRequired
                      ? `${field.label} is required`
                      : false,
                  }}
                  errors={errorMessage ? { message: errorMessage } : undefined}
                  name={fieldName}
                  control={control}
                  defaultValue={field.label}
                  disabled={editing}
                />
              );
            }
            case "uploadDocument": {
              return (
                <Preview
                  key={fieldName}
                  label={field.label}
                  value={(field as any).value}
                  accept={field.accept || "image/*"}
                  onChange={(files: File[]) => field.onChange?.(files)}
                />
              );
            }
            case "checkbox": {
              return (
                <Checkbox
                  key={fieldName}
                  label={field.label}
                  {...register(fieldName)}
                  className={field.className}
                />
              );
            }
            case "multiContact": {
              return (
                <MultiContactField<T, any>
                  key={fieldName}
                  name={fieldName}
                  control={control}
                  register={register}
                  watch={watch}
                  errors={errors}
                  isRequired={isContactRequired}
                  editing={editing}
                />
              );
            }
            default: {
              if (field?.subType === "yes") {
                return (
                  <DropdownSelect
                    key={fieldName}
                    label={field.label}
                    options={field.options || []}
                    isRequired={true}
                    className={field.className}
                    rules={{
                      required: field.isRequired
                        ? `${field.label} is required`
                        : false,
                    }}
                    errors={{ message: errorMessage }}
                    name={fieldName}
                    control={control}
                    defaultValue={field.label}
                    disabled={editing}
                  />
                );
              }
              return null;
            }}
        })}
      </div>
    </div>
  );
}
export default DynamicForm