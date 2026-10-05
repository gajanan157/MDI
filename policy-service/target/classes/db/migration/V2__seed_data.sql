-- policy-service: initial reference and sample data (previously DataInitializer.java).
-- Runs once. ON CONFLICT DO NOTHING keeps rows that already exist untouched.

INSERT INTO public.policies (policy_id, corporate_id, created_at, dummy_policy_number, gross_premium, insurer_id, inward_no, link_dummy_number, net_premium, policy_end_date, policy_number, policy_plan, policy_record_type, policy_renewal_type, policy_start_date, previous_policy_number, status, sum_insured) VALUES ('DUMMY-POL-01', 'CORP-201', '2026-09-24 15:24:12.213876', NULL, 2360000, 'INS-001', 'INW-2026-1000', NULL, 2000000, '2026-12-31', 'DUMMY/NIA/2026/001', 'FAMILY_FLOATER', 'DUMMY', 'FRESH', '2026-01-01', NULL, 'ACTIVE', 500000) ON CONFLICT DO NOTHING;
INSERT INTO public.work_items (id, assigned_to, created_at, document_type, enrollment_type, inward_no, onboarding_pending_for, policy_no, policy_record_type, policy_schedule_jsonb, remark, status, updated_at) VALUES ('OCR-101', NULL, '2026-10-03 15:24:12.572509', 'POLICY_SCHEDULE', 'ENROLLMENT', 'INW-2026-1001', NULL, 'POL-TCS-2026-001', 'LIVE', '{
  "icObject": {
    "insurer_id": "INS-001",
    "insurer_name": "The New India Assurance Co. Ltd.",
    "insurer_type": "PSU",
    "master_product_id": "PROD-GHI-01",
    "issuing_office_id": "OFF-NIA-UO-01",
    "regional_office_id": "OFF-NIA-RO-01",
    "divisional_office_id": "OFF-NIA-DO-01"
  },
  "corporateObject": {
    "corporateId": "CORP-201",
    "corporateGroupId": "GRP-101",
    "corporateName": "Tata Consultancy Services Ltd.",
    "corporateIndustrySectorId": "IT_SERVICES",
    "corporateHrId": "HR-TCS-01",
    "corporatePan": "AABCT1234F",
    "corporateGstin": "27AABCT1234F1Z5"
  },
  "policyObject": {
    "policyNumber": "POL-TCS-2026-001",
    "policyRecordType": "LIVE",
    "policyPlan": "FAMILY_FLOATER",
    "policyRenewalType": "FRESH",
    "policyStartDate": "2026-04-01",
    "policyEndDate": "2027-03-31",
    "sumInsured": 500000.0,
    "netPremium": 4500000.0,
    "grossPremium": 5310000.0,
    "linkDummyNumber": true,
    "dummyPolicyNumber": "DUMMY/NIA/2026/001",
    "corporateBufferFlag": true,
    "corporateBufferAmount": 1000000.0,
    "coPaymentPercentage": 10.0,
    "physical_cards_required": true,
    "vip_tagging": false,
    "welcome_mailer": true,
    "corporate_payee": false,
    "insured_payee": true,
    "e_card_type": "PHOTO"
  },
  "policyFamilyDefinitionRules": [
    { "ruleCode": "PRIMARY_MEMBER", "countMin": 1, "countMax": 1, "ageMin": 18, "ageMax": 70, "allowedRelationships": ["SELF", "EMPLOYEE"] },
    { "ruleCode": "SPOUSE", "countMin": 0, "countMax": 1, "ageMin": 18, "ageMax": 70, "allowedRelationships": ["SPOUSE", "HUSBAND", "WIFE"] },
    { "ruleCode": "CHILD", "countMin": 0, "countMax": 4, "ageMin": 0, "ageMax": 25, "allowedRelationships": ["SON", "DAUGHTER", "CHILD"] },
    { "ruleCode": "PARENT", "countMin": 0, "countMax": 2, "ageMin": 45, "ageMax": 85, "allowedRelationships": ["FATHER", "MOTHER"] }
  ],
  "brokerAgentObject": {
    "channelType": "BROKER",
    "broker_id": "BRK-001",
    "policy_broker_code": "BRK-MARSH-01"
  },
  "tpaSpocObject": {
    "tpa_servicing_branch": "BR-PUN",
    "tpa_spoc_id": "SPOC-01",
    "tpa_spoc_name": "Suresh Kulkarni",
    "tpa_spoc_email": "suresh.k@mdindia.com",
    "tpa_spoc_mobile": "9822012345",
    "clientHrName": "Rohan Mehra",
    "clientContactNo": "9876543210",
    "clientEmailId": "rohan.m@tcs.com"
  }
}
', NULL, 'PROCESSOR_PENDING', '2026-10-04 13:24:12.572509') ON CONFLICT DO NOTHING;
INSERT INTO public.work_items (id, assigned_to, created_at, document_type, enrollment_type, inward_no, onboarding_pending_for, policy_no, policy_record_type, policy_schedule_jsonb, remark, status, updated_at) VALUES ('OCR-102', NULL, '2026-10-04 07:24:12.572509', 'POLICY_SCHEDULE', 'ENROLLMENT', 'INW-2026-1002', NULL, 'POL-REL-2026-002', 'LIVE', '{
  "icObject": {
    "insurer_id": "INS-001",
    "insurer_name": "The New India Assurance Co. Ltd.",
    "insurer_type": "PSU",
    "master_product_id": "PROD-GHI-01",
    "issuing_office_id": "OFF-NIA-UO-01",
    "regional_office_id": "OFF-NIA-RO-01",
    "divisional_office_id": "OFF-NIA-DO-01"
  },
  "corporateObject": {
    "corporateId": "CORP-201",
    "corporateGroupId": "GRP-101",
    "corporateName": "Reliance Jio Infocomm Ltd.",
    "corporateIndustrySectorId": "IT_SERVICES",
    "corporateHrId": "HR-REL-01",
    "corporatePan": "AABCT1234F",
    "corporateGstin": "27AABCT1234F1Z5"
  },
  "policyObject": {
    "policyNumber": "POL-REL-2026-001",
    "policyRecordType": "LIVE",
    "policyPlan": "FAMILY_FLOATER",
    "policyRenewalType": "FRESH",
    "policyStartDate": "2026-04-01",
    "policyEndDate": "2027-03-31",
    "sumInsured": 500000.0,
    "netPremium": 4500000.0,
    "grossPremium": 5310000.0,
    "linkDummyNumber": true,
    "dummyPolicyNumber": "DUMMY/NIA/2026/001",
    "corporateBufferFlag": true,
    "corporateBufferAmount": 1000000.0,
    "coPaymentPercentage": 10.0,
    "physical_cards_required": true,
    "vip_tagging": false,
    "welcome_mailer": true,
    "corporate_payee": false,
    "insured_payee": true,
    "e_card_type": "PHOTO"
  },
  "policyFamilyDefinitionRules": [
    { "ruleCode": "PRIMARY_MEMBER", "countMin": 1, "countMax": 1, "ageMin": 18, "ageMax": 70, "allowedRelationships": ["SELF", "EMPLOYEE"] },
    { "ruleCode": "SPOUSE", "countMin": 0, "countMax": 1, "ageMin": 18, "ageMax": 70, "allowedRelationships": ["SPOUSE", "HUSBAND", "WIFE"] },
    { "ruleCode": "CHILD", "countMin": 0, "countMax": 4, "ageMin": 0, "ageMax": 25, "allowedRelationships": ["SON", "DAUGHTER", "CHILD"] },
    { "ruleCode": "PARENT", "countMin": 0, "countMax": 2, "ageMin": 45, "ageMax": 85, "allowedRelationships": ["FATHER", "MOTHER"] }
  ],
  "brokerAgentObject": {
    "channelType": "BROKER",
    "broker_id": "BRK-001",
    "policy_broker_code": "BRK-MARSH-01"
  },
  "tpaSpocObject": {
    "tpa_servicing_branch": "BR-PUN",
    "tpa_spoc_id": "SPOC-01",
    "tpa_spoc_name": "Suresh Kulkarni",
    "tpa_spoc_email": "suresh.k@mdindia.com",
    "tpa_spoc_mobile": "9822012345",
    "clientHrName": "Rohan Mehra",
    "clientContactNo": "9876543210",
    "clientEmailId": "rohan.m@tcs.com"
  }
}
', NULL, 'QC_PENDING', '2026-10-04 14:24:12.572509') ON CONFLICT DO NOTHING;
INSERT INTO public.work_items (id, assigned_to, created_at, document_type, enrollment_type, inward_no, onboarding_pending_for, policy_no, policy_record_type, policy_schedule_jsonb, remark, status, updated_at) VALUES ('OCR-103', NULL, '2026-10-04 11:24:12.572509', 'POLICY_SCHEDULE', 'ENROLLMENT', 'INW-2026-1003', 'BROKER,PRODUCT', 'POL-INF-2026-003', 'LIVE', '{}', NULL, 'ONBOARDING_PENDING', '2026-10-04 11:24:12.572509') ON CONFLICT DO NOTHING;
INSERT INTO public.work_items (id, assigned_to, created_at, document_type, enrollment_type, inward_no, onboarding_pending_for, policy_no, policy_record_type, policy_schedule_jsonb, remark, status, updated_at) VALUES ('OCR-104', 'kiran.patel', '2026-10-01 15:24:12.572509', 'POLICY_SCHEDULE', 'ENROLLMENT', 'INW-2026-1004', NULL, 'POL-TCS-2026-001', 'LIVE', '{
  "icObject": {
    "insurer_id": "INS-001",
    "insurer_name": "The New India Assurance Co. Ltd.",
    "insurer_type": "PSU",
    "master_product_id": "PROD-GHI-01",
    "issuing_office_id": "OFF-NIA-UO-01",
    "regional_office_id": "OFF-NIA-RO-01",
    "divisional_office_id": "OFF-NIA-DO-01"
  },
  "corporateObject": {
    "corporateId": "CORP-201",
    "corporateGroupId": "GRP-101",
    "corporateName": "Tata Consultancy Services Ltd.",
    "corporateIndustrySectorId": "IT_SERVICES",
    "corporateHrId": "HR-TCS-01",
    "corporatePan": "AABCT1234F",
    "corporateGstin": "27AABCT1234F1Z5"
  },
  "policyObject": {
    "policyNumber": "POL-TCS-2026-001",
    "policyRecordType": "LIVE",
    "policyPlan": "FAMILY_FLOATER",
    "policyRenewalType": "FRESH",
    "policyStartDate": "2026-04-01",
    "policyEndDate": "2027-03-31",
    "sumInsured": 500000.0,
    "netPremium": 4500000.0,
    "grossPremium": 5310000.0,
    "linkDummyNumber": true,
    "dummyPolicyNumber": "DUMMY/NIA/2026/001",
    "corporateBufferFlag": true,
    "corporateBufferAmount": 1000000.0,
    "coPaymentPercentage": 10.0,
    "physical_cards_required": true,
    "vip_tagging": false,
    "welcome_mailer": true,
    "corporate_payee": false,
    "insured_payee": true,
    "e_card_type": "PHOTO"
  },
  "policyFamilyDefinitionRules": [
    { "ruleCode": "PRIMARY_MEMBER", "countMin": 1, "countMax": 1, "ageMin": 18, "ageMax": 70, "allowedRelationships": ["SELF", "EMPLOYEE"] },
    { "ruleCode": "SPOUSE", "countMin": 0, "countMax": 1, "ageMin": 18, "ageMax": 70, "allowedRelationships": ["SPOUSE", "HUSBAND", "WIFE"] },
    { "ruleCode": "CHILD", "countMin": 0, "countMax": 4, "ageMin": 0, "ageMax": 25, "allowedRelationships": ["SON", "DAUGHTER", "CHILD"] },
    { "ruleCode": "PARENT", "countMin": 0, "countMax": 2, "ageMin": 45, "ageMax": 85, "allowedRelationships": ["FATHER", "MOTHER"] }
  ],
  "brokerAgentObject": {
    "channelType": "BROKER",
    "broker_id": "BRK-001",
    "policy_broker_code": "BRK-MARSH-01"
  },
  "tpaSpocObject": {
    "tpa_servicing_branch": "BR-PUN",
    "tpa_spoc_id": "SPOC-01",
    "tpa_spoc_name": "Suresh Kulkarni",
    "tpa_spoc_email": "suresh.k@mdindia.com",
    "tpa_spoc_mobile": "9822012345",
    "clientHrName": "Rohan Mehra",
    "clientContactNo": "9876543210",
    "clientEmailId": "rohan.m@tcs.com"
  }
}
', NULL, 'COMPLETED', '2026-10-03 15:24:12.572509') ON CONFLICT DO NOTHING;
INSERT INTO public.work_items (id, assigned_to, created_at, document_type, enrollment_type, inward_no, onboarding_pending_for, policy_no, policy_record_type, policy_schedule_jsonb, remark, status, updated_at) VALUES ('OCR-105', NULL, '2026-10-04 13:24:12.572509', 'MEMBER_DATA', 'ENDORSEMENT', 'INW-2026-1005', NULL, 'POL-TCS-2026-001', 'LIVE', '{
  "icObject": {
    "insurer_id": "INS-001",
    "insurer_name": "The New India Assurance Co. Ltd.",
    "insurer_type": "PSU",
    "master_product_id": "PROD-GHI-01",
    "issuing_office_id": "OFF-NIA-UO-01",
    "regional_office_id": "OFF-NIA-RO-01",
    "divisional_office_id": "OFF-NIA-DO-01"
  },
  "corporateObject": {
    "corporateId": "CORP-201",
    "corporateGroupId": "GRP-101",
    "corporateName": "Tata Consultancy Services Ltd.",
    "corporateIndustrySectorId": "IT_SERVICES",
    "corporateHrId": "HR-TCS-01",
    "corporatePan": "AABCT1234F",
    "corporateGstin": "27AABCT1234F1Z5"
  },
  "policyObject": {
    "policyNumber": "POL-TCS-2026-001",
    "policyRecordType": "LIVE",
    "policyPlan": "FAMILY_FLOATER",
    "policyRenewalType": "FRESH",
    "policyStartDate": "2026-04-01",
    "policyEndDate": "2027-03-31",
    "sumInsured": 500000.0,
    "netPremium": 4500000.0,
    "grossPremium": 5310000.0,
    "linkDummyNumber": true,
    "dummyPolicyNumber": "DUMMY/NIA/2026/001",
    "corporateBufferFlag": true,
    "corporateBufferAmount": 1000000.0,
    "coPaymentPercentage": 10.0,
    "physical_cards_required": true,
    "vip_tagging": false,
    "welcome_mailer": true,
    "corporate_payee": false,
    "insured_payee": true,
    "e_card_type": "PHOTO"
  },
  "policyFamilyDefinitionRules": [
    { "ruleCode": "PRIMARY_MEMBER", "countMin": 1, "countMax": 1, "ageMin": 18, "ageMax": 70, "allowedRelationships": ["SELF", "EMPLOYEE"] },
    { "ruleCode": "SPOUSE", "countMin": 0, "countMax": 1, "ageMin": 18, "ageMax": 70, "allowedRelationships": ["SPOUSE", "HUSBAND", "WIFE"] },
    { "ruleCode": "CHILD", "countMin": 0, "countMax": 4, "ageMin": 0, "ageMax": 25, "allowedRelationships": ["SON", "DAUGHTER", "CHILD"] },
    { "ruleCode": "PARENT", "countMin": 0, "countMax": 2, "ageMin": 45, "ageMax": 85, "allowedRelationships": ["FATHER", "MOTHER"] }
  ],
  "brokerAgentObject": {
    "channelType": "BROKER",
    "broker_id": "BRK-001",
    "policy_broker_code": "BRK-MARSH-01"
  },
  "tpaSpocObject": {
    "tpa_servicing_branch": "BR-PUN",
    "tpa_spoc_id": "SPOC-01",
    "tpa_spoc_name": "Suresh Kulkarni",
    "tpa_spoc_email": "suresh.k@mdindia.com",
    "tpa_spoc_mobile": "9822012345",
    "clientHrName": "Rohan Mehra",
    "clientContactNo": "9876543210",
    "clientEmailId": "rohan.m@tcs.com"
  }
}
', NULL, 'PROCESSOR_PENDING', '2026-10-04 14:24:12.572509') ON CONFLICT DO NOTHING;
