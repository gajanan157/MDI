import clsx from "clsx";
import { ElementType, ForwardedRef, ReactNode, forwardRef, useEffect, useState } from "react";

import {
  PolymorphicComponentProps,
  PolymorphicRef,
} from "@/@types/polymorphic";
import { formatAmountWithWords2 } from "@/app/pages/dashboards/enrollmentsystem/dashboard/components/types";
import { useId } from "@/hooks";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { InputErrorMsg } from "./InputErrorMsg";


export type InputOwnProps<T extends ElementType = "input"> = {
  component?: T;
  label?: ReactNode;
  isRequired?: boolean;
  isPrice?: boolean;
  isFull?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  description?: string;
  className?: string;
  placeholder?: string;
  isMsg?: string;
  classNames?: {
    root?: string;
    label?: string;
    labelText?: string;
    wrapper?: string;
    input?: string;
    prefix?: string;
    suffix?: string;
    error?: string;
    description?: string;
  };
  error?: boolean | ReactNode;
  unstyled?: boolean;
  disabled?: boolean;
  formatNumber?: boolean;
  isInfo?: boolean;
  type?: string;
  rootProps?: Record<string, any>;
  labelProps?: Record<string, any>;
  id?: string;
  isInfoMsg?: string;

};

export type InputProps<E extends ElementType = "button"> =
  PolymorphicComponentProps<E, InputOwnProps<E>>;

export const formatIndianNumber = (value?: string | number | null): string => {
  if (value === null || value === undefined || value === "") return "";

  const stringValue = value.toString();
  const [integer, decimal] = stringValue.split(".");

  const formattedInteger = Number(integer).toLocaleString("en-IN");

  return decimal !== undefined
    ? `${formattedInteger}.${decimal}`
    : formattedInteger;
};

