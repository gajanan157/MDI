export interface LimitTypeMst {
    limitTypeCode: string;
    limitTypeName: string;
    recordStatus: string;
}
  
export interface LimitBasisMst {
    limitBasisCode: string;
    limitBasisName: string;
    recordStatus: string;
}
  
export interface LimitUnitMst {
    limitUnitCode: string;
    limitUnitName: string;
    recordStatus: string;
}

export interface SIMaster {
    sumInsuredTypeCode: string;
    sumInsuredTypeName: string;
    recordStatus: string;
}

export interface TnCMaster {
    tncTypeCode: string;
    tncName: string;
    parentTncId: string;
    parentTncName: string;
    isDefault: boolean;
    isWaitingPeriod: boolean;
    isExclusion: boolean;
    isCashless: boolean;
    isDayCare: boolean;
    chargeSection:string;
    policyClauseNumber: string;
    recordStatus: string;
}

export interface TnCTypeDropdown {
    tncTypeCode: string;
    tncTypeName: string;
}
export interface ParentTnCDropdown {
    tncId: string;
    tncName: string;
}

export interface EligibilityTypeMaster {
    eligibilityTypeCode: string;
    eligibilityTypeName: string;
    recordStatus: string;
}

export interface DimensionKeyMaster {
    dimensionKey: string;
    dimensionName: string;
    recordStatus: string;
}

export interface hazardousActivityMaster {
    hazardousActivityCode: string;
    HazardousActivityName: string;
    recordStatus: string;
}
export interface billingChargeGroupMaster {
    billingChargeGroupCode: string;
    billingChargeGroupName: string;
    recordStatus: string;
}
export interface billHeadMaster {
    billheadCode: string;
    billheadName: string;
    recordStatus: string;
}
export interface deductionReasonMaster {
    deductionReasonCode: string;
    deductionReasonName: string;
    recordStatus: string;
}

export interface MasterListResponse<T> {
    totalCount: number;
    data: T[];
}

export interface ApiResponse<T> {
    responseCode: number;
    responseMessage: string;
    success: boolean;
    responseObject: T;
}

export interface FetchLimitTypeMasterPayload {
    pageNumber?: number;
    pageSize?: number;
    searchText?: string;
    getAll?:boolean
}
export interface FetchICDPayload {
    code?: string;
    description?:string;
    year?:string;
    pageNumber?: number;
    pageSize?: number;
}
export interface Fetch_CPT_HCPCS_Payload {
    icdId?: number[];
    database?: string[];
    code?: string;
    description?: string;
    pageNumber: number;
    pageSize: number;
}

export interface ICDResponse {
    icdId:number;
    icdCode: string;
    icdCodeVersion: string;
    briefDescription: string;
    icdCodeCodingYear: string;
}
export interface CPT_HCPCS_Response {   
    linkId: number;
    icdId: number;
    icdCode: string;
    code:string;
    description: string;
    qualifier: string;
    version: string;
}

export interface TncBillHeadResponse {
    tnCBillHeadMapId :string;
    tncId :string;
    billingChargeGroupCode :string;
    billHeadCode :string;
    chargeSection :string;
    recordStatus :string;
}
export interface TnCDimensionResponse {
    tnCDimensionId :string;
    tncId :string;
    dimensionKey :string;
    recordStatus :string;
}
export interface ParameterMaster {
    parameterId : string;
    parameterCode : string;
    parameterName : string;
    parameterCalculation : string;
    parameterSource : string;
    recordStatus : string;
}

export interface ApplicableICDGroup {
    icdId: number;
    icdCode: string;
    briefDescription: string;
    icdCodeCodingYear: string;
    icdCodeVersion: string;
}

export interface ApplicableICDPCSProcedureGroup {
    linkId: number;
    icdId: number;
    qualifier: string;
    icdCode: string;
    code: string;
    description: string;
    version: string;
}

export interface ProcedureMaster {
    procedureId: string;
    procedureCode: string;
    procedureCategoryCode: string;
    procedureName: string;

    applicableICDGroup: ApplicableICDGroup[];

    applicableICDPCSProcedureGroup: ApplicableICDPCSProcedureGroup[];

    isDayCareProcedure: boolean;
    isAcuteWaitingPeriodApplicable: boolean;
    isIntermediateWaitingPeriodApplicable: boolean;
    isLongTermWaitingPeriodApplicable: boolean;
    isModernTreatmentProcedure: boolean;
    isCriticalIllnessProcedure: boolean;
    isInfertilitySterilityProcedure: boolean;
    isProcedureCoveredUnderOptionalPolicy: boolean;
    isWellbeingProcedure: boolean;
    isCosmeticProcedure: boolean;
    isObesityProcedure: boolean;
    isUnprovenProcedure: boolean;
    isMentalProcedure: boolean;

    recordStatus: string;
}

export interface ProcedureCategoryDropdown {
    procedureCategoryCode: string;
    procedureCategoryName: string;
}

export interface DiseaseMaster {
    diseaseId: string;
    diseaseCode: string;
    procedureCategoryCode: string;
    diseaseName: string;

    applicableICDGroup: ApplicableICDGroup[];

