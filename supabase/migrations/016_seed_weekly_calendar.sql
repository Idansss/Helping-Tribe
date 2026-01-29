-- Seed Weekly Calendar Events
-- Based on HELP Foundations Training Weekly Calendar (Sept 22 – Nov 30, 2025)

-- Orientation Week (Sept 22-28, 2025)
INSERT INTO public.weekly_events (week_number, event_type, title, description, scheduled_date) VALUES
(0, 'info_session', 'Info Session - Monday', 'Course overview and expectations', '2025-09-22 10:00:00+00'),
(0, 'info_session', 'Info Session - Tuesday', 'Platform tour and Q&A', '2025-09-23 10:00:00+00'),
(0, 'info_session', 'Info Session - Wednesday', 'Course structure and requirements', '2025-09-24 10:00:00+00'),
(0, 'info_session', 'Info Session - Thursday', 'Learning resources and support', '2025-09-25 10:00:00+00'),
(0, 'info_session', 'Info Session - Friday', 'Final questions and preparation', '2025-09-26 10:00:00+00'),
(0, 'orientation', 'Orientation & Q&A Session', 'Live Q&A and cohort introduction', '2025-09-27 14:00:00+00'),
(0, 'wrap_up', 'Wrap-Up & Feedback', 'Orientation feedback and pre-training assessment', '2025-09-28 16:00:00+00');

-- Week 1 (Sept 29 - Oct 5, 2025)
DO $$
DECLARE
    module_1_id UUID;
BEGIN
    SELECT id INTO module_1_id FROM public.modules WHERE week_number = 1 LIMIT 1;
    
    IF module_1_id IS NOT NULL THEN
        INSERT INTO public.weekly_events (module_id, week_number, event_type, title, description, scheduled_date) VALUES
        (module_1_id, 1, 'discussion_prompt', 'Discussion Prompt Posted', 'Module 1 discussion prompts available', '2025-09-29 09:00:00+00'),
        (module_1_id, 1, 'peer_circle', 'Peer Learning Circle', 'Scheduled peer learning circle meeting', '2025-10-01 14:00:00+00'),
        (module_1_id, 1, 'quiz', 'Weekly Quiz Available', 'Module 1 quiz opens', '2025-10-03 09:00:00+00'),
        (module_1_id, 1, 'assignment_due', 'Assignment Due', 'Module 1 assignment submission deadline', '2025-10-05 23:59:00+00'),
        (module_1_id, 1, 'facilitator_session', 'Facilitator-Led Session', 'Live facilitator session', '2025-10-04 14:00:00+00'),
        (module_1_id, 1, 'wrap_up', 'Wrap-Up & Feedback', 'Week 1 wrap-up and feedback session', '2025-10-05 16:00:00+00');
    END IF;
END $$;

-- Week 2 (Oct 6-12, 2025)
DO $$
DECLARE
    module_2_id UUID;
BEGIN
    SELECT id INTO module_2_id FROM public.modules WHERE week_number = 2 LIMIT 1;
    
    IF module_2_id IS NOT NULL THEN
        INSERT INTO public.weekly_events (module_id, week_number, event_type, title, description, scheduled_date) VALUES
        (module_2_id, 2, 'discussion_prompt', 'Discussion Prompt Posted', 'Module 2 discussion prompts available', '2025-10-06 09:00:00+00'),
        (module_2_id, 2, 'peer_circle', 'Peer Learning Circle', 'Scheduled peer learning circle meeting', '2025-10-08 14:00:00+00'),
        (module_2_id, 2, 'quiz', 'Weekly Quiz Available', 'Module 2 quiz opens', '2025-10-10 09:00:00+00'),
        (module_2_id, 2, 'assignment_due', 'Assignment Due', 'Module 2 assignment submission deadline', '2025-10-12 23:59:00+00'),
        (module_2_id, 2, 'facilitator_session', 'Facilitator-Led Session', 'Live facilitator session', '2025-10-11 14:00:00+00'),
        (module_2_id, 2, 'wrap_up', 'Wrap-Up & Feedback', 'Week 2 wrap-up and feedback session', '2025-10-12 16:00:00+00');
    END IF;
END $$;

-- Week 3 (Oct 13-19, 2025)
DO $$
DECLARE
    module_3_id UUID;
