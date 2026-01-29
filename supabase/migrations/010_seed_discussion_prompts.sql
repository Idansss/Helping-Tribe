-- Seed Discussion Prompts for all modules
-- Based on CONTENT_STRUCTURE.md discussion prompts

-- Module 1: Helping Profession, Ethics, Cultural Competence
DO $$
DECLARE
    module_1_id UUID;
BEGIN
    SELECT id INTO module_1_id FROM public.modules WHERE week_number = 1 LIMIT 1;
    
    IF module_1_id IS NOT NULL THEN
        INSERT INTO public.discussion_prompts (module_id, prompt_text, posted_at) VALUES
        (module_1_id, 'What motivates you to help others?', NOW() - INTERVAL '7 days'),
        (module_1_id, 'How do cultural values influence helping in your community?', NOW() - INTERVAL '6 days'),
        (module_1_id, 'Share an example of maintaining boundaries in helping', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Module 2: Exploration & Insight Stages, Trauma-Informed Practice
DO $$
DECLARE
    module_2_id UUID;
BEGIN
    SELECT id INTO module_2_id FROM public.modules WHERE week_number = 2 LIMIT 1;
    
    IF module_2_id IS NOT NULL THEN
        INSERT INTO public.discussion_prompts (module_id, prompt_text, posted_at) VALUES
        (module_2_id, 'Share an experience where active listening made a difference', NOW() - INTERVAL '7 days'),
        (module_2_id, 'How do you recognize trauma responses?', NOW() - INTERVAL '6 days'),
        (module_2_id, 'What does safety mean in a helping relationship?', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Module 3: Action Stage, Conflict Resolution
DO $$
DECLARE
    module_3_id UUID;
BEGIN
    SELECT id INTO module_3_id FROM public.modules WHERE week_number = 3 LIMIT 1;
    
    IF module_3_id IS NOT NULL THEN
        INSERT INTO public.discussion_prompts (module_id, prompt_text, posted_at) VALUES
        (module_3_id, 'Describe a conflict you helped resolve', NOW() - INTERVAL '7 days'),
        (module_3_id, 'What strategies work best in your community?', NOW() - INTERVAL '6 days'),
        (module_3_id, 'How do you balance action with client autonomy?', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Module 4: Self-Care & Supervision
DO $$
DECLARE
    module_4_id UUID;
BEGIN
    SELECT id INTO module_4_id FROM public.modules WHERE week_number = 4 LIMIT 1;
    
    IF module_4_id IS NOT NULL THEN
        INSERT INTO public.discussion_prompts (module_id, prompt_text, posted_at) VALUES
        (module_4_id, 'What are your self-care practices?', NOW() - INTERVAL '7 days'),
        (module_4_id, 'How do you recognize burnout in yourself?', NOW() - INTERVAL '6 days'),
        (module_4_id, 'Share your experience with peer supervision', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Module 5: Working with Special Populations
DO $$
DECLARE
    module_5_id UUID;
BEGIN
    SELECT id INTO module_5_id FROM public.modules WHERE week_number = 5 LIMIT 1;
    
    IF module_5_id IS NOT NULL THEN
        INSERT INTO public.discussion_prompts (module_id, prompt_text, posted_at) VALUES
        (module_5_id, 'How do you adapt your approach for different populations?', NOW() - INTERVAL '7 days'),
        (module_5_id, 'What cultural factors influence helping in your context?', NOW() - INTERVAL '6 days'),
        (module_5_id, 'Share experiences working with diverse populations', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Module 6: Crisis Intervention & Trauma Counselling
DO $$
DECLARE
    module_6_id UUID;
BEGIN
    SELECT id INTO module_6_id FROM public.modules WHERE week_number = 6 LIMIT 1;
    
    IF module_6_id IS NOT NULL THEN
        INSERT INTO public.discussion_prompts (module_id, prompt_text, posted_at) VALUES
        (module_6_id, 'Describe a crisis situation you''ve encountered', NOW() - INTERVAL '7 days'),
        (module_6_id, 'What grounding techniques work best?', NOW() - INTERVAL '6 days'),
        (module_6_id, 'How do you ensure safety in crisis?', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Module 7: Group Counselling & Peer Support
DO $$
DECLARE
    module_7_id UUID;
BEGIN
    SELECT id INTO module_7_id FROM public.modules WHERE week_number = 7 LIMIT 1;
    
    IF module_7_id IS NOT NULL THEN
        INSERT INTO public.discussion_prompts (module_id, prompt_text, posted_at) VALUES
        (module_7_id, 'What makes a good group facilitator?', NOW() - INTERVAL '7 days'),
        (module_7_id, 'Share experiences with peer support', NOW() - INTERVAL '6 days'),
        (module_7_id, 'How would you design a peer support program?', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Module 8: Case Analysis & Feedback
DO $$
DECLARE
    module_8_id UUID;
BEGIN
    SELECT id INTO module_8_id FROM public.modules WHERE week_number = 8 LIMIT 1;
    
    IF module_8_id IS NOT NULL THEN
        INSERT INTO public.discussion_prompts (module_id, prompt_text, posted_at) VALUES
        (module_8_id, 'What makes effective case analysis?', NOW() - INTERVAL '7 days'),
        (module_8_id, 'How do you give constructive feedback?', NOW() - INTERVAL '6 days'),
        (module_8_id, 'Share a case analysis experience', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Module 9: Final Projects & Wrap-Up
DO $$
DECLARE
    module_9_id UUID;
BEGIN
    SELECT id INTO module_9_id FROM public.modules WHERE week_number = 9 LIMIT 1;
    
    IF module_9_id IS NOT NULL THEN
        INSERT INTO public.discussion_prompts (module_id, prompt_text, posted_at) VALUES
        (module_9_id, 'Share your final project ideas', NOW() - INTERVAL '7 days'),
        (module_9_id, 'What skills have you developed most?', NOW() - INTERVAL '6 days'),
        (module_9_id, 'How will you apply your learning?', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
