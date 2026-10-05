import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAgentAPI,
  fetchBrokerAPI,
  fetchCorporateAPI,
  fetchCorporateGroupAPI,
  fetchCorporateInwardAPI,
  fetchCorporateInwardStatusCountAPI,
  fetchCorporateSectorDropdownAPI,
  fetchInwardAPI,
  fetchMembarStatisticsAPI,
  fetchMembarStatisticsForEndorsemenrAPI,
  fetchMemberDatadAPI,
  fetchMemberDataDiscrepancy,
  fetchMemberDataExceptions,
  fetchMemberDataExceptionsOfMembers,
  fetchMemberDataServiceAPI,
  fetchMemberDataServiceAPIForEnd,
  fetchOnboardPendingAPI,
  fetchOnboardResolveAPI,
  fetchPolicyEcardTemplateApi,
  fetchPolicyListingApi,
  fetchPolicySearchAPI,
  fetchPolicySearchDropdownAPI,
  fetchUserAPI,
  approveMemberExceptionsAPI,
  uploadDocumentAPI,
  fetchMemberDataOfErrorLog,
  fetchCorporateInwardStatusCountForAppUsersAPI,
  fetchCorporateInwardAPIOFWorkFLow,
} from "./BrokerApi";
import {
  AgentData,
  BrokerData,
  CorporateData,
  CorporateGroupData,
  InwardData,
} from "./BrokerTypes";

interface BrokerState {
  brokerData: BrokerData[];
  corporateGroupData: CorporateGroupData[];
  agentData: AgentData[];
  corporateData: CorporateData[];
  inwardData: InwardData[];
  inwardNumberData: InwardData[];
  usersData: any[];
  corporateSectorDropdown: any[];
  corporateInwardData: any[];
  corporateInwardDataForWorkFLow: any[];
  onBoardingData: any[];
  statusCount: any;
  statusCountForAllUsers: any;
  policySearchData: any[];
  policySearchDropdown: any[];
  templateName: any[];
  templateList: any[];
  memberData: any[];
  memberDataForDiscrepancy: any[];
  memberDataForException: any[];
  errorLogAndRecanlaiton: any[];
  memberDataForExceptionMember: any[];
  memberDataForEnd: any;
  memberDataStatistics: any;
  memberDataStatisticsForEn: any;
  totalRecords: number;
  totalRecordsForException: number;
  totalRecordsForErrorLogAndRecanlation: number;
  totalRecordsForExceptionMember: number;
  totalRecordsForDiscrepancy: number;
  totalRecordsOfMemberData: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: BrokerState = {
  brokerData: [],
  corporateGroupData: [],
  corporateSectorDropdown: [],
  corporateInwardData: [],
  corporateInwardDataForWorkFLow: [],
  memberData: [],
  memberDataForDiscrepancy: [],
  memberDataForException: [],
  errorLogAndRecanlaiton: [],
  memberDataForExceptionMember: [],
  memberDataForEnd: {},
  onBoardingData: [],
  statusCount: {},
  statusCountForAllUsers: {},
  memberDataStatistics: {},
  memberDataStatisticsForEn: {},
  policySearchData: [],
  policySearchDropdown: [],
  templateName: [],
  templateList: [],
  agentData: [],
  inwardData: [],
  usersData: [],
  inwardNumberData: [],
  corporateData: [],
  totalRecords: 0,
  totalRecordsForException: 0,
  totalRecordsForErrorLogAndRecanlation: 0,
  totalRecordsForExceptionMember: 0,
  totalRecordsForDiscrepancy: 0,
  totalRecordsOfMemberData: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

export const fetchCorporateGroupDatas = createAsyncThunk(
  "corporate/fetchCorporateGroupDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchCorporateGroupAPI(finalPayload);
    return response;
  },
);
export const fetchCorporateDatas = createAsyncThunk(
  "corporate/fetchCorporateDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchCorporateAPI(finalPayload);
    return response;
  },
);

export const fetchBrokerDatas = createAsyncThunk(
  "broker/fetchBrokerDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchBrokerAPI(finalPayload);
    return response;
  },
);
export const fetchAgentDatas = createAsyncThunk(
  "agent/fetchAgentDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchAgentAPI(finalPayload);
    return response;
  },
);

