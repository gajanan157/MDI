import { corporateApi, patchApi } from "@/app/api/apiService";
import { recordStatus } from "@/app/pages/AdminDepartment/tpabranches/dummyData";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { PageContent } from "@/components/shared/PageContent";
import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { Switch } from "@/components/ui";
import AddButton from "@/components/ui/AddButton";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useDisclosure } from "@/hooks/useDisclosure";
import { fetchCorporateDatas } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import CommonSearch, { SearchField } from "../../CommonSearch";
import CheckListButton from "../../insurerManagement/IcCheckList/CheckListButton";

export default function CorporateIndex() {
  const { t } = useTranslation()
  useBreadcrumb([{ title: t("corporateGroupMaster.masterManagement") }, { title: t("corporateMaster.title") }]);
  const navigate = useNavigate();
  const { corporateData, totalRecords } = useAppSelector((state) => state.broker);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const fields: SearchField[] = [
    { name: "legalName", label: t("corporateMaster.search.legalName"), type: "text" },
    { name: "status", label: t("corporateMaster.search.recordStatus"), type: "dropdown", options: recordStatus }
  ];
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch()
  const handleSearch = async (data: Record<string, any>) => {
    setLoading(true);
    const payload = {
      legalName: data?.legalName,
      status: data?.status ? data.status.toUpperCase() : "ACTIVE",
    }
    setFilters(payload)
    dispatch(fetchCorporateDatas(payload));

    setLoading(false);
  };
  const handlePageChange = (p: number) => {
    setPage(p);
    dispatch(fetchCorporateDatas({ ...filters, page: p, size: pageSize }));
  };
  useEffect(() => {
    dispatch(fetchCorporateDatas({ status: "ACTIVE" }));
  }, [])

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };
  const handleActiveToggle = async (row: any) => {
    const payload = { status: row?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
    const endpoint = `/v1/corporates/${row?.corporateId}`;
    const response = await patchApi<any, any>(corporateApi, endpoint, payload)
    if (response?.success) {
      toast.success(response?.data?.message, { position: "top-right", duration: 5000 })
      dispatch(fetchCorporateDatas({ status: filters?.status ? filters?.status : "ACTIVE" }));
    } else {
      toast.error(response?.data?.error, { position: "top-right", duration: 5000 })
    }
  };
  const columns = [
    {
      field: "actions",
      headerName: t("corporateMaster.table.actions"),
      width: 120,
      suppressMovable: true,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const row: any = params?.node?.data ?? params?.data;

        return (
          <div className="flex h-full items-center justify-center gap-2">
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100">
              {["ACTIVE", "INACTIVE", "SUSPENDED"].includes(row?.status)  ? (
                <Switch
                  color="info"
                  checked={row?.status === "ACTIVE"}
                  onChange={() => handleActiveToggle(row)}
                />
              ) : (
                <div className="text-[10px]">{row?.status}</div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/master-management/view-corporate/${row?.corporateId}`,
                  {
                    state: { mode: "view", row: row.raw ?? row },
                  }
                );
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

    { field: "legalName", headerName: t("corporateMaster.table.legalName"), width: 240 },
    {
      field: "corporateCode",
      headerName: t("corporateMaster.table.corporateCode"),
      width: 140,
      cellRenderer: (params: any) => (
        <span className="font-mono text-xs font-semibold text-blue-600">{params.value || "—"}</span>
      ),
    },
    { field: "corporateGroupName", headerName: t("corporateMaster.table.corporateGroupName"), width: 190 },
    { field: "corporateType", headerName: t("corporateMaster.table.corporateType"), width: 140 },
    {
      field: "pan",
      headerName: t("corporateMaster.table.pan"),
      width: 140,
      cellRenderer: (params: any) => (
        <span className="font-mono text-xs text-slate-700">{params.value || "—"}</span>
      ),
    },
    {
      field: "gstin",
      headerName: t("corporateMaster.table.gstin"),
      width: 170,
      cellRenderer: (params: any) => (
        <span className="font-mono text-xs text-slate-700">{params.value || "—"}</span>
      ),
    },
    {
      field: "cin",
      headerName: t("corporateMaster.table.cin"),
      width: 190,
      cellRenderer: (params: any) => (
        <span className="font-mono text-xs text-slate-700">{params.value || "—"}</span>
      ),
    },
    {
      field: "contactEmail",
      headerName: t("corporateMaster.table.contactEmail"),
      width: 220,
      valueFormatter: (params: any) => Array.isArray(params.value) ? params.value.join(", ") : (params.value || "—"),
    },
    {
      field: "contactPhone",
      headerName: t("corporateMaster.table.contactPhone"),
      width: 150,
      valueFormatter: (params: any) => Array.isArray(params.value) ? params.value.join(", ") : (params.value || "—"),
    },
  ];
  return (
    <Page title={t("corporateMaster.title")}>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title={t("corporateMaster.title")}
          totalRecords={totalRecords}
          recordLabel="Corporates"
          statusBadge="Master Active"
          onRefresh={() => dispatch(fetchCorporateDatas({ status: "ACTIVE" }))}
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
          <AddButton
            label={t("corporateMaster.buttons.add")}
            path="/master-management/add-corporate"
            title={t("corporateMaster.buttons.add")}
          />
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
              rowData={corporateData}
              columnDefs={columns}
              onRowClick={() => { }}
              pageSize={20}
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
      </div>
    </Page>
  );
}