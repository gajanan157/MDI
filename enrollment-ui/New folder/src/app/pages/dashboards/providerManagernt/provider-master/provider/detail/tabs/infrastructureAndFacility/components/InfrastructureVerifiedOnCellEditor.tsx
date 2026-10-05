import { forwardRef, useImperativeHandle, useState } from "react";
import type { ICellEditorParams } from "ag-grid-community";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { DatePicker } from "@/components/shared/form/Datepicker";

/** Normalizes stored date strings to `YYYY-MM-DD` for the date picker. */
function toVerifiedOnPickerValue(apiValue: string): string {
  const datePart = apiValue.trim().split("T")[0]?.trim() ?? "";
  if (!datePart) return "";

  const iso = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return datePart;

  const dmyHyphen = datePart.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyHyphen) return `${dmyHyphen[3]}-${dmyHyphen[2]}-${dmyHyphen[1]}`;

  const dmySlash = datePart.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmySlash) return `${dmySlash[3]}-${dmySlash[2]}-${dmySlash[1]}`;

  return datePart;
}

export const InfrastructureVerifiedOnCellEditor = forwardRef<
  { getValue: () => string; isPopup: () => boolean },
  ICellEditorParams
>(function InfrastructureVerifiedOnCellEditor(props, ref) {
  const [value, setValue] = useState(() =>
    toVerifiedOnPickerValue(String(props.value ?? "")),
  );

  useImperativeHandle(ref, () => ({
    getValue() {
      return value.trim();
    },
    isPopup() {
      return true;
    },
  }));

  return (
    <div className="overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-xl ring-1 ring-indigo-50">
      <div className="flex items-center gap-1.5 border-b border-indigo-50 bg-gradient-to-r from-indigo-50 to-sky-50 px-2.5 py-1.5">
        <CalendarDaysIcon className="h-4 w-4 text-indigo-500" aria-hidden />
        <span className="text-[11px] font-semibold text-indigo-900">Select verified date</span>
      </div>
      <div className="p-2">
        <DatePicker
          isCalendar
          hasCalenderIcon={false}
          value={value}
          onChange={(_selectedDates, dateStr) => {
            setValue(String(dateStr ?? "").trim());
          }}
          options={{
            dateFormat: "d M Y",
            inline: true,
            appendTo: document.body,
          }}
          className="text-xs"
        />
      </div>
    </div>
  );
});
