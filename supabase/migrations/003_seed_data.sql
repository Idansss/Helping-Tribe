-- Seed Data for Helping Tribe LMS
-- Run this after the initial schema migration

-- Insert 9 Modules
INSERT INTO public.modules (title, week_number, description, is_locked) VALUES
('Introduction to Helping Skills', 1, 'Foundation concepts, ethics, and the role of a helper in supporting others through difficult times.', false),
('Active Listening and Communication', 2, 'Core listening techniques, non-verbal communication, and building rapport with those seeking help.', true),
('Empathy and Understanding', 3, 'Developing empathetic connections, understanding emotions, and validating experiences.', true),
('Crisis Intervention', 4, 'Handling crisis situations, de-escalation techniques, and immediate support strategies.', true),
('Trauma-Informed Care', 5, 'Understanding trauma responses, triggers, and creating safe spaces for healing.', true),
('Boundaries and Ethics', 6, 'Professional boundaries, ethical considerations, and maintaining appropriate helper-client relationships.', true),
('Cultural Competency', 7, 'Working with diverse populations, understanding cultural contexts, and inclusive practices.', true),
('Self-Care for Helpers', 8, 'Preventing burnout, recognizing compassion fatigue, and maintaining personal well-being.', true),
('Integration and Practice', 9, 'Putting it all together, case studies, and preparing for real-world application.', true)
ON CONFLICT (week_number) DO NOTHING;

-- Insert Sample Faculty
INSERT INTO public.faculty (name, title, bio, display_order) VALUES
('Dr. Sarah Johnson', 'Lead Instructor', 'Dr. Johnson has over 20 years of experience in counseling, trauma support, and mental health education. She specializes in crisis intervention and trauma-informed care.', 1),
('Prof. Michael Chen', 'Ethics Specialist', 'Professor Chen is an expert in professional ethics, boundaries, and ethical decision-making in helping professions. He has published extensively on ethical practices.', 2),
('Dr. Maria Rodriguez', 'Cultural Competency Expert', 'Dr. Rodriguez brings deep expertise in cultural competency, diversity, and inclusive practices in mental health support.', 3)
ON CONFLICT DO NOTHING;

