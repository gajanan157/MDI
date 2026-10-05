import { useRole } from "@/app/auth/usePermission";
import CompactStatCard from "@/components/shared/CompactStatCard";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { Page } from "@/components/shared/Page";
import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { Button } from "@/components/ui";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useDisclosure } from "@/hooks/useDisclosure";
import { fetchCorporateDatas, fetchCorporateInwardDataOfWork, fetchCorporateInwardDataStatusCount, fetchInwardDatasOnlyDropdown } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ArrowPathIcon, CheckCircleIcon, ClipboardDocumentCheckIcon, ClockIcon, ExclamationTriangleIcon, EyeIcon, InboxIcon, PlusIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import CommonSearch, { SearchField } from "../../../CommonSearch";
import CheckListButton from "../../../insurerManagement/IcCheckList/CheckListButton";
import CreateCorporateInwardModal from "../components/CreateCorporateInwardModal";
import InfoIcon from "../components/forms/InfoIcon";
import { refreshPage } from "./Exportfuncation";
import RejectInwardModal from "./RejectInwardModal";
const CARD_ICONS: Record<string, any> = {
    "Total Inwards": InboxIcon,
    Pending: ClockIcon,
    "In Progress": ExclamationTriangleIcon,
    Completed: CheckCircleIcon,
    "QC Pending": ClipboardDocumentCheckIcon,
    "Master Update Pending": ArrowPathIcon,
    "Rejected Inward": ExclamationTriangleIcon,
};
export const STATUS = {
    ALL: "ALL",
    PROCESSOR_PENDING: "PROCESSOR_PENDING",
    UNDER_PROCESS: "UNDER_PROCESS",
    QC_PENDING: "QC_PENDING",
    COMPLETED: "COMPLETED",
    REJECTED_INWARD: "REJECTED_INWARD",
    ONBOARDING_PENDING: "ONBOARDING_PENDING",
} as const;

