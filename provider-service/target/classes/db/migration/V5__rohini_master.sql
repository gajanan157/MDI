-- Rohini registry (the national hospital register): every registered hospital, whether or not it works with us.
CREATE TABLE provider_rohini_master (
    provider_rohini_id      VARCHAR(64) PRIMARY KEY,
    rohini_code             VARCHAR(64) NOT NULL UNIQUE,
    provider_name           VARCHAR(255) NOT NULL,
    provider_address        VARCHAR(500),
    email_id                VARCHAR(500),                -- comma separated
    mobile_no               VARCHAR(500),                -- comma separated
    state_name              VARCHAR(128),
    district                VARCHAR(128),
    city                    VARCHAR(128),
    postal_code             VARCHAR(16),
    bed_count               INT,
    latitude                NUMERIC(10,6),
    longitude               NUMERIC(10,6),
    effective_to_date       DATE,                        -- Rohini expiry
    next_renewal_due_date   DATE,
    registration_status     VARCHAR(32),
    provider_status         VARCHAR(32),
    network_type            VARCHAR(16),
    record_status           VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    inward_no               VARCHAR(64),
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_rohini_name ON provider_rohini_master (lower(provider_name));
CREATE INDEX idx_rohini_state_city ON provider_rohini_master (state_name, city);

-- Sample data. The first six match the Rohini codes of the sample providers.
INSERT INTO provider_rohini_master (provider_rohini_id, rohini_code, provider_name, provider_address, email_id, mobile_no, state_name, district, city, postal_code,
                                    bed_count, latitude, longitude, effective_to_date, next_renewal_due_date, registration_status, provider_status, network_type, record_status) VALUES
 ('roh-0001', 'ROH-1000001', 'Sunrise Multispeciality Hospital', '12 Law College Road',   'info@sunrise-hospital.example', '9820020001', 'MAHARASHTRA', 'Pune',       'Pune',      '411004', 220, 18.5204, 73.8567, '2026-10-20', '2026-09-20', 'REGISTERED', 'OPERATIONAL', 'NETWORK',     'ACTIVE'),
 ('roh-0002', 'ROH-1000002', 'City Care Hospital',               '45 Linking Road, Bandra','info@citycare.example',         '9820020002', 'MAHARASHTRA', 'Mumbai',     'Mumbai',    '400050', 310, 19.0596, 72.8295, '2027-03-31', '2027-02-28', 'REGISTERED', 'OPERATIONAL', 'NETWORK',     'ACTIVE'),
 ('roh-0003', 'ROH-1000003', 'Lotus Heart Institute',            '8 Barakhamba Road',      'care@lotusheart.example',       '9820020003', 'DELHI',       'Central Delhi','New Delhi','110001', 150, 28.6304, 77.2177, '2026-06-30', '2026-05-31', 'REGISTERED', 'OPERATIONAL', 'NETWORK',     'ACTIVE'),
 ('roh-0004', 'ROH-1000004', 'Green Valley Hospital',            '22 Residency Road',      'contact@greenvalley.example',   '9820020004', 'KARNATAKA',   'Bengaluru Urban','Bengaluru','560025', 120, 12.9716, 77.5946, '2027-01-15', '2026-12-15', 'REGISTERED', 'OPERATIONAL', 'NETWORK',     'ACTIVE'),
 ('roh-0005', 'ROH-1000005', 'Wellness Family Clinic',           '5 T Nagar Main Road',    'hello@wellnessclinic.example',  '9820020005', 'TAMIL NADU',  'Chennai',    'Chennai',   '600017', NULL, 13.0418, 80.2341, '2027-02-28', '2027-01-28', 'REGISTERED', 'OPERATIONAL', 'NETWORK',     'ACTIVE'),
 ('roh-0006', 'ROH-1000006', 'Precision Diagnostics Lab',        '101 FC Road',            'lab@precisionlab.example',      '9820020006', 'MAHARASHTRA', 'Pune',       'Pune',      '411005', NULL, 18.5236, 73.8412, '2026-11-02', '2026-10-02', 'REGISTERED', 'OPERATIONAL', 'NETWORK',     'ACTIVE'),
 ('roh-0007', 'ROH-1000007', 'Sai Krupa Hospital',               '3 Gandhi Chowk',         'saikrupa@example.in',           '9820040007', 'MAHARASHTRA', 'Nagpur',     'Nagpur',    '440001', 80,  21.1458, 79.0882, '2027-05-31', '2027-04-30', 'REGISTERED', 'OPERATIONAL', 'NON_NETWORK', 'ACTIVE'),
 ('roh-0008', 'ROH-1000008', 'Coastal Care Hospital',            '11 Beach Road',          'coastal@example.in',            '9820040008', 'KERALA',      'Ernakulam',  'Kochi',     '682016', 95,  9.9312,  76.2673, '2026-10-28', '2026-09-28', 'REGISTERED', 'OPERATIONAL', 'NON_NETWORK', 'ACTIVE'),
 ('roh-0009', 'ROH-1000009', 'Metro Kidney Centre',              '27 Park Street',         'metrokidney@example.in',        '9820040009', 'WEST BENGAL', 'Kolkata',    'Kolkata',   '700016', 60,  22.5726, 88.3639, '2026-08-31', '2026-07-31', 'REGISTERED', 'OPERATIONAL', 'NON_NETWORK', 'ACTIVE'),
 ('roh-0010', 'ROH-1000010', 'Old Town Nursing Home',            '6 Fort Road',            NULL,                            '9820040010', 'RAJASTHAN',   'Jaipur',     'Jaipur',    '302001', 25,  26.9124, 75.7873, '2025-12-31', '2025-11-30', 'LAPSED',     'CLOSED',      'NON_NETWORK', 'INACTIVE');
