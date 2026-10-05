import type { HospitalRecord } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/hospitalData";

export interface ProviderListResponse {
  status: string;
  message: string;
  statusCode: number;
  data: HospitalRecord[];
}

