-- Seed Assignments for all modules
-- Based on CONTENT_STRUCTURE.md assignments

-- Module 1: Helping Profession, Ethics, Cultural Competence
DO $$
DECLARE
    module_1_id UUID;
    assignment_1_id UUID;
BEGIN
    SELECT id INTO module_1_id FROM public.modules WHERE week_number = 1 LIMIT 1;
    
    IF module_1_id IS NOT NULL THEN
        INSERT INTO public.assignments (module_id, title, description, assignment_type, instructions, due_date, max_points)
        VALUES (
            module_1_id,
            'Ethics and Cultural Competence Reflection',
            'Reflect on your motivations, ethical considerations, and cultural awareness',
            'reflection',
            'Write a 500-750 word reflection addressing:
1. What motivates you to help others?
2. How do you maintain ethical boundaries in helping relationships?
3. How do cultural values influence helping in your community?
4. Share a specific example of maintaining boundaries in a helping situation.',
            NOW() + INTERVAL '7 days',
            100
        )
        RETURNING id INTO assignment_1_id;
    END IF;
END $$;

-- Module 2: Exploration & Insight Stages, Trauma-Informed Practice
DO $$
DECLARE
    module_2_id UUID;
BEGIN
    SELECT id INTO module_2_id FROM public.modules WHERE week_number = 2 LIMIT 1;
    
    IF module_2_id IS NOT NULL THEN
        INSERT INTO public.assignments (module_id, title, description, assignment_type, instructions, due_date, max_points)
        VALUES (
            module_2_id,
            'Active Listening Practice',
            'Practice active listening with a peer and reflect on the experience',
            'practice',
            '1. Find a partner (can be a peer, friend, or family member)
2. Practice active listening for 15-20 minutes
3. Write a reflection (300-500 words) covering:
   - What active listening techniques did you use?
   - What challenges did you face?
   - How did the speaker respond?
   - What did you learn about yourself as a listener?',
            NOW() + INTERVAL '7 days',
            100
        );
    END IF;
END $$;

-- Module 3: Action Stage, Conflict Resolution
DO $$
DECLARE
    module_3_id UUID;
BEGIN
    SELECT id INTO module_3_id FROM public.modules WHERE week_number = 3 LIMIT 1;
    
    IF module_3_id IS NOT NULL THEN
        INSERT INTO public.assignments (module_id, title, description, assignment_type, instructions, due_date, max_points)
        VALUES (
            module_3_id,
            'Conflict Resolution Case Study',
            'Analyze a conflict case study and propose resolution strategies',
            'case_study',
            'Read Case 4: Domestic Conflict (Ngozi) and complete the following:
1. Identify the core issues in the conflict
2. Analyze the cultural and contextual factors
3. Propose 3-5 specific conflict resolution strategies
4. Explain how you would support Ngozi without escalating the situation
5. Discuss when and how you would involve community leaders or refer to other services

Submit a 600-800 word analysis.',
            NOW() + INTERVAL '7 days',
            100
        );
    END IF;
END $$;

-- Module 4: Self-Care & Supervision
DO $$
DECLARE
    module_4_id UUID;
BEGIN
    SELECT id INTO module_4_id FROM public.modules WHERE week_number = 4 LIMIT 1;
    
    IF module_4_id IS NOT NULL THEN
        INSERT INTO public.assignments (module_id, title, description, assignment_type, instructions, due_date, max_points)
        VALUES (
            module_4_id,
            'Personal Self-Care Plan',
            'Complete a comprehensive self-care plan using the template',
            'worksheet',
            'Complete the Self-Care Plan Template (Worksheet 5) covering:
1. Physical self-care activities
2. Emotional self-care strategies
3. Spiritual practices
4. Social connections
5. Boundary setting
6. Commitment statements

Submit your completed plan (can be written, typed, or uploaded as a document).',
            NOW() + INTERVAL '7 days',
            100
        );
    END IF;
END $$;

-- Module 5: Working with Special Populations
DO $$
DECLARE
    module_5_id UUID;
