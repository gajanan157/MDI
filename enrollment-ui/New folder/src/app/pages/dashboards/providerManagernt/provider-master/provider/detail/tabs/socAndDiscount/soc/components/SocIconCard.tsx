import clsx from "clsx";
import type { ReactNode } from "react";

type SocIconCardProps = {
  title: string;
  icon: ReactNode;
  iconWrapClassName: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/** SOC detail row card with colored circular icon in the header (reference layout). */
export function SocIconCard({
  title,
  icon,
  iconWrapClassName,
  children,
  className,
  bodyClassName,
}: Readonly<SocIconCardProps>) {
  return (
    <div
      className={clsx(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-1.5 border-b border-slate-200/80 px-2 py-1">
        <div
          className={clsx(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            iconWrapClassName,
          )}
        >
          {icon}
        </div>
        <h3 className="text-[11px] font-semibold text-slate-900">{title}</h3>
      </div>
      <div className={clsx("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </div>
  );
}
