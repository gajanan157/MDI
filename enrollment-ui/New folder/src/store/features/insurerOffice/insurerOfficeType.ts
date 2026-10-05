import { PaginationObject } from "../Broker/BrokerTypes";

export interface InsurerAddress {
  addressId: string;
  address: string;
  city: string;
  stateName: string;
  postalCode: string;
  countryCode?: string | null;
  addressStatus: string;
  addressUse?: string | null;
}

export interface InsurerOffice {
  id: string;
  name: string;
  code: string;
  insurerType: string;
  irdaiInsurerCode: string;
  contactEmail: string;
  contactPhone: string;
  brandName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  lastModifiedByUserId: string;
  address: InsurerAddress;
}
export interface InsurerOfficeResponse {
  statusCode: number;
  status: string;
  message: string;
  pagination: PaginationObject;
  data: InsurerOffice[];
}
