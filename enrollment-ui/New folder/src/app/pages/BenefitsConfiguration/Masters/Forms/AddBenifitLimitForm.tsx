import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Switch } from "@/components/ui";
import { useNavigate, useLocation, useParams } from "react-router";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { FetchDimensionKeyMasterList,FetchTnCDimensionDataById, FetchLimitBasisMasterList, FetchLimitUnitMasterList, FetchLimitTypeMasterList, FetchTnCMasterDropDownList, FetchParameterDropDownList, FetchTncLimitActionLevelDropDownList, FetchGetTncLimitActionStageDropDownList, FetchGetTncLimitClaimSpecialActionDropDownList, FetchAllCPT_HCPCSList, FetchAllICDList, FetchParameterDataById, FetchGetTncLimitActionDropDownList, FetchBenefitLimitDataById, FetchBenefitLimitTree, FetchOperatorMasterList, FetchBenefitRuleDataById, FetchTncDimensionsByHierarchy } from "../../../../../store/features/LimitTypeMaster/LimitTypeMasterSlice";
import { getMasterBreadcrumb, navigateBackToMaster, saveMasters } from "../function";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import Pagination from "@/components/shared/Pagination";
import { ICDResponse, CPT_HCPCS_Response } from "../../../../../store/features/LimitTypeMaster/LimitTypeMasterTypes";
import { X } from "lucide-react";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";

/* ============================================================
   TYPES
============================================================ */

export type ModalType = "LIMIT" | "RULE" | "GROUP";

type BenefitFormProps = {
    type: ModalType;

    item?: any;

    id?: string;

    benefitLimitId?: string;

    parentNodeId?: string | null;

    onClose: () => void;

    onSave: (data: any) => void;
};
// const OperatorOptions = [
//     { label: "<", value: "<" },
//     { label: ">", value: ">" },
//     { label: "=", value: "=" },
//     { label: "<=", value: "<=" },
//     { label: ">=", value: ">=" },
//     { label: "!=", value: "!=" },
//     { label: "in", value: "in" },
// ];
const IcdVersionOptions = [
    { label: "2026", value: "2026" },
];
const ConditionActionBothOptions = [
    { label: "Condition", value: "Condition" },
    { label: "Action", value: "Action" },
    { label: "Both", value: "Both" },
];
const OpStatusList = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" }
];


type FormValues = {
    benefitLimitCode : string;
    tncName: string;
    dimensionKey: string;
    parentDimensionKey: string;
    parameter: string;
    parameterSource: string;
    parameterCalculation: string;
    operator: string;
    limitType: string;
    limitBasis: string;
    limitUnit: string;
    value: string;
    defaultValue: string;
    // defaultValue: boolean;
    conditionBasis: string;
    conditionOperator: string;
    conditionValue: string;
    // groupName: string;
    // logicalOperator: string;
    clause: string;
    specificCopaymentApplicable: boolean;
    specificCopaymentPercentage: string;
    entryClaimCountTable : boolean;
    entryBSITable : boolean;
    conditionActionBoth : string;
    actionIfTrue:string;
    actionIfFalse:string;
    tncLimitActionLevel:string;
    tncLimitActionStage:string;
    tncLimitClaimSpecialAction:string;
    recordStatus : string
};

/* ============================================================
   SCREEN
============================================================ */

