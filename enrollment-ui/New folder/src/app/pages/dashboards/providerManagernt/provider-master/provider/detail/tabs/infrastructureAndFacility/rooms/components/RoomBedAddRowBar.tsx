import { useMemo, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ROOM_TYPE_OPTIONS, roomBedRowKey } from "../utils/roomBedTypes";

type RoomBedAddRowBarProps = {
  existingKeys: Set<string>;
  onAdd: (roomType: string) => void;
};

const selectClass =
  "h-7 min-w-[10rem] rounded border border-gray-300 bg-white px-2 text-[11px] text-slate-800 focus:border-primary-500 focus:outline-none";

export function RoomBedAddRowBar({
  existingKeys,
  onAdd,
}: Readonly<RoomBedAddRowBarProps>) {
  const [roomType, setRoomType] = useState("");

  const options = useMemo(
    () => ROOM_TYPE_OPTIONS.filter((option) => !existingKeys.has(roomBedRowKey(option))),
    [existingKeys],
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 bg-slate-50/70 px-2 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Add room type
      </span>
      <select
        aria-label="Room type"
        className={selectClass}
        value={roomType}
        onChange={(event) => setRoomType(event.target.value)}
      >
        <option value="">
          {options.length === 0 ? "All room types added" : "Room type…"}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={roomType === ""}
        onClick={() => {
          onAdd(roomType);
          setRoomType("");
        }}
        className="inline-flex h-7 items-center gap-1 rounded bg-primary-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Add
      </button>
    </div>
  );
}
