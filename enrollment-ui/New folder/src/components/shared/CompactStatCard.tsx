import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export type StatCardColor =
  | "blue"
  | "purple"
  | "emerald"
  | "green"
  | "amber"
  | "orange"
  | "rose"
  | "red"
  | "indigo"
  | "cyan"
  | "slate"
  | "gray";

export type StatCardVariant =
  | "left-accent" // Compact card with left-colored border stripe
  | "bordered"    // Outlined card, highlights border when active
  | "solid"       // Fully colored background with white text
  | "interactive" // Card with bottom action link/chevron

export interface CompactStatCardProps {
  /** Metric title or label */
  title: React.ReactNode;
  /** Primary metric value/number */
  count: number | string | undefined | null;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional descriptive subtitle or subtext */
  subtitle?: React.ReactNode;
  /** Optional badge/pill text or node */
  badge?: React.ReactNode;
  /** Visual variant style */
  variant?: StatCardVariant;
  /** Pre-configured semantic color theme */
  color?: StatCardColor | string;
  /** Active selected state (useful for filterable cards) */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Action label (used with variant="interactive") */
  action?: string;
  /** Custom height class (e.g. "h-9", "h-11", "h-auto") */
  height?: string;
  /** Custom width class (e.g. "w-full", "w-48") */
  width?: string;
  /** Additional container classes to override or append */
  className?: string;
  /** Additional title classes */
  titleClassName?: string;
  /** Additional count/value classes */
  countClassName?: string;
}

const COLOR_MAP: Record<
  string,
  {
    border: string;
    borderActive: string;
    bgActive: string;
    text: string;
    iconBg: string;
    solidBg: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  blue: {
    border: "border-l-blue-600",
    borderActive: "border-blue-500",
    bgActive: "bg-blue-50/70",
    text: "text-blue-700",
    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    solidBg: "bg-blue-600 text-white",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    badgeText: "text-blue-700",
  },
  purple: {
    border: "border-l-purple-600",
    borderActive: "border-purple-500",
    bgActive: "bg-purple-50/70",
    text: "text-purple-700",
    iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    solidBg: "bg-purple-700 text-white",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    badgeText: "text-purple-700",
  },
  emerald: {
    border: "border-l-emerald-600",
    borderActive: "border-emerald-500",
    bgActive: "bg-emerald-50/70",
    text: "text-emerald-700",
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    solidBg: "bg-emerald-600 text-white",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeText: "text-emerald-700",
  },
  green: {
    border: "border-l-green-600",
    borderActive: "border-green-500",
    bgActive: "bg-green-50/70",
    text: "text-green-700",
    iconBg: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
    solidBg: "bg-green-700 text-white",
    badgeBg: "bg-green-50 text-green-700 border-green-200",
    badgeText: "text-green-700",
  },
  amber: {
    border: "border-l-amber-500",
    borderActive: "border-amber-500",
    bgActive: "bg-amber-50/70",
    text: "text-amber-700",
    iconBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    solidBg: "bg-amber-600 text-white",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    badgeText: "text-amber-700",
  },
  orange: {
    border: "border-l-orange-500",
    borderActive: "border-orange-500",
    bgActive: "bg-orange-50/70",
    text: "text-orange-700",
    iconBg: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    solidBg: "bg-orange-600 text-white",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    badgeText: "text-orange-700",
  },
  rose: {
    border: "border-l-rose-600",
    borderActive: "border-rose-500",
    bgActive: "bg-rose-50/70",
    text: "text-rose-700",
    iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
    solidBg: "bg-rose-600 text-white",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    badgeText: "text-rose-700",
  },
  red: {
    border: "border-l-red-600",
    borderActive: "border-red-500",
    bgActive: "bg-red-50/70",
    text: "text-red-700",
    iconBg: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    solidBg: "bg-red-600 text-white",
    badgeBg: "bg-red-50 text-red-700 border-red-200",
    badgeText: "text-red-700",
  },
  indigo: {
    border: "border-l-indigo-600",
    borderActive: "border-indigo-500",
    bgActive: "bg-indigo-50/70",
    text: "text-indigo-700",
    iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
    solidBg: "bg-indigo-700 text-white",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badgeText: "text-indigo-700",
  },
  cyan: {
    border: "border-l-cyan-600",
    borderActive: "border-cyan-500",
    bgActive: "bg-cyan-50/70",
    text: "text-cyan-700",
    iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
    solidBg: "bg-cyan-600 text-white",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    badgeText: "text-cyan-700",
  },
  slate: {
    border: "border-l-slate-600",
    borderActive: "border-slate-500",
    bgActive: "bg-slate-100",
    text: "text-slate-700",
    iconBg: "bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-300",
    solidBg: "bg-slate-700 text-white",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    badgeText: "text-slate-700",
  },
  gray: {
    border: "border-l-gray-600",
    borderActive: "border-gray-500",
    bgActive: "bg-gray-100",
    text: "text-gray-700",
    iconBg: "bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-300",
    solidBg: "bg-gray-700 text-white",
    badgeBg: "bg-gray-100 text-gray-700 border-gray-200",
    badgeText: "text-gray-700",
  },
};

