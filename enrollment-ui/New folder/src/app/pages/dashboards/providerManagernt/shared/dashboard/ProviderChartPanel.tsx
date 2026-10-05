import type { ReactNode } from "react";
import clsx from "clsx";

export const PROVIDER_CHART_PANEL_CLASS =
  "rounded-lg bg-white border border-gray-200 shadow-soft transition-all duration-200 dark:bg-dark-700 dark:border-dark-600 dark:shadow-none";

type ProviderChartPanelProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  fillHeight?: boolean;
  hideTitle?: boolean;
};

export function ProviderChartPanel({
  title,
  subtitle,
  action,
  children,
  className = "",
  fillHeight = false,
  hideTitle = false,
}: Readonly<ProviderChartPanelProps>) {
  return (
    <div
      className={clsx(
        PROVIDER_CHART_PANEL_CLASS,
        "p-2.5",
        fillHeight && "flex h-full min-h-0 flex-col",
        className,
      )}
    >
      {hideTitle ? (
        <div className="mb-0.5 h-[14px] shrink-0" aria-hidden="true" />
      ) : (
        <div className="mb-0.5 flex shrink-0 items-start justify-between gap-1">
          <div className="min-w-0">
            <h3 className="truncate text-xs-plus font-medium leading-tight text-gray-900 dark:text-dark-50">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 text-tiny-plus text-gray-500 dark:text-dark-300">{subtitle}</p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      <div className={clsx(fillHeight && "flex min-h-0 flex-1 flex-col")}>
        {children}
      </div>
    </div>
  );
}
