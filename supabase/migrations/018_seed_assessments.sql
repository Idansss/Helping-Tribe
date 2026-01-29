-- Seed Assessment Tools
-- Based on HELP_Foundations_Assessment_Evaluation_Tools document

-- Tool 1: Pre-Training Questionnaire
INSERT INTO public.assessment_tools (tool_type, title, description, questions, is_active) VALUES
('pre_training', 'Pre-Training Questionnaire', 'Assess baseline knowledge and expectations before starting the course', '[
  {
    "id": "q1",
    "type": "textarea",
    "question": "What do you hope to gain from this HELP Foundations Training?",
    "required": true
  },
  {
    "id": "q2",
    "type": "scale",
    "question": "How confident do you feel in your helping and counselling skills right now?",
    "scale": {
      "min": 1,
      "max": 10,
      "labels": {
        "min": "Not confident at all",
        "max": "Very confident"
      }
    },
    "required": true
  },
  {
    "id": "q3",
    "type": "textarea",
    "question": "Have you received any previous training in helping, counselling, or related fields? If yes, please describe.",
    "required": false
  },
  {
    "id": "q4",
    "type": "textarea",
    "question": "What are the main challenges you currently face when trying to help others in your community?",
    "required": true
  },
  {
    "id": "q5",
    "type": "textarea",
    "question": "What topics or skills are you most interested in learning about during this training?",
    "required": true
  },
  {
    "id": "q6",
    "type": "textarea",
    "question": "Is there anything else you would like us to know about your background, goals, or expectations?",
    "required": false
  }
]'::jsonb, true);

-- Tool 2: Post-Training Questionnaire
INSERT INTO public.assessment_tools (tool_type, title, description, questions, is_active) VALUES
('post_training', 'Post-Training Questionnaire', 'Measure knowledge gained and impact after completing the course', '[
  {
    "id": "q1",
    "type": "textarea",
    "question": "What valuable skills or knowledge have you gained from this training?",
    "required": true
  },
  {
    "id": "q2",
    "type": "scale",
    "question": "How confident do you feel in your helping and counselling skills now?",
    "scale": {
      "min": 1,
      "max": 10,
      "labels": {
        "min": "Not confident at all",
        "max": "Very confident"
      }
    },
    "required": true
  },
  {
    "id": "q3",
    "type": "textarea",
    "question": "What challenges do you anticipate facing when applying these skills in your community?",
    "required": true
  },
  {
    "id": "q4",
    "type": "textarea",
    "question": "Which module or topic was most useful to you? Why?",
    "required": true
  },
  {
    "id": "q5",
    "type": "textarea",
    "question": "How do you plan to use what you have learned in your work or community?",
    "required": true
  },
  {
    "id": "q6",
    "type": "textarea",
    "question": "What suggestions do you have for improving this training program?",
    "required": false
  }
]'::jsonb, true);

-- Tool 3: Session Feedback Form
INSERT INTO public.assessment_tools (tool_type, title, description, questions, is_active) VALUES
('session_feedback', 'Session Feedback Form', 'Continuous improvement feedback after each module session', '[
  {
    "id": "q1",
    "type": "scale",
    "question": "How clear was the content presented in this session?",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": {
        "min": "Not clear at all",
        "max": "Very clear"
      }
    },
    "required": true
  },
  {
    "id": "q2",
    "type": "scale",
    "question": "How helpful were the activities and exercises?",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": {
        "min": "Not helpful",
        "max": "Very helpful"
      }
    },
    "required": true
  },
  {
    "id": "q3",
    "type": "scale",
    "question": "How would you rate the learning environment?",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": {
        "min": "Poor",
        "max": "Excellent"
      }
    },
    "required": true
  },
  {
    "id": "q4",
    "type": "textarea",
    "question": "What was most useful about this session?",
    "required": true
  },
  {
    "id": "q5",
    "type": "textarea",
    "question": "What improvements would you suggest for this session?",
    "required": false
  },
  {
    "id": "q6",
    "type": "textarea",
    "question": "Any additional comments or feedback?",
    "required": false
  }
]'::jsonb, true);

-- Tool 4: Final Course Evaluation Form
INSERT INTO public.assessment_tools (tool_type, title, description, questions, is_active) VALUES
('final_evaluation', 'Final Course Evaluation Form', 'Evaluate overall course effectiveness and logistics', '[
  {
    "id": "q1",
    "type": "scale",
    "question": "Overall, how satisfied are you with this training program?",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": {
        "min": "Very dissatisfied",
        "max": "Very satisfied"
      }
    },
    "required": true
  },
  {
    "id": "q2",
    "type": "scale",
    "question": "Did this training meet your expectations?",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": {
        "min": "Not at all",
        "max": "Exceeded expectations"
      }
    },
    "required": true
  },
  {
    "id": "q3",
    "type": "scale",
    "question": "How effective were the facilitators?",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": {
        "min": "Not effective",
        "max": "Very effective"
      }
    },
    "required": true
  },
  {
    "id": "q4",
    "type": "scale",
    "question": "How useful were the training materials and resources?",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": {
        "min": "Not useful",
        "max": "Very useful"
      }
    },
    "required": true
  },
  {
    "id": "q5",
    "type": "textarea",
    "question": "What changes do you plan to make in your work or community based on this training?",
    "required": true
  },
  {
    "id": "q6",
    "type": "textarea",
    "question": "What would you recommend to improve this training program for future participants?",
    "required": false
  },
  {
    "id": "q7",
    "type": "textarea",
    "question": "Would you recommend this training to others? Why or why not?",
    "required": true
  },
  {
    "id": "q8",
    "type": "textarea",
    "question": "Any additional comments or suggestions?",
    "required": false
  }
]'::jsonb, true);
