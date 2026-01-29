// Learning Journal Prompts for HELP Foundations Training
// Based on the Learning Journal document

export interface JournalPrompt {
  id: string
  question: string
  placeholder?: string
}

export interface ModulePrompts {
  moduleNumber: number
  moduleTitle: string
  prompts: JournalPrompt[]
  endOfCourse?: boolean
}

export const JOURNAL_PROMPTS: Record<number, ModulePrompts> = {
  1: {
    moduleNumber: 1,
    moduleTitle: 'Helping Profession, Ethics, Cultural Competence',
    prompts: [
      {
        id: 'm1-insight',
        question: 'What is one key insight you gained from this module?',
        placeholder: 'Reflect on the most important learning or realization from this module...'
      },
      {
        id: 'm1-connection',
        question: 'How does this learning connect with your personal or professional experience?',
        placeholder: 'Think about how the concepts relate to your own life or work...'
      },
      {
        id: 'm1-strengths',
        question: 'What strengths did you notice in yourself during this session?',
        placeholder: 'Consider what you did well or what came naturally to you...'
      },
      {
        id: 'm1-challenges',
        question: 'What challenges did you face, and how might you overcome them?',
        placeholder: 'Reflect on any difficulties and potential solutions...'
      },
      {
        id: 'm1-application',
        question: 'How will you apply this knowledge or skill in your daily life or community?',
        placeholder: 'Think about concrete ways to use what you learned...'
      }
    ]
  },
  2: {
    moduleNumber: 2,
    moduleTitle: 'Exploration & Insight Stages, Trauma-Informed Practice',
    prompts: [
      {
        id: 'm2-insight',
        question: 'What is one key insight you gained from this module?',
        placeholder: 'Reflect on the most important learning or realization from this module...'
      },
      {
        id: 'm2-connection',
        question: 'How does this learning connect with your personal or professional experience?',
        placeholder: 'Think about how the concepts relate to your own life or work...'
      },
      {
        id: 'm2-strengths',
        question: 'What strengths did you notice in yourself during this session?',
        placeholder: 'Consider what you did well or what came naturally to you...'
      },
      {
        id: 'm2-challenges',
        question: 'What challenges did you face, and how might you overcome them?',
        placeholder: 'Reflect on any difficulties and potential solutions...'
      },
      {
        id: 'm2-application',
        question: 'How will you apply this knowledge or skill in your daily life or community?',
        placeholder: 'Think about concrete ways to use what you learned...'
      }
    ]
  },
  3: {
    moduleNumber: 3,
    moduleTitle: 'Action Stage, Conflict Resolution',
    prompts: [
      {
        id: 'm3-insight',
        question: 'What is one key insight you gained from this module?',
        placeholder: 'Reflect on the most important learning or realization from this module...'
      },
      {
        id: 'm3-connection',
        question: 'How does this learning connect with your personal or professional experience?',
        placeholder: 'Think about how the concepts relate to your own life or work...'
      },
      {
        id: 'm3-strengths',
        question: 'What strengths did you notice in yourself during this session?',
        placeholder: 'Consider what you did well or what came naturally to you...'
      },
      {
        id: 'm3-challenges',
        question: 'What challenges did you face, and how might you overcome them?',
        placeholder: 'Reflect on any difficulties and potential solutions...'
      },
      {
        id: 'm3-application',
        question: 'How will you apply this knowledge or skill in your daily life or community?',
        placeholder: 'Think about concrete ways to use what you learned...'
      }
    ]
  },
  4: {
    moduleNumber: 4,
    moduleTitle: 'Self-Care & Supervision',
    prompts: [
      {
        id: 'm4-insight',
        question: 'What is one key insight you gained from this module?',
        placeholder: 'Reflect on the most important learning or realization from this module...'
      },
      {
        id: 'm4-connection',
        question: 'How does this learning connect with your personal or professional experience?',
        placeholder: 'Think about how the concepts relate to your own life or work...'
      },
      {
        id: 'm4-strengths',
        question: 'What strengths did you notice in yourself during this session?',
        placeholder: 'Consider what you did well or what came naturally to you...'
      },
      {
        id: 'm4-challenges',
        question: 'What challenges did you face, and how might you overcome them?',
        placeholder: 'Reflect on any difficulties and potential solutions...'
      },
      {
        id: 'm4-application',
        question: 'How will you apply this knowledge or skill in your daily life or community?',
        placeholder: 'Think about concrete ways to use what you learned...'
      }
    ]
  },
  5: {
    moduleNumber: 5,
    moduleTitle: 'Working with Special Populations',
    prompts: [
      {
        id: 'm5-insight',
        question: 'What is one key insight you gained from this module?',
        placeholder: 'Reflect on the most important learning or realization from this module...'
      },
      {
        id: 'm5-connection',
        question: 'How does this learning connect with your personal or professional experience?',
        placeholder: 'Think about how the concepts relate to your own life or work...'
      },
      {
        id: 'm5-strengths',
        question: 'What strengths did you notice in yourself during this session?',
        placeholder: 'Consider what you did well or what came naturally to you...'
      },
      {
        id: 'm5-challenges',
        question: 'What challenges did you face, and how might you overcome them?',
        placeholder: 'Reflect on any difficulties and potential solutions...'
      },
      {
        id: 'm5-application',
        question: 'How will you apply this knowledge or skill in your daily life or community?',
        placeholder: 'Think about concrete ways to use what you learned...'
      }
    ]
  },
  6: {
    moduleNumber: 6,
    moduleTitle: 'Crisis Intervention & Trauma Counselling',
    prompts: [
      {
        id: 'm6-insight',
        question: 'What is one key insight you gained from this module?',
        placeholder: 'Reflect on the most important learning or realization from this module...'
      },
      {
        id: 'm6-connection',
        question: 'How does this learning connect with your personal or professional experience?',
        placeholder: 'Think about how the concepts relate to your own life or work...'
      },
      {
        id: 'm6-strengths',
        question: 'What strengths did you notice in yourself during this session?',
        placeholder: 'Consider what you did well or what came naturally to you...'
      },
      {
        id: 'm6-challenges',
        question: 'What challenges did you face, and how might you overcome them?',
        placeholder: 'Reflect on any difficulties and potential solutions...'
      },
      {
        id: 'm6-application',
        question: 'How will you apply this knowledge or skill in your daily life or community?',
        placeholder: 'Think about concrete ways to use what you learned...'
      }
    ]
  },
  7: {
    moduleNumber: 7,
    moduleTitle: 'Group Counselling & Peer Support',
    prompts: [
      {
        id: 'm7-insight',
        question: 'What is one key insight you gained from this module?',
        placeholder: 'Reflect on the most important learning or realization from this module...'
      },
      {
        id: 'm7-connection',
        question: 'How does this learning connect with your personal or professional experience?',
        placeholder: 'Think about how the concepts relate to your own life or work...'
      },
      {
        id: 'm7-strengths',
        question: 'What strengths did you notice in yourself during this session?',
        placeholder: 'Consider what you did well or what came naturally to you...'
      },
      {
        id: 'm7-challenges',
        question: 'What challenges did you face, and how might you overcome them?',
        placeholder: 'Reflect on any difficulties and potential solutions...'
      },
      {
        id: 'm7-application',
        question: 'How will you apply this knowledge or skill in your daily life or community?',
        placeholder: 'Think about concrete ways to use what you learned...'
      }
    ]
  },
  8: {
    moduleNumber: 8,
    moduleTitle: 'Case Analysis & Feedback',
    prompts: [
      {
        id: 'm8-insight',
        question: 'What is one key insight you gained from this module?',
        placeholder: 'Reflect on the most important learning or realization from this module...'
      },
      {
        id: 'm8-connection',
        question: 'How does this learning connect with your personal or professional experience?',
        placeholder: 'Think about how the concepts relate to your own life or work...'
      },
      {
        id: 'm8-strengths',
        question: 'What strengths did you notice in yourself during this session?',
        placeholder: 'Consider what you did well or what came naturally to you...'
      },
      {
        id: 'm8-challenges',
        question: 'What challenges did you face, and how might you overcome them?',
        placeholder: 'Reflect on any difficulties and potential solutions...'
      },
      {
        id: 'm8-application',
        question: 'How will you apply this knowledge or skill in your daily life or community?',
        placeholder: 'Think about concrete ways to use what you learned...'
      }
    ]
  },
  9: {
    moduleNumber: 9,
    moduleTitle: 'Final Projects & Wrap-Up',
    prompts: [
      {
        id: 'm9-insight',
        question: 'What is one key insight you gained from this module?',
        placeholder: 'Reflect on the most important learning or realization from this module...'
      },
      {
        id: 'm9-connection',
        question: 'How does this learning connect with your personal or professional experience?',
        placeholder: 'Think about how the concepts relate to your own life or work...'
      },
      {
        id: 'm9-strengths',
        question: 'What strengths did you notice in yourself during this session?',
        placeholder: 'Consider what you did well or what came naturally to you...'
      },
      {
        id: 'm9-challenges',
        question: 'What challenges did you face, and how might you overcome them?',
        placeholder: 'Reflect on any difficulties and potential solutions...'
      },
      {
        id: 'm9-application',
        question: 'How will you apply this knowledge or skill in your daily life or community?',
        placeholder: 'Think about concrete ways to use what you learned...'
      },
      {
        id: 'eoc-lessons',
        question: 'Looking back at all the modules, what are the three most important lessons you learned?',
        placeholder: 'Reflect on your entire learning journey and identify the most significant takeaways...'
      },
      {
        id: 'eoc-confidence',
        question: 'How has your confidence in helping others changed from the beginning of the course?',
        placeholder: 'Compare your confidence level now to when you started...'
      },
      {
        id: 'eoc-growth',
        question: 'What personal growth have you noticed in yourself?',
        placeholder: 'Think about how you have changed or developed as a person...'
      },
      {
        id: 'eoc-goals',
        question: 'What goals will you set for yourself after completing this training?',
        placeholder: 'Consider what you want to achieve next in your helping journey...'
      },
      {
        id: 'eoc-continued',
        question: 'How will you continue practicing self-care and lifelong learning as a helper?',
        placeholder: 'Reflect on your commitment to ongoing growth and well-being...'
      }
    ],
    endOfCourse: true
  }
}

export function getPromptsForModule(weekNumber: number): ModulePrompts | null {
  return JOURNAL_PROMPTS[weekNumber] || null
}

export function getAllPrompts(): ModulePrompts[] {
  return Object.values(JOURNAL_PROMPTS)
}
