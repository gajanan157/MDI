import { getApi, masterApi } from "@/app/api/apiService";
import { buildQueryParams } from "../Broker/BrokerApi";
export const fetchEscalationMatrixAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  const page = payload?.page && payload.page > 1 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  const params = buildQueryParams(payload, page, size);
  
  const res = await getApi(masterApi, `v1/escalation-matrix/groupedNew?${params.toString()}`);

  if (!res.success) {
   console.log("responce error",res)
  }

  return res.data;
};

export const fetchEscalationMatrixForDepertmentAPI = async (
): Promise<any> => {
  const res = await getApi(masterApi, `v1/escalation-matrix/departments/dropdown?tpa_department_active_flag=true`);

  if (!res.success) {
   console.log("responce error",res)
  }

  return res.data;
};


