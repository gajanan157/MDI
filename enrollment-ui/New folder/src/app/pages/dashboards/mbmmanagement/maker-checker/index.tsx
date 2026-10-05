import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { useEffect, useMemo, useState } from "react";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useNavigate } from "react-router";
import CommonSearch, { SearchField } from "../../CommonSearch";
import { sampleData } from "../dashboard/sampleData";
import { statusColors } from "../maker-checker/sampleData";
import { AddPolicyModal } from "./AddPolicyModal";
import CheckListButton from "../../insurerManagement/IcCheckList/CheckListButton";
// Mock data for dropdown options
const statusOptions = [
  { label: "Pending At Maker", value: "Pending At Maker" },
  { label: "Approved by Maker", value: "Approved by Maker" },
  { label: "Pending At Checker", value: "Approved by Checker" },
  { label: "Policy Activated", value: "Policy Activated" },
  {
    label: "Policy Activated By Pendancy",
    value: "Policy Activated By Pendancy",
  },
  { label: "Rejected", value: "Rejected" },
  // { label: "Active", value: "Active" },
  // { label: "Inactive", value: "Inactive" },
];

const dummyData = [
  {
    id: "1",
    requestId: "REQ-001",
    requestType: "Policy",
    corporateName: "CARYSIL LIMITED, SECOND GROUP",
    policyNumber: "POL-2024-001",
    policyNo: "POL-2024-001",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "National Insurance Co. Ltd",
    productName: "National Group Mediclaim",
    policyName: "Corporate Shield A",
    priority: "High",
    status: "Pending At Maker",
    createdDate: "2024-01-15",
    createdBy: "John Doe",
    data: sampleData,
  },
  {
    id: "2",
    requestId: "REQ-002",
    requestType: "Claim",
    corporateName: "MERIL LIFE SCIENCES PVT LTD",
    policyNumber: "POL-2024-002",
    policyNo: "POL-2024-002",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "New India Assurance Co. Ltd",
    productName: "New India Flexi Group Mediclaim policy",
    policyName: "Employee Care B",
    priority: "Medium",
    status: "Approved By Maker",
    createdDate: "2024-01-16",
    createdBy: "Jane Smith",
    data: sampleData,
  },
  {
    id: "3",
    requestId: "REQ-003",
    requestType: "Benefit",
    corporateName: "KC City Centre Private Limited",
    policyNumber: "POL-2024-003",
    policyNo: "POL-2024-003",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "Oriental Insurance Co. Ltd  ",
    productName: "Group mediclaim insurance policy  ",
    policyName: "Corporate Health C",
    priority: "Low",
    status: "Pending At Checker",
    createdDate: "2024-01-17",
    createdBy: "Bob Johnson",
    data: sampleData,
  },
  {
    id: "4",
    requestId: "REQ-004",
    requestType: "Configuration",
    corporateName: "Jio Blackrock Investment Advisors Private Limited",
    policyNumber: "POL-2024-004",
    policyNo: "POL-2024-004",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "United India Insurance Co. Ltd  ",
    productName: "Group Health policy",
    policyName: "Plan D",
    priority: "High",
    status: "Rejected",
    createdDate: "2024-01-18",
    createdBy: "Alice Brown",
    data: sampleData,
  },
  {
    id: "5",
    requestId: "REQ-005",
    requestType: "Policy",
    corporateName: "CARYSIL LIMITED, SECOND GROUP",
    policyNumber: "POL-2024-005",
    policyNo: "POL-2024-005",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "National Insurance Co. Ltd",
    productName: "National Group Mediclaim",
    policyName: "Corporate Prime E",
    priority: "Medium",
    status: "Approved By Checker",
    createdDate: "2024-01-19",
    createdBy: "Charlie Wilson",
    data: sampleData,
  },
  {
    id: "6",
    requestId: "REQ-006",
    requestType: "Claim",
    corporateName: "MERIL LIFE SCIENCES PVT LTD",
    policyNumber: "POL-2024-006",
    policyNo: "POL-2024-006",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "New India Assurance Co. Ltd",
    productName: "New India Flexi Group Mediclaim policy",
    policyName: "Corporate Shield A",
    priority: "Low",
    status: "Approved By Maker",
    createdDate: "2024-01-20",
    createdBy: "Diana Prince",
    data: sampleData,
  },
  {
    id: "7",
    requestId: "REQ-007",
    requestType: "Benefit",
    corporateName: "KC City Centre Private Limited",
    policyNumber: "POL-2024-007",
    policyNo: "POL-2024-007",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "Oriental Insurance Co. Ltd",
    productName: "Group mediclaim insurance policy",
    policyName: "Employee Care B",
    priority: "High",
    status: "Pending At Checker",
    createdDate: "2024-01-21",
    createdBy: "Edward Norton",
    data: sampleData,
  },
  {
    id: "8",
    requestId: "REQ-008",
    requestType: "Configuration",
    corporateName: "Jio Blackrock Investment Advisors Private Limited",
    policyNumber: "POL-2024-008",
    policyNo: "POL-2024-008",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "United India Insurance Co. Ltd",
    productName: "Group Health policy",
    policyName: "Corporate Health C",
    priority: "Medium",
    status: "Approved By Checker",
    createdDate: "2024-01-22",
    createdBy: "Fiona Apple",
    data: sampleData,
  },
  {
    id: "9",
    requestId: "REQ-009",
    requestType: "Policy",
    corporateName: "CARYSIL LIMITED, SECOND GROUP A",
    policyNumber: "POL-2024-009",
    policyNo: "POL-2024-009",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "National Insurance Co. Ltd",
    productName: "National Group Mediclaim",
    policyName: "Plan D",
    priority: "Low",
    status: "Rejected",
    createdDate: "2024-01-23",
    createdBy: "George Martin",
    data: sampleData,
  },
  {
    id: "10",
    requestId: "REQ-010",
    requestType: "Claim",
    corporateName: "MERIL LIFE SCIENCES PVT LTD",
    policyNumber: "POL-2024-010",
    policyNo: "POL-2024-010",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "New India Assurance Co. Ltd",
    productName: "New India Flexi Group Mediclaim policy",
    policyName: "Corporate Prime E",
    priority: "High",
    status: "Pending At Maker",
    createdDate: "2024-01-24",
    createdBy: "Helen Keller",
    data: sampleData,
  },
  {
    id: "11",
    requestId: "REQ-011",
    requestType: "Benefit",
    corporateName: "KC City Centre Private Limited",
    policyNumber: "POL-2024-011",
    policyNo: "POL-2024-011",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "HDFC Life",
    productName: "Group mediclaim insurance policy",
    policyName: "Oriental Insurance Co. Ltd",
    priority: "Medium",
    status: "Approved By Maker",
    createdDate: "2024-01-25",
    createdBy: "Ian Fleming",
    data: sampleData,
  },
  {
    id: "12",
    requestId: "REQ-012",
    requestType: "Configuration",
    corporateName: "Jio Blackrock Investment Advisors Private Limited",
    policyNumber: "POL-2024-012",
    policyNo: "POL-2024-012",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "United India Insurance Co. Ltd",
    productName: "Group Health policy",
    policyName: "Employee Care B",
    priority: "Low",
    status: "Approved By Checker",
    createdDate: "2024-01-26",
    createdBy: "Julia Roberts",
    data: sampleData,
  },
];

