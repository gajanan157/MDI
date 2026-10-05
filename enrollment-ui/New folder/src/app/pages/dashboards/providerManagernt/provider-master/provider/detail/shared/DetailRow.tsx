import React from "react";

/** Kept for existing call sites; provider view rows now use the enrollment-style neutral row treatment. */
export type DetailRowTone = "default" | "slate";

/** Shown in view mode when `hideWhenEmpty` is false and the value is missing. */
export const DETAIL_ROW_EMPTY_PLACEHOLDER = "-";

interface DetailRowProps {
  label: string;
  value?: string | number;
  render?: (v: string) => React.ReactNode;
  /** Tighter padding and type for dense blocks (e.g. certificate cards). */
  compact?: boolean;
  /** Label above value (default: label left, value right). */
  layout?: "inline" | "stacked";
  /**
   * When `layout` is `inline`: `trailing` keeps the value right-aligned (default).
   * `leading` places the value just after a fixed-width label column (left-aligned text).
   */
  valuePosition?: "trailing" | "leading";
  /** Color palette only; spacing and font sizes unchanged. */
  tone?: DetailRowTone;
  /** Hide the whole label/value row when the value is missing. */
  hideWhenEmpty?: boolean;
}

export function ProviderSectionCard({
  title,
  children,
  className = "",
  titleClassName = "text-sm",
  fillHeight = false,
  isExpanded = false,
}: Readonly<{
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  /** Stretch card to fill a flex column slot (paired column layout). */
  fillHeight?: boolean;
  /** When true, section grows with content (see more expanded). */
  isExpanded?: boolean;
}>) {
  return (
    <section
      data-expanded={isExpanded ? true : undefined}
      className={`rounded-lg border border-slate-200 bg-white ${isExpanded ? "overflow-visible" : "overflow-hidden"} ${fillHeight ? "flex h-full min-h-0 flex-col" : ""} ${className}`}
    >
      <div
        className={`flex shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-3 py-1.5 font-semibold text-slate-800 before:h-3.5 before:w-0.5 before:shrink-0 before:rounded-full before:bg-teal-600 before:content-[''] [&>*]:min-w-0 [&>*]:flex-1 ${titleClassName}`}
      >
        {title}
      </div>
      <div className={fillHeight ? "flex min-h-0 flex-1 flex-col" : undefined}>{children}</div>
    </section>
  );
}

export function DetailRow({
  label,
  value,
  render,
  compact,
  layout = "inline",
  hideWhenEmpty = false,
}: Readonly<DetailRowProps>) {
  const isEmpty =
    value == null ||
    (typeof value === "string" &&
      ["", "—", DETAIL_ROW_EMPTY_PLACEHOLDER].includes(value.trim()));

  if (hideWhenEmpty && isEmpty) return null;

  let display: React.ReactNode;
  if (render) {
    display = render(String(value ?? ""));
  } else if (isEmpty) {
    display = DETAIL_ROW_EMPTY_PLACEHOLDER;
  } else {
    display = value;
  }

  const rowTextSize = compact
    ? "text-[11px] leading-tight"
    : "text-xs leading-snug";

  if (layout === "stacked") {
    return (
      <div className={`border-b last:border-0 ${rowTextSize}`}>
        <dt className="px-3 pt-1 font-medium text-slate-500">
          {label}
        </dt>
        <dd className="min-w-0 break-words px-3 pb-1 font-medium text-slate-900">
          {display}
        </dd>
      </div>
    );
  }

  return (
    <div className={`flex flex-row items-stretch border-b border-slate-100 last:border-0 ${rowTextSize}`}>
      <dt
        className={
          compact
            ? "w-[42%] shrink-0 px-1 py-1 font-medium leading-tight text-slate-500 sm:w-[40%]"
            : "w-[42%] shrink-0 px-1 py-1.5 font-medium leading-tight text-slate-500 sm:w-[40%]"
        }
      >
        {label}
      </dt>
      <dd
        className={
          compact
            ? "w-[58%] min-w-0 break-words px-1 py-1 font-medium leading-tight text-slate-900 sm:w-[60%]"
            : "w-[58%] min-w-0 break-words px-1 py-1.5 font-medium leading-tight text-slate-900 sm:w-[60%]"
        }
      >
        {display}
      </dd>
    </div>
  );
}
