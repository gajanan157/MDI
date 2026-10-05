import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { PageContent } from "@/components/shared/PageContent";
import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchPolicySearchData } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { DocumentMagnifyingGlassIcon, EyeIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import CommonSearch, { SearchField } from "../../CommonSearch";
import { SectionCard } from "../dashboard/components/InwardDetailsView";
import { formatAmountWithWords } from "../dashboard/components/types";
import DocumentDropdown from "../dashboard/corporate/DocumentDropdown";
import CollapsibleSection from "./CollapsibleTabs";

export default function PolicySearch() {
    const { t } = useTranslation();

    useBreadcrumb([
        { title: t("nav.dashboards.enrollmentsystem") },
        { title: t("policySearch.breadcrumb.policySearch") }
    ]);
    const dispatch = useAppDispatch();
    const { policySearchData, totalRecords } = useAppSelector((state) => state.broker);

    const [loading, setLoading] = useState(false);
    const [isShow, setIsShow] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

    const fields: SearchField[] = [
        {
            name: "insurerId",
            label: t("policySearch.search.insurerName"),
            type: "dropdown",
            options: []
        },
        {
            name: "inwardNo",
            label: t("policySearch.search.inwardNumber"),
            type: "text"
        },
        {
            name: "policyNo",
            label: t("policySearch.search.policyNumber"),
            type: "text"
        },
        {
            name: "corporateName",
            label: t("policySearch.search.corporateName"),
            type: "text"
        }
    ];

    const handleSearch = async (data: Record<string, any>) => {
        setIsShow(true);
        setLoading(true);
        setSelectedPolicy(null);

        const payload = {
            insurerId: data?.insurerId,
            inwardNo: data?.inwardNo,
            policyNo: data?.policyNo,
            corporateName: data?.corporateName,
        };

        await dispatch(fetchPolicySearchData(payload));
        setLoading(false);
    };

    useEffect(() => {
        if (policySearchData?.length === 1) {
            setSelectedPolicy(policySearchData[0]);
        }
    }, [policySearchData]);

    const columns = [
        {
            field: "actions",
            pinned: "left",
            headerName: t("policySearch.table.actions"),
            width: 80,
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                const row = params?.data;
                return (
                    <div className="flex h-full items-center justify-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPolicy(row);

                                setTimeout(() => {
                                    document.getElementById("policy-details")?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                    });
                                }, 0);
                            }}
                            className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                            title="View"
                        >
                            <EyeIcon className="h-4 w-4" />
                        </button>
                    </div>
                );
            },
        },
        { field: "policy.policyNumber", headerName: t("policySearch.table.policyNumber") },
        { field: "policy.policyProposerName", headerName: t("policySearch.table.proposerName") },
        { field: "policy.insurerName", headerName: t("policySearch.table.insurerName") },
        {
            field: "policy.policyStartDate",
            headerName: t("policySearch.table.policyDate"),
            width: 200,
            cellRenderer: (params: any) => {
                const start = params?.data?.policy?.policyStartDate;
                const end = params?.data?.policy?.policyEndDate;
                if (!start || !end) return "";
                return `${format(new Date(start), "dd MMM yyyy")} - ${format(new Date(end), "dd MMM yyyy")}`;
            },
        },
        {
            field: "premiums.grossPremium",
            headerName: t("policySearch.table.grossPremium"),
            width: 200,
            valueGetter: (params: any) => {
                return (
                    params.data?.premiums
                        ?.map((p: any) => p.premiumGrossAmount)
                        .filter((amount: any) => amount != null)
                        .join(", ") ?? ""
                );
            },
        },
        { field: "policy.policyCoverageStructureType", headerName: t("policySearch.table.coverageType") },
        { field: "policy.brokerName", headerName: t("policySearch.table.brokerName") },
        { field: "policy.masterProductName", headerName: t("policySearch.table.masterProductName") },
        { field: "policy.policyStatus", headerName: t("policySearch.table.policyStatus") },
        { field: "policy.tpaServicingBranchName", headerName: t("policySearch.table.tpaServicingBranchName") },
    ];

    const handlePageChange = (p: number) => {
        setPage(p);
        dispatch(fetchPolicySearchData({ page: p, size: pageSize }));
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    useEffect(() => {
        dispatch(fetchPolicySearchData({ status: "ACTIVE" }));
    }, []);

    const policy = selectedPolicy?.policy;
    const tpaSpoc = selectedPolicy?.tpaSpoc;

    const policyGrossPremium =
        selectedPolicy?.premiums
            ?.map((p: any) => p.premiumGrossAmount)
            .filter(Boolean)
            .join(", ") ?? "-";

    const policyNetPremium =
        selectedPolicy?.premiums
            ?.map((p: any) => p.premiumNetAmount)
            .filter(Boolean)
            .join(", ") ?? "-";

    const tpaFees =
        selectedPolicy?.tpaFees
            ?.map((f: any) => `${f.policyTpaFeeValue}%`)
            .join(", ") ?? "-";

    const policyDate =
        policy?.policyStartDate && policy?.policyEndDate
            ? `${format(new Date(policy.policyStartDate), "dd MMM yyyy")} - ${format(
                new Date(policy.policyEndDate),
                "dd MMM yyyy"
            )}`
            : "-";

    const policyIssueDate = policy?.policyIssueDate
        ? format(new Date(policy.policyIssueDate), "dd MMM yyyy")
        : "-";
    const navigate = useNavigate()

    return (
        <Page title={t("policySearch.title")}>
            <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
                <CompactPageHeader
                    title={t("policySearch.title")}
                    totalRecords={policySearchData?.length ? policySearchData.length : null}
                    recordLabel="Policies"
                    statusBadge="Search & Lookup"
                />
                <CommonSearch
                    fields={fields}
                    onSearch={handleSearch}
                    isSubmitting={loading}
                    isState
                    showToggleButton={false}
                    isOpen={true}
                    isInsurer={true}
                    setIsShow={setIsShow}
                />

                {isShow && (
                    <>
                        {policySearchData?.length === 0 && (
                            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                    <DocumentMagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-800">
                                    No Policy Details Found
                                </h3>
                            </div>
                        )}
                        {policySearchData?.length > 1 && !selectedPolicy && (
                            <div className="flex min-h-0 flex-1 flex-col gap-1">
                                <AgGridSuperWrapper
                                    rowData={policySearchData}
                                    columnDefs={columns}
                                    onRowClick={() => { }}
                                    pageSize={20}
                                    height="100%"
                                    pagination={false}
                                />
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
                        )}
                        {selectedPolicy && (
                            <div>
                                <div className=" mt-2 flex gap-4 items-center">
                                    {policy?.inwardNo && (<DocumentDropdown inwardNo={policy.inwardNo} />)}
                                    <button 
                                    onClick={() => {
  const dummyPolicyNumber = policy?.dummyPolicyNumber;

  navigate(
    `/enrolment-system/member-data?policyId=${policy?.policyId}${
      dummyPolicyNumber ? `&dummyPolicyNumber=${dummyPolicyNumber}` : ''
    }`
  );
}}
                                        className="text-blue-600 hover:text-blue-800 underline text-sm font-medium cursor-pointer  mb-0"
                                    > {t("policySearch.viewMemberData")}</button>
                                </div>

                                <div className="mt-2">
                                    <CollapsibleSection
                                        items={[
                                            {
                                                key: "policy",
                                                title: t("policySearch.sections.policyInformation"),
                                                content: (
                                                    <SectionCard
                                                        fields={[
                                                            {
                                                                label: t("policySearch.details.policyNumber"),
                                                                value: policy?.policyNumber,
                                                            },
                                                            {
                                                                label: t("policySearch.details.previousPolicyNumber"),
                                                                value: policy?.previousPolicyNumber,
                                                            },
                                                            {
                                                                label: t("policySearch.details.policyDate"),
                                                                value: policyDate,
                                                            },
                                                            {
                                                                label: t("policySearch.details.policyInsurerType"),
                                                                value: policy?.policyInsurerType,
                                                            },
                                                            {
                                                                label: t("policySearch.details.policyTypeProposer"),
                                                                value: policy?.policyProposerType,
                                                            },
                                                            {
                                                                label: t("policySearch.details.proposerName"),
                                                                value: policy?.policyProposerName,
                                                            },
                                                            {
                                                                label: t("policySearch.details.proposerSector"),
                                                                value: policy?.policyProposerIndustrySectorName,
                                                            },
                                                            {
                                                                label: t("policySearch.details.agentCode"),
                                                                value: policy?.agentCode,
                                                            },
                                                            {
                                                                label: t("policySearch.details.recordType"),
                                                                value: policy?.policyRecordType,
                                                            },
                                                            {
                                                                label: t("policySearch.details.renewalType"),
                                                                value: policy?.policyRenewalType,
                                                            },
                                                            {
                                                                label: t("policySearch.details.structureType"),
                                                                value: policy?.policyCoverageStructureType,
                                                            },
                                                            {
                                                                label: t("policySearch.details.previousIssueDate"),
                                                                value: policyIssueDate,
                                                            },
                                                            {
                                                                label: t("policySearch.details.coveredFamilyCount"),
                                                                value: policy?.policyFamilyCoverCount,
                                                            },
                                                            {
                                                                label: t("policySearch.details.totalInsuredPersonAtInception"),
                                                                value: policy?.policyTotalInsuredPersonAtInception,
                                                            },
                                                            {
                                                                label: t("policySearch.details.totalEmployeeCountAtInception"),
                                                                value: policy?.policyTotalEmployeeCountAtInception,
                                                            },
                                                            {
                                                                label: t("policySearch.details.policyNetPremium"),
                                                                value: formatAmountWithWords(policyNetPremium),
                                                            },
                                                            {
                                                                label: t("policySearch.details.grossPremium"),
                                                                value: formatAmountWithWords(policyGrossPremium),
                                                            },
                                                            {
                                                                label: t("policySearch.details.policyStatus"),
                                                                value: policy?.policyStatus,
                                                            },
                                                        ]}
                                                    />
                                                ),
                                            },
                                            {
                                                key: "insurer",
                                                title: t("policySearch.sections.insurerInformation"),
                                                content: (
                                                    <SectionCard
                                                        fields={[
                                                            {
                                                                label: t("policySearch.details.insurerName"),
                                                                value: policy?.insurerName,
                                                            },
                                                            {
                                                                label: t("policySearch.details.insurerIssuingOfficeName"),
                                                                value: policy?.insurerIssuingOfficeName,
                                                            },
                                                        ]}
                                                        isShow
                                                    />
                                                ),
                                            },
                                            {
                                                key: "tpa",
                                                title: t("policySearch.sections.tpaInformation"),
                                                content: (
                                                    <SectionCard
                                                        fields={[
                                                            {
                                                                label: t("policySearch.details.tpaFees"),
                                                                value: tpaFees,
                                                            },
                                                            {
                                                                label: t("policySearch.details.tpaSpocName"),
                                                                value: tpaSpoc?.tpaSpocName,
                                                            },
                                                            {
                                                                label: t("policySearch.details.tpaSpocEmail"),
                                                                value: tpaSpoc?.tpaSpocEmailId?.join(", "),
                                                            },
                                                            {
                                                                label: t("policySearch.details.tpaSpocMobile"),
                                                                value: tpaSpoc?.tpaSpocMobileNo?.join(", "),
                                                            },
                                                            {
                                                                label: t("policySearch.details.tpaServicingBranchName"),
                                                                value: policy?.tpaServicingBranchName,
                                                            },
                                                        ]}
                                                        isShow
                                                    />
                                                ),
                                            },
                                            {
                                                key: "broker",
                                                title: t("policySearch.sections.brokerInformation"),
                                                content: (
                                                    <SectionCard
                                                        fields={[
                                                            {
                                                                label: t("policySearch.details.brokerName"),
                                                                value: policy?.brokerName,
                                                            },
                                                            {
                                                                label: t("policySearch.details.coverageType"),
                                                                value: policy?.policyCoverageStructureType,
                                                            },
                                                            {
                                                                label: t("policySearch.details.memberType"),
                                                                value: policy?.policyFamilyDefinitionName,
                                                            },
                                                            {
                                                                label: t("policySearch.details.masterProductName"),
                                                                value: policy?.masterProductName,
                                                            },
                                                        ]}
                                                        isShow
                                                    />
                                                ),
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Page>
    );
}