// Filter dummy data based on search criteria
const filterDummyData = (filters: Record<string, any>) => {
  let filtered = [...dummyData];

  if (filters.requestId) {
    filtered = filtered.filter((item) =>
      item.requestId
        ?.toLowerCase()
        .includes(filters.requestId?.toLowerCase() || ""),
    );
  }
  if (filters.requestType) {
    // Handle both string and array values
    const requestTypeValue = Array.isArray(filters.requestType)
      ? filters.requestType[0]
      : filters.requestType;
    filtered = filtered.filter(
      (item) =>
        item.requestType?.toLowerCase() === requestTypeValue?.toLowerCase(),
    );
  }
  if (filters.corporateName) {
    filtered = filtered.filter((item) =>
      item.corporateName
        ?.toLowerCase()
        .includes(filters.corporateName?.toLowerCase() || ""),
    );
  }
  if (filters.policyNumber) {
    filtered = filtered.filter((item) =>
      item.policyNumber
        ?.toLowerCase()
        .includes(filters.policyNumber?.toLowerCase() || ""),
    );
  }
  if (filters.status) {
    // Handle both string and array values
    const statusValue = Array.isArray(filters.status)
      ? filters.status[0]
      : filters.status;
    filtered = filtered.filter(
      (item) => item.status?.toLowerCase() === statusValue?.toLowerCase(),
    );
  }

  return filtered;
};

