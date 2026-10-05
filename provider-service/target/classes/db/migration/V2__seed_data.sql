-- Sample data for local development.
INSERT INTO provider_type_master (provider_type_id, tenant_id, type_code, class_code, subclass_code, display_name, provider_type_scope, sort_order) VALUES
 ('ptm-ambulance',   'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'AMBULANCE',            'SERVICE',      'TRANSPORT',   'Ambulance',               'Emergency transport',  1),
 ('ptm-blood-bank',  'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'BLOOD_BANK',           'SERVICE',      'BLOOD',       'Blood Bank',              'Blood and components', 2),
 ('ptm-clinic',      'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'CLINIC',               'FACILITY',     'OUTPATIENT',  'Clinic',                  'Outpatient care',      3),
 ('ptm-dental',      'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'DENTAL',               'FACILITY',     'DENTAL',      'Dental Centre',           'Dental care',          4),
 ('ptm-dialysis',    'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'DIALYSIS',             'FACILITY',     'RENAL',       'Dialysis Centre',         'Dialysis',             5),
 ('ptm-eye-care',    'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'EYE_CARE',             'FACILITY',     'EYE',         'Eye Care Centre',         'Eye care',             6),
 ('ptm-homecare',    'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'HOMECARE',             'SERVICE',      'HOME',        'Home Care',               'Care at home',         7),
 ('ptm-hospital',    'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'HOSPITAL',             'FACILITY',     'INPATIENT',   'Hospital',                'Inpatient care',       8),
 ('ptm-imaging',     'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'IMAGING',              'FACILITY',     'DIAGNOSTIC',  'Imaging Centre',          'Radiology and imaging',9),
 ('ptm-lab',         'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'LAB',                  'FACILITY',     'DIAGNOSTIC',  'Laboratory',              'Pathology',            10),
 ('ptm-onco',        'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'ONCO_CENTER',          'FACILITY',     'ONCOLOGY',    'Oncology Centre',         'Cancer care',          11),
 ('ptm-pharmacy',    'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'PHARMACY',             'FACILITY',     'PHARMACY',    'Pharmacy',                'Medicines',            12),
 ('ptm-pr-allied',   'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'PRACTITIONER_ALLIED',  'PRACTITIONER', 'ALLIED',      'Allied Practitioner',     'Allied health',        13),
 ('ptm-pr-dental',   'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'PRACTITIONER_DENTAL',  'PRACTITIONER', 'DENTAL',      'Dental Practitioner',     'Dentist',              14),
 ('ptm-pr-medical',  'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'PRACTITIONER_MEDICAL', 'PRACTITIONER', 'MEDICAL',     'Medical Practitioner',    'Doctor',               15),
 ('ptm-pr-nursing',  'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'PRACTITIONER_NURSING', 'PRACTITIONER', 'NURSING',     'Nursing Practitioner',    'Nurse',                16),
 ('ptm-pr-pharmacy', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'PRACTITIONER_PHARMACY','PRACTITIONER', 'PHARMACY',    'Pharmacy Practitioner',   'Pharmacist',           17),
 ('ptm-rehab',       'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'REHAB',                'FACILITY',     'REHAB',       'Rehabilitation Centre',   'Rehabilitation',       18),
 ('ptm-spec-group',  'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', 'SPECIALTY_GROUP',      'FACILITY',     'GROUP',       'Specialty Group',         'Group practice',       19);

INSERT INTO provider_lookups (lookup_type, lookup_id, lookup_name, sort_order) VALUES
 ('CLINICAL_SPECIALTY', 'spec-cardio',   'Cardiology', 1),
 ('CLINICAL_SPECIALTY', 'spec-ortho',    'Orthopaedics', 2),
 ('CLINICAL_SPECIALTY', 'spec-onco',     'Oncology', 3),
 ('CLINICAL_SPECIALTY', 'spec-neuro',    'Neurology', 4),
 ('CLINICAL_SPECIALTY', 'spec-paed',     'Paediatrics', 5),
 ('CLINICAL_SPECIALTY', 'spec-gynae',    'Obstetrics and Gynaecology', 6),
 ('CLINICAL_SPECIALTY', 'spec-genmed',   'General Medicine', 7),
 ('CLINICAL_SPECIALTY', 'spec-gensurg',  'General Surgery', 8),
 ('CLINICAL_SPECIALTY', 'spec-ent',      'ENT', 9),
 ('CLINICAL_SPECIALTY', 'spec-eye',      'Ophthalmology', 10),
 ('SYSTEM_OF_MEDICINE', 'som-allopathy', 'Allopathy', 1),
 ('SYSTEM_OF_MEDICINE', 'som-ayurveda',  'Ayurveda', 2),
 ('SYSTEM_OF_MEDICINE', 'som-homeo',     'Homeopathy', 3),
 ('SYSTEM_OF_MEDICINE', 'som-unani',     'Unani', 4),
 ('SYSTEM_OF_MEDICINE', 'som-siddha',    'Siddha', 5),
 ('BED_TYPE', 'bed-general',  'General Ward', 1),
 ('BED_TYPE', 'bed-semi',     'Semi-Private', 2),
 ('BED_TYPE', 'bed-private',  'Private', 3),
 ('BED_TYPE', 'bed-icu',      'ICU', 4),
 ('BED_TYPE', 'bed-nicu',     'NICU', 5),
 ('BED_TYPE', 'bed-hdu',      'HDU', 6),
 ('CONTACT_PERSON_ROLE', 'role-claims',  'Claims Coordinator', 1),
 ('CONTACT_PERSON_ROLE', 'role-billing', 'Billing Manager', 2),
 ('CONTACT_PERSON_ROLE', 'role-ms',      'Medical Superintendent', 3),
 ('CONTACT_PERSON_ROLE', 'role-mkt',     'Marketing Head', 4),
 ('CONTACT_PERSON_ROLE', 'role-admin',   'Administrator', 5);

INSERT INTO providers (provider_id, provider_code, provider_name, provider_type_id, provider_network_type, empanelment_source,
                       record_status, is_verified, ownership_type, day_care_flag, care_tier, internal_grade, owner_name, owner_designation,
                       owner_qualification, system_of_medicine_id, pan_no, pan_holder_name, website_url, telephone_no, mobile_no, email_id,
                       address_id, address, city, district, state_name, state_code, postal_code, location_type, address_status, no_of_beds, next_renewal_due_date) VALUES
 ('prv-0001', 'PRV000001', 'Sunrise Multispeciality Hospital',  'ptm-hospital', 'NETWORK',     'TPA',     'Active', TRUE,  'Private Trust', TRUE,  'TIER_1', 'A', 'Dr. Mahesh Kulkarni', 'Chairman',  'MS',   'som-allopathy', 'AAATS1234A', 'Sunrise Hospital Trust',  'https://sunrise-hospital.example', '02025551001', '9820020001', 'info@sunrise-hospital.example',
  'adr-prv-0001', '12 Law College Road',      'Pune',      'Pune',      'MAHARASHTRA', 'MH', '411004', 'URBAN', 'ACTIVE', 220, '2026-10-20'),
 ('prv-0002', 'PRV000002', 'City Care Hospital',                'ptm-hospital', 'NETWORK',     'HYBRID',  'Active', TRUE,  'Private Ltd',   TRUE,  'TIER_1', 'A', 'Dr. Neelam Shah',     'Director',  'MD',   'som-allopathy', 'AABCC5678B', 'City Care Hospitals Pvt Ltd', 'https://citycare.example',       '02225552002', '9820020002', 'info@citycare.example',
  'adr-prv-0002', '45 Linking Road, Bandra',  'Mumbai',    'Mumbai',    'MAHARASHTRA', 'MH', '400050', 'URBAN', 'ACTIVE', 310, '2027-03-31'),
 ('prv-0003', 'PRV000003', 'Lotus Heart Institute',             'ptm-hospital', 'NETWORK',     'INSURER', 'Active', FALSE, 'Private Ltd',   FALSE, 'TIER_1', 'B', 'Dr. Rajiv Malhotra',  'Chairman',  'DM',   'som-allopathy', 'AABCL9012C', 'Lotus Heart Pvt Ltd',     'https://lotusheart.example',     '01125553003', '9820020003', 'care@lotusheart.example',
  'adr-prv-0003', '8 Barakhamba Road',        'New Delhi', 'Central Delhi', 'DELHI',   'DL', '110001', 'URBAN', 'ACTIVE', 150, '2026-06-30'),
 ('prv-0004', 'PRV000004', 'Green Valley Hospital',             'ptm-hospital', 'NETWORK',     'TPA',     'Active', TRUE,  'Charitable',    TRUE,  'TIER_2', 'B', 'Sr. Mary Joseph',     'Trustee',   'MSc',  'som-allopathy', 'AAATG3456D', 'Green Valley Trust',       NULL,                              '08025554004', '9820020004', 'contact@greenvalley.example',
  'adr-prv-0004', '22 Residency Road',        'Bengaluru', 'Bengaluru Urban', 'KARNATAKA', 'KA', '560025', 'URBAN', 'ACTIVE', 120, '2027-01-15'),
 ('prv-0005', 'PRV000005', 'Wellness Family Clinic',            'ptm-clinic',   'NETWORK',     'TPA',     'Active', TRUE,  'Proprietorship', FALSE, 'TIER_3', 'C', 'Dr. Anita Rao',       'Owner',     'MBBS', 'som-allopathy', 'ABCPR7890E', 'Anita Rao',               NULL,                              '04425555005', '9820020005', 'hello@wellnessclinic.example',
  'adr-prv-0005', '5 T Nagar Main Road',      'Chennai',   'Chennai',   'TAMIL NADU',  'TN', '600017', 'URBAN', 'ACTIVE', NULL, '2027-02-28'),
 ('prv-0006', 'PRV000006', 'Precision Diagnostics Lab',         'ptm-lab',      'NETWORK',     'TPA',     'Active', TRUE,  'Private Ltd',   FALSE, 'TIER_2', 'B', 'Mr. Sameer Joshi',    'Director',  'BSc',  'som-allopathy', 'AABCP2345F', 'Precision Diagnostics Pvt Ltd', 'https://precisionlab.example', '02025556006', '9820020006', 'lab@precisionlab.example',
  'adr-prv-0006', '101 FC Road',              'Pune',      'Pune',      'MAHARASHTRA', 'MH', '411005', 'URBAN', 'ACTIVE', NULL, '2026-11-02'),
 ('prv-0007', 'PRV000007', 'Healing Hands Pharmacy',            'ptm-pharmacy', 'NON_NETWORK', 'TPA',     'Active', FALSE, 'Proprietorship', FALSE, NULL,     NULL, 'Mr. Vikram Singh',    'Owner',     'BPharm','som-allopathy', 'ABCPS6789G', 'Vikram Singh',            NULL,                              NULL,           '9820020007', NULL,
  'adr-prv-0007', 'Shop 3, Station Road',     'Nagpur',    'Nagpur',    'MAHARASHTRA', 'MH', '440001', 'URBAN', 'ACTIVE', NULL, NULL),
 ('prv-0008', 'PRV000008', 'Ayush Wellness Centre',             'ptm-hospital', 'NON_NETWORK', 'TPA',     'Inactive', FALSE, 'Private Ltd',  FALSE, NULL,     NULL, 'Vaidya R. Pillai',    'Director',  'BAMS', 'som-ayurveda',  'AABCA4567H', 'Ayush Wellness Pvt Ltd',   NULL,                              '04842557008', '9820020008', 'info@ayushwellness.example',
  'adr-prv-0008', '17 MG Road',               'Kochi',     'Ernakulam', 'KERALA',      'KL', '682016', 'URBAN', 'ACTIVE', 40, NULL);

INSERT INTO provider_identifiers (provider_identifier_id, provider_id, identifier_type_name, identifier_value, identifier_status, valid_from, valid_to, is_primary, issue_date, source_system) VALUES
 ('pid-0001', 'prv-0001', 'ROHINI Registry Code', 'ROH-1000001', 'ACTIVE', '2024-04-01', '2026-10-20', TRUE, '2024-04-01', 'IIB'),
 ('pid-0002', 'prv-0002', 'ROHINI Registry Code', 'ROH-1000002', 'ACTIVE', '2025-04-01', '2027-03-31', TRUE, '2025-04-01', 'IIB'),
 ('pid-0003', 'prv-0003', 'ROHINI Registry Code', 'ROH-1000003', 'ACTIVE', '2023-07-01', '2026-06-30', TRUE, '2023-07-01', 'IIB'),
 ('pid-0004', 'prv-0004', 'ROHINI Registry Code', 'ROH-1000004', 'ACTIVE', '2025-01-16', '2027-01-15', TRUE, '2025-01-16', 'IIB'),
 ('pid-0005', 'prv-0005', 'ROHINI Registry Code', 'ROH-1000005', 'ACTIVE', '2025-03-01', '2027-02-28', TRUE, '2025-03-01', 'IIB'),
 ('pid-0006', 'prv-0006', 'ROHINI Registry Code', 'ROH-1000006', 'ACTIVE', '2024-11-03', '2026-11-02', TRUE, '2024-11-03', 'IIB'),
 ('pid-0007', 'prv-0001', 'Old Provider Code',    'OLD-PUN-014', 'ACTIVE', NULL, NULL, FALSE, NULL, 'LEGACY'),
 ('pid-0008', 'prv-0002', 'Old Provider Code',    'OLD-MUM-077', 'ACTIVE', NULL, NULL, FALSE, NULL, 'LEGACY');

INSERT INTO provider_insurers (provider_id, insurer_id) VALUES
 ('prv-0002', 'INS-001'), ('prv-0002', 'INS-005'), ('prv-0003', 'INS-002'), ('prv-0003', 'INS-006');

INSERT INTO provider_specialties (provider_id, specialty_id) VALUES
 ('prv-0001', 'spec-cardio'), ('prv-0001', 'spec-ortho'), ('prv-0001', 'spec-gensurg'),
 ('prv-0002', 'spec-onco'),   ('prv-0002', 'spec-neuro'), ('prv-0002', 'spec-gynae'),
 ('prv-0003', 'spec-cardio'), ('prv-0004', 'spec-paed'),  ('prv-0004', 'spec-genmed'),
 ('prv-0005', 'spec-genmed');

INSERT INTO provider_contact_persons (provider_contact_person_id, provider_id, role_id, role_name, full_name, designation, telephone_no, mobile_no, email_id) VALUES
 ('pcp-0001', 'prv-0001', 'role-claims',  'Claims Coordinator',     'Rohit Pawar',   'Executive',          '02025551010', '9820030001', 'claims@sunrise-hospital.example'),
 ('pcp-0002', 'prv-0001', 'role-ms',      'Medical Superintendent', 'Dr. Leena Deshpande', 'Superintendent', NULL,         '9820030002', 'ms@sunrise-hospital.example'),
 ('pcp-0003', 'prv-0002', 'role-billing', 'Billing Manager',        'Farhan Sheikh', 'Manager',            '02225552010', '9820030003', 'billing@citycare.example');
