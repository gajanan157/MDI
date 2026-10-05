import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { LimitTypeMst,FetchLimitTypeMasterPayload, ApiResponse, MasterListResponse, LimitBasisMst, LimitUnitMst, SIMaster, TnCTypeDropdown, ParentTnCDropdown, TnCMaster, EligibilityTypeMaster, DimensionKeyMaster, hazardousActivityMaster, billingChargeGroupMaster, billHeadMaster, deductionReasonMaster, TncBillHeadResponse, TnCDimensionResponse, ParameterMaster, ProcedureMaster, ProcedureCategoryDropdown, FetchICDPayload, Fetch_CPT_HCPCS_Payload, ICDResponse, CPT_HCPCS_Response, DiseaseMaster, AilmentProcedureMaster, ParameterMasterDropdown, TncLimitActionLevelDropDown, TncLimitActionStageDropDown, TncLimitClaimSpecialActionDropDown, TncLimitActionDropDown, BenefitLimitMaster, BenefitLimitTreeResponse, operatorMasterResponse, TncLimitActionMaster, BenefitPossibleParentsResponse } from "./LimitTypeMasterTypes";
// import { benefitsConfigurationApi,getApi } from "@/app/api/apiService";
import { fetchMasterAPI, fetchDropDownAPI } from "./LimitTypeMasterAPI";

interface LimitTypeMasterState {
    limitTypeList: LimitTypeMst[];
    limitBasisList: LimitBasisMst[];
    limitUnitList: LimitUnitMst[];
    siMasterList : SIMaster[];
    tncMasterList : TnCMaster[];
    tncDataById:TnCMaster|null;
    tncTypeDropdownList : TnCTypeDropdown[];
    parentTncTypeDropdownList : ParentTnCDropdown[];
    eligibilityTypeMasterList : EligibilityTypeMaster[];
    dimensionKeyMasterList : DimensionKeyMaster[];
    hazardousActivityMasterList : hazardousActivityMaster[];
    billingChargeGroupMasterList : billingChargeGroupMaster[];
    billHeadMasterList : billHeadMaster[];
    deductionReasonMasterList : deductionReasonMaster[];
    parameterMasterList : ParameterMaster[];
    procedureMasterList : ProcedureMaster[];
    procedureCategoryDropdownList : ProcedureCategoryDropdown[];
    procedureMasterDataById : ProcedureMaster|null;
    icdResponseList : ICDResponse[];
    cpt_hcpcs_ResponseList : CPT_HCPCS_Response[];
    diseaseMasterList : DiseaseMaster[];
    diseaseMasterDataById : DiseaseMaster|null;
    ailmentProcedureMasterList : AilmentProcedureMaster[];
    ailmentProcedureMasterDataById : AilmentProcedureMaster|null;

    limitTypeTotalRecords: number;
    limitBasisTotalRecords: number;
    limitUnitTotalRecords: number;
    siMasterTotalRecords: number;
    tncMasterTotalRecords: number;
    eligibilityTypeMasterTotalRecords: number;
    dimensionKeyMasterTotalRecords: number;
    hazardousActivityMasterTotalRecords: number;
    billingChargeGroupMasterTotalRecords: number;
    billHeadMasterTotalRecords: number;
    deductionReasonMasterTotalRecords: number;
    parameterMasterTotalRecords : number;
    procedureMasterTotalRecords : number;
    icdResponseTotalRecords : number;
    cpt_hcpcs_ResponseTotalRecords : number;
    diseaseMasterTotalRecords : number;
    ailmentProcedureMasterTotalRecords : number;

