import {
  ConfirmMessages,
  ConfirmModal,
  ModalState,
} from "@/components/shared/ConfirmModal";
import { Page } from "@/components/shared/Page";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { useDisclosure } from "@/hooks";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ExclamationTriangleIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { deleteApi, insurerApi } from "@/app/api/apiService";
import { usePermission } from "@/app/auth/usePermission";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import Pagination from "@/components/shared/Pagination";
import AddButton from "@/components/ui/AddButton";
import { useTranslation } from "react-i18next";
import CommonSearch, { SearchField } from "../../CommonSearch";
import CheckListButton from "../IcCheckList/CheckListButton";
import InsurerMobileView from "./InsurerMobileView";

export default function Insurer() {
  const { t } = useTranslation();

  const [isOpen, { close }] = useDisclosure();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [selectObj] = useState("");

  let state: ModalState;

  if (error) {
    state = "error";
  } else if (success) {
    state = "success";
  } else {
    state = "pending";
  }
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const { canWrite } = usePermission("insurer");

  const navigate = useNavigate();

  const handleRowClick = (row: any) => {
    navigate(`/insurer-management/view-insurer/${row?.id}`);
  };

  const columns = [
    {
      field: "actions",
      headerName: t("branch.table.actions"),
      width: 90,
      suppressMovable: true,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const colomObj = params?.data;
        return (
          <div className="flex h-full items-center justify-start gap-2">
            <button type="button" onClick={() => navigate(`/insurer-management/view-insurer/${colomObj?.id}`)}
              className="cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
              title={t("common.view")}
            >
              <EyeIcon className="h-4 w-4 cursor-pointer" />
            </button>
          </div>
        );
      },
    },

    {
      field: "name",
      headerName: t("insurer.table.insuranceCompanyName"),
      width: 270,
      onclick: handleRowClick,
    },
    { field: "irdaiInsurerCode", headerName: t("insurer.table.irdaiCode"), flex: 1 },
    // { field: "brandName", headerName: t("insurer.table.brandName"), flex: 1 },
    { field: "code", headerName: t("insurer.table.insurerCode"), flex: 1 },
    { field: "insurerType", headerName: t("insurer.table.type"), flex: 1 },
    {
      headerName: t("insurer.table.status"),
      field: "isActive",
      cellRenderer: (params: { value: any }) =>
        params.value ? "Active" : "Inactive",
    },
  ];

  const dispatch = useAppDispatch();
  const { insurerMainList, totalRecords } = useAppSelector(
    (state) => state.insurer,
  );

  const buildAndDispatch = (payloadObj: Record<string, any>) => {
    const payload = {
      page: payloadObj.page ?? page ?? 1,
      size: payloadObj.size ?? pageSize ?? 20,
      ...payloadObj,
    };

    dispatch(fetchInsurers(payload));
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    buildAndDispatch({ ...filters, page: p, size: pageSize });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  useEffect(() => {
    buildAndDispatch({ page: 1, size: pageSize });
  }, [dispatch, pageSize]);

  const messages: ConfirmMessages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: t("branch.confirm.title"),
      description: t("branch.confirm.deleteDescription"),
      actionText: t("branch.confirm.deleteAction"),
    },
    success: {
      title: t("branch.confirm.deleteSuccess"),
    },
    error: {
      description: t("branch.confirm.error"),
    },
  };

  const onOk = async () => {
    setConfirmLoading(true);
    const responce = await deleteApi<any>(
      insurerApi,
      `/v1/insurer/${selectObj}`,
    );

    if (responce?.data?.statusCode) {
      setConfirmLoading(false);
      setSuccess(true);
      setError(false);
      dispatch(fetchInsurers({ size: "50", page: 1 }));
    } else {
      setConfirmLoading(false);
      setError(true);
    }
  };

  const fields: SearchField[] = [
    { name: "legalName", label: t("insurer.searchFields.insuranceCompany"), type: "text" },
    { name: "irdaiInsurerCode", label: t("insurer.searchFields.irdaiCode"), type: "text" },
  ];

  const [loading, setLoading] = useState(false);
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);

  const handleSearch = async (data: Record<string, any>) => {
    setLoading(true);
    setFilters(data);
    dispatch(fetchInsurers({ queryObj: data }));
    setLoading(false);
  };
  return (
    <Page title={t("insurer.pageTitle")}>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title={t("insurer.pageTitle")}
          totalRecords={totalRecords}
          recordLabel="Insurers"
          onRefresh={() => dispatch(fetchInsurers({ page, size: pageSize, queryObj: filters }))}
        >
          <CheckListButton
            onClick={toggleSearch}
            label={isSearchOpen ? t("insurer.buttons.hideSearch") : t("insurer.buttons.search")}
            bgColor="bg-blue-600"
            textColor="text-white"
            size="text-xs"
            className="flex h-7 items-center justify-center gap-1.5 px-2.5 py-0! rounded-lg"
            isSearch
          />
          {canWrite && (
            <AddButton
              label={t("insurer.buttons.addInsurer")}
              path="/insurer-management/add-insurer"
              title={t("insurer.buttons.addInsurer")}
            />
          )}
        </CompactPageHeader>

        <CommonSearch
          fields={fields}
          onSearch={handleSearch}
          isSubmitting={loading}
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
        />

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:hidden [-webkit-overflow-scrolling:touch]">
            <InsurerMobileView
              insurers={insurerMainList}
              onView={(row) =>
                navigate(`/insurer-management/view-insurer/${row?.id}`)
              }
            />
          </div>

          <div className="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex">
            <AgGridSuperWrapper
              rowData={insurerMainList}
              columnDefs={columns}
              pageSize={20}
              height="100%"
              pagination={false}
            />
          </div>
        </div>

        {/* PAGINATION */}
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
    </Page>
  );
}