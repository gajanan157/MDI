import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import BenefitRuleDialog from "./Forms/BenefitRuleDialog";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { FetchBenefitLimitTree, setbenefitLimitMasterDataById, setBenefitRuleDataById, FetchBenefitPossibleParents, setBenefitPossibleParents } from "../../../../store/features/LimitTypeMaster/LimitTypeMasterSlice";
import { BenefitLimitTreeResponse } from "../../../../store/features/LimitTypeMaster/LimitTypeMasterTypes";
import { saveMasters, deleteMasters } from "./function";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";
import ConfirmationModal from "./ConfirmationModal";
import ChangeParentNodeDialog from "./Forms/ChangeParentNodeDialog";

/* ============================================================
   TYPES
============================================================ */

type LogicalOperator = "AND" | "OR";

type Direction = "UP" | "DOWN";

type BenefitRule = {
    id: string;
    type: "RULE";

    logicalOperator?: LogicalOperator;

    benefitLimitID: string;
    benefitLimitCode: string;
    tncName: string;

    dimensionKey: string;
    parentDimensionKey: string;

    parameter: string;
    parameterCalculation: string;
    parameterSource: string;

    operator: string;

    limitType: string;
    limitUnit: string;
    limitBasis: string;

    value: string;
    defaultValue: string;

    conditionBasis: string;
    conditionOperator: string;
    conditionValue: string;

    clause: string;

    specificCopaymentApplicable: boolean;
    specificCopaymentPercentage: string;
    isActive: boolean;
    recordStatus: string;
    operatorName:string|null;
    actionTrueName:string|null;
    actionFalseName:string|null;
    actionLevelName:string|null;
    actionStageName:string|null;
    claimSpecialName:string|null;
};

type BenefitGroup = {
    id: string;
    type: "GroupRule";

    logicalOperator?: LogicalOperator;

    groupName: string;
    isActive: boolean;
    recordStatus: string;

    children: BenefitNode[];
};

type BenefitNode = BenefitRule | BenefitGroup;

type BenefitLimit = {
    id: string;
    type: "LIMIT";

    benefitLimitID: string;
    tncName: string;

    dimensionKey: string;
    parentDimensionKey: string;

    parameter: string;
    parameterCalculation: string;
    parameterSource: string;

    operator: string;

    limitType: string;
    limitUnit: string;
    limitBasis: string;

    value: string;
    defaultValue: string;

    children: BenefitNode[];
};

type ModalType = "LIMIT" | "RULE" | "GroupRule" | null;

/* ============================================================
   ICONS
============================================================ */

