import { PaginationObject } from "../Broker/BrokerTypes";

export interface EmployeeContacts {
  Email: string;
  Mobile: string;
}
export interface EscalationLevel {
  escalationLevel: number;
  slaHours: number;
  employeeId: string;
  employeeName: string;
  designation: string;
  employeeCode: string;
  contacts: EmployeeContacts;
}
export interface CtcRecordMis {
  queryId: string;
  queryCode: string;
  queryName: string;
  departmentId: string;
  departmentName: string;
  tpaId: string;
  tpaName: string;
  tpaBranchId: string;
  tpaBranchName: string;
  levels: EscalationLevel[];
}

export interface TPAResponse {
  status: string;
  message: string;
  statusCode: number;
  pagination: PaginationObject;
  data: CtcRecordMis[];
}