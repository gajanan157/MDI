-- policy-service: insurer and corporate names on work items were hardcoded in WorkItemEntity.
-- They are now stored columns, filled from each item's policy schedule when it is processed.

ALTER TABLE public.work_items
    ADD COLUMN IF NOT EXISTS insurer_name character varying(255),
    ADD COLUMN IF NOT EXISTS corporate_name character varying(255);

-- Backfill from the policy schedule JSON where it has the names.
DO $$
DECLARE
    item RECORD;
    schedule json;
BEGIN
    FOR item IN
        SELECT id, policy_schedule_jsonb FROM public.work_items
        WHERE (insurer_name IS NULL OR corporate_name IS NULL)
          AND policy_schedule_jsonb IS NOT NULL
    LOOP
        BEGIN
            schedule := item.policy_schedule_jsonb::json;
        EXCEPTION WHEN invalid_text_representation THEN
            CONTINUE; -- not valid JSON; handled by the fallback below
        END;
        UPDATE public.work_items SET
            insurer_name = COALESCE(insurer_name, NULLIF(schedule -> 'icObject' ->> 'insurer_name', '')),
            corporate_name = COALESCE(corporate_name, NULLIF(schedule -> 'corporateObject' ->> 'corporateName', ''))
        WHERE id = item.id;
    END LOOP;
END $$;

-- Rows without names in their schedule keep the values the old getters returned.
UPDATE public.work_items SET insurer_name = 'The New India Assurance Co. Ltd.' WHERE insurer_name IS NULL;
UPDATE public.work_items SET corporate_name = CASE
        WHEN policy_no LIKE '%REL%' THEN 'Reliance Jio Infocomm Ltd.'
        WHEN policy_no LIKE '%INF%' THEN 'Infosys Technologies Ltd.'
        ELSE 'Tata Consultancy Services Ltd.'
    END
WHERE corporate_name IS NULL;
