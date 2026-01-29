-- Seed Quick Reference Tools from HELP_Foundations_Quick_Reference_Tools document
-- All 8 tools from the document

-- Tool 1: Stages of Helping
INSERT INTO public.quick_reference_tools (tool_type, title, content, display_order) VALUES
('stages_of_helping', 'Stages of Helping', '{
  "description": "The three main stages of the helping process",
  "stages": [
    {
      "stage": "Exploration",
      "description": "Understanding the client''s situation, feelings, and concerns",
      "key_skills": ["Active listening", "Open-ended questions", "Empathy", "Reflection"]
    },
    {
      "stage": "Insight",
      "description": "Helping the client gain understanding and awareness",
      "key_skills": ["Summarizing", "Challenging", "Interpretation", "Feedback"]
    },
    {
      "stage": "Action",
      "description": "Supporting the client in making changes and taking steps",
      "key_skills": ["Goal setting", "Problem solving", "Action planning", "Support"]
    }
  ]
}'::jsonb, 1);

-- Tool 2: Core Ethical Principles
INSERT INTO public.quick_reference_tools (tool_type, title, content, display_order) VALUES
('ethical_principles', 'Core Ethical Principles', '{
  "description": "Fundamental ethical principles for helping professionals",
  "principles": [
    {
      "principle": "Confidentiality",
      "description": "Respecting and protecting client information"
    },
    {
      "principle": "Respect",
      "description": "Valuing the dignity and worth of every person"
    },
    {
      "principle": "Boundaries",
      "description": "Maintaining appropriate professional relationships"
    },
    {
      "principle": "Integrity",
      "description": "Being honest, trustworthy, and ethical in all actions"
    },
    {
      "principle": "Beneficence",
      "description": "Acting in the best interest of the client"
    }
  ]
}'::jsonb, 2);

-- Tool 3: Crisis Intervention Steps
INSERT INTO public.quick_reference_tools (tool_type, title, content, display_order) VALUES
('crisis_intervention', 'Crisis Intervention Steps', '{
  "description": "Six-step framework for crisis intervention",
  "steps": [
    {
      "step": 1,
      "title": "Ensure Safety",
      "description": "Assess and ensure immediate physical and emotional safety"
    },
    {
      "step": 2,
      "title": "Provide Reassurance",
      "description": "Offer calm, supportive presence and reassurance"
    },
    {
      "step": 3,
      "title": "Gather Information",
      "description": "Understand what happened and the person''s current state"
    },
    {
      "step": 4,
      "title": "Offer Practical Support",
      "description": "Provide immediate practical assistance as needed"
    },
    {
      "step": 5,
      "title": "Encourage Coping",
      "description": "Help identify and use coping strategies"
    },
    {
      "step": 6,
      "title": "Plan Next Steps",
      "description": "Develop a plan for immediate and ongoing support"
    }
  ]
}'::jsonb, 3);

-- Tool 4: Self-Care Checklist
INSERT INTO public.quick_reference_tools (tool_type, title, content, display_order) VALUES
('self_care_checklist', 'Self-Care Checklist', '{
  "description": "Comprehensive self-care checklist for helpers",
  "categories": [
    {
      "category": "Physical",
      "items": ["Adequate rest", "Balanced diet", "Regular exercise", "Medical check-ups"]
    },
    {
      "category": "Emotional",
      "items": ["Express feelings", "Seek support", "Practice mindfulness", "Engage in hobbies"]
    },
    {
      "category": "Spiritual",
      "items": ["Meditation/prayer", "Time in nature", "Reflection", "Connection to values"]
    },
    {
      "category": "Social",
      "items": ["Maintain relationships", "Set boundaries", "Ask for help", "Social activities"]
    },
    {
      "category": "Boundaries",
      "items": ["Say no when needed", "Limit work hours", "Take breaks", "Separate work and personal life"]
    }
  ]
}'::jsonb, 4);

-- Tool 5: Active Listening Skills
INSERT INTO public.quick_reference_tools (tool_type, title, content, display_order) VALUES
('active_listening', 'Active Listening Skills', '{
  "description": "Key skills for effective active listening",
  "skills": [
    {
      "skill": "Open-ended Questions",
      "description": "Questions that encourage detailed responses (What? How? Why?)"
    },
    {
      "skill": "Reflect Feelings",
      "description": "Acknowledge and reflect back the emotions you hear"
    },
    {
      "skill": "Paraphrase",
      "description": "Restate what you heard in your own words to confirm understanding"
    },
    {
      "skill": "Summarize",
      "description": "Provide a brief summary of key points discussed"
    },
    {
      "skill": "Allow Silence",
      "description": "Give space for the person to think and process"
    }
  ]
}'::jsonb, 5);

-- Tool 6: Grounding Techniques
INSERT INTO public.quick_reference_tools (tool_type, title, content, display_order) VALUES
('grounding_techniques', 'Grounding Techniques', '{
  "description": "Techniques to help manage anxiety, trauma responses, and overwhelming emotions",
  "techniques": [
    {
      "technique": "5-4-3-2-1 Technique",
      "description": "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste"
    },
    {
      "technique": "Deep Breathing",
      "description": "Breathe in for 4 counts, hold for 4, exhale for 4, repeat"
    },
    {
      "technique": "Body Awareness",
      "description": "Notice physical sensations, where you feel tension, where you feel calm"
    },
    {
      "technique": "Safe Place Visualization",
      "description": "Imagine a safe, peaceful place in detail using all senses"
    },
    {
      "technique": "Hold an Object",
      "description": "Focus on an object - its texture, temperature, weight, details"
    }
  ]
}'::jsonb, 6);

-- Tool 7: Cultural Sensitivity
INSERT INTO public.quick_reference_tools (tool_type, title, content, display_order) VALUES
('cultural_sensitivity', 'Cultural Sensitivity', '{
  "description": "Guidelines for culturally sensitive helping",
  "guidelines": [
    {
      "guideline": "Respect Traditions",
      "description": "Acknowledge and respect cultural traditions and practices"
    },
    {
      "guideline": "Acknowledge Family Roles",
      "description": "Understand the role of family and community in decision-making"
    },
    {
      "guideline": "Avoid Imposing Beliefs",
      "description": "Don''t impose your own cultural values or beliefs"
    },
    {
      "guideline": "Adapt Communication",
      "description": "Adjust your communication style to be culturally appropriate"
    },
    {
      "guideline": "Learn and Ask",
      "description": "Be willing to learn about different cultures and ask respectful questions"
    }
  ]
}'::jsonb, 7);

-- Tool 8: Feedback Tips
INSERT INTO public.quick_reference_tools (tool_type, title, content, display_order) VALUES
('feedback_tips', 'Feedback Tips', '{
  "description": "Guidelines for giving effective, constructive feedback",
  "tips": [
    {
      "tip": "Be Specific",
      "description": "Provide concrete examples rather than vague generalities"
    },
    {
      "tip": "Balance Positive and Improvement",
      "description": "Include both what was done well and areas for growth"
    },
    {
      "tip": "Use ''I'' Statements",
      "description": "Frame feedback from your perspective (I noticed, I observed)"
    },
    {
      "tip": "Offer Suggestions",
      "description": "Provide actionable suggestions for improvement"
    },
    {
      "tip": "Be Timely",
      "description": "Give feedback soon after the observation when relevant"
    },
    {
      "tip": "Focus on Behavior",
      "description": "Focus on observable behaviors, not personality traits"
    }
  ]
}'::jsonb, 8);
