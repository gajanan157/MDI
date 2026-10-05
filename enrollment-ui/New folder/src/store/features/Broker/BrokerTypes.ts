export interface BrokerData {
  brokerId: string;
  brokerCode: string;
  legalName: string;
  tradeName: string;
  irdaBrokerCode: string;
  brokerType: string;
  licenseNumber: string;
  licenseStatus: string;
  licenseValidFrom: string;
  licenseValidTo: string;
  pan: string;
  gstin: string;
  cin: string;
  headOfficeCity: string;
  websiteUrl: string;
  status: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  contactEmail: string[];
  contactPhone: string[];
  address: BrokerAddress;
  createdAt: string;
  updatedAt: string;
}

export interface BrokerAddress {
  brokerAddressId: string;
  address: string;
  locality: string;
  landmark: string;
  villageTown: string;
  city: string;
  district: string;
  stateName: string;
  stateCode: string;
  postalCode: string;
  countryCode: string;
  validFrom: string;
  validTo: string | null;
  tags: string[] | null;
  extendedAttributes: Record<string, any>;
  addressStatus: string;
}

export interface CorporateGroupData {
  corporateGroupId: string;
  groupCode: string;
  groupName: string;
  legalName: string;
  cin: string | null;
  pan: string | null;
  gstin: string | null;
  websiteUrl: string | null;
  status: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastModifications: any;
}

export interface AgentData {
  agentId: string;
  legalName: string;
  tradeName: string;
  agentType: string;
  agentCategory: string;
  irdaAgentCode: string;
  status: string;
  notes: string | null;

  licenseValidFrom: string;
  licenseValidTo: string;

  contactEmail: string[];
  contactPhone: string[];

  createdAt: string;
  updatedAt: string;
}


export interface CorporateAddress {
  address: string;
  locality: string;
  landmark: string;
  villageTown: string;
  city: string;
  district: string;
  stateName: string;
  stateCode: string;
  postalCode: string;
  validFrom: string;
  validTo: string;
  tags: string[];
  extendedAttributes: Record<string, any>;
}
export interface CorporateData {
  corporateId: string;

  legalName: string;
  tradeName: string;

  corporateType: string;
  corporateGroupId: string;

  pan: string;
  gstin: string;
  cin: string;

  industrySectorCode: string;
  sizeBand: string;
  employeeCount: number;

  billingCycle: string;
  riskTier: string;

  websiteUrl: string;

  tpaRelationshipType: string;
  onBoardedDate: string;

  status: string;

  effectiveFrom: string;
  effectiveTo: string;

  contactEmail: string[];
  contactPhone: string[];

  notes: string | null;

  address: CorporateAddress;

  createdAt?: string;
  updatedAt?: string;
}

export interface InwardData {
  inwardNo: string;
  category: string;
  subCategory: string;
  appName: string;
  receivedChannel: string;
  entityType: string;
  receivedAt: string;
  recordStatus: string;
}