-- member-service: tables owned by this service.
-- Generated from the Hibernate schema. Idempotent, so it is safe on a database
-- that already has these tables (created earlier by ddl-auto).

CREATE TABLE IF NOT EXISTS public.enrollment_progress (
    id character varying(255) NOT NULL,
    endorsement_id character varying(255),
    inward_no character varying(255),
    percentage integer,
    policy_id character varying(255),
    remaining_time_in_seconds integer,
    status character varying(255),
    updated_at timestamp(6) without time zone
);

CREATE TABLE IF NOT EXISTS public.members (
    id character varying(255) NOT NULL,
    comment character varying(255),
    corporate_employee_code character varying(255),
    created_at timestamp(6) without time zone,
    date_of_joining date,
    email character varying(255),
    enrollment_action character varying(255),
    enrollment_status character varying(255),
    enrollment_status_reason character varying(255),
    exception_category character varying(255),
    health_card_number character varying(255),
    insured_member_age integer,
    insured_member_dob date,
    insured_member_gender character varying(255),
    insured_member_name character varying(255),
    inward_no character varying(255),
    member_enrollment_id character varying(255),
    mobile character varying(255),
    policy_endorsement_id character varying(255),
    policy_id character varying(255),
    policy_number character varying(255),
    policy_record_type character varying(255),
    reconciliation_remark character varying(255),
    reconciliation_status character varying(255),
    record_status character varying(255),
    relationship character varying(255),
    staging_member_enrollment_id character varying(255),
    sum_insured double precision,
    uhid character varying(255)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'enrollment_progress_pkey') THEN
        ALTER TABLE ONLY public.enrollment_progress
            ADD CONSTRAINT enrollment_progress_pkey PRIMARY KEY (id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'members_pkey') THEN
        ALTER TABLE ONLY public.members
            ADD CONSTRAINT members_pkey PRIMARY KEY (id);
    END IF;
END $$;
