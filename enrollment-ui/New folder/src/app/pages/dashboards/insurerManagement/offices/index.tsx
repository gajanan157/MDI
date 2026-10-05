// src/pages/insurer/Offices.tsx  (replace your existing file)
import { insurerApi, patchApi } from "@/app/api/apiService";
import { serviceAreaJson2 } from "@/app/pages/AdminDepartment/tpabranches/dummyData";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import AddButton from "@/components/ui/AddButton";
import { useDisclosure } from "@/hooks";
import { fetchInsurerOffices } from "@/store/features/insurerOffice/insurerOfficeSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { EyeIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import CommonSearch, { SearchField } from "../../CommonSearch";
import { officeTypes } from "./add-office/schema";
import { ScaleUpModal } from "@/components/modal/ScaleUpModal";
import AssignContactForm from "./contactassign/AssignContactForm";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  // AssignContactFormValues,
  assignContactSchema,
} from "./contactassign/schema";
import { toast } from "sonner";
import Pagination from "@/components/shared/Pagination";
import CheckListButton from "../IcCheckList/CheckListButton";
import InsurerOfficesMobileView from "./InsurerOfficesMobileView";
import { format } from "date-fns";
import { usePermission } from "@/app/auth/usePermission";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
interface AssignObjType {
  insurerId: string;
  insurerName: string;
  insurerOfficeId: string;
  officeName: string;
  serviceTypes: any;
}