    totalRecords: number;
    loading: boolean;
    error?: string;
    tncBillHeadResponse : TncBillHeadResponse[];
    tnCDimensionResponse : TnCDimensionResponse[];
    parameterMasterDropdown : ParameterMasterDropdown[];
    parameterMasterDataById : ParameterMaster | null;
    tncMasterDropdown : ParentTnCDropdown[];
    tncLimitActionLevelDropDown : TncLimitActionLevelDropDown[];
    tncLimitActionStageDropDown : TncLimitActionStageDropDown[];
    tncLimitClaimSpecialActionDropDown : TncLimitClaimSpecialActionDropDown[];
    tncLimitActionDropDown :TncLimitActionDropDown[];
    benefitLimitMasterDataById : BenefitLimitMaster|null;
    benefitLimitTreeResponse : BenefitLimitTreeResponse[];
    operatorMasterList : operatorMasterResponse[];
    operatorMasterTotalRecords : number,
    benefitRuleDataById : BenefitLimitMaster|null;
    tncLimitActionMasterList : TncLimitActionMaster[];
    tncLimitActionLevelMasterList : TncLimitActionMaster[];
    tncLimitClaimSpecialActionMasterList : TncLimitActionMaster[];
    tncLimitActionMasterTotalRecords : number;
    tncLimitActionLevelMasterTotalRecords : number;
    tncLimitClaimSpecialActionMasterTotalRecords : number;
    benefitPossibleParents : BenefitPossibleParentsResponse[];
    tncDimensionsByHierarchy : TnCDimensionResponse[];
}

const initialState :LimitTypeMasterState = {
    limitTypeList : [],
    limitBasisList:[],
    limitUnitList : [],
    siMasterList:[],
    tncMasterList:[],
    tncDataById:null,
    tncTypeDropdownList:[],
    parentTncTypeDropdownList:[],
    limitTypeTotalRecords: 0,
    limitBasisTotalRecords: 0,
    limitUnitTotalRecords: 0,
    siMasterTotalRecords:0,
    tncMasterTotalRecords:0,
    totalRecords : 0,
    loading: false,
    eligibilityTypeMasterList:[],
    eligibilityTypeMasterTotalRecords:0,
    dimensionKeyMasterList:[],
    dimensionKeyMasterTotalRecords:0,
    hazardousActivityMasterList:[],
    hazardousActivityMasterTotalRecords:0,
    billingChargeGroupMasterList : [],
    billHeadMasterList : [],
    deductionReasonMasterList : [],
    billingChargeGroupMasterTotalRecords: 0,
    billHeadMasterTotalRecords:0,
    deductionReasonMasterTotalRecords: 0,
    tncBillHeadResponse : [],
    tnCDimensionResponse : [],
    parameterMasterList : [],
    parameterMasterTotalRecords : 0,
    procedureMasterList : [],
    procedureMasterTotalRecords : 0,
    procedureCategoryDropdownList : [],
    procedureMasterDataById:null,
    icdResponseList : [],
    cpt_hcpcs_ResponseList : [],
    icdResponseTotalRecords : 0,
    cpt_hcpcs_ResponseTotalRecords : 0,
    diseaseMasterList : [],
    diseaseMasterDataById : null,
    diseaseMasterTotalRecords : 0,
    ailmentProcedureMasterList : [],
    ailmentProcedureMasterDataById : null,
    ailmentProcedureMasterTotalRecords : 0,
    parameterMasterDropdown : [],
    parameterMasterDataById : null,
    tncMasterDropdown : [],
    tncLimitActionLevelDropDown : [],
    tncLimitActionStageDropDown : [],
    tncLimitClaimSpecialActionDropDown:[],
    tncLimitActionDropDown:[],
    benefitLimitMasterDataById : null,
    benefitRuleDataById : null,
    benefitLimitTreeResponse : [],
    operatorMasterList : [],
    operatorMasterTotalRecords : 0,
    tncLimitActionMasterList : [],
    tncLimitActionLevelMasterList : [],
    tncLimitClaimSpecialActionMasterList : [],
    tncLimitActionMasterTotalRecords :0,
    tncLimitActionLevelMasterTotalRecords : 0,
    tncLimitClaimSpecialActionMasterTotalRecords : 0,
    benefitPossibleParents : [],
    tncDimensionsByHierarchy:[],
};

// export const FetchLimitTypeMasterList = createAsyncThunk(
//     "api/LimitTypeMaster/GetAll",
//     async (payload:FetchLimitTypeMasterPayload, { rejectWithValue }) => {
//     //   const response = await fetchLimitTypeMasterAPI(payload);
//     const response = await fetchMasterAPI<LimitTypeMst>("/api/LimitTypeMaster/GetAll",payload);
  
//       if (!response.success) {
//         return rejectWithValue(response.error);
//       }
  
//       return response.data;
//     }
// );

export const createMasterThunk = <TResponse, TPayload>(
    actionType: string,
    url: string
  ) =>
    createAsyncThunk<
      ApiResponse<MasterListResponse<TResponse>>,
      TPayload,
      { rejectValue: string }
    >(
      actionType,
      async (payload, { rejectWithValue }) => {
        const response = await fetchMasterAPI<TResponse>(url, payload);
  
        if (!response.success) {
          return rejectWithValue(response.error ?? "Something went wrong");
        }
  
        return response.data;
    }
);

