import { recordStatus } from "@/app/pages/AdminDepartment/tpabranches/dummyData";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import Pagination from "@/components/shared/Pagination";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchUsersData } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CommonSearch, { SearchField } from "../../CommonSearch";
import CreateCorporateInwardModal from "../../enrollmentsystem/dashboard/components/CreateCorporateInwardModal";

export default function PolicyDetails() {
    const { t } = useTranslation()
    useBreadcrumb([
        { title: `${t("nav.dashboards.user-management")} `, },
        { title: "Users" },
    ]);
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<any>(null)

    const [selectedGroups, setSelectedGroups] = useState<{ label: string; value: string }[]>([]);

    const columns = [
        {
            field: "actions",
            pinned: "left",
            headerName: t("inwardList.tableHeaders.actions"),
            width: 110,
            suppressMovable: true,
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                const row: any = params?.node?.data ?? params?.data;
                return (
                    <div className="flex h-full items-center  gap-2">
                        <button
                            onClick={() => {
                                const groups =
                                    row?.groups?.map((group: any) => ({
                                        label: group.name,
                                        value: group.id,
                                    })) ?? [];

                                setSelectedGroups(groups);
                                setData(params?.data);

                                setOpen(true);
                            }}
                            className="cursor-pointer flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100">
                            Assign Group
                        </button>

                    </div>
                );
            },
        },
        {
            field: "employeeCode",
            headerName: "Employee Code",
            width: 140,
            valueGetter: (params: any) =>
                params.data?.attributes?.employee_code?.[0] ?? "",
        },
        {
            field: "employeeName",
            headerName: "Employee Name",
            width: 150,
            valueGetter: (params: any) =>
                `${params.data?.firstName ?? ""} ${params.data?.lastName ?? ""}`.trim(),
        },
        {
            field: "groups",
            headerName: "Assigned Groups ",
            width: 850,
            valueGetter: (params: any) => {
                const groups = params.data?.groups;
                return groups?.length
                    ? groups.map((group: any) => group.name).join(", ")
                    : "NA";
            },
        },
    ];

    const dispatch = useAppDispatch()

    const fields: SearchField[] = [
        { name: "firstAndLast", label: "First & Last Name", type: "text" },
        { name: "status", label: t("corporateMaster.search.recordStatus"), type: "dropdown", options: recordStatus }
    ];

    const { usersData, totalRecords } = useAppSelector((state) => state.broker);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);


    const handleSearch = async (data: Record<string, any>) => {
        setLoading(true);
        const payload = {
            search: data?.firstAndLast,
            ...(data?.status && {enabled: data.status === "Active"})};
        setFilters(payload)
        dispatch(fetchUsersData(payload));

        setLoading(false);
    };
    const handlePageChange = (p: number) => {
        setPage(p);
    };
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    useEffect(() => {
        dispatch(
            fetchUsersData({
                ...filters,
                page,
                size: pageSize,
            })
        );
    }, [page, pageSize, filters]);
    return (
        <>
            <Page title="User Management">
                <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
                    <CompactPageHeader
                        title="User Management"
                        totalRecords={totalRecords}
                        recordLabel="Users"
                        statusBadge="System Users"
                        onRefresh={() => dispatch(fetchUsersData({ page: 1, size: pageSize }))}
                    />

                    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
                        <CommonSearch
                            fields={fields}
                            onSearch={handleSearch}
                            isSubmitting={loading}
                            isState
                            showToggleButton={false}
                            isOpen={true}
                        />
                        <div className="flex min-h-0 flex-1 flex-col pt-1">
                            <AgGridSuperWrapper
                                rowData={usersData}
                                columnDefs={columns}
                                onRowClick={() => { }}
                                pageSize={pageSize}
                                height="100%"
                                pagination={false}
                            />
                        </div>
                        <Pagination
                            className="shrink-0 pt-1"
                            page={page}
                            pageSize={pageSize}
                            totalItems={totalRecords}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[20, 30, 50, 100]}
                        />
                    </div>
                </div>
            </Page>
            {open && (
                <CreateCorporateInwardModal
                    open={open}
                    onClose={() => setOpen(false)}
                    isUser
                    groupList={selectedGroups}
                    isData={data}
                />
            )}
        </>

    );
}