    applicableICDPCSProcedureGroup: ApplicableICDPCSProcedureGroup[];

    isDayCareDisease: boolean;
    isAcuteWaitingPeriodApplicable: boolean;
    isIntermediateWaitingPeriodApplicable: boolean;
    isLongTermWaitingPeriodApplicable: boolean;
    isModernTreatmentProcedure: boolean;
    isCriticalIllnessProcedure: boolean;
    isInfertilitySterilityProcedure: boolean;
    isDiseaseCoveredUnderOptionalPolicy: boolean;
    isWellbeingDisease: boolean;
    isCosmeticDisease: boolean;
    isObesityDisease: boolean;
    isUnprovenDisease: boolean;
    isMentalDisease: boolean;

    recordStatus: string;
}

export interface AilmentProcedureMaster {
    ailmentProcedureSublimitId: string;
    ailmentProcedureName: string;
    procedureCategoryCode: string;
    sublimitAmount: number | null;

    applicableICDGroup: ApplicableICDGroup[];
    applicableICDPCSProcedureGroup: ApplicableICDPCSProcedureGroup[];
    recordStatus: string;
}

export interface ParameterMasterDropdown {
    parameterId : string;
    parameterName : string;
}

export interface TncLimitActionLevelDropDown {
    tncLimitActionLevelCode : string;
    tncLimitActionLevelName : string;
}

export interface TncLimitActionStageDropDown {
    tncLimitActionStageCode : string;
    tncLimitActionStageName : string;
}

export interface TncLimitClaimSpecialActionDropDown {
    tncLimitClaimSpecialActionCode : string;
    tncLimitClaimSpecialActionName : string;
}

export interface TncLimitActionDropDown {
    tncLimitActionCode : string;
    tncLimitActionName : string;
}

export interface BenefitLimitMaster {
    benefitLimitId : string;
    benefitLimitCode: string;
    tncId: string | null;
    dimensionKey: string;
    parentDimensionKey: string;
    parameterId: string | null;
    parameterCalculation: string;
    parameterSourceCode: string;
    operatorCode: string;
    value: string;
    defaultValue: string;
    limitTypeCode: string;
    limitUnitCode: string;
    limitBasis: string;
    conditionBasis: string;
    conditionOperator: string;
    conditionValue: string;
    specificCopaymentApplicable: boolean;
    specificCopaymentPercentage: number;
    entryToBSITable: boolean;
    entryToClaimCountTable: boolean;
    clause: string;
    conditionActionBoth: string;
    actionIfTrue: string;
    tncLimitActionLevel: string;

    applicableICD: ApplicableICDGroup[];

    applicableCPT: ApplicableICDPCSProcedureGroup[];

    applicableHCPCSI: ApplicableICDPCSProcedureGroup[];

    applicableHCPCSII: ApplicableICDPCSProcedureGroup[];

    tncLimitClaimSpecialAction: string;
    actionIfFalse: string;
    tncLimitActionStage: string;
    recordStatus: string;
}

export interface BenefitLimitTreeResponse {
    benefitLimitCode: string;
    id:string;
    type: string;

    benefitLimitID: string;
    tncName: string;

    dimensionKey?: string | null;
    parentDimensionKey?: string | null;

    parameter?: string | null;
    parameterCalculation?: string | null;
    parameterSource?: string | null;

    operator?: string | null;

    limitType?: string | null;
    limitUnit?: string | null;
    limitBasis?: string | null;

    value?: string | null;
    defaultValue?: string | null;
    recordStatus?:string|null;
    isActive : boolean;

    children: BenefitTreeChildResponse[];
}

export interface BenefitTreeChildResponse {
    id: string;
    type: string; // RULE / GROUP

    benefitLimitID: string;
    benefitLimitCode: string;
    tncName?: string | null;

    dimensionKey?: string | null;
    parentDimensionKey?: string | null;

    parameter?: string | null;
    parameterCalculation?: string | null;
    parameterSource?: string | null;

    operator?: string | null;

    limitType?: string | null;
    limitUnit?: string | null;
    limitBasis?: string | null;

    value?: string | null;
    defaultValue?: string | null;

    // RULE fields
    conditionBasis?: string | null;
    conditionOperator?: string | null;
    conditionValue?: string | null;

    clause?: string | null;

    specificCopaymentApplicable?: boolean | null;
    specificCopaymentPercentage?: number | null;

    // GROUP fields
    logicalOperator?: string | null;
    groupName?: string | null;
    recordStatus?:string|null;
    isActive : boolean;
    operatorName:string|null;
    actionTrueName:string|null;
    actionFalseName:string|null;
    actionLevelName:string|null;
    actionStageName:string|null;
    claimSpecialName:string|null;

    children: BenefitTreeChildResponse[];
}

export interface operatorMasterResponse
{
    operatorCode : string;
    operatorName : string;
    operatorSymbol : string;
    operatorType : string;
    recordStatus : string;
}

export interface TncLimitActionMaster {
    actionCode: string;
    actionName: string;
    recordStatus: string;
}

export interface BenefitPossibleParentsResponse {
    nodeId: string|null;
    displayName: string;
}