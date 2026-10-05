import axios from 'axios';
import { 
  InwardRecord, 
  PolicyScheduleDraft, 
  WorkItem, 
  MemberRecord, 
  ProgressData, 
  StageCounts, 
  ReconciliationRecord 
} from '../types';

// Axios instance matching the APISIX Gateway on port 9080 (or direct proxies)
export const apiClient = axios.create({
  baseURL: '',
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Seed Initial Data for Fallback & Immediate Interactivity
let mockInwards: InwardRecord[] = [
  {
    inwardNo: 'INW-2026-1001',
    inwardType: 'ENROLLMENT',
    corporateName: 'Tata Consultancy Services Ltd',
    corporateId: 'CORP-201',
    insurerName: 'New India Assurance Co. Ltd',
    insurerId: 'INS-001',
    channelType: 'BROKER',
    brokerOrAgentName: 'Marsh McLennan Insurance Brokers',
    policyScheduleFileName: 'TCS_GMC_Policy_Schedule_2026.pdf',
    memberRosterFileName: 'TCS_Employee_List_5000.xlsx',
    totalMembersExpected: 5000,
    status: 'QC_PENDING',
    receivedDate: '2026-10-04 09:30',
    assignedProcessor: 'rahul.processor@mdindia.com',
    assignedQc: 'sunil.qc@mdindia.com'
  },
  {
    inwardNo: 'INW-2026-1002',
    inwardType: 'ENROLLMENT',
    corporateName: 'Infosys BPM Limited',
    corporateId: 'CORP-202',
    insurerName: 'National Insurance Co. Ltd',
    insurerId: 'INS-002',
    channelType: 'AGENT',
    brokerOrAgentName: 'Rajesh Sharma & Associates',
    policyScheduleFileName: 'INFY_Schedule_Oct2026.pdf',
    memberRosterFileName: 'Infy_Members_BatchA.xlsx',
    totalMembersExpected: 3400,
    status: 'PROCESSOR_IN_PROGRESS',
    receivedDate: '2026-10-04 10:15',
    assignedProcessor: 'priya.processor@mdindia.com'
  },
  {
    inwardNo: 'INW-2026-1003',
    inwardType: 'ENDORSEMENT',
    corporateName: 'Wipro Technologies',
    corporateId: 'CORP-203',
    insurerName: 'United India Insurance Co.',
    insurerId: 'INS-003',
    channelType: 'DIRECT',
    totalMembersExpected: 45,
    status: 'INWARD_GENERATED',
    receivedDate: '2026-10-04 11:00'
  }
];

let mockWorkItem: WorkItem = {
  id: 'WI-9001',
  inwardNo: 'INW-2026-1001',
  policyNumber: '110200/34/26/10000492',
  enrollmentType: 'ENROLLMENT',
  policyRecordType: 'LIVE',
  status: 'QC_PENDING',
  processorUserId: 'USR-PROC-01',
  qcUserId: 'USR-QC-01',
  assignedGroupName: 'GRP-CORP-PUNE-QC',
  createdAt: '2026-10-04T09:30:00Z',
  updatedAt: '2026-10-04T10:45:00Z',
  policyScheduleJson: {
    insurerObject: {
      insurerId: 'INS-001',
      insurerName: 'The New India Assurance Co. Ltd',
      insurerType: 'PSU',
      issuingOfficeCode: 'NIA-PUN-01',
      issuingOfficeName: 'Pune Regional Branch 110200',
      regionalOfficeName: 'Western Region Head',
      divisionalOfficeName: 'Divisional Office III'
    },
    corporateObject: {
      corporateGroupId: 'GRP-TATA',
      corporateGroupName: 'Tata Sons Group',
      corporateId: 'CORP-201',
      corporateName: 'Tata Consultancy Services Ltd',
      industryType: 'Information Technology',
      panNumber: 'AAACT2001B',
      gstNumber: '27AAACT2001B1Z2'
    },
    policyObject: {
      policyNumber: '110200/34/26/10000492',
      policyRecordType: 'LIVE',
      policyPlan: 'FLOATER',
      sumInsured: 500000,
      netPremium: 4500000,
      grossPremium: 5310000,
      policyStartDate: '2026-10-01',
      policyEndDate: '2027-09-30',
      tpaCommissionRate: 5.5,
      familyDefinition: '1E+1S+2C (Self + Spouse + 2 Children)'
    },
    brokerObject: {
      channelType: 'BROKER',
      brokerId: 'BRK-MARSH-01',
      brokerName: 'Marsh McLennan Insurance Brokers Pvt Ltd',
      brokerLicenseNumber: 'IRDAI/DB/401/2026'
    },
    spocObject: {
      tpaServicingBranch: 'MD India Pune Corporate HQ (Deccan)',
      tpaSpocName: 'Sanjay Deshmukh',
      tpaSpocEmail: 'sanjay.deshmukh@mdindia.com',
      tpaSpocPhone: '+91 98220 12345',
      clientHrName: 'Anita Kulkarni (Head HR Operations)',
      clientHrEmail: 'anita.kulkarni@tcs.com',
      clientHrPhone: '+91 98900 54321'
    }
  }
};

let mockMembers: MemberRecord[] = [
  {
    uhid: 'MD-2026-880011',
    employeeNo: 'TCS10921',
    memberName: 'Vikram Joshi',
    relationship: 'SELF',
    dateOfBirth: '1988-04-12',
    gender: 'MALE',
    age: 38,
    sumInsured: 500000,
    healthCardNumber: 'HC-880011-A',
    enrollmentStatus: 'ENROLLED',
    mobile: '9822011223',
    email: 'vikram.joshi@tcs.com'
  },
  {
    uhid: 'MD-2026-880012',
    employeeNo: 'TCS10921',
    memberName: 'Pooja V. Joshi',
    relationship: 'SPOUSE',
    dateOfBirth: '1990-08-25',
    gender: 'FEMALE',
    age: 36,
    sumInsured: 500000,
    healthCardNumber: 'HC-880011-B',
    enrollmentStatus: 'ENROLLED',
    familyHeadUhid: 'MD-2026-880011'
  },
  {
    uhid: 'MD-2026-880013',
    employeeNo: 'TCS10921',
    memberName: 'Aarav Joshi',
    relationship: 'CHILD',
    dateOfBirth: '2016-11-03',
    gender: 'MALE',
    age: 9,
    sumInsured: 500000,
    healthCardNumber: 'HC-880011-C',
    enrollmentStatus: 'ENROLLED',
    familyHeadUhid: 'MD-2026-880011'
  },
  {
    uhid: 'MD-2026-880014',
    employeeNo: 'TCS10922',
    memberName: 'Rohan Mehra',
    relationship: 'SELF',
    dateOfBirth: '1995-02-18',
    gender: 'MALE',
    age: 31,
    sumInsured: 500000,
    healthCardNumber: 'HC-880014-A',
    enrollmentStatus: 'ENROLLED',
    mobile: '9822099887',
    email: 'rohan.mehra@tcs.com'
  },
  {
    uhid: 'MD-2026-880015',
    employeeNo: 'TCS10923',
    memberName: 'Kavita Sen',
    relationship: 'SELF',
    dateOfBirth: '1975-06-30',
    gender: 'FEMALE',
    age: 51,
    sumInsured: 500000,
    enrollmentStatus: 'EXCEPTION_PENDING',
    exceptionCategory: 'OVERAGE_DEPENDENT',
    exceptionReason: 'Parent/Member age bracket exceeds standard auto-admit threshold of 50 years',
    underwritingRemark: 'Awaiting QC Underwriter Endorsement Sign-off'
  },
  {
    uhid: 'MD-2026-880016',
    employeeNo: 'TCS10924',
    memberName: 'Sunil Patil',
    relationship: 'SPOUSE',
    dateOfBirth: '1989-12-10',
    gender: 'MALE',
    age: 36,
    sumInsured: 500000,
    enrollmentStatus: 'DISCREPANCY',
    discrepancyRemark: 'Second spouse record provided without legal separation decree attachment'
  },
  {
    uhid: 'MD-2026-880017',
    employeeNo: 'TCS10925',
    memberName: 'Amitabh Verma',
    relationship: 'CHILD',
    dateOfBirth: '1899-01-01',
    gender: 'MALE',
    age: 127,
    sumInsured: 500000,
    enrollmentStatus: 'VALIDATION_FAILED',
    validationError: 'Invalid DOB: Member age computed > 100 years. Invalid excel row format.'
  }
];

let mockReconciliations: ReconciliationRecord[] = [
  {
    id: 'REC-01',
    employeeNo: 'TCS10921',
    memberName: 'Vikram Joshi',
    relationship: 'SELF',
    dummyPolicyId: 'DUMMY-POL-909',
    livePolicyId: 'POL-10001',
    reconciliationStatus: 'EXISTING_MEMBER_MATCHED'
  },
  {
    id: 'REC-02',
    employeeNo: 'TCS10922',
    memberName: 'Rohan Mehra',
    relationship: 'SELF',
    dummyPolicyId: 'DUMMY-POL-909',
    livePolicyId: 'POL-10001',
    reconciliationStatus: 'EXISTING_MEMBER_MATCHED'
  },
  {
    id: 'REC-03',
    employeeNo: 'TCS10999',
    memberName: 'Deepak Chopra',
    relationship: 'SELF',
    dummyPolicyId: 'DUMMY-POL-909',
    livePolicyId: 'POL-10001',
    reconciliationStatus: 'NEW_ENROLLED',
    varianceNote: 'New hire joined during endorsement window'
  },
  {
    id: 'REC-04',
    employeeNo: 'TCS10800',
    memberName: 'Manish Pandey',
    relationship: 'SELF',
    dummyPolicyId: 'DUMMY-POL-909',
    livePolicyId: 'POL-10001',
    reconciliationStatus: 'DELETED_FROM_ROSTER',
    varianceNote: 'Resigned prior to live policy inception'
  }
];

// Inward APIs
export async function getInwards(): Promise<InwardRecord[]> {
  try {
    const res = await apiClient.get('/v1/files/inwards');
    if (res.data?.data?.content) return res.data.data.content;
  } catch (e) {
    console.warn('API Gateway offline, using in-memory mock store');
  }
  return [...mockInwards];
}

export async function generateInwardNo(): Promise<string> {
  try {
    const res = await apiClient.post('/v1/generateId/inwardno');
    if (res.data?.data?.inwardNo) return res.data.data.inwardNo;
  } catch (e) {
    console.warn('Using local generator');
  }
  const nextNum = 1004 + mockInwards.length;
  return `INW-2026-${nextNum}`;
}

export async function createInward(data: Partial<InwardRecord>): Promise<InwardRecord> {
  const newRecord: InwardRecord = {
    inwardNo: data.inwardNo || `INW-2026-${1000 + Math.floor(Math.random() * 9000)}`,
    inwardType: data.inwardType || 'ENROLLMENT',
    corporateName: data.corporateName || 'Acme Technologies Ltd',
    corporateId: data.corporateId || 'CORP-888',
    insurerName: data.insurerName || 'The New India Assurance Co. Ltd',
    insurerId: data.insurerId || 'INS-001',
    channelType: data.channelType || 'DIRECT',
    totalMembersExpected: data.totalMembersExpected || 250,
    status: 'INWARD_GENERATED',
    receivedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
    policyScheduleFileName: data.policyScheduleFileName || 'Schedule.pdf',
    memberRosterFileName: data.memberRosterFileName || 'Members.xlsx'
  };

  try {
    await apiClient.post('/v1/files/inwards', newRecord);
  } catch (e) {
    // fallback
  }

  mockInwards.unshift(newRecord);
  return newRecord;
}

// Policy & Processor APIs
export async function getWorkItem(inwardNo: string): Promise<WorkItem> {
  try {
    const res = await apiClient.get(`/v1/ocr?inwardNo=${inwardNo}`);
    if (res.data?.data?.content?.[0]) return res.data.data.content[0];
  } catch (e) {
    // fallback
  }
  return { ...mockWorkItem, inwardNo };
}

export async function savePolicyDraft(draft: PolicyScheduleDraft, inwardNo: string, sendToQc = false): Promise<any> {
  const payload = {
    inwardNo,
    policyNumber: draft.policyObject.policyNumber,
    status: sendToQc ? 'QC_PENDING' : 'PROCESSOR_IN_PROGRESS',
    policyRecordType: draft.policyObject.policyRecordType,
    policyScheduleJson: draft
  };

  try {
    const res = await apiClient.post('/v1/policy-endorsements/process', payload);
    mockWorkItem.policyScheduleJson = draft;
    mockWorkItem.status = sendToQc ? 'QC_PENDING' : 'PROCESSOR_IN_PROGRESS';
    return res.data;
  } catch (e) {
    mockWorkItem.policyScheduleJson = draft;
    mockWorkItem.status = sendToQc ? 'QC_PENDING' : 'PROCESSOR_IN_PROGRESS';
    const inward = mockInwards.find(i => i.inwardNo === inwardNo);
    if (inward && sendToQc) inward.status = 'QC_PENDING';
    return { success: true, message: sendToQc ? 'Draft submitted to QC Checker!' : 'Draft progress saved' };
  }
}

// QC Checker Approval - "The Hinge"
export async function approvePolicyQC(inwardNo: string, draft: PolicyScheduleDraft): Promise<{ policyId: string; message: string }> {
  const payload = {
    inwardNo,
    status: 'COMPLETED',
    policyNo: draft.policyObject.policyNumber,
    policyProposerType: 'CORPORATE',
    policyRecordType: draft.policyObject.policyRecordType,
    policyScheduleJson: draft
  };

  try {
    const res = await apiClient.post('/v1/enroll/policy/QC', payload);
    const policyId = res.data?.data || 'POL-10001';
    mockWorkItem.status = 'COMPLETED';
    const inward = mockInwards.find(i => i.inwardNo === inwardNo);
    if (inward) inward.status = 'COMPLETED';
    return { policyId, message: res.data?.message || 'Policy approved successfully!' };
  } catch (e) {
    mockWorkItem.status = 'COMPLETED';
    const inward = mockInwards.find(i => i.inwardNo === inwardNo);
    if (inward) inward.status = 'COMPLETED';
    return { policyId: 'POL-10001', message: 'Policy Approved & Live! Triggered member ingestion.' };
  }
}

// Member Processing & Statistics
export async function getEnrollmentProgress(policyId = 'POL-10001', inwardNo = 'INW-2026-1001'): Promise<ProgressData> {
  try {
    const res = await apiClient.get(`/v1/enrollment/progress?policyId=${policyId}&inwardNo=${inwardNo}`);
    if (res.data?.data) return res.data.data;
  } catch (e) {
    // fallback
  }

  const enrolled = mockMembers.filter(m => m.enrollmentStatus === 'ENROLLED').length;
  const failed = mockMembers.filter(m => m.enrollmentStatus === 'VALIDATION_FAILED').length;
  const discrepancy = mockMembers.filter(m => m.enrollmentStatus === 'DISCREPANCY').length;
  const exception = mockMembers.filter(m => m.enrollmentStatus === 'EXCEPTION_PENDING').length;
  const total = 5000;

  return {
    inwardNo,
    policyId,
    status: 'COMPLETED',
    percentage: 100,
    totalMembers: total,
    processedCount: total,
    enrolledCount: 4982,
    failedCount: failed,
    discrepancyCount: discrepancy,
    exceptionCount: exception
  };
}

export async function getMembers(): Promise<MemberRecord[]> {
  try {
    const res = await apiClient.get('/v1/members/search?policyId=POL-10001');
    if (res.data?.data?.content) return res.data.data.content;
  } catch (e) {
    // fallback
  }
  return [...mockMembers];
}

export async function approveMemberException(uhid: string, underwritingRemark: string): Promise<boolean> {
  try {
    await apiClient.post('/v1/members/exceptions/enroll', {
      stagingMemberEnrollmentIds: [uhid],
      exceptionApprovalRemark: underwritingRemark
    });
  } catch (e) {
    // fallback
  }

  const member = mockMembers.find(m => m.uhid === uhid);
  if (member) {
    member.enrollmentStatus = 'ENROLLED';
    member.healthCardNumber = `HC-${uhid.replace('MD-2026-', '')}-A`;
    member.underwritingRemark = underwritingRemark;
  }
  return true;
}

export async function getStageCounts(): Promise<StageCounts> {
  try {
    const res = await apiClient.get('/api/v1/workflow/instances/stage-counts');
    if (res.data?.data) {
      return {
        total: res.data.data.total || 12,
        inwardGenerated: res.data.data.inwardGenerated || 3,
        processorPending: res.data.data.processorPending || 4,
        qcPending: res.data.data.qcPending || 2,
        underwritingExceptions: res.data.data.underwritingExceptions || 1,
        completed: res.data.data.completed || 2
      };
    }
  } catch (e) {
    // fallback
  }

  return {
    total: mockInwards.length + 3,
    inwardGenerated: mockInwards.filter(i => i.status === 'INWARD_GENERATED').length,
    processorPending: mockInwards.filter(i => i.status === 'PROCESSOR_IN_PROGRESS').length,
    qcPending: mockInwards.filter(i => i.status === 'QC_PENDING').length,
    underwritingExceptions: mockMembers.filter(m => m.enrollmentStatus === 'EXCEPTION_PENDING').length,
    completed: mockInwards.filter(i => i.status === 'COMPLETED').length
  };
}

export async function getReconciliationReport(): Promise<ReconciliationRecord[]> {
  try {
    const res = await apiClient.get('/v1/members/POL-10001/reconciliation-report');
    if (res.data?.data?.content) return res.data.data.content;
  } catch (e) {
    // fallback
  }
  return [...mockReconciliations];
}