const AddBenefitLimitForm = ({ type="LIMIT",
    item,
    id: propId,
    benefitLimitId,
    parentNodeId,
    onClose,
    onSave, }: BenefitFormProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
    const { limitBasisList,limitTypeList,limitUnitList,dimensionKeyMasterList,tncMasterDropdown,parameterMasterDataById,parameterMasterDropdown,
        tncLimitClaimSpecialActionDropDown,tncLimitActionStageDropDown,tncLimitActionLevelDropDown,icdResponseList,icdResponseTotalRecords,cpt_hcpcs_ResponseList,
        cpt_hcpcs_ResponseTotalRecords,tncLimitActionDropDown,benefitLimitMasterDataById,operatorMasterList,benefitRuleDataById,tnCDimensionResponse,tncDimensionsByHierarchy } = useAppSelector((state) => state.limitTypeMasterReducer);

    useEffect(()=>{
        const fetchData = async () => {
            const payload = {
                getAll: true
            };
    
            await Promise.all([
                // dispatch(FetchDimensionKeyMasterList(payload)),
                dispatch(FetchLimitBasisMasterList(payload)),
                dispatch(FetchLimitUnitMasterList(payload)),
                dispatch(FetchLimitTypeMasterList(payload)),
                dispatch(FetchOperatorMasterList(payload)),
                dispatch(FetchTnCMasterDropDownList()),
                dispatch(FetchParameterDropDownList()),
                dispatch(FetchTncLimitActionLevelDropDownList()),
                // dispatch(FetchGetTncLimitActionStageDropDownList()),
                dispatch(FetchGetTncLimitClaimSpecialActionDropDownList()),
                dispatch(FetchGetTncLimitActionDropDownList()),
            ]);
            setDropdownsLoaded(true);
            // setTimeout(() => {
            //     dispatch(FetchTnCMasterDropDownList());
            //     dispatch(FetchParameterDropDownList());
            //     dispatch(FetchTncLimitActionLevelDropDownList());
            //     // dispatch(FetchGetTncLimitActionStageDropDownList());
            //     dispatch(FetchGetTncLimitClaimSpecialActionDropDownList());
            //     dispatch(FetchGetTncLimitActionDropDownList());
            // }, 500);
        };
    
        fetchData();
    }, []);

    const breadcrumbs = [
        { title: "Benefits Configuration" },
        { title: "Masters" },
        // { title: "Benefit Rules", path: "/benefits-configuration/benefits-master" },
        getMasterBreadcrumb("Benefit Limits", "BenefitRulesBuilder"),
        // { title: param ?.id ? "View" : "Add" },
    ];
    useBreadcrumb(breadcrumbs);

    const TnCNameOptions = tncMasterDropdown?.map((item)=>({
        label: item.tncName,
        value: item.tncId
    })) ?? [];

    const DimensionKeyOptions = tncDimensionsByHierarchy?.map((item)=>({
        label: item.dimensionKey,
        value: item.tnCDimensionId
    })) ?? [];

    const ParameterOptions = parameterMasterDropdown?.map((item)=>({
        label: item.parameterName,
        value: item.parameterId
    })) ?? [];

    const LimitTypeOptions = limitTypeList?.map((item)=>({
        label: item.limitTypeName,
        value: item.limitTypeCode
    })) ?? [];

    const LimitBasisOptions = limitBasisList?.map((item)=>({
        label: item.limitBasisName,
        value: item.limitBasisCode
    })) ?? [];

    const LimitUnitOptions = limitUnitList?.map((item)=>({
        label: item.limitUnitName,
        value: item.limitUnitCode
    })) ?? [];
    const TncLimitClaimSpecialActionOptions = tncLimitClaimSpecialActionDropDown?.map((item)=>({
        label: item.tncLimitClaimSpecialActionName,
        value: item.tncLimitClaimSpecialActionCode
    })) ?? [];
    // const TncLimitActionStageOptions = tncLimitActionStageDropDown?.map((item)=>({
    //     label: item.tncLimitActionStageName,
    //     value: item.tncLimitActionStageCode
    // })) ?? [];
    const TncLimitActionLevelOptions = tncLimitActionLevelDropDown?.map((item)=>({
        label: item.tncLimitActionLevelName,
        value: item.tncLimitActionLevelCode
    })) ?? [];
    const TncLimitActionOptions = tncLimitActionDropDown?.map((item)=>({
        label: item.tncLimitActionName,
        value: item.tncLimitActionCode
    })) ?? [];
    const OperatorOptions = operatorMasterList?.map((item)=>({
        label: item.operatorSymbol,
        value: item.operatorCode
    })) ?? [];

    const { id : routeId } = useParams();
    const id = propId ?? routeId;
    const [editing, setEditing] = useState<boolean>(!id);
    const [isIcdModalOpen, setIsIcdModalOpen] = useState(false);
    const [icdVersionFilter, setIcdVersionFilter] = useState("");
    const [icdCodeFilter, setIcdCodeFilter] = useState("");
    const [icdDescFilter, setIcdDescFilter] = useState("");
    const [checkedIcdIds, setCheckedIcdIds] = useState<number[]>([]);
    const [selectedIcdList, setSelectedIcdList] = useState<ICDResponse[]>([]);
    const [checkedIcdRows, setCheckedIcdRows] = useState<ICDResponse[]>([]);

    const [isCptHcpcsModalOpen, setIsCptHcpcsModalOpen] = useState(false);
    const [cptChecked, setCptChecked] = useState(false);
    const [hcpcsChecked, setHcpcsChecked] = useState(false);
    const [hcpcsIIChecked, setHcpcsIIChecked] = useState(false);
    const [cptHcpcsCodeFilter, setCptHcpcsCodeFilter] = useState("");
    const [cptHcpcsDescFilter, setCptHcpcsDescFilter] = useState("");
    const [checkedCptHcpcsIds, setCheckedCptHcpcsIds] = useState<number[]>([]);
    const [selectedCptHcpcsList, setSelectedCptHcpcsList] = useState<CPT_HCPCS_Response[]>([]);
    const [checkedCptHcpcsRows, setCheckedCptHcpcsRows] = useState<CPT_HCPCS_Response[]>([]);
    const [page_Icd, setPage_Icd] = useState(1);
    const [pageSize_Icd, setPageSize_Icd] = useState(20);
    const [page_CPTHCPCS, setPage_CPTHCPCS] = useState(1);
    const [pageSize_CPTHCPCS, setPageSize_CPTHCPCS] = useState(20);

    const readOnly = id && !editing;
    const isEditMode = !!id;

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
            // icdId: icdList.map((i) => i.icdId) || [],
            icdId: [],
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

    const handleAddIcd = () => {
        // setSelectedIcdList((prevSelected) => {
        //     const merged = [...prevSelected, ...checkedIcdRows];
        
        //     return merged.filter(
        //         (item, index, self) =>
        //             index === self.findIndex((x) => x.icdId === item.icdId)
        //     );
        // });
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

    const handleAddCptHcpcs = () => {
        // setSelectedCptHcpcsList((prevSelected) => {
        //     const merged = [...prevSelected, ...checkedCptHcpcsRows];
        
        //     return merged.filter(
        //         (item, index, self) =>
        //             index === self.findIndex((x) => x.linkId === item.linkId)
        //     );
        // });
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

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        watch,
        setValue
    } = useForm<FormValues>({
        defaultValues: {
            benefitLimitCode: "",
            tncName: "",
            dimensionKey: "",
            parentDimensionKey: "",
            parameter: "",
            parameterSource: "",
            parameterCalculation: "",
            operator: "",
            limitType: "",
            limitBasis: "",
            limitUnit: "",
            value: "",
            defaultValue: "",
            conditionBasis: "",
            conditionOperator: "",
            conditionValue: "",
            clause: "",
            specificCopaymentApplicable: false,
            specificCopaymentPercentage: "",
            entryClaimCountTable: false,
            entryBSITable: false,
            conditionActionBoth: "",
            actionIfTrue: "",
            actionIfFalse: "",
            tncLimitActionLevel: "",
            tncLimitActionStage: "",
            tncLimitClaimSpecialAction: "",
            recordStatus : "Active"
        },
    });

    useEffect(()=>{
        if(type === "LIMIT" && id!=null && dropdownsLoaded)
        {
            dispatch(FetchBenefitLimitDataById(id));
        }
    },[id,type,dropdownsLoaded]);

    // Pre-fill form when editing an existing item
    useEffect(() => {
        if (type !== "LIMIT") return;
        if (!benefitLimitMasterDataById) return;
        
        if (benefitLimitMasterDataById!=null) {
            const item = benefitLimitMasterDataById;
            const conditionBasisValue = ParameterOptions.find(
                (option) => String(option.label) === String(item.conditionBasis)
            )?.value;

            reset({
                benefitLimitCode: item.benefitLimitCode || "",

                tncName: item.tncId || "",

                dimensionKey: item.dimensionKey || "",
                parentDimensionKey: item.parentDimensionKey || "",

                parameter: item.parameterId || "",
                parameterSource: item.parameterSourceCode || "",
                parameterCalculation: item.parameterCalculation || "",

                operator: item.operatorCode || "",

                limitType: item.limitTypeCode || "",
                limitBasis: item.limitBasis || "",
                limitUnit: item.limitUnitCode || "",

                value: item.value || "",
                defaultValue: item.defaultValue || "",
                
                // conditionBasis: item.conditionBasis || "",
                conditionBasis: conditionBasisValue || "",
                conditionOperator: item.conditionOperator || "",
                conditionValue: item.conditionValue || "",

                clause: item.clause || "",

                specificCopaymentApplicable: item.specificCopaymentApplicable ?? false,
                specificCopaymentPercentage:
                    item.specificCopaymentPercentage?.toString() || "",

                entryClaimCountTable: item.entryToClaimCountTable ?? false,
                entryBSITable: item.entryToBSITable ?? false,

                conditionActionBoth: item.conditionActionBoth || "",
                actionIfTrue: item.actionIfTrue || "",
                actionIfFalse: item.actionIfFalse || "",

                tncLimitActionLevel: item.tncLimitActionLevel || "",
                tncLimitActionStage: item.tncLimitActionStage || "",
                tncLimitClaimSpecialAction: item.tncLimitClaimSpecialAction || "",
                recordStatus : item.recordStatus ||"Active",
            });

            setSelectedIcdList(item.applicableICD ?? []);

            setSelectedCptHcpcsList([
                ...(item.applicableCPT ?? []),
                ...(item.applicableHCPCSI ?? []),
                ...(item.applicableHCPCSII ?? []),
            ]);
        }
    }, [benefitLimitMasterDataById,type,reset]);

    useEffect(()=>{
        if(type === "RULE" && item && dropdownsLoaded)
        {
            dispatch(FetchBenefitRuleDataById(id));
        }
    },[type, item,dropdownsLoaded]);

    useEffect(() => {
        if (type !== "RULE" || !item) return;
    
        if (!benefitRuleDataById) return;
        
        if (benefitRuleDataById!=null) {
            const item = benefitRuleDataById;
            const conditionBasisValue = ParameterOptions.find(
                (option) => String(option.label) === String(item.conditionBasis)
            )?.value;
            reset({
                // benefitLimitCode: item.benefitLimitCode || "",
                tncName: item.tncId || item.tncName || "",
                dimensionKey: item.dimensionKey || "",
                parentDimensionKey: item.parentDimensionKey || "",
                parameter: item.parameterId || item.parameter || "",
                parameterSource: item.parameterSourceCode || item.parameterSource || "",
                parameterCalculation: item.parameterCalculation || "",
                operator: item.operatorCode || item.operator || "",
                limitType: item.limitTypeCode || item.limitType || "",
                limitBasis: item.limitBasis || "",
                limitUnit: item.limitUnitCode || item.limitUnit || "",
                value: item.value || "",
                defaultValue: item.defaultValue || "",
                // conditionBasis: item.conditionBasis || "",
                conditionBasis: conditionBasisValue || "",
                conditionOperator: item.conditionOperator || "",
                conditionValue: item.conditionValue || "",
                clause: item.clause || "",
                specificCopaymentApplicable: item.specificCopaymentApplicable ?? false,
                specificCopaymentPercentage: item.specificCopaymentPercentage?.toString() || "",
                entryClaimCountTable: item.entryToClaimCountTable ?? false,
                entryBSITable: item.entryToBSITable ?? false,
                conditionActionBoth: item.conditionActionBoth || "",
                actionIfTrue: item.actionIfTrue || "",
                actionIfFalse: item.actionIfFalse || "",
                tncLimitActionLevel: item.tncLimitActionLevel || "",
                tncLimitActionStage: item.tncLimitActionStage || "",
                tncLimitClaimSpecialAction: item.tncLimitClaimSpecialAction || "",
                recordStatus : item.recordStatus ||"Active",
            });
        
            setSelectedIcdList(item.applicableICD ?? []);
            setSelectedCptHcpcsList([
                ...(item.applicableCPT ?? []),
                ...(item.applicableHCPCSI ?? []),
                ...(item.applicableHCPCSII ?? []),
            ]);
        }
    }, [type, item, reset,benefitRuleDataById]);

    useEffect(()=>{
        const updateTNC = async ()=>{
            const response = await dispatch(FetchBenefitLimitDataById(benefitLimitId));
            if(response?.payload?.success)
            {
                const data = response?.payload?.responseObject;
                setValue("tncName", data.tncId);
            }
        }

        if(type === "RULE" && benefitLimitId && propId == null)
        {
            updateTNC();
        }
    },[benefitLimitId,type])

    // const title = item
    //     ? `Edit ${
    //           type === "LIMIT" ? "Benefit Limit" : type === "RULE" ? "Benefit Rule" : "Logical Group"
    //       }`
    //     : `Add ${
    //           type === "LIMIT" ? "Benefit Limit" : type === "RULE" ? "Benefit Rule" : "Logical Group"
    //       }`;
    
    const emptyToNull = (value: string | null | undefined) =>
                    value?.trim() ? value : null;

    const onSubmit = async (data: FormValues) => {
        const conditionBasisLabel = ParameterOptions.find(
            (option) => String(option.value) === String(data.conditionBasis)
        )?.label;
        const DimensionKeyLabel = DimensionKeyOptions.find(
            (option) => String(option.value) === String(data.dimensionKey)
        )?.label;
        const ParentDimensionLabel = DimensionKeyOptions.find(
            (option) => String(option.value) === String(data.parentDimensionKey)
        )?.label;

        try {
            const payload = {
                ...(type === "LIMIT" && {
                    benefitLimitCode: data.benefitLimitCode,
                }),
            
                ...(type === "RULE" && {
                    benefitLimitId: benefitLimitId,
                    parentNodeId: parentNodeId,
                    logicalOperator : "AND"
                }),
                tncId: data.tncName,
                // dimensionKey: emptyToNull(data.dimensionKey),
                // parentDimensionKey: emptyToNull(data.parentDimensionKey),
                dimensionKey: emptyToNull(DimensionKeyLabel),
                parentDimensionKey: emptyToNull(ParentDimensionLabel),
                parameterId: emptyToNull(data.parameter),
                parameterCalculation: emptyToNull(data.parameterCalculation),
                parameterSourceCode: emptyToNull(data.parameterSource),
                operatorCode: emptyToNull(data.operator),
                value: emptyToNull(data.value),
                defaultValue: emptyToNull(data.defaultValue),
                limitTypeCode: emptyToNull(data.limitType),
                limitUnitCode: emptyToNull(data.limitUnit),
                limitBasis: emptyToNull(data.limitBasis),
                conditionBasis: emptyToNull(conditionBasisLabel),
                conditionOperator: emptyToNull(data.conditionOperator),
                conditionValue: emptyToNull(data.conditionValue),
                specificCopaymentApplicable: data.specificCopaymentApplicable,
                specificCopaymentPercentage: emptyToNull(data.specificCopaymentPercentage),
                entryToBSITable: data.entryBSITable,
                entryToClaimCountTable: data.entryClaimCountTable,
                clause: emptyToNull(data.clause),
                conditionActionBoth: emptyToNull(data.conditionActionBoth),
                actionIfTrue: emptyToNull(data.actionIfTrue),
                tncLimitActionLevel: emptyToNull(data.tncLimitActionLevel),
                applicableICD : selectedIcdList?.map((item) => ({
                        icdId: item.icdId,
                        icdCode: item.icdCode,
                        briefDescription: item.briefDescription,
                        icdCodeCodingYear: item.icdCodeCodingYear,
                        icdCodeVersion : item.icdCodeVersion
                    })) ?? [],
                applicableCPT: selectedCptHcpcsList
                    ?.filter((item) => item.qualifier === "CPT")
                    .map((item) => ({
                    linkId: item.linkId,
                    icdId: item.icdId,
                    qualifier: item.qualifier,
                    icdCode: item.icdCode,
                    code: item.code,
                    description: item.description,
                    version: item.version,
                    })) ?? [],
                applicableHCPCSI: selectedCptHcpcsList
                    ?.filter((item) => item.qualifier === "HCPCS")
                    .map((item) => ({
                    linkId: item.linkId,
                    icdId: item.icdId,
                    qualifier: item.qualifier,
                    icdCode: item.icdCode,
                    code: item.code,
                    description: item.description,
                    version: item.version,
                    })) ?? [],
                applicableHCPCSII: selectedCptHcpcsList
                    ?.filter((item) => item.qualifier === "HCPCS II")
                    .map((item) => ({
                    linkId: item.linkId,
                    icdId: item.icdId,
                    qualifier: item.qualifier,
                    icdCode: item.icdCode,
                    code: item.code,
                    description: item.description,
                    version: item.version,
                    })) ?? [],
                tncLimitClaimSpecialAction: emptyToNull(data.tncLimitClaimSpecialAction),
                actionIfFalse: emptyToNull(data.actionIfFalse),
                tncLimitActionStage: emptyToNull(data.tncLimitActionStage),
                recordStatus: data.recordStatus
              }

            // const endpoint = isEditMode ? `/api/BenefitLimitMaster/Edit/${id}` : "/api/BenefitLimitMaster/Add";
            let endpoint: string = "";
            if(type === "LIMIT"){
                endpoint = isEditMode ? `/api/BenefitLimitMaster/Edit/${id}` : "/api/BenefitLimitMaster/Add";
            }
            if(type === "RULE")
            {
                endpoint = isEditMode ? `/api/BenefitLimitMaster/UpdateBenefitRule/${id}` : "/api/BenefitLimitMaster/CreateBenefitRuleAsync";
            }
            const idValue = isEditMode ? id : null;
            const result = await saveMasters(payload, endpoint, idValue);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result?.data?.responseMessage
                );
                if (type === "LIMIT") {
                    navigateBackToMaster(
                        navigate,
                        location.state?.activeTab || "BenefitRulesBuilder"
                    );
                }
            
                if (type === "RULE") {
                    dispatch(FetchBenefitLimitTree());
                    onSave(result?.data);
                    onClose();
                }
            } 
            // console.log("payload",payload)
        } finally {
            console.log("Finally")
        }
    };
    const onCancel = () => {
        if (type === "LIMIT") {
            navigateBackToMaster(
                navigate,
                location.state?.activeTab || "BenefitRulesBuilder"
            );
        }
    
        if (type === "RULE") {
            onClose();
        }
    };

    const selectedParameter =  watch("parameter");
    const selectedTnc =  watch("tncName");
    const specificCopaymentApplicableValue = watch("specificCopaymentApplicable");

    useEffect(() => {
        if (!selectedParameter) {
            setValue("parameterCalculation", "");
            setValue("parameterSource", "");
            return;
        }
    
        const fetchParameterDetails = async () => {
            try {
                const response = await dispatch(FetchParameterDataById(selectedParameter));
            } catch (error) {
                console.error("Failed to fetch parameter details:", error);
            }
        };
    
        fetchParameterDetails();
    }, [selectedParameter, setValue]);
    useEffect(()=>{
        if (!selectedParameter) return;
        if(parameterMasterDataById!=null)
        {
            setValue("parameterCalculation", parameterMasterDataById?.parameterCalculation);
            setValue("parameterSource", parameterMasterDataById?.parameterSource);
        }
        else{
            setValue("parameterCalculation", "");
            setValue("parameterSource", "");
        }
    },[parameterMasterDataById,selectedParameter,setValue])

    useEffect(() => {
        if (!selectedTnc) {
            setValue("dimensionKey", "");
            setValue("parentDimensionKey", "");
            return;
        }
    
        const fetchDimensionDetails = async () => {
            try {
                // const response = await dispatch(FetchTnCDimensionDataById(selectedTnc));
                const response = await dispatch(FetchTncDimensionsByHierarchy(selectedTnc));
            } catch (error) {
                console.error("Failed to fetch Dimension details:", error);
            }
        };
    
        fetchDimensionDetails();
    }, [selectedTnc, setValue]);
    useEffect(()=>{
        if (!selectedTnc && (benefitLimitMasterDataById==null || benefitRuleDataById== null)) return;
        if(tncDimensionsByHierarchy!=null)
        {
            if(benefitLimitMasterDataById!=null && propId == null)
            {
                // console.log("propId",propId);
                // const item = type === "LIMIT" ? benefitLimitMasterDataById : benefitRuleDataById;
                const item = benefitLimitMasterDataById ;
                const dimensionValue = DimensionKeyOptions.find(
                    (option) => String(option.label) === String(item.dimensionKey)
                )?.value;
                const parentDimensionValue = DimensionKeyOptions.find(
                    (option) => String(option.label) === String(item.parentDimensionKey)
                )?.value;
                
                if(type === "LIMIT"){
                    setValue("dimensionKey", dimensionValue);
                }
                setValue("parentDimensionKey", parentDimensionValue);
            }
            if(benefitRuleDataById!=null && propId!=null)
            {
                const item = benefitRuleDataById ;
                const dimensionValue = DimensionKeyOptions.find(
                    (option) => String(option.label) === String(item.dimensionKey)
                )?.value;
                const parentDimensionValue = DimensionKeyOptions.find(
                    (option) => String(option.label) === String(item.parentDimensionKey)
                )?.value;
                setValue("dimensionKey", dimensionValue);
                setValue("parentDimensionKey", parentDimensionValue);
            }
        }
        else{
            setValue("dimensionKey", "");
            setValue("parentDimensionKey", "");
        }
    },[tncDimensionsByHierarchy,selectedTnc,setValue])

    return (
        <>
        <div className="w-full bg-zinc-50 p-4" style={{ overflowY: "auto" }}>
                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
                    {/* BODY */}
                    <div className="p-5">
                        {type === "LIMIT" && (<h3 className="sub_section_title flex items-center gap-2 text-xl font-semibold text-gray-700 mb-4">
                            {benefitLimitMasterDataById!=null ? "Edit Benefit Limits" : "Add Benefit Limits"}
                        </h3>)}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {type === "LIMIT" && benefitLimitMasterDataById!=null && (
                                <Input
                                    label="Benefit Limit Code"
                                    isRequired
                                    {...register("benefitLimitCode", {
                                        required: "Benefit Limit Code is required",
                                    })}
                                    error={errors?.benefitLimitCode && errors?.benefitLimitCode?.message}
                                    disabled={readOnly}
                                />
                            )}
                            {/* 1. TnC Name */}
                            <DropdownSelect
                                label="TnC Name"
                                name_key="tncName"
                                name="tncName"
                                defaultValue="Select TnC Name"
                                options={TnCNameOptions}
                                control={control}
                                errors={errors?.tncName}
                                isClearable
                                isRequired
                                rules={{ required: "TNC is required" }}
                                disabled = {type === "RULE"}
                            />

                            {/* 2. Dimension Key */}
                            <DropdownSelect
                                label="Dimension Key"
                                name_key="dimensionKey"
                                name="dimensionKey"
                                defaultValue="Select Dimension Key"
                                options={DimensionKeyOptions}
                                control={control}
                                errors={errors?.dimensionKey}
                                isClearable
                            />

                            {/* 3. Parent Dimension Key */}
                            <DropdownSelect
                                label="Parent Dimension Key"
                                name_key="parentDimensionKey"
                                name="parentDimensionKey"
                                defaultValue="Select Parent Dimension Key"
                                options={DimensionKeyOptions}
                                control={control}
                                errors={errors?.parentDimensionKey}
                                isClearable
                                disabled = {type === "RULE"}
                            />

                            {/* 4. Parameter */}
                            <DropdownSelect
                                label="Parameter"
                                name_key="parameter"
                                name="parameter"
                                defaultValue="Select Parameter"
                                options={ParameterOptions}
                                control={control}
                                errors={errors?.parameter}
                                isClearable
                            />
                            <Input
                                label="Parameter Calculation"
                                disabled
                                // isRequired
                                {...register("parameterCalculation", {
                                    // required: "Benefit Limit Code is required",
                                })}
                                error={errors?.parameterCalculation && errors?.parameterCalculation?.message}
                            />
                            <Input
                                label="Parameter Source"
                                disabled
                                // isRequired
                                {...register("parameterSource", {
                                    // required: "Benefit Limit Code is required",
                                })}
                                error={errors?.parameterSource && errors?.parameterSource?.message}
                            />
                            {/* 5. Operator */}
                            <DropdownSelect
                                label="Operator"
                                name_key="operator"
                                name="operator"
                                defaultValue="Select Operator"
                                options={OperatorOptions}
                                control={control}
                                errors={errors?.operator}
                                isClearable
                            />

                            {/* 6. Limit Type */}
                            <DropdownSelect
                                label="Limit Type"
                                name_key="limitType"
                                name="limitType"
                                defaultValue="Select Limit Type"
                                options={LimitTypeOptions}
                                control={control}
                                errors={errors?.limitType}
                                isClearable
                            />

                            {/* 7. Limit Basis */}
                            <DropdownSelect
                                label="Limit Basis"
                                name_key="limitBasis"
                                name="limitBasis"
                                defaultValue="Select Limit Basis"
                                options={LimitBasisOptions}
                                control={control}
                                errors={errors?.limitBasis}
                                isClearable
                            />

                            <DropdownSelect
                                label="Limit Unit"
                                name_key="limitUnit"
                                name="limitUnit"
                                defaultValue="Select Limit Unit"
                                options={LimitUnitOptions}
                                control={control}
                                errors={errors?.limitUnit}
                                isClearable
                            />

                            {/* 8. Value */}
                            <Input
                                label="Value"
                                {...register("value")}
                                error={errors?.value?.message}
                            />
                            {/* <Input
                                label="Default Value"
                                {...register("defaultValue")}
                                error={errors?.defaultValue?.message}
                            /> */}

                            {/* 10. Condition Basis */}
                            {/* <Input
                                label="Condition Basis"
                                {...register("conditionBasis")}
                                error={errors?.conditionBasis?.message}
                            /> */}
                            <DropdownSelect
                                label="Condition Basis"
                                name_key="conditionBasis"
                                name="conditionBasis"
                                defaultValue="Select Condition Basis"
                                options={ParameterOptions}
                                control={control}
                                errors={errors?.conditionBasis}
                                isClearable
                            />

                            {/* 11. Condition Operator */}
                            <DropdownSelect
                                label="Condition Operator"
                                name_key="conditionOperator"
                                name="conditionOperator"
                                defaultValue="Select Operator"
                                options={OperatorOptions}
                                control={control}
                                errors={errors?.conditionOperator}
                                isClearable
                            />

                            {/* 12. Condition Value */}
                            <Input
                                label="Condition Value"
                                {...register("conditionValue")}
                                error={errors?.conditionValue?.message}
                            />

                            {/* 15. Clause */}
                            <Input
                                label="Clause"
                                {...register("clause")}
                                error={errors?.clause?.message}
                            />

                            <DropdownSelect
                                label="Condition Action Both"
                                name_key="conditionActionBoth"
                                name="conditionActionBoth"
                                defaultValue="Select"
                                options={ConditionActionBothOptions}
                                control={control}
                                errors={errors?.actionIfTrue}
                                isClearable
                            />

                            <DropdownSelect
                                label="Action If True"
                                name_key="actionIfTrue"
                                name="actionIfTrue"
                                defaultValue="Select Action If True"
                                options={TncLimitActionOptions}
                                control={control}
                                errors={errors?.actionIfTrue}
                                isClearable
                            />
                            <DropdownSelect
                                label="TNC Limit Action Level"
                                name_key="tncLimitActionLevel"
                                name="tncLimitActionLevel"
                                defaultValue="Select TNC Limit Action Level"
                                options={TncLimitActionLevelOptions}
                                control={control}
                                errors={errors?.tncLimitActionLevel}
                                isClearable
                            />
                            <DropdownSelect
                                label="TNC Limit Claim Special Action"
                                name_key="tncLimitClaimSpecialAction"
                                name="tncLimitClaimSpecialAction"
                                defaultValue="Select TNC Limit Claim Special Action"
                                options={TncLimitClaimSpecialActionOptions}
                                control={control}
                                errors={errors?.tncLimitClaimSpecialAction}
                                isClearable
                            />
                            {/* <DropdownSelect
                                label="TNC Limit Action Stage"
                                name_key="tncLimitActionStage"
                                name="tncLimitActionStage"
                                defaultValue="Select TNC Limit Action Stage"
                                options={TncLimitActionStageOptions}
                                control={control}
                                errors={errors?.tncLimitActionStage}
                                isClearable
                            /> */}
                            <DropdownSelect
                                label="Action If False"
                                name_key="actionIfFalse"
                                name="actionIfFalse"
                                defaultValue="Select Action If True"
                                options={TncLimitActionOptions}
                                control={control}
                                errors={errors?.actionIfFalse}
                                isClearable
                            />

                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <Controller
                                    name="specificCopaymentApplicable"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="input-label flex">Specific Copayment Applicable</span>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Switch
                                                    color="info"
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                                <span
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                        field.value
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "bg-zinc-100 text-zinc-500"
                                                    }`}
                                                >
                                                    {field.value ? "Yes" : "No"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            {/* 17. Specific Copayment */}
                            {specificCopaymentApplicableValue && (<Input
                                label="Specific Copayment Percentage"
                                // type="number"
                                {...register("specificCopaymentPercentage")}
                                    onKeyDown={(e) => {
                                        const allowedKeys = [
                                            "Backspace",
                                            "Delete",
                                            "Tab",
                                            "ArrowLeft",
                                            "ArrowRight",
                                            "Home",
                                            "End",
                                        ];
                                
                                        if (
                                            allowedKeys.includes(e.key) ||
                                            /^[0-9.]$/.test(e.key)
                                        ) {
                                            return;
                                        }
                                
                                        e.preventDefault();
                                    }}
                                error={errors?.specificCopaymentPercentage?.message}
                            />)}

                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <Controller
                                    name="entryBSITable"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="input-label flex">Entry To BSI Table</span>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Switch
                                                    color="info"
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                                <span
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                        field.value
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "bg-zinc-100 text-zinc-500"
                                                    }`}
                                                >
                                                    {field.value ? "Yes" : "No"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <Controller
                                    name="entryClaimCountTable"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="input-label flex">Entry To Claim Count Table</span>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Switch
                                                    color="info"
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                                <span
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                        field.value
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "bg-zinc-100 text-zinc-500"
                                                    }`}
                                                >
                                                    {field.value ? "Yes" : "No"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>

                            {isEditMode && <div className="flex flex-col gap-1.5">
                                <DropdownSelect
                                    label="Operational Status"
                                    name_key="recordStatus"
                                    name="recordStatus"
                                    defaultValue="Select a status"
                                    options={OpStatusList}
                                    control={control}
                                    rules={{ required: "Operational Status is required" }}
                                    errors={errors?.recordStatus}
                                    isRequired
                                />
                            </div>}
                        </div>
                    </div>

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
                                            // setSelectedCptHcpcsList([]);
                                            // setCheckedCptHcpcsIds([]);
                                        }}
                                        // disabled={readOnly}
                                        className="px-3.5 mr-2 py-1.5 text-xs font-bold this:error  bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {"Clear All"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openIcdModal}
                                        // disabled={readOnly}
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
                                                    {/* {!readOnly && ( */}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSelectedIcd(item.icdId)}
                                                            className="rounded-full hover:bg-red-50 hover:text-red-600 p-0.5 cursor-pointer transition-colors ml-0.5"
                                                            title={`Remove ${item.icdCode}`}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    {/* )} */}
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
                                        // disabled={readOnly}
                                        className="px-3.5 mr-2 py-1.5 text-xs font-bold this:error  bg-this hover:bg-this-darker text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {"Clear All"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openCptHcpcsModal}
                                        // disabled={selectedIcdList?.length == 0 || readOnly}
                                        // disabled={selectedIcdList?.length == 0}
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

                                                                    {/* {!readOnly && ( */}
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
                                                                    {/* )} */}
                                                                </span>

                                                                {/* {index < items.length - 1 && (
                                                                    <span className="text-zinc-400">, </span>
                                                                )} */}
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

                    {/* FOOTER */}
                    <div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
                        <button
                            type="button"
                            onClick={()=>{onCancel()}}
                            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
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
                                        // disabled={readOnly}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        label="Code"
                                        value={icdCodeFilter}
                                        onChange={(e) => setIcdCodeFilter(e.target.value)}
                                        placeholder="Search by code"
                                        // disabled={readOnly}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        value={icdDescFilter}
                                        label="Code Description"
                                        onChange={(e) => setIcdDescFilter(e.target.value)}
                                        placeholder="Search by description"
                                        // disabled={readOnly}
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
                                {/* <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-2 transition-shadow hover:shadow-sm">
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
                                                    </span>
                                                ))}
                                            </div>
                                            </div>
                                        )}
                                </div> */}
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
                                        // disabled={readOnly}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Input
                                        value={cptHcpcsDescFilter}
                                        label="Code Description"
                                        onChange={(e) => setCptHcpcsDescFilter(e.target.value)}
                                        placeholder="Search by description"
                                        // disabled={readOnly}
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
        </>
    );
};

export default AddBenefitLimitForm;
