import { documentApi2, eCardService, memberData, memberData2 } from "@/app/api/apiService";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import Pagination from "@/components/shared/Pagination";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { useDisclosure } from "@/hooks/useDisclosure";
import { fetchMemberServiceEndorsement } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { DocumentChartBarIcon, EyeIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import CommonSearch, { SearchField } from "../../../CommonSearch";
import DropdownButton from "../../../DropdownButton";
import CheckListButton from "../../../insurerManagement/IcCheckList/CheckListButton";
import ExportLoader from "../../../providerManagernt/provider-master/rohini-master/components/ExportLoader";
import CreateCorporateInwardModal from "../components/CreateCorporateInwardModal";
import { downloadFile, downloadFile2 } from "./Exportfuncation";
import EndorsementTabs, { getApiPayload, MainTabType, SubTabType } from "./member/EndorsementTabs";
import { useTranslation } from "react-i18next";
import { fetchMemberDocApi } from "../../PolicyDetails/InwardView";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import ProgressModal from "./ProgressModal";

export default function EndorsementMember() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const policyEndorsementId = queryParams.get("policyEndorsementId");
    const inwardNo = queryParams.get("inwardNo");
    const policyId = queryParams.get("policyId");
    const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
    const { memberDataForEnd, totalRecordsOfMemberData } = useAppSelector((state) => state.broker);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null)
    const [open, setOpen] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [activeMainTab, setActiveMainTab] = useState<MainTabType>("total");
    const [activeSubTab, setActiveSubTab] = useState<SubTabType>("success");

    const failFields: SearchField[] = [
        {
            name: "insuredMemberUniqueHealthIdentificationNumber",
            label: t("endorsementMemberList.search.memberId"),
            type: "text",
        },
        {
            name: "corporateEmployeeCode",
            label: t("endorsementMemberList.search.employeeId"),
            type: "text",
        },
        {
            name: "insuredMemberName",
            label: t("endorsementMemberList.search.insuredName"),
            type: "text",
        }
    ]

    const handleSearch = async (data: Record<string, any>) => {
        setLoading(true);
        const payloadFail = {
            insuredMemberUniqueHealthIdentificationNumber: data?.insuredMemberUniqueHealthIdentificationNumber,
            corporateEmployeeCode: data?.corporateEmployeeCode,
            insuredMemberName: data?.insuredMemberName,
        };
        if (policyEndorsementId) {
            const payload = getApiPayload(
                activeMainTab,
                activeSubTab,
                policyEndorsementId,
                page,
                pageSize
            );
            const mainpayload = {
                ...payloadFail,
                ...payload
            }

            dispatch(fetchMemberServiceEndorsement(mainpayload));
        }


        setLoading(false);
    };
    const handlePageChange = (p: number) => {
        setPage(p);
    };
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    const columns = [
        ...(activeSubTab === "success"
            ? [
                {
                    field: "actions",
                    headerName: t("endorsementMemberList.tableHeaders.action"),
                    width: 160,
                    pinned: "left",
                    sortable: false,
                    cellRenderer: (params: any) => (
                        <div className="flex gap-2">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();

                                    const payload = {
                                        healthCardNumber: params?.data?.insuredMemberHealthCardNo,
                                        corporateId: params?.data?.corporateId,
                                    };

                                    const mainPayload = {
                                        url: "/v1/ecards/pdf",
                                        params: payload,
                                        fileName: `${params?.data?.insuredMemberName}_${params?.data?.insuredMemberHealthCardNo}.pdf`,
                                        client: eCardService,
                                    };

                                    try {
                                        await downloadFile2({
                                            ...mainPayload,
                                        });
                                    } catch (err) {
                                        console.error("Download failed", err);
                                    } finally {
                                        setLoading2(false);
                                    }
                                }}
                                className="cursor-pointer flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                            >
                                {t("endorsementMemberList.buttons.viewECard")}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpen(true);
                                    setData(params?.data);
                                }}
                                className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                                title="View">
                                <EyeIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ),
                },
            ]
            : []),
        { field: "insuredMemberUniqueHealthIdentificationNumber", headerName: t("endorsementMemberList.tableHeaders.memberId"), width: 138, },
        { field: "corporateEmployeeCode", headerName: t("endorsementMemberList.tableHeaders.employeeId"), width: 100, },
        ...(activeMainTab !== "added" && activeSubTab !== "failed"
            ? [
                {
                    field: "insuredMemberHealthCardNo",
                    headerName: t("endorsementMemberList.tableHeaders.healthCardNumber"),
                    width: 137,
                    cellRenderer: (params: any) => {
                        const formatCardNumber = (value: string) => {
                            if (!value) return "";
                            return value.match(/.{1,4}/g)?.join("-") || value;
                        };

                        return (
                            <span title="Click to copy">
                                {formatCardNumber(params.value)}
                            </span>
                        );
                    },
                },
            ]
            : []),
        {
            field: "insuredMemberName",
            headerName: t("endorsementMemberList.tableHeaders.insuredName"),
            width: 210,
            cellRenderer: (params: any) => (
                <span style={{ whiteSpace: "pre" }}>
                    {params.value}
                </span>
            ),
        },
        {
            field: "insuredMemberDateOfBirth", headerName: t("endorsementMemberList.tableHeaders.dateOfBirth"), width: 100,
            valueFormatter: (params: any) => {
                if (!params.value) return "";
                return format(new Date(params.value), "dd MMM yyyy");
            },
        },
        { field: "insuredMemberAge", headerName: t("endorsementMemberList.tableHeaders.age"), width: 60, },
        { field: "insuredMemberGender", headerName: t("endorsementMemberList.tableHeaders.gender"), width: 70, },
        { field: "insuredMemberRelationshipWithSubscriber", headerName: t("endorsementMemberList.tableHeaders.relationship"), width: 96, },
        { field: "policySumInsured", headerName: t("endorsementMemberList.tableHeaders.sumInsured"), width: 96, },
        { field: "enrollmentAction", headerName: t("endorsementMemberList.tableHeaders.endorsementAction"), width: 180, },
        ...(activeSubTab === "failed" ? [{ field: "enrollmentStatusReason", headerName: t("endorsementMemberList.tableHeaders.reason"), width: 340 }] : []),
    ];

    const handleDownloadExcel = async () => {
        setLoading2(true);
        try {
            const downloadParams = { url: "/v1/member/download", params: { policyEndorsementId: policyEndorsementId, enrollmentStatus: "ENROLLED" }, fileName: "Member_Report_Endorse.xlsx" }

            await downloadFile({
                client: (activeMainTab === "total" && activeSubTab === "success") ? memberData : documentApi2,
                ...downloadParams,
            });
        } catch (err) {
            console.error("Download failed", err);
        } finally {
            setLoading2(false);
        }
    };

    const getDocuments = async () => {
        const URL = `/v1/files/presigned-url?inwardNo=${inwardNo}&s3BucketName=enrollment&s3SubBucketName=Error-files&documentType=Member Error File`;

        try {
            const response = await fetchMemberDocApi(URL);
            const documents = response?.data || [];
            if (documents.length === 0) {
                console.warn("No documents found.");
                return;
            }
            documents.forEach((doc: any) => {
                if (doc.downloadUrl) {
                    window.open(doc.downloadUrl, "_blank");
                }
            });
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    };


    const [progress, setProgress] = useState(0);
    type ProgressStatus = "PROCESSING" | "COMPLETED" | "FAILED";

    const [status, setStatus] = useState<ProgressStatus>("PROCESSING");
    const [remainingTime, setRemainingTime] = useState(0);
    const [showModal, setShowModal] = useState(true);
    const fetchStatus = async () => {
        const result = await fetchUser(memberData2, `/v1/enrollment/progress?&inwardNo=${inwardNo}&policyId=${policyId}&endorsementId=${policyEndorsementId}`);

        if (result?.success && result?.data) {
            const data = result.data.data;

            setStatus(data.status);
            setProgress(data.percentage);
            setRemainingTime(data.remainingTimeInSeconds);

            if (data.status === "PROCESSING") {
                setShowModal(true);
            } else if (data.status === "COMPLETED" || data.status === "FAILED") {
                // Keep popup visible for 3 seconds
                setShowModal(true);

                setTimeout(() => {
                    setShowModal(false);
                }, 2000);
            }

            return data.status;
        }

        return null;
    };

    useEffect(() => {
        let interval: any;

        const startPolling = async () => {
            const status = await fetchStatus();

            if (status === "PROCESSING") {
                interval = setInterval(async () => {
                    const currentStatus = await fetchStatus();

                    if (
                        currentStatus === "COMPLETED" ||
                        currentStatus === "FAILED"
                    ) {
                        clearInterval(interval);
                    }
                }, 1000);
            }
        };
        startPolling();
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);
    return (
        <>
            <Page title={t("endorsementMemberList.title")}>
                <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
                    <CompactPageHeader
                        title={t("endorsementMemberList.title")}
                        totalRecords={totalRecordsOfMemberData}
                        recordLabel="Members"
                        onRefresh={() => {
                            if (policyEndorsementId) {
                                const payload = getApiPayload(activeMainTab, activeSubTab, policyEndorsementId, page, pageSize);
                                dispatch(fetchMemberServiceEndorsement(payload));
                            }
                        }}
                    >
                        <CheckListButton
                            onClick={toggleSearch}
                            label={isSearchOpen ? t("insurer.buttons.hideSearch") : t("insurer.buttons.search")}
                            bgColor="bg-blue-600"
                            textColor="text-white"
                            size="text-xs"
                            className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
                            isSearch
                        />
                        {activeMainTab === "total" && (
                            <DropdownButton
                                buttonLabel={t("endorsementMemberList.buttons.downloadReport")}
                                items={[
                                    {
                                        label: t("endorsementMemberList.buttons.downloadExcel"),
                                        icon: (<DocumentChartBarIcon className="w-4 h-4 text-green-600" />),
                                        onClick: (activeMainTab === "total" && activeSubTab === "success") ? handleDownloadExcel : getDocuments,
                                    },
                                ]}
                            />
                        )}
                    </CompactPageHeader>

                    <EndorsementTabs
                        policyEndorsementId={policyEndorsementId}
                        memberDataForEnd={memberDataForEnd?.summary}
                        page={page}
                        pageSize={pageSize}
                        dispatch={dispatch}
                        fetchMemberServiceEndorsement={
                            fetchMemberServiceEndorsement
                        }
                        activeMainTab={activeMainTab}
                        setActiveMainTab={setActiveMainTab}
                        activeSubTab={activeSubTab}
                        setActiveSubTab={setActiveSubTab}
                        processingStatus={status}
                    />

                    <CommonSearch
                        fields={failFields}
                        onSearch={handleSearch}
                        isSubmitting={loading}
                        isState
                        showToggleButton={false}
                        isOpen={isSearchOpen}
                        onToggle={toggleSearch}
                    />

                    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
                        <AgGridSuperWrapper
                            rowData={memberDataForEnd?.members}
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
                        totalItems={totalRecordsOfMemberData}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        pageSizeOptions={[20, 30, 50, 100]}
                    />

                    {loading2 && (
                        <ExportLoader />
                    )}
                </div>
            </Page>
            {open && (
                <CreateCorporateInwardModal
                    open={open}
                    onClose={() => setOpen(false)}
                    isEndorsemenrtMemberView
                    isData={data?.stagingMemberEnrollmentId}
                />
            )}
            <ProgressModal
                open={showModal}
                progress={progress}
                status={status}
                remainingTime={remainingTime}
            />
        </>);
}