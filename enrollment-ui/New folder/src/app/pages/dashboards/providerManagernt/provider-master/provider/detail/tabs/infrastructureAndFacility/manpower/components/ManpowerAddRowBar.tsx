import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  EMPLOYMENT_TYPE_OPTIONS,
  MANPOWER_TYPE_OPTIONS,
} from "../utils/manpowerTypes";

type ManpowerAddRowBarProps = {
  existingKeys: Set<string>;
  onAdd: (manpowerType: string, employmentType: string) => void;
};

const selectClass =
  "h-7 min-w-[8rem] rounded border border-gray-300 bg-white px-2 text-[11px] text-slate-800 focus:border-primary-500 focus:outline-none";

export function ManpowerAddRowBar({
  existingKeys,
  onAdd,
}: Readonly<ManpowerAddRowBarProps>) {
  const [manpowerType, setManpowerType] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const duplicate =
    manpowerType.trim() !== "" &&
    employmentType.trim() !== "" &&
    existingKeys.has(
      `${manpowerType.trim().toLowerCase()}::${employmentType.trim().toLowerCase()}`,
    );
  const canAdd = manpowerType.trim() !== "" && employmentType.trim() !== "" && !duplicate;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 bg-slate-50/70 px-2 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Add row
      </span>
      <select
        aria-label="Manpower type"
        className={selectClass}
        value={manpowerType}
        onChange={(event) => setManpowerType(event.target.value)}
      >
        <option value="">Manpower type…</option>
        {MANPOWER_TYPE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        aria-label="Employment type"
        className={selectClass}
        value={employmentType}
        onChange={(event) => setEmploymentType(event.target.value)}
      >
        <option value="">Employment type…</option>
        {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => {
          onAdd(manpowerType, employmentType);
          setManpowerType("");
          setEmploymentType("");
        }}
        className="inline-flex h-7 items-center gap-1 rounded bg-primary-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Add
      </button>
      {duplicate ? (
        <span className="text-[10px] font-medium text-rose-600">
          This manpower / employment pair already exists.
        </span>
      ) : null}
    </div>
  );
}
