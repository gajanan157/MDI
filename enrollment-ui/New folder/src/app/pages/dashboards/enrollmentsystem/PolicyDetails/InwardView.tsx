import { documentApi2, getApi } from "@/app/api/apiService";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { Button } from "@/components/ui";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { FetchMasterProductDocumentsResponse } from "@/store/features/masterProduct/masterProductTypes";
import { showErrorMessage } from "@/utils/errorHandler";
import { ArrowDownTrayIcon, DocumentMagnifyingGlassIcon, EyeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import type { BulkIcMappingInwardDocumentNavState } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/config";
import { BULK_IC_MAPPING_LIST_PATH } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/config";


/** Extensions the browser can render directly in a new tab. */
const VIEWABLE_DOCUMENT_EXTENSIONS = [
    "pdf",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "bmp",
];

function resolveDocumentExtension(fileName?: string, url?: string): string {
    const source = (fileName || url || "").split("?")[0]?.split("#")[0] ?? "";
    return source.split(".").pop()?.toLowerCase().trim() ?? "";
}

function isViewableDocument(fileName?: string, url?: string): boolean {
    return VIEWABLE_DOCUMENT_EXTENSIONS.includes(
        resolveDocumentExtension(fileName, url),
    );
}

function openDocument(url: string): void {
    window.open(url, "_blank", "noopener,noreferrer");
}

function downloadDocument(url: string, fileName?: string): void {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
}

export const fetchInwardDocumentsAPI = async (
    id: string,
): Promise<any> => {
    const url = `v1/files/presigned-url?inwardNo=${id}`;

    const res = await getApi<FetchMasterProductDocumentsResponse>(
        documentApi2,
        url,
    );

    if (!res.success) {
        if (res?.status === 404) {
            console.log("error", res?.data?.message);
        } else {
            showErrorMessage(res);
        }
    }

    if (!res.data) {
        throw new Error("No data returned from server");
    }

    return res.data;
};
export const fetchMemberDocApi = async (
    url: string
): Promise<any> => {
    const res = await getApi<FetchMasterProductDocumentsResponse>(
        documentApi2,
        url,
    );

    if (!res.success) {
        if (res?.status === 404) {
            console.log("error", res?.data?.message);
        } else {
            showErrorMessage(res);
        }
    }

    if (!res.data) {
        throw new Error("No data returned from server");
    }

    return res.data;
};
export default function InwardView() {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = (location.state as BulkIcMappingInwardDocumentNavState | null)
        ?.returnPath;
    const isProviderDashboardReturn = returnPath === "/provider-masters/dashboard";
    const isBulkIcMappingReturn =
        Boolean(returnPath) &&
        !isProviderDashboardReturn &&
        (returnPath === BULK_IC_MAPPING_LIST_PATH ||
            returnPath?.includes("/ic-corporate-mapping"));

    const { t } = useTranslation();

    useBreadcrumb(
        isProviderDashboardReturn
            ? [
                { title: "Provider Management" },
                { title: "Dashboard", path: returnPath },
                { title: t("inwardView.breadcrumb.viewInward") },
                { title: params?.id || "" },
            ]
            : isBulkIcMappingReturn
            ? [
                { title: "Provider Management" },
                { title: "Provider Master" },
                { title: "IC & Corp Provider Mapping", path: BULK_IC_MAPPING_LIST_PATH },
                { title: "Bulk Ic Mapping", path: returnPath },
                { title: t("inwardView.breadcrumb.viewInward") },
                { title: params?.id || "" },
            ]
            : returnPath
            ? [
                { title: "Provider Management" },
                { title: "Provider Master", path: returnPath },
                { title: t("inwardView.breadcrumb.viewInward") },
                { title: params?.id || "" },
            ]
            : [
                { title: t("inwardView.breadcrumb.inwardManagement") },
                {
                    title: t("inwardView.breadcrumb.inward"),
                    path: "/inward-management/inward",
                },
                { title: t("inwardView.breadcrumb.viewInward") },
                { title: params?.id || "" },
            ],
    );
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const inwardNo = params?.id;


    useEffect(() => {
        if (!inwardNo) return;

        const getDocuments = async () => {
            try {
                setLoading(true);

                const response = await fetchInwardDocumentsAPI(inwardNo);
                setDocuments(response?.data);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
                setDocuments([]);

            } finally {
                setLoading(false);
            }
        };

        getDocuments();

    }, [inwardNo]);

    interface FileCellRendererProps {
        data: {
            fileName: string;
            downloadUrl?: string;
        };
    }

    const FileCellRenderer = ({ data }: FileCellRendererProps) => {
        const hasUrl = Boolean(data.downloadUrl);

        if (!hasUrl) {
            return (
                <div className="flex items-center rounded-md px-2 py-1 text-xs text-gray-400">
                    {data.fileName}
                </div>
            );
        }

        const viewable = isViewableDocument(data.fileName, data.downloadUrl);
        const ActionIcon = viewable ? EyeIcon : ArrowDownTrayIcon;

        return (
            <button
                type="button"
                onClick={() =>
                    viewable
                        ? openDocument(data.downloadUrl as string)
                        : downloadDocument(data.downloadUrl as string, data.fileName)
                }
                title={
                    viewable
                        ? t("inwardView.actions.openInNewTab")
                        : t("inwardView.actions.download")
                }
                className="group flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition hover:bg-blue-50"
            >
                <span className="truncate text-sm font-medium text-blue-700 group-hover:underline">
                    {data.fileName}
                </span>

                <ActionIcon className="h-4 w-4 text-blue-500 opacity-0 transition group-hover:opacity-100" />
            </button>
        );
    };

    const documentColumns = useMemo(
        () => [
            {
                headerName: t("inwardView.tableHeaders.srNo"),
                valueGetter: (params: any) =>
                    (params.node?.rowIndex ?? 0) + 1,
                width: 70,
                sortable: false,
                filter: false,
            },
            {
                field: "fileName",
                headerName: t("inwardView.tableHeaders.documentName"),
                flex: 1,
                minWidth: 220,
                cellRenderer: (params: any) => <FileCellRenderer data={params.data} />,
            },
            { field: "documentType", headerName: t("inwardView.tableHeaders.documentType") },

            {
                field: "action",
                headerName: t("inwardView.tableHeaders.action"),
                width: 130,
                sortable: false,
                filter: false,
                cellRenderer: (params: any) => {
                    const row = params.data;
                    const hasUrl = !!row?.downloadUrl;
                    const viewable = isViewableDocument(row?.fileName, row?.downloadUrl);
                    const ActionIcon = viewable ? EyeIcon : ArrowDownTrayIcon;

                    return (
                        <div className="flex items-center justify-center gap-2">
                            {hasUrl ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        viewable
                                            ? openDocument(row.downloadUrl)
                                            : downloadDocument(row.downloadUrl, row.fileName)
                                    }
                                    className="rounded-md p-1 text-blue-600 transition hover:bg-blue-50"
                                    title={
                                        viewable
                                            ? t("inwardView.actions.openInNewTab")
                                            : t("inwardView.actions.download")
                                    }
                                >
                                    <ActionIcon className="h-4 w-4" />
                                </button>
                            ) : (
                                <EyeIcon className="h-4 w-4 text-gray-300" />
                            )}
                        </div>
                    );
                },
            },
        ],
        []
    );
    return (
        <Page title="Inward Documents">
            <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
                <CompactPageHeader
                    title="Inward Documents"
                    totalRecords={documents?.length || 0}
                    recordLabel="Documents"
                    statusBadge={inwardNo ? `Inward: ${inwardNo}` : undefined}
                    onRefresh={() => {
                        if (inwardNo) {
                            fetchInwardDocumentsAPI(inwardNo).then((res) => setDocuments(res?.data)).catch(() => {});
                        }
                    }}
                >
                    <Button
                        color="neutral"
                        className="h-7 text-xs px-2 flex items-center gap-1 shadow-2xs"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        <span>Back</span>
                    </Button>
                </CompactPageHeader>

                <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
                    {!loading && documents?.length === 0 ? (
                        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
                            <div className="mb-2 rounded-full bg-slate-100 p-3">
                                <DocumentMagnifyingGlassIcon className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-800">
                                {t("inwardView.emptyState.title")}
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-slate-500">
                                {t("inwardView.emptyState.description")}
                            </p>
                        </div>
                    ) : (
                        <AgGridSuperWrapper
                            rowData={documents}
                            columnDefs={documentColumns}
                            height="100%"
                            pagination={true}
                            pageSize={20}
                        />
                    )}
                </div>
            </div>
        </Page>
    );
}