export type InwardStatus = typeof STATUS[keyof typeof STATUS];
export type InwardRow = {
    inwardNo: string;
    policyNumber: string;
    policyType: string;
    status: InwardStatus;
    receivedAt: string;
};
export type CardProps = {
    title: string;
    count?: number;
    onClick?: () => void;
    active?: boolean;
    height?: string;
    width?: string;
    className?: string;
};
export const Card = ({ title, count, onClick, active, height, width, className }: CardProps) => {
    const Icon = CARD_ICONS[title];
    return (
        <CompactStatCard
            variant="bordered"
            title={title}
            count={count}
            onClick={onClick}
            active={active}
            icon={Icon ? <Icon className="h-4 w-4" /> : undefined}
            height={height}
            width={width}
            className={className}
        />
    );
};
const CorporateInward: React.FC = () => {
    const { t } = useTranslation()

    useBreadcrumb([
        { title: t("nav.dashboards.enrollmentsystem") },
        { title: t("corporateInward.breadcrumb.dashboard"), path: "/enrolment-system/dashboard" },
        { title: t("corporateInward.breadcrumb.corporateInward") },
    ]);
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { corporateInwardDataForWorkFLow, totalRecords, statusCount, corporateData, inwardNumberData } = useAppSelector((state) => state.broker);
    const { isQC, isProcessor, enrollmentType } = useRole();
    const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [selectedOcrId, setSelectedOcrId] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<InwardStatus>(STATUS.ALL);

    const columns = [
        ...(selectedStatus === "REJECTED_INWARD"
            ? []
            : [
                {
                    field: "actions",
                    headerName: t("corporateInward.columns.action"),
                    width: 80,
                    pinned: "left",
                    sortable: false,
                    filter: false,

                    cellRenderer: (params: any) => {
                        const isRejected = params?.data?.status === "REJECTED_INWARD";
                        return (
                            <div className="flex h-full items-center gap-2">
                                {!isRejected && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            navigate(
                                                `/enrolment-system/corporate-enrolment/${params?.data?.id}?status=${params?.data?.status}&inwardType=${params?.data?.enrollmentType}&inwardNo=${params?.data?.inwardNo}&policyNo=${params?.data?.policyNo}&documentType=${params?.data?.documentType}&policyRecordType=${params?.data?.policyRecordType}`
                                            );
                                        }}
                                        className="flex cursor-pointer items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                                    >
                                        <EyeIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        );
                    },
                },
            ]), {
            headerName: t("corporateInward.columns.srNo"),
            valueGetter: (params: any) => (params.node?.rowIndex ?? 0) + 1,
            width: 70,
            pinned: "left",
            sortable: false,
            filter: false,
        },
        {
            field: "inwardNo",
            headerName: t("corporateInward.columns.inwardNumber"),
            width: 130,
            pinned: "left",
        },
        { field: "policyNo", headerName: t("corporateInward.columns.policyNumber"), width: 170, },
        {
            field: "createdAt",
            headerName: t("corporateInward.columns.inwardDateTime"),
            width: 160,
            valueFormatter: (params: any) => {
                if (!params.value) return "";

                return format(
                    new Date(params.value),
                    "dd MMM yyyy hh:mm a"
                );
            }
        },
        {
            field: "enrollmentType",
            headerName: t("corporateInward.columns.inwardType"),
            width: 120,
        },
        {
            field: "documentType",
            headerName: t("corporateInward.columns.documentType"),
            width: 150,
        },
        {
            field: "policyRecordType",
            headerName: "Policy Record Type",
            width: 150,
        },
        {
            field: "insurerName",
            headerName: t("corporateInward.columns.insurerName"),
            width: 120,
        },
        {
            field: "corporateName",
            headerName: t("corporateInward.columns.corporateName"),
            width: 120,
        },
        {
            field: "status",
            headerName: t("corporateInward.columns.status"),
            minWidth: 150,
            cellRenderer: (params: any) => {
                const status = params.value;
                const styles: Record<string, string> = {
                    PROCESSOR_PENDING: "bg-yellow-100 text-yellow-700",
                    UNDER_PROCESS: "bg-blue-100 text-blue-700",
                    COMPLETED: "bg-green-100 text-green-700",
                    ON_HOLD: "bg-orange-100 text-orange-700",
                    REJECTED: "bg-red-100 text-red-700",
                    REJECTED_INWARD: "bg-rose-100 text-rose-700",
                    ONBOARDING_PENDING: "bg-purple-100 text-purple-700",
                    QC_PENDING: "bg-indigo-100 text-indigo-700",
                };
                const clickable = (status === "PROCESSOR_PENDING" || status === "QC_PENDING");
                return (
                    <>
                        <button
                            onClick={(e) => {
                                if (!clickable) return;

                                e.stopPropagation();
                                setSelectedOcrId(params?.data?.id);


                                setOpen2(true);
                            }}
                            className={`rounded px-2 py-1 text-xs ${styles[status]} ${clickable ? "cursor-pointer hover:opacity-80" : ""
                                }`}>
                            {status?.replaceAll("_", " ")}
                        </button>
                        {
                            clickable && (

                                <InfoIcon
                                    show={true}
                                    message='Click here to more details'
                                />
                            )
                        }
                    </>
                );
            },
        },
        {
            field: "latestRemark",
            headerName: t("corporateInward.columns.remark"),
            width: 300,
        },
    ];

    useEffect(() => {
        dispatch(fetchCorporateDatas({ onlyName: true }));
        dispatch(fetchInwardDatasOnlyDropdown({ lightweight: true }));
    }, [])

    const corporateDataListNew = corporateData?.map((i: any) => ({
        value: i?.corporateId,
        label: i?.corporateName,
    }));
    const inwardNumberDataListNew = inwardNumberData?.map((i: any) => ({
        value: i?.inwardNo,
        label: i?.inwardNo,
    }));

    const cards = [
        { title: t("corporateInward.cards.totalInwards"), key: STATUS.ALL, visible: true },
        { title: t("corporateInward.cards.pending"), key: STATUS.PROCESSOR_PENDING, visible: isProcessor },
        { title: t("corporateInward.cards.qcPending"), key: STATUS.QC_PENDING, visible: isQC },
        { title: t("corporateInward.cards.masterUpdatePending"), key: STATUS.ONBOARDING_PENDING, visible: isProcessor },
        { title: t("corporateInward.cards.completed"), key: STATUS.COMPLETED, visible: true },
        { title: t("corporateInward.cards.rejectedInward"), key: STATUS.REJECTED_INWARD, visible: true },
    ];
    const fields: SearchField[] = [
        { name: "insurerId", label: t("corporateInward.searchFields.insurerName"), type: "dropdown", options: [] },
        { name: "inwardNo", label: t("corporateInward.searchFields.inwardNumber"), type: "dropdown", options: inwardNumberDataListNew },
        { name: "corporateId", label: t("corporateInward.searchFields.corporateName"), type: "dropdown", options: corporateDataListNew },
        { name: "policyNo", label: t("corporateInward.searchFields.policyNumber"), type: "text" },
        { name: "fromDate", label: t("corporateInward.searchFields.startDate"), type: "date" },
        { name: "toDate", label: t("corporateInward.searchFields.endDate"), type: "date" },
    ];

    const handleSearch = async (data: Record<string, any>) => {
        setLoading(true);
        const payload = {
            inwardNo: data?.inwardNo,
            corporateId: data?.corporateId,
            policyNo: data?.policyNo,
            insurerId: data?.insurerId,
            fromDate: data?.fromDate,
            toDate: data?.toDate,
            ...(enrollmentType && { enrollmentType }),

        }
        dispatch(fetchCorporateInwardDataOfWork(payload));

        setLoading(false);
    };

    const handlePageChange = (p: number) => {
        setPage(p);
    };
    const rolePayload = (() => {
        if (isQC) {
            return { isQc: true };
        }
        if (isProcessor) {
            return { isProcessor: true };
        }
        return {};
    })();

    const handleStatusClick = (status: InwardStatus) => {
        setSelectedStatus(status);

        if (status === "ALL") {
            dispatch(fetchCorporateInwardDataOfWork({
                page,
                size: pageSize,
                ...rolePayload,
                ...(enrollmentType && { enrollmentType }),


            })
            );
        } else {
            dispatch(fetchCorporateInwardDataOfWork({
                page,
                size: pageSize,
                status,
                ...rolePayload,
                ...(enrollmentType && { enrollmentType }),

            })
            );
        }
    };

    useEffect(() => {
        dispatch(fetchCorporateInwardDataOfWork({
            page,
            size: pageSize,
            ...rolePayload,
            ...(enrollmentType && { enrollmentType }),

        })
        );
        dispatch(fetchCorporateInwardDataStatusCount(rolePayload));
    }, [page, pageSize, isQC, isProcessor]);

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    const visibleCards = cards?.filter(card => card?.visible && card?.key !== STATUS.ALL);
    const totalVisibleCount = visibleCards?.reduce((sum, card) => {
        return sum + (statusCount?.[card.key] || 0);
    }, 0);


    return (

        <Page title={t("corporateInward.pageTitle")}>
            <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col justify-start p-2.5 overflow-hidden space-y-1.5">
                <CompactPageHeader
                    title={t("corporateInward.pageTitle")}
                    totalRecords={totalRecords}
                    recordLabel="Inwards"
                    statusBadge="Intake Pipeline"
                    onRefresh={refreshPage}
                >
                    <CheckListButton
                        onClick={toggleSearch}
                        label={isSearchOpen ? t("branch.hideSearch") : t("branch.search")}
                        bgColor="bg-blue-600"
                        textColor="text-white"
                        size="text-xs"
                        className="flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-0!"
                        isSearch
                    />
                    <Button
                        color="primary"
                        className="flex h-8 items-center gap-1 rounded-lg px-3 py-0! text-xs font-semibold"
                        onClick={() => setOpen(true)}
                        title={t("corporateInward.buttons.createManualInward")}
                    >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        {t("corporateInward.buttons.createManualInward")}
                    </Button>
                </CompactPageHeader>

                <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
                    {cards
                        ?.filter(card => card?.visible)
                        ?.map(card => (
                            <Card
                                key={card.key}
                                title={card.title}
                                count={card.key === STATUS.ALL ? totalVisibleCount : statusCount?.[card.key]}
                                active={selectedStatus === card.key}
                                onClick={() => handleStatusClick(card.key)}
                            />
                        ))}
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-1">
                    <CommonSearch
                        fields={fields}
                        onSearch={handleSearch}
                        isSubmitting={loading}
                        isState
                        showToggleButton={false}
                        isOpen={isSearchOpen}
                        onToggle={toggleSearch}
                        isInsurer={true}
                    />
                    <div className="flex min-h-0 flex-1 flex-col">
                        <AgGridSuperWrapper
                            rowData={corporateInwardDataForWorkFLow}
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
            </div>
            {open && (
                <CreateCorporateInwardModal
                    open={open}
                    onClose={() => setOpen(false)}
                    isCorporateInward
                />
            )}
            <RejectInwardModal
                open={open2}
                ocrId={selectedOcrId}
                onClose={() => setOpen2(false)}
                onSuccess={() => {
                    // Refresh your grid or call your API again
                    // getCorporateInwardList();
                }}
            />
        </Page>
    );
};
export default CorporateInward;