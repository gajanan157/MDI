import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import Pagination from "@/components/shared/Pagination";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchMasterProducts } from "@/store/features/masterProduct/masterProductSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ArrowUpTrayIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CommonSearch, { SearchField } from "../../CommonSearch";
import CheckListButton from "../../insurerManagement/IcCheckList/CheckListButton";
import { AddNewPolicyModal } from "./AddNewPolicyModal";
import MasterProductMobileView from "./MasterProductMobileView";
import { UploadDocumentModel } from "./UploadDocumentModel";
import { useTranslation } from "react-i18next";
import { usePermission } from "@/app/auth/usePermission";


export default function MasterProduct() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation()
  const { productList, totalRecords } = useAppSelector((state: any) => state.masterProduct);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const [openDocumentUpdate, setOpenDocumentUpdate] = useState(false);
  const [selectedMasterProductId, setSelectedMasterProductId] = useState<string | null>(null);
  const { canWrite } = usePermission("master-product");


  const fields: SearchField[] = [
    { name: "insurerId", label: "Insurer Name", type: "dropdown", options: [] },
    { name: "productUin", label: "UIN No", type: "text" },
    { name: "productName", label: "Product Name", type: "text" },
  ];

  // Build and dispatch API call with pagination and search
  const buildAndDispatch = (payloadObj: Record<string, any>) => {
    const hasQueryObj = typeof payloadObj.queryObj !== "undefined";
    const payload = {
      page: payloadObj.page ?? page ?? 1,
      size: payloadObj.size ?? pageSize ?? 10,
      ...(hasQueryObj ? { queryObj: payloadObj.queryObj } : {}),
      ...payloadObj,
    };

    const topLevelFilterKeys = Object.keys(payloadObj)?.filter((k) => !["page", "size", "queryObj"].includes(k));
    if (!hasQueryObj && topLevelFilterKeys?.length > 0) {
      const queryObj: Record<string, any> = {};
      topLevelFilterKeys?.forEach((k) => {
        queryObj[k] = (payloadObj as any)[k];
        // remove top-level copy so it doesn't confuse API
        delete (payload as any)[k];
      });
      (payload as any).queryObj = queryObj;
    }
    dispatch(fetchMasterProducts(payload));
  };

  const handleSearch = (data: Record<string, any>) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== "" && value !== null && value !== undefined;
      }),
    );
    const hasFilters = Object.keys(cleanedData).length > 0;

    if (hasFilters) {
      setFilters(cleanedData);
      setPage(1);
      buildAndDispatch({ queryObj: cleanedData, page: 1, size: pageSize });
    } else {
      setFilters({});
      setPage(1);
      buildAndDispatch({ page: 1, size: pageSize });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (Object.keys(filters)?.length > 0) {
      buildAndDispatch({ ...filters, page: newPage, size: pageSize });
    } else {
      buildAndDispatch({ page: newPage, size: pageSize });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    if (Object.keys(filters).length > 0) {
      buildAndDispatch({ ...filters, page: 1, size: newPageSize });
    } else {
      buildAndDispatch({ page: 1, size: newPageSize });
    }
  };

  // Initial load
  useEffect(() => {
    if (Object.keys(filters)?.length === 0) {
      buildAndDispatch({ page: 1, size: pageSize });
    } else {
      buildAndDispatch({ ...filters, page, size: pageSize });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pageSize]);

  useBreadcrumb([{ title: "Master Product" }]);
  const [open, setOpen] = useState(false);

  const openModel = (rowData: any) => {
    setSelectedMasterProductId(rowData.masterProductId);
    setOpenDocumentUpdate(true);
  };


  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      maxWidth: 120,
      suppressMovable: true,
      cellRenderer: (params: any) => {
        const data = params?.data;
        return (
          <div className="flex h-full items-center justify-center gap-1">
            <div
              onClick={() =>
                navigate(
                  `/master-management/master-product/${data.masterProductId}`,
                )
              }
              className="cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
              title="View"
            >
              <EyeIcon className="h-4 w-4 cursor-pointer" />
            </div>
            {canWrite && (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // ✅ IMPORTANT
                  openModel(data);
                }}
                className="flex cursor-pointer items-center gap-1 rounded border border-blue-200 bg-green-100 px-2 py-1 text-xs text-red-600 hover:bg-green-200"
              >
                <ArrowUpTrayIcon className="h-4 w-4 cursor-pointer" />
              </div>
            )}
          </div>
        );
      },
      sortable: false,
      filter: false,
    },
    {
      field: "legalName",
      headerName: "Insurer",
      flex: 2,
      minWidth: 150,
    },
    {
      field: "productUin",
      headerName: "UIN No",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "productName",
      headerName: "Product Name",
      flex: 2,
      minWidth: 150,
    },
    {
      field: "approvalStatus",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: { value: any }) => {
        const status = params.value || "";
        const statusLower = String(status).toLowerCase();

        const statusColors: Record<string, string> = {
          draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
          approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
          pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
          archived: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        };

        const colorClass = statusColors[statusLower] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        return (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
  ];

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <Page title="Master Product">
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title="Master Product"
          totalRecords={totalRecords}
          recordLabel="Products"
          onRefresh={() => {
            if (Object.keys(filters).length > 0) {
              buildAndDispatch({ ...filters, page, size: pageSize });
            } else {
              buildAndDispatch({ page, size: pageSize });
            }
          }}
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
            <CheckListButton
              onClick={() => setOpen(true)}
              label="Add New Master Product"
              bgColor="bg-blue-600"
              textColor="text-white"
              size="text-xs"
              className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
            />
          )}
        </CompactPageHeader>

        <CommonSearch
          fields={fields}
          isInsurer={true}
          onSearch={handleSearch}
          isSubmitting={false}
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
        />

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <div className="block md:hidden min-h-0 flex-1 overflow-y-auto">
            <MasterProductMobileView
              products={productList}
              onView={(row) => navigate(`/master-management/master-product/${row.masterProductId}`)}
              onUpload={(row) => {
                setSelectedMasterProductId(row.masterProductId);
                setOpenDocumentUpdate(true);
              }}
            />
          </div>
          <div className="hidden min-h-0 flex-1 flex-col md:flex">
            <AgGridSuperWrapper
              rowData={productList}
              columnDefs={columns}
              pageSize={100}
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
          pageSizeOptions={[5, 10, 20, 30, 50]}
        />
      </div>
      {openDocumentUpdate && selectedMasterProductId && (
        <UploadDocumentModel
          masterProductId={selectedMasterProductId}
          onClose={() => setOpenDocumentUpdate(false)}
        />
      )}
      {open && (
        <AddNewPolicyModal
          onClose={() => setOpen(false)}
          initialValues={{}}
          onSuccess={() => {
            if (Object.keys(filters).length > 0) {
              buildAndDispatch({ ...filters, page: 1, size: pageSize });
            } else {
              buildAndDispatch({ page: 1, size: pageSize });
            }
          }}
        />
      )}
    </Page>
  );
}
