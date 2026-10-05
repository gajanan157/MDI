import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import {
  normalizeChipValues,
  type ToolbarMetaChipTone,
} from "./toolbarMetaChip.constants";

const chipShellClass =
  "inline-flex max-w-[11rem] items-center gap-1.5 rounded border px-1.5 py-0.5 shadow-sm";

const chipShellProminentClass =
  "inline-flex max-w-[13rem] items-center gap-2 rounded-md border px-2.5 py-1.5 shadow-md";

function formatMetaChipDisplayValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";
  if (!trimmed.includes("_")) return trimmed;

  return trimmed
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const STACKED_VISIBLE_COUNT = 2;

function MetaChipStackedValues({
  values,
  expanded,
  valueTextClass,
}: Readonly<{
  values: string[];
  expanded: boolean;
  valueTextClass: string;
}>) {
  const formatted = values.map(formatMetaChipDisplayValue);
  const hasMore = formatted.length > STACKED_VISIBLE_COUNT;
  const visible =
    expanded || !hasMore ? formatted : formatted.slice(0, STACKED_VISIBLE_COUNT);

  return (
    <span className="flex flex-col gap-0.5">
      {visible.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`block min-w-0 break-words leading-snug text-gray-900 ${valueTextClass}`}
          title={item}
        >
          {item}
        </span>
      ))}
    </span>
  );
}
function renderMetaChipValue(
  values: string[],
  mode: "compact" | "stacked" = "compact",
  expanded = false,
  valueTextClass = "text-[10px] font-semibold leading-tight",
): ReactNode {
  if (values.length === 0) return null;

  const formatted = values.map(formatMetaChipDisplayValue);

  if (mode === "stacked") {
    return (
      <MetaChipStackedValues
        values={values}
        expanded={expanded}
        valueTextClass={valueTextClass}
      />
    );
  }
  if (values.length === 1) {
    return (
      <span
        className={`block min-w-0 truncate text-gray-900 ${valueTextClass}`}
        title={formatted[0]}
      >
        {formatted[0]}
      </span>
    );
  }

  const summary = `${formatted[0]} +${values.length - 1}`;

  return (
    <span
      className={`block min-w-0 truncate text-gray-900 ${valueTextClass}`}
      title={formatted.join(", ")}
    >
      {summary}
    </span>
  );
}

type ToolbarMetaChipProps = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value?: string | string[];
  tone: ToolbarMetaChipTone;
  title?: string;
  hideValue?: boolean;
  className?: string;
  /** When false, label keeps its source casing instead of `uppercase`. */
  labelUppercase?: boolean;
  /** `stacked` lists values vertically with expand after two; `compact` truncates or summarizes with +N. */
  valueMode?: "compact" | "stacked";
  /** Larger padding/type for summary-bar emphasis. */
  size?: "default" | "prominent";
};

function ToolbarMetaChipContent({
  icon: Icon,
  label,
  value = "",
  tone,
  title,
  hideValue = false,
  labelUppercase = true,
  valueMode = "compact",
  size = "default",
  expanded = false,
}: ToolbarMetaChipProps & { expanded?: boolean }) {
  const values = hideValue ? [] : normalizeChipValues(value);
  if (!hideValue && values.length === 0) return null;

  const displayTitle =
    title ??
    (values.length > 0
      ? `${label}: ${values.map(formatMetaChipDisplayValue).join(", ")}`
      : label);
  const isProminent = size === "prominent";
  const valueTextClass = isProminent
    ? "text-[11px] font-bold leading-tight"
    : "text-[10px] font-semibold leading-tight";

  return (
    <>
      <span
        className={`flex shrink-0 items-center justify-center rounded ${
          isProminent ? "h-5 w-5" : "h-4 w-4"
        } ${tone.iconWrap}`}
      >
        <Icon className={isProminent ? "h-3 w-3" : "h-2.5 w-2.5"} aria-hidden />
      </span>
      <span
        className={`min-w-0 flex-1 ${hideValue ? "flex min-h-[1.375rem] items-center" : ""}`}
      >
        <span
          className={`block font-bold leading-tight ${
            isProminent ? "text-[9px]" : "text-[8px]"
          } ${
            labelUppercase ? "uppercase tracking-wide" : "normal-case tracking-normal"
          } ${tone.label}`}
        >
          {label}
        </span>
        {!hideValue ? (
          <span className="mt-px block">
            {renderMetaChipValue(values, valueMode, expanded, valueTextClass)}
          </span>
        ) : null}
      </span>
      <span className="sr-only">{displayTitle}</span>
    </>
  );
}