const InputInner = forwardRef(
  <T extends ElementType = "input">(props: any, ref: ForwardedRef<any>) => {
    const {
      component,
      label,
      prefix,
      suffix,
      description,
      isFull = false,
      className,
      classNames = {},
      error,
      unstyled,
      disabled,
      type = "text",
      rootProps,
      labelProps,
      isRequired,
      id,
      isInfoMsg,
      isInfo,
      formatNumber,
      onChange,
      value,
      isPrice,
      isMsg,
      ...rest
    } = props as InputProps<T>;

    const Component: ElementType = component || "input";
    const inputId = useId(id, "input");
    const affixClass = clsx(
      "absolute top-0 flex h-full w-9 items-center justify-center transition-colors",
      error
        ? "text-error dark:text-error-light"
        : "peer-focus:text-primary-600 dark:text-dark-300 dark:peer-focus:text-primary-500 text-gray-400",
    );
    const [newValue, setNewValue] = useState("");

    useEffect(() => {
      if (!formatNumber) return;
      if (value === undefined || value === null || value === "") {
        setNewValue("");
        return;
      }
      const num =
        typeof value === "number"
          ? value
          : Number(String(value).replace(/,/g, ""));
      setNewValue(Number.isNaN(num) ? "" : formatIndianNumber(num));
    }, [formatNumber, value]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawValue = e.target.value;

      // Remove commas
      rawValue = rawValue.replace(/,/g, "");

      // Allow digits, one dot, and minus
      rawValue = rawValue.replace(/[^\d.-]/g, "");

      // Keep only one minus at the beginning
      rawValue = rawValue.replace(/(?!^)-/g, "");

      // Keep only one decimal point
      const parts = rawValue.split(".");
      if (parts.length > 2) {
        rawValue = parts[0] + "." + parts.slice(1).join("");
      }

      // ✅ Limit to 2 decimal places
      if (rawValue.includes(".")) {
        const [integer, decimal] = rawValue.split(".");
        rawValue = `${integer}.${decimal.slice(0, 2)}`;
      }

      // Handle intermediate states
      const numericValue =
        rawValue === "" || rawValue === "-" || rawValue === "."
          ? ""
          : Number(rawValue);

      // Format for display
      const displayValue =
        formatNumber && numericValue !== ""
          ? formatIndianNumber(rawValue)
          : rawValue;

      setNewValue(displayValue);

      onChange?.({
        ...e,
        target: {
          ...e.target,
          value: rawValue === "" ? "" : Number(rawValue),
        },
      });
    };
    return (
      <div
        className={clsx(
          "input-root min-h-[58px]",
          isFull ? "w-full" : "w-auto",
          classNames.root
        )}
        {...rootProps}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={clsx("input-label   rounded-tr-sm", classNames.label)}
            {...labelProps}
          >
            <span className={clsx("input-label inline-flex items-center", classNames.labelText)}>
              {isPrice && <span className="text-black mr-1 text-[11px] font-bold">₹</span>}
              {label}
              {isRequired && (
                <span className="ms-0.5 !text-red-600" aria-hidden="true">
                  *
                </span>
              )}
              {isInfo && (
                <span className="relative group flex items-center">
                  <InformationCircleIcon className="w-4 h-4 text-black ml-2 cursor-pointer" />

                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                         w-max max-w-[220px] rounded-md bg-gray-900 px-3 py-2 
                         text-xs text-white shadow-lg 
                         opacity-0 scale-95 transition-all duration-200 
                         group-hover:opacity-100 group-hover:scale-100 pointer-events-none">
                    {isInfoMsg}
                  </span>
                </span>
              )}

            </span>
          </label>
        )}

        <div
          className={clsx(
            "input-wrapper relative",
            label && "mt-[3px]",
            classNames.wrapper,
          )}
        >
          <Component
            className={clsx(
              "rounded-sm text-[11px] text-black h-[34px]",
              suffix && "ltr:pr-9 rtl:pl-9",
              prefix && "ltr:pl-9 rtl:pr-9",
              !unstyled && [
                "form-input",
                error
                  ? "border-error dark:border-error-lighter"
                  : disabled
                    ? "bg-gray-100 dark:border-dark-500 dark:bg-dark-600 cursor-not-allowed border-gray-300 opacity-60 font-bold"
                    : "bg-white peer focus:border-primary-600 dark:border-dark-450 dark:hover:border-dark-400 dark:focus:border-primary-500 border-gray-300 hover:border-gray-400 autofill:shadow-[inset_0_0_0px_1000px_white] autofill:[-webkit-text-fill-color:#000]",
              ],
              className,
              classNames.input,
            )}
            type={type}
            id={inputId}
            ref={ref}
            disabled={disabled}
            {...rest}
            {...(formatNumber
              ? { value: newValue, onChange: handleNumberChange }
              : { value, onChange })}
          />
          {prefix && (
            <div
              className={clsx(
                "prefix ltr:left-0 rtl:right-0",
                affixClass,
                classNames.prefix,
              )}
            >
              {prefix}
            </div>
          )}
          {suffix && (
            <div
              className={clsx(
                "suffix ltr:right-0 rtl:left-0",
                affixClass,
                classNames.suffix,
              )}
            >
              {suffix}
            </div>
          )}
        </div>
        <InputErrorMsg
          when={!!error && typeof error !== "boolean"}
          className={clsx("mt-0.5 block max-w-full wrap-break-word whitespace-normal leading-3", classNames.error)}>
          {error}
        </InputErrorMsg>
        {(formatNumber) && (
          <p className="input-text-error  text-[10px]  mt-0.5 block max-w-full wrap-break-word whitespace-normal leading-3">
            {formatAmountWithWords2(newValue)}
          </p>
        )}
        {isMsg && (
          <p className="input-text-error  text-[10px]  mt-0.5 block max-w-full wrap-break-word whitespace-normal leading-3">
            {isMsg}
          </p>
        )}
        {description && (
          <span
            className={clsx(
              "input-description dark:text-dark-300 mt-1 text-xs text-gray-400",
              classNames.description,
            )}
          >
            {description}
          </span>
        )}
      </div>
    );
  },
);

type InputComponent = (<E extends ElementType = "input">(
  props: InputProps<E> & { ref?: PolymorphicRef<E> },
) => ReactNode) & { displayName?: string };

const Input = InputInner as InputComponent;
Input.displayName = "Input";

export { Input };

