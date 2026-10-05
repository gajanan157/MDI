import { useState } from "react";
import DataTable, { MessageRow } from "./DataTable";
import CheckListButton from "../IcCheckList/CheckListButton";

interface Props {
    open: boolean;
    onClose: () => void;
    messages: MessageRow[];
    onSend: (msg: string) => void;
    departmentName: string;
    hideBranchColumn?: boolean;
    sending?: boolean;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        totalRecords?: number;
        recordPerPage?: number;
        pageSizeOptions?: number[];
        onPageSizeChange?: (size: number) => void;
    };
}

export default function ChatPopup({ open, onClose, messages, onSend, departmentName, hideBranchColumn, pagination, sending }: Props) {
    const [input, setInput] = useState("");

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] h-auto max-w-4xl rounded-lg shadow-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{departmentName}</h2>
                    <CheckListButton
                        onClick={onClose}
                        label="✖"
                        bgColor=""
                        textColor="text-white"
                        size="text-sx"
                    />
                </div>
                <DataTable
                    data={messages}
                    hideBranchColumn={hideBranchColumn}
                    serverSidePagination={pagination}
                />
                <div className="border-t pt-4 mt-4 flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your comment..."
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
                        disabled={sending}
                    />
                    <CheckListButton
                        onClick={() => {
                            if (input.trim() !== "") {
                                onSend(input.trim());
                                setInput("");
                            }
                        }} label="Add comment"
                        bgColor=""
                        textColor="text-white"
                        className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={sending}
                    />
                </div>

            </div>
        </div>
    );
}
