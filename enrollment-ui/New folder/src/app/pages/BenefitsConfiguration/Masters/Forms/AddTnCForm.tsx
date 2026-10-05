import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router";
import { toast } from "sonner";
import { X } from "lucide-react";
import FormLayout from "@/components/shared/form/FormLayout";
import { Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { FetchTnCDataById, FetchDimensionKeyMasterList, FetchBillHeadMasterList, FetchBillingChargeGroupMasterList, FetchTnCDimensionDataById, FetchTnCBillHeadDataById, FetchParentTnCDropDownList, FetchTnCTypeDropDownList } from "../../../../../store/features/LimitTypeMaster/LimitTypeMasterSlice";
import { Page } from "@/components/shared/Page";
import { saveMasters, deleteMasters, navigateBackToMaster, getMasterBreadcrumb } from "../function";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";

type FormValues = {
    tncName: string;
    parentTNCId: string;
    tncType: string;
    chargeSection: string;
    policyClause: string;
    opStatus: string;
    default: string;
    waiting: string;
    exclusion: string;
    cashless: string;
    dayCare: string;
    billHead: string;
    chargeGroup: string;
    status: string;
};

type MappedBillHead = {
    tnCBillHeadMapId: string;
    TncId: string;
    billHeadCode: string;
    billingChargeGroupCode: string;
    chargeSection: string;
    recordStatus: string;
};

const clauseRuleFlags = [
    { label: "Yes", value: true },
    { label: "No", value: false },
];

const OpStatusList = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
];

// ---- Hard-coded Dimension list for the modal grid ----
// const DIMENSION_LIST = [
//     { id: "DIM001", dimensionName: "Sum Insured" },
//     { id: "DIM002", dimensionName: "Age" },
//     { id: "DIM003", dimensionName: "Room Category" },
//     { id: "DIM004", dimensionName: "Policy Tenure" },
//     { id: "DIM005", dimensionName: "Relationship" },
// ];

// const billHeadOptions = [
//     { label: "Room Charges", value: "ROOM_CHARGES" },
//     { label: "Consultation Charges", value: "CONSULTATION_CHARGES" },
//     { label: "Medicine Charges", value: "MEDICINE_CHARGES" },
//     { label: "Diagnostic Charges", value: "DIAGNOSTIC_CHARGES" },
//     { label: "Nursing Charges", value: "NURSING_CHARGES" },
//     { label: "Surgery Charges", value: "SURGERY_CHARGES" },
//     { label: "Ambulance Charges", value: "AMBULANCE_CHARGES" },
//     { label: "Insurance Processing Charges", value: "INSURANCE_PROCESSING_CHARGES" },
// ];

// const chargeGroupOptions = [
//     { label: "Accommodation Charges", value: "ACCOMMODATION_CHARGES" },
//     { label: "Medical Services", value: "MEDICAL_SERVICES" },
//     { label: "Pharmacy & Consumables", value: "PHARMACY_CONSUMABLES" },
//     { label: "Diagnostic Services", value: "DIAGNOSTIC_SERVICES" },
//     { label: "Surgical Procedures", value: "SURGICAL_PROCEDURES" },
//     { label: "Doctor Consultation", value: "DOCTOR_CONSULTATION" },
//     { label: "Nursing & Care Services", value: "NURSING_CARE_SERVICES" },
//     { label: "Emergency Services", value: "EMERGENCY_SERVICES" },
//     { label: "Administrative Charges", value: "ADMINISTRATIVE_CHARGES" },
// ];

const chargeSectionOptions = [
    { label: "A", value: "A" },
    { label: "B", value: "B" },
    { label: "C", value: "C" },
];

const AddTnCForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { tncDataById,tncTypeDropdownList,parentTncTypeDropdownList,dimensionKeyMasterList,billHeadMasterList,
        billingChargeGroupMasterList,tnCDimensionResponse,tncBillHeadResponse } = useAppSelector((state) => state.limitTypeMasterReducer);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
        getValues,
    } = useForm<FormValues>({
        defaultValues: {
            tncName: "",
            parentTNCId: "",
            tncType: "",
            chargeSection: "",
            policyClause: "",
            opStatus: "Active",
            default: "",
            waiting: "",
            exclusion: "",
            cashless: "",
            dayCare: "",
            billHead: "",
            chargeGroup: "",
            status: "",
        },
    });

    // const param = useParams();
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<boolean>(!id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenMap, setIsModalOpenMap] = useState(false);
    const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("dimension");

    // ---- Bill Head mapping list + edit tracking ----
    const [mappedBillHeads, setMappedBillHeads] = useState<MappedBillHead[]>([]);
    const [editingBillHeadId, setEditingBillHeadId] = useState<string | null>(null);

    useEffect(()=>{
        if(id!=null)
        {
            dispatch(FetchTnCTypeDropDownList());
            dispatch(FetchParentTnCDropDownList());
            dispatch(FetchTnCDataById(id));
            dispatch(FetchTnCDimensionDataById(id));
            dispatch(FetchTnCBillHeadDataById(id));
            const payload = {
                getAll : true
            }
            dispatch(FetchDimensionKeyMasterList(payload));
            dispatch(FetchBillHeadMasterList(payload));
            dispatch(FetchBillingChargeGroupMasterList(payload));
        }
    },[id]);

    useEffect(()=>{
        if(id!=null && tncDataById!=null)
        {
            setValue("tncId", tncDataById.tncId);
            setValue("tncName", tncDataById.tncName);
            setValue("tncType", tncDataById.tncTypeCode);
            setValue("parentTNCId", tncDataById.parentTncId);
            setValue("chargeSection", tncDataById.chargeSection);
            setValue("policyClause", tncDataById.policyClauseNumber);
            setValue("opStatus", tncDataById.recordStatus);
            setValue("default", tncDataById.isDefault);
            setValue("waiting", tncDataById.isWaitingPeriod);
            setValue("exclusion", tncDataById.isExclusion);
            setValue("cashless", tncDataById.isCashless);
            setValue("dayCare", tncDataById.isDayCare);
        }
    },[id,tncDataById,setValue])

    useEffect(()=>{
        if(id!=null && tnCDimensionResponse && tnCDimensionResponse?.length>0)
        {
            setSelectedDimensions(tnCDimensionResponse.map(item => item.dimensionKey));
        }
        else{
            setSelectedDimensions([]);
        }
    },[id,tnCDimensionResponse])

    // useEffect(()=>{
    //     if(id!=null && tncBillHeadResponse && tncBillHeadResponse?.length>0)
    //     {
    //         setSelectedDimensions(tnCDimensionResponse.map(item=>item.dimensionKey);
    //     }
    // },[id,tncBillHeadResponse])

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
    const billHeadOptions = billHeadMasterList?.map((item)=>({
        label: item.billheadName,
        value: item.billheadCode
    })) ?? [];
    const chargeGroupOptions = billingChargeGroupMasterList?.map((item)=>({
        label: item.billingChargeGroupName,
        value: item.billingChargeGroupCode
    })) ?? [];

    const breadcrumbs = [
        { title: "Benefits Configuration" },
        { title: "Masters" },
        // { title: "TNC", path: "/benefits-configuration/benefits-master" },
        getMasterBreadcrumb("TNC", "TnCMaster"),
        { title: id ? "View" : "Add" },
    ];
    useBreadcrumb(breadcrumbs);

    const readOnly = id && !editing;
    const isEditMode = !!id;

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setIsSubmitting(true);
        setLoading(true);
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

            const endpoint = `/api/TnCMaster/Edit/${data.tncName}`;
            const id = data.tncName;
            const result = await saveMasters(payload, endpoint, id);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result?.data?.responseMessage
                );
            } 
            // else {
            //     showErrorMessage(result);
            // }
        } finally {
            setIsSubmitting(false);
            setLoading(false);
            dispatch(FetchTnCDataById(id));
            setEditing(true);
        }
    };

    const onCancel = () => {
        navigateBackToMaster(
            navigate,
            location.state?.activeTab || "TnCMaster"
        );
    };

    const onEdit = () => setEditing(true);

    const AddDimension = () => {
        setIsModalOpen(true);
    };

    // "Map Bill" = add a NEW mapping -> no status field, clear form fields
    const MapBillHead = () => {
        setEditingBillHeadId(null);
        setValue("billHead", "");
        setValue("chargeGroup", "");
        setValue("chargeSection", "");
        setValue("status", "");
        setIsModalOpenMap(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedDimensions(tnCDimensionResponse.map(item => item.dimensionKey));
    };

    const handleCloseMap = () => {
        setIsModalOpenMap(false);
        setEditingBillHeadId(null);
    };

    const toggleDimension = (id: string) => {
        setSelectedDimensions((prev) =>
            prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
        );
    };

    // Remove a single dimension chip from the Dimensions section
    const removeDimension = async (dimensionKey: string) => {
        setSelectedDimensions((prev) => prev.filter((d) => d !== dimensionKey));
        const tncDimensionId = tnCDimensionResponse.find(
            item => item.dimensionKey === dimensionKey
        )?.tnCDimensionId;
        setIsSubmitting(true);
        try 
        {
            const result = await deleteMasters("/api/TnCDimensionMaster/Delete",tncDimensionId);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result.responseMessage
                );

            } else {
                showErrorMessage(result);
            }
        } finally {
            setIsSubmitting(false);
            dispatch(FetchTnCDimensionDataById(id));
        }
    };

    const handleSaveDimensions = async () => {
        setIsSubmitting(true);
        setLoading(true);
        try 
        {
            const newSelectedDimensions = selectedDimensions.filter(
                dimensionKey =>
                    !tnCDimensionResponse.some(
                        item => item.dimensionKey === dimensionKey
                    )
            );
            const payload = {
                tncId:id,
                dimensionKey : newSelectedDimensions
              }

            const endpoint = `/api/TnCDimensionMaster/Add`;
            const result = await saveMasters(payload, endpoint, null);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result?.data?.responseMessage
                );
            } 
            // else {
            //     showErrorMessage(result);
            // }
        } finally {
            setIsSubmitting(false);
            setLoading(false);
            dispatch(FetchTnCDimensionDataById(id));
            setIsModalOpen(false);
        }
    };

    // Save (Add or Update) a Bill Head mapping row
    const handleSaveBillHead = async () => {
        const values = getValues();

        if (!values.billHead || !values.chargeGroup || !values.chargeSection) {
            toast.error("Please fill Bill Head, Charge Group and Charge Section", {
                position: "top-right",
                duration: 4000,
            });
            return;
        }
        setIsSubmitting(true);
        try 
        {
            const payload = {
                tncId : id,
                billingChargeGroupCode : values.chargeGroup,
                billHeadCode : values.billHead,
                chargeSection : values.chargeSection,
                recordStatus : editingBillHeadId ? values.status : "Active"
            }

            
            const editid = editingBillHeadId ? editingBillHeadId : null;
            const endpoint = editid ? `/api/TnCBillHeadMaster/Edit/${editid}` : "/api/TnCBillHeadMaster/Add";
            const result = await saveMasters(payload, endpoint, editid);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result?.data?.responseMessage
                );

            } 
            // else {
            //     showErrorMessage(result);
            // }
        } finally {
            setIsSubmitting(false);
            dispatch(FetchTnCBillHeadDataById(id));
            handleCloseMap();
        }

        // if (editingBillHeadId) {
        //     // Edit mode: update existing row, including status
        //     setMappedBillHeads((prev) =>
        //         prev.map((item) =>
        //             item.id === editingBillHeadId
        //                 ? {
        //                       ...item,
        //                       billHead: values.billHead,
        //                       chargeGroup: values.chargeGroup,
        //                       chargeSection: values.chargeSection,
        //                       status: values.status || item.status,
        //                   }
        //                 : item
        //         )
        //     );
        // } else {
        //     // Add mode: new row, status defaults to Active internally (not shown in modal)
        //     const newItem: MappedBillHead = {
        //         id: `MAP${Date.now()}`,
        //         billHead: values.billHead,
        //         chargeGroup: values.chargeGroup,
        //         chargeSection: values.chargeSection,
        //         status: "Active",
        //     };
        //     setMappedBillHeads((prev) => [...prev, newItem]);
        // }

        // setValue("billHead", "");
        // setValue("chargeGroup", "");
        // setValue("chargeSection", "");
        // setValue("status", "");
        // setEditingBillHeadId(null);
        // setIsModalOpenMap(false);
    };

    // Edit icon on a Bill Head grid row -> open modal in edit mode (shows Status)
    const handleEditBillHeadRow = (row: MappedBillHead) => {
        setEditingBillHeadId(row.tnCBillHeadMapId);
        setValue("billHead", row.billHeadCode);
        setValue("chargeGroup", row.billingChargeGroupCode);
        setValue("chargeSection", row.chargeSection);
        setValue("status", row.recordStatus);
        setIsModalOpenMap(true);
    };

    // Delete icon on a Bill Head grid row
    const handleDeleteBillHeadRow = async (row: MappedBillHead) => {
        // setMappedBillHeads((prev) => prev.filter((item) => item.id !== row.id));
        setIsSubmitting(true);
        try 
        {
            const result = await deleteMasters("/api/TnCBillHeadMaster/Delete",row.tnCBillHeadMapId);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result.responseMessage
                );

            } else {
                showErrorMessage(result);
            }
        } finally {
            setIsSubmitting(false);
            dispatch(FetchTnCBillHeadDataById(id));
        }
    };

    // Resolve id -> full dimension object for rendering chips
    const selectedDimensionObjects = dimensionKeyMasterList.filter((d) =>
        selectedDimensions.includes(d.dimensionKey)
    );

    const dimensionColumnDefs = [
        {
            headerName: "Action",
            field: "",
            flex: 1,
            sortable: false,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { display: "flex", alignItems: "center", justifyContent: "center" };
            },
            cellRenderer: (params: any) => {
                const checked = selectedDimensions.includes(params.data.dimensionKey);
                return (
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDimension(params.data.dimensionKey)}
                        className="h-4 w-4 cursor-pointer"
                    />
                );
            },
        },
        {
            headerName: "Dimension",
            field: "dimensionName",
            flex: 3,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
        },
    ];

    // Helper to resolve a dropdown value -> label for display in the grid
    const resolveLabel = (options: { label: string; value: string }[], value: string) =>
        options.find((o) => o.value === value)?.label || value;

    const billHeadColumnDefs = [
        {
            headerName: "Actions",
            field: "",
            flex: 1,
            sortable: false,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
            cellRenderer: (params: any) => {
                return (
                    <div className="flex gap-2">
                        <button
                            title="Edit"
                            onClick={() => handleEditBillHeadRow(params.data)}
                            className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 cursor-pointer"
                        >
                            <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                            title="Delete"
                            onClick={() => handleDeleteBillHeadRow(params.data)}
                            className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-red-600 hover:bg-blue-100 cursor-pointer"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                );
            },
        },
        {
            headerName: "Bill Head",
            field: "billHeadCode",
            flex: 1.5,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
            // valueFormatter: (params: any) => resolveLabel(billHeadOptions, params.value),
        },
        {
            headerName: "Charge Group",
            field: "billingChargeGroupCode",
            flex: 1.5,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
            // valueFormatter: (params: any) => resolveLabel(chargeGroupOptions, params.value),
        },
        {
            headerName: "Charge Section",
            field: "chargeSection",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
        },
        {
            headerName: "Status",
            field: "recordStatus",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
            // cellRenderer: (params: any) => {
            //     const isActive = params.value === "Active";
            //     return (
            //         <span
            //             className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
            //         >
            //             {params.value}
            //         </span>
            //     );
            // },
        },
    ];

    return (
        // <FormLayout
        //     // onSubmit={handleSubmit(onSubmit)}
        //     FormClassName="transition-content w-full px-2 pt-5 lg:pt-2"
        // >
        <Page title="Add TNC Form">
            <div className="min-w-0">
                <div className="bg-card border-border rounded-xl border p-2 py-4 shadow-sm">
                    <div className="flex items-center justify-start gap-4">
                        <h3 className="sub_section_title flex items-center gap-2 text-xl font-semibold text-gray-700">
                            {/* {isEditMode ? "Modify TnC" : "Add TnC"} */}
                            TnC Details
                        </h3>
                    </div>

                    <div className="mt-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                            <div className="flex flex-col gap-1.5">
                                <Input
                                    label="TNC Name"
                                    isRequired
                                    {...register("tncName", {
                                        required: "TNC Name is required",
                                    })}
                                    disabled={readOnly || isEditMode}
                                    error={errors?.tncName?.message}
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
                                    errors={errors?.parentTNCId}
                                    disabled={readOnly}
                                />
                            </div>
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
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Input
                                    label="Charge Section"
                                    {...register("chargeSection")}
                                    disabled={readOnly}
                                    error={errors?.chargeSection?.message}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Input
                                    label="Policy Clause"
                                    {...register("policyClause")}
                                    disabled={readOnly}
                                    error={errors?.policyClause?.message}
                                />
                            </div>
                        </div>

                        {isEditMode && (
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                                <div className="flex flex-col gap-1.5">
                                    <DropdownSelect
                                        label="Operational Status"
                                        name_key="opStatus"
                                        name="opStatus"
                                        defaultValue="Select a status"
                                        options={OpStatusList}
                                        control={control}
                                        errors={errors?.opStatus}
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>
                        )}

                        <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                            TNC Clause Rule Flags
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                            <div className="flex flex-col gap-1.5">
                                <DropdownSelect
                                    label="Default"
                                    name_key="default"
                                    name="default"
                                    options={clauseRuleFlags}
                                    control={control}
                                    errors={errors?.default}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <DropdownSelect
                                    label="Waiting"
                                    name_key="waiting"
                                    name="waiting"
                                    options={clauseRuleFlags}
                                    control={control}
                                    errors={errors?.waiting}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <DropdownSelect
                                    label="Exclusion"
                                    name_key="exclusion"
                                    name="exclusion"
                                    options={clauseRuleFlags}
                                    control={control}
                                    errors={errors?.exclusion}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <DropdownSelect
                                    label="Cashless"
                                    name_key="cashless"
                                    name="cashless"
                                    options={clauseRuleFlags}
                                    control={control}
                                    errors={errors?.cashless}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <DropdownSelect
                                    label="DayCare"
                                    name_key="dayCare"
                                    name="dayCare"
                                    options={clauseRuleFlags}
                                    control={control}
                                    errors={errors?.dayCare}
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="w-full max-w-lg rounded-2xl border shadow-xl overflow-hidden animate-slide-up bg-white border-zinc-200 text-zinc-800">
                            {/* Modal Header */}
                            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-extrabold tracking-tight">
                                        Select Dimensions
                                    </h3>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Modal Body - AG Grid */}
                            <div className="p-5 space-y-4">
                                <div className="h-64">
                                    <AgGridSuperWrapper
                                        rowData={dimensionKeyMasterList}
                                        columnDefs={dimensionColumnDefs}
                                        onRowClick={() => {}}
                                        height="100%"
                                        pagination={false}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-5 pt-0 flex items-center justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveDimensions}
                                    className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white rounded-lg cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isModalOpenMap && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="w-full max-w-lg rounded-2xl border shadow-xl overflow-hidden animate-slide-up bg-white border-zinc-200 text-zinc-800">
                            {/* Modal Header */}
                            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-extrabold tracking-tight">
                                        {editingBillHeadId ? "Modify Bill Head" : "Bill Head"}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleCloseMap}
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 space-y-4">
                                <DropdownSelect
                                    label="Bill Head"
                                    name_key="billHead"
                                    name="billHead"
                                    options={billHeadOptions}
                                    control={control}
                                    errors={errors?.billHead}
                                    rules={{ required: "Bill Head is required" }}
                                />

                                <DropdownSelect
                                    label="Charge Group"
                                    name_key="chargeGroup"
                                    name="chargeGroup"
                                    options={chargeGroupOptions}
                                    control={control}
                                    errors={errors?.chargeGroup}
                                    rules={{ required: "Charge Group is required" }}
                                />

                                <DropdownSelect
                                    label="Charge Section"
                                    name_key="chargeSection"
                                    name="chargeSection"
                                    options={chargeSectionOptions}
                                    control={control}
                                    errors={errors?.chargeSection}
                                    rules={{ required: "Charge Section is required" }}
                                />

                                {/* Status only shown when editing an existing mapping, not when adding new */}
                                {editingBillHeadId && (
                                    <DropdownSelect
                                        label="Status"
                                        name_key="status"
                                        name="status"
                                        options={OpStatusList}
                                        control={control}
                                        errors={errors?.status}
                                        disabled={readOnly}
                                    />
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="p-5 pt-0 flex items-center justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseMap}
                                    className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveBillHead}
                                    className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white rounded-lg cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page-level Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                    >
                        Cancel
                    </button>
                    {readOnly ? (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer"
                        >
                            Edit
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={isSubmitting || loading}
                            onClick={handleSubmit(onSubmit)}
                            className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer"
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>

            <div className="w-full">
                {/* Tabs Header */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab("dimension")}
                        className={`
                            px-5 py-3 text-sm font-semibold transition-all
                            ${
                                activeTab === "dimension"
                                    ? "border-b-2 border-blue-600 text-blue-600"
                                    : "text-gray-500 hover:text-blue-600"
                            }
                        `}
                    >
                        Dimension
                    </button>

                    <button
                        onClick={() => setActiveTab("billHead")}
                        className={`
                            px-5 py-3 text-sm font-semibold transition-all
                            ${
                                activeTab === "billHead"
                                    ? "border-b-2 border-blue-600 text-blue-600"
                                    : "text-gray-500 hover:text-blue-600"
                            }
                        `}
                    >
                        Bill Head
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-2">
                    {activeTab === "dimension" && (
                        <>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={AddDimension}
                                    className="px-5 py-2 text-xs font-extrabold this:success bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer"
                                >
                                    Add Dimension
                                </button>
                            </div>
                            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                                <div className="bg-card border-border rounded-xl border p-2 flex items-center gap-5">
                                    <span className="sub_section_title flex items-center gap-2 text-xl font-semibold text-gray-700 mb">
                                        Dimensions
                                    </span>

                                    {selectedDimensionObjects.length === 0 ? (
                                        <p className="text-xs text-zinc-400">No dimensions selected yet.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDimensionObjects.map((dim) => (
                                                <span
                                                    key={dim.dimensionKey}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700"
                                                >
                                                    {dim.dimensionName}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDimension(dim.dimensionKey)}
                                                        className="rounded-full hover:bg-blue-100 p-0.5 cursor-pointer"
                                                        title={`Remove ${dim.dimensionName}`}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "billHead" && (
                        <>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={MapBillHead}
                                    className="px-5 py-2 text-xs font-extrabold this:success bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer"
                                >
                                    Map Bill
                                </button>
                            </div>
                            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                                {tncBillHeadResponse.length === 0 ? (
                                    <div className="bg-card border-border rounded-xl border p-3">
                                        <p className="text-xs text-zinc-400">No bill heads mapped yet.</p>
                                    </div>
                                ) : (
                                    <div className="h-64">
                                        <AgGridSuperWrapper
                                            rowData={tncBillHeadResponse}
                                            columnDefs={billHeadColumnDefs}
                                            onRowClick={() => {}}
                                            height="100%"
                                            pagination={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        {/* </FormLayout> */}
        </Page>
    );
};

export default AddTnCForm;