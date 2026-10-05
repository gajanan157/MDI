// Type definitions for MD India Enrollment System

export type UserRole = 'PROCESSOR' | 'QC' | 'ADMIN';

export type PolicyRecordType = 'LIVE' | 'DUMMY';
export type PolicyProposerType = 'CORPORATE' | 'RETAIL';
export type ChannelType = 'BROKER' | 'AGENT' | 'DIRECT';

export type WorkItemStatus = 
  | 'INWARD_GENERATED'
  | 'PROCESSOR_ASSIGNED'
  | 'PROCESSOR_IN_PROGRESS'
  | 'QC_PENDING'
  | 'QC_REASSIGNED'
  | 'COMPLETED'
  | 'REJECTED';

export type EnrollmentStatus =
  | 'STAGING'
  | 'VALIDATION_FAILED'
  | 'DISCREPANCY'
  | 'EXCEPTION_PENDING'
  | 'ENROLLED'
  | 'CARD_GENERATED';

export type ReconciliationStatus =
  | 'EXISTING_MEMBER_MATCHED'
  | 'NEW_ENROLLED'
  | 'DELETED_FROM_ROSTER'
  | 'DATA_MISMATCH';

export interface InwardRecord {
  inwardNo: string;
  inwardType: 'ENROLLMENT' | 'ENDORSEMENT';
  corporateName: string;
  corporateId: string;
  insurerName: string;
  insurerId: string;
  channelType: ChannelType;
  brokerOrAgentName?: string;
  policyScheduleFileName?: string;
  memberRosterFileName?: string;
  totalMembersExpected: number;
  status: WorkItemStatus;
  receivedDate: string;
  assignedProcessor?: string;
  assignedQc?: string;
}

export interface PolicyScheduleDraft {
  insurerObject: {
    insurerId: string;
    insurerName: string;
    insurerType: 'PSU' | 'PRIVATE';
    issuingOfficeCode: string;
    issuingOfficeName: string;
    regionalOfficeName?: string;
    divisionalOfficeName?: string;
  };
  corporateObject: {
    corporateGroupId?: string;
    corporateGroupName?: string;
    corporateId: string;
    corporateName: string;
    industryType?: string;
    panNumber?: string;
    gstNumber?: string;
  };
  policyObject: {
    policyNumber: string;
    policyRecordType: PolicyRecordType;
    policyPlan: string;
    sumInsured: number;
    netPremium: number;
    grossPremium: number;
    policyStartDate: string;
    policyEndDate: string;
    tpaCommissionRate?: number;
    familyDefinition?: string;
  };
  brokerObject: {
    channelType: ChannelType;
    brokerId?: string;
    brokerName?: string;
    brokerLicenseNumber?: string;
    agentId?: string;
    agentName?: string;
    agentLicenseNumber?: string;
  };
  spocObject: {
    tpaServicingBranch: string;
    tpaSpocName: string;
    tpaSpocEmail: string;
    tpaSpocPhone: string;
    clientHrName: string;
    clientHrEmail: string;
    clientHrPhone: string;
  };
}

export interface WorkItem {
  id: string;
  inwardNo: string;
  policyNumber: string;
  enrollmentType: 'ENROLLMENT' | 'ENDORSEMENT';
  policyRecordType: PolicyRecordType;
  status: WorkItemStatus;
  processorUserId?: string;
  qcUserId?: string;
  assignedGroupName?: string;
  policyScheduleJson: PolicyScheduleDraft;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRecord {
  uhid: string;
  employeeNo: string;
  memberName: string;
  relationship: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  sumInsured: number;
  healthCardNumber?: string;
  enrollmentStatus: EnrollmentStatus;
  familyHeadUhid?: string;
  validationError?: string;
  discrepancyRemark?: string;
  exceptionCategory?: string;
  exceptionReason?: string;
  underwritingRemark?: string;
  mobile?: string;
  email?: string;
}

export interface ProgressData {
  inwardNo: string;
  policyId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  percentage: number;
  totalMembers: number;
  processedCount: number;
  enrolledCount: number;
  failedCount: number;
  discrepancyCount: number;
  exceptionCount: number;
}

export interface StageCounts {
  total: number;
  inwardGenerated: number;
  processorPending: number;
  qcPending: number;
  underwritingExceptions: number;
  completed: number;
}

export interface ReconciliationRecord {
  id: string;
  employeeNo: string;
  memberName: string;
  relationship: string;
  dummyPolicyId: string;
  livePolicyId: string;
  reconciliationStatus: ReconciliationStatus;
  varianceNote?: string;
}

export interface NotificationEvent {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  timestamp: string;
  read: boolean;
  relatedId?: string;
  category?: 'WORKFLOW' | 'POLICY' | 'MEMBER' | 'SYSTEM';
}
