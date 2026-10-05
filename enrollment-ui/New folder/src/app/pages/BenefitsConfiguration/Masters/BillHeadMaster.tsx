import React, { useState, useEffect } from 'react';
import { Page } from "@/components/shared/Page";
import Pagination from "@/components/shared/Pagination";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { Search, Plus, X } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from "@/components/ui";
import ConfirmationModal from './ConfirmationModal';
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { FetchBillHeadMasterList } from '../../../../store/features/LimitTypeMaster/LimitTypeMasterSlice';
import { saveMasters, deleteMasters } from './function';
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";

type FormValues = {
    billheadCode: string;
    opStatus: string;
    billheadName: string;
};

export default function BillHeadMaster() {
    const dispatch = useAppDispatch();
    const { billHeadMasterList, billHeadMasterTotalRecords } = useAppSelector((state) => state.limitTypeMasterReducer);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteItem, setSelectedDeleteItem] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGetApi = (searchText:string,page1=page,pageSize1=pageSize)=>{
        const payload = {
            searchText: searchText,
            recordStatus: "",
            pageNumber: page1,
            pageSize: pageSize1
          }
        dispatch(FetchBillHeadMasterList(payload));
    }

    useEffect(()=>{
        handleGetApi("");
    },[page, pageSize])

    const columnDefs = [
        {
            headerName: "Actions", field: "",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            },
            cellRenderer: (params) => {
                return (
                    <div className="flex gap-3">
                        <button
                            title="Edit"
                            onClick={() => handleOpenForm(params.data)}
                            className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 cursor-pointer"
                        >
                            <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                            title="Delete"
                            onClick={() => handleDelete(params.data)}
                            className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-red-600 hover:bg-blue-100 cursor-pointer"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                );
            }
        },
        {
            headerName: "Code", field: "billheadCode",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Meaning / Name", field: "billheadName",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Status", field: "recordStatus",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
    ];

    const handlePageChange = (p: number) => {
        setPage(p);
    };
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
        reset
    } = useForm<FormValues>({
        defaultValues: {
            billheadCode: "",
            billheadName: "",
            opStatus: "Active"
        },
    });

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setIsSubmitting(true);
        try 
        {
            const payload = {
                billheadCode : data.billheadCode,
                billheadName : data.billheadName,
                recordStatus : data.opStatus
            }

            const endpoint = isEditMode ? `/api/BillHeadMaster/Edit/${data.billheadCode}` : "/api/BillHeadMaster/Add";
            const id = isEditMode ? editId : null;
            const result = await saveMasters(payload, endpoint, id);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result?.data?.responseMessage
                );
                setPage(1);
                setPageSize(20);
                handleGetApi("",1,20)

            } 
            // else {
            //     showErrorMessage(result);
            // }
        } finally {
            setIsSubmitting(false);
            handleClose();
        }
    };

    const handleDelete = (data: any) => {
        setSelectedDeleteItem(data);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedDeleteItem) return;
      
        // Call your delete API here
        // dispatch(deleteLimitType(selectedItem.limitTypeCode));
        setIsSubmitting(true);
        try 
        {
            const result = await deleteMasters("/api/BillHeadMaster/Delete",selectedDeleteItem.billheadCode);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result.responseMessage
                );
                setPage(1);
                setPageSize(20);
                handleGetApi("",1,20)

            } else {
                showErrorMessage(result);
            }
        } finally {
            setIsSubmitting(false);
            setIsDeleteModalOpen(false);
            setSelectedDeleteItem(null);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setSelectedDeleteItem(null);
    };

    const handleOpenForm = (item?: any) => {
        if (item) {
            setIsEditMode(true);
            setEditId(item.billheadCode);
            setValue("billheadCode", item.billheadCode);
            setValue("billheadName", item.billheadName);
            setValue("opStatus", item.recordStatus);
        } else {
            setIsEditMode(false);
            setEditId(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsEditMode(false);
        setEditId(null);
        reset();
        setIsModalOpen(false);
    };

    const OpStatusList = [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" }
    ];

    return (
        <>
            <Page title="User Management">
                <div className="flex min-h-0 w-full flex-1 flex-col justify-start px-2">
                    <div className="flex min-h-0 flex-1 flex-col pb-1">
                        <div className="p-2.5 px-4 border-b border-zinc-150 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Search bill head by code or meaning..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-1.5 text-xs font-medium rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500
                                        bg-zinc-50 border-zinc-250 text-zinc-700`}
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        handleGetApi("");
                                    }}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer border-zinc-200 hover:bg-zinc-50 text-zinc-600`}
                                    >
                                    Reset
                                    </button>
                                    <button
                                    type="button"
                                    onClick={()=>{
                                        handleGetApi(searchQuery);
                                    }}
                                    className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white rounded-lg cursor-pointer"
                                    >
                                    Search
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenForm()}
                                className="btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white cursor-pointer"
                            >
                                <Plus className="h-4 w-4 stroke-[3px]" />
                                <span>Add Bill Head</span>
                            </button>
                        </div>
                        <div className="flex min-h-48 flex-1 flex-col mt-2">
                            <AgGridSuperWrapper
                                rowData={billHeadMasterList}
                                columnDefs={columnDefs}
                                onRowClick={() => { }}
                                pageSize={pageSize}
                                height="100%"
                                pagination={false}
                            />
                        </div>
                        <Pagination
                            className="shrink-0"
                            page={page}
                            pageSize={pageSize}
                            totalItems={billHeadMasterTotalRecords}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[20, 30, 50, 100]}
                        />
                    </div>
                </div>
            </Page>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className={`w-full max-w-lg rounded-2xl border shadow-xl overflow-hidden animate-slide-up bg-white border-zinc-200 text-zinc-800`}>
                        <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold tracking-tight">
                                    {isEditMode ? "Modify Bill Head" : "Add Bill Head"}
                                </h3>
                            </div>
                            <button
                                onClick={() => { handleClose() }}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form className="p-5 space-y-4">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        label="Bill Head Code"
                                        isRequired
                                        {...register("billheadCode", {
                                            required: "Bill Head Code is required",
                                        })}
                                        disabled={isEditMode}
                                        error={errors?.billheadCode && errors?.billheadCode?.message}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        label="Meaning / Name"
                                        isRequired
                                        {...register("billheadName", {
                                            required: "Bill Head Name is required",
                                        })}
                                        error={errors?.billheadName && errors?.billheadName?.message}
                                    />
                                </div>

                                {isEditMode && <div className="flex flex-col gap-1.5">
                                    <DropdownSelect
                                        label="Operational Status"
                                        name_key="opStatus"
                                        name="opStatus"
                                        defaultValue="Select a status"
                                        options={OpStatusList}
                                        control={control}
                                        rules={{ required: "Operational Status is required" }}
                                        errors={errors?.opStatus}
                                        isRequired
                                    />
                                </div>}
                            </div>

                            <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { handleClose() }}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer border-zinc-200 hover:bg-zinc-50 text-zinc-600`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white rounded-lg cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                open={isDeleteModalOpen}
                title="Delete Bill Head"
                message={`Are you sure you want to delete "${selectedDeleteItem?.billheadName}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </>
    );
}