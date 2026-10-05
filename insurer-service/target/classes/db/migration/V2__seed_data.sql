-- Sample data for local development. Insurer and office ids match the ones already used by policies.
INSERT INTO insurers (insurer_id, legal_name, insurer_code, insurer_type, irdai_insurer_code, brand_name, description,
                      contact_email, contact_phone, pan, gstin, abdm_empanelled, is_active,
                      address_id, address, city, state_name, postal_code, country_code, address_status, address_use) VALUES
 ('INS-001', 'The New India Assurance Co. Ltd.',         'NIA',   'PSU',     'IRDAI-190', 'New India',    'Public sector general insurer', 'corporate@newindia.co.in',  '02222708100', 'AAACT3055K', '27AAACT3055K1ZC', TRUE,  TRUE, 'adr-ins-001', 'New India Centre, Cruickshank Road', 'Mumbai',  'MAHARASHTRA', '400001', 'IN', 'ACTIVE', 'registered'),
 ('INS-002', 'United India Insurance Co. Ltd.',          'UIIC',  'PSU',     'IRDAI-545', 'United India', 'Public sector general insurer', 'corporate@uiic.co.in',      '04428520161', 'AAACU0315C', '33AAACU0315C1ZP', TRUE,  TRUE, 'adr-ins-002', '24 Whites Road',                      'Chennai', 'TAMIL NADU',  '600014', 'IN', 'ACTIVE', 'registered'),
 ('INS-003', 'National Insurance Co. Ltd.',              'NIC',   'PSU',     'IRDAI-58',  'National',     'Public sector general insurer', 'corporate@nic.co.in',       '03322831705', 'AAACN9967E', '19AAACN9967E1ZY', TRUE,  TRUE, 'adr-ins-003', '3 Middleton Street',                  'Kolkata', 'WEST BENGAL', '700071', 'IN', 'ACTIVE', 'registered'),
 ('INS-004', 'Oriental Insurance Co. Ltd.',              'OIC',   'PSU',     'IRDAI-556', 'Oriental',     'Public sector general insurer', 'corporate@orientalinsurance.co.in', '01123279224', 'AAACO0038F', '07AAACO0038F1ZD', TRUE,  TRUE, 'adr-ins-004', 'Oriental House, Asaf Ali Road',       'New Delhi', 'DELHI',      '110002', 'IN', 'ACTIVE', 'registered'),
 ('INS-005', 'HDFC ERGO General Insurance Co. Ltd.',     'HERGO', 'PRIVATE', 'IRDAI-146', 'HDFC ERGO',    'Private general insurer',       'corporate@hdfcergo.com',    '02262346234', 'AABCL5045F', '27AABCL5045F1ZM', TRUE,  TRUE, 'adr-ins-005', '1st Floor, HDFC House, Backbay Reclamation', 'Mumbai', 'MAHARASHTRA', '400020', 'IN', 'ACTIVE', 'registered'),
 ('INS-006', 'ICICI Lombard General Insurance Co. Ltd.', 'ILGIC', 'PRIVATE', 'IRDAI-115', 'ICICI Lombard', 'Private general insurer',       'corporate@icicilombard.com', '02261961100', 'AAACI7904G', '27AAACI7904G1ZX', TRUE,  TRUE, 'adr-ins-006', 'ICICI Lombard House, Worli',          'Mumbai', 'MAHARASHTRA', '400025', 'IN', 'ACTIVE', 'registered');

