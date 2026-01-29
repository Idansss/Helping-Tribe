-- Seed Case Studies from HELP_Foundations_Case_Study_Bank document
-- All 5 case studies

-- Case 1: Student with Depression (Chika)
INSERT INTO public.case_studies (title, scenario, questions, learning_objectives, difficulty_level, tags, module_id)
SELECT 
  'Case 1: Student with Depression',
  'Chika is a 16-year-old student who has become increasingly withdrawn over the past few months. Her grades have dropped significantly, and her teachers have noticed she often cries in class. She used to be active in school clubs but has stopped participating. Her friends are concerned but don''t know how to help.',
  '[
    {
      "id": "q1",
      "question": "What signs of depression do you notice in Chika''s situation?",
      "hint": "Consider emotional, behavioral, and academic indicators"
    },
    {
      "id": "q2",
      "question": "How would you approach Chika in a supportive, non-judgmental way?",
      "hint": "Think about active listening, validation, and creating safety"
    },
    {
      "id": "q3",
      "question": "What cultural factors might influence how Chika and her family view mental health?",
      "hint": "Consider Nigerian cultural context and stigma around mental health"
    },
    {
      "id": "q4",
      "question": "When would you refer Chika to professional mental health services?",
      "hint": "Consider severity indicators and your role boundaries"
    }
  ]'::jsonb,
  ARRAY['Recognize signs of depression', 'Supportive communication', 'Cultural sensitivity', 'Referral timing'],
  'intermediate',
  ARRAY['depression', 'youth', 'mental health', 'school'],
  id
FROM public.modules WHERE week_number = 5 LIMIT 1;

-- Case 2: Mother with Grief (Amina)
INSERT INTO public.case_studies (title, scenario, questions, learning_objectives, difficulty_level, tags, module_id)
SELECT 
  'Case 2: Mother with Grief',
  'Amina is a 34-year-old mother of three who lost her husband six months ago. She is struggling financially and emotionally. Her children have noticed she cries before they wake up in the morning. Family members are pressuring her to "be strong" and "move on," but she feels overwhelmed and isolated.',
  '[
    {
      "id": "q1",
      "question": "What grief reactions is Amina experiencing?",
      "hint": "Consider emotional, physical, and behavioral responses to loss"
    },
    {
      "id": "q2",
      "question": "How would you provide emotional support while respecting cultural expectations?",
      "hint": "Balance validation with cultural context"
    },
    {
      "id": "q3",
      "question": "What cultural beliefs about grief and "being strong" might be affecting Amina?",
      "hint": "Think about gender roles and cultural expectations"
    },
    {
      "id": "q4",
      "question": "How could community support help Amina in her grieving process?",
      "hint": "Consider practical and emotional support networks"
    }
  ]'::jsonb,
  ARRAY['Grief reactions', 'Cultural sensitivity', 'Community support', 'Gender considerations'],
  'intermediate',
  ARRAY['grief', 'women', 'family', 'cultural'],
  id
FROM public.modules WHERE week_number = 1 LIMIT 1;

-- Case 3: Disability Stigma (Tunde)
INSERT INTO public.case_studies (title, scenario, questions, learning_objectives, difficulty_level, tags, module_id)
SELECT 
  'Case 3: Disability Stigma',
  'Tunde is a 22-year-old man with a physical disability who faces discrimination in employment and pity from his community. He feels frustrated because people focus on his disability rather than his abilities. He has stopped attending community events because he feels uncomfortable with how people treat him.',
  '[
    {
      "id": "q1",
      "question": "What challenges is Tunde facing beyond his physical disability?",
      "hint": "Consider social, emotional, and practical barriers"
    },
    {
      "id": "q2",
      "question": "How would you help Tunde build resilience and self-advocacy skills?",
      "hint": "Think about strengths-based approaches"
    },
    {
      "id": "q3",
      "question": "What advocacy strategies could help address discrimination in employment?",
      "hint": "Consider individual and systemic approaches"
    },
    {
      "id": "q4",
      "question": "How do cultural attitudes toward disability affect Tunde''s experience?",
      "hint": "Consider community perceptions and stigma"
    }
  ]'::jsonb,
  ARRAY['Disability awareness', 'Resilience building', 'Advocacy', 'Cultural attitudes'],
  'intermediate',
  ARRAY['disability', 'discrimination', 'advocacy', 'stigma'],
  id
FROM public.modules WHERE week_number = 5 LIMIT 1;

-- Case 4: Domestic Conflict (Ngozi)
INSERT INTO public.case_studies (title, scenario, questions, learning_objectives, difficulty_level, tags, module_id)
SELECT 
  'Case 4: Domestic Conflict',
  'Ngozi and her husband have been arguing frequently about finances. The arguments have become more intense, and Ngozi feels unsafe but doesn''t want to involve outsiders. Her husband refuses to seek help, saying it''s a "family matter" that should stay private. Ngozi confides in you but asks you not to tell anyone.',
  '[
      {
        "id": "q1",
        "question": "What are the core issues in this conflict?",
        "hint": "Look beyond the surface arguments"
      },
      {
        "id": "q2",
        "question": "How would you support Ngozi without escalating the situation?",
        "hint": "Consider safety, autonomy, and cultural sensitivity"
      },
      {
        "id": "q3",
        "question": "What conflict resolution skills would be most helpful here?",
        "hint": "Think about de-escalation and communication"
      },
      {
        "id": "q4",
        "question": "When and how would you involve community leaders or refer to other services?",
        "hint": "Consider safety, confidentiality, and cultural appropriateness"
      }
    ]'::jsonb,
  ARRAY['Conflict resolution', 'Safety assessment', 'Cultural sensitivity', 'Referral skills'],
  'advanced',
  ARRAY['domestic conflict', 'safety', 'conflict resolution', 'cultural'],
  id
FROM public.modules WHERE week_number = 3 LIMIT 1;

-- Case 5: Displaced Adolescent (Trauma) - Musa
INSERT INTO public.case_studies (title, scenario, questions, learning_objectives, difficulty_level, tags, module_id)
SELECT 
  'Case 5: Displaced Adolescent (Trauma)',
  'Musa is a 15-year-old boy who was displaced by violence in his community. He now lives in a temporary settlement with his family. He has nightmares, avoids talking about what happened, and has become isolated from other young people. His school performance has declined, and he seems to be "spacing out" during conversations.',
  '[
      {
        "id": "q1",
        "question": "What trauma symptoms is Musa displaying?",
        "hint": "Consider physical, emotional, and behavioral indicators"
      },
      {
        "id": "q2",
        "question": "What trauma-informed approaches would you use when working with Musa?",
        "hint": "Think about safety, grounding, and empowerment"
      },
      {
        "id": "q3",
        "question": "How could the school and community support Musa''s recovery?",
        "hint": "Consider environmental factors and support systems"
      },
      {
        "id": "q4",
        "question": "When would you refer Musa to specialized trauma services?",
        "hint": "Consider severity and your role boundaries"
      }
    ]'::jsonb,
  ARRAY['Trauma recognition', 'Trauma-informed care', 'Community support', 'Referral timing'],
  'advanced',
  ARRAY['trauma', 'displacement', 'youth', 'crisis'],
  id
FROM public.modules WHERE week_number = 2 LIMIT 1;
