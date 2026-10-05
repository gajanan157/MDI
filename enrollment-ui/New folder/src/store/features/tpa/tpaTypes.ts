import { PaginationObject } from "../Broker/BrokerTypes";
export interface TPAAddress {
  addressId: string;
  tenantId: string;
  addressType: string;
  address: string;
  city: string;
  stateName: string;
  postalCode: string;
  addressStatus: string;
  landmark?: string | null;
  villageTown?: string | null;
  officeName?: string | null;
  deliveryStatus?: string | null;
  officeCode?: string | null;
}

export interface TPABranch {
  tpaBranchId: string;
  tpaName: string;
  tpaCode: string;
  parentBranchName: string;
  branchCode: string;
  branchName: string;
  address: TPAAddress;
}
export interface TPAResponse {
  status: string;
  message: string;
  statusCode: number;
  pagination: PaginationObject;
  data: TPABranch[];
}
