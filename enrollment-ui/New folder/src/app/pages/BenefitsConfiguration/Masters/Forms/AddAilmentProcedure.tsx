import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router";
import { toast } from "sonner";
import { X } from "lucide-react";
import FormLayout from "@/components/shared/form/FormLayout";
import { Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { ApplicableICDGroup, ApplicableICDPCSProcedureGroup, ICDResponse, CPT_HCPCS_Response } from "../../../../../store/features/LimitTypeMaster/LimitTypeMasterTypes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { getMasterBreadcrumb, navigateBackToMaster, saveMasters } from "../function";
import { FetchAilmentProcedureMasterDataById, FetchProcedureCategoryDropDownList, FetchAllCPT_HCPCSList, FetchAllICDList } from "../../../../../store/features/LimitTypeMaster/LimitTypeMasterSlice";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";
import Pagination from "@/components/shared/Pagination";
import { Page } from "@/components/shared/Page";

type FormValues = {
    ailmentProcedureName: string;
    sublimitAmount: number|null;
    applicableICDGroup: ApplicableICDGroup[];
    applicableICDPCSProcedureGroup: ApplicableICDPCSProcedureGroup[];
    category: string;
    opStatus: string;
};

type IcdRow = {
    id: string;
    version: string;
    code: string;
    description: string;
};

type CptHcpcsRow = {
    id: string;
    database: "CPT" | "HCPCS";
    version: string;
    code: string;
    description: string;
};

// ---- Hard-coded ICD Version dropdown options ----
const IcdVersionOptions = [
    { label: "2026", value: "2026" },
];

// ---- Hard-coded ICD master list for the modal grid ----
const ICD_MASTER_LIST: IcdRow[] = [
    { id: "ICD001", version: "ICD-10", code: "A00", description: "Cholera" },
    { id: "ICD002", version: "ICD-10", code: "E11", description: "Type 2 Diabetes Mellitus" },
    { id: "ICD003", version: "ICD-10", code: "I10", description: "Essential (Primary) Hypertension" },
    { id: "ICD004", version: "ICD-10", code: "K35", description: "Acute Appendicitis" },
    { id: "ICD005", version: "ICD-9", code: "250.00", description: "Diabetes Mellitus Type II" },
    { id: "ICD006", version: "ICD-9", code: "401.9", description: "Unspecified Essential Hypertension" },
    { id: "ICD007", version: "ICD-11", code: "5A11", description: "Type 2 Diabetes Mellitus" },
    { id: "ICD008", version: "ICD-11", code: "BA00", description: "Hypertension" },
];

// ---- Hard-coded CPT/HCPCS Version dropdown options ----
const CptHcpcsVersionOptions = [
    { label: "2023", value: "2023" },
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
];

// ---- Hard-coded CPT/HCPCS master list for the modal grid ----
const CPT_HCPCS_MASTER_LIST: CptHcpcsRow[] = [
    { id: "CH001", database: "CPT", version: "2024", code: "99201", description: "Office Visit - New Patient" },
    { id: "CH002", database: "CPT", version: "2024", code: "47562", description: "Laparoscopic Cholecystectomy" },
    { id: "CH003", database: "CPT", version: "2024", code: "27447", description: "Total Knee Arthroplasty" },
    { id: "CH004", database: "CPT", version: "2024", code: "58150", description: "Total Abdominal Hysterectomy" },
    { id: "CH005", database: "HCPCS", version: "2024", code: "A0428", description: "Ambulance Service, Basic Life Support" },
    { id: "CH006", database: "HCPCS", version: "2024", code: "E0110", description: "Crutches, Forearm" },
    { id: "CH007", database: "HCPCS", version: "2025", code: "J1100", description: "Injection, Dexamethasone Sodium Phosphate" },
    { id: "CH008", database: "HCPCS", version: "2025", code: "L0450", description: "Thoracic-Lumbar-Sacral Orthosis" },
];

const yesNoOptions = [
    { label: "Yes", value: "YES" },
    { label: "No", value: "NO" },
];

const OpStatusList = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
];

