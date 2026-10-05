import { useMemo, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  availableFacilityTypes,
  facilityCategoryNameById,
  facilityCategoryOptions,
} from "../utils/facilityTypes";

type FacilityAddRowBarProps = {
  existingKeys: Set<string>;
  onAdd: (facilityCategory: string, facilityType: string) => void;
};

const selectClass =
  "h-7 min-w-[9rem] rounded border border-gray-300 bg-white px-2 text-[11px] text-slate-800 focus:border-primary-500 focus:outline-none";

export function FacilityAddRowBar({
  existingKeys,
  onAdd,
}: Readonly<FacilityAddRowBarProps>) {
  const [categoryId, setCategoryId] = useState("");
  const [facilityType, setFacilityType] = useState("");

  const categories = useMemo(() => facilityCategoryOptions(), []);
  const types = useMemo(
    () => (categoryId ? availableFacilityTypes(categoryId, existingKeys) : []),
    [categoryId, existingKeys],
  );

  const canAdd = categoryId !== "" && facilityType !== "";

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 bg-slate-50/70 px-2 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Add facility
      </span>
      <select
        aria-label="Facility category"
        className={selectClass}
        value={categoryId}
        onChange={(event) => {
          setCategoryId(event.target.value);
          setFacilityType("");
        }}
      >
        <option value="">Category…</option>
        {categories.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Facility type"
        className={selectClass}
        value={facilityType}
        disabled={!categoryId}
        onChange={(event) => setFacilityType(event.target.value)}
      >
        <option value="">
          {categoryId && types.length === 0 ? "All types added" : "Type…"}
        </option>
        {types.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => {
          onAdd(facilityCategoryNameById(categoryId), facilityType);
          setFacilityType("");
        }}
        className="inline-flex h-7 items-center gap-1 rounded bg-primary-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Add
      </button>
    </div>
  );
}
