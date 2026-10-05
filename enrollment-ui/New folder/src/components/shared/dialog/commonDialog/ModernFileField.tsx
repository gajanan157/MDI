import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type Ref,
  type RefCallback,
} from "react";
import clsx from "clsx";
import { ArrowUpTrayIcon, CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type ModernFileFieldProps = {
  label: string;
  isRequired?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  accept?: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Merged onto the outer control (border, radius, etc.) */
  className?: string;
  /**
   * When set, filename shown next to Browse (e.g. react-hook-form `Controller` value).
   * Omit for uncontrolled display using internal state only.
   */
  fileName?: string | null;
  /**
   * When a file is present, hide Browse and show filename + clear only.
   * Clears the native input value after calling this.
   */
  onClear?: () => void;
  /** Inline validation message; adds error border on the control. */
  error?: string;
  /** Helper under the control (e.g. size / format limits). */
  hint?: string;
};

function assignFileToInput(input: HTMLInputElement, file: File): void {
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
}

function mergeInputRef(
  node: HTMLInputElement | null,
  inputRef: Ref<HTMLInputElement> | undefined,
  localRef: { current: HTMLInputElement | null },
): void {
  localRef.current = node;
  if (typeof inputRef === "function") {
    inputRef(node);
    return;
  }
  if (inputRef) {
    (inputRef as { current: HTMLInputElement | null }).current = node;
  }
}

function resolveDisplayState(
  fileNameProp: string | null | undefined,
  internalFileName: string | null,
  disabled: boolean | undefined,
  onClear: (() => void) | undefined,
) {
  const isControlled = fileNameProp !== undefined;
  const displayFileName = isControlled ? fileNameProp : internalFileName;
  const showSelectedOnly =
    Boolean(displayFileName?.trim()) && typeof onClear === "function";
  return {
    isControlled,
    displayFileName,
    showSelectedOnly,
    canChooseFile: !disabled && !showSelectedOnly,
  };
}

function dropZoneClassName(
  error: string | undefined,
  isDragging: boolean,
  canChooseFile: boolean,
  className: string | undefined,
): string {
  let borderClass = "border-gray-300";
  if (error) {
    borderClass = "border-error";
  } else if (isDragging) {
    borderClass = "border-primary-500 bg-primary-50/60";
  }

  const interactionClass = canChooseFile
    ? "cursor-pointer hover:border-primary-400 hover:bg-primary-50/35"
    : "cursor-not-allowed border-gray-200 bg-gray-100 opacity-70";

  return clsx(
    "relative flex h-10 w-full items-center gap-2 overflow-hidden rounded-lg border-2 border-dashed bg-white px-2.5 transition-colors",
    borderClass,
    interactionClass,
    className,
  );
}

type SelectedFileChipProps = {
  id: string;
  accept?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  displayFileName: string | null | undefined;
  mergedRef: RefCallback<HTMLInputElement>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
};

function SelectedFileChip({
  id,
  accept,
  disabled,
  error,
  className,
  displayFileName,
  mergedRef,
  onChange,
  onClear,
}: Readonly<SelectedFileChipProps>) {
  return (
    <div
      className={clsx(
        "relative flex h-10 w-full items-stretch overflow-hidden rounded-lg border bg-white text-xs shadow-sm",
        error ? "border-error" : "border-gray-300",
        disabled && "cursor-not-allowed border-gray-200 bg-gray-100 opacity-70",
        className,
      )}
    >
      <input
        id={id}
        ref={mergedRef}
        type="file"
        accept={accept}
        disabled={disabled}
        tabIndex={-1}
        className="sr-only"
        onChange={onChange}
      />
      <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5">
        <span
          className="min-w-0 flex-1 truncate font-medium text-gray-900"
          title={displayFileName ?? undefined}
        >
          {displayFileName}
        </span>
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Remove file"
          disabled={disabled}
          onClick={onClear}
        >
          <XMarkIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

type DropZoneProps = {
  id: string;
  label: string;
  accept?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  canChooseFile: boolean;
  isDragging: boolean;
  mergedRef: RefCallback<HTMLInputElement>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onOpenPicker: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
};

function DropZone({
  id,
  label,
  accept,
  disabled,
  error,
  className,
  canChooseFile,
  isDragging,
  mergedRef,
  onChange,
  onOpenPicker,
  onDragOver,
  onDragLeave,
  onDrop,
}: Readonly<DropZoneProps>) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpenPicker();
  };

  return (
    <div
      className={dropZoneClassName(error, isDragging, canChooseFile, className)}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onOpenPicker}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={canChooseFile ? 0 : -1}
      aria-label={`${label}: drop file here or browse`}
    >
      <input
        id={id}
        ref={mergedRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={onChange}
        onClick={(event) => event.stopPropagation()}
      />
      <CloudArrowUpIcon className="h-4 w-4 shrink-0 text-primary-500" aria-hidden />
      <p className="min-w-0 flex-1 truncate text-left text-xs font-medium text-gray-800">
        Drop file here or <span className="text-primary-600">browse</span>
      </p>
      <span
        className={clsx(
          "inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold",
          disabled ? "bg-gray-200 text-gray-500" : "bg-blue-50 text-blue-700",
        )}
      >
        <ArrowUpTrayIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Browse
      </span>
    </div>
  );
}

function FieldMessages({
  error,
  hint,
}: Readonly<{ error?: string; hint?: string }>) {
  return (
    <>
      {error ? (
        <p className="mt-1 text-[11px] text-error" role="alert">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p className="mt-1 text-[11px] leading-snug text-gray-600">{hint}</p>
      ) : null}
    </>
  );
}

/**
 * File control with browse and drag-and-drop support.
 */
export function ModernFileField({
  label,
  isRequired,
  inputRef,
  accept,
  disabled,
  onChange,
  className,
  fileName: fileNameProp,
  onClear,
  error,
  hint,
}: Readonly<ModernFileFieldProps>) {
  const id = useId();
  const localInputRef = useRef<HTMLInputElement | null>(null);
  const [internalFileName, setInternalFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { isControlled, displayFileName, showSelectedOnly, canChooseFile } =
    resolveDisplayState(fileNameProp, internalFileName, disabled, onClear);

  const mergedRef = useCallback(
    (node: HTMLInputElement | null) => {
      mergeInputRef(node, inputRef, localInputRef);
    },
    [inputRef],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalFileName(e.target.files?.[0]?.name ?? null);
      }
      onChange(e);
    },
    [onChange, isControlled],
  );

  const emitFile = useCallback(
    (file: File | undefined) => {
      if (!file || !canChooseFile) return;
      const input = localInputRef.current;
      if (!input) return;
      assignFileToInput(input, file);
      if (!isControlled) {
        setInternalFileName(file.name);
      }
      onChange({
        target: input,
        currentTarget: input,
      } as ChangeEvent<HTMLInputElement>);
    },
    [canChooseFile, isControlled, onChange],
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalFileName(null);
    }
    onClear?.();
    if (localInputRef.current) {
      localInputRef.current.value = "";
    }
  }, [isControlled, onClear]);

  const openFilePicker = () => {
    if (!canChooseFile) return;
    localInputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canChooseFile) return;
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
    if (!canChooseFile) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    emitFile(event.dataTransfer.files?.[0]);
  };

  const control = showSelectedOnly ? (
    <SelectedFileChip
      id={id}
      accept={accept}
      disabled={disabled}
      error={error}
      className={className}
      displayFileName={displayFileName}
      mergedRef={mergedRef}
      onChange={handleChange}
      onClear={handleClear}
    />
  ) : (
    <DropZone
      id={id}
      label={label}
      accept={accept}
      disabled={disabled}
      error={error}
      className={className}
      canChooseFile={canChooseFile}
      isDragging={isDragging}
      mergedRef={mergedRef}
      onChange={handleChange}
      onOpenPicker={openFilePicker}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );

  return (
    <div className="flex w-full min-w-0 flex-col">
      <label htmlFor={id} className="input-label text-[14px] font-normal text-black">
        {label}
        {isRequired ? <span className="text-red-500"> *</span> : null}
      </label>
      <div className="relative mt-[3px]">
        {control}
        <FieldMessages error={error} hint={hint} />
      </div>
    </div>
  );
}
