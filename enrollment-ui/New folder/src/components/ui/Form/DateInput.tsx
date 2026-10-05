import clsx from "clsx";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useId } from "@/hooks";
import { InputErrorMsg } from "./InputErrorMsg";
type DateInputProps = {
    label?: React.ReactNode;
    value?: any;
    onChange?: (date: Date | null) => void;
    error?: React.ReactNode;
    disabled?: boolean;
    placeholder?: string;
    isRequired?: boolean;
    description?: string;
    className?: string;
    id?: string;
    minDate?: any;
    isInfo?: boolean;
    isInfoMsg?: string;
    /** Keep calendar in DOM tree � required inside modals so outside-click does not close them. */
    disablePortal?: boolean;
    customInput?: React.ReactElement;
};
export const formatDateForDatePicker = (date: Date | null) => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const add365Days = (date: Date | string) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 364);
  return newDate;
};
export function DateInput({
        label,
        value,
        onChange,
        error,
        disabled,
        placeholder = "Select Date",
        description,
        className,
        id,
        isRequired,
        isInfo,
        isInfoMsg,
        disablePortal = false,
        customInput,
        minDate,
    }: Readonly<DateInputProps>) {

        const inputId = useId(id, "date");

        return (

            <div className="input-root min-h-[58px]">

                {label && (
                    <label htmlFor={inputId} className="input-label">

                        <span className="flex items-center">

                            {label}

                            {isRequired && (
                              <span className="ms-0.5 text-red-600" aria-hidden="true">
                                *
                              </span>
                            )}

                            {isInfo && (
                                <span className="relative group">

                                    <InformationCircleIcon className="w-4 h-4 ml-2" />

                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white rounded px-2 py-1 text-xs whitespace-nowrap">
                                        {isInfoMsg}
                                    </span>

                                </span>
                            )}

                        </span>

                    </label>
                )}

                <DatePicker
                    customInput={customInput}
                    selected={
                        value
                            ? value instanceof Date
                                ? value
                                : new Date(value)
                            : null
                    }
                    onChange={onChange}
                    dateFormat="dd MMM yyyy"
                    placeholderText={placeholder}
                    disabled={disabled}
                    id={inputId}
                    // ref={ref}
                    {...(disablePortal ? {} : { portalId: "root" })}
                    popperClassName="!z-[9999]"

                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    minDate={minDate}
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown

                    className={clsx(
                        "rounded-sm text-[11px] h-[34px] w-full form-input",
                        error
                            ? "border-error dark:border-error-lighter"
                            : disabled
                                ? "bg-gray-100 dark:border-dark-500 dark:bg-dark-600 cursor-not-allowed border-gray-300 opacity-60 font-bold"
                                : "bg-white peer focus:border-primary-600 dark:border-dark-450 dark:hover:border-dark-400 dark:focus:border-primary-500 border-gray-300 hover:border-gray-400 autofill:shadow-[inset_0_0_0px_1000px_white] autofill:[-webkit-text-fill-color:#000]",
                        className,
                    )}
                 
                />

                <InputErrorMsg when={!!error}>
                    {error}
                </InputErrorMsg>

                {description && (
                    <div className="text-xs text-gray-400 mt-1">
                        {description}
                    </div>
                )}

            </div>

        );
    }