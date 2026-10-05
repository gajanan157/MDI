import type { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import type { Option, SearchField } from "../CommonSearch";

export type OfficeBuckets = {
    parentOffices?: unknown[];
    childOffices?: unknown[];
    subChildOffices?: unknown[];
};

export type DropdownOptionsContext = {
    field: SearchField;
    watch: UseFormWatch<Record<string, unknown>>;
    insurerOfficeList: unknown[];
    officeBuckets: OfficeBuckets;
    insurerListNew: Option[];
    cityList: Array<{ city?: string; name?: string; stateName?: string }>;
    stateNameWatch?: string;
};

const NUMERIC_ALLOWED_KEYS = new Set([
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
]);

export function handleNumericKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // Allow shortcuts (Ctrl/Cmd+V, Shift+Insert) and navigation keys.
    if (
        NUMERIC_ALLOWED_KEYS.has(event.key) ||
        event.ctrlKey ||
        event.metaKey ||
        event.key === "Insert"
    ) {
        return;
    }
    if (!/^\d$/.test(event.key)) {
        event.preventDefault();
    }
}

/** Paste digits only — allow paste when clipboard has digits; onChange strips the rest. */
export function handleNumericPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text") ?? "";
    // Block only when there is nothing numeric to keep (e.g. letters-only clipboard).
    // Spaces/newlines from Excel are fine — register onChange strips non-digits.
    if (!stripNonDigits(pasted)) {
        event.preventDefault();
    }
}

/** Safe string for form values — never stringifies plain objects to "[object Object]". */
function asPlainText(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    return "";
}

export function stripNonDigits(value: unknown) {
    return asPlainText(value).replace(/\D/g, "");
}

export function resolveFieldLabel(field: SearchField, watch: UseFormWatch<Record<string, unknown>>) {
    if (field.dependsOn && field.getLabel) {
        const dependsOnValue = asPlainText(watch(field.dependsOn));
        return field.getLabel(dependsOnValue, watch);
    }
    return field.label;
}

function getDependentDropdownOptions(context: DropdownOptionsContext): Option[] | null {
    const { field, watch, insurerOfficeList, officeBuckets } = context;
    if (!field.dependsOn || !field.getOptions) return null;

    const dependsOnValue = asPlainText(watch(field.dependsOn));
    if (!dependsOnValue) return null;

    return field.getOptions(dependsOnValue, watch, insurerOfficeList, officeBuckets);
}

function mapCityListToOptions(
    cityList: Array<{ city?: string; name?: string; stateName?: string }>,
): Option[] {
    const seen = new Set<string>();
    const options: Option[] = [];

    for (const city of cityList ?? []) {
        const value = String(city.city || city.name || "").trim();
        if (!value) continue;
        const key = value.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        options.push({ label: value, value });
    }

    return options;
}

function resolveCityOptions(context: DropdownOptionsContext, fieldOptions: Option[]): Option[] {
    const { field, watch, cityList, stateNameWatch } = context;
    const cityOptionsFromRedux = mapCityListToOptions(cityList);

    if (field.dependsOn === "state") {
        const dependsOnValue = asPlainText(watch(field.dependsOn));
        if (!dependsOnValue) return [];
        return cityOptionsFromRedux.length > 0 ? cityOptionsFromRedux : fieldOptions;
    }

    if (stateNameWatch && cityOptionsFromRedux.length > 0) {
        return cityOptionsFromRedux;
    }
    if (cityOptionsFromRedux.length > 0) {
        return cityOptionsFromRedux;
    }
    return fieldOptions;
}

export function shouldRenderSearchField(
    field: SearchField,
    context: DropdownOptionsContext,
): boolean {
    if (!field.dependsOn) return true;

    const dependsOnValue = context.watch(field.dependsOn);
    if (!dependsOnValue) return false;

    if (field.dependsOnValues?.length) {
        const normalized = asPlainText(dependsOnValue).trim();
        if (!field.dependsOnValues.includes(normalized)) return false;
    }

    if (field.type === "text" || field.type === "date") return true;

    if (field.type === "dropdown" && field.getOptions) {
        const options = getDependentDropdownOptions(context);
        return Boolean(options?.length);
    }

    return true;
}

export function resolveDropdownOptions(context: DropdownOptionsContext): Option[] {
    const { field, insurerListNew } = context;

    if (field.name === "insurerId" || field.name === "insurerIds") {
        return insurerListNew;
    }

    const dependentOptions = getDependentDropdownOptions(context);
    let fieldOptions = dependentOptions ?? field.options ?? [];

    if (field.name === "city") {
        return resolveCityOptions(context, fieldOptions);
    }

    return fieldOptions;
}

export function shouldUseVirtualizedDropdown(field: SearchField) {
    return Boolean(field.useVirtualized || field.name === "requestType");
}

export function isInsurerFieldRequired(fieldName: string, pathname: string, requiredPaths: string[]) {
    return fieldName === "insurerId" && requiredPaths.includes(pathname);
}

export function getFieldErrorMessage(
    fieldName: string,
    errors: FieldErrors<Record<string, unknown>>,
) {
    const message = errors[fieldName]?.message;
    return typeof message === "string" ? message : "This field is required";
}

export type TextFieldRegisterOptions = Parameters<UseFormRegister<Record<string, unknown>>>[1];

export function buildTextFieldRegisterOptions(
    field: SearchField,
    register: UseFormRegister<Record<string, unknown>>,
) {
    return register(field.name, {
        ...field.rules,
        onChange: (event) => {
            if (field.numericOnly) {
                event.target.value = stripNonDigits(event.target.value);
            }
            field.rules?.onChange?.(event);
        },
    });
}

export function buildDateFieldRegisterOptions(
    field: SearchField,
    register: UseFormRegister<Record<string, unknown>>,
) {
    return register(field.name, field.rules);
}

const LG_COL_SPAN: Record<number, string> = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
};

export type SearchActionsLayout = {
    gridClass: string;
    /** True when the last filter row is already full and actions sit on the next row. */
    wraps: boolean;
};

/** Place Reset/Apply in leftover grid cells; wrap to a new row only when the last field row is full. */
export function getSearchActionsLayout(
    visibleFieldCount: number,
    lgColumns: 4 | 5,
): SearchActionsLayout {
    const count = Math.max(0, visibleFieldCount);
    const lgRemainder = count % lgColumns;
    const wraps = lgRemainder === 0;
    const lgSpan = wraps ? lgColumns : lgColumns - lgRemainder;
    const smSpan = count % 2 === 0 ? 2 : 1;

    return {
        wraps,
        gridClass: [
            "col-span-1",
            smSpan === 1 ? "sm:col-span-1" : "sm:col-span-2",
            LG_COL_SPAN[lgSpan] ?? "lg:col-span-4",
        ].join(" "),
    };
}
