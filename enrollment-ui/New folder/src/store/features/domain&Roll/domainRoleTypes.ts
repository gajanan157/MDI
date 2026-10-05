import { PaginationObject } from "../Broker/BrokerTypes";

export interface RollDomainRes {
  domainId: string;
  domainName: string;
    roleId: string;
  roleName: string;
}

export interface TPAResponse {
  status: string;
  message: string;
  statusCode: number;
  pagination: PaginationObject;
  data: RollDomainRes[];
}