export const FetchLimitTypeMasterList =
  createMasterThunk<LimitTypeMst, FetchLimitTypeMasterPayload>(
    "api/LimitTypeMaster/GetAll",
    "/api/LimitTypeMaster/GetAll"
);

export const FetchLimitBasisMasterList =
  createMasterThunk<LimitBasisMst, FetchLimitTypeMasterPayload>(
    "api/LimitBasisMaster/GetAll",
    "/api/LimitBasisMaster/GetAll"
);

export const FetchLimitUnitMasterList =
  createMasterThunk<LimitUnitMst, FetchLimitTypeMasterPayload>(
    "api/LimitUnitMaster/GetAll",
    "/api/LimitUnitMaster/GetAll"
);

export const FetchSIMasterList =
  createMasterThunk<SIMaster, FetchLimitTypeMasterPayload>(
    "api/SIMaster/GetAll",
    "/api/SIMaster/GetAll"
);

export const FetchTnCMasterList =
  createMasterThunk<TnCMaster, FetchLimitTypeMasterPayload>(
    "api/TnCMaster/GetAll",
    "/api/TnCMaster/GetAll"
);
export const FetchEligibilityTypeMasterList =
  createMasterThunk<EligibilityTypeMaster, FetchLimitTypeMasterPayload>(
    "api/EligibilityTypeMaster/GetAll",
    "/api/EligibilityTypeMaster/GetAll"
);
export const FetchDimensionKeyMasterList =
  createMasterThunk<DimensionKeyMaster, FetchLimitTypeMasterPayload>(
    "api/DimensionKeyMaster/GetAll",
    "/api/DimensionKeyMaster/GetAll"
);
export const FetchHazardousActivityMasterList =
  createMasterThunk<hazardousActivityMaster, FetchLimitTypeMasterPayload>(
    "api/HazardousActivityMaster/GetAll",
    "/api/HazardousActivityMaster/GetAll"
);
export const FetchBillingChargeGroupMasterList =
  createMasterThunk<billingChargeGroupMaster, FetchLimitTypeMasterPayload>(
    "api/BillingChargeGroupMaster/GetAll",
    "/api/BillingChargeGroupMaster/GetAll"
);
export const FetchBillHeadMasterList =
  createMasterThunk<billHeadMaster, FetchLimitTypeMasterPayload>(
    "api/BillHeadMaster/GetAll",
    "/api/BillHeadMaster/GetAll"
);
export const FetchDeductionReasonMasterList =
  createMasterThunk<deductionReasonMaster, FetchLimitTypeMasterPayload>(
    "api/DeductionReasonMaster/GetAll",
    "/api/DeductionReasonMaster/GetAll"
);
export const FetchParameterMasterList =
  createMasterThunk<ParameterMaster, FetchLimitTypeMasterPayload>(
    "api/ParameterMaster/GetAll",
    "/api/ParameterMaster/GetAll"
);
export const FetchProcedureMasterList =
  createMasterThunk<ProcedureMaster, FetchLimitTypeMasterPayload>(
    "api/ProcedureMaster/GetAll",
    "/api/ProcedureMaster/GetAll"
);
export const FetchAllICDList =
  createMasterThunk<ICDResponse, FetchICDPayload>(
    "api/ProcedureMaster/GetAllICD",
    "/api/ProcedureMaster/GetAllICD"
);
export const FetchAllCPT_HCPCSList =
  createMasterThunk<CPT_HCPCS_Response, Fetch_CPT_HCPCS_Payload>(
    "api/ProcedureMaster/GetAllCPT_HCPCS",
    "/api/ProcedureMaster/GetAllCPT_HCPCS"
);
export const FetchDiseaseMasterList =
  createMasterThunk<DiseaseMaster, FetchLimitTypeMasterPayload>(
    "api/DiseaseMaster/GetAll",
    "/api/DiseaseMaster/GetAll"
);
export const FetchAilmentProcedureMasterList =
  createMasterThunk<AilmentProcedureMaster, FetchLimitTypeMasterPayload>(
    "api/AilmentProcedureMaster/GetAll",
    "/api/AilmentProcedureMaster/GetAll"
);
export const FetchOperatorMasterList =
  createMasterThunk<operatorMasterResponse, FetchLimitTypeMasterPayload>(
    "api/OperatorMaster/GetAll",
    "/api/OperatorMaster/GetAll"
);

