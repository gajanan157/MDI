-- Sample data for local development. The TPA id and tenant id match the ones the web screens use by default.
INSERT INTO tpa (tpa_id, tenant_id, tpa_code, legal_name, cin, contact_email, contact_phone,
                 address_id, address_type, address, city, state_name, postal_code, address_status)
VALUES ('c603dd8f-3e9c-4281-923c-04e092f1366b', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', '005',
        'MD India Health Insurance TPA Ltd', 'U66010MH2000PLC000000', 'care@mdindia.com', '9820000001',
        'adr-tpa-001', 'both', 'Andheri East', 'Mumbai', 'MAHARASHTRA', '400069', 'ACTIVE');

INSERT INTO tpa_branches (tpa_branch_id, tpa_id, tenant_id, parent_branch_id, branch_code, branch_name,
                          contact_email, contact_phone, service_types, tags, record_status,
                          address_id, address_type, address, city, state_name, postal_code, address_status)
VALUES
 ('br-0001', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', NULL, '001', 'Mumbai Head Office',
  'mumbai@mdindia.com', '9820000011', 'Mediclaim,PIMS,Projects,Private IC', '', 'Active',
  'adr-br-0001', 'both', 'Andheri East', 'Mumbai', 'MAHARASHTRA', '400069', 'ACTIVE'),
 ('br-0002', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'br-0001', '002', 'Pune Branch',
  'pune@mdindia.com', '9820000012', 'Mediclaim,PIMS', '', 'Active',
  'adr-br-0002', 'both', 'Koregaon Park', 'Pune', 'MAHARASHTRA', '411001', 'ACTIVE'),
 ('br-0003', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'br-0001', '003', 'Delhi Branch',
  'delhi@mdindia.com', '9820000013', 'Mediclaim,Projects', '', 'Active',
  'adr-br-0003', 'both', 'Connaught Place', 'New Delhi', 'DELHI', '110001', 'ACTIVE'),
 ('br-0004', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'br-0001', '004', 'Bengaluru Branch',
  'bengaluru@mdindia.com', '9820000014', 'Mediclaim,Private IC', '', 'Active',
  'adr-br-0004', 'both', 'MG Road', 'Bengaluru', 'KARNATAKA', '560001', 'ACTIVE'),
 ('br-0005', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'br-0001', '005', 'Chennai Branch',
  'chennai@mdindia.com', '9820000015', 'PIMS', '', 'Inactive',
  'adr-br-0005', 'both', 'Anna Salai', 'Chennai', 'TAMIL NADU', '600002', 'ACTIVE');

INSERT INTO escalation_departments (department_id, department_name, active_flag) VALUES
 ('dep-claims', 'Claims', TRUE),
 ('dep-enrollment', 'Enrollment', TRUE),
 ('dep-service', 'Customer Service', TRUE);

INSERT INTO escalation_employees (employee_id, employee_code, employee_name, designation, email, mobile) VALUES
 ('emp-001', 'E001', 'Ram Chaughule',  'General Manager',     'ram.chaughule@mdindia.com', '9820001001'),
 ('emp-002', 'E002', 'Akshay More',    'Assistant Manager',   'akshay.more@mdindia.com',   '9820001002'),
 ('emp-003', 'E003', 'Kiran Patel',    'Senior Executive',    'kiran.patel@mdindia.com',   '9820001003'),
 ('emp-004', 'E004', 'Sanjay Deshmukh','Team Lead',           'sanjay.deshmukh@mdindia.com','9820001004'),
 ('emp-005', 'E005', 'Neha Sharma',    'Executive',           'neha.sharma@mdindia.com',   '9820001005');

INSERT INTO escalation_queries (query_id, query_code, query_name, department_id) VALUES
 ('q-claim-status', 'Q001', 'Claim status enquiry',     'dep-claims'),
 ('q-enroll',       'Q002', 'Enrollment correction',    'dep-enrollment'),
 ('q-card',         'Q003', 'E-card not received',      'dep-service');

INSERT INTO escalation_matrix (escalation_matrix_id, query_id, tpa_id, tpa_branch_id) VALUES
 ('mx-001', 'q-claim-status', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'br-0001'),
 ('mx-002', 'q-enroll',       'c603dd8f-3e9c-4281-923c-04e092f1366b', 'br-0001'),
 ('mx-003', 'q-card',         'c603dd8f-3e9c-4281-923c-04e092f1366b', 'br-0002');

INSERT INTO escalation_levels (escalation_matrix_id, escalation_level, sla_hours, employee_id, mobile, email) VALUES
 ('mx-001', 0, 4,  'emp-005', '9820001005', 'neha.sharma@mdindia.com'),
 ('mx-001', 1, 8,  'emp-003', '9820001003', 'kiran.patel@mdindia.com'),
 ('mx-001', 2, 24, 'emp-002', '9820001002', 'akshay.more@mdindia.com'),
 ('mx-002', 0, 8,  'emp-004', '9820001004', 'sanjay.deshmukh@mdindia.com'),
 ('mx-002', 1, 24, 'emp-001', '9820001001', 'ram.chaughule@mdindia.com'),
 ('mx-003', 0, 8,  'emp-003', '9820001003', 'kiran.patel@mdindia.com');
