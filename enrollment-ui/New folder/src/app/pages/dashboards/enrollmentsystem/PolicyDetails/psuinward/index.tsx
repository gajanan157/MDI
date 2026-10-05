import { parseService, postApi } from "@/app/api/apiService";
import { usePermission } from "@/app/auth/usePermission";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { Page } from "@/components/shared/Page";
import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { Button } from "@/components/ui";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import CompactStatCard from "@/components/shared/CompactStatCard";
import { useDisclosure } from "@/hooks";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { DocumentPlusIcon, InboxArrowDownIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CommonSearch, { SearchField } from "../../../CommonSearch";
import CheckListButton from "../../../insurerManagement/IcCheckList/CheckListButton";
import CreateCorporateInwardModal from "../../dashboard/components/CreateCorporateInwardModal";
import { toast } from "sonner";
export default function PSUInward() {
    const { t } = useTranslation()
    const { canWrite } = usePermission("enrollment");


    useBreadcrumb([
        { title: t("nav.dashboards.enrollmentsystem") },
        { title: `${t("nav.dashboards.inward")} `, },
        { title: `${t("nav.dashboards.psu-inward")}` },
    ]);


    const columns = [
        // {
        //     field: "inwardNo",
        //     headerName: "Inward Number",
        //     width: 130,
        // },
        // {
        //     field: "createdAt", // was inwardReceivedAt
        //     headerName: "Inward Date & Time",
        //     width: 145,
        //     valueFormatter: (params: any) => {
        //         if (!params.value) return "";
        //         return format(new Date(params.value), "dd MMM yyyy hh:mm a");
        //     },
        // },
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
        // {
        //     field: "insurerName",
        //     headerName: "Insurer Name",
        //     width: 240,
        // },
        {
            field: "policyHolderName",
            headerName: "Corporate Name",
            width: 180,
        },
        {
            field: "noOfPersonsCovered",
            headerName: "Number of Persons Covered",
            width: 180,
        },
        {
            field: "endorsementPolicyNumber",
            headerName: "Endorsement Number",
            width: 180,
        },
        {
            field: "endorsementType",
            headerName: "Endorsement Type",
            width: 150,
        },

        {
            field: "policyScheduleAvailable",
            headerName: "Policy Schedule Available",
            width: 220,
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
            width: 220,
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

    const [filters, setFilters] = useState({
        searchTerm: "",
    });
    const [count, setCount] = useState({ totalUniqueInward: 0, enrollmentCount: 0, endorsementCount: 0, });
    const [tableData, setTableData] = useState<any[]>([]);
    const [ids, setIds] = useState<any[]>([]);
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
    const [open, setOpen] = useState(false);
    const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
    const fields: SearchField[] = [
        { name: "searchTerm", label: "Policy Number", type: "text" },
    ];
    const [loading, setLoading] = useState(false);
    const handleSearch = async (data: Record<string, any>) => {
        const searchTerm = data?.searchTerm ?? "";

        setFilters({ searchTerm });

        setPage(1);

        fetchData(1, pageSize, searchTerm);
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
                setIds(response.data?.additionalData || []);
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
    const [proceedLoading, setProceedLoading] = useState(false);
    const handleSaveApi = async () => {
        try {
            setProceedLoading(true);
            const response = await postApi(parseService, `/v1/xml-parser/file-metadata/kafka-events`, ids);

            if (response?.success) {
                toast.success("Sent to Admin successfully", { duration: 3000 });
            } else {
                toast.error(response?.error || "Something went wrong", { duration: 3000 });
            }

        } catch (error) {
            console.log(error)
            toast.error("Unable to process request");
        } finally {
            setProceedLoading(false);
        }
    };
    const fetchCount = async () => {
        const response = await fetchUser(parseService, `/v1/xml-parser/file-metadata/summary`);
        if (response?.success) {
            setCount(response.data?.data);
        } else {
            // setCount({})
        }
    }
    useEffect(() => {
        fetchData(page, pageSize);
        fetchCount()
    }, []);

    return (
        <Page title="PSU Inward Management">
            <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
                <CompactPageHeader
                    title="PSU Inward Management"
                    totalRecords={totalItems}
                    recordLabel="PSU Inwards"
                    onRefresh={() => {
                        fetchData(page, pageSize);
                        fetchCount();
                    }}
                >
                    <CheckListButton
                        onClick={toggleSearch}
                        label={isSearchOpen ? t("branch.hideSearch") : t("branch.search")}
                        bgColor="bg-blue-600"
                        textColor="text-white"
                        size="text-xs"
                        className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
                        isSearch
                    />
                    <Button
                        color="primary"
                        className="h-7 text-xs px-2.5 flex items-center gap-1 shadow-2xs"
                        onClick={() => setOpen(true)}
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>Create PSU Inward</span>
                    </Button>
                    <Button
                        color="primary"
                        disabled={proceedLoading}
                        onClick={handleSaveApi}
                        className="h-7 text-xs px-2.5 flex items-center gap-1 shadow-2xs bg-emerald-600 hover:bg-emerald-700"
                    >
                        {proceedLoading ? "Processing..." : "Proceed to Admin"}
                    </Button>
                </CompactPageHeader>

                {/* Compact Stats Row */}
                <div className="grid grid-cols-3 gap-2 shrink-0">
                    <CompactStatCard
                        title="Total Inward"
                        count={Number(count?.enrollmentCount || 0) + Number(count?.endorsementCount || 0)}
                        icon={InboxArrowDownIcon}
                        colorTheme="blue"
                        variant="left-accent"
                        height="h-[52px]"
                    />
                    <CompactStatCard
                        title="Enrollment"
                        count={count?.enrollmentCount || 0}
                        icon={DocumentPlusIcon}
                        colorTheme="emerald"
                        variant="left-accent"
                        height="h-[52px]"
                    />
                    <CompactStatCard
                        title="Endorsement"
                        count={count?.endorsementCount || 0}
                        icon={PencilSquareIcon}
                        colorTheme="purple"
                        variant="left-accent"
                        height="h-[52px]"
                    />
                </div>

                <CommonSearch fields={fields} onSearch={handleSearch} isSubmitting={loading} isState showToggleButton={false} isOpen={isSearchOpen} onToggle={toggleSearch} />

                {(tableData?.[0]?.inwardNo || tableData?.[0]?.insurerName || tableData?.[0]?.createdAt) && (
                    <div className="flex shrink-0 items-center gap-4 px-3 py-1 bg-blue-50/70 border border-blue-200/60 rounded-lg text-xs">
                        {tableData?.[0]?.inwardNo && (
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500 font-medium">Inward No:</span>
                                <span className="font-mono font-bold text-blue-700">{tableData[0].inwardNo}</span>
                            </div>
                        )}
                        {tableData?.[0]?.insurerName && (
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500 font-medium">Insurer:</span>
                                <span className="font-semibold text-slate-800">{tableData[0].insurerName}</span>
                            </div>
                        )}
                        {tableData?.[0]?.createdAt && (
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500 font-medium">Date & Time:</span>
                                <span className="font-semibold text-slate-700">{format(new Date(tableData[0].createdAt), "dd MMM yyyy hh:mm a")}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
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
            {open && (<CreateCorporateInwardModal open={open} onClose={() => setOpen(false)} isPSUInward />)}
        </Page>
    );
}
