import { parseService } from "@/app/api/apiService";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CreateCorporateInwardModal from "../CreateCorporateInwardModal";

export default function PsuInward() {
    const { t } = useTranslation()
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedInward, setSelectedInward] = useState<any>(null);
    const columns = [
        {
            field: "actions",
            headerName: t("corporateInward.columns.action"),
            width: 110,
            pinned: "left",
            sortable: false,
            filter: false,

            cellRenderer: (params: any) => {
                const handleAssign = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelectedInward({
                        workflowId:"",
                        inwardNo:params?.data?.inwardNo,
                        businessEntityId:params?.data?.xmlParserFilemetadataId,
                        businessReferenceNumber:params?.data?.policyNo,
                    });
                    setIsAssignOpen(true);
                };
                return (
                    <div className="flex h-full items-center gap-2">
                        <button onClick={handleAssign} className="cursor-pointer rounded bg-blue-500 px-1 text-[11px] text-white hover:bg-blue-600">
                            Assign User
                        </button>
                    </div>
                );
            },
        },
        {
            field: "inwardNo",
            headerName: "Inward Number",
            width: 130,
        },
        {
            field: "createdAt", // was inwardReceivedAt
            headerName: "Inward Date & Time",
            width: 145,
            valueFormatter: (params: any) => {
                if (!params.value) return "";
                return format(new Date(params.value), "dd MMM yyyy hh:mm a");
            },
        },
        {
            field: "policyNo",
            headerName: "Policy Number",
            width: 150,
        },
        {
            field: "policyEvent",
            headerName: "Inward Type",
            width: 130,
            cellRenderer: (params: any) => {
                const event = params.value;

                const isEnrollment = event === "ISSUE-POL";

                return (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${isEnrollment ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                        {isEnrollment ? "Enrollment" : "Endorsement"}
                    </span>
                );
            },
        },
        {
            field: "insurerName",
            headerName: "Insurer Name",
            width: 240,
        },
        {
            field: "policyHolderName",
            headerName: "Corporate Name",
            width: 180,
        },
        {
            field: "noOfPersonsCovered",
            headerName: "Number of Persons Covered",
            width: 150,
        },
        {
            field: "endorsementType",
            headerName: "Endorsement Type",
            width: 150,
        },
        {
            field: "policyScheduleAvailable",
            headerName: "Policy Schedule Available",
            width: 120,
            cellRenderer: (params: any) => {
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${params.value
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        {params.value ? "YES" : "NO"}
                    </span>
                );
            },
        },
        {
            field: "memberDataAvailable",
            headerName: "Member Data Available",
            width: 120,
            cellRenderer: (params: any) => {
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${params.value
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        {params.value ? "YES" : "NO"}
                    </span>
                );
            },
        },
    ];
    const [filters, setFilters] = useState({ searchTerm: "" });
    const [tableData, setTableData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);




    const handlePageChange = (p: number) => {
        setPage(p);
        fetchData(p, pageSize);

    };

    const handlePageSizeChange = (size: number) => {
        setPage(1);
        setPageSize(size);
        fetchData(1, size);
    };


    const fetchData = async (
        pageNo = page,
        size = pageSize,
        searchTerm = filters.searchTerm
    ) => {
        try {
            const params = new URLSearchParams({
                page: pageNo.toString(),
                recordPerPage: size.toString(),
            });

            if (searchTerm?.trim()) {
                params.append("searchTerm", searchTerm.trim());
            }

            const response = await fetchUser(parseService, `/v1/xml-parser/file-metadata/search?${params.toString()}`);

            if (response?.success) {
                setTableData(response.data?.data || []);
                setTotalItems(response.data?.pagination?.totalRecords || 0);
            } else {
                setTableData([]);
                setTotalItems(0);
            }
        } catch (error) {
            console.error(error);
            setTableData([]);
            setTotalItems(0);
        }
    };

    useEffect(() => {
        fetchData(page, pageSize);
    }, []);

    return (
        <>
            <div className="flex min-h-0 w-full flex-1 flex-col justify-start">
                <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex min-h-20 flex-1 flex-col">
                        <AgGridSuperWrapper
                            rowData={tableData}
                            columnDefs={columns}
                            onRowClick={() => { }}
                            pageSize={pageSize}
                            height="100%"
                            pagination={false}
                        />
                    </div>
                    <Pagination
                        className="shrink-0"
                        page={page}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        pageSizeOptions={[20, 30, 50, 100]}
                    />
                </div>
            </div>
            {isAssignOpen && (
                <CreateCorporateInwardModal
                    open={isAssignOpen}
                    onClose={() => setIsAssignOpen(false)}
                    isAssignOpen
                    isData={selectedInward}
                />
            )}

        </>
    );
}