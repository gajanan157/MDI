import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
  type RefCallback,
} from "react";
import clsx from "clsx";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const CHOOSE_FILE_LABEL_CLASS = "input-label block font-medium text-black";

type Translate = ReturnType<typeof useTranslation>["t"];

function resolveChooseFileButtonLabel(
  uploading: boolean,
  clearing: boolean,
  t: Translate,
): string {
  if (uploading) return t("providerMaster.chooseFile.uploading");
  if (clearing) return t("providerMaster.chooseFile.removing");
  return t("providerMaster.chooseFile.browseButton");
}

function assignFileToInput(input: HTMLInputElement, file: File): void {
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
}

function mergeInputRef(
  node: HTMLInputElement | null,
  inputRef: Ref<HTMLInputElement | null> | undefined,
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

function resolveFieldState(
  disabled: boolean,
  uploading: boolean,
  clearing: boolean,
  displayName: string | null | undefined,
  onClear: (() => void) | undefined,
) {
  const trimmedName = String(displayName ?? "").trim();
  const isDisabled = disabled || uploading || clearing;
  const lockUntilClear = Boolean(trimmedName) && typeof onClear === "function";
  return {
    trimmedName,
    lockUntilClear,
    canChooseFile: !isDisabled && !lockUntilClear,
    showClear: lockUntilClear && !disabled,
  };
}

function dropZoneClassName(
  error: string | undefined,
  isDragging: boolean,
  canChooseFile: boolean,
): string {
  let borderClass = "border-slate-300 bg-slate-50/80";
  if (error) {
    borderClass = "border-red-500";
  } else if (isDragging) {
    borderClass = "border-primary-500 bg-primary-50/60";
  }

  const interactionClass = canChooseFile
    ? "cursor-pointer hover:border-primary-400 hover:bg-primary-50/35"
    : "cursor-default opacity-70";

  return clsx(
    "mt-[3px] flex h-9 w-full items-center gap-2 overflow-hidden rounded-md border-2 border-dashed px-2 transition-colors",
    borderClass,
    interactionClass,
  );
}

function SelectedFileName({
  name,
  viewUrl,
}: Readonly<{ name: string; viewUrl?: string }>) {
  if (viewUrl) {
    return (
      <a
        href={viewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 truncate text-[11px] font-medium text-primary-700 underline hover:text-primary-800"
        title={name}
      >
        {name}
      </a>
    );
  }

  return (
    <span className="min-w-0 flex-1 truncate text-[11px] text-slate-600" title={name}>
      {name}
    </span>
  );
}

type HiddenFileInputProps = {
  setMergedRef: RefCallback<HTMLInputElement>;
  accept?: string;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  stopClickPropagation?: boolean;
};

function HiddenFileInput({
  setMergedRef,
  accept,
  disabled,
  onChange,
  stopClickPropagation = false,
}: Readonly<HiddenFileInputProps>) {
  return (
    <input
      ref={setMergedRef}
      type="file"
      accept={accept}
      className="hidden"
      disabled={disabled}
      onChange={onChange}
      onClick={stopClickPropagation ? (event) => event.stopPropagation() : undefined}
    />
  );
}

type SelectedFileChipProps = {
  label: string;
  accept?: string;
  trimmedName: string;
  viewUrl?: string;
  error?: string;
  showClear: boolean;
  uploading: boolean;
  clearing: boolean;
  setMergedRef: RefCallback<HTMLInputElement>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearClick: (event: MouseEvent<HTMLButtonElement>) => void;
  t: Translate;
};

function SelectedFileChip({
  label,
  accept,
  trimmedName,
  viewUrl,
  error,
  showClear,
  uploading,
  clearing,
  setMergedRef,
  onChange,
  onClearClick,
  t,
}: Readonly<SelectedFileChipProps>) {
  return (
    <div
      className={clsx(
        "mt-[3px] flex h-8 w-full items-center overflow-hidden rounded-md border bg-white",
        error ? "border-red-500" : "border-gray-300",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-2 text-xs text-slate-700">
        <SelectedFileName name={trimmedName} viewUrl={viewUrl} />
        <HiddenFileInput
          setMergedRef={setMergedRef}
          accept={accept}
          disabled
          onChange={onChange}
        />
      </div>
      {showClear ? (
        <button
          type="button"
          className="mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
          aria-label={t("providerMaster.chooseFile.remove", { label })}
          title={t("providerMaster.chooseFile.remove", { label })}
          disabled={uploading || clearing}
          onClick={onClearClick}
        >
          <XMarkIcon className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

type DropZoneProps = {
  label: string;
  accept?: string;
  error?: string;
  uploading: boolean;
  clearing: boolean;
  canChooseFile: boolean;
  isDragging: boolean;
  setMergedRef: RefCallback<HTMLInputElement>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenPicker: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  t: Translate;
};

function DropZone({
  label,
  accept,
  error,
  uploading,
  clearing,
  canChooseFile,
  isDragging,
  setMergedRef,
  onChange,
  onOpenPicker,
  onDragOver,
  onDragLeave,
  onDrop,
  t,
}: Readonly<DropZoneProps>) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpenPicker();
  };

  return (
    <div
      className={dropZoneClassName(error, isDragging, canChooseFile)}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onOpenPicker}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={canChooseFile ? 0 : -1}
      aria-label={t("providerMaster.chooseFile.dropOrBrowseAria", { label })}
    >
      <HiddenFileInput
        setMergedRef={setMergedRef}
        accept={accept}
        disabled={!canChooseFile}
        onChange={onChange}
        stopClickPropagation
      />
      <CloudArrowUpIcon className="h-4 w-4 shrink-0 text-primary-500" aria-hidden />
      <p className="min-w-0 flex-1 truncate text-left text-[11px] font-medium text-slate-700">
        {t("providerMaster.chooseFile.dropFileHere")}{" "}
        <span className="text-primary-600">{t("providerMaster.chooseFile.browse")}</span>
      </p>
      <span className="inline-flex h-6 shrink-0 items-center rounded border border-slate-300 bg-white px-2 text-[10px] font-medium leading-none text-slate-700">
        {resolveChooseFileButtonLabel(uploading, clearing, t)}
      </span>
    </div>
  );
}

export type ChooseFileFieldProps = {
  label: string;
  accept?: string;
  disabled?: boolean;
  uploading?: boolean;
  clearing?: boolean;
  displayName?: string | null;
  viewUrl?: string;
  error?: string;
  isRequired?: boolean;
  labelClassName?: string;
  inputRef?: Ref<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
};

/** Browse + drag-and-drop file control used across provider Supporting Document uploads. */
export function ChooseFileField({
  label,
  accept,
  disabled = false,
  uploading = false,
  clearing = false,
  displayName,
  viewUrl,
  error,
  isRequired = false,
  labelClassName = CHOOSE_FILE_LABEL_CLASS,
  inputRef,
  onChange,
  onClear,
}: Readonly<ChooseFileFieldProps>) {
  const { t } = useTranslation();
  const localInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { trimmedName, lockUntilClear, canChooseFile, showClear } = resolveFieldState(
    disabled,
    uploading,
    clearing,
    displayName,
    onClear,
  );

  const setMergedRef = useCallback(
    (node: HTMLInputElement | null) => {
      mergeInputRef(node, inputRef, localInputRef);
    },
    [inputRef],
  );

  const emitFile = useCallback(
    (file: File | undefined) => {
      if (!file || !canChooseFile) return;
      const input = localInputRef.current;
      if (!input) return;
      assignFileToInput(input, file);
      onChange({
        target: input,
        currentTarget: input,
      } as ChangeEvent<HTMLInputElement>);
    },
    [canChooseFile, onChange],
  );

  const openFilePicker = () => {
    if (!canChooseFile) return;
    localInputRef.current?.click();
  };

  const handleClearClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClear?.();
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

  const control = lockUntilClear ? (
    <SelectedFileChip
      label={label}
      accept={accept}
      trimmedName={trimmedName}
      viewUrl={viewUrl}
      error={error}
      showClear={showClear}
      uploading={uploading}
      clearing={clearing}
      setMergedRef={setMergedRef}
      onChange={onChange}
      onClearClick={handleClearClick}
      t={t}
    />
  ) : (
    <DropZone
      label={label}
      accept={accept}
      error={error}
      uploading={uploading}
      clearing={clearing}
      canChooseFile={canChooseFile}
      isDragging={isDragging}
      setMergedRef={setMergedRef}
      onChange={onChange}
      onOpenPicker={openFilePicker}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      t={t}
    />
  );

  return (
    <div className="input-root min-h-0 min-w-0">
      <label className={labelClassName}>
        {label}
        {isRequired ? <span className="text-red-500"> *</span> : null}
      </label>
      {control}
      {error ? (
        <p className="mt-1 text-[11px] leading-4 text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
