import CheckListButton from "../IcCheckList/CheckListButton";

interface Props {
    current: number;
    total: number;
    onChange: (page: number) => void;
    totalRecords?: number;
    recordPerPage?: number;
    pageSizeOptions?: number[];
    onPageSizeChange?: (size: number) => void;
}

export default function Pagination({ current, total, onChange, totalRecords, recordPerPage, pageSizeOptions, onPageSizeChange }: Props) {
    const safeTotal = Math.max(1, total);

    return (
        <div className="mt-3 flex flex-wrap justify-end items-center gap-2">
            {pageSizeOptions != null && pageSizeOptions.length > 0 && onPageSizeChange && recordPerPage != null && (
                <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                    <select
                        value={recordPerPage}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-600"
                    >
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {totalRecords != null && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {totalRecords === 1
                        ? "1 record"
                        : totalRecords > 1 && recordPerPage != null && totalRecords > recordPerPage
                            ? `${totalRecords} records · ${recordPerPage} per page`
                            : `${totalRecords} records`}
                </span>
            )}
            <CheckListButton
                onClick={() => onChange(current - 1)}
                label="Prev"
                bgColor=""
                textColor="text-black"
                size="text-sx"
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={current <= 1}
            />
            <span className="flex items-center px-3 py-1 text-sm">
                Page {current} / {safeTotal}
            </span>
            <CheckListButton
                onClick={() => onChange(current + 1)}
                label="Next"
                bgColor=""
                textColor="text-black"
                size="text-sx"
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={current >= safeTotal}
            />
        </div>
    );
}
