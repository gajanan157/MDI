-- Sample data for local development.
INSERT INTO provider_gipsa_ppn_states (ppn_state_id, ppn_state_name) VALUES
 ('ppn-st-mh', 'MAHARASHTRA'), ('ppn-st-dl', 'DELHI'), ('ppn-st-ka', 'KARNATAKA'), ('ppn-st-tn', 'TAMIL NADU');

INSERT INTO provider_gipsa_ppn_cities (ppn_city_id, ppn_state_id, ppn_city_name) VALUES
 ('ppn-ct-pune',   'ppn-st-mh', 'Pune'),
 ('ppn-ct-mumbai', 'ppn-st-mh', 'Mumbai'),
 ('ppn-ct-nagpur', 'ppn-st-mh', 'Nagpur'),
 ('ppn-ct-delhi',  'ppn-st-dl', 'New Delhi'),
 ('ppn-ct-blr',    'ppn-st-ka', 'Bengaluru'),
 ('ppn-ct-chn',    'ppn-st-tn', 'Chennai');

INSERT INTO provider_agreements (provider_agreement_id, provider_id, tpa_id, ppn_state_id, ppn_city_id, agreement_name, agreement_type, applicable_scope,
                                 agreement_status, effective_from, effective_to, empanelment_date, signed_date, signatory_name, signatory_designation,
                                 credit_period, service_period, duration, agreement_version, copy_available_flag, infra_audit_done_flag, soc_discount_status, remark) VALUES
 ('agr-0001', 'prv-0001', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'ppn-st-mh', 'ppn-ct-pune',   'Sunrise TPA Agreement 2024',   'TPA',       'ALL',   'ACTIVE',  '2024-04-01', '2027-03-31', '2024-04-01', '2024-03-20', 'Dr. Mahesh Kulkarni', 'Chairman', 30, 12, 36, 'v1', TRUE,  TRUE,  'Complete', 'Standard TPA tariff'),
 ('agr-0002', 'prv-0002', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'ppn-st-mh', 'ppn-ct-mumbai', 'City Care GIPSA PPN 2025',     'GIPSA_PPN', 'ALL',   'ACTIVE',  '2025-04-01', '2028-03-31', '2025-04-01', '2025-03-15', 'Dr. Neelam Shah',     'Director', 45, 12, 36, 'v2', TRUE,  FALSE, 'Pending',  NULL),
 ('agr-0003', 'prv-0003', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'ppn-st-dl', 'ppn-ct-delhi',  'Lotus Insurer Agreement',      'INSURER',   'ALL',   'EXPIRED', '2023-07-01', '2026-06-30', '2023-07-01', '2023-06-20', 'Dr. Rajiv Malhotra',  'Chairman', 30, 12, 36, 'v1', FALSE, TRUE,  'Complete', 'Renewal pending'),
 ('agr-0004', 'prv-0004', 'c603dd8f-3e9c-4281-923c-04e092f1366b', NULL, NULL,                'Green Valley Draft Agreement', 'TPA',       'ALL',   'DRAFT',   '2025-01-16', '2027-01-15', NULL,         NULL,         NULL,                   NULL,       NULL, NULL, 24, 'v1', FALSE, FALSE, 'Pending',  'Awaiting signature');

INSERT INTO provider_agreement_insurer_mappings (agreement_insurer_mapping_id, provider_agreement_id, insurer_id, insurer_name, mapping_effective_from, mapping_effective_to, mapping_is_active) VALUES
 ('agm-0001', 'agr-0002', 'INS-001', 'The New India Assurance Co. Ltd.',     '2025-04-01', '2028-03-31', TRUE),
 ('agm-0002', 'agr-0002', 'INS-005', 'HDFC ERGO General Insurance Co. Ltd.', '2025-04-01', '2028-03-31', TRUE),
 ('agm-0003', 'agr-0003', 'INS-002', 'United India Insurance Co. Ltd.',      '2023-07-01', '2026-06-30', FALSE),
 ('agm-0004', 'agr-0003', 'INS-006', 'ICICI Lombard General Insurance Co. Ltd.', '2023-07-01', '2026-06-30', FALSE);

