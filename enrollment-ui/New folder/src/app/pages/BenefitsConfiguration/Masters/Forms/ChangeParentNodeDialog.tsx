import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const ChangeParentNodeDialog = ({
    open,
    nodeName,
    onCancel,
    onSubmit,
}: {
    open: boolean;
    nodeName: string;
    onCancel: () => void;
    onSubmit: (newParentGroupId: string | null) => void;
}) => {
    const { benefitPossibleParents } = useAppSelector((state) => state.limitTypeMasterReducer);
    const [selectedParentId, setSelectedParentId] = useState<string>("");

    useEffect(() => {
        if (open) setSelectedParentId("");
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                    <h2 className="text-base font-bold text-zinc-900">
                        Change Parent Node
                    </h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
                            Selected Node
                        </label>
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800">
                            {nodeName}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
                            New Parent Node
                        </label>
                        <select
                            value={selectedParentId}
                            onChange={(e) => setSelectedParentId(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                            {benefitPossibleParents.map((opt) => (
                                <option key={opt.nodeId} value={opt.nodeId}>
                                    {opt.displayName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onSubmit(selectedParentId || null)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeParentNodeDialog;