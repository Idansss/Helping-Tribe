-- Seed Resources from HELP_Foundations_Resource_Directory
-- This populates the resource directory with all Nigeria-specific resources

-- Section 1: Emergency Services
INSERT INTO public.resources (category, title, description, contact_info, location, tags, display_order) VALUES
('emergency', 'Police Emergency (Nigeria)', 'National police emergency number', '{"phone": "112 or 199"}', 'Nigeria', ARRAY['emergency', 'police', 'national'], 1),
('emergency', 'Fire Service Emergency', 'National fire service emergency', '{"phone": "112"}', 'Nigeria', ARRAY['emergency', 'fire', 'national'], 2),
('emergency', 'Ambulance / Medical Emergency', 'Medical emergency services', '{"phone": "112"}', 'Nigeria', ARRAY['emergency', 'medical', 'ambulance'], 3),
('emergency', 'Lagos State Emergency Services (LASEMA)', 'Lagos State emergency management', '{"phone": "767 or 112"}', 'Lagos State, Nigeria', ARRAY['emergency', 'lagos', 'state'], 4);

-- Section 2: Mental Health Hotlines
INSERT INTO public.resources (category, title, description, contact_info, location, tags, display_order) VALUES
('mental_health', 'Mentally Aware Nigeria Initiative (MANI)', 'Peer support and mental health awareness', '{"phone": "0809 111 6264"}', 'Nigeria', ARRAY['mental health', 'peer support', 'awareness'], 10),
('mental_health', 'She Writes Woman Mental Health Helpline', 'Advocacy and survivor support', '{"phone": "0708 800 4357"}', 'Nigeria', ARRAY['mental health', 'women', 'advocacy'], 11),
('mental_health', 'Stand to End Rape (STER) Helpline', 'Support for survivors of sexual violence', '{"phone": "0809 100 0200"}', 'Nigeria', ARRAY['mental health', 'sexual violence', 'survivor support'], 12),
('mental_health', 'UNICEF Nigeria Toll-Free Helpline', 'Child protection services', '{"phone": "0800 123 4567"}', 'Nigeria', ARRAY['mental health', 'child protection', 'unicef'], 13),
('mental_health', 'Nigeria Suicide Prevention Initiative Helpline', 'Suicide prevention and support', '{"phone": "0908 000 0413"}', 'Nigeria', ARRAY['mental health', 'suicide prevention', 'crisis'], 14);

-- Section 3: Hospitals and Psychiatric Services
INSERT INTO public.resources (category, title, description, contact_info, location, tags, display_order) VALUES
('hospital', 'Federal Neuropsychiatric Hospital, Yaba', 'Psychiatric hospital and mental health services', '{"phone": "0813 200 0000", "address": "Yaba, Lagos"}', 'Lagos, Nigeria', ARRAY['hospital', 'psychiatric', 'mental health', 'lagos'], 20),
('hospital', 'Neuropsychiatric Hospital, Aro', 'Psychiatric hospital and mental health services', '{"phone": "0803 330 2767", "address": "Abeokuta"}', 'Abeokuta, Nigeria', ARRAY['hospital', 'psychiatric', 'mental health', 'abeokuta'], 21),
('hospital', 'University College Hospital, Ibadan', 'Teaching hospital with psychiatric services', '{"phone": "0817 000 0000", "address": "Ibadan"}', 'Ibadan, Nigeria', ARRAY['hospital', 'teaching', 'psychiatric', 'ibadan'], 22),
('hospital', 'Ahmadu Bello University Teaching Hospital, Zaria', 'Teaching hospital with mental health services', '{"phone": "0803 700 0000", "address": "Zaria"}', 'Zaria, Nigeria', ARRAY['hospital', 'teaching', 'mental health', 'zaria'], 23),
('hospital', 'National Hospital, Abuja', 'National hospital with psychiatric services', '{"phone": "0812 345 6789", "address": "Abuja"}', 'Abuja, Nigeria', ARRAY['hospital', 'national', 'psychiatric', 'abuja'], 24);

-- Section 4: NGOs and Community Support
INSERT INTO public.resources (category, title, description, contact_info, location, tags, display_order) VALUES
('ngo', 'Mentally Aware Nigeria Initiative (MANI)', 'Peer support and mental health awareness organization', '{}', 'Nigeria', ARRAY['ngo', 'peer support', 'awareness'], 30),
('ngo', 'She Writes Woman', 'Advocacy and survivor support organization', '{}', 'Nigeria', ARRAY['ngo', 'advocacy', 'survivor support', 'women'], 31),
('ngo', 'Stand to End Rape (STER)', 'Support for survivors of sexual violence', '{}', 'Nigeria', ARRAY['ngo', 'sexual violence', 'survivor support'], 32),
('ngo', 'Neem Foundation', 'Trauma counselling and psychosocial support', '{}', 'Nigeria', ARRAY['ngo', 'trauma', 'counselling', 'psychosocial'], 33),
('ngo', 'ASADS (Anti-Suicide and Depression Squad)', 'Peer counselling and referral support', '{}', 'Nigeria', ARRAY['ngo', 'suicide prevention', 'peer counselling', 'depression'], 34);

-- Section 5: Faith and Community-Based Resources
INSERT INTO public.resources (category, title, description, contact_info, location, tags, display_order) VALUES
('faith_based', 'Local Mosques and Churches', 'Community-based support through religious institutions', '{}', 'Nigeria', ARRAY['faith', 'community', 'religious'], 40),
('faith_based', 'Community Leaders', 'Traditional and community leadership support', '{}', 'Nigeria', ARRAY['community', 'leadership', 'traditional'], 41),
('faith_based', 'Women''s Associations', 'Women-focused community support groups', '{}', 'Nigeria', ARRAY['community', 'women', 'associations'], 42),
('faith_based', 'Youth Development Groups', 'Youth-focused community support and development', '{}', 'Nigeria', ARRAY['community', 'youth', 'development'], 43);

-- Section 6: International Resources
INSERT INTO public.resources (category, title, description, contact_info, website_url, location, tags, display_order) VALUES
('international', 'World Health Organization (WHO)', 'Global health organization with mental health resources', '{}', 'https://www.who.int', 'Global', ARRAY['international', 'health', 'mental health'], 50),
('international', 'UNICEF', 'United Nations Children''s Fund - child protection and mental health', '{}', 'https://www.unicef.org', 'Global', ARRAY['international', 'children', 'protection', 'unicef'], 51),
('international', 'International Federation of Red Cross and Red Crescent Societies (IFRC)', 'Humanitarian organization with psychosocial support', '{}', 'https://www.ifrc.org', 'Global', ARRAY['international', 'humanitarian', 'psychosocial'], 52),
('international', 'UNHCR (United Nations High Commissioner for Refugees)', 'Refugee support and mental health services', '{}', 'https://www.unhcr.org', 'Global', ARRAY['international', 'refugees', 'mental health', 'unhcr'], 53);
