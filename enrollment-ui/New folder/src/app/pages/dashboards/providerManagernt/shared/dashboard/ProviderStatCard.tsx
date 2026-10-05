import clsx from "clsx";
import {
  ArrowTrendingUpIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, ReactNode, SVGProps } from "react";

export type ProviderStatCardTheme = {
  cardBg: string;
  iconBg: string;
  iconColor: string;
  accent: string;
  sparkline: string;
  topBar?: string;
  border?: string;
  shadow?: string;
  activeBorder?: string;
  activeRing?: string;
  activeShadow?: string;
  activeBg?: string;
  hoverGlow?: string;
};

type ProviderStatCardProps = {
  title: string;
  count: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  theme: ProviderStatCardTheme;
  activeBorderClass?: string;
  sparkline?: number[];
  delta?: { value: number; up?: boolean };
  deltaLabel?: string;
  active?: boolean;
  onClick?: () => void;
  footer?: ReactNode;
};

function MiniSparkline({ data, color }: Readonly<{ data: number[]; color: string }>) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 12 - ((value - min) / range) * 9;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 14" className="h-3 w-11 shrink-0" preserveAspectRatio="none" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

export function ProviderStatCard({
  title,
  count,
  icon: Icon,
  theme,
  activeBorderClass = "border-primary-600",
  sparkline = [],
  delta,
  deltaLabel,
  active = false,
  onClick,
  footer,
}: Readonly<ProviderStatCardProps>) {
  const resolvedFooter =
    footer ??
    (delta && deltaLabel ? (
      <span className="flex min-w-0 items-center gap-0.5 truncate text-tiny leading-tight text-gray-500 dark:text-dark-300">
        {delta.value === 0 ? (
          <MinusIcon className="size-3 shrink-0 text-gray-400 dark:text-dark-400" aria-hidden="true" />
        ) : (
          <ArrowTrendingUpIcon className="size-3 shrink-0 text-success" aria-hidden="true" />
        )}
        <span className="font-medium text-gray-700 dark:text-dark-200">{delta.value}</span>
        <span className="truncate">{deltaLabel}</span>
      </span>
    ) : null);

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative h-full w-full cursor-pointer rounded-lg text-left select-none transition-all duration-200 overflow-hidden",
        "px-2.5 py-1.5",
        active
          ? clsx(
              "border-2",
              theme.activeBorder || activeBorderClass || "border-primary-600",
              theme.activeShadow || "shadow-soft dark:shadow-none",
              theme.activeRing || "ring-2 ring-primary-400/40",
              theme.activeBg || "bg-gradient-to-b from-primary-50/70 via-white to-white dark:from-primary-950/30 dark:via-dark-700 dark:to-dark-700",
              "-translate-y-1 z-10",
            )
          : clsx(
              "border border-gray-200 bg-white shadow-xs dark:border-dark-600 dark:bg-dark-700",
              "hover:border-gray-300 hover:shadow-soft hover:-translate-y-0.5 dark:hover:border-dark-500",
            ),
      )}
    >
      {/* Top accent indicator bar for active card */}
      {active && (
        <span
          className={clsx(
            "absolute top-0 inset-x-0 h-[3px]",
            theme.topBar || "bg-primary-600",
          )}
          aria-hidden="true"
        />
      )}

      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={clsx(
              "flex size-5 shrink-0 items-center justify-center rounded-md shadow-2xs transition-transform duration-150",
              active && "scale-105",
              theme.iconBg,
            )}
          >
            <Icon className={clsx("size-3", theme.iconColor)} aria-hidden="true" />
          </span>
          <span
            className={clsx(
              "min-w-0 text-tiny leading-tight sm:text-tiny-plus transition-colors",
              active ? "font-bold text-gray-900 dark:text-dark-50" : "font-medium text-gray-700 dark:text-dark-200",
            )}
            title={title}
          >
            {title}
          </span>
          {active && (
            <span
              className={clsx(
                "size-1.5 shrink-0 rounded-full animate-pulse",
                theme.topBar || "bg-primary-600",
              )}
              aria-hidden="true"
            />
          )}
        </div>
        <MiniSparkline data={sparkline} color={theme.sparkline} />
      </div>

      <div className="mt-1 flex items-end justify-between gap-1">
        <span
          className={clsx(
            "text-lg font-bold tabular-nums leading-none",
            theme.accent,
          )}
        >
          {count.toLocaleString()}
        </span>
        {resolvedFooter}
      </div>
    </button>
  );
}
