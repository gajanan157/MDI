import React, { useState, useMemo, useEffect } from 'react';
import { Page } from "@/components/shared/Page";
import Pagination from "@/components/shared/Pagination";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Search, Plus, X } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as Yup from "yup";
import { Button, Input } from "@/components/ui";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";
import { useNavigate } from 'react-router';
import { FetchTnCTypeDropDownList, FetchParentTnCDropDownList, FetchTnCMasterList } from '../../../../store/features/LimitTypeMaster/LimitTypeMasterSlice';
import { saveMasters, deleteMasters } from './function';
import ConfirmationModal from './ConfirmationModal';
import { PencilSquareIcon,TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import DropdownSelect from "@/components/shared/form/DropdownSelect";

type FormValues = {
    tncId: string;
    tncName: string;
    parentTNCId: string;
    tncType: string;
    chargeSection: string;
    policyClause: string;
    opStatus:string;
    default:boolean;
    waiting:boolean;
    exclusion:boolean;
    cashless:boolean;
    dayCare:boolean;
};

export default function TnCMaster() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { tncTypeDropdownList,parentTncTypeDropdownList,tncMasterList,tncMasterTotalRecords } = useAppSelector((state) => state.limitTypeMasterReducer);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteItem, setSelectedDeleteItem] = useState<any>(null);

    const handleGetApi = (searchText:string,page1=page,pageSize1=pageSize)=>{
        const payload = {
            searchText: searchText,
            recordStatus: "",
            pageNumber: page1,
            pageSize: pageSize1
          }
        dispatch(FetchTnCMasterList(payload));
    }

    useEffect(()=>{
        handleGetApi("");
    },[page, pageSize])

    const handleGetDropdowns = ()=>{
        dispatch(FetchTnCTypeDropDownList());
        dispatch(FetchParentTnCDropDownList());
    }

    useEffect(()=>{
        handleGetDropdowns();
    },[])

    const TnCTypeDropdownOptions = tncTypeDropdownList?.map((item)=>({
        label: item.tncTypeName,
        value: item.tncTypeCode
    })) ?? [];
    const ParentTnCDropdownOptions = [
        {
            label: "",
            value: null
        },
        ...(parentTncTypeDropdownList?.map((item) => ({
            label: item.tncName,
            value: item.tncId
        })) ?? [])
    ];

    const handleView = (data) => {
        navigate(`/benefits-configuration/benefits-master/add-tnc-form/${data.tncId}`);
    };

    const columnDefs = [
        {
            headerName: "Actions", field: "",
            minWidth: 150,
            maxWidth: 150,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            },
            cellRenderer:(params)=>{
                return(
                    <div className="flex gap-3">
                        <button
                            title="View"
                            onClick={() => handleView(params.data)}
                            className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 cursor-pointer"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
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
                )
            }
        },
        {
            headerName: "TNC Name", field: "tncName",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Parent TNC Name", field: "parentTncName",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "TNC Type", field: "tncTypeCode",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Charge Section", field: "chargeSection",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Policy Clause", field: "policyClauseNumber",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Default", field: "isDefault",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Waiting", field: "isWaitingPeriod",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Exclusion", field: "isExclusion",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Cashless", field: "isCashless",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Day Care", field: "isDayCare",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
            sortable: true,
            autoHeight: true,
            
            headerClass: "wrap-text",
            cellStyle: function (params) {
                return { "whiteSpace": "normal", 'justifyContent': 'end' };
            }
        },
        {
            headerName: "Status", field: "recordStatus",
            // minWidth: 135,
            // maxWidth: 135,
            flex:1,
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
        watch,
        setError,
        reset
    } = useForm<FormValues>({
        defaultValues: {
            tncId:"",
            tncName: "",
            parentTNCId: "",
            tncType: "",
            chargeSection: "",
            policyClause: "",
            opStatus:"Active",
            default:false,
            waiting:false,
            exclusion:false,
            cashless:false,
            dayCare:false
        },
    });

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        // console.log("submit",data);
        // handleClose();
        setIsSubmitting(true);
        try 
        {
            const payload = {
                tncName: data.tncName,
                parentTncId: data.parentTNCId || null,
                tncTypeCode:data.tncType,
                isDefault: data.default,
                isWaitingPeriod: data.waiting,
                isExclusion: data.exclusion,
                isCashless: data.cashless,
                isDayCare: data.dayCare,
                chargeSection: data.chargeSection,
                policyClauseNumber: data.policyClause,
                recordStatus: data.opStatus
              }

            const endpoint = isEditMode ? `/api/TnCMaster/Edit/${data.tncName}` : "/api/TnCMaster/Add";
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
            handleGetDropdowns();
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
            const result = await deleteMasters("/api/TnCMaster/Delete",selectedDeleteItem.tncName);
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
            handleGetDropdowns();
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setSelectedDeleteItem(null);
    };

    const handleOpenForm = (item?: any) => {
        if (item) {
            setIsEditMode(true);
            setEditId(item.tncName);
            setValue("tncId", item.tncId);
            setValue("tncName", item.tncName);
            setValue("tncType", item.tncTypeCode);

            // const selectedParent = ParentTnCDropdownOptions.find(
            //     x => x.value === item.parentTncId
            // );//need to change according to parent.
              
            setValue("parentTNCId", item.parentTncId);

            setValue("chargeSection", item.chargeSection);
            setValue("policyClause", item.policyClauseNumber);
            setValue("opStatus", item.recordStatus);

            setValue("default", item.isDefault);
            setValue("waiting", item.isWaitingPeriod);
            setValue("exclusion", item.isExclusion);
            setValue("cashless", item.isCashless);
            setValue("dayCare", item.isDayCare);
        } else {
          setIsEditMode(false);
          setEditId(null);
          reset();
        }
        setIsModalOpen(true);
    };

    const handleClose = ()=>{
        setIsEditMode(false);
        setEditId(null);
        reset();
        setIsModalOpen(false);
    }

    const OpStatusList = [{
        label: "Active",
        value: "Active"
    },
    {
        label: "Inactive",
        value: "Inactive"
    }];
    const clauseRuleFlags = [{
        label: "Yes",
        value: true
    },
    {
        label: "No",
        value: false
    }];

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
                                    placeholder="Search TnC items by name, type or clause..."
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

                            {/* Trigger Configure Button */}
                            <button
                                onClick={() => handleOpenForm()}
                                className="btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white cursor-pointer"
                            >
                                <Plus className="h-4 w-4 stroke-[3px]" />
                                <span>Add TnC</span>
                            </button>
                        </div>
                        <div className="flex min-h-48 flex-1 flex-col mt-2">
                            <AgGridSuperWrapper
                                rowData={tncMasterList}
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
                            totalItems={tncMasterTotalRecords}
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
                    {isEditMode ? "Modify TnC"  : "Add TnC"}
                    </h3>
                </div>
                <button
                    onClick={() => {handleClose()}}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>
                </div>

                {/* Modal Form */}
                <form className="p-5 space-y-4">
                    <div className="space-y-4">
                    {/* Code */}
                    <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1.5">
                        <Input
                            label="TNC Name"
                            isRequired
                            {...register("tncName", {
                                required: "TNC Name is required",
                            })}
                            disabled={isEditMode}
                            error={errors?.tncName && errors?.tncName?.message}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <DropdownSelect
                            label="Parent TNC Name"
                            name_key="parentTNCId"
                            name="parentTNCId"
                            defaultValue="Select Parent TNC"
                            options={ParentTnCDropdownOptions}
                            control={control}
                            // rules={{ required: "Parent TNC is required" }}
                            errors={errors?.parentTNCId}
                            // isRequired
                        />
                    </div>
                    </div>


                    <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1.5">
                        <DropdownSelect
                            label="TNC Type"
                            name_key="tncType"
                            name="tncType"
                            defaultValue="Select TNC Type"
                            options={TnCTypeDropdownOptions}
                            control={control}
                            rules={{ required: "TNC Type is required" }}
                            errors={errors?.tncType}
                            isRequired
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Input
                             label="Charge Section"
                            // isRequired
                            {...register("chargeSection", {})}
                            error={errors?.chargeSection && errors?.chargeSection?.message}
                        />
                    </div>
                    </div>
                
                    <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1.5">
                        <Input
                            label="Policy Clause"
                            // isRequired
                            {...register("policyClause", {})}
                            error={errors?.policyClause && errors?.policyClause?.message}
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
                            // rules={{ required: "Operational Status is required" }}
                            errors={errors?.opStatus}
                            // isRequired
                        />
                    </div>}
                    </div>

                    <p></p>
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    TNC Clause Rule Flags
                        </label>
                    <div className="grid grid-cols-5 gap-2.5">
                    <div className="flex flex-col gap-1.5">
                        <DropdownSelect
                            label="Default"
                            name_key="default"
                            name="default"
                            // defaultValue="Select Parent TNC"
                            options={clauseRuleFlags}
                            control={control}
                            // rules={{ required: "Default is required" }}
                            errors={errors?.default}
                            // isRequired
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <DropdownSelect
                            label="Waiting"
                            name_key="waiting"
                            name="waiting"
                            // defaultValue="Select Parent TNC"
                            options={clauseRuleFlags}
                            control={control}
                            // rules={{ required: "Waiting is required" }}
                            errors={errors?.waiting}
                            // isRequired
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <DropdownSelect
                            label="Exclusion"
                            name_key="exclusion"
                            name="exclusion"
                            // defaultValue="Select Parent TNC"
                            options={clauseRuleFlags}
                            control={control}
                            // rules={{ required: "Exclusion is required" }}
                            errors={errors?.exclusion}
                            // isRequired
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <DropdownSelect
                            label="Cashless"
                            name_key="cashless"
                            name="cashless"
                            // defaultValue="Select Parent TNC"
                            options={clauseRuleFlags}
                            control={control}
                            // rules={{ required: "Cashless is required" }}
                            errors={errors?.cashless}
                            // isRequired
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <DropdownSelect
                            label="DayCare"
                            name_key="dayCare"
                            name="dayCare"
                            // defaultValue="Select Parent TNC"
                            options={clauseRuleFlags}
                            control={control}
                            // rules={{ required: "DayCare is required" }}
                            errors={errors?.dayCare}
                            // isRequired
                        />
                    </div>
                    </div>
             

            
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-end gap-3">
                        <button
                        type="button"
                        onClick={() => {handleClose()}}
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
                title="Delete TnC"
                message={`Are you sure you want to delete "${selectedDeleteItem?.tncName}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </>

    );
}