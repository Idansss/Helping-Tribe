-- Seed Final Project
-- Based on HELP Foundations Training - Module 9 Final Projects

-- Insert Final Project for Module 9
DO $$
DECLARE
    module_9_id UUID;
BEGIN
    SELECT id INTO module_9_id FROM public.modules WHERE week_number = 9 LIMIT 1;
    
    IF module_9_id IS NOT NULL THEN
        INSERT INTO public.final_projects (module_id, title, description, requirements, due_date, max_points) VALUES
        (
            module_9_id,
            'Final Capstone Project',
            'Demonstrate your integrated helping skills through a comprehensive final project that showcases your learning throughout the HELP Foundations Training.',
            '{
                "objectives": [
                    "Demonstrate understanding of core helping skills",
                    "Apply ethical principles in practice",
                    "Show cultural competence and sensitivity",
                    "Integrate trauma-informed approaches",
                    "Reflect on personal growth and learning"
                ],
                "deliverables": [
                    "Written project report (1500-2000 words)",
                    "Case study analysis or program design",
                    "Reflection on learning journey",
                    "Presentation (optional but encouraged)"
                ],
                "rubric": {
                    "content_quality": {
                        "weight": 30,
                        "description": "Depth and accuracy of content"
                    },
                    "application_of_skills": {
                        "weight": 25,
                        "description": "Demonstration of helping skills"
                    },
                    "cultural_competence": {
                        "weight": 20,
                        "description": "Cultural sensitivity and awareness"
                    },
                    "reflection": {
                        "weight": 15,
                        "description": "Quality of personal reflection"
                    },
                    "presentation": {
                        "weight": 10,
                        "description": "Clarity and organization"
                    }
                },
                "guidelines": [
                    "Choose a real or hypothetical case study relevant to your community",
                    "Apply at least 3 core helping skills learned in the course",
                    "Demonstrate understanding of ethical boundaries",
                    "Include cultural considerations specific to your context",
                    "Reflect on how this training has impacted your approach to helping others"
                ]
            }'::jsonb,
            '2025-11-30 23:59:00+00', -- Due date from calendar
            100
        );
    END IF;
END $$;
