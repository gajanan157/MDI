-- master-service: fields that used to be hardcoded in entity getters are now stored columns.
-- Existing rows get the values the getters returned before, so API responses do not change.
-- New rows take whatever the create/update request sends.

ALTER TABLE public.agents
    ADD COLUMN IF NOT EXISTS agent_type character varying(255),
    ADD COLUMN IF NOT EXISTS agent_category character varying(255);

UPDATE public.agents SET agent_type = 'INDIVIDUAL' WHERE agent_type IS NULL;
UPDATE public.agents SET agent_category = 'CORPORATE' WHERE agent_category IS NULL;

ALTER TABLE public.brokers
    ADD COLUMN IF NOT EXISTS broker_type character varying(255),
    ADD COLUMN IF NOT EXISTS pan character varying(255),
    ADD COLUMN IF NOT EXISTS gstin character varying(255),
    ADD COLUMN IF NOT EXISTS cin character varying(255),
    ADD COLUMN IF NOT EXISTS head_office_city character varying(255),
    ADD COLUMN IF NOT EXISTS website_url character varying(255);

UPDATE public.brokers SET broker_type = 'COMPOSITE' WHERE broker_type IS NULL;
UPDATE public.brokers SET pan = 'AABCM1122D' WHERE pan IS NULL;
UPDATE public.brokers SET gstin = '27AABCM1122D1Z3' WHERE gstin IS NULL;
UPDATE public.brokers SET cin = 'U66010MH2002PTC138248' WHERE cin IS NULL;
UPDATE public.brokers SET head_office_city = 'Mumbai' WHERE head_office_city IS NULL;
UPDATE public.brokers SET website_url = 'https://www.marsh.com' WHERE website_url IS NULL;

ALTER TABLE public.corporate_groups
    ADD COLUMN IF NOT EXISTS cin character varying(255),
    ADD COLUMN IF NOT EXISTS pan character varying(255),
    ADD COLUMN IF NOT EXISTS gstin character varying(255);

UPDATE public.corporate_groups SET cin = 'L85110MH1985PLC012345' WHERE cin IS NULL;
UPDATE public.corporate_groups SET pan = 'AAACT1234G' WHERE pan IS NULL;
UPDATE public.corporate_groups SET gstin = '27AAACT1234G1Z8' WHERE gstin IS NULL;

ALTER TABLE public.corporates
    ADD COLUMN IF NOT EXISTS cin character varying(255),
    ADD COLUMN IF NOT EXISTS corporate_type character varying(255),
    ADD COLUMN IF NOT EXISTS size_band character varying(255),
    ADD COLUMN IF NOT EXISTS employee_count integer,
    ADD COLUMN IF NOT EXISTS billing_cycle character varying(255),
    ADD COLUMN IF NOT EXISTS risk_tier character varying(255),
    ADD COLUMN IF NOT EXISTS website_url character varying(255);

UPDATE public.corporates SET cin = 'L85110KA1981PLC013115' WHERE cin IS NULL;
UPDATE public.corporates SET corporate_type = 'PUBLIC_LIMITED' WHERE corporate_type IS NULL;
UPDATE public.corporates SET size_band = 'LARGE' WHERE size_band IS NULL;
UPDATE public.corporates SET employee_count = 15000 WHERE employee_count IS NULL;
UPDATE public.corporates SET billing_cycle = 'MONTHLY' WHERE billing_cycle IS NULL;
UPDATE public.corporates SET risk_tier = 'LOW' WHERE risk_tier IS NULL;
UPDATE public.corporates SET website_url = 'https://www.mdindia.com' WHERE website_url IS NULL;