export const fetchInwardDatas = createAsyncThunk(
  "inward/fetchInwardDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchInwardAPI(finalPayload);
    return response;
  },
);
export const fetchUsersData = createAsyncThunk(
  "users/fetchUsersDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchUserAPI(finalPayload);
    return response;
  },
);
export const fetchInwardDatasOnlyDropdown = createAsyncThunk(
  "inward/fetchInwardDatasDropdown",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchInwardAPI(finalPayload);
    return response;
  },
);
export const fetchCorporateSectorDropdown = createAsyncThunk(
  "inward/fetchCorporateSectorDropdowns",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchCorporateSectorDropdownAPI(finalPayload);
    return response;
  },
);
export const fetchPolicySearchData = createAsyncThunk(
  "inward/fetchPolicySearch",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchPolicySearchAPI(finalPayload);
    return response;
  },
);
export const fetchPolicySearchDropdownData = createAsyncThunk(
  "inward/fetchPolicySearchDropdown",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchPolicySearchDropdownAPI(finalPayload);
    return response;
  },
);
export const fetchPolicyTemplateListing = createAsyncThunk(
  "inward/fetchPolicyTempListing",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchPolicyListingApi(finalPayload);
    return response;
  },
);
export const fetchPolicyECardTempleteDropdown = createAsyncThunk(
  "inward/fetchPolicyECard",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      ...payload,
    };

    const response = await fetchPolicyEcardTemplateApi(finalPayload);
    return response;
  },
);
export const fetchCorporateInwardData = createAsyncThunk(
  "inward/fetchCorporateInwardDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchCorporateInwardAPI(finalPayload);
    return response;
  },
);
export const fetchCorporateInwardDataOfWork = createAsyncThunk(
  "inward/fetchCorporateInwardDataOfWorks",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchCorporateInwardAPIOFWorkFLow(finalPayload);
    return response;
  },
);
export const fetchOnBoardPendingData = createAsyncThunk(
  "inward/fetchOnBoardPendingDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchOnboardPendingAPI(finalPayload);
    return response;
  },
);
export const fetchMemberData = createAsyncThunk("memberdata/fetchMemberDatas",async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchMemberDatadAPI(finalPayload);
    return response;
  },
);
export const fetchMemberService = createAsyncThunk(
  "memberdata/fetchMemberService",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchMemberDataServiceAPI(finalPayload);
    return response;
  },
);
export const fetchMemberServiceForDiscrepancy = createAsyncThunk("memberdata/fetchMemberServiceForDiscrepancy",
  async ({payload,policyId}: {payload?: Record<string, any>;policyId: string|null;}) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchMemberDataDiscrepancy(finalPayload,policyId);
    return response;
  }
);

export const fetchMemberServiceForExceptions = createAsyncThunk("memberdata/fetchMemberServiceForExceptions",
  async ({payload,policyId, }: {payload?: Record<string, any>;policyId: string|null;}) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };
    const response = await fetchMemberDataExceptions(finalPayload,policyId);
    return response;
  }
);
export const fetchMemberServiceErrorlogAndRecancation = createAsyncThunk("memberdata/fetchMemberServiceErrorlogAndRecancations",
  async ({payload,policyId, }: {payload?: Record<string, any>;policyId: string|null;}) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };
    const response = await fetchMemberDataOfErrorLog(finalPayload,policyId);
    return response;
  }
);
export const fetchMemberServiceForExceptionsMembers = createAsyncThunk("memberdata/fetchMemberServiceForExceptionsmembers",
  async ({payload,policyId, }: {payload?: Record<string, any>;policyId: string|null;}) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };
    const response = await fetchMemberDataExceptionsOfMembers(finalPayload,policyId);
    return response;
  }
);
export const fetchMemberServiceEndorsement = createAsyncThunk(
  "memberdata/fetchMemberServiceEnd",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchMemberDataServiceAPIForEnd(finalPayload);
    return response;
  },
);
export const fetchOnBoardResolveData = createAsyncThunk(
  "inward/fetchOnBoardResolveDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      ...payload,
    };

    const response = await fetchOnboardResolveAPI(finalPayload);
    return response;
  },
);
export const fetchMemberDataStatistics = createAsyncThunk(
  "member/fetchMemberDatas",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      ...payload,
    };

    const response = await fetchMembarStatisticsAPI(finalPayload);
    return response;
  },
);
export const fetchMemberDataStatisticsEndorsement = createAsyncThunk(
  "member/fetchMemberDatasEn",
  async (payload?:string) => {

    const response = await fetchMembarStatisticsForEndorsemenrAPI(payload);
    return response;
  },
);
export const fetchCorporateInwardDataStatusCount = createAsyncThunk(
  "inward/fetchCorporateInwardDatasStatus",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchCorporateInwardStatusCountAPI(finalPayload);
    return response;
  },
);
export const fetchCorporateInwardDataForAllUser = createAsyncThunk(
  "inward/fetchCorporateInwardDataForAllUsers",
  async (payload?: Record<string, any>) => {
    const finalPayload = {
      ...payload,
    };

    const response = await fetchCorporateInwardStatusCountForAppUsersAPI(finalPayload);
    return response;
  },
);

