import { MOCK_PROVIDERS_LIST, MOCK_INSURERS, MOCK_TPA_BRANCHES, MOCK_MASTER_PRODUCTS } from '@/services/mockDataService';
import { MOCK_INWARDS, MOCK_POLICIES, MOCK_CORPORATES, MOCK_CORPORATE_GROUPS, MOCK_BROKERS, MOCK_AGENTS, MOCK_USERS, MOCK_MEMBERS } from '@/services/mockEnrollmentData';

export type WorkspaceRecord = { id: string; name: string; reference: string; entity: string; type: string; location: string; status: string; updated: string; owner: string; members: number; email: string; fullPath?: string; note?: string };
export type ModuleConfig = { key: string; title: string; group: string; description: string; singular: string; nameLabel: string; entityLabel: string; typeLabel: string; records: WorkspaceRecord[]; statuses: string[] };
const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() - offset); return d.toISOString().slice(0, 10); };
const text = (value: unknown, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;
const record = (r: Partial<WorkspaceRecord> & { id: string; name: string }, i: number): WorkspaceRecord => ({
  updated: day(i % 7), owner: ['Pooja Deshmukh', 'Vikram Jadhav', 'Sunil Kothari'][i % 3], members: 0, ...r,
  id: text(r.id, `SAMPLE-${i + 1}`), name: text(r.name, text(r.reference, `Sample record ${i + 1}`)), reference: text(r.reference, r.id),
  entity: text(r.entity, 'MD India'), type: text(r.type, 'Corporate'), location: text(r.location, 'Pune'), status: text(r.status, 'Active'), email: text(r.email),
});
const nice = (v: string) => v.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
const enrolmentStatuses: Record<string, string> = { PROCESSOR_PENDING: 'Processing', QC_PENDING: 'QC review', ADMIN_PENDING: 'Pending', COMPLETED: 'Completed', REJECTED: 'Exception', REJECTED_INWARD: 'Exception' };
const enrolments = MOCK_INWARDS.map((r, i) => record({ id: r.id, name: r.corporateName, reference: r.policyNo, entity: r.insurerName.replace('Company Limited', 'Co. Ltd.'), type: r.enrollmentType.includes('ENDORSEMENT') ? 'Endorsement' : 'Fresh policy', status: enrolmentStatuses[r.status] ?? 'Pending', members: [1250, 840, 620, 2180, 450, 320, 960, 540][i % 8], note: r.latestRemark, fullPath: `/enrolment-system/corporate-enrolment/${r.id}` }, i));
const providers = MOCK_PROVIDERS_LIST.map((r, i) => record({ id: r.providerId, name: r.providerName, reference: r.providerCode, entity: r.networkSource === 'GIPSA_PPN' ? 'GIPSA PPN' : 'Direct network', type: 'Multi-speciality', location: `${r.city}, ${r.state}`, status: i === 5 ? 'Renewal due' : i === 6 ? 'In review' : 'Active', email: r.email, members: r.noOfBeds, fullPath: `/provider-masters/providers/${r.providerId}/overview` }, i));
const insurers = MOCK_INSURERS.map((r, i) => record({ id: r.id, name: r.insurerName, reference: r.insurerCode, entity: `IRDAI · ${r.irdaiRegNo}`, type: nice(r.companyType), location: r.headOfficeCity, email: r.email, fullPath: `/insurer-management/view-insurer/${r.id}` }, i));
const branches = MOCK_TPA_BRANCHES.map((r, i) => record({ id: r.id, name: r.branchName, reference: r.branchCode, entity: 'MD India Health Insurance TPA', type: r.isHeadOffice ? 'Head office' : 'Regional office', location: `${r.city}, ${r.state}`, fullPath: `/tpa-management/view-branch/${r.id}` }, i));
const products = MOCK_MASTER_PRODUCTS.map((r, i) => record({ id: r.id, name: r.productName, reference: r.productUin, entity: r.insurerName, type: nice(r.productType), status: r.status === 'APPROVED' ? 'Approved' : 'In review', fullPath: `/master-management/master-product/${r.id}` }, i));
const users = MOCK_USERS.map((r, i) => record({ id: r.id, name: r.name, reference: r.username, entity: r.department, type: nice(r.role.replace('corporate_enrolment_', '')), email: r.email }, i));
const policies = MOCK_POLICIES.map((r, i) => record({ id: r.policyId, name: r.policy.corporateName, reference: r.policyNumber, entity: r.policy.insurerName, type: 'Group health', members: r.policy.totalLivesInsured, note: `Sum insured: ₹${r.policy.policySumInsured.toLocaleString('en-IN')}` }, i));
const members = MOCK_MEMBERS.map((r, i) => record({ id: r.stagingMemberEnrollmentId, name: r.name, reference: r.uhid, entity: r.corporateEmployeeCode, type: nice(r.relationship), status: 'Enrolled', email: r.insuredMemberEmailId, note: `Sum insured: ₹${r.policySumInsured.toLocaleString('en-IN')}` }, i));
const corporates = MOCK_CORPORATES.map((r, i) => record({ id: r.corporateId, name: r.legalName, reference: r.corporateCode, entity: r.corporateGroupName, type: nice(r.corporateType), location: r.address.city, email: r.contactEmail[0], fullPath: `/master-management/view-corporate/${r.corporateId}` }, i));
const groups = MOCK_CORPORATE_GROUPS.map((r, i) => record({ id: r.corporateGroupId, name: r.groupName, reference: r.groupCode, entity: r.legalName, type: 'Corporate group', fullPath: `/master-management/view-corporate-group/${r.corporateGroupId}` }, i));
const brokers = MOCK_BROKERS.map((r, i) => record({ id: r.brokerId, name: r.legalName, reference: r.brokerCode, entity: r.irdaBrokerCode, type: 'Insurance broker', location: r.headOfficeCity, email: r.contactEmail[0], fullPath: `/master-management/view-broker/${r.brokerId}` }, i));
const agents = MOCK_AGENTS.map((r, i) => record({ id: r.agentId, name: r.legalName, reference: r.irdaAgentCode, entity: r.tradeName, type: nice(r.agentType), email: r.contactEmail[0], note: r.notes, fullPath: `/master-management/view-agent/${r.agentId}` }, i));
const config = (key: string, title: string, group: string, singular: string, records: WorkspaceRecord[], extra: Partial<ModuleConfig> = {}): ModuleConfig => ({ key, title, group, singular, records, nameLabel: 'Name', entityLabel: 'Organisation', typeLabel: 'Type', statuses: ['Active', 'In review', 'Inactive'], description: `${title} across your organisation.`, ...extra });
export const modules: Record<string, ModuleConfig> = {
  enrolments: config('enrolments', 'Corporate enrolment', 'Enrolment system', 'enrolment', enrolments, { description: 'Every policy batch, from inward to enrolment.', nameLabel: 'Corporate / policy', entityLabel: 'Insurer', typeLabel: 'Enrolment type', statuses: ['Pending', 'Processing', 'QC review', 'Completed', 'Exception'] }),
  retail: config('retail', 'Retail enrolment', 'Enrolment system', 'retail enrolment', members.slice(0, 6).map((r, i) => ({ ...r, id: `RET-${i + 101}`, reference: `RET/2026/${String(i + 101).padStart(5, '0')}`, entity: insurers[i % insurers.length].name, type: 'Individual health', status: i % 3 ? 'Processing' : 'Completed' })), { nameLabel: 'Policyholder', entityLabel: 'Insurer', statuses: ['Pending', 'Processing', 'QC review', 'Completed', 'Exception'], description: 'Individual and family policy enrolments.' }),
  providers: config('providers', 'Provider directory', 'Provider management', 'provider', providers, { nameLabel: 'Hospital / provider', entityLabel: 'Network', typeLabel: 'Speciality', statuses: ['Active', 'In review', 'Renewal due', 'Inactive'], description: 'A connected view of your healthcare network.' }),
  insurers: config('insurers', 'Insurer directory', 'Insurer management', 'insurer', insurers, { nameLabel: 'Insurer', entityLabel: 'Registration', typeLabel: 'Company type', description: 'Insurance partners and regulatory information.' }),
  branches: config('branches', 'Branch directory', 'TPA management', 'branch', branches, { nameLabel: 'Branch', entityLabel: 'TPA', typeLabel: 'Office type', description: 'Your regional offices, connected.' }),
  products: config('products', 'Master products', 'Master management', 'product', products, { nameLabel: 'Product / UIN', entityLabel: 'Insurer', typeLabel: 'Product type', statuses: ['Approved', 'In review', 'Inactive'], description: 'Health products, benefit structures and approvals.' }),
  users: config('users', 'Users & access', 'Administration', 'directory user', users, { nameLabel: 'Team member', entityLabel: 'Department', typeLabel: 'Role', description: 'Your operations team and directory assignments. Demo changes do not grant access.' }),
  policies: config('policies', 'Policy search', 'Enrolment system', 'policy', policies, { nameLabel: 'Corporate / policy', entityLabel: 'Insurer', typeLabel: 'Coverage', description: 'Find policies, coverage and insured members.' }),
  members: config('members', 'Member data', 'Enrolment system', 'member', members, { nameLabel: 'Member / UHID', entityLabel: 'Employee code', typeLabel: 'Relationship', statuses: ['Enrolled', 'Pending', 'Exception'], description: 'Member enrolment records and coverage details.' }),
  corporates: config('corporates', 'Corporates', 'Master management', 'corporate', corporates, { entityLabel: 'Corporate group', description: 'Corporate accounts and group relationships.' }),
  groups: config('groups', 'Corporate groups', 'Master management', 'corporate group', groups, { entityLabel: 'Legal entity' }),
  brokers: config('brokers', 'Broker directory', 'Master management', 'broker', brokers, { entityLabel: 'Registration' }),
  agents: config('agents', 'Agent directory', 'Master management', 'agent', agents, { entityLabel: 'Insurer' }),
  offices: config('offices', 'Insurer offices', 'Insurer management', 'office', insurers.map((r, i) => ({ ...r, id: `OFF-${i + 1}`, name: `${r.reference} · ${r.location} office`, entity: r.name, type: 'Regional office', fullPath: undefined })), { nameLabel: 'Office', entityLabel: 'Insurer' }),
};
export const moduleRoutes: Record<string, string> = {
  'enrolment-system/corporate-enrolment': 'enrolments', 'enrolment-system/retail-inward': 'retail',
  'enrolment-system/policy-search': 'policies', 'enrolment-system/member-data': 'members',
  'provider-masters/providers': 'providers', 'insurer-management/insurer': 'insurers',
  'insurer-management/office': 'offices', 'tpa-management/branches': 'branches',
  'master-management/master-product': 'products', 'master-management/corporate': 'corporates',
  'master-management/corporate-group': 'groups', 'master-management/broker': 'brokers',
  'master-management/agent': 'agents', 'user-management/users': 'users',
};
export const dashboardRoutes = ['home', 'enrolment-system/dashboard', 'provider-masters/dashboard', 'enrolment-system/admin-dashboard'];