INSERT INTO insurer_provider_network_modes (insurer_provider_network_mode_id, insurer_id, network_mode_type, network_tariff_type, effective_from) VALUES
 ('ipnm-0001', 'INS-001', 'CASHLESS',      'PPN',     '2024-04-01'),
 ('ipnm-0002', 'INS-001', 'REIMBURSEMENT', 'NON_PPN', '2024-04-01'),
 ('ipnm-0003', 'INS-005', 'CASHLESS',      'PPN',     '2024-04-01');

INSERT INTO provider_restrictions (provider_restriction_id, provider_id, insurer_id, tpa_id, restriction_type, applicable_for, effective_from, effective_to,
                                   restriction_level, reason_code, reason_description, remark, emergency_exception_allowed_flag, investigation_required_flag) VALUES
 ('rst-0001', 'prv-0003', 'INS-002', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'WATCHLIST', 'ALL', '2026-07-01', NULL, 'INSURER', 'AGREEMENT_EXPIRED', 'Agreement expired on 2026-06-30', 'Hold new cashless approvals', TRUE, FALSE);

INSERT INTO provider_network_mappings (provider_network_mapping_id, provider_id, tpa_id, provider_mapping_type, insurer_id, insurer_name, provider_agreement_id,
                                       network_source, network_mode, network_tariff_type, network_effective_from, network_effective_to, network_is_active,
                                       insurer_provider_code, identifier_type_code, bank_match_with_ic, provider_restriction_id, restriction_applicable_for) VALUES
 ('pnm-0001', 'prv-0002', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'INSURER', 'INS-001', 'The New India Assurance Co. Ltd.',     'agr-0002', 'TPA',     'CASHLESS', 'PPN',  '2025-04-01', '2028-03-31', TRUE,  'NIA-MUM-0457', 'IC_PROVIDER_CODE', 'Matched',  NULL, NULL),
 ('pnm-0002', 'prv-0002', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'INSURER', 'INS-005', 'HDFC ERGO General Insurance Co. Ltd.', 'agr-0002', 'TPA',     'CASHLESS', 'PPN',  '2025-04-01', '2028-03-31', TRUE,  'HERGO-8841',   'IC_PROVIDER_CODE', 'Pending',  NULL, NULL),
 ('pnm-0003', 'prv-0003', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'INSURER', 'INS-002', 'United India Insurance Co. Ltd.',      'agr-0003', 'INSURER', 'CASHLESS', 'PPN',  '2023-07-01', '2026-06-30', FALSE, 'UIIC-DEL-221', 'IC_PROVIDER_CODE', 'Mismatch', 'rst-0001', 'ALL');

INSERT INTO provider_blacklist (provider_blacklist_id, provider_id, provider_name, provider_iib_rohini_code, insurer_id, insurer_name, blacklist_source,
                                restriction_type, matching_status, restriction_applicable_for, effective_from, provider_address, provider_city,
                                provider_district, provider_state, provider_pincode, status_reason, investigation_required_flag, remark) VALUES
 ('bl-0001', NULL,       'QuickCure Nursing Home',      'ROH-9000101', 'INS-001', 'The New India Assurance Co. Ltd.', 'INSURER', 'PROVIDER_EXCLUSION_RECORDS', 'NOT_MATCHED_WITH_TPA', 'ALL', '2026-01-10', '14 Station Road',  'Nagpur',   'Nagpur',   'MAHARASHTRA', '440001', 'Fraudulent claims',        TRUE,  'Excluded by insurer'),
 ('bl-0002', 'prv-0007', 'Healing Hands Pharmacy',      NULL,          NULL,      NULL,                               'TPA',     'PROVIDER_EXCLUSION_RECORDS', 'MATCHED_WITH_TPA',     'ALL', '2026-03-05', 'Shop 3, Station Road', 'Nagpur', 'Nagpur',   'MAHARASHTRA', '440001', 'Repeated billing issues',  FALSE, 'Excluded by TPA'),
 ('bl-0003', NULL,       'City Light Diagnostics',      'ROH-9000207', NULL,      NULL,                               'GLOBAL',  'PROVIDER_WATCHLIST_RECORDS', 'NOT_MATCHED_WITH_TPA', 'ALL', '2026-05-18', '9 Ring Road',      'Bengaluru','Bengaluru Urban', 'KARNATAKA', '560001', 'Under investigation',   TRUE,  'Industry watchlist');