BEGIN
    SELECT id INTO module_3_id FROM public.modules WHERE week_number = 3 LIMIT 1;
    
    IF module_3_id IS NOT NULL THEN
        INSERT INTO public.weekly_events (module_id, week_number, event_type, title, description, scheduled_date) VALUES
        (module_3_id, 3, 'discussion_prompt', 'Discussion Prompt Posted', 'Module 3 discussion prompts available', '2025-10-13 09:00:00+00'),
        (module_3_id, 3, 'peer_circle', 'Peer Learning Circle', 'Scheduled peer learning circle meeting', '2025-10-15 14:00:00+00'),
        (module_3_id, 3, 'quiz', 'Weekly Quiz Available', 'Module 3 quiz opens', '2025-10-17 09:00:00+00'),
        (module_3_id, 3, 'assignment_due', 'Assignment Due', 'Module 3 assignment submission deadline', '2025-10-19 23:59:00+00'),
        (module_3_id, 3, 'facilitator_session', 'Facilitator-Led Session', 'Live facilitator session', '2025-10-18 14:00:00+00'),
        (module_3_id, 3, 'wrap_up', 'Wrap-Up & Feedback', 'Week 3 wrap-up and feedback session', '2025-10-19 16:00:00+00');
    END IF;
END $$;

-- Week 4 (Oct 20-26, 2025)
DO $$
DECLARE
    module_4_id UUID;
BEGIN
    SELECT id INTO module_4_id FROM public.modules WHERE week_number = 4 LIMIT 1;
    
    IF module_4_id IS NOT NULL THEN
        INSERT INTO public.weekly_events (module_id, week_number, event_type, title, description, scheduled_date) VALUES
        (module_4_id, 4, 'discussion_prompt', 'Discussion Prompt Posted', 'Module 4 discussion prompts available', '2025-10-20 09:00:00+00'),
        (module_4_id, 4, 'peer_circle', 'Peer Learning Circle', 'Scheduled peer learning circle meeting', '2025-10-22 14:00:00+00'),
        (module_4_id, 4, 'quiz', 'Weekly Quiz Available', 'Module 4 quiz opens', '2025-10-24 09:00:00+00'),
        (module_4_id, 4, 'assignment_due', 'Assignment Due', 'Module 4 assignment submission deadline', '2025-10-26 23:59:00+00'),
        (module_4_id, 4, 'facilitator_session', 'Facilitator-Led Session', 'Live facilitator session', '2025-10-25 14:00:00+00'),
        (module_4_id, 4, 'wrap_up', 'Wrap-Up & Feedback', 'Week 4 wrap-up and feedback session', '2025-10-26 16:00:00+00');
    END IF;
END $$;

-- Week 5 (Oct 27 - Nov 2, 2025) - Practicum begins
DO $$
DECLARE
    module_5_id UUID;
BEGIN
    SELECT id INTO module_5_id FROM public.modules WHERE week_number = 5 LIMIT 1;
    
    IF module_5_id IS NOT NULL THEN
        INSERT INTO public.weekly_events (module_id, week_number, event_type, title, description, scheduled_date) VALUES
        (module_5_id, 5, 'discussion_prompt', 'Discussion Prompt Posted', 'Module 5 discussion prompts available', '2025-10-27 09:00:00+00'),
        (module_5_id, 5, 'peer_circle', 'Peer Learning Circle', 'Scheduled peer learning circle meeting', '2025-10-29 14:00:00+00'),
        (module_5_id, 5, 'quiz', 'Weekly Quiz Available', 'Module 5 quiz opens', '2025-10-31 09:00:00+00'),
        (module_5_id, 5, 'assignment_due', 'Assignment Due', 'Module 5 assignment submission deadline', '2025-11-02 23:59:00+00'),
        (module_5_id, 5, 'facilitator_session', 'Supervised Practice', 'Supervised practice session', '2025-11-01 14:00:00+00'),
        (module_5_id, 5, 'wrap_up', 'Reflective Wrap-Up', 'Week 5 reflective wrap-up', '2025-11-02 16:00:00+00');
    END IF;
END $$;

-- Week 6 (Nov 3-9, 2025)
DO $$
DECLARE
    module_6_id UUID;
BEGIN
    SELECT id INTO module_6_id FROM public.modules WHERE week_number = 6 LIMIT 1;
    
    IF module_6_id IS NOT NULL THEN
        INSERT INTO public.weekly_events (module_id, week_number, event_type, title, description, scheduled_date) VALUES
        (module_6_id, 6, 'discussion_prompt', 'Discussion Prompt Posted', 'Module 6 discussion prompts available', '2025-11-03 09:00:00+00'),
        (module_6_id, 6, 'peer_circle', 'Peer Learning Circle', 'Scheduled peer learning circle meeting', '2025-11-05 14:00:00+00'),
        (module_6_id, 6, 'quiz', 'Weekly Quiz Available', 'Module 6 quiz opens', '2025-11-07 09:00:00+00'),
        (module_6_id, 6, 'assignment_due', 'Assignment Due', 'Module 6 assignment submission deadline', '2025-11-09 23:59:00+00'),
        (module_6_id, 6, 'facilitator_session', 'Supervised Practice', 'Supervised practice session', '2025-11-08 14:00:00+00'),
        (module_6_id, 6, 'wrap_up', 'Reflective Wrap-Up', 'Week 6 reflective wrap-up', '2025-11-09 16:00:00+00');
    END IF;
