import { PaginationObject } from "../Broker/BrokerTypes";

export interface ContactPerson {
  contactPersonId: string;
  tenantId: string;
  insurerId: string;
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  notes: string;
  tags: string[];
  designation:string
  department:string
  priority:string
  officeCode:string
  officeName:string
  assignmentId:string
  channels:channels[]
}
export interface channels{
  type:string
  value:string
}

export interface ContactPersonResponse {
  status: string;
  statusCode: number;
  message: string;
  pagination: PaginationObject;
  data: ContactPerson[];
}
