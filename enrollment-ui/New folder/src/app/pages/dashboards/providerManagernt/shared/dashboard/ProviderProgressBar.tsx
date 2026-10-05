import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

type ProviderProgressBarProps = {
  value: number;
  max?: number;
  barClassName?: string;
  trackClassName?: string;
  heightClassName?: string;
  label?: ReactNode;
  style?: CSSProperties;
};

export function ProviderProgressBar({
  value,
  max = 100,
  barClassName = "bg-blue-600",
  trackClassName = "bg-slate-200",
  heightClassName = "h-1.5",
  label,
  style,
}: Readonly<ProviderProgressBarProps>) {
  const safeMax = max > 0 ? max : 100;
  const percent = Math.max(0, Math.min(100, (value / safeMax) * 100));

  return (
    <div className="w-full">
      {label}
      <div className={clsx("w-full overflow-hidden rounded", heightClassName, trackClassName)}>
        <div
          className={clsx("h-full rounded transition-all duration-500 ease-out", barClassName)}
          style={{ width: `${percent}%`, ...style }}
        />
      </div>
    </div>
  );
}
