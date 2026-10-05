-- policy-service: tables owned by this service.
-- Generated from the Hibernate schema. Idempotent, so it is safe on a database
-- that already has these tables (created earlier by ddl-auto).

CREATE TABLE IF NOT EXISTS public.policies (
    policy_id character varying(255) NOT NULL,
    corporate_id character varying(255),
    created_at timestamp(6) without time zone,
    dummy_policy_number character varying(255),
    gross_premium double precision,
    insurer_id character varying(255),
    inward_no character varying(255),
    link_dummy_number boolean,
    net_premium double precision,
    policy_end_date date,
    policy_number character varying(255),
    policy_plan character varying(255),
    policy_record_type character varying(255),
    policy_renewal_type character varying(255),
    policy_start_date date,
    previous_policy_number character varying(255),
    status character varying(255),
    sum_insured double precision
);

CREATE TABLE IF NOT EXISTS public.policy_endorsements (
    policy_endorsement_id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone,
    inward_no character varying(255),
    members_added_count integer,
    members_deleted_count integer,
    members_modified_count integer,
    net_premium_amount double precision,
    policy_endorsement_effective_date date,
    policy_endorsement_number character varying(255),
    policy_endorsement_received_date date,
    policy_endorsement_request_date date,
    policy_endorsement_type character varying(255),
    policy_id character varying(255),
    policy_number character varying(255),
    premium_deducted_amount double precision,
    remark character varying(255),
    status character varying(255),
    total_premium_amount double precision
);

CREATE TABLE IF NOT EXISTS public.work_items (
    id character varying(255) NOT NULL,
    assigned_to character varying(255),
    created_at timestamp(6) without time zone,
    document_type character varying(255),
    enrollment_type character varying(255),
    inward_no character varying(255),
    onboarding_pending_for character varying(255),
    policy_no character varying(255),
    policy_record_type character varying(255),
    policy_schedule_jsonb text,
    remark character varying(255),
    status character varying(255),
    updated_at timestamp(6) without time zone
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'policies_pkey') THEN
        ALTER TABLE ONLY public.policies
            ADD CONSTRAINT policies_pkey PRIMARY KEY (policy_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'policy_endorsements_pkey') THEN
        ALTER TABLE ONLY public.policy_endorsements
            ADD CONSTRAINT policy_endorsements_pkey PRIMARY KEY (policy_endorsement_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'work_items_pkey') THEN
        ALTER TABLE ONLY public.work_items
            ADD CONSTRAINT work_items_pkey PRIMARY KEY (id);
    END IF;
END $$;