-- Create Quizzes for Each Module (you'll need to add questions separately)
DO $$
DECLARE
    module_rec RECORD;
BEGIN
    FOR module_rec IN SELECT id, week_number, title FROM public.modules ORDER BY week_number
    LOOP
        INSERT INTO public.quizzes (module_id, title, description, passing_score)
        VALUES (
            module_rec.id,
            'Module ' || module_rec.week_number || ' Assessment',
            'Test your understanding of ' || module_rec.title,
            80
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Insert Sample Quiz Questions for Module 1 (as an example)
-- You can use this as a template for other modules
DO $$
DECLARE
    quiz_id_var UUID;
BEGIN
    -- Get the quiz ID for Module 1
    SELECT id INTO quiz_id_var
    FROM public.quizzes
    WHERE module_id IN (SELECT id FROM public.modules WHERE week_number = 1)
    LIMIT 1;

    IF quiz_id_var IS NOT NULL THEN
        -- Insert 10 sample questions for Module 1
        INSERT INTO public.quiz_questions (quiz_id, question_text, question_number, options) VALUES
        (quiz_id_var, 'What is the primary goal of active listening?', 1, '[
            {"id": "a", "text": "To provide solutions immediately", "is_correct": false},
            {"id": "b", "text": "To understand and validate the speaker''s experience", "is_correct": true},
            {"id": "c", "text": "To share your own similar experiences", "is_correct": false},
            {"id": "d", "text": "To minimize the speaker''s concerns", "is_correct": false}
        ]'::jsonb),
        (quiz_id_var, 'Which of the following is a key principle of trauma-informed care?', 2, '[
            {"id": "a", "text": "Avoid discussing trauma directly", "is_correct": false},
            {"id": "b", "text": "Create a safe, predictable environment", "is_correct": true},
            {"id": "c", "text": "Push for immediate disclosure", "is_correct": false},
            {"id": "d", "text": "Minimize the impact of trauma", "is_correct": false}
        ]'::jsonb),
        (quiz_id_var, 'What does maintaining professional boundaries help prevent?', 3, '[
            {"id": "a", "text": "Effective communication", "is_correct": false},
            {"id": "b", "text": "Burnout and ethical violations", "is_correct": true},
            {"id": "c", "text": "Empathy", "is_correct": false},
            {"id": "d", "text": "Cultural understanding", "is_correct": false}
        ]'::jsonb),
        (quiz_id_var, 'Empathy involves:', 4, '[
            {"id": "a", "text": "Feeling sorry for someone", "is_correct": false},
            {"id": "b", "text": "Understanding and sharing another person''s feelings", "is_correct": true},
            {"id": "c", "text": "Offering immediate solutions", "is_correct": false},
            {"id": "d", "text": "Minimizing emotions", "is_correct": false}
        ]'::jsonb),
        (quiz_id_var, 'In crisis intervention, the first priority is:', 5, '[
            {"id": "a", "text": "Finding long-term solutions", "is_correct": false},
            {"id": "b", "text": "Ensuring safety and stabilization", "is_correct": true},
            {"id": "c", "text": "Diagnosing the problem", "is_correct": false},
            {"id": "d", "text": "Referring to other professionals", "is_correct": false}
        ]'::jsonb),
        (quiz_id_var, 'Cultural competency requires:', 6, '[
            {"id": "a", "text": "Knowing all cultures in detail", "is_correct": false},
            {"id": "b", "text": "Respect, awareness, and openness to learning", "is_correct": true},
            {"id": "c", "text": "Treating everyone the same", "is_correct": false},
            {"id": "d", "text": "Avoiding cultural topics", "is_correct": false}
        ]'::jsonb),
        (quiz_id_var, 'Self-care for helpers is important because:', 7, '[
            {"id": "a", "text": "It prevents helping others", "is_correct": false},
            {"id": "b", "text": "It maintains your ability to help effectively", "is_correct": true},
            {"id": "c", "text": "It is selfish", "is_correct": false},
            {"id": "d", "text": "It is optional", "is_correct": false}
        ]'::jsonb),
        (quiz_id_var, 'What is the purpose of a learning journal?', 8, '[
            {"id": "a", "text": "To share with instructors", "is_correct": false},
            {"id": "b", "text": "To reflect on learning and personal growth", "is_correct": true},
            {"id": "c", "text": "To complete assignments", "is_correct": false},
            {"id": "d", "text": "To demonstrate knowledge", "is_correct": false}
        ]'::jsonb),
        (quiz_id_var, 'Ethical helping practices include:', 9, '[
            {"id": "a", "text": "Sharing client information freely", "is_correct": false},
            {"id": "b", "text": "Maintaining confidentiality and respecting autonomy", "is_correct": true},
            {"id": "c", "text": "Making decisions for clients", "is_correct": false},
            {"id": "d", "text": "Avoiding documentation", "is_correct": false}
        ]'::jsonb),
        (quiz_id_var, 'The HELP Foundations Training emphasizes:', 10, '[
            {"id": "a", "text": "Quick fixes and solutions", "is_correct": false},
            {"id": "b", "text": "Rigorous, structured learning with community support", "is_correct": true},
            {"id": "c", "text": "Independent study only", "is_correct": false},
            {"id": "d", "text": "Minimal engagement", "is_correct": false}
        ]'::jsonb)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert Sample Lessons for Module 1 (as an example)
DO $$
DECLARE
    module_1_id UUID;
BEGIN
    SELECT id INTO module_1_id FROM public.modules WHERE week_number = 1 LIMIT 1;

    IF module_1_id IS NOT NULL THEN
        INSERT INTO public.lessons (module_id, title, lesson_number, content_html) VALUES
        (module_1_id, 'Welcome to HELP Foundations', 1, '<h2>Welcome to HELP Foundations</h2><p>This course will equip you with foundational helping skills through a structured 9-week program.</p><p>You will learn about counseling, ethics, and trauma support in a supportive, communal environment.</p>'),
        (module_1_id, 'The Role of a Helper', 2, '<h2>The Role of a Helper</h2><p>Understanding your role as a helper is crucial. You are not a therapist, but you can provide valuable support through active listening, empathy, and appropriate boundaries.</p>'),
        (module_1_id, 'Core Ethics and Principles', 3, '<h2>Core Ethics and Principles</h2><p>Ethical helping involves maintaining confidentiality, respecting autonomy, and recognizing your limitations. Always know when to refer to professional services.</p>')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Note: You'll need to add lessons for modules 2-9 and quiz questions for modules 2-9
-- This seed file provides a template and example data for Module 1
