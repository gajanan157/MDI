import { deleteApi, insurerApi } from "@/app/api/apiService";
import {ConfirmMessages,ConfirmModal,ModalState} from "@/components/shared/ConfirmModal";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import AgGridSuperWrapper from "@/components/shared/table/AgGridWrapper";
import { useDisclosure } from "@/hooks";
import { fetchContactPersons } from "@/store/features/insurer/contactPersonSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ExclamationTriangleIcon, EyeIcon, TrashIcon} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import CommonSearch, { SearchField } from "../../CommonSearch";
import AddButton from "@/components/ui/AddButton";
import Pagination from "@/components/shared/Pagination";
import CheckListButton from "../IcCheckList/CheckListButton";

export default function Insurer() {
  const [isOpen, { open, close }] = useDisclosure();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [selectObj, setSelectedObj] = useState("");
  const state: ModalState = error ? "error" : success ? "success" : "pending";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const navigate = useNavigate();
  const handleRowClick = (row: any) => {
    navigate(`/insurer-management/add-contact-person/${row?.id}`);
  };
  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      suppressMovable: true,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const colomObj = params?.data;
        return (
          <div className="flex h-full items-center justify-start gap-2">
            <div
              onClick={() =>
                navigate(
                  `/insurer-management/add-contact-person/${colomObj?.contactPersonId}`,
                )
              }
              className="cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
              title="View"
            >
              <EyeIcon className="h-4 w-4 cursor-pointer" />
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSuccess(false);
                setError(false);
                open();
                setSelectedObj(colomObj?.contactPersonId);
              }}
              className="cursor-pointer rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4 cursor-pointer" />
            </div>
          </div>
        );
      },
    },
    {
      field: "insurerLegalName",
      headerName: "Insurance Company Name",
      width: 400,
      onclick: handleRowClick,
    },
    {
      field: "fullName",
      headerName: "Full Name",
      width: 300,
      onclick: handleRowClick,
    },
    { field: "dateOfBirth", headerName: "Date Of Birth", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
  ];

  const dispatch = useAppDispatch();
  const { contactList, totalRecords } = useAppSelector((state) => state.contactPerson);
  const lastDispatchedRef = useRef<string>("");
  const handlePageChange = (p: number) => {
    setPage(p);
    buildAndDispatch({ ...filters, page: p, size: pageSize });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };
  const buildAndDispatch = (payloadObj: Record<string, any>) => {
    const payload = {
      query: {
        ...payloadObj,
      },
    };
    const key = JSON.stringify(payload);
    if (lastDispatchedRef.current === key) {
      return; 
    }
    lastDispatchedRef.current = key;
    dispatch(fetchContactPersons(payload));
  };

  useEffect(() => {
    if (Object.keys(filters).length === 0) {
      buildAndDispatch({ page: 1, size: pageSize });
    } else {
      buildAndDispatch({ ...filters, page, size: pageSize });
    }
  }, [dispatch, pageSize]);

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
        "Unable to delete the record at the moment. Please try again later or contact support if the issue persists.",
    },
  };
  const onOk = async () => {
    setConfirmLoading(true);
    const responce = await deleteApi<any>(
      insurerApi,
      `/v1/insurer/contact-person/${selectObj}`,
    );
    if (responce?.data?.statusCode) {
      setConfirmLoading(false);
      setSuccess(true);
      setError(false);
      dispatch(fetchContactPersons());
    } else {
      setConfirmLoading(false);
      setError(true);
    }
  };

  const fields: SearchField[] = [
    { name: "insurerId", label: "Insurer Name", type: "dropdown", options: [] },
    { name: "searchText", label: "Person Name", type: "text" },
  ];

  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);

  const handleSearch = async (data: Record<string, any>) => {
    setFilters({
      searchText: data?.searchText,
      insurerId: data?.insurerId,
      size: pageSize,
    });
    dispatch(
      fetchContactPersons({
        query: {
          searchText: data?.searchText,
          insurerId: data?.insurerId,
          size: pageSize,
        },
      }),
    );
  };
  return (
    <Page title="Contact Persons">
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title="Contact Persons"
          totalRecords={totalRecords}
          recordLabel="Contacts"
          onRefresh={() => buildAndDispatch({ ...filters, page, size: pageSize })}
        >
          <CheckListButton
            onClick={toggleSearch}
            label={isSearchOpen ? "Hide Search" : "Search"}
            bgColor="bg-blue-600"
            textColor="text-white"
            size="text-xs"
            className="flex h-7 items-center justify-center gap-1.5 px-2.5 py-0! rounded-lg"
            isSearch
          />
          <AddButton
            label="Add Contact Person"
            path="/insurer-management/add-contact-person"
            title="Add Contact Person"
            className="mb-0"
          />
        </CompactPageHeader>

        <CommonSearch
          isInsurer={true}
          fields={fields}
          onSearch={handleSearch}
          isSubmitting={false}
          title="Contact Person Filters"
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
        />

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <AgGridSuperWrapper
            rowData={contactList}
            columnDefs={columns}
            height="100%"
            pageSize={20}
            pagination={false}
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
