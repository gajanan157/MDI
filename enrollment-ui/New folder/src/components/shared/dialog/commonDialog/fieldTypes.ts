import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

export type FieldOption = { label: string; value: string };

export type FieldType =
  | "input"
  | "dropdown"
  | "date"
  | "file"
  | "textarea"
  | "checkbox"
  | "radio";

type BaseField = {
  name: string;
  label: string;
  required?: boolean;
  /** When set, overrides `required` for labels and validation hints. */
  requiredWhen?: (allValues: Record<string, unknown>) => boolean;
  /** Column span within the dialog grid (1–4). Default 1. */
  colSpan?: 1 | 2 | 3 | 4;
  className?: string;
  /** Watch this field name when evaluating `showWhen`. */
  dependsOn?: string;
  /**
   * First arg: value of `dependsOn` (if set), else `undefined`.
   * Second arg: current form values (from `getValues()`).
   */
  showWhen?: (
    dependencyValue: unknown,
    allValues: Record<string, unknown>,
  ) => boolean;
  /**
   * When `showWhen` is false: remove field vs keep visible but disabled.
   * @default 'disable'
   */
  whenHidden?: "hide" | "disable";
  /** Additional disable (e.g. loading) evaluated on every render. */
  disabledWhen?: (allValues: Record<string, unknown>) => boolean;
  /** Fully custom field (overrides type rendering). */
  render?: (ctx: {
    form: import("react-hook-form").UseFormReturn<Record<string, unknown>>;
    disabled: boolean;
  }) => ReactNode;
};

export type FieldConfig =
  | (BaseField & {
      type: "input";
      inputType?: string;
      placeholder?: string;
      /** Immediate validation message (e.g. blocked special characters). */
      error?: string;
      /** Wrap RHF register (e.g. alphabet-only, phone digits). */
      bindRegister?: (registerReturn: UseFormRegisterReturn) => Record<string, unknown>;
    })
  | (BaseField & {
      type: "textarea";
      rows?: number;
      placeholder?: string;
      minHeightClassName?: string;
      externalControl?: {
        value: string;
        onChange: (value: string) => void;
      };
    })
  | (BaseField & {
      type: "date";
      externalControl?: {
        value: string;
        onChange: (value: string) => void;
      };
    })
  | (BaseField & {
      type: "dropdown";
      options: FieldOption[];
      /** Placeholder when nothing is selected. */
      defaultValue?: string;
      /** Multi-select (stores `string[]` in RHF). */
      multiselect?: boolean;
      /** Checkbox-style options in multi-select (react-select). */
      isSelectCheckbox?: boolean;
      /** Use external value instead of RHF for this field (e.g. synced parent state). */
      externalControl?: {
        value: string;
        onChange: (value: string) => void;
      };
    })
  | (BaseField & {
      type: "file";
      accept?: string;
      inputClassName?: string;
    })
  | (BaseField & { type: "checkbox" })
  | (BaseField & {
      type: "radio";
      options: FieldOption[];
      /** Radio group name (defaults to `name`). */
      groupName?: string;
    });

export type ConfigFormDialogMaxColumns = 1 | 2 | 3 | 4;
