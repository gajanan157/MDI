import { forwardRef, useImperativeHandle, useState } from "react";
import type { ICellEditorParams } from "ag-grid-community";
import clsx from "clsx";
import { INFRASTRUCTURE_OPERATIONAL_STATUS_OPTIONS } from "../utils/infrastructureCategoryFieldKeys";

function statusOptionClass(status: string, selected: boolean): string {
  if (status === "Active") {
    return clsx(
      "rounded-sm px-2.5 py-1 text-[10px] font-semibold transition-all",
      selected
        ? "bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-400"
        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100",
    );
  }
  if (status === "Inactive") {
    return clsx(
      "rounded-sm px-2.5 py-1 text-[10px] font-semibold transition-all",
      selected
        ? "bg-slate-600 text-white shadow-sm ring-1 ring-slate-500"
        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200",
    );
  }
  return clsx(
    "rounded-sm px-2.5 py-1 text-[10px] font-semibold transition-all",
    selected
      ? "bg-amber-500 text-white shadow-sm ring-1 ring-amber-400"
      : "bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100",
  );
}

export const InfrastructureOperationalStatusCellEditor = forwardRef<
  { getValue: () => string; isPopup: () => boolean },
  ICellEditorParams
>(function InfrastructureOperationalStatusCellEditor(props, ref) {
  const [value, setValue] = useState(String(props.value ?? ""));

  useImperativeHandle(ref, () => ({
    getValue() {
      return value.trim();
    },
    isPopup() {
      return true;
    },
  }));

  return (
    <div className="flex min-w-[11rem] flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
      {INFRASTRUCTURE_OPERATIONAL_STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setValue(option.value)}
          className={statusOptionClass(option.value, value === option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
});