export function ToolbarMetaChip({
  icon,
  label,
  value = "",
  tone,
  title,
  hideValue = false,
  className = "",
  labelUppercase = true,
  valueMode = "compact",
  size = "default",
}: Readonly<ToolbarMetaChipProps>) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const values = hideValue ? [] : normalizeChipValues(value);
  const formatted = values.map(formatMetaChipDisplayValue);
  const valuesKey = formatted.join("\u0001");
  const hasStackedExpand = valueMode === "stacked" && values.length > STACKED_VISIBLE_COUNT;
  const expandLabel = expanded
    ? t("providerMaster.agreement.seeLess")
    : t("providerMaster.agreement.seeMore");

  useEffect(() => {
    setExpanded(false);
  }, [valuesKey]);

  if (!hideValue && values.length === 0) return null;

  const displayTitle =
    title ??
    (values.length > 0
      ? `${label}: ${values.map(formatMetaChipDisplayValue).join(", ")}`
      : label);

  const baseShell =
    size === "prominent" ? chipShellProminentClass : chipShellClass;

  const shellClass = (() => {
    if (valueMode !== "stacked") return baseShell;
    return baseShell
      .replace("max-w-[11rem]", "max-w-[min(100%,16rem)]")
      .replace("max-w-[13rem]", "max-w-[min(100%,16rem)]")
      .replace("items-center", "items-start")
      .concat(hasStackedExpand ? " relative overflow-visible pr-4" : " overflow-visible");
  })();

  return (
    <div
      className={`${shellClass} ${tone.wrapper} ${className}`}
      title={displayTitle}
    >
      {hasStackedExpand ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          title={expandLabel}
          aria-label={expandLabel}
          aria-expanded={expanded}
          className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded text-violet-700 hover:bg-violet-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-400"
        >
          {expanded ? (
            <ChevronUpIcon className="h-3 w-3" aria-hidden />
          ) : (
            <ChevronDownIcon className="h-3 w-3" aria-hidden />
          )}
        </button>
      ) : null}
      <ToolbarMetaChipContent
        icon={icon}
        label={label}
        value={value}
        tone={tone}
        title={title}
        hideValue={hideValue}
        labelUppercase={labelUppercase}
        valueMode={valueMode}
        size={size}
        expanded={expanded}
      />
    </div>
  );
}
type ToolbarMetaChipButtonProps = ToolbarMetaChipProps & {
  onClick: () => void;
  ariaLabel: string;
};

export function ToolbarMetaChipButton({
  icon,
  label,
  value = "",
  tone,
  title,
  hideValue = false,
  className = "",
  labelUppercase = true,
  onClick,
  ariaLabel,
}: Readonly<ToolbarMetaChipButtonProps>) {
  const values = hideValue ? [] : normalizeChipValues(value);
  if (!hideValue && values.length === 0) return null;

  const displayTitle =
    title ??
    (values.length > 0
      ? `${label}: ${values.map(formatMetaChipDisplayValue).join(", ")}`
      : label);

  return (
    <button
      type="button"
      onClick={onClick}
      title={displayTitle}
      aria-label={ariaLabel}
      className={`${chipShellClass} ${tone.wrapper} ${className} cursor-pointer transition-colors hover:brightness-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-400`}
    >
      <ToolbarMetaChipContent
        icon={icon}
        label={label}
        value={value}
        tone={tone}
        title={title}
        hideValue={hideValue}
        labelUppercase={labelUppercase}
      />
    </button>
  );
}
