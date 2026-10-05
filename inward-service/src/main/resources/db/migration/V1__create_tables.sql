-- inward-service: tables owned by this service.
-- Generated from the Hibernate schema. Idempotent, so it is safe on a database
-- that already has these tables (created earlier by ddl-auto).

CREATE TABLE IF NOT EXISTS public.inward_documents (
    file_metadata_id character varying(255) NOT NULL,
    content_type character varying(255),
    created_at timestamp(6) without time zone,
    document_type character varying(255),
    download_url character varying(255),
    file_name character varying(255),
    file_size bigint,
    inward_no character varying(255),
    s3bucket_name character varying(255),
    s3sub_bucket_name character varying(255)
);

CREATE TABLE IF NOT EXISTS public.inwards (
    inward_no character varying(255) NOT NULL,
    created_at timestamp(6) without time zone,
    department_id character varying(255),
    entity_id character varying(255),
    entity_type character varying(255),
    inward_priority character varying(255),
    inward_received_channel character varying(255),
    inward_received_tpa_branch_id character varying(255),
    inward_source_reference_no character varying(255),
    s3bucket_name character varying(255),
    s3sub_bucket_name character varying(255),
    status character varying(255)
);

CREATE TABLE IF NOT EXISTS public.psu_file_metadata (
    id character varying(255) NOT NULL,
    file_name character varying(255),
    insurer_name character varying(255),
    member_data_found boolean,
    policy_schedule_found boolean,
    status character varying(255),
    uploaded_at timestamp(6) without time zone
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inward_documents_pkey') THEN
        ALTER TABLE ONLY public.inward_documents
            ADD CONSTRAINT inward_documents_pkey PRIMARY KEY (file_metadata_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inwards_pkey') THEN
        ALTER TABLE ONLY public.inwards
            ADD CONSTRAINT inwards_pkey PRIMARY KEY (inward_no);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'psu_file_metadata_pkey') THEN
        ALTER TABLE ONLY public.psu_file_metadata
            ADD CONSTRAINT psu_file_metadata_pkey PRIMARY KEY (id);
    END IF;
END $$;
