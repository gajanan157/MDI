-- Agreements, empanelment (provider <-> insurer / corporate network mapping, restrictions, bulk uploads) and blacklist.
-- Insurer, corporate and policy ids belong to other services' databases, so they are plain columns without foreign keys.

-- ===== Agreements ===============================================================================

-- GIPSA PPN state / city reference lists, used by the agreement form's "check PPN state-city" step.
CREATE TABLE provider_gipsa_ppn_states (
    ppn_state_id        VARCHAR(64) PRIMARY KEY,
    ppn_state_name      VARCHAR(128) NOT NULL UNIQUE,
    active              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE provider_gipsa_ppn_cities (
    ppn_city_id         VARCHAR(64) PRIMARY KEY,
    ppn_state_id        VARCHAR(64) NOT NULL REFERENCES provider_gipsa_ppn_states (ppn_state_id),
    ppn_city_name       VARCHAR(128) NOT NULL,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (ppn_state_id, ppn_city_name)
);

CREATE TABLE provider_agreements (
    provider_agreement_id   VARCHAR(64) PRIMARY KEY,
    provider_id             VARCHAR(64) NOT NULL REFERENCES providers (provider_id),
    tpa_id                  VARCHAR(64),
    ppn_state_id            VARCHAR(64) REFERENCES provider_gipsa_ppn_states (ppn_state_id),
    ppn_city_id             VARCHAR(64) REFERENCES provider_gipsa_ppn_cities (ppn_city_id),
    agreement_name          VARCHAR(255) NOT NULL,
    agreement_type          VARCHAR(64) NOT NULL,           -- e.g. TPA, INSURER, GIPSA_PPN
    applicable_scope        VARCHAR(64),
    agreement_status        VARCHAR(32) NOT NULL DEFAULT 'DRAFT',   -- DRAFT, ACTIVE, EXPIRED, TERMINATED
    effective_from          DATE,
    effective_to            DATE,
    empanelment_date        DATE,
    signed_date             DATE,
    signatory_name          VARCHAR(255),
    signatory_designation   VARCHAR(255),
    credit_period           INT,
    service_period          INT,
    duration                INT,
    agreement_version       VARCHAR(32),
    copy_available_flag     BOOLEAN NOT NULL DEFAULT FALSE,
    infra_audit_done_flag   BOOLEAN NOT NULL DEFAULT FALSE,
    soc_discount_status     VARCHAR(16) NOT NULL DEFAULT 'Pending',  -- Pending or Complete
    remark                  VARCHAR(1000),
    file_metadata_id        VARCHAR(64),
    supporting_file_metadata_id VARCHAR(64),
    inward_no               VARCHAR(64),
    record_status           VARCHAR(16) NOT NULL DEFAULT 'Active',
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_agreements_provider ON provider_agreements (provider_id);
CREATE INDEX idx_agreements_status ON provider_agreements (agreement_status);

-- Which insurers an agreement covers, with the period each mapping applies.
CREATE TABLE provider_agreement_insurer_mappings (
    agreement_insurer_mapping_id VARCHAR(64) PRIMARY KEY,
    provider_agreement_id   VARCHAR(64) NOT NULL REFERENCES provider_agreements (provider_agreement_id) ON DELETE CASCADE,
    insurer_id              VARCHAR(64) NOT NULL,
    insurer_name            VARCHAR(255),
    mapping_effective_from  DATE,
    mapping_effective_to    DATE,
    mapping_is_active       BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_agreement_mappings ON provider_agreement_insurer_mappings (provider_agreement_id);

-- ===== Empanelment: network mapping, restrictions, network mode ================================

-- Master: how each insurer treats providers (network mode and tariff type).
CREATE TABLE insurer_provider_network_modes (
    insurer_provider_network_mode_id VARCHAR(64) PRIMARY KEY,
    insurer_id              VARCHAR(64) NOT NULL,
    network_mode_type       VARCHAR(64) NOT NULL,            -- e.g. CASHLESS, REIMBURSEMENT
    network_tariff_type     VARCHAR(64),                     -- e.g. PPN, NON_PPN
    network_active_flag     BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from          DATE,
    effective_to            DATE,
    record_status           VARCHAR(16) NOT NULL DEFAULT 'Active',
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);

-- Restrictions placed on a provider for an insurer (and optionally scoped to corporates, policies, offices).
CREATE TABLE provider_restrictions (
    provider_restriction_id VARCHAR(64) PRIMARY KEY,
    provider_id             VARCHAR(64) NOT NULL REFERENCES providers (provider_id),
    insurer_id              VARCHAR(64) NOT NULL,
    tpa_id                  VARCHAR(64),
    restriction_type        VARCHAR(64),
    applicable_for          VARCHAR(64) NOT NULL,             -- e.g. ALL, CORPORATE, POLICY, INSURER_OFFICE
    effective_from          DATE NOT NULL,
    effective_to            DATE,
    restriction_level       VARCHAR(32) NOT NULL,
    reason_code             VARCHAR(64) NOT NULL,
    reason_description      VARCHAR(1000),
    remark                  VARCHAR(1000),
    emergency_exception_allowed_flag BOOLEAN NOT NULL DEFAULT FALSE,
    investigation_required_flag      BOOLEAN NOT NULL DEFAULT FALSE,
    inward_no               VARCHAR(64),
    supporting_file_metadata_id VARCHAR(64),
    restriction_status      VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_restrictions_provider ON provider_restrictions (provider_id);

CREATE TABLE provider_restriction_scopes (
    scope_id                BIGSERIAL PRIMARY KEY,
    provider_restriction_id VARCHAR(64) NOT NULL REFERENCES provider_restrictions (provider_restriction_id) ON DELETE CASCADE,
    scope_type              VARCHAR(32) NOT NULL,             -- CORPORATE, POLICY, INSURER_OFFICE or CCN
    scope_value             VARCHAR(128) NOT NULL,
    scope_label             VARCHAR(255)
);
CREATE INDEX idx_restriction_scopes ON provider_restriction_scopes (provider_restriction_id);

-- A provider's empanelment with an insurer or a corporate.
CREATE TABLE provider_network_mappings (
    provider_network_mapping_id VARCHAR(64) PRIMARY KEY,
    provider_id             VARCHAR(64) NOT NULL REFERENCES providers (provider_id),
    tpa_id                  VARCHAR(64),
    provider_mapping_type   VARCHAR(16) NOT NULL,             -- INSURER or CORPORATE
    insurer_id              VARCHAR(64),
    insurer_name            VARCHAR(255),
    corporate_id            VARCHAR(64),
    corporate_name          VARCHAR(255),
    provider_agreement_id   VARCHAR(64) REFERENCES provider_agreements (provider_agreement_id),
    network_source         VARCHAR(32),
    network_mode            VARCHAR(64),
    network_tariff_type     VARCHAR(64),
    network_effective_from  DATE NOT NULL,
    network_effective_to    DATE,
    network_is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    insurer_provider_code   VARCHAR(64),
    identifier_type_code    VARCHAR(64),
    bank_match_with_ic      VARCHAR(16) NOT NULL DEFAULT 'Pending',    -- Pending, Matched or Mismatch
    provider_restriction_id VARCHAR(64) REFERENCES provider_restrictions (provider_restriction_id),
    restriction_applicable_for VARCHAR(64),
    remark                  VARCHAR(1000),
    inward_no               VARCHAR(64),
    supporting_file_metadata_id VARCHAR(64),
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_network_provider ON provider_network_mappings (provider_id);
CREATE INDEX idx_network_insurer ON provider_network_mappings (insurer_id);

-- Bulk upload of empanelment / de-empanelment rows: one job per uploaded file, rows staged for checking.
CREATE TABLE provider_jobs (
    provider_job_id         VARCHAR(64) PRIMARY KEY,
    job_type                VARCHAR(48) NOT NULL,             -- IC_MAPPING, BANK_VERIFICATION or BLACKLIST
    row_type                VARCHAR(24),                      -- EMPANELMENT or DE_EMPANELMENT (IC_MAPPING only)
    inward_no               VARCHAR(64),
    file_metadata_id        VARCHAR(64),
    job_status              VARCHAR(24) NOT NULL DEFAULT 'LAUNCHED',   -- LAUNCHED, RUNNING, COMPLETED, FAILED
    total_received          INT NOT NULL DEFAULT 0,
    valid_count             INT NOT NULL DEFAULT 0,
    invalid_count           INT NOT NULL DEFAULT 0,
    processed_count         INT NOT NULL DEFAULT 0,
    failed_count            INT NOT NULL DEFAULT 0,
    message                 VARCHAR(1000),
    started_at              TIMESTAMP NOT NULL DEFAULT now(),
    finished_at             TIMESTAMP
);
CREATE INDEX idx_jobs_inward ON provider_jobs (inward_no);

CREATE TABLE staging_provider_insurer (
    staging_provider_insurer_id VARCHAR(64) PRIMARY KEY,
    provider_job_id         VARCHAR(64) NOT NULL REFERENCES provider_jobs (provider_job_id) ON DELETE CASCADE,
    inward_no               VARCHAR(64),
    row_type                VARCHAR(24) NOT NULL DEFAULT 'EMPANELMENT',
    provider_id             VARCHAR(64),
    provider_name           VARCHAR(255),
    provider_iib_rohini_code VARCHAR(64),
    insurer_id              VARCHAR(64),
    insurer_name            VARCHAR(255),
    insurer_provider_code   VARCHAR(64),
    network_effective_from  DATE,
    network_effective_to    DATE,
    provider_address        VARCHAR(500),
    provider_city           VARCHAR(128),
    provider_state          VARCHAR(128),
    provider_pincode        VARCHAR(16),
    provider_status         VARCHAR(32),                      -- e.g. Valid, Invalid, Partial Match
    staging_status          VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    status_reason           VARCHAR(1000),
    is_valid                BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_staging_pi_inward ON staging_provider_insurer (inward_no);

-- ===== Blacklist ===============================================================================

-- Providers that are excluded (blacklisted) or watched (watchlisted), by TPA, an insurer, or globally.
CREATE TABLE provider_blacklist (
    provider_blacklist_id   VARCHAR(64) PRIMARY KEY,
    provider_id             VARCHAR(64) REFERENCES providers (provider_id),   -- set when the provider is known to the TPA
    provider_name           VARCHAR(255) NOT NULL,
    provider_iib_rohini_code VARCHAR(64),
    insurer_id              VARCHAR(64),
    insurer_name            VARCHAR(255),
    blacklist_source        VARCHAR(16) NOT NULL,             -- TPA, INSURER or GLOBAL
    restriction_type        VARCHAR(48) NOT NULL,             -- PROVIDER_EXCLUSION_RECORDS or PROVIDER_WATCHLIST_RECORDS
    matching_status         VARCHAR(32) NOT NULL DEFAULT 'NOT_MATCHED_WITH_TPA',   -- MATCHED_WITH_TPA or NOT_MATCHED_WITH_TPA
    restriction_applicable_for VARCHAR(64),
    effective_from          DATE NOT NULL,
    effective_to            DATE,
    provider_address        VARCHAR(500),
    provider_city           VARCHAR(128),
    provider_district       VARCHAR(128),
    provider_state          VARCHAR(128),
    provider_pincode        VARCHAR(16),
    status_reason           VARCHAR(1000),
    investigation_required_flag      BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_exception_allowed_flag BOOLEAN NOT NULL DEFAULT FALSE,
    remark                  VARCHAR(1000),
    inward_no               VARCHAR(64),
    file_metadata_id        VARCHAR(64),
    supporting_file_metadata_id VARCHAR(64),
    record_status           VARCHAR(16) NOT NULL DEFAULT 'Active',
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_blacklist_provider ON provider_blacklist (provider_id);
CREATE INDEX idx_blacklist_insurer ON provider_blacklist (insurer_id);
CREATE INDEX idx_blacklist_name ON provider_blacklist (lower(provider_name));

-- Rows from an uploaded blacklist file, checked against known providers before they become blacklist records.
CREATE TABLE staging_provider_blacklist (
    provider_blacklist_staging_id VARCHAR(64) PRIMARY KEY,
    provider_job_id         VARCHAR(64) REFERENCES provider_jobs (provider_job_id) ON DELETE CASCADE,
    provider_blacklist_master_id VARCHAR(64) REFERENCES provider_blacklist (provider_blacklist_id),
    inward_no               VARCHAR(64),
    provider_name           VARCHAR(255) NOT NULL,
    provider_iib_rohini_code VARCHAR(64),
    insurer_name            VARCHAR(255),
    restriction_type        VARCHAR(48),
    provider_address        VARCHAR(500),
    provider_city           VARCHAR(128),
    provider_state          VARCHAR(128),
    provider_district       VARCHAR(128),
    provider_pincode        VARCHAR(16),
    provider_blacklist_start_date DATE,
    provider_blacklist_effective_from DATE,
    provider_status         VARCHAR(32),                      -- e.g. Valid, Invalid, Not Found, Partial Match
    provider_status_reason  VARCHAR(1000),
    staging_status          VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    match_similarity_score  NUMERIC(5,4),                     -- 0 to 1, for partial matches
    is_valid                BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_staging_bl_inward ON staging_provider_blacklist (inward_no);
