-- master-service: tables owned by this service.
-- Generated from the Hibernate schema. Idempotent, so it is safe on a database
-- that already has these tables (created earlier by ddl-auto).

CREATE TABLE IF NOT EXISTS public.agents (
    agent_id character varying(255) NOT NULL,
    agent_name character varying(255),
    contact_number character varying(255),
    created_at timestamp(6) without time zone,
    email character varying(255),
    license_number character varying(255),
    policy_agent_code character varying(255),
    status character varying(255)
);

CREATE TABLE IF NOT EXISTS public.brokers (
    broker_id character varying(255) NOT NULL,
    broker_name character varying(255),
    contact_number character varying(255),
    created_at timestamp(6) without time zone,
    email character varying(255),
    license_number character varying(255),
    policy_broker_code character varying(255),
    status character varying(255)
);

CREATE TABLE IF NOT EXISTS public.corporate_groups (
    corporate_group_id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone,
    group_code character varying(255),
    group_name character varying(255),
    status character varying(255)
);

CREATE TABLE IF NOT EXISTS public.corporates (
    corporate_id character varying(255) NOT NULL,
    contact_person character varying(255),
    corporate_group_id character varying(255),
    corporate_gstin character varying(255),
    corporate_hr_id character varying(255),
    corporate_industry_sector_id character varying(255),
    corporate_name character varying(255),
    corporate_pan character varying(255),
    created_at timestamp(6) without time zone,
    email character varying(255),
    mobile character varying(255),
    status character varying(255)
);

CREATE TABLE IF NOT EXISTS public.insurer_offices (
    office_id character varying(255) NOT NULL,
    address character varying(255),
    city character varying(255),
    insurer_id character varying(255),
    office_code character varying(255),
    office_name character varying(255),
    office_type character varying(255),
    parent_office_id character varying(255),
    state character varying(255)
);

CREATE TABLE IF NOT EXISTS public.insurers (
    insurer_id character varying(255) NOT NULL,
    insurer_name character varying(255),
    insurer_type character varying(255),
    status character varying(255)
);

CREATE TABLE IF NOT EXISTS public.tpa_branches (
    branch_id character varying(255) NOT NULL,
    branch_code character varying(255),
    branch_name character varying(255),
    city character varying(255),
    contact_person character varying(255),
    email character varying(255),
    phone character varying(255),
    pin_code character varying(255),
    state character varying(255)
);

CREATE TABLE IF NOT EXISTS public.user_groups (
    group_name character varying(255) NOT NULL,
    description character varying(255)
);

CREATE TABLE IF NOT EXISTS public.users (
    username character varying(255) NOT NULL,
    additional_roles character varying(2000),
    email character varying(255),
    group_name character varying(255),
    name character varying(255),
    password_hash character varying(255),
    role character varying(255)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agents_pkey') THEN
        ALTER TABLE ONLY public.agents
            ADD CONSTRAINT agents_pkey PRIMARY KEY (agent_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brokers_pkey') THEN
        ALTER TABLE ONLY public.brokers
            ADD CONSTRAINT brokers_pkey PRIMARY KEY (broker_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corporate_groups_pkey') THEN
        ALTER TABLE ONLY public.corporate_groups
            ADD CONSTRAINT corporate_groups_pkey PRIMARY KEY (corporate_group_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corporates_pkey') THEN
        ALTER TABLE ONLY public.corporates
            ADD CONSTRAINT corporates_pkey PRIMARY KEY (corporate_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'insurer_offices_pkey') THEN
        ALTER TABLE ONLY public.insurer_offices
            ADD CONSTRAINT insurer_offices_pkey PRIMARY KEY (office_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'insurers_pkey') THEN
        ALTER TABLE ONLY public.insurers
            ADD CONSTRAINT insurers_pkey PRIMARY KEY (insurer_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tpa_branches_pkey') THEN
        ALTER TABLE ONLY public.tpa_branches
            ADD CONSTRAINT tpa_branches_pkey PRIMARY KEY (branch_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_groups_pkey') THEN
        ALTER TABLE ONLY public.user_groups
            ADD CONSTRAINT user_groups_pkey PRIMARY KEY (group_name);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey') THEN
        ALTER TABLE ONLY public.users
            ADD CONSTRAINT users_pkey PRIMARY KEY (username);
    END IF;
END $$;