export default function Offices() {
  const navigate = useNavigate();

  const [isOpen, { open, close }] = useDisclosure();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // persist last applied filters so pagination reuses them
  const [filters, setFilters] = useState<Record<string, any>>({});
  const { canWrite } = usePermission("insurer-office");

  const {
    register,
    handleSubmit,
    formState: { errors, },
    control,
    reset,
    watch,
    setValue

  } = useForm({
    resolver: yupResolver(assignContactSchema),
    // defaultValues: {
    //   contact_type_array: [{ type: "", value: "" }],
    // },
  });

  const lastDispatchedRef = useRef<string>("");

  // helper - unified dispatch + dedupe
  const dispatch = useAppDispatch();
  const buildAndDispatch = (payloadObj: Record<string, any>) => {
    const payload = { ...payloadObj };
    const key = JSON.stringify(payload);
    if (lastDispatchedRef.current === key) {
      return; // duplicate; skip
    }
    lastDispatchedRef.current = key;
    dispatch(fetchInsurerOffices(payloadObj));
  };

  // Initial load — run once on mount; also reload when pageSize changes ONLY if no filters active
  useEffect(() => {
    if (Object.keys(filters).length === 0) {
      buildAndDispatch({ page: 1, size: pageSize });
    } else {
      // If filters exist we want to reload current filtered page (in case pageSize changed)
      buildAndDispatch({ ...filters, page, size: pageSize });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pageSize]);

  // --- Columns & view/assign handlers (unchanged) ---
  const handleView = (rowData: any) => {
    if (!rowData) return;
    navigate(`/insurer-management/view-office/${rowData?.insurerOfficeId}`);
  };
  const [assignObj, setAssignObj] = useState<AssignObjType | null>(null);
  const [assignmentId, setAssignmentId] = useState<null>(null);
  const handleSave = async () => {
    const payload = {
      "newOfficeId": assignObj?.insurerOfficeId

    };

    const res = await patchApi<any, any>(
      insurerApi,
      `/v1/insurer-office/move-office-assignment/${assignmentId}`,
      payload,
    );
    if (res?.success) {
      close();
      toast.success(res.data.message, { position: "top-right", duration: 5000 });
      reset();
      setAssignObj(null);
    } else {
      toast.error(res?.error, { position: "top-right", duration: 5000 });
    }
  };

  const CloseAssignModel = () => {
    close();
    reset();
    setAssignObj(null);
  };

  const openModel = (row: any) => {
    const payload = {
      insurerId: row.insurerId,
      insurerName: row.insurerName,
      insurerOfficeId: row.insurerOfficeId,
      officeName: row.officeName,
      serviceTypes: row.serviceTypes,
    };
    setAssignObj(payload);
    open();
  };
  const { t } = useTranslation()

  const columns = [

    {
      field: "actions",
      headerName: t("office.table.actions"),
      width: 120,
      suppressMovable: true,
      cellRenderer: (params: any) => {
        const data = params?.data;
        return (
          <div className="flex h-full items-center justify-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(data);
              }}
              className="cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
              title={t("office.actions.view")}>
              <EyeIcon className="h-4 w-4" />
            </button>
            {canWrite && (
              <div
                onClick={() => openModel(data)}
                className="flex cursor-pointer items-center gap-1 rounded border border-blue-200 bg-green-100 px-2 py-1 text-xs text-red-600 hover:bg-green-200"
                title={t("office.actions.assignContactPerson")}
              >
                <UserPlusIcon className="h-4 w-4 cursor-pointer" />
              </div>
            )}
          </div>
        );
      },
      sortable: false,
      filter: false,
    },
    { field: "insurerName", headerName: t("office.table.insuranceCompanyName"), width: 220 },
    { field: "officeName", headerName: t("office.table.officeName"), width: 150 },
    { field: "officeType", headerName: t("office.table.officeType"), flex: 1, width: 50 },
    { field: "officeCode", headerName: t("office.table.officeCode"), flex: 1 },
    {
      field: "underwritingCenter",
      headerName: t("office.table.underwritingCenter"),
      flex: 1,
    },
    {
      field: "effectiveFrom", headerName: t("office.table.effectiveFrom"), flex: 1,
      valueFormatter: (params: any) => {
        if (!params.value) return "";
        return format(new Date(params.value), "dd MMM yyyy");
      },

    },
    {
      field: "effectiveTo", headerName: t("office.table.effectiveTo"), flex: 1,
      valueFormatter: (params: any) => {
        if (!params.value) return "";
        return format(new Date(params.value), "dd MMM yyyy");
      },
    },

    {
      headerName: t("office.table.status"),
      field: "activeFlag",
      width: 100,
      cellRenderer: (params: { value: any }) =>
        params.value ? "Active" : "Inactive",
    },
  ];

  // redux state
  const { list, totalRecords } = useAppSelector((state) => state.insurerOffice);

  // Pagination handlers — reuse filters and the current pageSize
  const handlePageChange = (p: number) => {
    setPage(p);
    buildAndDispatch({ ...filters, page: p, size: pageSize });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    // If user has active filters, keep them; otherwise will list all
  };
  const fields: SearchField[] = [
    {
      name: "insurerId",
      label: t("office.search.insurerName"),
      type: "dropdown",
      options: [],
    },
    { name: "officeCode", label: t("office.search.officeCode"), type: "text" },
    { name: "officeName", label: t("office.search.officeName"), type: "text" },
    {
      name: "officeType",
      label: t("office.search.officeType"),
      type: "dropdown",
      options: officeTypes,
    },
    {
      isMulti: true,
      name: "serviceType",
      label: t("office.search.serviceType"),
      type: "dropdown",
      options: serviceAreaJson2,
    },
  ];

  const [loading, setLoading] = useState(false);

  // SEARCH: keep filters in state, reset page->1 and dispatch via buildAndDispatch
  const handleSearch = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      const cleanedData = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(data).filter(([_, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== "" && value !== null && value !== undefined;
        }),
      );

      // Save filters so pagination/size change reuses them
      setFilters(cleanedData);

      // Reset page to 1 on new search and dispatch with page & size
      setPage(1);
      buildAndDispatch({ ...cleanedData, page: 1, size: pageSize });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);

  return (
    <Page title="Insurer Office Module">
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title={t("office.pageTitle") || "Insurer Offices"}
          totalRecords={totalRecords}
          recordLabel="Offices"
          onRefresh={() => buildAndDispatch({ ...filters, page, size: pageSize })}
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
              label={t("office.buttons.addOffice")}
              path="/insurer-management/add-office"
              title={t("office.buttons.addNewOffice")}
              className="mb-0"
            />
          )}
        </CompactPageHeader>

        <CommonSearch
          isInsurer={true}
          fields={fields}
          onSearch={handleSearch}
          isSubmitting={loading}
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          {/* Mobile: card list (one card per office) */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:hidden [-webkit-overflow-scrolling:touch]">
            <InsurerOfficesMobileView
              offices={list}
              onView={handleView}
              onAssignContact={canWrite ? openModel : undefined}
              canWrite={canWrite}
            />
          </div>

          {/* Tablet & laptop: table */}
          <div className="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex">
            <AgGridSuperWrapper
              rowData={list}
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
          pageSizeOptions={[10, 20, 30, 50, 100]}
        />
      </div>

      <ScaleUpModal
        title={t("assignContactForm.title")}
        isOpen={isOpen}
        onClose={CloseAssignModel}
        onOk={handleSave}
        handleSubmit={handleSubmit}
      >
        <AssignContactForm
          data={assignObj}
          control={control}
          register={register}
          errors={errors}
          isIc={assignObj?.insurerId}
          watch={watch}
          setValue={setValue}
          setAssignmentId={setAssignmentId}
        />
      </ScaleUpModal>
    </Page>
  );
}
