import { useState, type DragEvent } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import {
  useWatch,
  type Control,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";
import { Textarea } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import { SOC_REMARK_CATEGORY_OPTIONS } from "../dummyData";

export type EffectiveRemarkSupportingRequired = {
  effectiveFrom: boolean;
  effectiveTo: boolean;
  remarkCategory: boolean;
  remark: boolean;
  supportingDocs: boolean;
};

const DEFAULT_REQUIRED: EffectiveRemarkSupportingRequired = {
  effectiveFrom: false,
  effectiveTo: false,
  remarkCategory: false,
  remark: false,
  supportingDocs: false,
};

function resolveEffectiveRemarkInputClass(compact: boolean, embedded: boolean): string {
  if (compact && embedded) return "h-7 w-full text-[11px]";
  if (compact) return "h-8 w-full text-xs";
  return "h-8 w-full text-sm";
}

function resolveEffectiveRemarkTextareaRows(embedded: boolean, compact: boolean): number {
  if (embedded) return 2;
  if (compact) return 3;
  return 3;
}

function SupportingDocsDropZone({
  onFileChange,
}: Readonly<{
  onFileChange: (file: File | null) => void;
}>) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    onFileChange(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div
      className={`flex min-h-[4rem] w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border-2 border-dashed bg-white px-2 py-2 text-[10px] transition-colors sm:min-h-[4.5rem] ${
        isDragging
          ? "border-primary-500 bg-primary-50/60"
          : "border-gray-300 hover:border-primary-400 hover:bg-primary-50/30"
      }`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(event) => {
        const input = event.currentTarget.querySelector("input[type=file]");
        if (input instanceof HTMLInputElement) input.click();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const input = event.currentTarget.querySelector("input[type=file]");
          if (input instanceof HTMLInputElement) input.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Drop supporting document here or browse"
    >
      <CloudArrowUpIcon className="h-4 w-4 shrink-0 text-primary-500" />
      <span>
        Drop file here or <span className="text-primary-600">browse</span>
      </span>
      <span className="text-[9px] text-gray-500">.pdf, .doc, .docx</span>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onClick={(event) => event.stopPropagation()}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

type Props<T extends FieldValues> = {
  control: Control<T>;
  register: UseFormRegister<T>;
  effectiveToError?: string;
  /** Per-field required flags — red asterisk on label when true */
  required?: Partial<EffectiveRemarkSupportingRequired>;
  supportingFile: File | null;
  onSupportingFileChange: (file: File | null) => void;
  remarkCategoryOptions?: { value: string; label: string }[];
  compact?: boolean;
  embedded?: boolean;
  /** Hide the inner "Effective dates & remarks" title when the parent supplies a card header */
  hideSectionTitle?: boolean;
  className?: string;
};

export function EffectiveRemarkSupportingSection<T extends FieldValues>({
  control,
  register,
  effectiveToError,
  required: requiredProp,
  supportingFile,
  onSupportingFileChange,
  remarkCategoryOptions = SOC_REMARK_CATEGORY_OPTIONS,
  compact = false,
  embedded = false,
  hideSectionTitle = false,
  className = "",
}: Props<T>) {
  const req: EffectiveRemarkSupportingRequired = {
    ...DEFAULT_REQUIRED,
    ...requiredProp,
  };

  const effectiveFromWatch = useWatch({ control, name: "effectiveFrom" as never }) as string | undefined;
  const effectiveToWatch = useWatch({ control, name: "effectiveTo" as never }) as string | undefined;
  const effectiveToMin = effectiveFromWatch?.trim()
    ? String(effectiveFromWatch).trim().slice(0, 10)
    : undefined;
  const effectiveFromMax = effectiveToWatch?.trim()
    ? String(effectiveToWatch).trim().slice(0, 10)
    : undefined;
  const inputCls = resolveEffectiveRemarkInputClass(compact, embedded);
  const remarkTextareaRows = resolveEffectiveRemarkTextareaRows(embedded, compact);
  const embeddedDdCls = embedded
    ? "[&_.react-select__control]:min-h-[32px] [&_.react-select__control]:text-xs [&_label]:text-[10px]"
    : "";

  return (
    <div
      className={`space-y-2 rounded-md border border-gray-200/90 bg-gray-50/40 p-2 ${className}`}
    >
      {!hideSectionTitle && (
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600">
          Effective dates & remarks
        </p>
      )}

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 ${
          embedded ? "gap-x-2 gap-y-1.5" : "gap-2"
        }`}
      >
        <ProviderDatePicker
          label="Effective from"
          control={control}
          name={"effectiveFrom" as never}
          isRequired={req.effectiveFrom}
          max={effectiveFromMax}
          className={inputCls}
        />
        <ProviderDatePicker
          label="Effective to"
          control={control}
          name={"effectiveTo" as never}
          isRequired={req.effectiveTo}
          min={effectiveToMin}
          error={effectiveToError}
          className={inputCls}
        />
        <DropdownSelect
          control={control}
          name="remarkCategory"
          name_key="remarkCategory"
          label="Remark category"
          options={remarkCategoryOptions}
          isRequired={req.remarkCategory}
          className={inputCls}
          formClassName={embeddedDdCls}
        />
        <Textarea
          label={
            <span className="inline-flex items-center gap-0.5">
              Remark
              {req.remark && <span className="text-red-600">*</span>}
            </span>
          }
          placeholder="Add remarks..."
          rows={remarkTextareaRows}
          {...register("remarks" as never)}
          className={`min-h-[3.25rem] w-full min-w-0 resize-y sm:min-h-[3.5rem] xl:min-h-[4.5rem] ${
            compact || embedded ? "text-xs" : "text-sm"
          }`}
        />
      </div>

      <div className="min-w-0">
        <label className="mb-0.5 block text-[10px] font-medium text-gray-700">
          Supporting docs
          {req.supportingDocs && <span className="text-red-600"> *</span>}
        </label>
        {!supportingFile ? (
          <SupportingDocsDropZone onFileChange={onSupportingFileChange} />
        ) : (
          <div className="flex min-h-[4rem] flex-col justify-center gap-2 rounded-md border border-green-200 bg-green-50/80 px-2 py-1.5 sm:min-h-[4.5rem]">
            <p
              className="min-w-0 truncate text-[11px] font-medium text-gray-800"
              title={supportingFile.name}
            >
              {supportingFile.name}
            </p>
            <button
              type="button"
              className="self-start text-[10px] font-medium text-red-600 hover:underline"
              onClick={() => onSupportingFileChange(null)}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
