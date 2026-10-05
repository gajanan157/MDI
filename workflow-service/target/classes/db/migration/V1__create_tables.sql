-- workflow-service: tables owned by this service.
-- Generated from the Hibernate schema. Idempotent, so it is safe on a database
-- that already has these tables (created earlier by ddl-auto).

CREATE TABLE IF NOT EXISTS public.workflow_instances (
    workflow_instance_id character varying(255) NOT NULL,
    assigned_group_name character varying(255),
    assigned_user_id character varying(255),
    business_entity_id character varying(255),
    business_entity_name character varying(255),
    business_reference_number character varying(255),
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    current_stage character varying(255),
    inward_no character varying(255),
    priority character varying(255),
    status character varying(255),
    updated_at timestamp(6) without time zone,
    workflow_id character varying(255)
);

CREATE TABLE IF NOT EXISTS public.workflow_transitions (
    transition_id character varying(255) NOT NULL,
    action_code character varying(255),
    from_stage character varying(255),
    performed_by character varying(255),
    remarks character varying(255),
    requesting_group_name character varying(255),
    to_stage character varying(255),
    transitioned_at timestamp(6) without time zone,
    workflow_instance_id character varying(255)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workflow_instances_pkey') THEN
        ALTER TABLE ONLY public.workflow_instances
            ADD CONSTRAINT workflow_instances_pkey PRIMARY KEY (workflow_instance_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workflow_transitions_pkey') THEN
        ALTER TABLE ONLY public.workflow_transitions
            ADD CONSTRAINT workflow_transitions_pkey PRIMARY KEY (transition_id);
    END IF;
END $$;
