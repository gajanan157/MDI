-- The provider dashboard looks for a department named "Provider Network" and a TPA branch named "Pune-HO".
INSERT INTO escalation_departments (department_id, department_name, active_flag) VALUES
 ('dep-provider-network', 'Provider Network', TRUE);

INSERT INTO tpa_branches (tpa_branch_id, tpa_id, tenant_id, parent_branch_id, branch_code, branch_name,
                          contact_email, contact_phone, service_types, tags, record_status,
                          address_id, address_type, address, city, state_name, postal_code, address_status)
VALUES ('br-0006', 'c603dd8f-3e9c-4281-923c-04e092f1366b', 'ec94aeac-9b6d-43ec-8c53-4905b0e103e1', NULL, '006', 'Pune-HO',
        'pune.ho@mdindia.com', '9820000016', 'Mediclaim,PIMS,Projects,Private IC', '', 'Active',
        'adr-br-0006', 'both', 'Baner Road', 'Pune', 'MAHARASHTRA', '411045', 'ACTIVE');
