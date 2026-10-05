import { useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";

type TableStatus = "Active" | "Inactive" | "Pending";
type ColumnKey = "code" | "name" | "city" | "state" | "status" | "amount";

type TableRow = {
  id: number;
  code: string;
  name: string;
  city: string;
  state: string;
  status: TableStatus;
  amount: number;
};

type ColumnOption = {
  field: ColumnKey;
  label: string;
};

type ColumnFilters = Partial<Record<ColumnKey, string>>;

const COLUMN_OPTIONS: ColumnOption[] = [
  { field: "code", label: "Code" },
  { field: "name", label: "Name" },
  { field: "city", label: "City" },
  { field: "state", label: "State" },
  { field: "status", label: "Status" },
  { field: "amount", label: "Amount" },
];

const TABLE_ROWS: TableRow[] = [
  {
    id: 1,
    code: "PRV-001",
    name: "City Care Hospital",
    city: "Pune",
    state: "Maharashtra",
    status: "Active",
    amount: 125000,
  },
  {
    id: 2,
    code: "PRV-002",
    name: "Sunrise Multispeciality Hospital",
    city: "Mumbai",
    state: "Maharashtra",
    status: "Inactive",
    amount: 98000,
  },
  {
    id: 3,
    code: "PRV-003",
    name: "Green Valley Clinic",
    city: "Nagpur",
    state: "Maharashtra",
    status: "Pending",
    amount: 42500,
  },
  {
    id: 4,
    code: "PRV-004",
    name: "Lotus Medical Centre",
    city: "Ahmedabad",
    state: "Gujarat",
    status: "Active",
    amount: 77500,
  },
];

const statusClassName: Record<TableStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const baseColumnDefs: Record<ColumnKey, ColDef<TableRow>> = {
  code: {
    field: "code",
    headerName: "Code",
    minWidth: 120,
    filter: true,
  },
  name: {
    field: "name",
    headerName: "Name",
    minWidth: 220,
    filter: true,
  },
  city: {
    field: "city",
    headerName: "City",
    minWidth: 130,
    filter: true,
  },
  state: {
    field: "state",
    headerName: "State",
    minWidth: 150,
    filter: true,
  },
  status: {
    field: "status",
    headerName: "Status",
    minWidth: 120,
    filter: true,
    cellRenderer: (params: { value?: TableStatus }) => {
      const status = params.value;
      if (!status) return "—";
      return (
        <span className={`rounded px-2 py-1 text-xs ${statusClassName[status]}`}>
          {status}
        </span>
      );
    },
  },
  amount: {
    field: "amount",
    headerName: "Amount",
    minWidth: 130,
    filter: true,
    valueFormatter: (params) =>
      typeof params.value === "number" ? params.value.toLocaleString("en-IN") : "—",
  },
};

function matchesFilter(value: unknown, filter: string | undefined) {
  const search = String(filter ?? "").trim().toLowerCase();
  if (!search) return true;
  return String(value ?? "").toLowerCase().includes(search);
}

export default function CustomeTableWithFilter() {
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(
    COLUMN_OPTIONS.map((column) => column.field),
  );
  const [filters, setFilters] = useState<ColumnFilters>({});

  const columnDefs = useMemo(
    () => visibleColumns.map((field) => baseColumnDefs[field]),
    [visibleColumns],
  );

  const filteredRows = useMemo(
    () =>
      TABLE_ROWS.filter((row) =>
        COLUMN_OPTIONS.every((column) =>
          matchesFilter(row[column.field], filters[column.field]),
        ),
      ),
    [filters],
  );

  const updateFilter = (field: ColumnKey, value: string) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleColumn = (field: ColumnKey) => {
    setVisibleColumns((current) => {
      if (current.includes(field)) {
        return current.length === 1
          ? current
          : current.filter((column) => column !== field);
      }
      return COLUMN_OPTIONS.map((column) => column.field).filter(
        (column) => column === field || current.includes(column),
      );
    });
  };

  const resetFilters = () => setFilters({});

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Custom Table With Filter
            </h2>
            <p className="text-xs text-gray-500">
              Select columns and apply filters before passing rows to AG Grid.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setColumnsOpen((open) => !open)}
              className="h-8 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
            >
              Columns
            </button>

            {columnsOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  Show / hide columns
                </p>
                <div className="space-y-1">
                  {COLUMN_OPTIONS.map((column) => (
                    <label
                      key={column.field}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column.field)}
                        onChange={() => toggleColumn(column.field)}
                      />
                      <span>{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COLUMN_OPTIONS.map((column) => (
            <div key={column.field}>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                {column.label} Filter
              </label>
              <input
                value={filters[column.field] ?? ""}
                onChange={(event) => updateFilter(column.field, event.target.value)}
                placeholder={`Filter ${column.label}`}
                className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="h-8 rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <AgGridSuperWrapper
          rowData={filteredRows}
          columnDefs={columnDefs}
          height="100%"
          pageSize={20}
          pagination={false}
        />
      </div>
    </div>
  );
}
