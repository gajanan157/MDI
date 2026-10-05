-- Providers (hospitals, clinics, labs, practitioners ...). Lists such as phone numbers are stored as comma
-- separated text and returned as arrays by the API.
CREATE TABLE provider_type_master (
    provider_type_id    VARCHAR(64) PRIMARY KEY,
    tenant_id           VARCHAR(64),
    type_code           VARCHAR(64) NOT NULL UNIQUE,
    class_code          VARCHAR(64),
    subclass_code       VARCHAR(64),
    display_name        VARCHAR(255) NOT NULL,
    provider_type_scope VARCHAR(255),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order          INT NOT NULL DEFAULT 0,
    record_status       VARCHAR(16) NOT NULL DEFAULT 'Active'
);

-- Small reference lists: clinical specialty, system of medicine, bed type, contact person role.
CREATE TABLE provider_lookups (
    lookup_type         VARCHAR(32) NOT NULL,
    lookup_id           VARCHAR(64) NOT NULL,
    lookup_name         VARCHAR(255) NOT NULL,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order          INT NOT NULL DEFAULT 0,
    PRIMARY KEY (lookup_type, lookup_id)
);

CREATE TABLE providers (
    provider_id         VARCHAR(64) PRIMARY KEY,
    provider_code       VARCHAR(32) NOT NULL UNIQUE,
    provider_name       VARCHAR(255) NOT NULL,
    provider_type_id    VARCHAR(64) NOT NULL REFERENCES provider_type_master (provider_type_id),
    provider_network_type VARCHAR(16) NOT NULL DEFAULT 'NETWORK',     -- NETWORK or NON_NETWORK
    empanelment_source  VARCHAR(16) NOT NULL DEFAULT 'TPA',           -- TPA, INSURER or HYBRID
    record_status       VARCHAR(16) NOT NULL DEFAULT 'Active',
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    ownership_type      VARCHAR(64),
    day_care_flag       BOOLEAN NOT NULL DEFAULT FALSE,
    care_tier           VARCHAR(32),
    internal_grade      VARCHAR(32),
    owner_name          VARCHAR(255),
    owner_designation   VARCHAR(255),
    owner_qualification VARCHAR(255),
    signatory_name      VARCHAR(255),
    signatory_designation VARCHAR(255),
    system_of_medicine_id VARCHAR(64),
    tpa_servicing_branch_id VARCHAR(64),
    tpa_servicing_branch_name VARCHAR(255),
    service_email_id    VARCHAR(500),
    registration_no     VARCHAR(64),
    registration_authority VARCHAR(255),
    pan_no              VARCHAR(16),
    pan_holder_name     VARCHAR(255),
    tan_no              VARCHAR(16),
    website_url         VARCHAR(500),
    telephone_no        VARCHAR(500),
    mobile_no           VARCHAR(500),
    fax_no              VARCHAR(500),
    email_id            VARCHAR(500),
    address_id          VARCHAR(64),
    address             VARCHAR(500),
    plot_no             VARCHAR(64),
    location            VARCHAR(255),
    taluka              VARCHAR(128),
    city                VARCHAR(128),
    district            VARCHAR(128),
    state_name          VARCHAR(128),
    state_code          VARCHAR(16),
    country_code        VARCHAR(8) DEFAULT 'IN',
    zone                VARCHAR(64),
    postal_code         VARCHAR(16),
    location_type       VARCHAR(32),
    latitude            NUMERIC(10,6),
    longitude           NUMERIC(10,6),
    address_status      VARCHAR(32),
    no_of_beds          INT,
    next_renewal_due_date DATE,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_providers_name ON providers (lower(provider_name));
CREATE INDEX idx_providers_state_city ON providers (state_name, city);

CREATE TABLE provider_identifiers (
    provider_identifier_id VARCHAR(64) PRIMARY KEY,
    provider_id         VARCHAR(64) NOT NULL REFERENCES providers (provider_id) ON DELETE CASCADE,
    identifier_type_name VARCHAR(128) NOT NULL,
    identifier_value    VARCHAR(255) NOT NULL,
    identifier_status   VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    valid_from          DATE,
    valid_to            DATE,
    is_primary          BOOLEAN NOT NULL DEFAULT FALSE,
    issue_date          DATE,
    source_system       VARCHAR(64),
    identifier_holder_name VARCHAR(255),
    issuing_authority_name VARCHAR(255),
    verification_reference_no VARCHAR(128)
);
CREATE INDEX idx_identifiers_provider ON provider_identifiers (provider_id);
CREATE INDEX idx_identifiers_value ON provider_identifiers (lower(identifier_value));

-- Insurer ids come from insurer-service (a different database), so there is no foreign key.
CREATE TABLE provider_insurers (
    provider_id         VARCHAR(64) NOT NULL REFERENCES providers (provider_id) ON DELETE CASCADE,
    insurer_id          VARCHAR(64) NOT NULL,
    PRIMARY KEY (provider_id, insurer_id)
);

CREATE TABLE provider_specialties (
    provider_id         VARCHAR(64) NOT NULL REFERENCES providers (provider_id) ON DELETE CASCADE,
    specialty_id        VARCHAR(64) NOT NULL,
    PRIMARY KEY (provider_id, specialty_id)
);

CREATE TABLE provider_contact_persons (
    provider_contact_person_id VARCHAR(64) PRIMARY KEY,
    provider_id         VARCHAR(64) NOT NULL REFERENCES providers (provider_id) ON DELETE CASCADE,
    role_id             VARCHAR(64),
    role_name           VARCHAR(255),
    full_name           VARCHAR(255) NOT NULL,
    designation         VARCHAR(255),
    telephone_no        VARCHAR(500),
    mobile_no           VARCHAR(500),
    email_id            VARCHAR(500),
    record_status       VARCHAR(16) NOT NULL DEFAULT 'Active'
);
CREATE INDEX idx_provider_contacts ON provider_contact_persons (provider_id);