export const approveMemberExceptions = createAsyncThunk(
  "approveMemberExceptions",
  async (payload?: Record<string, any>) => {
    const response = await approveMemberExceptionsAPI(payload);
    return response;
  },
);

export const uploadDocument = createAsyncThunk(
  "uploadDocument",
  async (
    payload: {
      file: File;
      inwardNo: string;
      documentType: 'UNDERWRITING_EXCEPTION'
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await uploadDocumentAPI(
        payload.file,
        payload.inwardNo,
        payload.documentType,
      );

      if (!response?.success) {
        return rejectWithValue(
          response?.message || "Document upload failed",
        );
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Document upload failed",
      );
    }
  },
);

const BrokerSlice = createSlice({
  name: "broker",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ================= BROKER =================
      .addCase(fetchBrokerDatas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrokerDatas.fulfilled, (state, action) => {
        const res = action.payload;
        state.brokerData = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage + 1;
        state.loading = false;
      })
      .addCase(fetchBrokerDatas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch brokers";
      })

      // ================= CORPORATE GROUP =================
      .addCase(fetchCorporateGroupDatas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCorporateGroupDatas.fulfilled, (state, action) => {
        const res = action.payload;
        state.corporateGroupData = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage + 1;
        state.loading = false;
      })
      .addCase(fetchCorporateGroupDatas.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch corporate groups";
      })
      // ================= CORPORATE =================
      .addCase(fetchCorporateDatas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCorporateDatas.fulfilled, (state, action) => {
        const res = action.payload;
        state.corporateData = res?.data ?? [];
        state.totalRecords = res?.pagination?.totalRecords ?? 0;
        state.totalPages = res?.pagination?.totalPages ?? 0;
        state.currentPage = (res?.pagination?.currentPage ?? 0) + 1;
        state.loading = false;
      })
      .addCase(fetchCorporateDatas.rejected, (state, action) => {
        state.loading = false;
        state.corporateData = state.corporateData ?? [];
        state.error =
          action.error.message || "Failed to fetch corporate groups";
      })

      // ================= AGENT =================
      .addCase(fetchAgentDatas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentDatas.fulfilled, (state, action) => {
        const res = action.payload;
        state.agentData = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage + 1;
        state.loading = false;
      })
      .addCase(fetchAgentDatas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch agents";
      })
      // ================= INWARD =================
      .addCase(fetchInwardDatas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInwardDatas.fulfilled, (state, action) => {
        const res = action.payload;

        state.inwardData = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchInwardDatas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //users
      .addCase(fetchUsersData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersData.fulfilled, (state, action) => {
        const res = action.payload;

        state.usersData = res?.data?.data;
        state.totalRecords = res?.data?.pagination?.totalRecords;
        state.totalPages = res?.data?.pagination?.totalPages;
        state.currentPage = res?.data?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchUsersData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })

      // ================= INWARD =================
      .addCase(fetchInwardDatasOnlyDropdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInwardDatasOnlyDropdown.fulfilled, (state, action) => {
        const res = action.payload;

        state.inwardNumberData = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchInwardDatasOnlyDropdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      // ================= Corporate Sector =================
      .addCase(fetchCorporateSectorDropdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCorporateSectorDropdown.fulfilled, (state, action) => {
        const res = action.payload;

        state.corporateSectorDropdown = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchCorporateSectorDropdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      // ================= Corporate Sector =================
      .addCase(fetchPolicySearchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicySearchData.fulfilled, (state, action) => {
        const res = action.payload;

        state.policySearchData = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchPolicySearchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      .addCase(fetchPolicySearchDropdownData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicySearchDropdownData.fulfilled, (state, action) => {
        const res = action.payload;
        state.policySearchDropdown = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchPolicySearchDropdownData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //template list with only name
      .addCase(fetchPolicyECardTempleteDropdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyECardTempleteDropdown.fulfilled, (state, action) => {
        const res = action.payload;
        state.templateName = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchPolicyECardTempleteDropdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //
      //template list 
      .addCase(fetchPolicyTemplateListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyTemplateListing.fulfilled, (state, action) => {
        const res = action.payload;
        state.templateList = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchPolicyTemplateListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //
      .addCase(fetchCorporateInwardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCorporateInwardData.fulfilled, (state, action) => {
        const res = action.payload;

        state.corporateInwardData = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchCorporateInwardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      // 
      .addCase(fetchCorporateInwardDataOfWork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCorporateInwardDataOfWork.fulfilled, (state, action) => {
        const res = action.payload;

        state.corporateInwardDataForWorkFLow = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchCorporateInwardDataOfWork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //new code
      .addCase(fetchCorporateInwardDataStatusCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCorporateInwardDataStatusCount.fulfilled,
        (state, action) => {
          const res = action.payload;

          state.statusCount = res?.data;
          state.totalRecords = res?.pagination?.totalRecords;
          state.totalPages = res?.pagination?.totalPages;
          state.currentPage = res?.pagination?.currentPage;
          state.loading = false;
        },
      )
      .addCase(
        fetchCorporateInwardDataStatusCount.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Failed to fetch inwards";
        },
      )
      // for all users stATUS COUNT
      .addCase(fetchCorporateInwardDataForAllUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCorporateInwardDataForAllUser.fulfilled,
        (state, action) => {
          const res = action.payload;

          state.statusCountForAllUsers = res?.data;
          state.totalRecords = res?.pagination?.totalRecords;
          state.totalPages = res?.pagination?.totalPages;
          state.currentPage = res?.pagination?.currentPage;
          state.loading = false;
        },
      )
      .addCase(
        fetchCorporateInwardDataForAllUser.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Failed to fetch inwards";
        },
      )
      // ================= OnBoardPendingData Inward =================
      .addCase(fetchOnBoardPendingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnBoardPendingData.fulfilled, (state, action) => {
        const res = action.payload;

        state.onBoardingData = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchOnBoardPendingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //member data fail
      .addCase(fetchMemberData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberData.fulfilled, (state, action) => {
        const res = action.payload;
        state.memberData = res?.data;
        state.totalRecordsOfMemberData = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchMemberData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //member data sucess
      .addCase(fetchMemberService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberService.fulfilled, (state, action) => {
        const res = action.payload;

        state.memberData = res?.data;
        state.totalRecordsOfMemberData = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchMemberService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //member data of Discrepancy
      .addCase(fetchMemberServiceForDiscrepancy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberServiceForDiscrepancy.fulfilled, (state, action) => {
        const res = action.payload;

        state.memberDataForDiscrepancy = res?.data;
        state.totalRecordsForDiscrepancy = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchMemberServiceForDiscrepancy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //member data of Exception
      .addCase(fetchMemberServiceForExceptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberServiceForExceptions.fulfilled, (state, action) => {
        const res = action.payload;

        state.memberDataForException = res?.data;
        state.totalRecordsForException = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchMemberServiceForExceptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //error log and recalation
      .addCase(fetchMemberServiceErrorlogAndRecancation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberServiceErrorlogAndRecancation.fulfilled, (state, action) => {
        const res = action.payload;

        state.errorLogAndRecanlaiton = res?.data;
        state.totalRecordsForErrorLogAndRecanlation = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchMemberServiceErrorlogAndRecancation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //member data of Exception
      .addCase(fetchMemberServiceForExceptionsMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberServiceForExceptionsMembers.fulfilled, (state, action) => {
        const res = action.payload;

        state.memberDataForExceptionMember = res?.data;
        state.totalRecordsForException = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchMemberServiceForExceptionsMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      //member data for endrosement
      .addCase(fetchMemberServiceEndorsement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberServiceEndorsement.fulfilled, (state, action) => {
        const res = action.payload;

        state.memberDataForEnd = res?.data;
        state.totalRecordsOfMemberData = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchMemberServiceEndorsement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      // Member Data Statistics
      .addCase(fetchMemberDataStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberDataStatistics.fulfilled, (state, action) => {
        const res = action.payload;

        state.memberDataStatistics = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchMemberDataStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      })
      // Member Data Statistics
      .addCase(fetchMemberDataStatisticsEndorsement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberDataStatisticsEndorsement.fulfilled, (state, action) => {
        const res = action.payload;

        state.memberDataStatisticsForEn = res?.data;
        state.totalRecords = res?.pagination?.totalRecords;
        state.totalPages = res?.pagination?.totalPages;
        state.currentPage = res?.pagination?.currentPage;
        state.loading = false;
      })
      .addCase(fetchMemberDataStatisticsEndorsement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch inwards";
      });
  },
});

export default BrokerSlice.reducer;