const ArrowUpIcon = ({
    className = "h-4 w-4",
}: {
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 19V5" />
        <path d="M6 11l6-6 6 6" />
    </svg>
);

const ArrowDownIcon = ({
    className = "h-4 w-4",
}: {
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 5v14" />
        <path d="M18 13l-6 6-6-6" />
    </svg>
);

const MoreVerticalIcon = ({
    className = "h-4 w-4",
}: {
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <circle cx="12" cy="5" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="12" cy="19" r="1.6" />
    </svg>
);

const GripIcon = ({
    className = "h-4 w-4",
}: {
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={className}
    >
        <path d="M8 5h.01" />
        <path d="M8 12h.01" />
        <path d="M8 19h.01" />
        <path d="M16 5h.01" />
        <path d="M16 12h.01" />
        <path d="M16 19h.01" />
    </svg>
);

const PlusIcon = ({
    className = "h-4 w-4",
}: {
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
    >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </svg>
);

const MinusIcon = ({
    className = "h-4 w-4",
}: {
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={className}
    >
        <path d="M5 12h14" />
    </svg>
);

const PencilIcon = ({
    className = "h-4 w-4",
}: {
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
);

const TrashIcon = ({
    className = "h-4 w-4",
}: {
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 13h10l1-13" />
        <path d="M9 7V4h6v3" />
    </svg>
);

const PlusSmallIcon = ({
    className = "h-3.5 w-3.5",
}: {
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
    >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </svg>
);

/* ============================================================
   SAMPLE DATA
============================================================ */

// const initialData: BenefitLimit[] = [
//     {
//         id: "BL001",
//         type: "LIMIT",

//         benefitLimitID: "BL001",
//         tcName: "Hospitalization Limit",

//         dimensionKey: "HOSP",
//         parentDimensionKey: "",

//         parameter: "Hospitalization",
//         parameterCalculation: "SUM",
//         parameterSource: "Claim",

//         operator: "<=",

//         limitType: "Amount",
//         limitUnit: "INR",
//         limitBasis: "Policy Year",

//         value: "500000",
//         defaultValue: "500000",

//         children: [
//             {
//                 id: "R001",
//                 type: "RULE",

//                 benefitLimitID: "BL001",
//                 tcName: "Inpatient Treatment",

//                 dimensionKey: "TREATMENT",
//                 parentDimensionKey: "HOSP",

//                 parameter: "Treatment Type",
//                 parameterCalculation: "EQUALS",
//                 parameterSource: "Claim",

//                 operator: "=",

//                 limitType: "Amount",
//                 limitUnit: "INR",
//                 limitBasis: "Policy Year",

//                 value: "300000",
//                 defaultValue: "300000",

//                 conditionBasis: "Treatment",
//                 conditionOperator: "=",
//                 conditionValue: "Inpatient",

//                 clause: "INPATIENT",

//                 specificCopaymentApplicable: false,
//                 specificCopaymentPercentage: "",
//             },

//             {
//                 id: "G001",
//                 type: "GroupRule",
//                 logicalOperator: "AND",

//                 groupName: "Age Based Eligibility",

//                 children: [
//                     {
//                         id: "R002",
//                         type: "RULE",

//                         benefitLimitID: "BL001",
//                         tcName: "Adult Patient",

//                         dimensionKey: "AGE",
//                         parentDimensionKey: "HOSP",

//                         parameter: "Age",
//                         parameterCalculation: "VALUE",
//                         parameterSource: "Member",

//                         operator: ">=",

//                         limitType: "Eligibility",
//                         limitUnit: "Years",
//                         limitBasis: "Member",

//                         value: "18",
//                         defaultValue: "18",

//                         conditionBasis: "Age",
//                         conditionOperator: ">=",
//                         conditionValue: "18",

//                         clause: "ADULT",

//                         specificCopaymentApplicable: false,
//                         specificCopaymentPercentage: "",
//                     },

//                     {
//                         id: "R003",
//                         type: "RULE",
//                         logicalOperator: "OR",

//                         benefitLimitID: "BL001",
//                         tcName: "Senior Citizen",

//                         dimensionKey: "AGE",
//                         parentDimensionKey: "HOSP",

//                         parameter: "Age",
//                         parameterCalculation: "VALUE",
//                         parameterSource: "Member",

//                         operator: ">=",

//                         limitType: "Eligibility",
//                         limitUnit: "Years",
//                         limitBasis: "Member",

//                         value: "60",
//                         defaultValue: "60",

//                         conditionBasis: "Age",
//                         conditionOperator: ">=",
//                         conditionValue: "60",

//                         clause: "SENIOR",

//                         specificCopaymentApplicable: true,
//                         specificCopaymentPercentage: "10",
//                     },

//                     {
//                         id: "G002",
//                         type: "GroupRule",
//                         logicalOperator: "AND",

//                         groupName: "Special Conditions",

//                         children: [
//                             {
//                                 id: "R004",
//                                 type: "RULE",

//                                 benefitLimitID: "BL001",
//                                 tcName: "Pre Authorization",

//                                 dimensionKey: "AUTH",
//                                 parentDimensionKey: "HOSP",

//                                 parameter: "Pre Authorization",
//                                 parameterCalculation: "BOOLEAN",
//                                 parameterSource: "Claim",

//                                 operator: "=",

//                                 limitType: "Boolean",
//                                 limitUnit: "",
//                                 limitBasis: "Claim",

//                                 value: "YES",
//                                 defaultValue: "NO",

//                                 conditionBasis: "Authorization",
//                                 conditionOperator: "=",
//                                 conditionValue: "YES",

//                                 clause: "PREAUTH",

//                                 specificCopaymentApplicable: false,
//                                 specificCopaymentPercentage: "",
//                             },
//                         ],
//                     },
//                 ],
//             },

//             {
//                 id: "R005",
//                 type: "RULE",
//                 logicalOperator: "OR",

//                 benefitLimitID: "BL001",
//                 tcName: "Day Care Treatment",

//                 dimensionKey: "DAYCARE",
//                 parentDimensionKey: "HOSP",

//                 parameter: "Treatment Type",
//                 parameterCalculation: "EQUALS",
//                 parameterSource: "Claim",

//                 operator: "=",

//                 limitType: "Amount",
//                 limitUnit: "INR",
//                 limitBasis: "Policy Year",

//                 value: "100000",
//                 defaultValue: "100000",

//                 conditionBasis: "Treatment",
//                 conditionOperator: "=",
//                 conditionValue: "Day Care",

//                 clause: "DAYCARE",

//                 specificCopaymentApplicable: true,
//                 specificCopaymentPercentage: "5",
//             },
//         ],
//     },

//     {
//         id: "BL002",
//         type: "LIMIT",

//         benefitLimitID: "BL002",
//         tcName: "Maternity Limit",

//         dimensionKey: "MAT",
//         parentDimensionKey: "",

//         parameter: "Maternity",
//         parameterCalculation: "SUM",
//         parameterSource: "Claim",

//         operator: "<=",

//         limitType: "Amount",
//         limitUnit: "INR",
//         limitBasis: "Policy Year",

//         value: "75000",
//         defaultValue: "75000",

//         children: [
//             {
//                 id: "R006",
//                 type: "RULE",

//                 benefitLimitID: "BL002",
//                 tcName: "Normal Delivery",

//                 dimensionKey: "DELIVERY",
//                 parentDimensionKey: "MAT",

//                 parameter: "Delivery Type",
//                 parameterCalculation: "EQUALS",
//                 parameterSource: "Claim",

//                 operator: "=",

//                 limitType: "Amount",
//                 limitUnit: "INR",
//                 limitBasis: "Per Event",

//                 value: "50000",
//                 defaultValue: "50000",

//                 conditionBasis: "Delivery",
//                 conditionOperator: "=",
//                 conditionValue: "Normal",

//                 clause: "NORMAL",

//                 specificCopaymentApplicable: false,
//                 specificCopaymentPercentage: "",
//             },
//         ],
//     },
// ];

/* ============================================================
   MAIN COMPONENT
============================================================ */

const BenefitRulesBuilder = () => {
    const dispatch = useAppDispatch();
    const { benefitLimitTreeResponse } = useAppSelector((state) => state.limitTypeMasterReducer);
    useEffect(()=>{
        dispatch(FetchBenefitLimitTree());
    },[])
    // const [data, setData] =
    //     useState<BenefitLimit[]>(initialData);
    const [data, setData] =
        useState<BenefitLimitTreeResponse[]>([]);

    useEffect(()=>{
        if(benefitLimitTreeResponse?.length >0)
        {
            setData(benefitLimitTreeResponse);
        }else{
            setData([]);
        }
    },[benefitLimitTreeResponse])

    const [expandedLimits, setExpandedLimits] =
        useState<string[]>(["BL001"]);

    const [expandedGroups, setExpandedGroups] =
        useState<string[]>(["G001", "G002"]);

    const [modalType, setModalType] =
        useState<ModalType>(null);

    const [editingItem, setEditingItem] =
        useState<any>(null);

    const [parentLimitId, setParentLimitId] =
        useState<string | null>(null);

    const [parentGroupId, setParentGroupId] =
        useState<string | null>(null);

    const [ruleDialogOpen, setRuleDialogOpen] = useState(false);

    const [selectedBenefitLimitId, setSelectedBenefitLimitId] =
        useState<string | null>(null);
    
    const [selectedParentNodeId, setSelectedParentNodeId] =
        useState<string | null>(null);
    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
    const [editingRuleItem, setEditingRuleItem] = useState<BenefitRule | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteItem, setSelectedDeleteItem] = useState<any>(null);

    const navigate = useNavigate();

    /* ========================================================
       NAVIGATION
    ======================================================== */

    const handleView = () => {
        dispatch(setbenefitLimitMasterDataById(null));
        navigate(`/benefits-configuration/benefits-master/benefit-limit`,
        {
            state: {
                activeTab: "BenefitRulesBuilder"
            }
        });
    };

    const handleAddRule = (
        benefitLimitId: string,
        parentNodeId: string | null
    ) => {
        setSelectedBenefitLimitId(benefitLimitId);
        // setSelectedBenefitLimitId('478636d3-5bff-4730-b451-76cd34ec39df');
        setSelectedParentNodeId(parentNodeId);
        setParentLimitId(benefitLimitId);
        setParentGroupId(parentNodeId);
        setEditingRuleId(null);
        setEditingRuleItem(null);
        dispatch(setBenefitRuleDataById(null));
        setRuleDialogOpen(true);
    };
    const handleEditRule = (
        node: BenefitRule,
        parentGroupId: string | null
    ) => {
        setSelectedBenefitLimitId(node.benefitLimitID);
        setSelectedParentNodeId(parentGroupId);
        setParentLimitId(node.benefitLimitID);
        setParentGroupId(parentGroupId);
        setEditingRuleId(node.id);
        setEditingRuleItem(node);
        dispatch(setBenefitRuleDataById(null));
        setRuleDialogOpen(true);
    };
    const closeRuleDialog = () => {
        setRuleDialogOpen(false);
        setEditingRuleId(null);
        setEditingRuleItem(null);
        setSelectedBenefitLimitId(null);
        setSelectedParentNodeId(null);
        setParentLimitId(null);
        setParentGroupId(null);
    };
    
    const handleRuleSaved = (savedRule: any) => {
        // NOTE: `savedRule` is whatever your API returns from
        // CreateBenefitRuleAsync. This mock component keeps rules in local
        // state — if BenefitRulesBuilder's tree comes from a store slice in
        // your real app, replace this with a refetch/dispatch of that list
        // instead of a local merge.
        closeRuleDialog();
    };

    /* ========================================================
       EXPAND / COLLAPSE
    ======================================================== */

    const toggleLimit = (id: string) => {
        setExpandedLimits((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const toggleGroup = (id: string) => {
        setExpandedGroups((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    /* ========================================================
       MODAL
    ======================================================== */

    const closeModal = () => {
        setModalType(null);
        setEditingItem(null);
        setParentLimitId(null);
        setParentGroupId(null);
    };

    const openAddRule = (
        limitId: string,
        groupId?: string
    ) => {
        // setEditingItem(null);
        // setParentLimitId(limitId);
        // setParentGroupId(groupId || null);
        // setModalType("RULE");
        handleAddRule(limitId, groupId ?? null);
    };

    const openAddGroup = (
        limitId: string,
        groupId?: string
    ) => {
        setEditingItem(null);
        setParentLimitId(limitId);
        setParentGroupId(groupId || null);
        // console.log("openAddGroup",limitId,groupId);
        setModalType("GroupRule");
    };

    // const openEdit = (item: any) => {
    //     setEditingItem(item);
    //     setModalType(item.type);
    // };
    const openEdit = (item: any, parentGroupId: string | null = null) => {
        dispatch(setbenefitLimitMasterDataById(null));
        if (item.type === "RULE") {
            handleEditRule(item, parentGroupId);
            return;
        }else if(item.type === "LIMIT")
        {
            navigate(`/benefits-configuration/benefits-master/benefit-limit/${item.benefitLimitID}`,
            // navigate(`/benefits-configuration/benefits-master/benefit-limit/478636d3-5bff-4730-b451-76cd34ec39df`,
            {
                state: {
                    activeTab: "BenefitRulesBuilder"
                }
            });
        }
        setEditingItem(item);
        setModalType(item.type);
    };

    /* ========================================================
       DELETE LIMIT
    ======================================================== */

    const deleteLimit = (id: string) => {
        // if (
        //     !window.confirm(
        //         "Delete this Benefit Limit?"
        //     )
        // ) {
        //     return;
        // }

        // setData((prev) =>
        //     prev.filter(
        //         (item) => item.id !== id
        //     )
        // );
        const payload = {
            id : id,
            type : "Limit"
        }
        setSelectedDeleteItem(payload);
        setIsDeleteModalOpen(true);
    };

    /* ========================================================
       DELETE NODE
    ======================================================== */

    const deleteNode = (id: string,type:string) => {
        // if (
        //     !window.confirm(
        //         "Delete this item?"
        //     )
        // ) {
        //     return;
        // }

        // setData((prev) =>
        //     prev.map((limit) => ({
        //         ...limit,
        //         children: removeNode(
        //             limit.children,
        //             id
        //         ),
        //     }))
        // );
        const payload = {
            id : id,
            type : type
        }
        setSelectedDeleteItem(payload);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedDeleteItem) return;
        
        try 
        {
            const endpoint = selectedDeleteItem.type == "RULE" ? "/api/BenefitLimitMaster/DeleteBenefitRule" : 
                                selectedDeleteItem.type == "GroupRule" ? "/api/BenefitLimitMaster/DeleteBenefitGroup" :
                                "/api/BenefitLimitMaster/DeleteBenefitLimit";

            const result = await deleteMasters(endpoint,selectedDeleteItem.id);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result.responseMessage
                );
                dispatch(FetchBenefitLimitTree());

            } else {
                showErrorMessage(result);
            }
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedDeleteItem(null);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setSelectedDeleteItem(null);
    };

    /* ========================================================
       MOVE BENEFIT LIMIT
    ======================================================== */

    // const moveLimit = (
    //     index: number,
    //     direction: Direction
    // ) => {
    //     setData((prev) => {
    //         const newIndex =
    //             direction === "UP"
    //                 ? index - 1
    //                 : index + 1;

    //         if (
    //             newIndex < 0 ||
    //             newIndex >= prev.length
    //         ) {
    //             return prev;
    //         }

    //         const updated = [...prev];

    //         [
    //             updated[index],
    //             updated[newIndex],
    //         ] = [
    //             updated[newIndex],
    //             updated[index],
    //         ];

    //         return updated;
    //     });
    // };

    /* ========================================================
       MOVE RULE / GROUP

       IMPORTANT:
       The operator belongs to the POSITION between
       siblings.

       Example:

       Rule A
          AND
       Rule B
          OR
       Rule C

       When moving Rule C up:

       Rule A
          AND
       Rule C
          OR
       Rule B

       We therefore preserve operators by position.
    ======================================================== */
    const [changeParentDialogOpen, setChangeParentDialogOpen] = useState(false);
    const [changeParentTarget, setChangeParentTarget] = useState<{
        nodeId: string;
        nodeName: string;
        limitId: string;
    } | null>(null);
    const handleOpenChangeParent = (
        limitId: string,
        _currentParentGroupId: string | null,
        nodeName : string|null,
        nodeId: string
    ) => {
        console.log("chnageParent",nodeId, nodeName, limitId);
        const BenefitLimitId = limitId;
        dispatch(FetchBenefitPossibleParents({BenefitLimitId, nodeId}));
        setChangeParentTarget({ nodeId, nodeName, limitId });
        setChangeParentDialogOpen(true);
    };
    
    const closeChangeParentDialog = () => {
        setChangeParentDialogOpen(false);
        setChangeParentTarget(null);
        dispatch(setBenefitPossibleParents([]));
    };

    const submitChangeParent = (newParentGroupId: string | null) => {
        if (!changeParentTarget) return;
        changeParentNode(
            changeParentTarget.limitId,
            newParentGroupId,
            changeParentTarget.nodeId
        );
        closeChangeParentDialog();
    };

    const changeParentNode = async (
        limitId: string,
        newparentGroupId: string | null,
        nodeId: string
    ) => {
        // console.log("moveNode",limitId,parentGroupId,nodeId,direction);
        let endpoint= `/api/BenefitLimitMaster/ChangeParentNodeAsync`;
        const payload = {
            benefitNodeId: nodeId,
            benefitLimitId: limitId,
            newParentNodeId: newparentGroupId
        }

        const result = await saveMasters(payload, endpoint, null);
        if (result.success) {
            handleApiResponse(
            {
                success: result.success
            },
            result?.data?.responseMessage
            );
            dispatch(FetchBenefitLimitTree());
        }
    };

    const moveNode = async (
        limitId: string,
        parentGroupId: string | null,
        nodeId: string,
        direction: Direction
    ) => {
        // console.log("moveNode",limitId,parentGroupId,nodeId,direction);
        let endpoint= `/api/BenefitLimitMaster/ChangeBenefitNodeOrder`;
        const payload = {
            benefitNodeId: nodeId,
            benefitLimitId: limitId,
            parentNodeId: parentGroupId,
            moveUp: direction == "UP" ? true : false
        }

        const result = await saveMasters(payload, endpoint, null);
        if (result.success) {
            handleApiResponse(
            {
                success: result.success
            },
            result?.data?.responseMessage
            );
            dispatch(FetchBenefitLimitTree());
        }
        // setData((prev) =>
        //     prev.map((limit) => {
        //         if (limit.id !== limitId) {
        //             return limit;
        //         }

        //         if (!parentGroupId) {
        //             return {
        //                 ...limit,
        //                 children:
        //                     moveNodeInArray(
        //                         limit.children,
        //                         nodeId,
        //                         direction
        //                     ),
        //             };
        //         }

        //         return {
        //             ...limit,
        //             children:
        //                 moveNodeInsideGroup(
        //                     limit.children,
        //                     parentGroupId,
        //                     nodeId,
        //                     direction
        //                 ),
        //         };
        //     })
        // );
    };

    /* ========================================================
       CHANGE OPERATOR
    ======================================================== */

    const UpdateLogicalOperator = async (nodeId: string,operator: LogicalOperator)=>
    {
        let endpoint= `/api/BenefitLimitMaster/UpdateLogicalOperatorInBenefitNode/${nodeId}`;
        const payload = {
            logicalOperator : operator
        }

        const result = await saveMasters(payload, endpoint, nodeId);
        if (result.success) {
            handleApiResponse(
            {
                success: result.success
            },
            result?.data?.responseMessage
            );
            dispatch(FetchBenefitLimitTree());
        }
    }

    const changeOperator = (
        limitId: string,
        parentGroupId: string | null,
        nodeId: string,
        operator: LogicalOperator
    ) => {
        // console.log("changeOperator",limitId,parentGroupId,nodeId,operator);
        UpdateLogicalOperator(nodeId,operator);
        // setData((prev) =>
        //     prev.map((limit) => {
        //         if (limit.id !== limitId) {
        //             return limit;
        //         }

        //         if (!parentGroupId) {
        //             return {
        //                 ...limit,
        //                 children:
        //                     updateOperatorInArray(
        //                         limit.children,
        //                         nodeId,
        //                         operator
        //                     ),
        //             };
        //         }

        //         return {
        //             ...limit,
        //             children:
        //                 updateOperatorInsideGroup(
        //                     limit.children,
        //                     parentGroupId,
        //                     nodeId,
        //                     operator
        //                 ),
        //         };
        //     })
        // );
    };

    /* ========================================================
       SAVE
    ======================================================== */

    const handleSave = async (formData: any) => {
        /* ----------------------------------------------------
           BENEFIT LIMIT
        ---------------------------------------------------- */

        // if (modalType === "LIMIT") {
        //     if (editingItem) {
        //         setData((prev) =>
        //             prev.map((limit) =>
        //                 limit.id ===
        //                 editingItem.id
        //                     ? {
        //                           ...limit,
        //                           ...formData,
        //                       }
        //                     : limit
        //             )
        //         );
        //     } else {
        //         const newLimit: BenefitLimit = {
        //             id: `BL-${Date.now()}`,
        //             type: "LIMIT",
        //             ...formData,
        //             children: [],
        //         };

        //         setData((prev) => [
        //             ...prev,
        //             newLimit,
        //         ]);
        //     }

        //     closeModal();
        //     return;
        // }

        /* ----------------------------------------------------
           RULE
        ---------------------------------------------------- */

        // if (modalType === "RULE") {
        //     const newRule: BenefitRule = {
        //         id:
        //             editingItem?.id ||
        //             `R-${Date.now()}`,

        //         type: "RULE",

        //         ...formData,
        //     };

        //     if (editingItem) {
        //         setData((prev) =>
        //             prev.map((limit) => ({
        //                 ...limit,

        //                 children: updateNode(
        //                     limit.children,
        //                     editingItem.id,
        //                     newRule
        //                 ),
        //             }))
        //         );
        //     } else {
        //         setData((prev) =>
        //             prev.map((limit) => {
        //                 if (
        //                     limit.id !==
        //                     parentLimitId
        //                 ) {
        //                     return limit;
        //                 }

        //                 if (!parentGroupId) {
        //                     const newChild = {
        //                         ...newRule,

        //                         logicalOperator:
        //                             limit.children
        //                                 .length
        //                                 ? formData.logicalOperator ||
        //                                   "AND"
        //                                 : undefined,
        //                     };

        //                     return {
        //                         ...limit,

        //                         children: [
        //                             ...limit.children,
        //                             newChild,
        //                         ],
        //                     };
        //                 }

        //                 return {
        //                     ...limit,

        //                     children:
        //                         addChildToGroup(
        //                             limit.children,
        //                             parentGroupId,
        //                             {
        //                                 ...newRule,

        //                                 logicalOperator:
        //                                     formData.logicalOperator ||
        //                                     "AND",
        //                             }
        //                         ),
        //                 };
        //             })
        //         );
        //     }

        //     closeModal();
        //     return;
        // }

        /* ----------------------------------------------------
           GROUP
        ---------------------------------------------------- */

        if (modalType === "GroupRule") {
            // const newGroup: BenefitGroup = {
            //     id:
            //         editingItem?.id ||
            //         `G-${Date.now()}`,

            //     type: "GroupRule",

            //     groupName:
            //         formData.groupName ||
            //         "New Logical Group",

            //     logicalOperator:
            //         formData.logicalOperator,

            //     children:
            //         editingItem?.children ||
            //         [],
            // };

            const payloadAdd = {
                benefitLimitId: parentLimitId,
                parentNodeId: parentGroupId||null,
                groupName: formData.groupName || "New Logical Group",
                logicalOperator: "AND",
                displayOrder: 2
            }
            const payloadUpdate ={
                groupName : formData.groupName,
                recordStatus : formData.recordStatus
            }
            // console.log("formData",formData);
            let endpoint= formData.id ? `/api/BenefitLimitMaster/UpdateBenefitGroup/${formData.id}` : "/api/BenefitLimitMaster/CreateBenefitGroupAsync";
            // let endpoint= "/api/BenefitLimitMaster/CreateBenefitGroupAsync";
            const idValue = formData.id ? formData.id : null;
            const payload = formData.id ? payloadUpdate : payloadAdd;
            const result = await saveMasters(payload, endpoint, idValue);
            if (result.success) {
                handleApiResponse(
                {
                    success: result.success
                },
                result?.data?.responseMessage
                );
                dispatch(FetchBenefitLimitTree());
                closeModal();
            }
            // if (editingItem) {
            //     setData((prev) =>
            //         prev.map((limit) => ({
            //             ...limit,

            //             children: updateNode(
            //                 limit.children,
            //                 editingItem.id,
            //                 newGroup
            //             ),
            //         }))
            //     );
            // } else {
            //     setData((prev) =>
            //         prev.map((limit) => {
            //             if (
            //                 limit.id !==
            //                 parentLimitId
            //             ) {
            //                 return limit;
            //             }

            //             if (!parentGroupId) {
            //                 return {
            //                     ...limit,

            //                     children: [
            //                         ...limit.children,

            //                         {
            //                             ...newGroup,

            //                             logicalOperator:
            //                                 limit.children
            //                                     .length
            //                                     ? formData.logicalOperator ||
            //                                       "AND"
            //                                     : undefined,
            //                         },
            //                     ],
            //                 };
            //             }

            //             return {
            //                 ...limit,

            //                 children:
            //                     addChildToGroup(
            //                         limit.children,
            //                         parentGroupId,
            //                         {
            //                             ...newGroup,

            //                             logicalOperator:
            //                                 formData.logicalOperator ||
            //                                 "AND",
            //                         }
            //                     ),
            //             };
            //         })
            //     );
            // }
        }
    };

    /* ========================================================
       SUMMARY
    ======================================================== */

    const getLimitSummary = (
        limit: BenefitLimit
    ) => {
        if (!limit.children.length) {
            return "No rules configured";
        }

        return buildSummary(
            limit.children
        );
    };

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <>
        <div
            className="w-full bg-zinc-50 p-4"
            style={{
                overflowY: "auto",
            }}
        >
            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-[16px] font-semibold text-gray-900">
                        Benefit Rules / Limits
                    </h1>

                    <p className="mt-1 text-[12px] text-gray-500">
                        Configure benefit limits and
                        the conditions used to
                        determine eligibility.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleView}
                    className="btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white cursor-pointer"
                >
                    + Add Benefit Limit
                </button>
            </div>

            {/* ==================================================
                BENEFIT LIMITS
            ================================================== */}

            <div className="space-y-5">
                {data.map(
                    (limit, limitIndex) => {
                        const isExpanded =
                            expandedLimits.includes(
                                limit.id
                            );

                        const isFirst =
                            limitIndex === 0;

                        const isLast =
                            limitIndex ===
                            data.length - 1;

                        return (
                            <div
                                key={limit.id} style={{border: '1px solid #7c7afd'}}
                                className="overflow-visible rounded-xl border border-zinc-200 bg-white"
                            >
                                {/* ==================================
                                    BENEFIT LIMIT HEADER
                                ================================== */}

                                <div className="border-b border-zinc-200 bg-white" style={{borderRadius: '12px'}}>
                                    <div className="flex items-start gap-3 p-4">
                                        {/* EXPAND */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleLimit(
                                                    limit.id
                                                )
                                            }
                                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                            title={
                                                isExpanded
                                                    ? "Collapse"
                                                    : "Expand"
                                            }
                                        >
                                             {isExpanded
                                                ? "−"
                                                : "+"}
                                        </button>

                                        {/* CONTENT */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                                                    BENEFIT LIMIT
                                                </span>

                                                <h2 className="text-base font-bold text-zinc-900">
                                                    {
                                                        limit?.tncName
                                                    }
                                                </h2>

                                                <span className="text-xs text-zinc-400">
                                                    {
                                                        limit?.benefitLimitCode
                                                    }
                                                </span>
                                                <span
                                                    className={`ml-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                        limit.isActive
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                                >
                                                    {limit.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                                                <span className="text-zinc-600">
                                                    Maximum:
                                                    <strong className="ml-1 text-zinc-900">
                                                        {formatValue(
                                                            limit?.value,
                                                            limit?.limitUnit
                                                        )}
                                                    </strong>
                                                </span>

                                                <span className="text-zinc-500">
                                                    {
                                                        limit?.limitBasis
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* ACTIONS
                                            Move buttons are OUTSIDE
                                            the 3-dot menu.
                                        */}
                                        <ActionMenu
                                            showMove={false}
                                            isFirst={
                                                isFirst
                                            }
                                            isLast={
                                                isLast
                                            }
                                            // onMoveUp={() =>
                                            //     moveLimit(
                                            //         limitIndex,
                                            //         "UP"
                                            //     )
                                            // }
                                            // onMoveDown={() =>
                                            //     moveLimit(
                                            //         limitIndex,
                                            //         "DOWN"
                                            //     )
                                            // }
                                            onEdit={() =>
                                                openEdit(
                                                    limit
                                                )
                                            }
                                            onDelete={() =>
                                                deleteLimit(
                                                    limit.id
                                                )
                                            }
                                            onAddRule={() =>
                                                openAddRule(
                                                    limit.id
                                                )
                                            }
                                            onAddGroup={() =>
                                                openAddGroup(
                                                    limit.id
                                                )
                                            }
                                        />
                                    </div>

                                    {/* SUMMARY */}

                                    <div className="mx-4 mb-4 rounded-lg border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                                        <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-indigo-600">
                                            Rule Summary
                                        </div>

                                        <div className="text-sm leading-6 text-zinc-700">
                                            {getLimitSummary(
                                                limit
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ==================================
                                    CHILDREN
                                ================================== */}

                                {isExpanded && (
                                    <div className="p-4">
                                        {!limit
                                            .children
                                            .length ? (
                                            <EmptyState
                                                onAddRule={() =>
                                                    openAddRule(
                                                        limit.id
                                                    )
                                                }
                                                onAddGroup={() =>
                                                    openAddGroup(
                                                        limit.id
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="space-y-3">
                                                {limit.children.map(
                                                    (
                                                        child,
                                                        index
                                                    ) => (
                                                        <React.Fragment
                                                            key={
                                                                child.id
                                                            }
                                                        >
                                                            {index >
                                                                0 && (
                                                                <OperatorConnector
                                                                    operator={
                                                                        child.logicalOperator ||
                                                                        "AND"
                                                                    }
                                                                    onChange={(
                                                                        value
                                                                    ) =>
                                                                        changeOperator(
                                                                            limit.id,
                                                                            null,
                                                                            child.id,
                                                                            value
                                                                        )
                                                                    }
                                                                />
                                                            )}

                                                            <RuleNode
                                                                node={
                                                                    child
                                                                }
                                                                level={
                                                                    0
                                                                }
                                                                index={
                                                                    index
                                                                }
                                                                siblings={
                                                                    limit.children
                                                                }
                                                                expandedGroups={
                                                                    expandedGroups
                                                                }
                                                                onToggleGroup={
                                                                    toggleGroup
                                                                }
                                                                onEdit={
                                                                    openEdit
                                                                }
                                                                onDelete={
                                                                    deleteNode
                                                                }
                                                                onAddRule={
                                                                    openAddRule
                                                                }
                                                                onAddGroup={
                                                                    openAddGroup
                                                                }
                                                                onMoveNode={
                                                                    moveNode
                                                                }
                                                                onChangeParentNode = {
                                                                    handleOpenChangeParent
                                                                }
                                                                onChangeOperator={
                                                                    changeOperator
                                                                }
                                                                limitId={
                                                                    limit.id
                                                                }
                                                                parentGroupId={
                                                                    null
                                                                }
                                                            />
                                                        </React.Fragment>
                                                    )
                                                )}

                                                {/* ADD BUTTONS */}

                                                <div className="mt-5 flex flex-wrap gap-2 border-t border-dashed border-zinc-200 pt-4">
                                                    <button
                                                        type="button"
                                                        // onClick={handleView}
                                                        onClick={() => openAddRule(limit.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-indigo-300 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
                                                    > + Add Rule
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openAddGroup(
                                                                limit.id
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-violet-300 px-3 py-2 text-xs font-semibold text-violet-600 transition hover:border-violet-400 hover:bg-violet-50"
                                                    >
                                                       
                                                       + Add Logical Group
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }
                )}
            </div>

            {/* ==================================================
                MODAL
            ================================================== */}

            {modalType && (
                <BenefitModal
                    type={modalType}
                    item={editingItem}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}
            {ruleDialogOpen && (
                <BenefitRuleDialog
                    open={ruleDialogOpen}
                    onClose={closeRuleDialog}
                    // benefitLimitId={selectedBenefitLimitId}
                    // parentNodeId={selectedParentNodeId}
                    benefitLimitId={parentLimitId}
                    parentNodeId={parentGroupId}
                    ruleId={editingRuleId}
                    rule={editingRuleItem}
                    onSaved={handleRuleSaved}
                />
            )}
        </div>
        
        <ConfirmationModal
            open={isDeleteModalOpen}
            title={`Delete Benefit ${selectedDeleteItem?.type}`}
            message={`Are you sure you want to delete Benefit ${selectedDeleteItem?.type}?`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
        />

        <ChangeParentNodeDialog
            open={changeParentDialogOpen}
            nodeName={changeParentTarget?.nodeName || ""}
            onCancel={closeChangeParentDialog}
            onSubmit={submitChangeParent}
        />
        </>
    );
};

/* ============================================================
   RULE NODE
============================================================ */

type RuleNodeProps = {
    node: BenefitNode;

    level: number;

    index: number;

    siblings: BenefitNode[];

    expandedGroups: string[];

    onToggleGroup: (
        id: string
    ) => void;

    // onEdit: (
    //     node: BenefitNode
    // ) => void;
    onEdit: (node: BenefitNode, parentGroupId: string | null) => void;

    onDelete: (
        id: string,
        type:string
    ) => void;

    onAddRule: (
        limitId: string,
        groupId?: string
    ) => void;

    onAddGroup: (
        limitId: string,
        groupId?: string
    ) => void;

    onMoveNode: (
        limitId: string,
        parentGroupId: string | null,
        nodeId: string,
        direction: Direction
    ) => void;
    onChangeParentNode: (
        limitId: string,
        newParentGroupId: string | null,
        nodeName : string | null,
        nodeId: string
    ) => void;

    onChangeOperator: (
        limitId: string,
        parentGroupId: string | null,
        nodeId: string,
        operator: LogicalOperator
    ) => void;

    limitId: string;

    parentGroupId: string | null;
};

const RuleNode = ({
    node,
    level,
    index,
    siblings,
    expandedGroups,
    onToggleGroup,
    onEdit,
    onDelete,
    onAddRule,
    onAddGroup,
    onMoveNode,
    onChangeParentNode,
    onChangeOperator,
    limitId,
    parentGroupId,
}: RuleNodeProps) => {
    /* ========================================================
       GROUP
    ======================================================== */

    if (node.type === "GroupRule") {
        const expanded =
            expandedGroups.includes(
                node.id
            );

        const isFirst =
            index === 0;

        const isLast =
            index ===
            siblings.length - 1;

        return (
            <div style={{backgroundColor:"#eaf1ff",border:"1px solid #abb6ff"}}
                className={`overflow-visible rounded-xl border  ${
                    level === 0
                        ? "border-indigo-200 bg-indigo-50/30"
                        : "border-violet-200 bg-violet-50/20"
                }`}
            >
                {/* GROUP HEADER */}

                <div className="flex items-start gap-3 p-4">
                    {/* EXPAND */}

                    <button
                        type="button"
                        onClick={() =>
                            onToggleGroup(
                                node.id
                            )
                        }
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                        title={
                            expanded
                                ? "Collapse"
                                : "Expand"
                        }
                    >
                        {expanded ? (
                            // <MinusIcon className="h-4 w-4" />
                            "-"
                        ) : (
                            // <PlusIcon className="h-4 w-4" />
                            "+"
                        )}
                    </button>

                    {/* GROUP CONTENT */}

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                                LOGICAL GROUP
                            </span>

                            <span className="text-sm font-bold text-zinc-900">
                                {
                                    node.groupName
                                }
                            </span>
                            <span
                                className={`ml-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                    node.isActive
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                }`}
                            >
                                {node.isActive ? "Active" : "Inactive"}
                            </span>
                            <GroupLogicBadge
                                group={node}
                            />
                        </div>

                        <p className="mt-1 text-xs text-zinc-500">
                            {getGroupDescription(
                                node
                            )}
                        </p>
                    </div>

                    {/* ACTIONS */}

                    <ActionMenu
                        isFirst={isFirst}
                        isLast={isLast}
                        onMoveUp={() =>
                            onMoveNode(
                                limitId,
                                parentGroupId,
                                node.id,
                                "UP"
                            )
                        }
                        onMoveDown={() =>
                            onMoveNode(
                                limitId,
                                parentGroupId,
                                node.id,
                                "DOWN"
                            )
                        }
                        onEdit={() =>
                            onEdit(node, parentGroupId)
                        }
                        onChangeParent = {()=>{
                            onChangeParentNode(limitId,parentGroupId,node.groupName,node.id);
                        }}
                        onDelete={() =>
                            onDelete(
                                node.id,
                                "GroupRule"
                            )
                        }
                        onAddRule={() =>
                            onAddRule(
                                limitId,
                                node.id
                            )
                        }
                        onAddGroup={() =>
                            onAddGroup(
                                limitId,
                                node.id
                            )
                        }
                    />
                </div>

                {/* GROUP CONTENT */}

                {expanded && (
                    <div className="border-t border-inherit p-4">
                        {node.children.length ===
                        0 ? (
                            <EmptyState
                                compact
                                onAddRule={() =>
                                    onAddRule(
                                        limitId,
                                        node.id
                                    )
                                }
                                onAddGroup={() =>
                                    onAddGroup(
                                        limitId,
                                        node.id
                                    )
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {node.children.map(
                                    (
                                        child,
                                        childIndex
                                    ) => (
                                        <React.Fragment
                                            key={
                                                child.id
                                            }
                                        >
                                            {childIndex >
                                                0 && (
                                                <OperatorConnector
                                                    small
                                                    operator={
                                                        child.logicalOperator ||
                                                        "AND"
                                                    }
                                                    onChange={(
                                                        value
                                                    ) =>
                                                        // onChangeOperatorFromNode(
                                                        //     limitId,
                                                        //     node.id,
                                                        //     child.id,
                                                        //     value,
                                                        //     // onMoveNode
                                                        // )
                                                        onChangeOperator(
                                                            limitId,
                                                            node.id,
                                                            child.id,
                                                            value
                                                        )
                                                    }
                                                />
                                            )}

                                            <RuleNode
                                                node={
                                                    child
                                                }
                                                level={
                                                    level +
                                                    1
                                                }
                                                index={
                                                    childIndex
                                                }
                                                siblings={
                                                    node.children
                                                }
                                                expandedGroups={
                                                    expandedGroups
                                                }
                                                onToggleGroup={
                                                    onToggleGroup
                                                }
                                                onEdit={
                                                    onEdit
                                                }
                                                onDelete={
                                                    onDelete
                                                }
                                                onAddRule={
                                                    onAddRule
                                                }
                                                onAddGroup={
                                                    onAddGroup
                                                }
                                                onMoveNode={
                                                    onMoveNode
                                                }
                                                onChangeParentNode={
                                                    onChangeParentNode
                                                }
                                                onChangeOperator={
                                                    onChangeOperator
                                                }
                                                limitId={
                                                    limitId
                                                }
                                                parentGroupId={
                                                    node.id
                                                }
                                            />
                                        </React.Fragment>
                                    )
                                )}

                                <div className="flex flex-wrap gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onAddRule(
                                                limitId,
                                                node.id
                                            )
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                                    >
                                        
                                        + Add Rule
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onAddGroup(
                                                limitId,
                                                node.id
                                            )
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-violet-300 px-3 py-1.5 text-xs font-semibold text-violet-600 transition hover:bg-violet-50"
                                    >
                                     
                                     + Add Group
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    /* ========================================================
       RULE
    ======================================================== */

    const isFirst = index === 0;

    const isLast =
        index ===
        siblings.length - 1;

    return (
        <RuleCard
            rule={node}
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={() =>
                onMoveNode(
                    limitId,
                    parentGroupId,
                    node.id,
                    "UP"
                )
            }
            onMoveDown={() =>
                onMoveNode(
                    limitId,
                    parentGroupId,
                    node.id,
                    "DOWN"
                )
            }
            onEdit={() =>
                onEdit(node, parentGroupId)
            }
            onChangeParent = {()=>{
                onChangeParentNode(limitId,parentGroupId,node?.parameter || node?.groupName,node.id);
            }}
            onDelete={() =>
                onDelete(node.id,"RULE")
            }
        />
    );
};

/* ============================================================
   RULE CARD
============================================================ */

const RuleCard = ({
    rule,
    isFirst,
    isLast,
    onMoveUp,
    onMoveDown,
    onEdit,
    onChangeParent,
    onDelete,
}: {
    rule: BenefitRule;

    isFirst: boolean;

    isLast: boolean;

    onMoveUp: () => void;

    onMoveDown: () => void;

    onEdit: () => void;
    onChangeParent :()=>void;

    onDelete: () => void;
}) => {
    const [
        showDetails,
        setShowDetails,
    ] = useState(false);

    return (
        <div className="overflow-visible rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-indigo-100 hover:shadow-md">
            <div className="flex items-start gap-3 p-4">
                {/* RULE ICON */}

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <GripIcon />
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            RULE
                        </span>
                        <span
                            className={`ml-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                rule.isActive
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            {rule.isActive ? "Active" : "Inactive"}
                        </span>

                        {/* <span className="text-xs text-zinc-400">
                            {rule.id}
                        </span> */}
                    </div>

                    {/* HUMAN READABLE RULE */}

                    <div className="text-sm font-semibold text-zinc-900">
                        {rule.parameter}

                        <span className="mx-2 rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-700">
                            {
                                rule.conditionOperator ||
                                rule.operatorName
                            }
                        </span>

                        <span className="text-indigo-700">
                            {
                                rule.conditionValue ||
                                rule.value
                            }
                        </span>

                        {rule.limitUnit && (
                            <span className="ml-1 text-xs font-normal text-zinc-500">
                                {rule.limitUnit ===
                                "INR"
                                    ? "₹"
                                    : rule.limitUnit}
                            </span>
                        )}
                    </div>

                    {/* LIMIT INFO */}

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span>
                            Limit:

                            <strong className="ml-1 text-zinc-700">
                                {formatValue(
                                    rule.value,
                                    rule.limitUnit
                                )}
                            </strong>
                        </span>

                        <span>
                            Basis:

                            <strong className="ml-1 text-zinc-700">
                                {rule.limitBasis ||
                                    "—"}
                            </strong>
                        </span>

                        {rule.specificCopaymentApplicable && (
                            <span className="rounded bg-orange-50 px-2 py-1 font-medium text-orange-700">
                                Copayment{" "}
                                {
                                    rule.specificCopaymentPercentage
                                }
                                %
                            </span>
                        )}
                    </div>

                    {/* TECHNICAL DETAILS */}

                    {showDetails && (
                        <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-2 lg:grid-cols-3">
                            <Detail
                                label="Benefit Limit Code"
                                value={
                                    rule.benefitLimitCode
                                }
                            />

                            <Detail
                                label="TNC Name"
                                value={
                                    rule.tncName
                                }
                            />

                            <Detail
                                label="Dimension Key"
                                value={
                                    rule.dimensionKey
                                }
                            />

                            <Detail
                                label="Parent Dimension Key"
                                value={
                                    rule.parentDimensionKey
                                }
                            />

                            <Detail
                                label="Parameter"
                                value={
                                    rule.parameter
                                }
                            />

                            <Detail
                                label="Parameter Calculation"
                                value={
                                    rule.parameterCalculation
                                }
                            />

                            <Detail
                                label="Parameter Source"
                                value={
                                    rule.parameterSource
                                }
                            />

                            <Detail
                                label="Operator"
                                value={
                                    rule.operatorName
                                }
                            />

                            <Detail
                                label="Limit Type"
                                value={
                                    rule.limitType
                                }
                            />

                            <Detail
                                label="Limit Unit"
                                value={
                                    rule.limitUnit
                                }
                            />

                            <Detail
                                label="Limit Basis"
                                value={
                                    rule.limitBasis
                                }
                            />

                            <Detail
                                label="Value"
                                value={
                                    rule.value
                                }
                            />

                            <Detail
                                label="Default"
                                value={
                                    rule.defaultValue
                                }
                            />

                            <Detail
                                label="Condition Basis"
                                value={
                                    rule.conditionBasis
                                }
                            />

                            <Detail
                                label="Condition Operator"
                                value={
                                    rule.conditionOperator
                                }
                            />

                            <Detail
                                label="Condition Value"
                                value={
                                    rule.conditionValue
                                }
                            />

                            <Detail
                                label="Clause"
                                value={
                                    rule.clause
                                }
                            />
                            <Detail
                                label="Action If True"
                                value={
                                    rule.actionTrueName
                                }
                            />
                            <Detail
                                label="Action If False"
                                value={
                                    rule.actionFalseName
                                }
                            />
                            <Detail
                                label="TNC Limit Action Stage"
                                value={
                                    rule.actionStageName
                                }
                            />
                            <Detail
                                label="TNC Limit Claim Special Action"
                                value={
                                    rule.claimSpecialName
                                }
                            />
                            <Detail
                                label="TNC Limit Action Level"
                                value={
                                    rule.actionLevelName
                                }
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            setShowDetails(
                                (prev) =>
                                    !prev
                            )
                        }
                        className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        {showDetails
                            ? "Hide technical details ↑"
                            : "View technical details ↓"}
                    </button>
                </div>

                {/* ACTIONS */}

                <ActionMenu
                    isFirst={isFirst}
                    isLast={isLast}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                    onEdit={onEdit}
                    onChangeParent={onChangeParent}
                    onDelete={onDelete}
                />
            </div>
        </div>
    );
};

/* ============================================================
   OPERATOR CONNECTOR
============================================================ */

const OperatorConnector = ({
    operator,
    onChange,
    small = false,
}: {
    operator: LogicalOperator;

    onChange: (
        value: LogicalOperator
    ) => void;

    small?: boolean;
}) => {
    return (
        <div
            className={`flex items-center justify-center ${
                small ? "py-1" : "py-2"
            }`}
        >
            <div className="flex w-full items-center gap-3">
                <div className="h-px flex-1 bg-zinc-200" />

                <div className="relative">
                    <select
                        value={operator}
                        onChange={(e) =>
                            onChange(
                                e.target.value as LogicalOperator
                            )
                        }
                        className={`
                            appearance-none
                            cursor-pointer
                            rounded-full
                            border
                            pl-3
                            pr-7
                            ${
                                small
                                    ? "py-1 text-[10px]"
                                    : "py-1.5 text-[10px]"
                            }
                            font-bold
                            uppercase
                            tracking-wider
                            outline-none
                            transition
                            ${
                                operator ===
                                "AND"
                                    ? "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300"
                                    : "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300"
                            }
                        `}
                    >
                        <option value="AND">
                            AND — ALL
                        </option>

                        <option value="OR">
                            OR — ANY
                        </option>
                    </select>

                    {/* SELECT ARROW */}

                    <svg
                        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>

                <div className="h-px flex-1 bg-zinc-200" />
            </div>
        </div>
    );
};

/* ============================================================
   GROUP LOGIC BADGE
============================================================ */

const GroupLogicBadge = ({
    group,
}: {
    group: BenefitGroup;
}) => {
    const operators = group.children
        .slice(1)
        .map(
            (child) =>
                child.logicalOperator
        )
        .filter(Boolean);

    const uniqueOperators =
        Array.from(
            new Set(operators)
        );

    if (!operators.length) {
        return (
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-500">
                No conditions
            </span>
        );
    }

    if (
        uniqueOperators.length ===
        1
    ) {
        const operator =
            uniqueOperators[0];

        return (
            <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                    operator === "AND"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                }`}
            >
                {operator === "AND"
                    ? "ALL conditions"
                    : "ANY condition"}
            </span>
        );
    }

    return (
        <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700">
            Mixed logic
        </span>
    );
};

/* ============================================================
   ACTION MENU

   IMPORTANT UI CHANGE:

   [ ↑ ] [ ↓ ] [ ⋮ ]

   Move buttons are outside dropdown.
============================================================ */

const ActionMenu = ({
    isFirst,
    isLast,
    onMoveUp,
    onMoveDown,
    onEdit,
    onChangeParent,
    onDelete,
    onAddRule,
    onAddGroup,
    showMove = true
}: {
    isFirst: boolean;
    isLast: boolean;

    onMoveUp: () => void;
    onMoveDown: () => void;

    onEdit: () => void;
    onChangeParent :()=>void;
    onDelete: () => void;

    onAddRule?: () => void;
    onAddGroup?: () => void;
    showMove?:boolean;
}) => {
    const [open, setOpen] =
        useState(false);

    return (
        <div className="relative flex shrink-0 items-center gap-1">
            {showMove && (
                <>
            {/* ================================================
                MOVE UP
            ================================================ */}

            <button
                type="button"
                disabled={isFirst}
                onClick={(e) => {
                    e.stopPropagation();

                    if (!isFirst) {
                        onMoveUp();
                    }
                }}
                className={`
                    group
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    border
                    transition-all
                    ${
                        isFirst
                            ? "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300"
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                    }
                `}
                title={
                    isFirst
                        ? "Already at top"
                        : "Move Up"
                }
                aria-label="Move Up"
            >
                <ArrowUpIcon className="h-4 w-4" />
            </button>

            {/* ================================================
                MOVE DOWN
            ================================================ */}

            <button
                type="button"
                disabled={isLast}
                onClick={(e) => {
                    e.stopPropagation();

                    if (!isLast) {
                        onMoveDown();
                    }
                }}
                className={`
                    group
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    border
                    transition-all
                    ${
                        isLast
                            ? "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300"
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                    }
                `}
                title={
                    isLast
                        ? "Already at bottom"
                        : "Move Down"
                }
                aria-label="Move Down"
            >
                <ArrowDownIcon className="h-4 w-4" />
            </button>
            
            </>
            )}

            {/* ================================================
                3 DOT MENU
            ================================================ */}

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();

                    setOpen(
                        (prev) => !prev
                    );
                }}
                className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    border
                    transition-all
                    ${
                        open
                            ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                            : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                    }
                `}
                title="More actions"
                aria-label="More actions"
            >
                <MoreVerticalIcon />
            </button>

            {/* ================================================
                DROPDOWN
            ================================================ */}

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() =>
                            setOpen(false)
                        }
                    />

                    <div className="absolute right-0 top-9 z-50 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
                        <MenuItem
                            icon={
                                <PencilIcon />
                            }
                            text="Edit"
                            onClick={() => {
                                setOpen(
                                    false
                                );

                                onEdit();
                            }}
                        />

                        {onAddRule && (
                            <MenuItem
                                icon={
                                    <PlusSmallIcon />
                                }
                                text="Add Rule"
                                onClick={() => {
                                    setOpen(
                                        false
                                    );

                                    onAddRule();
                                }}
                            />
                        )}

                        {onAddGroup && (
                            <MenuItem
                                icon={
                                    <PlusSmallIcon />
                                }
                                text="Add Logical Group"
                                onClick={() => {
                                    setOpen(
                                        false
                                    );

                                    onAddGroup();
                                }}
                            />
                        )}

                        <div className="my-1 border-t border-zinc-100" />
                        {showMove && <MenuItem
                            // icon={
                            //     <TrashIcon />
                            // }
                            text="Change Parent Node"
                            onClick={() => {
                                setOpen(
                                    false
                                );

                                onChangeParent();
                            }}
                        />}
                        <div className="my-1 border-t border-zinc-100" />

                        <MenuItem
                            icon={
                                <TrashIcon />
                            }
                            text="Delete"
                            danger
                            onClick={() => {
                                setOpen(
                                    false
                                );

                                onDelete();
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

/* ============================================================
   MENU ITEM
============================================================ */

const MenuItem = ({
    text,
    icon,
    onClick,
    danger = false,
}: {
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex
                w-full
                items-center
                gap-2.5
                px-3
                py-2.5
                text-left
                text-xs
                font-medium
                transition
                ${
                    danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-zinc-700 hover:bg-zinc-50"
                }
            `}
        >
            <span
                className={
                    danger
                        ? "text-red-500"
                        : "text-zinc-400"
                }
            >
                {icon}
            </span>

            {text}
        </button>
    );
};

/* ============================================================
   EMPTY STATE
============================================================ */

const EmptyState = ({
    onAddRule,
    onAddGroup,
    compact = false,
}: {
    onAddRule: () => void;
    onAddGroup: () => void;
    compact?: boolean;
}) => {
    return (
        <div
            className={`rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center ${
                compact
                    ? "p-5"
                    : "p-8"
            }`}
        >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                <PlusIcon />
            </div>

            <p className="text-sm font-medium text-zinc-700">
                No rules configured
            </p>

            <p className="mt-1 text-xs text-zinc-500">
                Add a rule or create a
                logical group.
            </p>

            <div className="mt-4 flex justify-center gap-2">
                <button
                    type="button"
                    onClick={onAddRule}
                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                    {/* <PlusSmallIcon /> */}
                    + Add Rule
                </button>

                <button
                    type="button"
                    onClick={onAddGroup}
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                    {/* <PlusSmallIcon /> */}
                    + Add Group
                </button>
            </div>
        </div>
    );
};

/* ============================================================
   MODAL
============================================================ */

const BenefitModal = ({
    type,
    item,
    onClose,
    onSave,
}: {
    type:
        | "LIMIT"
        | "RULE"
        | "GroupRule";

    item: any;

    onClose: () => void;

    onSave: (
        data: any
    ) => void;
}) => {
    const [form, setForm] =
        useState<any>(
            item
                ? {
                      ...item,
                  }
                : {
                      benefitLimitID: "",
                      tncName: "",

                      dimensionKey: "",
                      parentDimensionKey:
                          "",

                      parameter: "",
                      parameterCalculation:
                          "",
                      parameterSource:
                          "",

                      operator: "=",

                      limitType:
                          "",

                      limitUnit:
                          "",

                      limitBasis:
                          "",

                      value: "",
                      defaultValue: "",

                      conditionBasis:
                          "",

                      conditionOperator:
                          "",

                      conditionValue:
                          "",

                      clause: "",

                      specificCopaymentApplicable:
                          false,

                      specificCopaymentPercentage:
                          "",

                      groupName: "",
                      recordStatus :"Active",

                      logicalOperator:
                          "AND",
                  }
        );

    const update = (
        field: string,
        value: any
    ) => {
        setForm(
            (prev: any) => ({
                ...prev,
                [field]: value,
            })
        );
    };

    const title = item
        ? `Edit ${
              type === "LIMIT"
                  ? "Benefit Limit"
                  : type === "RULE"
                  ? "Benefit Rule"
                  : "Logical Group"
          }`
        : `Add ${
              type === "LIMIT"
                  ? "Benefit Limit"
                  : type === "RULE"
                  ? "Benefit Rule"
                  : "Logical Group"
          }`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold text-zinc-900">
                            {title}
                        </h2>

                        <p className="mt-1 text-xs text-zinc-500">
                            Configure the
                            business rule
                            details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                    >
                        ×
                    </button>
                </div>

                {/* BODY */}

                <div className="overflow-y-auto p-5">
                    {type ===
                    "GroupRule" ? (
                        <div className="max-w-xl">
                            <FormField
                                label="Group Name"
                                value={
                                    form.groupName
                                }
                                onChange={(
                                    value
                                ) =>
                                    update(
                                        "groupName",
                                        value
                                    )
                                }
                                placeholder="e.g. Age Based Eligibility"
                            />
                            {item && <div>
                                <label className="mb-1.5 mt-1.5 block text-xs font-semibold text-zinc-700">Operational Status</label>
                            <select
                                value={form.recordStatus}
                                onChange={(
                                    e
                                ) =>
                                    update(
                                        "recordStatus",
                                        e.target.value
                                    )
                                }
                                className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            </div>}

                            {/* {!item && (
                                <div className="mt-5">
                                    <label className="mb-2 block text-xs font-semibold text-zinc-700">
                                        Combine with
                                        previous
                                        item
                                    </label>

                                    <select
                                        value={
                                            form.logicalOperator ||
                                            "AND"
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            update(
                                                "logicalOperator",
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="AND">
                                            AND — All
                                            conditions
                                            must match
                                        </option>

                                        <option value="OR">
                                            OR — Any
                                            condition
                                            can match
                                        </option>
                                    </select>
                                </div>
                            )} */}
                        </div>
                    ) 
                    : (
                        <div className="space-y-6">
                            {/* BUSINESS FIELDS */}

                            <div>
                                <SectionTitle>
                                    Rule Definition
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        label="TC Name"
                                        value={
                                            form.tcName
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "tcName",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Parameter"
                                        value={
                                            form.parameter
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "parameter",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Condition Basis"
                                        value={
                                            form.conditionBasis
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "conditionBasis",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Condition Operator"
                                        value={
                                            form.conditionOperator
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "conditionOperator",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Condition Value"
                                        value={
                                            form.conditionValue
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "conditionValue",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Clause"
                                        value={
                                            form.clause
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "clause",
                                                value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* LIMIT */}

                            <div>
                                <SectionTitle>
                                    Limit Configuration
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <FormField
                                        label="Limit Type"
                                        value={
                                            form.limitType
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "limitType",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Limit Unit"
                                        value={
                                            form.limitUnit
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "limitUnit",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Limit Basis"
                                        value={
                                            form.limitBasis
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "limitBasis",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Value"
                                        value={
                                            form.value
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "value",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Default"
                                        value={
                                            form.defaultValue
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "defaultValue",
                                                value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* TECHNICAL */}

                            <div>
                                <SectionTitle>
                                    Technical Configuration
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <FormField
                                        label="Benefit Limit ID"
                                        value={
                                            form.benefitLimitID
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "benefitLimitID",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Dimension Key"
                                        value={
                                            form.dimensionKey
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "dimensionKey",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Parent Dimension Key"
                                        value={
                                            form.parentDimensionKey
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "parentDimensionKey",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Parameter Calculation"
                                        value={
                                            form.parameterCalculation
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "parameterCalculation",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Parameter Source"
                                        value={
                                            form.parameterSource
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "parameterSource",
                                                value
                                            )
                                        }
                                    />

                                    <FormField
                                        label="Operator"
                                        value={
                                            form.operator
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            update(
                                                "operator",
                                                value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* COPAYMENT */}

                            {type ===
                                "RULE" && (
                                <div>
                                    <SectionTitle>
                                        Copayment
                                    </SectionTitle>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <label className="flex items-center gap-2 rounded-lg border border-zinc-200 p-3">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    form.specificCopaymentApplicable ||
                                                    false
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    update(
                                                        "specificCopaymentApplicable",
                                                        e
                                                            .target
                                                            .checked
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
                                            />

                                            <span className="text-sm text-zinc-700">
                                                Specific
                                                Copayment
                                                Applicable
                                            </span>
                                        </label>

                                        <FormField
                                            label="Specific Copayment %"
                                            value={
                                                form.specificCopaymentPercentage
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                update(
                                                    "specificCopaymentPercentage",
                                                    value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                    }
                </div>

                {/* FOOTER */}

                <div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onSave(form)
                        }
                        className="px-5 py-2 text-xs font-extrabold this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white rounded-lg cursor-pointer"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ============================================================
   FORM FIELD
============================================================ */

const FormField = ({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;

    value: string;

    onChange: (
        value: string
    ) => void;

    placeholder?: string;
}) => {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
                {label}
            </label>

            <input
                type="text"
                value={value || ""}
                placeholder={
                    placeholder
                }
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
        </div>
    );
};

/* ============================================================
   SECTION TITLE
============================================================ */

const SectionTitle = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="mb-3 border-b border-zinc-200 pb-2 text-sm font-bold text-zinc-800">
            {children}
        </div>
    );
};

/* ============================================================
   DETAIL
============================================================ */

const Detail = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => {
    return (
        <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                {label}
            </div>

            <div className="mt-0.5 text-xs font-medium text-zinc-700">
                {value || "—"}
            </div>
        </div>
    );
};

/* ============================================================
   MOVE NODE IN CURRENT ARRAY

   Preserves operator positions.
============================================================ */

// const moveNodeInArray = (
//     nodes: BenefitNode[],
//     nodeId: string,
//     direction: Direction
// ): BenefitNode[] => {
//     const index =
//         nodes.findIndex(
//             (node) =>
//                 node.id === nodeId
//         );

//     if (index === -1) {
//         return nodes;
//     }

//     const newIndex =
//         direction === "UP"
//             ? index - 1
//             : index + 1;

//     if (
//         newIndex < 0 ||
//         newIndex >= nodes.length
//     ) {
//         return nodes;
//     }

//     const updated = [...nodes];

//     /* ----------------------------------------------
//        Save operators by POSITION
//     ---------------------------------------------- */

//     const operators =
//         updated.map(
//             (node) =>
//                 node.logicalOperator
//         );

//     /* ----------------------------------------------
//        Swap nodes
//     ---------------------------------------------- */

//     [
//         updated[index],
//         updated[newIndex],
//     ] = [
//         updated[newIndex],
//         updated[index],
//     ];

//     /* ----------------------------------------------
//        Restore operators by POSITION
//     ---------------------------------------------- */

//     return updated.map(
//         (node, position) => ({
//             ...node,

//             logicalOperator:
//                 position === 0
//                     ? undefined
//                     : operators[position] ||
//                       "AND",
//         })
//     );
// };

/* ============================================================
   MOVE NODE INSIDE GROUP
============================================================ */

// const moveNodeInsideGroup = (
//     nodes: BenefitNode[],
//     groupId: string,
//     nodeId: string,
//     direction: Direction
// ): BenefitNode[] => {
//     return nodes.map(
//         (node) => {
//             if (
//                 node.type ===
//                     "GroupRule" &&
//                 node.id === groupId
//             ) {
//                 return {
//                     ...node,

//                     children:
//                         moveNodeInArray(
//                             node.children,
//                             nodeId,
//                             direction
//                         ),
//                 };
//             }

//             if (
//                 node.type ===
//                 "GroupRule"
//             ) {
//                 return {
//                     ...node,

//                     children:
//                         moveNodeInsideGroup(
//                             node.children,
//                             groupId,
//                             nodeId,
//                             direction
//                         ),
//                 };
//             }

//             return node;
//         }
//     );
// };

/* ============================================================
   UPDATE OPERATOR IN ARRAY
============================================================ */

// const updateOperatorInArray = (
//     nodes: BenefitNode[],
//     nodeId: string,
//     operator: LogicalOperator
// ): BenefitNode[] => {
//     return nodes.map(
//         (node, index) => {
//             if (
//                 node.id === nodeId
//             ) {
//                 return {
//                     ...node,

//                     logicalOperator:
//                         index === 0
//                             ? undefined
//                             : operator,
//                 };
//             }

//             return node;
//         }
//     );
// };

/* ============================================================
   UPDATE OPERATOR INSIDE GROUP
============================================================ */

// const updateOperatorInsideGroup = (
//     nodes: BenefitNode[],
//     groupId: string,
//     nodeId: string,
//     operator: LogicalOperator
// ): BenefitNode[] => {
//     return nodes.map(
//         (node) => {
//             if (
//                 node.type ===
//                     "GroupRule" &&
//                 node.id === groupId
//             ) {
//                 return {
//                     ...node,

//                     children:
//                         updateOperatorInArray(
//                             node.children,
//                             nodeId,
//                             operator
//                         ),
//                 };
//             }

//             if (
//                 node.type ===
//                 "GroupRule"
//             ) {
//                 return {
//                     ...node,

//                     children:
//                         updateOperatorInsideGroup(
//                             node.children,
//                             groupId,
//                             nodeId,
//                             operator
//                         ),
//                 };
//             }

//             return node;
//         }
//     );
// };

/* ============================================================
   SPECIAL HANDLER FOR NESTED OPERATOR

   This keeps RuleNode independent from main component state.
============================================================ */

// const onChangeOperatorFromNode = (
//     limitId: string,
//     groupId: string,
//     nodeId: string,
//     operator: LogicalOperator,
//     // onMoveNode: (
//     //     limitId: string,
//     //     parentGroupId: string | null,
//     //     nodeId: string,
//     //     direction: Direction
//     // ) => void
// ) => {
//     // console.log("onChangeOperatorFromNode",limitId,groupId,nodeId,operator);
//     /*
//        We cannot directly change parent state here.

//        This function is intentionally kept as a placeholder
//        hook point for the nested RuleNode.

//        Recommended approach:
//        pass a dedicated onChangeOperator callback
//        from the parent.

//        See note below.
//     */

//     void limitId;
//     void groupId;
//     void nodeId;
//     void operator;
//     // void onMoveNode;
// };

/* ============================================================
   REMOVE NODE RECURSIVELY
============================================================ */

// const removeNode = (
//     nodes: BenefitNode[],
//     id: string
// ): BenefitNode[] => {
//     return nodes
//         .filter(
//             (node) =>
//                 node.id !== id
//         )
//         .map((node) => {
//             if (
//                 node.type ===
//                 "GroupRule"
//             ) {
//                 return {
//                     ...node,

//                     children:
//                         removeNode(
//                             node.children,
//                             id
//                         ),
//                 };
//             }

//             return node;
//         });
// };

/* ============================================================
   UPDATE NODE RECURSIVELY
============================================================ */

// const updateNode = (
//     nodes: BenefitNode[],
//     id: string,
//     updated: BenefitNode
// ): BenefitNode[] => {
//     return nodes.map(
//         (node) => {
//             if (
//                 node.id === id
//             ) {
//                 return updated;
//             }

//             if (
//                 node.type ===
//                 "GroupRule"
//             ) {
//                 return {
//                     ...node,

//                     children:
//                         updateNode(
//                             node.children,
//                             id,
//                             updated
//                         ),
//                 };
//             }

//             return node;
//         }
//     );
// };

/* ============================================================
   ADD CHILD TO GROUP
============================================================ */

// const addChildToGroup = (
//     nodes: BenefitNode[],
//     groupId: string,
//     child: BenefitNode
// ): BenefitNode[] => {
//     return nodes.map(
//         (node) => {
//             if (
//                 node.type ===
//                     "GroupRule" &&
//                 node.id === groupId
//             ) {
//                 return {
//                     ...node,

//                     children: [
//                         ...node.children,
//                         child,
//                     ],
//                 };
//             }

//             if (
//                 node.type ===
//                 "GroupRule"
//             ) {
//                 return {
//                     ...node,

//                     children:
//                         addChildToGroup(
//                             node.children,
//                             groupId,
//                             child
//                         ),
//                 };
//             }

//             return node;
//         }
//     );
// };

/* ============================================================
   BUILD SUMMARY
============================================================ */

const buildSummary = (
    nodes: BenefitNode[]
): React.ReactNode => {
    const activeNodes = nodes.filter(
        (node) => node?.isActive === true
    );

    if (!activeNodes.length) {
        return "No active rules configured";
    }

    return (
        <>
            {activeNodes.map(
                (
                    node,
                    index
                ) => (
                    <React.Fragment
                        key={
                            node.id
                        }
                    >
                        {index > 0 && (
                            <strong
                                className={`
                                    mx-2
                                    rounded
                                    px-2
                                    py-0.5
                                    text-[11px]
                                    ${
                                        node.logicalOperator ===
                                        "OR"
                                            ? "bg-orange-50 text-orange-700"
                                            : "bg-white text-indigo-700"
                                    }
                                `}
                            >
                                {
                                    node.logicalOperator ||
                                    "AND"
                                }
                            </strong>
                        )}

                        {node.type ===
                        "RULE" ? (
                            <span>
                                {
                                    node.parameter ||
                                    node.tncName
                                }{" "}
                                <strong>
                                    {
                                        node.conditionOperator ||
                                        node.operatorName
                                    }
                                </strong>{" "}
                                <span className="font-semibold text-indigo-700">
                                    {
                                        node.conditionValue ||
                                        node.value
                                    }
                                </span>
                            </span>
                        ) : (
                            <span>
                                (
                                {buildSummary(
                                    node.children
                                )}
                                )
                            </span>
                        )}
                    </React.Fragment>
                )
            )}
        </>
    );
};

/* ============================================================
   GROUP DESCRIPTION
============================================================ */

const getGroupDescription = (
    group: BenefitGroup
) => {
    if (
        !group.children.length
    ) {
        return "No conditions configured";
    }

    const operators =
        group.children
            .slice(1)
            .map(
                (child) =>
                    child.logicalOperator
            );

    const unique =
        Array.from(
            new Set(
                operators
            )
        );

    if (
        unique.length === 1 &&
        unique[0] === "AND"
    ) {
        return "All conditions must match";
    }

    if (
        unique.length === 1 &&
        unique[0] === "OR"
    ) {
        return "Any condition can match";
    }

    return "Conditions use a combination of AND / OR";
};

/* ============================================================
   FORMAT VALUE
============================================================ */

const formatValue = (
    value: string,
    unit: string
) => {
    if (!value) {
        return "—";
    }

    if (
        unit === "INR" &&
        !isNaN(Number(value))
    ) {
        return `₹${Number(
            value
        ).toLocaleString(
            "en-IN"
        )}`;
    }

    return `${value}${
        unit
            ? ` ${unit}`
            : ""
    }`;
};

export default BenefitRulesBuilder;
