// src/pages/MainPage.tsx
import { deleteApi, masterApi, patchApi } from "@/app/api/apiService";
import {
  ConfirmMessages,
  ConfirmModal,
  ModalState,
} from "@/components/shared/ConfirmModal";
import Pagination from "@/components/shared/Pagination";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { Switch } from "@/components/ui";
import AddButton from "@/components/ui/AddButton";
import { useDisclosure } from "@/hooks";
import { fetchTPABranches } from "@/store/features/tpa/tpaSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { handleApiResponse } from "@/utils/errorHandler";
import { ExclamationTriangleIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import CommonSearch, { SearchField } from "../../dashboards/CommonSearch";
import CheckListButton from "../../dashboards/insurerManagement/IcCheckList/CheckListButton";
import { recordStatus, serviceAreaJson } from "./dummyData";
import { usePermission } from "@/app/auth/usePermission";
import TPABranchesMobileView from "./TPABranchesMobileView";
import { useTranslation } from "react-i18next";

type GridRow = {
  tpaBranchId: string;
  recordStatus: string;
  id: number;
  branchName: string;
  branchCode: string;
  address: string;
  city: string;
  stateName: string;
  contactPhone: string;
  contactEmail: string;
  business: string;
  branchType: string;
  tpa: string;
  branchStatus?: string;
  raw?: any;
};

interface BranchSearchRequest {
  branchName: string;
  recordStatus: string;
  serviceTypes: string[];
}

interface FormData {
  tpaName?: string;
  recordStatus?: string;
  businessUnit?: string[];
}

export const mapFormToBranchSearchRequest = (
  formData: FormData,
): BranchSearchRequest => {
  return {
    branchName: formData.tpaName || "",
    recordStatus: formData.recordStatus ? formData.recordStatus : "Active",
    serviceTypes: formData.businessUnit || [],
  };
};

export default function MainPage() {
  const { t } = useTranslation();

  const [isOpen, { close }] = useDisclosure();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [selectObj] = useState("");
  const { canWrite } = usePermission("branch");

  const getModalState = (): ModalState => {
  if (error) return "error";
  if (success) return "success";
  return "pending";
};

const state = getModalState();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { branches, totalRecords } = useAppSelector((state) => state.tpa);
  const lastDispatchedRef = useRef<string>("");

  const buildAndDispatch = (payloadObj: Record<string, any>) => {
    const payload = {
      page: payloadObj.page ?? 1,
      size: payloadObj.size ?? 20,
      ...payloadObj,
    };
    const key = JSON.stringify(payload);
    if (lastDispatchedRef.current === key) {
      return;
    }

    dispatch(fetchTPABranches(payload));
  };
  useEffect(() => {
    if (Object.keys(filters).length === 0) {
      buildAndDispatch({ page: 1, size: pageSize, recordStatus: "Active" });
    }
  }, [dispatch, pageSize]);
  const handleActiveToggle = async (row: any) => {
    const endpoint = `/v1/tpa-branch/${row?.tpaBranchId}/toggle-status`;
    const response = await patchApi<any, any>(masterApi, endpoint, "")
    if (response?.success) {
      toast.success(response?.data?.message, { position: "top-right", duration: 5000 })
      buildAndDispatch({ page: 1, size: pageSize, recordStatus: filters?.recordStatus ? filters?.recordStatus : "Active" });
    } else {
      toast.error(response?.data?.error, { position: "top-right", duration: 5000 })
    }

  };

  const columns = [
    {
      field: "actions",
      headerName: t("branch.table.actions"),
      width: 110,
      pinned: "left",
      suppressMovable: true,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const row: GridRow = params?.node?.data ?? params?.data;
        return (
          <div className="flex items-center justify-center gap-1">
            <div
              className="flex h-6 items-center justify-center bg-blue-50 px-1.5 text-blue-600 hover:bg-blue-100" >
              {["Active", "Inactive"].includes(row?.recordStatus) &&
                canWrite ? (
                <Switch
                  checked={row?.recordStatus === "Active"}
                  onChange={() => handleActiveToggle(row)}
                />
              ) : (
                <div className="text-[10px] leading-none">
                  {row?.recordStatus}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tpa-management/view-branch/${row?.tpaBranchId}`, {
                  state: { mode: "view", row: row.raw ?? row },
                });
              }}
              className="flex h-6 w-6 items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100"
              title="View"
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
    { field: "branchCode", headerName: t("branch.table.code"), width: 75 },
    { field: "serviceTypes", headerName: t("branch.table.businessUnit"), width: 160 },
    {
      field: "branchName",
      headerName: t("branch.table.branch"),
      width: 130,
    },
    { field: "address.city", headerName: t("branch.table.city"), width: 100 },
    { field: "address.stateName", headerName: t("branch.table.state"), width: 130 },
    {
      field: "contactPhone",
      headerName: t("branch.table.contactPhone"),
      width: 160,
      minWidth: 150,
      suppressSizeToFit: true,
    },
    {
      field: "contactEmail",
      headerName: t("branch.table.contactEmail"),
      width: 360,
      minWidth: 220,
      suppressSizeToFit: true,
      tooltipField: "contactEmail",
    },
  ];

  const handlePageChange = (p: number) => {
    setPage(p);
    buildAndDispatch({ ...filters, page: p, size: pageSize });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const onOk = async () => {
    setConfirmLoading(true);
    try {
      const response = await deleteApi<{ status: number; message: string }>(
        masterApi,
        `/v1/tpa-branch/${selectObj}`,
      );

      if (handleApiResponse(response, "Branch deleted successfully")) {
        setSuccess(true);
        setError(false);
        buildAndDispatch({
          ...filters,
          page,
          size: pageSize,
          recordStatus: "Active",
        });
      } else {
        setError(true);
      }
    } catch (error) {
      console.log("error", error);
      setError(true);
    } finally {
      setConfirmLoading(false);
    }
  };

  const messages: ConfirmMessages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description: "Are you sure you want to delete this record?",
      actionText: "Delete",
    },
    success: {
      title: "Record Deleted",
    },
    error: {
      description:
        "Unable to delete the record at the moment. Please try again later.",
    },
  };
  const fields: SearchField[] = [
    { name: "tpaName", label: t("branch.searchFields.branchName"), type: "text" },
    {
      name: "businessUnit",
      label: t("branch.searchFields.businessUnit"),
      type: "dropdown",
      options: serviceAreaJson,
      isMulti: true,
    },
    {
      name: "recordStatus",
      label: t("branch.searchFields.recordStatus"),
      type: "dropdown",
      options: recordStatus,
    },
  ];
  const [loading, setLoading] = useState(false);

  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);

  const handleSearch = async (data: Record<string, any>) => {
    setLoading(true);
    const payload = mapFormToBranchSearchRequest(data);
    setFilters(payload);
    dispatch(fetchTPABranches(payload));
    setLoading(false);
  };
  return (
    <>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title={t("branch.pageTitle") || "TPA Branches"}
          totalRecords={totalRecords}
          recordLabel="Branches"
          onRefresh={() => buildAndDispatch({ page, size: pageSize, ...filters })}
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
          {canWrite && (
            <AddButton
              label={t("branch.addBranch")}
              path="/tpa-management/add-branch"
              title={t("branch.addBranch")}
            />
          )}
        </CompactPageHeader>

        <CommonSearch
          fields={fields}
          onSearch={handleSearch}
          isSubmitting={loading}
          isState
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
        />

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <div className="block md:hidden min-h-0 flex-1 overflow-y-auto">
            <TPABranchesMobileView
              branches={branches}
              onToggle={handleActiveToggle}
              onView={(row) =>
                navigate(`/tpa-management/view-branch/${row?.tpaBranchId}`, {
                  state: { mode: "view", row: row?.raw ?? row },
                })
              }
              canWrite={canWrite}
            />
          </div>

          <div className="hidden min-h-0 flex-1 flex-col md:flex">
            <AgGridSuperWrapper
              rowData={branches}
              columnDefs={columns}
              onRowClick={() => { }}
              pageSize={20}
              height="100%"
              pagination={false}
            />
          </div>
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

      <ConfirmModal
        show={isOpen}
        onClose={close}
        messages={messages}
        onOk={onOk}
        confirmLoading={confirmLoading}
        state={state}
      />
    </>
  );
}
