import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { fetchCorporateInwardData } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CreateCorporateInwardModal from "../CreateCorporateInwardModal";
import { useNotificationListener } from "@/app/contexts/notifications/context";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

export default function OtherSources() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { corporateInwardData, totalRecords } = useAppSelector(
    (state) => state.broker
  );

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  useEffect(() => {
    dispatch(
      fetchCorporateInwardData({
        page,
        size: pageSize,
      })
    );
  }, [page, pageSize, dispatch]);

  // Another admin (or this one) assigned a work item: reload so the grid stays current.
  useNotificationListener("WORK_ITEM_ASSIGNED", () => {
    dispatch(fetchCorporateInwardData({ page, size: pageSize }));
  });

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedInward, setSelectedInward] = useState<any>(null);

  const formatUserName = (name: string) => {
    return name
      ?.replace(/\./g, " ")
      .split(" ")
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  };

  const statusMeta: Record<
    string,
    { label: string; bg: string; dot: string; text: string }
  > = {
    PROCESSOR_PENDING: {
      label: "Processor Pending",
      bg: "bg-amber-50 border-amber-200/80",
      dot: "bg-amber-500",
      text: "text-amber-800",
    },
    UNDER_PROCESS: {
      label: "Under Process",
      bg: "bg-sky-50 border-sky-200/80",
      dot: "bg-sky-500",
      text: "text-sky-800",
    },
    COMPLETED: {
      label: "Completed",
      bg: "bg-emerald-50 border-emerald-200/80",
      dot: "bg-emerald-500",
      text: "text-emerald-800",
    },
    ON_HOLD: {
      label: "On Hold",
      bg: "bg-orange-50 border-orange-200/80",
      dot: "bg-orange-500",
      text: "text-orange-800",
    },
    REJECTED: {
      label: "Rejected",
      bg: "bg-rose-50 border-rose-200/80",
      dot: "bg-rose-500",
      text: "text-rose-800",
    },
    REJECTED_INWARD: {
      label: "Rejected Inward",
      bg: "bg-rose-50 border-rose-200/80",
      dot: "bg-rose-500",
      text: "text-rose-800",
    },
    ONBOARDING_PENDING: {
      label: "Onboarding Pending",
      bg: "bg-purple-50 border-purple-200/80",
      dot: "bg-purple-500",
      text: "text-purple-800",
    },
    QC_PENDING: {
      label: "QC Pending",
      bg: "bg-indigo-50 border-indigo-200/80",
      dot: "bg-indigo-500",
      text: "text-indigo-800",
    },
  };

  const columns = [
    {
      field: "actions",
      headerName: t("corporateInward.columns.action"),
      width: 230,
      pinned: "left",
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const handleAssign = (e: React.MouseEvent) => {
          e.stopPropagation();
          setSelectedInward(params?.data);
          setIsAssignOpen(true);
        };

        const status = params?.data?.status;
        const toUserName = params?.data?.toUserName;
        const isReassign = Boolean(toUserName);
        const formattedUserName = toUserName ? formatUserName(toUserName) : "";

        if (status === "REJECTED_INWARD") {
          return (
            <div className="flex h-full items-center">
              <span className="text-xs font-medium text-slate-400">
                Unassigned
              </span>
            </div>
          );
        }

        if (status === "COMPLETED") {
          return (
            <div className="flex h-full items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              {isReassign ? (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                  title={formattedUserName}
                >
                  <UserIcon className="h-3 w-3 text-slate-500" />
                  {formattedUserName}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400">
                  Completed
                </span>
              )}
            </div>
          );
        }

        return (
          <div className="flex h-full items-center gap-2">
            {isReassign && (
              <span
                className="inline-flex max-w-[110px] items-center gap-1 truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                title={formattedUserName}
              >
                <UserIcon className="h-3 w-3 text-slate-500 shrink-0" />
                <span className="truncate">{formattedUserName}</span>
              </span>
            )}
            <button
              onClick={handleAssign}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition-all duration-150 cursor-pointer ${
                isReassign
                  ? "bg-amber-600 hover:bg-amber-700 active:scale-95"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              {isReassign ? (
                <>
                  <ArrowPathIcon className="h-3.5 w-3.5" />
                  <span>Reassign</span>
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-3.5 w-3.5" />
                  <span>Assign</span>
                </>
              )}
            </button>
          </div>
        );
      },
    },
    {
      field: "inwardNo",
      headerName: t("corporateInward.columns.inwardNumber"),
      width: 150,
      pinned: "left",
      cellRenderer: (params: any) => (
        <span className="font-mono text-xs font-bold text-blue-600">
          {params.value}
        </span>
      ),
    },
    {
      field: "policyNo",
      headerName: t("corporateInward.columns.policyNumber"),
      width: 170,
      cellRenderer: (params: any) => (
        <span className="font-mono text-xs font-medium text-slate-800">
          {params.value || "—"}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: t("corporateInward.columns.inwardDateTime"),
      width: 165,
      valueFormatter: (params: any) => {
        if (!params.value) return "";
        try {
          return format(new Date(params.value), "dd MMM yyyy, hh:mm a");
        } catch {
          return params.value;
        }
      },
    },
    {
      field: "enrollmentType",
      headerName: t("corporateInward.columns.inwardType"),
      width: 130,
      cellRenderer: (params: any) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {params.value}
        </span>
      ),
    },
    {
      field: "documentType",
      headerName: t("corporateInward.columns.documentType"),
      width: 160,
    },
    {
      field: "policyRecordType",
      headerName: "Record Type",
      width: 130,
      cellRenderer: (params: any) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
            params.value === "LIVE"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {params.value || "LIVE"}
        </span>
      ),
    },
    {
      field: "insurerName",
      headerName: t("corporateInward.columns.insurerName"),
      width: 190,
    },
    {
      field: "corporateName",
      headerName: t("corporateInward.columns.corporateName"),
      width: 190,
    },
    {
      field: "status",
      headerName: t("corporateInward.columns.status"),
      minWidth: 170,
      cellRenderer: (params: any) => {
        const status = params.value;
        const meta = statusMeta[status] || {
          label: status?.replaceAll("_", " ") || "UNKNOWN",
          bg: "bg-slate-50 border-slate-200",
          dot: "bg-slate-400",
          text: "text-slate-700",
        };

        return (
          <div className="flex h-full items-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              <span>{meta.label}</span>
            </span>
          </div>
        );
      },
    },
    {
      field: "latestRemark",
      headerName: t("corporateInward.columns.remark"),
      width: 250,
      cellRenderer: (params: any) => (
        <span className="text-xs text-slate-500 italic">
          {params.value || "No remarks"}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <AgGridSuperWrapper
            rowData={corporateInwardData}
            columnDefs={columns}
            onRowClick={() => {}}
            pageSize={pageSize}
            height="100%"
            pagination={false}
            totalItems={totalRecords}
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
      {isAssignOpen && (
        <CreateCorporateInwardModal
          open={isAssignOpen}
          onClose={() => {
            setIsAssignOpen(false);
            // Reload so the new assignee and button state show without a page refresh.
            dispatch(fetchCorporateInwardData({ page, size: pageSize }));
          }}
          isAssignOpen
          isData={selectedInward}
        />
      )}
    </>
  );
}