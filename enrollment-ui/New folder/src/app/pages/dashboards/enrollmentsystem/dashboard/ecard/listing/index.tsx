import { eCardService, putApi } from "@/app/api/apiService";
import { usePermission } from "@/app/auth/usePermission";
import { recordStatus } from "@/app/pages/AdminDepartment/tpabranches/dummyData";
import CommonSearch, { SearchField } from "@/app/pages/dashboards/CommonSearch";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { PageContent } from "@/components/shared/PageContent";
import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { Switch } from "@/components/ui";
import { fetchCorporateDatas, fetchPolicySearchDropdownData, fetchPolicyTemplateListing } from "@/store/features/Broker/BrokerSlice";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { EyeIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import CreateCorporateInwardModal from "../../components/CreateCorporateInwardModal";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";

export interface ECardConfForm {
    template: string;
    insurer_id: string;
    corporateId: string;
}

const ECardListing = () => {
    const { corporateData, policySearchDropdown, templateName, templateList, totalRecords } = useAppSelector((state) => state.broker);
    const { t } = useTranslation()
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
      useBreadcrumb([
        { title: t("nav.dashboards.enrollmentsystem") },
        { title: t("nav.dashboards.ecardmanagement") },
        { title: t("nav.dashboards.ecard") },
    ]);


    const corporateList = corporateData?.map((group: any) => ({
        label: group?.corporateName,
        value: group?.corporateId,
    }));
    const policyListNew = policySearchDropdown?.map((i: any) => ({
        value: i.policyId,
        label: i.policyNo,
    }));
    const templatesNamesList = templateName?.map((i: any) => ({
        value: i.templateConfigurationId,
        label: i.templateName,
    }));

    const fields: SearchField[] = [
        { name: "insurerId", label: t("corporateInward.searchFields.insurerName"), type: "dropdown", options: [], },
        { name: "corporateId", label: t("corporateInward.searchFields.corporateName"), type: "dropdown", options: corporateList, },
        { name: "policyId", label: t("corporateInward.searchFields.policyNumber"), type: "dropdown", options: policyListNew, },
        { name: "templateId", label: "Template", type: "dropdown", options: templatesNamesList, },
        { name: "active", label: t("brokerMaster.search.recordStatus"), type: "dropdown", options: recordStatus },
    ];


    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchCorporateDatas({ onlyName: true }));
        dispatch(fetchInsurers({ size: "100" }));
        dispatch(fetchPolicySearchDropdownData({ size: "2000" }));
        dispatch(fetchPolicyTemplateListing({ active: true }));
    }, [])

    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, any>>({});

    const handleSearch = async (data: Record<string, any>) => {
        setLoading(true);
        const payload = {
            insurerId: data?.insurerId,
            corporateId: data?.corporateId,
            policyId: data?.policyId,
            templateId: data?.templateId,
            active: data?.active !== "Inactive",
        }
        setFilters(payload)
        dispatch(fetchPolicyTemplateListing(payload));
        setLoading(false);
    };
    const handlePageChange = (p: number) => {
        setPage(p);
        fetchPolicyTemplateListing({ page: p, pageSize: pageSize })
    };

    const handlePageSizeChange = (size: number) => {
        setPage(1);
        setPageSize(size);
        fetchPolicyTemplateListing({ page: page, pageSize: size })
    };
    const { canWrite } = usePermission("enrollment");
    const [open, setOpen] = useState(false);
    interface SelectedData {
        labels: any[];
        insurerId?: string | null;
        corporateId?: string | null;
        policyId?: string | null;
    }

    const [selectedData, setSelectedData] = useState<SelectedData | null>(null);


    const columns = [
        {
            field: "action",
            headerName: "Action",
            width: 130,
            cellRenderer: (params: any) => {
                const row: any = params?.node?.data ?? params?.data;
                return (
                    <div className="flex items-center justify-center gap-1">
                        <div
                            className="flex h-6 items-center justify-center bg-blue-50 px-1.5 text-blue-600 hover:bg-blue-100" >
                            {canWrite && (
                                <Switch
                                    checked={row?.active}
                                    onChange={() => handleActiveToggle(row)}
                                />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(true)
                                setSelectedData({
                                    labels: row?.labels,
                                    insurerId: row?.insurerId,
                                    corporateId: row?.corporateId,
                                    policyId: row?.policyId,
                                });
                            }}
                            className="cursor-pointer flex h-6 w-6 items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="View"
                        >
                            <EyeIcon className="h-3.5 w-3.5" />
                        </button>
                    </div>
                );
            },
        },
        {
            field: "insurerName",
            headerName: "Insurer Name",
            width: 250,
        },
        {
            field: "corporateName",
            headerName: "Corporate Name",
            width: 230,
        },
        {
            field: "policyNo",
            headerName: "Policy Number",
            width: 150,
        },
        {
            field: "templateName",
            headerName: "Template Name",
            width: 270,
        },
        {
            field: "createdBy",
            headerName: "Created By",
            width: 140,
        },
        {
            field: "createdDate",
            headerName: "Created Date",
            width: 180,
            valueFormatter: (params: any) => {
                if (!params.value) return "";
                return format(new Date(params.value), "dd MMM yyyy hh:mm a");
            },
        },
    ];

    const handleActiveToggle = async (row: any) => {
        const statusValue = !row?.active; // Toggle the current status
        const endpoint = `/v1/ecards/${row?.templateConfigurationId}/status?active=${statusValue}`;
        const response = await putApi<any, any>(eCardService, endpoint, "")
        if (response?.success) {
            toast.success(response?.data?.message, { position: "top-right", duration: 5000 })
            dispatch(fetchPolicyTemplateListing({ active: filters?.active ? filters?.active : false }));
        } else {
            toast.error(response?.data?.error, { position: "top-right", duration: 5000 })
        }
    };
    return (
        <Page title="E-Card Template Configuration">
            <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
                <CompactPageHeader
                    title="E-Card Template Configuration"
                    totalRecords={totalRecords}
                    recordLabel="Templates"
                    statusBadge="Active Configurations"
                    onRefresh={() => dispatch(fetchPolicyTemplateListing({}))}
                />

                <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
                    <CommonSearch
                        fields={fields}
                        onSearch={handleSearch}
                        isSubmitting={loading}
                        isState
                        showToggleButton={false}
                        isOpen={true}
                        isTemplateNames={true}
                    />
                    <div className="flex min-h-0 flex-1 flex-col pt-1">
                        <AgGridSuperWrapper
                            rowData={templateList}
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
            {open && (
                <CreateCorporateInwardModal
                    open={open}
                    onClose={() => setOpen(false)}
                    isTempleteView
                    isData={selectedData}
                />
            )}
        </Page>
    );
};

export default ECardListing;