INSERT INTO insurer_offices (insurer_office_id, insurer_id, office_code, office_name, office_type, superior_office_id,
                             underwriting_center, servicing_allocation_for, service_types, effective_from, effective_to,
                             address_id, address_type, address, city, state_name, postal_code, country_code, address_status) VALUES
 ('OFF-NIA-01',    'INS-001', '110000', 'NIA Mumbai Head Office',                'HO', NULL,            FALSE, 'both',      '[{"name":"mediclaim","label":"Mediclaim","enabled":true,"startDate":"2024-04-01","endDate":"2099-12-31"}]', '2024-04-01', '2099-12-31', 'adr-off-001', 'both', 'New India Centre',        'Mumbai',  'MAHARASHTRA', '400001', 'IN', 'ACTIVE'),
 ('OFF-NIA-RO-01', 'INS-001', '112200', 'NIA Pune Regional Office',              'RO', 'OFF-NIA-01',    FALSE, 'both',      '[]', '2024-04-01', '2099-12-31', 'adr-off-002', 'both', 'Bund Garden Road',        'Pune',    'MAHARASHTRA', '411001', 'IN', 'ACTIVE'),
 ('OFF-NIA-DO-01', 'INS-001', '112201', 'NIA Pune Divisional Office 1',          'DO', 'OFF-NIA-RO-01', FALSE, 'corporate', '[]', '2024-04-01', '2099-12-31', 'adr-off-003', 'both', 'Camp Area',              'Pune',    'MAHARASHTRA', '411001', 'IN', 'ACTIVE'),
 ('OFF-NIA-UO-01', 'INS-001', '112202', 'NIA Pune Camp Underwriting Office',     'UO', 'OFF-NIA-DO-01', TRUE,  'corporate', '[{"name":"mediclaim","label":"Mediclaim","enabled":true,"startDate":"2024-04-01","endDate":"2099-12-31"}]', '2024-04-01', '2099-12-31', 'adr-off-004', 'both', 'MG Road, Camp',         'Pune',    'MAHARASHTRA', '411001', 'IN', 'ACTIVE'),
 ('OFF-UII-UO-01', 'INS-002', '010200', 'UII Chennai Large Corporate Branch',    'UO', NULL,            TRUE,  'corporate', '[]', '2024-04-01', '2099-12-31', 'adr-off-005', 'both', 'Anna Salai',            'Chennai', 'TAMIL NADU',  '600002', 'IN', 'ACTIVE'),
 ('OFF-HDFC-UO-01','INS-005', 'HDFC-MUM-01', 'HDFC ERGO Corporate Underwriting Hub', 'UO', NULL,         TRUE,  'corporate', '[]', '2024-04-01', '2099-12-31', 'adr-off-006', 'both', 'Lower Parel',           'Mumbai',  'MAHARASHTRA', '400013', 'IN', 'ACTIVE');

INSERT INTO contact_roles (domain_id, domain_name, role_id, role_name) VALUES
 ('dom-claims',  'Claims',       'role-claims-head',    'Claims Head'),
 ('dom-claims',  'Claims',       'role-claims-exec',    'Claims Executive'),
 ('dom-uw',      'Underwriting', 'role-uw-head',        'Underwriting Head'),
 ('dom-uw',      'Underwriting', 'role-uw-exec',        'Underwriting Executive'),
 ('dom-service', 'Servicing',    'role-service-mgr',    'Service Manager');

INSERT INTO contact_persons (contact_person_id, tenant_id, insurer_id, prefix, first_name, middle_name, last_name, full_name, date_of_birth, gender, notes) VALUES
 ('cp-0001', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'INS-001', 'Mr',  'Anil',  '',  'Kulkarni', 'Anil Kulkarni', '1980-05-12', 'Male',   'Corporate claims point of contact'),
 ('cp-0002', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'INS-001', 'Mrs', 'Sunita', 'R', 'Joshi',    'Sunita R Joshi', '1984-09-30', 'Female', 'Underwriting desk');

INSERT INTO contact_channels (channel_id, contact_person_id, channel_type, channel_value, whatsapp_enabled) VALUES
 ('ch-0001', 'cp-0001', 'email',  'anil.kulkarni@newindia.co.in', FALSE),
 ('ch-0002', 'cp-0001', 'mobile', '9820010001',                   TRUE),
 ('ch-0003', 'cp-0002', 'email',  'sunita.joshi@newindia.co.in',  FALSE),
 ('ch-0004', 'cp-0002', 'mobile', '9820010002',                   FALSE);

INSERT INTO contact_assignments (assignment_id, contact_person_id, insurer_office_id, designation, department, priority, domain_id, role_id) VALUES
 ('as-0001', 'cp-0001', 'OFF-NIA-01',    'Senior Manager',  'Claims',       1, 'dom-claims', 'role-claims-head'),
 ('as-0002', 'cp-0002', 'OFF-NIA-UO-01', 'Deputy Manager',  'Underwriting', 1, 'dom-uw',     'role-uw-head');
