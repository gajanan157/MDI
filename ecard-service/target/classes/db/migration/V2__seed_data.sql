-- ecard-service: initial reference and sample data (previously DataInitializer.java).
-- Runs once. ON CONFLICT DO NOTHING keeps rows that already exist untouched.

INSERT INTO public.ecard_templates (template_configuration_id, active, corporate_id, created_at, e_card_type, insurer_id, template_labels_json, template_name) VALUES ('TMPL-001', true, 'CORP-201', '2026-10-04 15:24:47.08964', 'PHOTO', 'INS-001', '{
  "policyNoLabel": "Policy Number",
  "memberIdLabel": "UHID / Member ID",
  "validityLabel": "Valid Thru",
  "tpaContactLabel": "TPA Toll Free"
}
', 'Standard Corporate Photo Card') ON CONFLICT DO NOTHING;
INSERT INTO public.ecard_templates (template_configuration_id, active, corporate_id, created_at, e_card_type, insurer_id, template_labels_json, template_name) VALUES ('TMPL-002', true, 'CORP-202', '2026-10-04 15:24:47.08964', 'NON_PHOTO', 'INS-002', '{
  "policyNoLabel": "Policy Number",
  "memberIdLabel": "UHID / Member ID",
  "validityLabel": "Valid Thru",
  "tpaContactLabel": "TPA Toll Free"
}
', 'Executive Floater Non-Photo Card') ON CONFLICT DO NOTHING;
