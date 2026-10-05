import { Page } from "@/components/shared/Page";
import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import CheckListButton from "../../../insurerManagement/IcCheckList/CheckListButton";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useEffect, useState } from "react";
import CommonSearch, { SearchField } from "../../../CommonSearch";
import { fetchCorporateDatas } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

const PolicyMapping: React.FC = () => {
    useBreadcrumb([
        { title: "Policy Mapping", },
    ]);
    const { totalRecords } = useAppSelector((state) => state.broker);
    const [page, setPage] = useState(1);
    const dispatch = useAppDispatch()
    const [pageSize, setPageSize] = useState(20);
    const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
    const { corporateData } = useAppSelector((state) => state.broker);
    const columns = [
        {
            field: "insurerName",
            headerName: "Insurer Name",
            width: 190,
        },
        {
            field: "corporateName",
            headerName: "Corporate Name",
            width: 190,
        },
        {
            field: "policyNo",
            headerName: "Policy Number",
            width: 190,
        },
        {
            field: "enrollmentType",
            headerName: "Inward Type",
            width: 190,
        },
        {
            field: "enrollmentType",
            headerName: "Policy Start - End Date",
            width: 190,
        },
    ];

    const corporateDataListNew = corporateData?.map((i: any) => ({
        value: i?.corporateId,
        label: i?.corporateName,
    }));
    const fields: SearchField[] = [
        { name: "insurerId", label: "Insurer Name", type: "dropdown", options: [] },
        { name: "corporateId", label: "Corporate Name", type: "dropdown", options: corporateDataListNew },
        {
            name: "policyNo",
            label: "Policy Number", type: "text"
        },
    ];
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, any>>({});
    

    useEffect(()=>{
        dispatch(fetchCorporateDatas({ onlyName: true }));

    },[])
    const handleSearch = async (data: Record<string, any>) => {
        setLoading(true);
        const payload = {
            corporateId: data?.corporateId,
            policyNo: data?.policyNo,
            insurerId: data?.insurerId,
        }
        setFilters(payload)
        setLoading(false);
    };
    const handlePageChange = (p: number) => {
        setPage(p);
    };
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    return (
        <Page title="Policy Mapping">
            <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
                <CompactPageHeader
                    title="Policy Mapping"
                    totalRecords={totalRecords || 0}
                    recordLabel="Policies"
                    onRefresh={() => {
                        dispatch(fetchCorporateDatas({ onlyName: true }));
                    }}
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
                </CompactPageHeader>

                <CommonSearch
                    fields={fields}
                    onSearch={handleSearch}
                    isSubmitting={loading}
                    title="TPA Branch Filters"
                    isState
                    showToggleButton={false}
                    isOpen={isSearchOpen}
                    onToggle={toggleSearch}
                    isInsurer={true}
                />

                <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
                    <AgGridSuperWrapper
                        rowData={[]}
                        columnDefs={columns}
                        onRowClick={() => { }}
                        pageSize={pageSize}
                        height="100%"
                        pagination={false}
                        totalItems={totalRecords}
                    />
                </div>

                <Pagination
                    className="shrink-0"
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalRecords}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[20, 30, 50, 100]}
                />
            </div>
        </Page>
    );
};

export default PolicyMapping;
