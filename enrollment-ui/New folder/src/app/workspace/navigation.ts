import { LayoutDashboard, Files, Hospital, ShieldCheck, Building2, Layers3, Users, Settings2 } from 'lucide-react';

export const navigation = [
  { id: 'enrolment', label: 'Enrolment system', icon: Files, items: [
    ['Overview', '/enrolment-system/dashboard'], ['Corporate enrolment', '/enrolment-system/corporate-enrolment'],
    ['Retail enrolment', '/enrolment-system/retail-inward'], ['Policy search', '/enrolment-system/policy-search'],
    ['Member data', '/enrolment-system/member-data'], ['E-cards', '/enrolment-system/e-cards'],
    ['E-card configuration', '/enrolment-system/e-card-configuration'], ['Assignment management', '/enrolment-system/assignment-management'],
    ['Inward register', '/inward-management/inward'], ['PSU inward', '/inward-management/psu-inward'],
  ] },
  { id: 'providers', label: 'Provider management', icon: Hospital, items: [
    ['Overview', '/provider-masters/dashboard'], ['Provider directory', '/provider-masters/providers'],
    ['Hospital empanelment', '/provider-masters/empanel'], ['Provider masters', '/provider-masters/masters'],
    ['SOC management', '/provider-masters/soc-management'], ['Excluded providers', '/provider-masters/excluded-hospitals'],
    ['ROHINI master', '/provider-masters/rohini-master'], ['IC provisioning', '/provider-masters/ic-provisioning'],
    ['IC provider codes', '/provider-masters/ic-provider-code-master'], ['Network mapping', '/provider-masters/ic-corporate-mapping'],
    ['Bank verification', '/provider-masters/bank-verification'],
  ] },
  { id: 'insurers', label: 'Insurer management', icon: ShieldCheck, items: [
    ['Insurer directory', '/insurer-management/insurer'], ['Insurer offices', '/insurer-management/office'],
    ['Office hierarchy', '/insurer-management/office-hierarchy'], ['Contact persons', '/insurer-management/contact-person'],
    ['Onboarding checklist', '/insurer-management/ic-onboarding-check-list'], ['Brand history', '/insurer-management/brand-history'],
    ['Mergers', '/insurer-management/merger'],
  ] },
  { id: 'tpa', label: 'TPA management', icon: Building2, items: [
    ['TPA profile', '/tpa-management/tpa'], ['Branch directory', '/tpa-management/branches'],
    ['Escalation matrix', '/tpa-management/escalation-matrix'],
  ] },
  { id: 'masters', label: 'Master management', icon: Layers3, items: [
    ['Master products', '/master-management/master-product'], ['Corporate groups', '/master-management/corporate-group'],
    ['Corporates', '/master-management/corporate'], ['Brokers', '/master-management/broker'], ['Agents', '/master-management/agent'],
    ['Benefit masters', '/benefits-configuration/benefits-master'], ['MBM dashboard', '/mbm-management/dashboard'],
    ['Policy benefits', '/mbm-management/policy-benefit'],
  ] },
  { id: 'users', label: 'User management', icon: Users, items: [['Users & access', '/user-management/users']] },
];
export const utilityNavigation = [
  { label: 'Admin dashboard', path: '/enrolment-system/admin-dashboard', icon: LayoutDashboard },
  { label: 'Settings', path: '/settings/general', icon: Settings2 },
];
export const allNavigation = navigation.flatMap(group => group.items.map(([label, path]) => ({ label, path, group: group.label })));
export const routeName = (path: string) => allNavigation.find(item => item.path === path)?.label ?? utilityNavigation.find(item => item.path === path)?.label ?? path.split('/').filter(Boolean).pop()?.replaceAll('-', ' ') ?? 'Overview';