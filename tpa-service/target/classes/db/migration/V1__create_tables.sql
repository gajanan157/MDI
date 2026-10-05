-- TPA company (one row per TPA) and its branches. Lists (emails, phones, service types, tags) are
-- stored as comma separated text and returned as arrays by the API.
CREATE TABLE tpa (
    tpa_id            VARCHAR(64) PRIMARY KEY,
    tenant_id         VARCHAR(64),
    tpa_code          VARCHAR(32) NOT NULL,
    legal_name        VARCHAR(255) NOT NULL,
    cin               VARCHAR(64),
    contact_email     VARCHAR(500),
    contact_phone     VARCHAR(500),
    address_id        VARCHAR(64),
    address_type      VARCHAR(32),
    address           VARCHAR(500),
    city              VARCHAR(128),
    state_name        VARCHAR(128),
    postal_code       VARCHAR(16),
    address_status    VARCHAR(32),
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE tpa_branches (
    tpa_branch_id     VARCHAR(64) PRIMARY KEY,
    tpa_id            VARCHAR(64) NOT NULL REFERENCES tpa (tpa_id),
    tenant_id         VARCHAR(64),
    parent_branch_id  VARCHAR(64),
    branch_code       VARCHAR(32) NOT NULL,
    branch_name       VARCHAR(255) NOT NULL,
    contact_email     VARCHAR(1000),
    contact_phone     VARCHAR(1000),
    service_types     VARCHAR(1000),
    tags              VARCHAR(1000),
    record_status     VARCHAR(16) NOT NULL DEFAULT 'Active',
    address_id        VARCHAR(64),
    address_type      VARCHAR(32),
    address           VARCHAR(500),
    city              VARCHAR(128),
    state_name        VARCHAR(128),
    postal_code       VARCHAR(16),
    address_status    VARCHAR(32),
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_tpa_branch_code UNIQUE (tpa_id, branch_code)
);
CREATE INDEX idx_tpa_branches_status ON tpa_branches (record_status);

-- Escalation matrix: who to contact, per query type and branch, up to five levels (0 = contact person).
CREATE TABLE escalation_departments (
    department_id     VARCHAR(64) PRIMARY KEY,
    department_name   VARCHAR(255) NOT NULL,
    active_flag       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE escalation_employees (
    employee_id       VARCHAR(64) PRIMARY KEY,
    employee_code     VARCHAR(32) NOT NULL,
    employee_name     VARCHAR(255) NOT NULL,
    designation       VARCHAR(255),
    email             VARCHAR(255),
    mobile            VARCHAR(32)
);

CREATE TABLE escalation_queries (
    query_id          VARCHAR(64) PRIMARY KEY,
    query_code        VARCHAR(32) NOT NULL,
    query_name        VARCHAR(255) NOT NULL,
    department_id     VARCHAR(64) NOT NULL REFERENCES escalation_departments (department_id)
);

CREATE TABLE escalation_matrix (
    escalation_matrix_id VARCHAR(64) PRIMARY KEY,
    query_id          VARCHAR(64) NOT NULL REFERENCES escalation_queries (query_id),
    tpa_id            VARCHAR(64) NOT NULL REFERENCES tpa (tpa_id),
    tpa_branch_id     VARCHAR(64) NOT NULL REFERENCES tpa_branches (tpa_branch_id),
    CONSTRAINT uq_matrix UNIQUE (query_id, tpa_branch_id)
);

CREATE TABLE escalation_levels (
    level_id          BIGSERIAL PRIMARY KEY,
    escalation_matrix_id VARCHAR(64) NOT NULL REFERENCES escalation_matrix (escalation_matrix_id) ON DELETE CASCADE,
    escalation_level  INT NOT NULL,
    sla_hours         INT NOT NULL DEFAULT 24,
    employee_id       VARCHAR(64) NOT NULL REFERENCES escalation_employees (employee_id),
    mobile            VARCHAR(32),
    email             VARCHAR(255),
    CONSTRAINT uq_matrix_level UNIQUE (escalation_matrix_id, escalation_level)
);
