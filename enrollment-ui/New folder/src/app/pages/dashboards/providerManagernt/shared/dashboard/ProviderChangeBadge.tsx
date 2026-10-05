import clsx from "clsx";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";

type ProviderChangeBadgeProps = {
  changePercent: number;
  variant?: "pill" | "plain";
};

export function ProviderChangeBadge({
  changePercent,
  variant = "pill",
}: Readonly<ProviderChangeBadgeProps>) {
  const isPositive = changePercent >= 0;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 text-[10px] font-semibold",
        variant === "pill" && "rounded px-1.5 py-0.5",
        isPositive
          ? variant === "pill"
            ? "bg-emerald-50 text-emerald-700"
            : "text-emerald-600"
          : variant === "pill"
            ? "bg-rose-50 text-rose-700"
            : "text-rose-600",
      )}
    >
      {isPositive ? (
        <ArrowUpIcon className="h-2.5 w-2.5" />
      ) : (
        <ArrowDownIcon className="h-2.5 w-2.5" />
      )}
      {isPositive ? "+" : ""}
      {changePercent}%
    </span>
  );
}
