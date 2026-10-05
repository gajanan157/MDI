import type { ComponentType, SVGProps } from "react";
import clsx from "clsx";

type ProviderStatChipProps = {
  count: number;
  label: string;
  toneClass: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  active?: boolean;
  onClick?: () => void;
  title?: string;
};

export function ProviderStatChip({
  count,
  label,
  toneClass,
  icon: Icon,
  active = false,
  onClick,
  title,
}: Readonly<ProviderStatChipProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex w-auto shrink-0 cursor-pointer items-center gap-1 rounded px-2 py-1.5 transition-colors",
        toneClass,
      )}
      title={title ?? `${count} ${label}`}
      aria-pressed={active}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden /> : null}
      <span className="text-[12px] font-bold tabular-nums">{count}</span>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}
