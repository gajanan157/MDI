import { useState } from "react";
import Pagination from "./Pagination";

export interface MessageRow {
  id: number;
  remark: string;
  createdBy: string;
  createdAt: string;
  branch: string;
}

interface Props {
  data: MessageRow[];
  hideBranchColumn?: boolean;
  /** Server-side pagination: when provided, pagination triggers onPageChange instead of client-side slice */
  serverSidePagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalRecords?: number;
    recordPerPage?: number;
    pageSizeOptions?: number[];
    onPageSizeChange?: (size: number) => void;
  };
}

export default function DataTable({
  data,
  hideBranchColumn,
  serverSidePagination,
}: Props) {
  const [clientPage, setClientPage] = useState(1);
  const pageSize = 5;

  const isServerSide = !!serverSidePagination;
  const page = isServerSide ? serverSidePagination!.currentPage : clientPage;
  const totalPages = isServerSide
    ? serverSidePagination!.totalPages
    : Math.ceil(data.length / pageSize);
  const onPageChange = isServerSide
    ? serverSidePagination!.onPageChange
    : setClientPage;

  const paginated = isServerSide
    ? data
    : data?.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <table className="w-full table-auto border text-sm">
        <thead className="bg-gray-200">
          <tr>
            {/* <th className="border px-2 py-1">Sr No</th> */}
            <th className="border px-2 py-1">Comments</th>
            <th className="border px-2 py-1">Created By</th>
            {!hideBranchColumn && (
              <th className="border px-2 py-1">Branch Name</th>
            )}
            <th className="border px-2 py-1">Created Date</th>
          </tr>
        </thead>

        <tbody>
          {paginated?.map((row) => (
            <tr key={row.id}>
              {/* <td className="border px-2 py-1 text-center">{row.id}</td> */}
              <td className="border px-2 py-1">{row.remark}</td>
              <td className="border px-2 py-1 text-center">{row.createdBy}</td>
              {!hideBranchColumn && (
                <td className="border px-2 py-1 text-center">{row.branch}</td>
              )}
              <td className="border px-2 py-1 text-center">{row.createdAt}</td>
            </tr>
          ))}

          {paginated?.length === 0 && (
            <tr>
              <td colSpan={hideBranchColumn ? 4 : 5} className="text-center py-4 text-gray-500">
                No comments yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        current={page}
        total={totalPages}
        onChange={onPageChange}
        totalRecords={serverSidePagination?.totalRecords}
        recordPerPage={serverSidePagination?.recordPerPage}
        pageSizeOptions={serverSidePagination?.pageSizeOptions}
        onPageSizeChange={serverSidePagination?.onPageSizeChange}
      />
    </div>
  );
}
