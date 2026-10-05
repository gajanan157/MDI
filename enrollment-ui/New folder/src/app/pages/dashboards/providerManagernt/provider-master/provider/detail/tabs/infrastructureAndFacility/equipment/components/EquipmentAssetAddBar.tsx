import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { EQUIPMENT_TYPE_OPTIONS } from "../utils/equipmentAssetTypes";

type EquipmentAssetAddBarProps = {
  onAdd: (equipmentType: string) => void;
};

const selectClass =
  "h-7 min-w-[12rem] rounded border border-gray-300 bg-white px-2 text-[11px] text-slate-800 focus:border-primary-500 focus:outline-none";

export function EquipmentAssetAddBar({ onAdd }: Readonly<EquipmentAssetAddBarProps>) {
  const [equipmentType, setEquipmentType] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 bg-slate-50/70 px-2.5 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Add equipment
      </span>
      <select
        aria-label="Equipment type"
        className={selectClass}
        value={equipmentType}
        onChange={(event) => setEquipmentType(event.target.value)}
      >
        <option value="">Equipment type…</option>
        {EQUIPMENT_TYPE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={equipmentType === ""}
        onClick={() => {
          onAdd(equipmentType);
          setEquipmentType("");
        }}
        className="inline-flex h-7 items-center gap-1 rounded bg-primary-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Add
      </button>
    </div>
  );
}
