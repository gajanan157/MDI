import { forwardRef, useImperativeHandle, useState } from "react";
import type { ICellEditorParams } from "ag-grid-community";
import clsx from "clsx";

export const InfrastructureBooleanToggleCellEditor = forwardRef<
  { getValue: () => boolean; isPopup: () => boolean },
  ICellEditorParams<unknown, boolean>
>(function InfrastructureBooleanToggleCellEditor(props, ref) {
  const [value, setValue] = useState(Boolean(props.value));

  useImperativeHandle(ref, () => ({
    getValue() {
      return value;
    },
    isPopup() {
      return true;
    },
  }));

  return (
    <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-slate-100">
      <button
        type="button"
        onClick={() => setValue(true)}
        className={clsx(
          "rounded-sm px-3 py-1 text-[10px] font-semibold transition-all",
          value
            ? "bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-400"
            : "bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
        )}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => setValue(false)}
        className={clsx(
          "rounded-sm px-3 py-1 text-[10px] font-semibold transition-all",
          !value
            ? "bg-rose-500 text-white shadow-sm ring-1 ring-rose-400"
            : "bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-700",
        )}
      >
        No
      </button>
    </div>
  );
});
