-- ecard-service: tables owned by this service.
-- Generated from the Hibernate schema. Idempotent, so it is safe on a database
-- that already has these tables (created earlier by ddl-auto).

CREATE TABLE IF NOT EXISTS public.ecard_templates (
    template_configuration_id character varying(255) NOT NULL,
    active boolean,
    corporate_id character varying(255),
    created_at timestamp(6) without time zone,
    e_card_type character varying(255),
    insurer_id character varying(255),
    template_labels_json text,
    template_name character varying(255)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ecard_templates_pkey') THEN
        ALTER TABLE ONLY public.ecard_templates
            ADD CONSTRAINT ecard_templates_pkey PRIMARY KEY (template_configuration_id);
    END IF;
END $$;
