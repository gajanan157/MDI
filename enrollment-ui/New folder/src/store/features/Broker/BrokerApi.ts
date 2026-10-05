import { getApi, brokerApi, corporateApi, agentApi, inwardGenerateApi, policySearchApi, providerApi, memberData, postApi,documentApi, memberService, userService, parseService, eCardService, workFlow } from "@/app/api/apiService";

export const buildQueryParams = (
  payload: Record<string, any> = {},
  page?: number,
  size?: number
) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(payload).filter(
        ([key, value]) =>
          key !== "page" &&
          key !== "size" &&
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    )
  );

  query.append("page", String(page));
  query.append("size", String(size));

  return query.toString();
};
export const buildQueryParams2 = (payload: Record<string, any> = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    )
  );
  return query.toString();
};

export const fetchBrokerAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(brokerApi, `v1/brokers?${params.toString()}`);
  if (!res.success) {
    console.log("responce error", res)
  }
  return res?.data;
};


export const fetchCorporateGroupAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(corporateApi, `v1/corporate-group?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchCorporateAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(corporateApi, `v1/corporates?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchCorporateSectorDropdownAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(corporateApi, `v1/corporates/industry-sectors/dropdown?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchPolicySearchAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(policySearchApi, `v1/policies?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchPolicySearchDropdownAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(policySearchApi, `v1/policies/dropdown?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchPolicyListingApi = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(eCardService, `v1/ecards/templates-list?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchPolicyEcardTemplateApi = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const params = buildQueryParams2(payload);
  const res = await getApi(eCardService, `v1/ecards/templates/names?${params.toString()}`);
  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchCorporateInwardAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(policySearchApi, `v1/ocr?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchCorporateInwardAPIOFWorkFLow = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(workFlow, `/api/v1/workflow/enrollment?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchMemberDatadAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(memberData, `v1/member?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchMemberDataServiceAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(memberService, `v1/members/search?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchMemberDataDiscrepancy = async (
  payload?: Record<string, any>,
  policyId?: string | null
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;
  const params = buildQueryParams(payload, page, size);



  const res = await getApi(memberData, `v1/member/${policyId}/discrepancies?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchMemberDataExceptions = async (
  payload?: Record<string, any>,
  policyId?: string | null
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;
  const params = buildQueryParams(payload, page, size);
  const res = await getApi(memberData, `v1/member/${policyId}/exceptions/summary?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchMemberDataExceptionsOfMembers = async (
  payload?: Record<string, any>,
  policyId?: string | null
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  // const page = payload?.page && payload.page > 0 ? payload.page: 1;

  const size = payload?.size ?? 20;
  const params = buildQueryParams(payload, page, size);
  const res = await getApi(memberData, `v1/member/${policyId}/exceptions?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchMemberDataOfErrorLog = async (
  payload?: Record<string, any>,
  policyId?: string | null
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  // const page = payload?.page && payload.page > 0 ? payload.page: 1;

  const size = payload?.size ?? 20;
  const params = buildQueryParams(payload, page, size);
  const res = await getApi(memberService, `v1/members/${policyId}/reconciliation-report?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchMemberDataServiceAPIForEnd = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(memberData, `v1/member/endorsementDetail?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};

export const fetchOnboardPendingAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const params = buildQueryParams(payload);
  const res = await getApi(policySearchApi, `v1/ocr/onboarding-pending?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchOnboardResolveAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const params = buildQueryParams2(payload);
  const res = await postApi(policySearchApi, `v1/ocr/resolve-onboarding?${params.toString()}`, "");

  if (!res.success) {
    console.log("corporate response error", res);
  }
  return res?.data;
};
export const fetchMembarStatisticsAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const params = buildQueryParams2(payload);
  const res = await getApi(memberData, `v1/member/statistics?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }
  return res?.data;
};
export const fetchMembarStatisticsForEndorsemenrAPI = async (
  id?: string,
): Promise<any> => {
  const res = await getApi(memberData, `v1/member/endorsementStat/${id}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }
  return res?.data;
};

export const fetchCorporateInwardStatusCountAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(policySearchApi, `/v1/ocr/status-count?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};
export const fetchCorporateInwardStatusCountForAppUsersAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const params = buildQueryParams2(payload);

  const res = await getApi(workFlow, `/api/v1/workflow/instances/stage-counts?${params.toString()}`);

  if (!res.success) {
    console.log("corporate response error", res);
  }

  return res?.data;
};

export const fetchAgentAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(agentApi, `v1/agents?${params}`);

  if (!res.success) {
    console.log("agent response error", res);
  }

  return res?.data;
};
export const fetchInwardAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);

  const res = await getApi(inwardGenerateApi, `v1/files/inwards?${params}`);
  if (!res.success) {
    console.log("agent response error", res);
  }
  return res?.data;
};

export const fetchUserAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page : 1;
  const size = payload?.size ?? 20;
  const params = buildQueryParams(payload, page, size);
  const res = await getApi(userService, `api/v1/users?${params}`);
  if (!res.success) {
    console.log("agent response error", res);
  }
  return res?.data;
};
export const fetchInwardDownloadAPI = async (payload?: Record<string, any>): Promise<any> => {
  const page = payload?.page && payload.page > 0 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;
  const params = buildQueryParams(payload, page, size);
  const res = await getApi(inwardGenerateApi, `v1/files/inwards/export?${params}`);
  if (!res.success) { console.log("agent response error", res) }
  return res?.data;
};

export const approveMemberExceptionsAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const res = await postApi(
    memberService,
    `/v1/members/exceptions/enroll`,
    payload,
  );

  if (!res.success) {
    console.log("approve member exceptions response error", res);
  }

  return res?.data;
};


export const uploadDocumentAPI = async (
  file: File,
  inwardNo: string,
): Promise<any> => {
  const formData = new FormData();

  formData.append("s3BucketName", "enrollment");
  formData.append("s3SubBucketName", "ENROLLMENT");
  formData.append("inwardNo", inwardNo);
  formData.append("file", file);
  formData.append("documentType","UNDERWRITING_EXCEPTION")

  const res = await postApi(
    documentApi,
    "/v1/scan/files/upload",
    formData,
  );

  if (!res.success) {
    console.log("document upload response error", res);
  }

  return res;
};