const AddAilmentProcedure: React.FC = () => {
    const dispatch = useAppDispatch();
    const { procedureCategoryDropdownList,ailmentProcedureMasterDataById,icdResponseList,icdResponseTotalRecords,cpt_hcpcs_ResponseList,
        cpt_hcpcs_ResponseTotalRecords } = useAppSelector((state) => state.limitTypeMasterReducer);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue
    } = useForm<FormValues>({
        defaultValues: {
            ailmentProcedureName: "",
            sublimitAmount: 0,
            applicableICDGroup: [],
            applicableICDPCSProcedureGroup: [],
            category: "",
            opStatus: "Active",
        },
    });

    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<boolean>(!id);

    // ---- ICD modal state ----
    const [isIcdModalOpen, setIsIcdModalOpen] = useState(false);
    const [icdVersionFilter, setIcdVersionFilter] = useState("");
    const [icdCodeFilter, setIcdCodeFilter] = useState("");
    const [icdDescFilter, setIcdDescFilter] = useState("");
    const [appliedIcdFilters, setAppliedIcdFilters] = useState({
        version: "",
        code: "",
        description: "",
    });
    const [checkedIcdIds, setCheckedIcdIds] = useState<number[]>([]);
    const [selectedIcdList, setSelectedIcdList] = useState<ICDResponse[]>([]);
    const [checkedIcdRows, setCheckedIcdRows] = useState<ICDResponse[]>([]);

    // ---- CPT/HCPCS modal state ----
    const [isCptHcpcsModalOpen, setIsCptHcpcsModalOpen] = useState(false);
    const [cptChecked, setCptChecked] = useState(false);
    const [hcpcsChecked, setHcpcsChecked] = useState(false);
    const [hcpcsIIChecked, setHcpcsIIChecked] = useState(false);
    const [cptHcpcsVersionFilter, setCptHcpcsVersionFilter] = useState("");
    const [cptHcpcsCodeFilter, setCptHcpcsCodeFilter] = useState("");
    const [cptHcpcsDescFilter, setCptHcpcsDescFilter] = useState("");
    const [appliedCptHcpcsFilters, setAppliedCptHcpcsFilters] = useState({
        cpt: false,
        hcpcs: false,
        version: "",
        code: "",
        description: "",
    });
    const [checkedCptHcpcsIds, setCheckedCptHcpcsIds] = useState<number[]>([]);
    const [selectedCptHcpcsList, setSelectedCptHcpcsList] = useState<CPT_HCPCS_Response[]>([]);
    const [checkedCptHcpcsRows, setCheckedCptHcpcsRows] = useState<CPT_HCPCS_Response[]>([]);
    const [page_Icd, setPage_Icd] = useState(1);
    const [pageSize_Icd, setPageSize_Icd] = useState(20);
    const [page_CPTHCPCS, setPage_CPTHCPCS] = useState(1);
    const [pageSize_CPTHCPCS, setPageSize_CPTHCPCS] = useState(20);

    const breadcrumbs = [
        { title: "Benefits Configuration" },
        { title: "Masters" },
        getMasterBreadcrumb("Ailment Procedure", "AilmentProcedure"),
        { title: id ? "View" : "Add" },
    ];
    useBreadcrumb(breadcrumbs);

    const readOnly = id && !editing;
    const isEditMode = !!id;

    useEffect(()=>{
        if(id!=null)
        {
            dispatch(FetchAilmentProcedureMasterDataById(id));
        }
        dispatch(FetchProcedureCategoryDropDownList());
    },[id]);

    useEffect(()=>{
        if(id!=null && ailmentProcedureMasterDataById!=null)
        {
            setValue("ailmentProcedureName", ailmentProcedureMasterDataById.ailmentProcedureName);
            setValue("sublimitAmount", ailmentProcedureMasterDataById.sublimitAmount);
            setValue("category", ailmentProcedureMasterDataById.procedureCategoryCode);
            setValue("opStatus", ailmentProcedureMasterDataById.recordStatus);
            setSelectedIcdList(ailmentProcedureMasterDataById.applicableICDGroup ?? []);
            setSelectedCptHcpcsList(ailmentProcedureMasterDataById.applicableICDPCSProcedureGroup ?? []);
        }
    },[id,ailmentProcedureMasterDataById,setValue])

    const ProcedureCategoryOptions = procedureCategoryDropdownList?.map((item)=>({
        label: item.procedureCategoryName,
        value: item.procedureCategoryCode
    })) ?? [];

    const handleGetICDCodes = (code="",description="",year="",page1=page_Icd,pageSize1=pageSize_Icd)=>{
        const payload = {
            code: code,
            description: description,
            year: year,
            pageNumber: page1,
            pageSize: pageSize1
        }
        dispatch(FetchAllICDList(payload));
    }

    useEffect(()=>{
        if(isIcdModalOpen)
        {
            handleGetICDCodes(icdCodeFilter,icdDescFilter,icdVersionFilter);
        }
    },[page_Icd,pageSize_Icd])

    const handlePageChange_Icd = (p: number) => {
        setPage_Icd(p);
    };
    const handlePageSizeChange_Icd = (size: number) => {
        setPageSize_Icd(size);
        setPage_Icd(1);
    };

    const handleGetCPT_HCPCS_Codes = (code="",description="",icdList = selectedIcdList,databaseCheck=true,page1=page_CPTHCPCS,pageSize1=pageSize_CPTHCPCS)=>{
        const payload = {
            icdId: icdList.map((i) => i.icdId) || [],
            database: databaseCheck ? [
                ...(cptChecked ? ["CPT"] : []),
                ...(hcpcsChecked ? ["HCPCS"] : []),
                ...(hcpcsIIChecked ? ["HCPCS II"] : []),
            ] : [],
            code: code,
            description: description,
            pageNumber: page1,
            pageSize: pageSize1
        }
        dispatch(FetchAllCPT_HCPCSList(payload));
    }

    useEffect(()=>{
        if(isCptHcpcsModalOpen)
        {
            handleGetCPT_HCPCS_Codes(cptHcpcsCodeFilter,cptHcpcsDescFilter);
        }
    },[page_CPTHCPCS,pageSize_CPTHCPCS])

    const handlePageChange_CPTHCPCS = (p: number) => {
        setPage_CPTHCPCS(p);
    };
    const handlePageSizeChange_CPTHCPCS = (size: number) => {
        setPageSize_CPTHCPCS(size);
        setPage_CPTHCPCS(1);
    };

    const handleResetCPT_HCPCS =()=>{
        setCptHcpcsDescFilter("");
        setCptHcpcsCodeFilter("");
        setCptChecked(false);setHcpcsIIChecked(false);setHcpcsChecked(false);
        handleGetCPT_HCPCS_Codes("","",selectedIcdList,false);
    }

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setLoading(true);
        try {
            const payload = {
                ailmentProcedureName: data.ailmentProcedureName,
                procedureCategoryCode: data.category,
                sublimitAmount: data.sublimitAmount,
                applicableICDGroup: selectedIcdList?.map((item) => ({
                    icdId: item.icdId,
                    icdCode: item.icdCode,
                    briefDescription: item.briefDescription,
                    icdCodeCodingYear: item.icdCodeCodingYear,
                    icdCodeVersion : item.icdCodeVersion
                })) ?? [],
                applicableICDPCSProcedureGroup: selectedCptHcpcsList?.map((item) => ({
                    linkId: item.linkId,
                    icdId: item.icdId,
                    qualifier: item.qualifier,
                    icdCode : item.icdCode,
                    code:  item.code,
                    description:  item.description,
                    version:  item.version
                })) ?? [],
                recordStatus: data.opStatus
            }

            const endpoint = isEditMode ? `/api/AilmentProcedureMaster/Edit/${data.ailmentProcedureName}` : "/api/AilmentProcedureMaster/Add";
            const idValue = isEditMode ? id : null;
            const result = await saveMasters(payload, endpoint, idValue);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result?.data?.responseMessage
                );
                navigateBackToMaster(
                    navigate,
                    location.state?.activeTab || "AilmentProcedure"
                );
            } 
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const onCancel = () => {
        navigateBackToMaster(
            navigate,
            location.state?.activeTab || "AilmentProcedure"
        );
    };

    const onEdit = () => setEditing(true);

    // ---- ICD modal handlers ----
    const openIcdModal = () => {
        setCheckedIcdIds(selectedIcdList.map((i) => i.icdId));
        setCheckedIcdRows(selectedIcdList);
        handleGetICDCodes();
        setIsIcdModalOpen(true);
    };

    const handleCloseIcdModal = () => {
        setIsIcdModalOpen(false);
        setIcdCodeFilter("");
        setIcdDescFilter("");
        setIcdVersionFilter("");
        setPageSize_Icd(20);
        setPage_Icd(1);
    };

    const toggleIcdCheck = (id: number) => {
        const row = icdResponseList.find((item) => item.icdId === id);
    
        if (!row) return;
    
        setCheckedIcdIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((itemId) => itemId !== id);
            }
    
            return [...prev, id];
        });
    
        setCheckedIcdRows((prev) => {
            const exists = prev.some((item) => item.icdId === id);
    
            if (exists) {
                return prev.filter((item) => item.icdId !== id);
            }
    
            return [...prev, row];
        });
    };

    // const handleAddIcd = () => {
    //     setSelectedIcdList((prevSelected) => {
    //         const merged = [...prevSelected, ...checkedIcdRows];
        
    //         return merged.filter(
    //             (item, index, self) =>
    //                 index === self.findIndex((x) => x.icdId === item.icdId)
    //         );
    //     });
    //     handleCloseIcdModal();
    // };
    const handleAddIcd = () => {
        setSelectedIcdList((prevSelected) => {
            // IDs currently selected in the modal
            const checkedIds = new Set(
                checkedIcdRows.map((item) => item.icdId)
            );
    
            // Keep previously selected items that are still checked
            const existingSelected = prevSelected.filter((item) =>
                checkedIds.has(item.icdId)
            );
    
            // Add newly checked items
            const merged = [
                ...existingSelected,
                ...checkedIcdRows,
            ];
    
            // Remove duplicates
            return merged.filter(
                (item, index, self) =>
                    index ===
                    self.findIndex(
                        (x) => x.icdId === item.icdId
                    )
            );
        });
        handleCloseIcdModal();
    };

    const removeSelectedIcd = (id: number) => {
        setSelectedIcdList((prev) => prev.filter((item) => item.icdId !== id));
        setCheckedIcdRows((prev) => prev.filter((item) => item.icdId !== id));
        const icdList = selectedIcdList.filter((item)=> item.icdId !== id);
        if(isCptHcpcsModalOpen)
        {
            handleGetCPT_HCPCS_Codes(cptHcpcsCodeFilter,cptHcpcsDescFilter,icdList);
        }else if(selectedCptHcpcsList?.length>0) {
            setSelectedCptHcpcsList((prev) => prev.filter((item) => item.icdId !== id));
        }
    };

    const toggleAllIcd = () => {
        const allIds = icdResponseList.map((item) => item.icdId);
    
        const allSelected =
            allIds.length > 0 &&
            allIds.every((id) => checkedIcdIds.includes(id));
        
        if (allSelected) {
            // Unselect all
            setCheckedIcdIds([]);
            setCheckedIcdRows([]);
        } else {
            // Select all
            setCheckedIcdIds(allIds);
            setCheckedIcdRows(icdResponseList);
        }
    };

    const icdColumnDefs = [
        {
            headerName: "Action",
            field: "",
            flex: 0.7,
            sortable: false,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { display: "flex", alignItems: "center", justifyContent: "center" };
            },
            headerComponent: () => {
                const allSelected =
                    icdResponseList.length > 0 &&
                    icdResponseList.every((item) =>
                        checkedIcdIds.includes(item.icdId)
                    );
        
                return (
                    <div  style ={{display: "flex", alignItems: "center", justifyContent: "center",width: '100%'}}>
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAllIcd}
                        className="h-4 w-4 cursor-pointer"                       
                        title={allSelected ? "Unselect All" : "Select All"}
                    />
                    </div>
                );
            },
            cellRenderer: (params: any) => {
                const checked = checkedIcdIds.includes(params.data.icdId);
                return (
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleIcdCheck(params.data.icdId)}
                        className="h-4 w-4 cursor-pointer"
                    />
                );
            },
        },
        {
            headerName: "ICD Version",
            field: "icdCodeVersion",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
        },
        {
            headerName: "Code",
            field: "icdCode",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
        },
        {
            headerName: "Code Description",
            field: "briefDescription",
            flex: 2,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
        },
    ];

    // ---- CPT/HCPCS modal handlers ----
    const openCptHcpcsModal = () => {
        setCheckedCptHcpcsIds(selectedCptHcpcsList.map((i) => i.linkId));
        setCheckedCptHcpcsRows(selectedCptHcpcsList);
        handleGetCPT_HCPCS_Codes("","");
        setIsCptHcpcsModalOpen(true);
    };

    const handleCloseCptHcpcsModal = () => {
        setIsCptHcpcsModalOpen(false);
        setCptHcpcsDescFilter("");
        setCptHcpcsCodeFilter("");
        setCptChecked(false);setHcpcsIIChecked(false);setHcpcsChecked(false);
        setPageSize_CPTHCPCS(20);
        setPage_CPTHCPCS(1);
    };

    const toggleCptHcpcsCheck = (id: number) => {
        const row = cpt_hcpcs_ResponseList.find((item) => item.linkId === id);
    
        if (!row) return;
    
        setCheckedCptHcpcsIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((itemId) => itemId !== id);
            }
    
            return [...prev, id];
        });
    
        setCheckedCptHcpcsRows((prev) => {
            const exists = prev.some((item) => item.linkId === id);
    
            if (exists) {
                return prev.filter((item) => item.linkId !== id);
            }
    
            return [...prev, row];
        });
    };

    // const handleAddCptHcpcs = () => {
    //     setSelectedCptHcpcsList((prevSelected) => {
    //         const merged = [...prevSelected, ...checkedCptHcpcsRows];
        
    //         return merged.filter(
    //             (item, index, self) =>
    //                 index === self.findIndex((x) => x.linkId === item.linkId)
    //         );
    //     });
    //     handleCloseCptHcpcsModal();
    // };
    const handleAddCptHcpcs = () => {
        setSelectedCptHcpcsList((prevSelected) => {
            // IDs currently selected in the modal
            const checkedIds = new Set(
                checkedCptHcpcsRows.map((item) => item.linkId)
            );
    
            // Keep previously selected items that are still checked
            const existingSelected = prevSelected.filter((item) =>
                checkedIds.has(item.linkId)
            );
    
            // Add newly checked items
            const merged = [
                ...existingSelected,
                ...checkedCptHcpcsRows,
            ];
    
            // Remove duplicates
            return merged.filter(
                (item, index, self) =>
                    index ===
                    self.findIndex(
                        (x) => x.linkId === item.linkId
                    )
            );
        });
        handleCloseCptHcpcsModal();
    };

    const removeSelectedCptHcpcs = (id: number) => {
        setSelectedCptHcpcsList((prev) => prev.filter((item) => item.linkId !== id));
        setCheckedCptHcpcsRows((prev) => prev.filter((item) => item.linkId !== id));
    };

    const toggleAllCptHcpcs = () => {
        const allIds = cpt_hcpcs_ResponseList.map((item) => item.linkId);
    
        const allSelected =
            allIds.length > 0 &&
            allIds.every((id) => checkedCptHcpcsIds.includes(id));
    
        if (allSelected) {
            // Unselect all
            setCheckedCptHcpcsIds([]);
            setCheckedCptHcpcsRows([]);
        } else {
            // Select all
            setCheckedCptHcpcsIds(allIds);
            setCheckedCptHcpcsRows(cpt_hcpcs_ResponseList);
        }
    };

    const cptHcpcsColumnDefs = [
        {
            headerName: "Action",
            field: "",
            flex: 0.7,
            sortable: false,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { display: "flex", alignItems: "center", justifyContent: "center" };
            },
            headerComponent: () => {
                const allSelected =
                cpt_hcpcs_ResponseList.length > 0 &&
                    cpt_hcpcs_ResponseList.every((item) =>
                        checkedCptHcpcsIds.includes(item.linkId)
                    );
        
                return (
                    <div  style ={{display: "flex", alignItems: "center", justifyContent: "center",width: '100%'}}>
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAllCptHcpcs}
                        className="h-4 w-4 cursor-pointer"                       
                        title={allSelected ? "Unselect All" : "Select All"}
                    />
                    </div>
                );
            },
            cellRenderer: (params: any) => {
                const checked = checkedCptHcpcsIds.includes(params.data.linkId);
                return (
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCptHcpcsCheck(params.data.linkId)}
                        className="h-4 w-4 cursor-pointer"
                    />
                );
            },
        },
        {
            headerName: "ICD Code",
            field: "icdCode",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
        },
        {
            headerName: "Code",
            field: "code",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
        },
        {
            headerName: "CPT/HCPCS",
            field: "qualifier",
            flex: 1,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
        },
        {
            headerName: "Code Description",
            field: "description",
            flex: 2,
            sortable: true,
            autoHeight: true,
            headerClass: "wrap-text",
            cellStyle: function () {
                return { whiteSpace: "normal" };
            },
        },
    ];

    return (
        <Page title="Add Ailment Procedure Form">
            <div className="min-w-0">
                <div className="bg-card border-border rounded-xl border p-2 py-4 shadow-sm">
                    <div className="flex items-center justify-start gap-4">
                        <h3 className="sub_section_title flex items-center gap-2 text-xl font-semibold text-gray-700">
                            {isEditMode ? "Modify Ailment Procedure" : "Add Ailment Procedure"}
                        </h3>
                    </div>

                    <div className="mt-2 space-y-4">
                        {/* Code / Name / Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                     
                            <div className="flex flex-col gap-1.5">
                                <Input
                                    label="Name"
                                    isRequired
                                    {...register("ailmentProcedureName", {
                                        required: "Name is required",
                                    })}
                                    disabled={readOnly|| isEditMode}
                                    error={errors ?.ailmentProcedureName ?.message}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <DropdownSelect
                                    label="Category"
                                    name_key="category"
                                    name="category"
                                    options={ProcedureCategoryOptions}
                                    control={control}
                                    errors={errors?.category}
                                    isRequired
                                    rules={{ required: "Category is required" }}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Input
                                    label="Sub-limit Amount"
                                    // isRequired
                                    {...register("sublimitAmount", {
                                        required: "Sub Limit Amount is required",
                                    })}
                                    disabled={readOnly}
                                    error={errors ?.sublimitAmount ?.message}
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
                                        errors={errors ?.opStatus}
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>
                        )}
                        {/* ICD / CPT-HCPCS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* ICD Card */}
                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-4 transition-shadow hover:shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-xs font-bold">
                                            ICD
                </span>
                                        <label className="text-sm font-semibold text-zinc-700">
                                            ICD Codes
                </label>
                                    </div>
                                    <div>
                                    <label className="mr-2">Count : {selectedIcdList.length}</label>
                                    <button
                                        type="button"
                                        onClick={()=>{
                                            setSelectedIcdList([]);
                                            setCheckedIcdRows([]);
                                            setSelectedCptHcpcsList([]);
                                            setCheckedCptHcpcsIds([]);
                                        }}
                                        disabled={readOnly}
                                        className="px-3.5 mr-2 py-1.5 text-xs font-bold this:error  bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {"Clear All"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openIcdModal}
                                        disabled={readOnly}
                                        className="px-3.5 py-1.5 text-xs font-bold this:primary bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {"+ Select"}
                                    </button>
                                    </div>
                                </div>

                                {selectedIcdList.length === 0 ? (
                                    <p className="text-xs text-zinc-400 italic">No ICD codes selected yet.</p>
                                ) : (
                                        <div style={{maxHeight: '100px',overflowY: 'auto'}}>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedIcdList.map((item) => (
                                                <span
                                                    key={item.icdId}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-blue-200 pl-3 pr-1.5 py-1 text-xs font-medium text-blue-700 shadow-sm transition-colors hover:border-blue-300"
                                                >
                                                    <span className="font-semibold">{item.icdCode}</span>
                                                    {!readOnly && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSelectedIcd(item.icdId)}
                                                            className="rounded-full hover:bg-red-50 hover:text-red-600 p-0.5 cursor-pointer transition-colors ml-0.5"
                                                            title={`Remove ${item.icdCode}`}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                        </div>
                                    )}
                            </div>

                            {/* CPT/HCPCS Card */}
                            <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/60 to-white p-4 transition-shadow hover:shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 text-[10px] font-bold">
                                            CPT
                </span>
                                        <label className="text-sm font-semibold text-zinc-700">
                                            CPT/HCPCS Codes
                </label>
                                    </div>
                                    <div>
                                    <label className="mr-2">Count : {selectedCptHcpcsList.length}</label>
                                    <button
                                        type="button"
                                        onClick={()=>{
                                            setSelectedCptHcpcsList([]);
                                            setCheckedCptHcpcsIds([]);
                                        }}
                                        disabled={selectedCptHcpcsList?.length==0 || readOnly}
                                        className="px-3.5 mr-2 py-1.5 text-xs font-bold this:error  bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {"Clear All"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openCptHcpcsModal}
                                        disabled={selectedIcdList?.length == 0 || readOnly}
                                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {"+ Select"}
                                    </button>
                                    </div>
                                </div>

                                    {selectedCptHcpcsList.length === 0 ? (
                                        <p className="text-xs text-zinc-400 italic ">
                                            No CPT/HCPCS codes selected yet.
                                        </p>
                                    ) : (
                                        <div className="flex flex-col gap-1.5">
                                            {["CPT", "HCPCS", "HCPCS II"].map((qualifier) => {
                                                const items = selectedCptHcpcsList.filter(
                                                    (item) => item.qualifier === qualifier
                                                );

                                                if (items.length === 0) return null;

                                                return (
                                                    <div
                                                        key={qualifier}
                                                        className="text-xs font-medium text-violet-700 flex items-center gap-1.5"
                                                    >
                                                        <span className="font-semibold">
                                                            {qualifier} -{" "}
                                                        </span>
                                                        <span className="flex flex-wrap gap-1.5">
                                                        {items.map((item, index) => (
                                                           
                                                            <span key={item.linkId}>
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-violet-200 pl-3 pr-1.5 py-1 text-xs font-medium text-violet-700 shadow-sm transition-colors hover:border-violet-300">
                                                                    <span className="font-medium">
                                                                        {item.code}
                                                                    </span>

                                                                    {!readOnly && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeSelectedCptHcpcs(item.linkId)
                                                                            }
                                                                            className="rounded-full hover:bg-red-50 hover:text-red-600 p-0.5 cursor-pointer transition-colors ml-0.5"
                                                                            title={`Remove ${item.code}`}
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </button>
                                                                    )}
                                                                </span>
                                                            </span>
                                                        ))}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page-level Action Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3">
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
                                type="submit"
                                disabled={isSubmitting || loading}
                                onClick={handleSubmit(onSubmit)}
                                className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer"
                            >
                                Save
                        </button>
                        )}
                </div>
            </div>

            {/* ---- ICD Selection Modal ---- */}
            {isIcdModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-4xl rounded-2xl border shadow-xl overflow-hidden animate-slide-up bg-white border-zinc-200 text-zinc-800">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-zinc-150 flex items-center justify-between">
                            <h3 className="text-sm font-extrabold tracking-tight">ICD</h3>
                            <button
                                onClick={handleCloseIcdModal}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Filter Row */}
                        <div className="p-5 pb-0">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div className="flex flex-col gap-1.5">
                                    <DropdownSelect
                                        label="ICD Version"
                                        name_key="icdVersionFilter"
                                        name="icdVersionFilter"
                                        options={IcdVersionOptions}
                                        control={control}
                                        errors={errors ?.icdVersionFilter}
                                        disabled={readOnly}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        label="Code"
                                        value={icdCodeFilter}
                                        onChange={(e) => setIcdCodeFilter(e.target.value)}
                                        placeholder="Search by code"
                                        disabled={readOnly}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        value={icdDescFilter}
                                        label="Code Description"
                                        onChange={(e) => setIcdDescFilter(e.target.value)}
                                        placeholder="Search by description"
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-3">
                                <button
                                    type="button"
                                    onClick={()=>{
                                        setIcdCodeFilter(""); setIcdDescFilter(""); setIcdVersionFilter("");
                                        handleGetICDCodes("","","");
                                    }}
                                    className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={()=>{
                                        handleGetICDCodes(icdCodeFilter,icdDescFilter,icdVersionFilter);
                                    }}
                                    className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="p-5">
                            <div className="h-72">
                                <AgGridSuperWrapper
                                    rowData={icdResponseList}
                                    columnDefs={icdColumnDefs}
                                    onRowClick={() => { }}
                                    pageSize={pageSize_Icd}
                                    height="100%"
                                    pagination={false}
                                />
                            </div>
                            <Pagination
                                className="shrink-0"
                                page={page_Icd}
                                pageSize={pageSize_Icd}
                                totalItems={icdResponseTotalRecords}
                                onPageChange={handlePageChange_Icd}
                                onPageSizeChange={handlePageSizeChange_Icd}
                                pageSizeOptions={[20, 30, 50, 100,icdResponseTotalRecords]}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="p-5 pt-0 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseIcdModal}
                                className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddIcd}
                                className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---- CPT/HCPCS Selection Modal ---- */}
            {isCptHcpcsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-4xl rounded-2xl border shadow-xl overflow-hidden animate-slide-up bg-white border-zinc-200 text-zinc-800">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-zinc-150 flex items-center justify-between">
                            <h3 className="text-sm font-extrabold tracking-tight">CPT/HCPCS</h3>
                            <button
                                onClick={handleCloseCptHcpcsModal}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Filter Row */}
                        <div className="p-4 pb-0">
                            {/* Database checkboxes */}
                            <div className="flex flex-col gap-1.5 mb-3">
                                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-2 transition-shadow hover:shadow-sm">
                                    <label className="text-xs font-semibold text-zinc-500">ICD</label>

                                    {selectedIcdList.length === 0 ? (
                                        <p className="text-xs text-zinc-400 italic">No ICD codes selected yet.</p>
                                    ) : (
                                            <div style={{maxHeight: '100px',overflowY: 'auto'}}>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedIcdList.map((item) => (
                                                    <span
                                                        key={item.icdId}
                                                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-blue-200 pl-3 pr-1.5 py-1 text-xs font-medium text-blue-700 shadow-sm transition-colors hover:border-blue-300"
                                                    >
                                                        <span className="font-semibold">{item.icdCode}</span>
                                                        {/* <span className="text-zinc-400">·</span>
                                                        <span className="text-zinc-600">{item.briefDescription}</span> */}
                                                        {/* {!readOnly && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSelectedIcd(item.icdId)}
                                                                className="rounded-full hover:bg-red-50 hover:text-red-600 p-0.5 cursor-pointer transition-colors ml-0.5"
                                                                title={`Remove ${item.icdCode}`}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        )} */}
                                                    </span>
                                                ))}
                                            </div>
                                            </div>
                                        )}
                                </div>
                                <label className="text-xs font-semibold text-zinc-500">Database</label>

                                <div className="flex items-center gap-5">
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={cptChecked}
                                            onChange={(e) => setCptChecked(e.target.checked)}
                                            className="h-4 w-4 cursor-pointer"
                                        />
                                        CPT
                                    </label>
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hcpcsChecked}
                                            onChange={(e) => setHcpcsChecked(e.target.checked)}
                                            className="h-4 w-4 cursor-pointer"
                                        />
                                        HCPCS
                                    </label>
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hcpcsIIChecked}
                                            onChange={(e) => setHcpcsIIChecked(e.target.checked)}
                                            className="h-4 w-4 cursor-pointer"
                                        />
                                        HCPCS II
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">

                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        label="Code"
                                        value={cptHcpcsCodeFilter}
                                        onChange={(e) => setCptHcpcsCodeFilter(e.target.value)}
                                        placeholder="Search by code"
                                        disabled={readOnly}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        value={cptHcpcsDescFilter}
                                        label="Code Description"
                                        onChange={(e) => setCptHcpcsDescFilter(e.target.value)}
                                        placeholder="Search by description"
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-3">
                                <button
                                    type="button"
                                    onClick={()=>{ handleResetCPT_HCPCS()}}
                                    className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={()=>{ handleGetCPT_HCPCS_Codes(cptHcpcsCodeFilter,cptHcpcsDescFilter) }}
                                    className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="p-5">
                            <div className="h-72">
                                <AgGridSuperWrapper
                                    rowData={cpt_hcpcs_ResponseList}
                                    columnDefs={cptHcpcsColumnDefs}
                                    onRowClick={() => { }}
                                    height="100%"
                                    pagination={false}
                                    pageSize={pageSize_CPTHCPCS}
                                />
                            </div>
                            <Pagination
                                className="shrink-0"
                                page={page_CPTHCPCS}
                                pageSize={pageSize_CPTHCPCS}
                                totalItems={cpt_hcpcs_ResponseTotalRecords}
                                onPageChange={handlePageChange_CPTHCPCS}
                                onPageSizeChange={handlePageSizeChange_CPTHCPCS}
                                pageSizeOptions={[20, 30, 50, 100,cpt_hcpcs_ResponseTotalRecords]}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="p-5 pt-0 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseCptHcpcsModal}
                                className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddCptHcpcs}
                                className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Page>
    );
};

export default AddAilmentProcedure;