/**
 * Universal B2B Compact Stat Card component.
 * Maintains consistent sizing, typography, and density across all modules
 * with customizable height, width, color, and styling.
 */
export default function CompactStatCard({
  title,
  count,
  icon,
  subtitle,
  badge,
  variant = "left-accent",
  color = "blue",
  active = false,
  onClick,
  action,
  height,
  width = "w-full",
  className = "",
  titleClassName = "",
  countClassName = "",
}: CompactStatCardProps) {
  const displayCount = count !== undefined && count !== null ? count : 0;
  const isClickable = Boolean(onClick);

  // Normalize color key
  let colorKey = "blue";
  if (COLOR_MAP[color]) {
    colorKey = color;
  } else {
    // Check if color contains keyword like "purple", "green", etc.
    const matched = Object.keys(COLOR_MAP).find((k) =>
      color.toLowerCase().includes(k)
    );
    if (matched) colorKey = matched;
  }
  const theme = COLOR_MAP[colorKey];

  // 1. SOLID VARIANT (e.g. MemberStats badges)
  if (variant === "solid") {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-between rounded-lg px-2.5 shadow-2xs transition-all ${
          theme.solidBg
        } ${height || "h-9"} ${width} ${
          isClickable ? "cursor-pointer hover:opacity-90 active:scale-[0.99]" : ""
        } ${className}`}
      >
        <div className="min-w-0 pr-1">
          <p
            className={`text-[11px] font-semibold tracking-wide truncate ${titleClassName}`}
          >
            {title}
          </p>
        </div>
        <p className={`text-xs font-bold leading-none ${countClassName}`}>
          {typeof displayCount === "number"
            ? displayCount.toLocaleString()
            : displayCount}
        </p>
      </div>
    );
  }

  // 2. BORDERED VARIANT (e.g. CorporateInward filterable cards)
  if (variant === "bordered") {
    return (
      <div
        onClick={onClick}
        className={`rounded-lg border px-2.5 py-1.5 transition-all shadow-2xs ${
          active
            ? `${theme.borderActive} ${theme.bgActive}`
            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-dark-600 dark:bg-dark-800"
        } ${height || "h-auto"} ${width} ${
          isClickable ? "cursor-pointer" : "cursor-default"
        } ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div
              className={`truncate text-[10px] font-semibold uppercase tracking-wider ${
                active ? theme.text : "text-slate-500 dark:text-slate-400"
              } ${titleClassName}`}
            >
              {title}
            </div>
            <div
              className={`mt-0.5 text-base font-bold leading-none ${
                active ? theme.text : "text-slate-900 dark:text-white"
              } ${countClassName}`}
            >
              {typeof displayCount === "number"
                ? displayCount.toLocaleString()
                : displayCount}
            </div>
          </div>

          {icon && (
            <div
              className={`rounded-md p-1.5 shrink-0 ${
                active
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40"
                  : "bg-slate-100 text-slate-500 dark:bg-dark-700 dark:text-slate-400"
              }`}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. INTERACTIVE VARIANT (e.g. Processor & QC workload cards)
  if (variant === "interactive") {
    return (
      <div
        onClick={onClick}
        className={`group relative flex flex-col justify-between rounded-xl border p-3 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${
          active
            ? `${theme.borderActive} ${theme.bgActive}`
            : "border-slate-200 bg-white dark:border-dark-600 dark:bg-dark-800"
        } ${height || "h-auto"} ${width} ${
          isClickable ? "cursor-pointer" : ""
        } ${className}`}
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {icon && (
                <div
                  className={`flex h-6.5 w-6.5 items-center justify-center rounded-lg ${theme.iconBg}`}
                >
                  {icon}
                </div>
              )}
              <h4
                className={`text-xs font-bold tracking-tight text-slate-800 dark:text-white ${titleClassName}`}
              >
                {title}
              </h4>
            </div>
            {badge && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${theme.badgeBg}`}
              >
                {badge}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white ${countClassName}`}
            >
              {typeof displayCount === "number"
                ? displayCount.toLocaleString()
                : displayCount}
            </span>
            {subtitle && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {action && (
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 dark:border-dark-700 pt-2 text-[11px] font-semibold">
            <span className={theme.text}>{action}</span>
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        )}
      </div>
    );
  }

  // 4. DEFAULT: LEFT-ACCENT VARIANT (High density, B2B optimized)
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-2xs border-l-4 ${
        theme.border
      } dark:border-dark-600 dark:bg-dark-800 ${height || "h-auto"} ${width} ${
        isClickable ? "cursor-pointer hover:bg-slate-50/70" : ""
      } ${className}`}
    >
      <div className="min-w-0 pr-2">
        <p
          className={`text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate ${titleClassName}`}
        >
          {title}
        </p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <p
            className={`text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white ${countClassName}`}
          >
            {typeof displayCount === "number"
              ? displayCount.toLocaleString()
              : displayCount}
          </p>
          {badge && (
            <span
              className={`rounded px-1.5 py-0.2 text-[9px] font-semibold border ${theme.badgeBg}`}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>
        )}
      </div>

      {icon && (
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${theme.iconBg}`}
        >
          {icon}
        </div>
      )}
    </div>
  );
}

export { CompactStatCard };
