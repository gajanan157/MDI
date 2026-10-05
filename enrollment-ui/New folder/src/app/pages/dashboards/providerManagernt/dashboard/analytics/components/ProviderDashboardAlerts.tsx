import clsx from "clsx";
import { formatToDDMMMYYYY } from "../../../shared/dateFormat";
import { ProviderChartPanel } from "../../../shared/dashboard";
import type { ProviderDashboardAlert } from "../analyticsTypes";

type ProviderDashboardAlertsProps = {
  alerts: ProviderDashboardAlert[];
};

const ALERT_STYLES = {
  critical: {
    border: "border-rose-200 dark:border-rose-900/50",
    bg: "bg-rose-50/70 dark:bg-rose-950/20",
    text: "text-rose-900 dark:text-rose-200",
    badge: "bg-rose-500",
    tagBg: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  },
  warning: {
    border: "border-amber-200 dark:border-amber-900/50",
    bg: "bg-amber-50/70 dark:bg-amber-950/20",
    text: "text-amber-900 dark:text-amber-200",
    badge: "bg-amber-500",
    tagBg: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  info: {
    border: "border-sky-200 dark:border-sky-900/50",
    bg: "bg-sky-50/70 dark:bg-sky-950/20",
    text: "text-sky-900 dark:text-sky-200",
    badge: "bg-sky-500",
    tagBg: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  },
} as const;

export function ProviderDashboardAlerts({
  alerts,
}: Readonly<ProviderDashboardAlertsProps>) {
  return (
    <ProviderChartPanel
      title="Compliance & Operational Alerts"
      subtitle="Critical risks requiring immediate network action"
      className="p-2!"
    >
      <ul className="space-y-1.5">
        {alerts.map((alert) => {
          const styles = ALERT_STYLES[alert.severity] || ALERT_STYLES.info;
          return (
            <li
              key={alert.id}
              className={clsx(
                "flex items-start gap-2 rounded-lg border px-2.5 py-1.5 transition-colors",
                styles.border,
                styles.bg,
              )}
            >
              <span
                className={clsx(
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  styles.badge,
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {alert.tag && (
                    <span
                      className={clsx(
                        "rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider",
                        styles.tagBg,
                      )}
                    >
                      {alert.tag}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {formatToDDMMMYYYY(alert.timestamp)}
                  </span>
                </div>
                <p className={clsx("mt-0.5 text-xs font-medium leading-snug", styles.text)}>
                  {alert.message}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </ProviderChartPanel>
  );
}
