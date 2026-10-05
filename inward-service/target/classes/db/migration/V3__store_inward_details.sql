-- inward-service: fields that used to be hardcoded in InwardEntity getters are now stored columns.
-- Existing rows get the values the getters returned before, so API responses do not change.

ALTER TABLE public.inwards
    ADD COLUMN IF NOT EXISTS category character varying(255),
    ADD COLUMN IF NOT EXISTS sub_category character varying(255),
    ADD COLUMN IF NOT EXISTS app_name character varying(255),
    ADD COLUMN IF NOT EXISTS corporate_name character varying(255),
    ADD COLUMN IF NOT EXISTS insurer_name character varying(255);

UPDATE public.inwards SET category = 'CORPORATE_HEALTH' WHERE category IS NULL;
UPDATE public.inwards SET sub_category = 'ENROLLMENT' WHERE sub_category IS NULL;
UPDATE public.inwards SET app_name = 'ENROLLMENT_PORTAL' WHERE app_name IS NULL;
UPDATE public.inwards SET corporate_name = 'Tata Consultancy Services Ltd.' WHERE corporate_name IS NULL;
UPDATE public.inwards SET insurer_name = 'The New India Assurance Co. Ltd.' WHERE insurer_name IS NULL;
