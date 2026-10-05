import { PaginationObject } from "../Broker/BrokerTypes";
export interface City {
  officeName: string;
  city: string;
  postalCode: string;
  stateName: string;
}

export interface StateItem {
  stateName: string;
  stateCode: string;
}

export interface CityResponse {
  pagination: PaginationObject;
  data: City[];
}

export interface StateResponse {
  pagination: PaginationObject;
  data: StateItem[];
}

export interface FetchParams {
  size?: number | string;
  page?: number;
  queryObj?: Record<string, any>;
}