export const FetchTncLimitActionMasterList =
  createMasterThunk<LimitTypeMst, FetchLimitTypeMasterPayload>(
    "api/TncLimitActionMaster/GetAll",
    "/api/TncLimitActionMaster/GetAll"
);

export const FetchTncLimitActionLevelMasterList =
  createMasterThunk<LimitTypeMst, FetchLimitTypeMasterPayload>(
    "api/TncLimitActionLevelMaster/GetAll",
    "/api/TncLimitActionLevelMaster/GetAll"
);

export const FetchTncLimitClaimSpecialActionMasterList =
  createMasterThunk<LimitTypeMst, FetchLimitTypeMasterPayload>(
    "api/TncLimitClaimSpecialActionMaster/GetAll",
    "/api/TncLimitClaimSpecialActionMaster/GetAll"
);

export const FetchTnCTypeDropDownList = createAsyncThunk( 
    "api/TnCMaster/GetTnCTypeDropdown", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<TnCTypeDropdown[]>( "/api/TnCMaster/GetTnCTypeDropdown" ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchTnCMasterDropDownList = createAsyncThunk( 
    "api/TnCMaster/GetTnCDropdown", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<ParentTnCDropdown[]>( "/api/TnCMaster/GetTnCDropdown" ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchParentTnCDropDownList = createAsyncThunk( 
    "api/TnCMaster/GetParentTnCDropdown", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<ParentTnCDropdown[]>( "/api/TnCMaster/GetParentTnCDropdown" ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);
export const FetchTnCDataById = createAsyncThunk( 
    "api/TnCMaster/GetById", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<TnCMaster>( `/api/TnCMaster/GetById?Id=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);
export const FetchTnCDimensionDataById = createAsyncThunk( 
    "api/TnCDimensionMaster/GetAll", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<TnCMaster>( `/api/TnCDimensionMaster/GetAll?TncId=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchTncDimensionsByHierarchy = createAsyncThunk( 
    "api/TnCDimensionMaster/GetTncDimensionsByHierarchy", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<TnCDimensionResponse>( `/api/TnCDimensionMaster/GetTncDimensionsByHierarchy?TncId=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);
export const FetchTnCBillHeadDataById = createAsyncThunk( 
    "api/TnCBillHeadMaster/GetAll", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<TnCMaster>( `/api/TnCBillHeadMaster/GetAll?TncId=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchProcedureCategoryDropDownList = createAsyncThunk( 
    "api/ProcedureMaster/GetProcedureCategoryDropdown", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<ProcedureCategoryDropdown[]>( "/api/ProcedureMaster/GetProcedureCategoryDropdown" ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchProcedureMasterDataById = createAsyncThunk( 
    "api/ProcedureMaster/GetById", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<ProcedureMaster>( `/api/ProcedureMaster/GetById?Id=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);
export const FetchDiseaseMasterDataById = createAsyncThunk( 
    "api/DiseaseMaster/GetById", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<DiseaseMaster>( `/api/DiseaseMaster/GetById?Id=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);
export const FetchAilmentProcedureMasterDataById = createAsyncThunk( 
    "api/AilmentProcedureMaster/GetById", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<AilmentProcedureMaster>( `/api/AilmentProcedureMaster/GetById?Id=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchParameterDropDownList = createAsyncThunk( 
    "api/ParameterMaster/GetParameterDropdown", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<ParameterMasterDropdown[]>( "/api/ParameterMaster/GetParameterDropdown" ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchParameterDataById = createAsyncThunk( 
    "api/ParameterMaster/GetParameterById", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<ParameterMaster>( `/api/ParameterMaster/GetParameterById?Id=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchTncLimitActionLevelDropDownList = createAsyncThunk( 
    "api/TnCMaster/GetTncLimitActionLevelDropDown", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<TncLimitActionLevelDropDown[]>( "/api/TnCMaster/GetTncLimitActionLevelDropDown" ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchGetTncLimitActionStageDropDownList = createAsyncThunk( 
    "api/TnCMaster/GetTncLimitActionStageDropDown", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<TncLimitActionStageDropDown[]>( "/api/TnCMaster/GetTncLimitActionStageDropDown" ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchGetTncLimitClaimSpecialActionDropDownList = createAsyncThunk( 
    "api/TnCMaster/GetTncLimitClaimSpecialActionDropDown", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<TncLimitClaimSpecialActionDropDown[]>( "/api/TnCMaster/GetTncLimitClaimSpecialActionDropDown" ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);
export const FetchGetTncLimitActionDropDownList = createAsyncThunk( 
    "api/TnCMaster/GetTncLimitActionDropDown", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<TncLimitActionDropDown[]>( "/api/TnCMaster/GetTncLimitActionDropDown" ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchBenefitLimitDataById = createAsyncThunk( 
    "api/BenefitLimitMaster/GetById", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<BenefitLimitMaster>( `/api/BenefitLimitMaster/GetById?Id=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);
export const FetchBenefitRuleDataById = createAsyncThunk( 
    "api/BenefitLimitMaster/GetByBenefitRuleId", 
    async (Id:string, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<BenefitLimitMaster>( `/api/BenefitLimitMaster/GetByBenefitRuleId?Id=${Id}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchBenefitLimitTree = createAsyncThunk( 
    "api/BenefitLimitMaster/GetBenefitLimitTree", 
    async (_, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<BenefitLimitTreeResponse[]>( `/api/BenefitLimitMaster/GetBenefitLimitTree` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);

export const FetchBenefitPossibleParents = createAsyncThunk( 
    "api/BenefitLimitMaster/GetPossibleParents", 
    async ({
        BenefitLimitId,
        nodeId,
    }: {
        BenefitLimitId: string;
        nodeId: string;
    }, { rejectWithValue }) => { 
        const response = await fetchDropDownAPI<BenefitPossibleParentsResponse>( `/api/BenefitLimitMaster/GetPossibleParents?BenefitLimitId=${BenefitLimitId}&nodeId=${nodeId}` ); 
        if (!response.success) { 
            return rejectWithValue(response.error ?? "Something went wrong"); 
        } 
        return response.data; 
    } 
);


const LimitTypeMasterAction = createSlice({
    name: "LimitTypeMasterAction",
    initialState,
    reducers: {
        setbenefitLimitMasterDataById : (state,action)=>{
            state.benefitLimitMasterDataById = action.payload
        },
        setBenefitRuleDataById : (state,action)=>{
            state.benefitRuleDataById = action.payload
        },
        setBenefitPossibleParents : (state,action) =>{
            state.benefitPossibleParents = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(FetchLimitTypeMasterList.pending, (state) => {
                state.loading = true;
                // state.error = undefined;
            })
            .addCase(
                FetchLimitTypeMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.limitTypeList = action.payload.responseObject.data;
                    state.limitTypeTotalRecords = action.payload.responseObject.totalCount;
            }
            )
            .addCase(FetchLimitTypeMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            
            .addCase(FetchLimitBasisMasterList.pending, (state) => {
                state.loading = true;
                // state.error = undefined;
            })
            .addCase(
                FetchLimitBasisMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.limitBasisList = action.payload.responseObject.data;
                    state.limitBasisTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchLimitBasisMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchLimitUnitMasterList.pending, (state) => {
                state.loading = true;
                // state.error = undefined;
            })
            .addCase(
                FetchLimitUnitMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.limitUnitList = action.payload.responseObject.data;
                    state.limitUnitTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchLimitUnitMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchSIMasterList.pending, (state) => {
                state.loading = true;
                // state.error = undefined;
            })
            .addCase(
                FetchSIMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.siMasterList = action.payload.responseObject.data;
                    state.siMasterTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchSIMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTnCMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                FetchTnCMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.tncMasterList = action.payload.responseObject.data;
                    state.tncMasterTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchTnCMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTnCTypeDropDownList.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                FetchTnCTypeDropDownList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.tncTypeDropdownList = action.payload.responseObject;
                }
            )
            .addCase(FetchTnCTypeDropDownList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchParentTnCDropDownList.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                FetchParentTnCDropDownList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.parentTncTypeDropdownList = action.payload.responseObject;
                }
            )
            .addCase(FetchParentTnCDropDownList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchEligibilityTypeMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                FetchEligibilityTypeMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.eligibilityTypeMasterList = action.payload.responseObject.data;
                    state.eligibilityTypeMasterTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchEligibilityTypeMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchDimensionKeyMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                FetchDimensionKeyMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.dimensionKeyMasterList = action.payload.responseObject.data;
                    state.dimensionKeyMasterTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchDimensionKeyMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchHazardousActivityMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                FetchHazardousActivityMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.hazardousActivityMasterList = action.payload.responseObject.data;
                    state.hazardousActivityMasterTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchHazardousActivityMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchBillingChargeGroupMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                FetchBillingChargeGroupMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.billingChargeGroupMasterList = action.payload.responseObject.data;
                    state.billingChargeGroupMasterTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchBillingChargeGroupMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchBillHeadMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                FetchBillHeadMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.billHeadMasterList = action.payload.responseObject.data;
                    state.billHeadMasterTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchBillHeadMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchDeductionReasonMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                FetchDeductionReasonMasterList.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.deductionReasonMasterList = action.payload.responseObject.data;
                    state.deductionReasonMasterTotalRecords = action.payload.responseObject.totalCount;
                }
            )
            .addCase(FetchDeductionReasonMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTnCDataById.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTnCDataById.fulfilled, (state, action) => {
                state.loading = false;
                state.tncDataById = action.payload.responseObject;
            })
            .addCase(FetchTnCDataById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTnCDimensionDataById.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTnCDimensionDataById.fulfilled, (state, action) => {
                state.loading = false;
                state.tnCDimensionResponse = action.payload.responseObject;
            })
            .addCase(FetchTnCDimensionDataById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTncDimensionsByHierarchy.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTncDimensionsByHierarchy.fulfilled, (state, action) => {
                state.loading = false;
                state.tncDimensionsByHierarchy = action.payload.responseObject;
            })
            .addCase(FetchTncDimensionsByHierarchy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTnCBillHeadDataById.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTnCBillHeadDataById.fulfilled, (state, action) => {
                state.loading = false;
                state.tncBillHeadResponse = action.payload.responseObject;
            })
            .addCase(FetchTnCBillHeadDataById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchParameterMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchParameterMasterList.fulfilled, (state, action) => {
                state.loading = false;
                state.parameterMasterList = action.payload.responseObject.data;
                state.parameterMasterTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchParameterMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchProcedureMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchProcedureMasterList.fulfilled, (state, action) => {
                state.loading = false;
                state.procedureMasterList = action.payload.responseObject.data;
                state.procedureMasterTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchProcedureMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchProcedureCategoryDropDownList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchProcedureCategoryDropDownList.fulfilled, (state, action) => {
                state.loading = false;
                state.procedureCategoryDropdownList = action.payload.responseObject;
            })
            .addCase(FetchProcedureCategoryDropDownList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchProcedureMasterDataById.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchProcedureMasterDataById.fulfilled, (state, action) => {
                state.loading = false;
                state.procedureMasterDataById = action.payload.responseObject;
            })
            .addCase(FetchProcedureMasterDataById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchAllICDList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchAllICDList.fulfilled, (state, action) => {
                state.loading = false;
                state.icdResponseList = action.payload.responseObject.data;
                state.icdResponseTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchAllICDList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchAllCPT_HCPCSList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchAllCPT_HCPCSList.fulfilled, (state, action) => {
                state.loading = false;
                state.cpt_hcpcs_ResponseList = action.payload.responseObject.data;
                state.cpt_hcpcs_ResponseTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchAllCPT_HCPCSList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchDiseaseMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchDiseaseMasterList.fulfilled, (state, action) => {
                state.loading = false;
                state.diseaseMasterList = action.payload.responseObject.data;
                state.diseaseMasterTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchDiseaseMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchDiseaseMasterDataById.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchDiseaseMasterDataById.fulfilled, (state, action) => {
                state.loading = false;
                state.diseaseMasterDataById = action.payload.responseObject;
            })
            .addCase(FetchDiseaseMasterDataById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchAilmentProcedureMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchAilmentProcedureMasterList.fulfilled, (state, action) => {
                state.loading = false;
                state.ailmentProcedureMasterList = action.payload.responseObject.data;
                state.ailmentProcedureMasterTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchAilmentProcedureMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchAilmentProcedureMasterDataById.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchAilmentProcedureMasterDataById.fulfilled, (state, action) => {
                state.loading = false;
                state.ailmentProcedureMasterDataById = action.payload.responseObject;
            })
            .addCase(FetchAilmentProcedureMasterDataById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTnCMasterDropDownList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTnCMasterDropDownList.fulfilled, (state, action) => {
                state.loading = false;
                state.tncMasterDropdown = action.payload.responseObject;
            })
            .addCase(FetchTnCMasterDropDownList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchParameterDropDownList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchParameterDropDownList.fulfilled, (state, action) => {
                state.loading = false;
                state.parameterMasterDropdown = action.payload.responseObject;
            })
            .addCase(FetchParameterDropDownList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchParameterDataById.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchParameterDataById.fulfilled, (state, action) => {
                state.loading = false;
                state.parameterMasterDataById = action.payload.responseObject;
            })
            .addCase(FetchParameterDataById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTncLimitActionLevelDropDownList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTncLimitActionLevelDropDownList.fulfilled, (state, action) => {
                state.loading = false;
                state.tncLimitActionLevelDropDown = action.payload.responseObject;
            })
            .addCase(FetchTncLimitActionLevelDropDownList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchGetTncLimitActionStageDropDownList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchGetTncLimitActionStageDropDownList.fulfilled, (state, action) => {
                state.loading = false;
                state.tncLimitActionStageDropDown = action.payload.responseObject;
            })
            .addCase(FetchGetTncLimitActionStageDropDownList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchGetTncLimitClaimSpecialActionDropDownList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchGetTncLimitClaimSpecialActionDropDownList.fulfilled, (state, action) => {
                state.loading = false;
                state.tncLimitClaimSpecialActionDropDown = action.payload.responseObject;
            })
            .addCase(FetchGetTncLimitClaimSpecialActionDropDownList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchGetTncLimitActionDropDownList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchGetTncLimitActionDropDownList.fulfilled, (state, action) => {
                state.loading = false;
                state.tncLimitActionDropDown = action.payload.responseObject;
            })
            .addCase(FetchGetTncLimitActionDropDownList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchBenefitLimitDataById.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchBenefitLimitDataById.fulfilled, (state, action) => {
                state.loading = false;
                state.benefitLimitMasterDataById = action.payload.responseObject;
            })
            .addCase(FetchBenefitLimitDataById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchBenefitRuleDataById.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchBenefitRuleDataById.fulfilled, (state, action) => {
                state.loading = false;
                state.benefitRuleDataById = action.payload.responseObject;
            })
            .addCase(FetchBenefitRuleDataById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchBenefitLimitTree.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchBenefitLimitTree.fulfilled, (state, action) => {
                state.loading = false;
                state.benefitLimitTreeResponse = action.payload.responseObject;
            })
            .addCase(FetchBenefitLimitTree.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchOperatorMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchOperatorMasterList.fulfilled, (state, action) => {
                state.loading = false;
                state.operatorMasterList = action.payload.responseObject.data;
                state.operatorMasterTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchOperatorMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTncLimitActionMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTncLimitActionMasterList.fulfilled, (state, action) => {
                state.loading = false;
                state.tncLimitActionMasterList = action.payload.responseObject.data;
                state.tncLimitActionMasterTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchTncLimitActionMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTncLimitActionLevelMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTncLimitActionLevelMasterList.fulfilled, (state, action) => {
                state.loading = false;
                state.tncLimitActionLevelMasterList = action.payload.responseObject.data;
                state.tncLimitActionLevelMasterTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchTncLimitActionLevelMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchTncLimitClaimSpecialActionMasterList.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTncLimitClaimSpecialActionMasterList.fulfilled, (state, action) => {
                state.loading = false;
                state.tncLimitClaimSpecialActionMasterList = action.payload.responseObject.data;
                state.tncLimitClaimSpecialActionMasterTotalRecords = action.payload.responseObject.totalCount;
            })
            .addCase(FetchTncLimitClaimSpecialActionMasterList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(FetchBenefitPossibleParents.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchBenefitPossibleParents.fulfilled, (state, action) => {
                state.loading = false;
                state.benefitPossibleParents = action.payload.responseObject;
            })
            .addCase(FetchBenefitPossibleParents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            ;
      },
});

export const {setbenefitLimitMasterDataById,setBenefitRuleDataById,setBenefitPossibleParents } = LimitTypeMasterAction.actions;


export default LimitTypeMasterAction.reducer;