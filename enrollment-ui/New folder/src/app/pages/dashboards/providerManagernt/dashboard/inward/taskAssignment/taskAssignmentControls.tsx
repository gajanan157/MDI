import { useEffect } from "react";
import { useForm } from "react-hook-form";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { PROVIDER_DATE_PICKER_FORMAT } from "../../../shared/dateFormat";
import { ProviderDatePicker } from "../../../shared/ProviderDatePicker";
import type { InwardTaskPriority } from "./providerInwardTaskTypes";
import { TASK_PRIORITY_OPTIONS, TASK_PRIORITY_STYLES } from "./taskAssignmentConfig";

type TaskUserDropdownOption = {
    label: string;
    value: string;
};

type TaskUserDropdownProps = {
    name: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: TaskUserDropdownOption[];
    disabled?: boolean;
    className?: string;
    formClassName?: string;
    placeholder?: string;
    title?: string;
};

export function TaskUserDropdown({
    name,
    label,
    value,
    onChange,
    options,
    disabled = false,
    className = "h-[36px] rounded-[10px]",
    formClassName = "[&_.react-select__control]:min-h-[36px] [&_.react-select__control]:text-xs",
    placeholder = "Select user",
    title,
}: Readonly<TaskUserDropdownProps>) {
    const { control, setValue } = useForm<Record<string, string>>({
        defaultValues: { [name]: value },
    });

    useEffect(() => {
        setValue(name, value);
    }, [name, setValue, value]);

    return (
        <div title={title}>
            <DropdownSelect
                name={name}
                control={control}
                label={label}
                options={options}
                disabled={disabled}
                className={className}
                formClassName={formClassName}
                defaultValue={placeholder}
                onChange={(next) => onChange(String(next ?? ""))}
            />
        </div>
    );
}

type TaskDueDateFieldProps = {
    name?: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    variant?: "toolbar" | "grid";
    placeholder?: string;
    title?: string;
    /** Keep calendar in overlay DOM — use inside dialogs/drawers with backdrop close. */
    disablePortal?: boolean;
};

/** Same picker UI as enrolment `DateInput` (`dd MMM yyyy`). */
export function TaskDueDateField({
    name = "dueDate",
    value,
    onChange,
    disabled = false,
    variant = "toolbar",
    placeholder = "Select date",
    title,
    disablePortal = false,
}: Readonly<TaskDueDateFieldProps>) {
    const isGrid = variant === "grid";

    return (
        <div
            className="task-due-date-field w-full min-w-0 overflow-hidden [&_.input-root]:min-h-0"
            title={title}
        >
            <ProviderDatePicker
                name={name}
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                dateFormat={PROVIDER_DATE_PICKER_FORMAT}
                onChange={(event) => onChange(event.target.value)}
                className={isGrid ? "h-7 px-1.5 text-[10px]" : undefined}
                disablePortal={disablePortal}
                stopGridEventPropagation={isGrid}
            />
        </div>
    );
}

type TaskPrioritySelectProps = {
    name?: string;
    value: InwardTaskPriority | "";
    onChange: (value: InwardTaskPriority | "") => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    compact?: boolean;
    allowEmpty?: boolean;
};

const COMPACT_DROPDOWN_CLASS =
    "h-7 min-w-[88px] rounded-md [&_.react-select__control]:min-h-[28px] [&_.react-select__control]:cursor-pointer [&_.react-select__control]:border-slate-300 [&_.react-select__control]:text-[10px]";

const DROPDOWN_CLASS =
    "h-8 min-w-[96px] rounded-md [&_.react-select__control]:min-h-[32px] [&_.react-select__control]:cursor-pointer [&_.react-select__control]:border-slate-300 [&_.react-select__control]:text-[11px]";

export function TaskPrioritySelect({
    name = "taskPriority",
    value,
    onChange,
    disabled = false,
    placeholder,
    className = "",
    compact = false,
    allowEmpty = false,
}: Readonly<TaskPrioritySelectProps>) {
    const options = [
        ...(allowEmpty && placeholder ? [{ label: placeholder, value: "" }] : []),
        ...TASK_PRIORITY_OPTIONS.map((priority) => ({
            label: `${TASK_PRIORITY_STYLES[priority].icon} ${TASK_PRIORITY_STYLES[priority].label}`,
            value: priority,
        })),
    ];

    return (
        <TaskUserDropdown
            name={name}
            value={value}
            onChange={(next) => onChange(next as InwardTaskPriority | "")}
            options={options}
            disabled={disabled}
            placeholder={placeholder}
            className={`${compact ? COMPACT_DROPDOWN_CLASS : DROPDOWN_CLASS} ${className}`}
            formClassName="[&_.dropdown-label]:hidden"
        />
    );
}
