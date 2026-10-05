import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input, Checkbox } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type FieldDataType =
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "arrayOfObjects"
    | "null";

export interface AddFieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddField: (fieldName: string, fieldValue: any, metadata?: any) => void;
    fieldPath: string; // Path where field will be added (e.g., "policy_metadata", "exclusions.permanent_exclusions[0]")
    sectionTitle?: string;
    existingFields?: string[]; // To prevent duplicate field names
}

const FIELD_TYPE_OPTIONS = [
    { label: "Text", value: "string", icon: "📄", description: "Single text value" },
    { label: "Number", value: "number", icon: "🔢", description: "Numeric value" },
    { label: "Yes/No", value: "boolean", icon: "✓", description: "True or false" },
    { label: "List", value: "array", icon: "📋", description: "List of values" },
    { label: "Table", value: "arrayOfObjects", icon: "📊", description: "Table with rows and columns" },
    { label: "Empty", value: "null", icon: "∅", description: "Empty value" },
    { label: "Group", value: "object", icon: "📦", description: "Group of related fields" },
];

const getDefaultValueForType = (type: FieldDataType): any => {
    switch (type) {
        case "string":
            return "";
        case "number":
            return 0;
        case "boolean":
            return false;
        case "object":
            return {};
        case "array":
            return [];
        case "arrayOfObjects":
            return [{}];
        case "null":
            return null;
        default:
            return "";
    }
};

