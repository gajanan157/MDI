import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { ProviderMasterRecord } from "../utils/masterConfig";

type ProviderMastersRowActionsProps = {
  row: ProviderMasterRecord;
  canMasterEditDelete: boolean;
  viewLabel: string;
  editLabel: string;
  deleteLabel: string;
  onView: (row: ProviderMasterRecord) => void;
  onEdit: (row: ProviderMasterRecord) => void;
  onDelete: (row: ProviderMasterRecord) => void;
};

export default function ProviderMastersRowActions({
  row,
  canMasterEditDelete,
  viewLabel,
  editLabel,
  deleteLabel,
  onView,
  onEdit,
  onDelete,
}: Readonly<ProviderMastersRowActionsProps>) {
  return (
    <div className="flex h-full items-center justify-center gap-1.5">
      <button
        type="button"
        className="cursor-pointer rounded border border-blue-200 bg-blue-50 p-1 text-blue-600 hover:bg-blue-100"
        title={viewLabel}
        onClick={() => onView(row)}
      >
        <EyeIcon className="h-3.5 w-3.5" />
      </button>
      {canMasterEditDelete ? (
        <>
          <button
            type="button"
            className="cursor-pointer rounded border border-emerald-200 bg-emerald-50 p-1 text-emerald-700 hover:bg-emerald-100"
            title={editLabel}
            onClick={() => onEdit(row)}
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="cursor-pointer rounded border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100"
            title={deleteLabel}
            onClick={() => onDelete(row)}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
