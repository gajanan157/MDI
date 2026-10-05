import { PaginationObject } from "../Broker/BrokerTypes";

export interface MbmDashboardItem {
  id: string;
  requestId?: string;
  requestType?: string;
  corporateName?: string;
  policyNumber?: string;
  status?: string;
  createdDate?: string;
  createdBy?: string;
  [key: string]: any; // For dynamic fields
}


export interface MbmDashboardResponse {
  statusCode: number;
  status: string;
  message: string;
  pagination: PaginationObject;
  data: MbmDashboardItem[];
}

export interface FetchMbmDashboardParams {
  page?: number;
  size?: number;
  queryObj?: Record<string, any>;
}

export interface FetchMbmDashboardByIdParams {
  id: string;
}