export default function MakerChecker() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const fields: SearchField[] = [
    {
      name: "insurerId",
      label: "Insurer Name",
      type: "dropdown",
      options: [],
    },

    { name: "policyNumber", label: "Policy Number", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "dropdown",
      options: statusOptions,
    },
  ];

  const handleSearch = (data: Record<string, any>) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== "" && value !== null && value !== undefined;
      }),
    );

    // Check if any field is filled
    const hasFilters = Object.keys(cleanedData).length > 0;

    if (hasFilters) {
      setFilters(cleanedData);
      const filteredData = filterDummyData(cleanedData);
      setTableData(filteredData);
      setPage(1); // Reset to first page on new search
    } else {
      setTableData([]);
      setFilters({});
      setPage(1);
    }
  };

  useEffect(() => {
    setTableData(dummyData);
  }, []);
  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tableData.slice(startIndex, endIndex);
  }, [tableData, page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  const handleRowClick = (rowData: any) => {
    if (rowData?.id) {
      navigate(`/mbm-management/policy-benefit/${rowData.id}`);
    }
  };

  // Set breadcrumbs
  useBreadcrumb([{ title: "Policy Benefit" }]);

  const [open, setOpen] = useState(false);
  const columns = [
        {
      field: "policyNumber",
      headerName: "Policy Number",
      width: 110,
    },
    {
      field: "insurerName",
      headerName: "Insurer Name",
      width: 150,
    },
    {
      field: "corporateName",
      headerName: "Corporate Name",
      width: 150,
    },
    {
      field: "productName",
      headerName: "Product Name",
      width: 200,
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 140,
    },

    // ⭐ STATUS COLUMN (with your status options)
    {
      field: "status",
      headerName: "Status",
      width: 220,
      cellRenderer: (params: any) => {
        const status = params.value || "";

        const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";

        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}
          >
            {status}
          </span>
        );
      },
    },

    // ⭐ ACTIONS COLUMN (Edit / Assign / Delete)
  ];

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <Page title="Policy Benefit Maker-Checker">
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title="Policy Benefit Maker-Checker"
          totalCount={tableData.length}
          countLabel="Records"
        >
          <CheckListButton
            onClick={toggleSearch}
            label={isSearchOpen ? "Hide Search" : "Search"}
            bgColor="bg-blue-600"
            textColor="text-white"
            size="text-xs"
            className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
            isSearch
          />
          <CheckListButton
            onClick={() => setOpen(true)}
            label={"Add New Policy"}
            bgColor="bg-blue-600"
            textColor="text-white"
            size="text-xs"
            className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
          />
        </CompactPageHeader>

        <CommonSearch
          isInsurer={true}
          fields={fields}
          onSearch={handleSearch}
          isSubmitting={false}
          title="Search Filters"
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
        />

        {/* Grid Table */}
        {tableData.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
            <AgGridSuperWrapper
              rowData={paginatedData}
              columnDefs={columns}
              pageSize={pageSize}
              height="100%"
              width="100%"
              pagination={true}
              totalItems={tableData.length}
              page={page}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10, 20, 30, 50]}
              onRowClick={handleRowClick}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">
              {Object.keys(filters).length === 0
                ? "Fill any search field and click Apply to view results"
                : "No results found for the selected filters"}
            </p>
          </div>
        )}
      </div>
      {open && (
        <AddPolicyModal
          onClose={() => setOpen(false)}
          insurers={[
            { label: "Select Insurer", value: "" },
            { label: "HDFC ERGO", value: "hdfc" },
            { label: "ICICI Lombard", value: "icici" },
          ]}
          priorities={[
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ]}
          policyTypes={[
            { label: "Corporate", value: "corporate" },
            { label: "Retail", value: "retail" },
          ]}
          initialValues={{
            receivedDate: "2025-12-05",
          }}
        />
      )}
    </Page>
  );
}
