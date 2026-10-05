import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

export type ProviderFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type ProviderFilterChipGroupProps = {
  chips: ProviderFilterChip[];
  label?: ReactNode;
  clearAllLabel?: string;
  onClearAll?: () => void;
  className?: string;
};

export function ProviderFilterChipGroup({
  chips,
  label,
  clearAllLabel,
  onClearAll,
  className = "flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-1",
}: Readonly<ProviderFilterChipGroupProps>) {
  if (chips.length === 0) return null;

  return (
    <div className={className}>
      {label}
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
        >
          {chip.label}
          <XMarkIcon className="h-3 w-3" />
        </button>
      ))}
      {onClearAll && clearAllLabel ? (
        <button
          type="button"
          onClick={onClearAll}
          className="text-[10px] font-medium text-slate-500 hover:text-slate-700"
        >
          {clearAllLabel}
        </button>
      ) : null}
    </div>
  );
}