export default function AddFieldModal({
    isOpen,
    onClose,
    onAddField,
    sectionTitle,
    existingFields = [],
}: Readonly<AddFieldModalProps>) {
    const { control, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            fieldName: "",
            fieldType: "string" as FieldDataType,
            initialValue: "",
            addMetadata: false,
            // Metadata fields
            sources: [] as Array<{ snippet?: string; page_number?: number; document_id?: string; clause_reference?: string }>,
            references: [] as Array<{ type: string; value: string; description?: string }>,
            limits: { min: "", max: "", unit: "", description: "" },
            conditions: [] as Array<{ condition_text: string; applies_when?: string; exceptions?: string[] }>,
            notes: [] as Array<{ note_type: string; content: string }>,
        },
    });

    const selectedFieldType = watch("fieldType") as FieldDataType;
    const addMetadata = watch("addMetadata");
    const sources = watch("sources");
    const references = watch("references");
    const conditions = watch("conditions");
    const notes = watch("notes");

    const [fieldNameError, setFieldNameError] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            reset();
            setFieldNameError("");
        }
    }, [isOpen, reset]);

    const handleAddField = () => {
        const fieldName = watch("fieldName").trim();

        // Validation
        if (!fieldName) {
            setFieldNameError("Field name is required");
            return;
        }

        // Check for duplicate field names
        if (existingFields.includes(fieldName)) {
            setFieldNameError(`Field "${fieldName}" already exists in this section`);
            return;
        }

        // Validate field name format (snake_case)
        if (!/^[a-z][a-z0-9_]*$/.test(fieldName)) {
            setFieldNameError("Field name must be in snake_case (lowercase letters, numbers, and underscores only, starting with a letter)");
            return;
        }

        setFieldNameError("");

        // Get default value based on type
        let fieldValue = getDefaultValueForType(selectedFieldType);

        // If initial value is provided and type is string/number, use it
        const initialValue = watch("initialValue");
        if (initialValue !== "" && (selectedFieldType === "string" || selectedFieldType === "number")) {
            if (selectedFieldType === "number") {
                fieldValue = Number.parseFloat(initialValue) || 0;
            } else {
                fieldValue = initialValue;
            }
        }

        // Build metadata if requested
        let metadata = undefined;
        if (addMetadata) {
            metadata = {
                sources: sources.filter(s => s.snippet || s.page_number),
                references: references.filter(r => r.value),
                limits: watch("limits"),
                conditions: conditions.filter(c => c.condition_text),
                notes: notes.filter(n => n.content),
            };
        }

        onAddField(fieldName, fieldValue, metadata);
        onClose();
    };

    const addSource = () => {
        const currentSources = watch("sources");
        setValue("sources", [...currentSources, { snippet: "", page_number: undefined, document_id: "", clause_reference: "" }]);
    };

    const removeSource = (index: number) => {
        const currentSources = watch("sources");
        setValue("sources", currentSources.filter((_, i) => i !== index));
    };

    const updateSource = (index: number, field: string, value: any) => {
        const currentSources = watch("sources");
        const updated = [...currentSources];
        updated[index] = { ...updated[index], [field]: value };
        setValue("sources", updated);
    };

    const addReference = () => {
        const currentReferences = watch("references");
        setValue("references", [...currentReferences, { type: "clause", value: "", description: "" }]);
    };

    const removeReference = (index: number) => {
        const currentReferences = watch("references");
        setValue("references", currentReferences.filter((_, i) => i !== index));
    };

    const updateReference = (index: number, field: string, value: any) => {
        const currentReferences = watch("references");
        const updated = [...currentReferences];
        updated[index] = { ...updated[index], [field]: value };
        setValue("references", updated);
    };

    const addCondition = () => {
        const currentConditions = watch("conditions");
        setValue("conditions", [...currentConditions, { condition_text: "", applies_when: "", exceptions: [] }]);
    };

    const removeCondition = (index: number) => {
        const currentConditions = watch("conditions");
        setValue("conditions", currentConditions.filter((_, i) => i !== index));
    };

    const updateCondition = (index: number, field: string, value: any) => {
        const currentConditions = watch("conditions");
        const updated = [...currentConditions];
        updated[index] = { ...updated[index], [field]: value };
        setValue("conditions", updated);
    };

    const addNote = () => {
        const currentNotes = watch("notes");
        setValue("notes", [...currentNotes, { note_type: "general", content: "" }]);
    };

    const removeNote = (index: number) => {
        const currentNotes = watch("notes");
        setValue("notes", currentNotes.filter((_, i) => i !== index));
    };

    const updateNote = (index: number, field: string, value: any) => {
        const currentNotes = watch("notes");
        const updated = [...currentNotes];
        updated[index] = { ...updated[index], [field]: value };
        setValue("notes", updated);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close dialog"
                className="fixed inset-0 z-50 cursor-default border-0 bg-black/50 p-0 backdrop-blur-sm transition-opacity"
                onClick={(e) => {
                    // Don't close if clicking on select dropdown
                    const target = e.target as HTMLElement;
                    if (target.tagName === "SELECT" || target.closest("select")) {
                        return;
                    }
                    onClose();
                }}
            />

            {/* Modal */}
            <div
                className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ zIndex: 9999 }}
            >
                <div
                    className="pointer-events-auto relative flex max-h-[70vh] w-full max-w-lg flex-col overflow-visible rounded-lg bg-white shadow-xl dark:bg-dark-800"
                    style={{ zIndex: 10000 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-dark-600">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Add New Field
                            </h3>
                            {sectionTitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Section: {sectionTitle}
                                </p>
                            )}
                            {/* <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Path: {fieldPath}
              </p> */}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 relative" style={{ zIndex: 10001 }}>
                        {/* Field Name */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Field Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                {...control.register("fieldName", {
                                    required: "Field name is required",
                                    pattern: {
                                        value: /^[a-z][a-z0-9_]*$/,
                                        message: "Must be snake_case (lowercase, numbers, underscores, start with letter)",
                                    },
                                })}
                                placeholder="e.g., policy_holder_email"
                                className="w-full text-sm"
                                autoFocus
                            />
                            {fieldNameError && (
                                <p className="mt-0.5 text-xs text-red-500">{fieldNameError}</p>
                            )}
                            {errors.fieldName && (
                                <p className="mt-0.5 text-xs text-red-500">{errors.fieldName.message as string}</p>
                            )}
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Use snake_case format (lowercase letters, numbers, underscores)
                            </p>
                        </div>

                        {/* Field Type - Dropdown */}
                        <div className="relative" style={{ zIndex: 10002, position: 'relative' }}>
                            <DropdownSelect
                                label="Column Type"
                                name="fieldType"
                                name_key="fieldType"
                                isRequired
                                control={control}
                                options={FIELD_TYPE_OPTIONS.map(option => ({
                                    label: `${option.icon} ${option.label} - ${option.description}`,
                                    value: option.value,
                                }))}
                                errors={errors.fieldType}
                                menuPlacement="auto"
                            />
                        </div>

                        {/* Initial Value (for string/number) */}
                        {(selectedFieldType === "string" || selectedFieldType === "number") && (
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Initial Value
                                </label>
                                <Input
                                    type={selectedFieldType === "number" ? "number" : "text"}
                                    {...control.register("initialValue")}
                                    placeholder={selectedFieldType === "number" ? "0" : "Enter initial value"}
                                    className="w-full text-sm"
                                />
                            </div>
                        )}

                        {/* Add Metadata Toggle */}
                        <Checkbox
                            id="addMetadata"
                            {...control.register("addMetadata")}
                            label="Add Extensibility Metadata (Sources, References, Limits, Conditions, Notes)"
                            className="h-3.5 w-3.5"
                        />

                        {/* Metadata Section */}
                        {addMetadata && (
                            <div className="space-y-3 border-t border-gray-200 dark:border-dark-600 pt-3">
                                <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                    Extensibility Metadata
                                </h4>

                                {/* Sources */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Sources (PDF References)
                                        </label>
                                        <Button
                                            type="button"
                                            onClick={addSource}
                                            variant="outlined"
                                            className="text-xs py-0.5 px-1.5 h-6"
                                        >
                                            <PlusIcon className="w-3 h-3 mr-0.5" />
                                            Add
                                        </Button>
                                    </div>
                                    {sources.map((source, index) => (
                                        <div key={index} className="mb-1.5 p-2 border border-gray-200 dark:border-dark-600 rounded-md">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Source {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSource(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Input
                                                    type="text"
                                                    placeholder="Snippet text"
                                                    value={source.snippet || ""}
                                                    onChange={(e) => updateSource(index, "snippet", e.target.value)}
                                                    className="text-sm"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Page number"
                                                    value={source.page_number || ""}
                                                    onChange={(e) => updateSource(index, "page_number", parseInt(e.target.value) || undefined)}
                                                    className="text-sm"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Document ID"
                                                    value={source.document_id || ""}
                                                    onChange={(e) => updateSource(index, "document_id", e.target.value)}
                                                    className="text-sm"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Clause reference (e.g., 3.1(a))"
                                                    value={source.clause_reference || ""}
                                                    onChange={(e) => updateSource(index, "clause_reference", e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* References */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            References
                                        </label>
                                        <Button
                                            type="button"
                                            onClick={addReference}
                                            variant="outlined"
                                            className="text-xs py-0.5 px-1.5 h-6"
                                        >
                                            <PlusIcon className="w-3 h-3 mr-0.5" />
                                            Add
                                        </Button>
                                    </div>
                                    {references.map((ref, index) => (
                                        <div key={index} className="mb-1.5 p-2 border border-gray-200 dark:border-dark-600 rounded-md">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Reference {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeReference(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Input
                                                    type="text"
                                                    placeholder="Type (clause, annexure, etc.)"
                                                    value={ref.type || ""}
                                                    onChange={(e) => updateReference(index, "type", e.target.value)}
                                                    className="text-sm"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Value"
                                                    value={ref.value || ""}
                                                    onChange={(e) => updateReference(index, "value", e.target.value)}
                                                    className="text-sm"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Description"
                                                    value={ref.description || ""}
                                                    onChange={(e) => updateReference(index, "description", e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Limits */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                        Limits
                                    </label>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <Input
                                            type="text"
                                            placeholder="Min"
                                            {...control.register("limits.min")}
                                            className="text-sm"
                                        />
                                        <Input
                                            type="text"
                                            placeholder="Max"
                                            {...control.register("limits.max")}
                                            className="text-sm"
                                        />
                                        <Input
                                            type="text"
                                            placeholder="Unit"
                                            {...control.register("limits.unit")}
                                            className="text-sm"
                                        />
                                        <Input
                                            type="text"
                                            placeholder="Description"
                                            {...control.register("limits.description")}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Conditions */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Conditions
                                        </label>
                                        <Button
                                            type="button"
                                            onClick={addCondition}
                                            variant="outlined"
                                            className="text-xs py-0.5 px-1.5 h-6"
                                        >
                                            <PlusIcon className="w-3 h-3 mr-0.5" />
                                            Add
                                        </Button>
                                    </div>
                                    {conditions.map((condition, index) => (
                                        <div key={index} className="mb-1.5 p-2 border border-gray-200 dark:border-dark-600 rounded-md">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Condition {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCondition(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Input
                                                    type="text"
                                                    placeholder="Condition text"
                                                    value={condition.condition_text || ""}
                                                    onChange={(e) => updateCondition(index, "condition_text", e.target.value)}
                                                    className="text-sm"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Applies when"
                                                    value={condition.applies_when || ""}
                                                    onChange={(e) => updateCondition(index, "applies_when", e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Notes */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Notes
                                        </label>
                                        <Button
                                            type="button"
                                            onClick={addNote}
                                            variant="outlined"
                                            className="text-xs py-0.5 px-1.5 h-6"
                                        >
                                            <PlusIcon className="w-3 h-3 mr-0.5" />
                                            Add
                                        </Button>
                                    </div>
                                    {notes.map((note, index) => (
                                        <div key={index} className="mb-1.5 p-2 border border-gray-200 dark:border-dark-600 rounded-md">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Note {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNote(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="space-y-1.5">
                                                <DropdownSelect
                                                    label="Note Type"
                                                    name={`notes.${index}.note_type`}
                                                    name_key={`notes.${index}.note_type`}
                                                    control={control}
                                                    options={[
                                                        { label: "General", value: "general" },
                                                        { label: "Important", value: "important" },
                                                        { label: "Warning", value: "warning" },
                                                        { label: "Info", value: "info" },
                                                        { label: "Maker", value: "maker" },
                                                        { label: "Checker", value: "checker" },
                                                    ]}
                                                    menuPlacement="auto"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Note content"
                                                    value={note.content || ""}
                                                    onChange={(e) => updateNote(index, "content", e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-gray-200 dark:border-dark-600">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outlined"
                            className="text-xs px-3 py-1.5 h-7"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddField}
                            color="primary"
                            className="text-xs px-3 py-1.5 h-7"
                        >
                            Add Field
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

