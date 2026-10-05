import type { ReactNode } from "react";
import clsx from "clsx";
import { humanDiscountLabel } from "../utils/discountDisplayLabel";

type ChipTone = "sky" | "violet" | "emerald" | "rose" | "slate" | "blue" | "teal";

const CHIP_TONE_CLASS: Record<ChipTone, string> = {
  sky: "border-sky-200 bg-sky-50 text-sky-800",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  teal: "border-teal-200 bg-teal-50 text-teal-800",
};

export function DiscountViewChip({
  children,
  tone = "slate",
  title,
  onRemove,
  removeLabel,
}: Readonly<{
  children: ReactNode;
  tone?: ChipTone;
  title?: string;
  onRemove?: () => void;
  removeLabel?: string;
}>) {
  return (
    <span
      title={title}
      className={clsx(
        "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4",
        CHIP_TONE_CLASS[tone],
      )}
    >
      <span className="min-w-0 truncate">{children}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label={removeLabel || title || "Remove"}
          title={removeLabel || title || "Remove"}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="shrink-0 cursor-pointer leading-none text-current opacity-70 hover:opacity-100"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}

export type DiscountViewChipItem = {
  id?: string;
  name: string;
  detail?: string;
};

export function DiscountViewChipList({
  items,
  tone,
  emptyLabel = "—",
  getTitle,
  onRemove,
  removeLabelFor,
}: Readonly<{
  items: DiscountViewChipItem[];
  tone: ChipTone;
  emptyLabel?: string;
  getTitle?: (item: DiscountViewChipItem) => string;
  onRemove?: (item: DiscountViewChipItem) => void;
  removeLabelFor?: (item: DiscountViewChipItem) => string;
}>) {
  const visible = items
    .map((item) => ({
      ...item,
      name: humanDiscountLabel(item.name),
      detail: humanDiscountLabel(item.detail),
    }))
    .filter((item) => item.name);

  if (visible.length === 0) {
    return <span className="text-xs text-gray-400">{emptyLabel}</span>;
  }

  return (
    <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pr-0.5">
      {visible.map((item, index) => {
        const title = getTitle?.(item) || (item.detail ? `${item.name} (${item.detail})` : item.name);
        return (
          <DiscountViewChip
            key={`${item.id ?? item.name}-${item.detail ?? ""}-${index}`}
            tone={tone}
            title={title}
            onRemove={onRemove ? () => onRemove(item) : undefined}
            removeLabel={removeLabelFor?.(item)}
          >
            {item.name}
            {item.detail ? (
              <span className="ml-1 font-normal opacity-70">· {item.detail}</span>
            ) : null}
          </DiscountViewChip>
        );
      })}
    </div>
  );
}

export function DiscountViewField({
  label,
  children,
  className,
}: Readonly<{
  label: string;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className={clsx("min-w-0", className)}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="text-xs text-gray-900">{children}</div>
    </div>
  );
}
