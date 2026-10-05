import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { Button } from "@/components/ui";
import { useDisclosure } from "@/hooks";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchInwardDatas, fetchInwardDatasOnlyDropdown } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ArrowUpTrayIcon, EyeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import CommonSearch, { SearchField } from "../../CommonSearch";
import CheckListButton from "../../insurerManagement/IcCheckList/CheckListButton";
import CreateCorporateInwardModal from "../dashboard/components/CreateCorporateInwardModal";
import { fetchEscalationMatrixdepartment } from "@/store/features/escalationMatrix/matrixSlice";
import { usePermission } from "@/app/auth/usePermission";
export default function PolicyDetails() {
  const { t } = useTranslation()
  useBreadcrumb([
    { title: `${t("nav.dashboards.inward-management")} `, },
    { title: `${t("inwardList.pageTitle")}` },
  ]);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const { canWrite } = usePermission("inward");
  const [selectedInward, setSelectedInward] = useState<{
    inwardNo: string;
    s3BucketName: string;
    s3SubBucketName: string;
    departmentId: string;
  } | null>(null);
  const { depertment } = useAppSelector((state) => state.matrix);
  const depertmentListNew = depertment?.map((i: any) => ({
    value: i.departmentId,
    label: i.departmentName,
  }));

  const columns = [
    {
      headerName: t("inwardList.tableHeaders.srNo"),
      valueGetter: (params: any) =>
        (params.node?.rowIndex ?? 0) + 1,
      width: 70,
      pinned: "left",
      sortable: false,
      filter: false,
    },
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
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/inward-management/view-inward-document/${row?.inwardNo}`);
              }}
              className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
              title={t("inwardList.actions.view")}>
              <EyeIcon className="h-4 w-4" />
            </button>
            {canWrite&&(
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedInward({
                  inwardNo: row?.inwardNo,
                  s3BucketName: row?.s3BucketName,
                  s3SubBucketName: row?.s3SubBucketName,
                  departmentId: row?.departmentId
                })
                setOpen1(true)


              }}
              className="flex cursor-pointer items-center gap-1 rounded border border-blue-200 bg-green-100 px-2 py-1 text-xs text-red-600 hover:bg-green-200"
            >
              <ArrowUpTrayIcon className="h-4 w-4 cursor-pointer" />
            </button>
            )}
          </div>
        );
      },
    },
    {
      field: "inwardNo",
      headerName: t("inwardList.tableHeaders.inwardNumber"),
      width: 130,
      pinned: "left",
    },
    {
      field: "inwardReceivedAt",
      headerName: t("inwardList.tableHeaders.receivedAt"),
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
      field: "createdBy",
      headerName: t("inwardList.tableHeaders.createdBy"),
      width: 120,
      valueFormatter: (params: any) => {
        if (!params.value) return "";

        return params.value
          .split(".")
          .map((word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join(" "); // "Sandeep Laha"
      },
    },
    {
      field: "s3SubBucketName",
      headerName: t("inwardList.tableHeaders.inwardType"),
      width: 120,
    },
    {
      field: "departmentName",
      headerName: t("inwardList.tableHeaders.department"),
      width: 120,
    },
    {
      field: "branchName",
      headerName: t("inwardList.tableHeaders.branchName"),
      width: 170,
    },
    {
      field: "inwardReceivedChannel",
      headerName: t("inwardList.tableHeaders.receivedChannel"),
      width: 120,
    },
    {
      field: "sourceEntityName",
      headerName: t("inwardList.tableHeaders.entityName"),
      width: 120,
    },
    {
      field: "inwardSourceReferenceNo",
      headerName: t("inwardList.tableHeaders.policyNumber"),
      width: 170,
    },
  ];

  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(fetchInwardDatasOnlyDropdown({ Lightweight: true }));
    dispatch(fetchEscalationMatrixdepartment());

  }, [])
  const { inwardNumberData } = useAppSelector((state) => state.broker);

  const inwardNumberDataListNew = inwardNumberData?.map((i: any) => ({
    value: i?.inwardNo,
    label: i?.inwardNo,
  }));

  const fields: SearchField[] = [
    {
      name: "fromDate",
      label: t("inwardList.searchFields.startDate"),
      type: "date",
    },
    {
      name: "toDate",
      label: t("inwardList.searchFields.endDate"),
      type: "date",
    },
    {
      name: "inwardNo",
      label: t("inwardList.searchFields.inwardNumber"),
      type: "dropdown",
      options: inwardNumberDataListNew,
    },
    {
      name: "departmentId",
      label: "Department",
      type: "dropdown",
      options: depertmentListNew,
    },
  ];

  const navigate = useNavigate()
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const { inwardData, totalRecords } = useAppSelector((state) => state.broker);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);






  const handleSearch = async (data: Record<string, any>) => {
    setLoading(true);
    const payload = {
      inwardNo: data?.inwardNo,
      inwardSourceEntityId: data?.proposerName,
      inwardSourceReferenceNo: data?.policyNumber,
      fromDate: data?.fromDate,
      toDate: data?.toDate,
      departmentId: data?.departmentId,
    }
    setFilters(payload)
    dispatch(fetchInwardDatas(payload));

    setLoading(false);
  };
  const handlePageChange = (p: number) => {
    setPage(p);
    dispatch(fetchInwardDatas({ ...filters, page: p, size: pageSize }));
  };
  useEffect(() => {
    if (open === false) {
      dispatch(fetchInwardDatas());
    }
  }, [open]);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };
  return (
    <Page title={t("inwardList.pageTitle")}>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title={t("inwardList.pageTitle")}
          totalRecords={totalRecords}
          recordLabel="Inwards"
          statusBadge="Inward Active"
          onRefresh={() => dispatch(fetchInwardDatas({}))}
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
          {canWrite && (
            <Button
              color="primary"
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 py-0! text-xs font-semibold"
              onClick={() => setOpen(true)}
              title={t("inwardList.createInward")}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              {t("inwardList.createInward")}
            </Button>
          )}
        </CompactPageHeader>

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <CommonSearch
            fields={fields}
            onSearch={handleSearch}
            isSubmitting={loading}
            isState
            showToggleButton={false}
            isOpen={isSearchOpen}
            onToggle={toggleSearch}
          />
          <div className="flex min-h-0 flex-1 flex-col pt-1">
            <AgGridSuperWrapper
              rowData={inwardData}
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
          isInward
        />
      )}
      {open1 && (
        <CreateCorporateInwardModal
          open={open1}
          onClose={() => setOpen1(false)}
          isInwardWithList
          isData={selectedInward}
        />
      )}
    </Page>

  );
}
