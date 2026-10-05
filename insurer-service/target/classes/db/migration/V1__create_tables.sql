-- Insurance companies, their offices (head / regional / divisional / underwriting), and contact persons.
CREATE TABLE insurers (
    insurer_id          VARCHAR(64) PRIMARY KEY,
    legal_name          VARCHAR(255) NOT NULL,
    insurer_code        VARCHAR(32) NOT NULL,
    insurer_type        VARCHAR(16) NOT NULL,             -- PSU or PRIVATE
    irdai_insurer_code  VARCHAR(64),
    brand_name          VARCHAR(255),
    description         VARCHAR(1000),
    contact_email       VARCHAR(255),
    contact_phone       VARCHAR(64),
    pan                 VARCHAR(16),
    gstin               VARCHAR(32),
    abdm_empanelled     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    deleted             BOOLEAN NOT NULL DEFAULT FALSE,   -- deleted insurers are hidden but keep their id for old policies
    address_id          VARCHAR(64),
    address             VARCHAR(500),
    city                VARCHAR(128),
    state_name          VARCHAR(128),
    postal_code         VARCHAR(16),
    country_code        VARCHAR(8) DEFAULT 'IN',
    address_status      VARCHAR(32),
    address_use         VARCHAR(32),
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_insurer_code ON insurers (insurer_code) WHERE deleted = FALSE;

CREATE TABLE master_agreements (
    agreement_id        BIGSERIAL PRIMARY KEY,
    insurer_id          VARCHAR(64) NOT NULL REFERENCES insurers (insurer_id),
    start_date          DATE,
    end_date            DATE,
    signed_by_tpa       BOOLEAN NOT NULL DEFAULT FALSE,
    signed_by_insurer   BOOLEAN NOT NULL DEFAULT FALSE,
    file_metadata_id    VARCHAR(64),
    effective_period    VARCHAR(64)
);

CREATE TABLE insurer_offices (
    insurer_office_id   VARCHAR(64) PRIMARY KEY,
    insurer_id          VARCHAR(64) NOT NULL REFERENCES insurers (insurer_id),
    office_code         VARCHAR(32) NOT NULL,
    office_name         VARCHAR(255) NOT NULL,
    office_type         VARCHAR(8) NOT NULL,              -- HO, RO, DO, UO or OTHER
    superior_office_id  VARCHAR(64) REFERENCES insurer_offices (insurer_office_id),
    underwriting_center BOOLEAN NOT NULL DEFAULT FALSE,
    servicing_allocation_for VARCHAR(16) NOT NULL DEFAULT 'both',   -- corporate, retail or both
    service_types       TEXT,                             -- JSON list of {name,label,enabled,startDate,endDate}
    effective_from      DATE,
    effective_to        DATE,
    active_flag         BOOLEAN NOT NULL DEFAULT TRUE,
    address_id          VARCHAR(64),
    address_type        VARCHAR(32),
    address             VARCHAR(500),
    city                VARCHAR(128),
    state_name          VARCHAR(128),
    postal_code         VARCHAR(16),
    country_code        VARCHAR(8) DEFAULT 'IN',
    address_status      VARCHAR(32),
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_office_code UNIQUE (insurer_id, office_code)
);
CREATE INDEX idx_offices_insurer ON insurer_offices (insurer_id);

CREATE TABLE contact_persons (
    contact_person_id   VARCHAR(64) PRIMARY KEY,
    tenant_id           VARCHAR(64),
    insurer_id          VARCHAR(64) NOT NULL REFERENCES insurers (insurer_id),
    prefix              VARCHAR(16),
    first_name          VARCHAR(128),
    middle_name         VARCHAR(128),
    last_name           VARCHAR(128),
    suffix              VARCHAR(16),
    full_name           VARCHAR(400),
    date_of_birth       DATE,
    gender              VARCHAR(16),
    notes               VARCHAR(1000),
    tags                VARCHAR(500),
    deleted             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_contacts_insurer ON contact_persons (insurer_id);

CREATE TABLE contact_channels (
    channel_id          VARCHAR(64) PRIMARY KEY,
    contact_person_id   VARCHAR(64) NOT NULL REFERENCES contact_persons (contact_person_id) ON DELETE CASCADE,
    channel_type        VARCHAR(32) NOT NULL,             -- email, mobile, phone
    channel_value       VARCHAR(255) NOT NULL,
    whatsapp_enabled    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE contact_assignments (
    assignment_id       VARCHAR(64) PRIMARY KEY,
    contact_person_id   VARCHAR(64) NOT NULL REFERENCES contact_persons (contact_person_id) ON DELETE CASCADE,
    insurer_office_id   VARCHAR(64) NOT NULL REFERENCES insurer_offices (insurer_office_id),
    designation         VARCHAR(255),
    department          VARCHAR(255),
    priority            INT,
    domain_id           VARCHAR(64),
    role_id             VARCHAR(64),
    status              VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
);
CREATE INDEX idx_assign_office ON contact_assignments (insurer_office_id);

CREATE TABLE contact_roles (
    domain_id           VARCHAR(64) NOT NULL,
    domain_name         VARCHAR(128) NOT NULL,
    role_id             VARCHAR(64) NOT NULL,
    role_name           VARCHAR(128) NOT NULL,
    PRIMARY KEY (domain_id, role_id)
);