BEGIN
    SELECT id INTO module_5_id FROM public.modules WHERE week_number = 5 LIMIT 1;
    
    IF module_5_id IS NOT NULL THEN
        INSERT INTO public.assignments (module_id, title, description, assignment_type, instructions, due_date, max_points)
        VALUES (
            module_5_id,
            'Special Populations Case Study',
            'Analyze a case study and discuss population-specific considerations',
            'case_study',
            'Choose one case study (Case 1: Student with Depression, or Case 3: Disability Stigma) and complete:
1. Identify the specific challenges faced by this population
2. Discuss cultural factors that influence the situation
3. Propose culturally sensitive helping approaches
4. Explain how you would adapt your helping style
5. Identify appropriate resources or referrals

Submit a 600-800 word analysis.',
            NOW() + INTERVAL '7 days',
            100
        );
    END IF;
END $$;

-- Module 6: Crisis Intervention & Trauma Counselling
DO $$
DECLARE
    module_6_id UUID;
BEGIN
    SELECT id INTO module_6_id FROM public.modules WHERE week_number = 6 LIMIT 1;
    
    IF module_6_id IS NOT NULL THEN
        INSERT INTO public.assignments (module_id, title, description, assignment_type, instructions, due_date, max_points)
        VALUES (
            module_6_id,
            'Crisis Intervention Response Plan',
            'Develop a crisis response plan for a given scenario',
            'project',
            'Create a crisis intervention response plan for the following scenario:
"A 16-year-old student comes to you after school, visibly distressed, saying they want to hurt themselves."

Your plan should include:
1. Immediate safety steps
2. Grounding techniques to use
3. Questions to ask
4. Support resources to connect them with
5. Follow-up plan

Submit a 500-700 word response plan.',
            NOW() + INTERVAL '7 days',
            100
        );
    END IF;
END $$;

-- Module 7: Group Counselling & Peer Support
DO $$
DECLARE
    module_7_id UUID;
BEGIN
    SELECT id INTO module_7_id FROM public.modules WHERE week_number = 7 LIMIT 1;
    
    IF module_7_id IS NOT NULL THEN
        INSERT INTO public.assignments (module_id, title, description, assignment_type, instructions, due_date, max_points)
        VALUES (
            module_7_id,
            'Peer Support Program Design',
            'Design a peer support program for your community',
            'project',
            'Complete Worksheet 3: Peer Support Model Design. Design a peer support program including:
1. Target group
2. Purpose and goals
3. Format and structure
4. Rules and guidelines
5. Resources needed
6. Potential challenges and solutions

Submit your completed program design (600-800 words or uploaded document).',
            NOW() + INTERVAL '7 days',
            100
        );
    END IF;
END $$;

-- Module 8: Case Analysis & Feedback
DO $$
DECLARE
    module_8_id UUID;
BEGIN
    SELECT id INTO module_8_id FROM public.modules WHERE week_number = 8 LIMIT 1;
    
    IF module_8_id IS NOT NULL THEN
        INSERT INTO public.assignments (module_id, title, description, assignment_type, instructions, due_date, max_points)
        VALUES (
            module_8_id,
            'Comprehensive Case Analysis',
            'Complete a detailed case analysis using the framework',
            'case_study',
            'Choose any case study from the case study bank and complete Worksheet 4: Case Analysis Template:
1. Presenting issue
2. Context and background
3. Helper''s approach
4. Outcome
5. Lessons learned
6. What you would do differently

Submit your completed case analysis (800-1000 words or uploaded document).',
            NOW() + INTERVAL '7 days',
            100
        );
    END IF;
END $$;

-- Module 9: Final Projects & Wrap-Up
DO $$
DECLARE
    module_9_id UUID;
BEGIN
    SELECT id INTO module_9_id FROM public.modules WHERE week_number = 9 LIMIT 1;
    
    IF module_9_id IS NOT NULL THEN
        INSERT INTO public.assignments (module_id, title, description, assignment_type, instructions, due_date, max_points)
        VALUES (
            module_9_id,
            'Final Capstone Project',
            'Develop and present a project demonstrating integrated skills',
            'project',
            'Create a final project that demonstrates your integrated learning from all 9 modules. Your project can be:
- A case study analysis
- A peer support program design
- A community initiative proposal
- A reflective portfolio
- Another project of your choice (with facilitator approval)

Requirements:
- 1500-2000 words or equivalent
- Demonstrates understanding of all key concepts
- Includes practical application
- Shows cultural sensitivity
- Addresses ethical considerations

Submit your project document and be prepared to present it to your peers.',
            NOW() + INTERVAL '14 days',
            200
        );
    END IF;
END $$;
