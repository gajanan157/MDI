import React, { useState, useEffect } from 'react';
import { Page } from "@/components/shared/Page";
import Pagination from "@/components/shared/Pagination";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Search, Plus, X } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from "@/components/ui";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";
import { FetchSIMasterList, FetchParameterMasterList } from '../../../../store/features/LimitTypeMaster/LimitTypeMasterSlice';
import { saveMasters, deleteMasters } from './function';
import ConfirmationModal from './ConfirmationModal';
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import DropdownSelect from "@/components/shared/form/DropdownSelect";

type FormValues = {
    parameterCode: string;
    parameterName: string;
    parameterSource: string;
    parameterCalculation: string;
    opStatus: string;
};

// ---- Hard-coded Source dropdown options ----
const SourceOptions = [
    { label: "Claim", value: "Claim" },
    { label: "UI", value: "UI" },
    { label: "Disease Master", value: "Disease Master" },
    { label: "Dimension_Key", value: "Dimension_Key" },
    { label: "Enroll", value: "Enroll" },
    { label: "Procedure Master", value: "Procedure Master" },
];

export default function ParameterMaster() {
    const dispatch = useAppDispatch();
    const { parameterMasterList, parameterMasterTotalRecords } = useAppSelector((state) => state.limitTypeMasterReducer);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteItem, setSelectedDeleteItem] = useState<any>(null);

    const handleGetApi = (searchText: string, page1 = page, pageSize1 = pageSize) => {
        const payload = {
            searchText: searchText,
            recordStatus: "",
            pageNumber: page1,
            pageSize: pageSize1
        };
        dispatch(FetchParameterMasterList(payload));
    };

    useEffect(() => {
        handleGetApi("");
    }, [page, pageSize]);

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
            headerName: "Code", field: "parameterCode",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Parameter", field: "parameterName",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Source", field: "parameterSource",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Calculation", field: "parameterCalculation",
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
            parameterCode: "",
            parameterName: "",
            parameterSource: "",
            parameterCalculation: "",
            opStatus: "Active"
        },
    });

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                parameterCode: data.parameterCode,
                parameterName: data.parameterName,
                parameterSource: data.parameterSource,
                parameterCalculation: data.parameterCalculation,
                recordStatus: data.opStatus
            };

            const id = isEditMode ? editId : null;
            const endpoint = isEditMode ? `/api/ParameterMaster/Edit/${data.parameterCode}` : "/api/ParameterMaster/Add";
            const result = await saveMasters(payload, endpoint, id);
            if (result.success) {
                handleApiResponse(
                    { success: result.success },
                    result?.data?.responseMessage
                );
                setPage(1);
                setPageSize(20);
                handleGetApi("", 1, 20);
            }
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

        setIsSubmitting(true);
        try {
            const result = await deleteMasters("/api/ParameterMaster/Delete", selectedDeleteItem.parameterCode);
            if (result.success) {
                handleApiResponse(
                    { success: result.success },
                    result.responseMessage
                );
                setPage(1);
                setPageSize(20);
                handleGetApi("", 1, 20);
            } 
            else {
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
            setEditId(item.parameterCode);
            setValue("parameterCode", item.parameterCode);
            setValue("parameterName", item.parameterName);
            setValue("parameterSource", item.parameterSource);
            setValue("parameterCalculation", item.parameterCalculation);
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
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Search parameter by code or name..."
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
                                        onClick={() => {
                                            handleGetApi(searchQuery);
                                        }}
                                        className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white rounded-lg cursor-pointer"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* Trigger Configure Button */}
                            <button
                                onClick={() => handleOpenForm()}
                                className="btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white cursor-pointer"
                            >
                                <Plus className="h-4 w-4 stroke-[3px]" />
                                <span>Add Parameter</span>
                            </button>
                        </div>
                        <div className="flex min-h-48 flex-1 flex-col mt-2">
                            <AgGridSuperWrapper
                                rowData={parameterMasterList}
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
                            totalItems={parameterMasterTotalRecords}
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

                        {/* Modal Header */}
                        <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold tracking-tight">
                                    {isEditMode ? "Modify Parameter" : "Add Parameter"}
                                </h3>
                            </div>
                            <button
                                onClick={() => { handleClose() }}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form className="p-5 space-y-4">
                            <div className="space-y-4">
                                {/* Code */}
                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        label="Code"
                                        isRequired
                                        {...register("parameterCode", {
                                            required: "Code is required",
                                        })}
                                        disabled={isEditMode}
                                        error={errors?.parameterCode && errors?.parameterCode?.message}
                                    />
                                </div>

                                {/* Parameter */}
                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        label="Parameter"
                                        isRequired
                                        {...register("parameterName", {
                                            required: "Parameter is required",
                                        })}
                                        error={errors?.parameterName && errors?.parameterName?.message}
                                    />
                                </div>
                                    {/* Calculation */}
                                    <div className="flex flex-col gap-1.5">
                                    <Input
                                        label="Calculation"
                                        {...register("parameterCalculation")}
                                        error={errors?.parameterCalculation && errors?.parameterCalculation?.message}
                                    />
                                </div>
                                {/* Source */}
                                <div className="flex flex-col gap-1.5">
                                    <DropdownSelect
                                        label="Source"
                                        name_key="parameterSource"
                                        name="parameterSource"
                                        defaultValue="Select a source"
                                        options={SourceOptions}
                                        control={control}
                                        rules={{ required: "Source is required" }}
                                        errors={errors?.parameterSource}
                                        isRequired
                                    />
                                </div>

                          

                                {/* Operational Status - edit mode only */}
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

                            {/* Action Buttons */}
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
                title="Delete Parameter"
                message={`Are you sure you want to delete "${selectedDeleteItem?.parameterName}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </>

    );
}