END $$;

-- Week 7 (Nov 10-16, 2025)
DO $$
DECLARE
    module_7_id UUID;
BEGIN
    SELECT id INTO module_7_id FROM public.modules WHERE week_number = 7 LIMIT 1;
    
    IF module_7_id IS NOT NULL THEN
        INSERT INTO public.weekly_events (module_id, week_number, event_type, title, description, scheduled_date) VALUES
        (module_7_id, 7, 'discussion_prompt', 'Discussion Prompt Posted', 'Module 7 discussion prompts available', '2025-11-10 09:00:00+00'),
        (module_7_id, 7, 'peer_circle', 'Peer-Led Case Presentations', 'Peer-led case presentations', '2025-11-12 14:00:00+00'),
        (module_7_id, 7, 'quiz', 'Weekly Quiz Available', 'Module 7 quiz opens', '2025-11-14 09:00:00+00'),
        (module_7_id, 7, 'assignment_due', 'Assignment Due', 'Module 7 assignment submission deadline', '2025-11-16 23:59:00+00'),
        (module_7_id, 7, 'facilitator_session', 'Peer-Led Case Presentations', 'Peer-led case presentations', '2025-11-15 14:00:00+00'),
        (module_7_id, 7, 'wrap_up', 'Reflective Wrap-Up', 'Week 7 reflective wrap-up', '2025-11-16 16:00:00+00');
    END IF;
END $$;

-- Week 8 (Nov 17-23, 2025)
DO $$
DECLARE
    module_8_id UUID;
BEGIN
    SELECT id INTO module_8_id FROM public.modules WHERE week_number = 8 LIMIT 1;
    
    IF module_8_id IS NOT NULL THEN
        INSERT INTO public.weekly_events (module_id, week_number, event_type, title, description, scheduled_date) VALUES
        (module_8_id, 8, 'discussion_prompt', 'Discussion Prompt Posted', 'Module 8 discussion prompts available', '2025-11-17 09:00:00+00'),
        (module_8_id, 8, 'peer_circle', 'Peer Learning Circle', 'Scheduled peer learning circle meeting', '2025-11-19 14:00:00+00'),
        (module_8_id, 8, 'quiz', 'Weekly Quiz Available', 'Module 8 quiz opens', '2025-11-21 09:00:00+00'),
        (module_8_id, 8, 'assignment_due', 'Assignment Due', 'Module 8 assignment submission deadline', '2025-11-23 23:59:00+00'),
        (module_8_id, 8, 'facilitator_session', 'Facilitator Feedback Session', 'Facilitator feedback on case analysis', '2025-11-22 14:00:00+00'),
        (module_8_id, 8, 'wrap_up', 'Reflective Wrap-Up', 'Week 8 reflective wrap-up', '2025-11-23 16:00:00+00');
    END IF;
END $$;

-- Week 9 (Nov 24-30, 2025) - Final week
DO $$
DECLARE
    module_9_id UUID;
BEGIN
    SELECT id INTO module_9_id FROM public.modules WHERE week_number = 9 LIMIT 1;
    
    IF module_9_id IS NOT NULL THEN
        INSERT INTO public.weekly_events (module_id, week_number, event_type, title, description, scheduled_date) VALUES
        (module_9_id, 9, 'discussion_prompt', 'Discussion Prompt Posted', 'Module 9 discussion prompts available', '2025-11-24 09:00:00+00'),
        (module_9_id, 9, 'peer_circle', 'Peer Learning Circle', 'Final peer learning circle meeting', '2025-11-26 14:00:00+00'),
        (module_9_id, 9, 'quiz', 'Weekly Quiz Available', 'Module 9 quiz opens', '2025-11-28 09:00:00+00'),
        (module_9_id, 9, 'assignment_due', 'Final Project Due', 'Final capstone project submission deadline', '2025-11-30 23:59:00+00'),
        (module_9_id, 9, 'facilitator_session', 'Final Project Presentations', 'Final project presentations and peer feedback', '2025-11-29 14:00:00+00'),
        (module_9_id, 9, 'wrap_up', 'Graduation & Evaluation', 'Graduation ceremony and course evaluation', '2025-11-30 16:00:00+00');
    END IF;
END $$;
