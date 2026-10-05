import React, { useState, useEffect } from 'react';
import { Page } from "@/components/shared/Page";
import Pagination from "@/components/shared/Pagination";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { FetchAilmentProcedureMasterList } from '../../../../store/features/LimitTypeMaster/LimitTypeMasterSlice';
import { deleteMasters, navigateFromMaster } from './function';
import ConfirmationModal from './ConfirmationModal';
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";

export default function AilmentProcedure() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { ailmentProcedureMasterList, ailmentProcedureMasterTotalRecords } = useAppSelector((state) => state.limitTypeMasterReducer);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
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
        dispatch(FetchAilmentProcedureMasterList(payload));
    };

    useEffect(() => {
        handleGetApi("");
    }, [page, pageSize]);

    const handleOpenForm = (item?: any) => {
        if (item) {
            navigateFromMaster(
                navigate,
                `/benefits-configuration/benefits-master/ailment-procedure/${item.ailmentProcedureSublimitId}`,
                "AilmentProcedure"
            );
        } else {
            navigateFromMaster(
                navigate,
                "/benefits-configuration/benefits-master/ailment-procedure",
                "AilmentProcedure"
            );
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
            const result = await deleteMasters("/api/AilmentProcedureMaster/Delete", selectedDeleteItem.ailmentProcedureName);
            if (result.success) {
                handleApiResponse(
                    { success: result.success },
                    result.responseMessage
                );
                setPage(1);
                setPageSize(20);
                handleGetApi("", 1, 20);
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
            headerName: "Name", field: "ailmentProcedureName",
            flex: 1.3, sortable: true, autoHeight: true, headerClass: "wrap-text",
            cellStyle: function (params) { return { "whiteSpace": "normal", 'justifyContent': 'end' }; }
        },
        {
            headerName: "Category", field: "procedureCategoryCode",
            flex: 1, sortable: true, autoHeight: true, headerClass: "wrap-text",
            cellStyle: function (params) { return { "whiteSpace": "normal", 'justifyContent': 'end' }; }
        },
        {
            headerName: "Sub-limit Amount", field: "sublimitAmount",
            flex: 1, sortable: true, autoHeight: true, headerClass: "wrap-text",
            cellStyle: function (params) { return { "whiteSpace": "normal", 'justifyContent': 'end' }; }
        },
        {
            headerName: "ICD Codes", field: "applicableICDGroup",
            flex: 1.3, sortable: true, autoHeight: true, headerClass: "wrap-text",
            cellStyle: function (params) { return { "whiteSpace": "normal", 'justifyContent': 'end' }; },
            valueGetter: (params) =>
                params.data?.applicableICDGroup
                    ?.map((item) => item.icdCode)
                    .join(", ") || ""
        },
        {
            headerName: "CPT/HCPCS Codes", field: "applicableICDPCSProcedureGroup",
            flex: 1.3, sortable: true, autoHeight: true, headerClass: "wrap-text",
            cellStyle: function (params) { return { "whiteSpace": "normal", 'justifyContent': 'end' }; },
            valueGetter: (params) =>
                params.data?.applicableICDPCSProcedureGroup
                    ?.map((item) => item.code)
                    .join(", ") || ""
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

    const rowData = [
        {
            id: 1,
            procedureName: "Knee Replacement Surgery",
            category: "Surgical",
            subLimitAmount: 150000,
            icd: "M17.11, M17.12",
            cptHcpcs: "27447, 20985"
        },
        {
            id: 2,
            procedureName: "Cataract Surgery",
            category: "Ophthalmology",
            subLimitAmount: 50000,
            icd: "H25.11, H25.12",
            cptHcpcs: "66984, 66985"
        }
    ];
    const handlePageChange = (p: number) => {
        setPage(p);
    };
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    const handleView = () => {
        navigate(`/benefits-configuration/benefits-master/ailment-procedure`);
    };
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
                                        placeholder="Search ailment procedure by name..."
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
                                onClick={() => handleView()}
                                className="btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white cursor-pointer"
                            >
                                <Plus className="h-4 w-4 stroke-[3px]" />
                                <span>Add Ailment Procedure</span>
                            </button>
                        </div>
                        <div className="flex min-h-48 flex-1 flex-col mt-2">
                            <AgGridSuperWrapper
                                rowData={ailmentProcedureMasterList}
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
                            totalItems={ailmentProcedureMasterTotalRecords}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[20, 30, 50, 100]}
                        />
                    </div>
                </div>
            </Page>

            <ConfirmationModal
                open={isDeleteModalOpen}
                title="Delete Ailment Procedure"
                message={`Are you sure you want to delete "${selectedDeleteItem?.ailmentProcedureName}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </>
    );
}