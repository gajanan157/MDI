import type { ComponentType, SVGProps } from "react";
import clsx from "clsx";

type BulkIcMappingInwardStatCardProps = {
  title: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export function BulkIcMappingInwardStatCard({
  title,
  count,
  active = false,
  onClick,
  icon: Icon,
}: Readonly<BulkIcMappingInwardStatCardProps>) {
  const isClickable = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={clsx(
        "w-full rounded-lg border p-2 text-left transition",
        active
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-200 bg-white shadow-sm hover:bg-gray-50",
        isClickable ? "cursor-pointer" : "cursor-default",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div
            className={clsx(
              "text-[10px] font-semibold",
              active ? "text-blue-700" : "text-gray-700",
            )}
          >
            {title}
          </div>
          <div
            className={clsx(
              "mt-0.5 text-lg font-semibold tabular-nums",
              active ? "text-blue-800" : "text-gray-900",
            )}
          >
            {count}
          </div>
        </div>
        <div
          className={clsx(
            "shrink-0 rounded-full p-1.5",
            active ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </button>
  );
}
