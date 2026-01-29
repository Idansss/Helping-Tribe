// Database Types
export type UserRole = 'student' | 'admin' | 'faculty'
export type ModuleStatus = 'locked' | 'unlocked' | 'completed'

export interface Profile {
  id: string
  role: UserRole
  cohort_id: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Cohort {
  id: string
  name: string
  start_date: string
  end_date: string | null
  peer_circle_link: string | null
  created_at: string
  updated_at: string
}

export interface Module {
  id: string
  title: string
  week_number: number
  description: string | null
  content: string | null
  content_url: string | null
  video_url: string | null
  audio_url: string | null
  worksheet_template: Record<string, any> | null
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  lesson_number: number
  content_html: string | null
  video_url: string | null
  audio_url: string | null
  worksheet_template: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  module_id: string | null
  lesson_id: string
  is_completed: boolean
  completed_at: string | null
  worksheet_submission: Record<string, any> | null
  worksheet_submission_url: string | null
  created_at: string
  updated_at: string
}

export interface ModuleProgress {
  id: string
  user_id: string
  module_id: string
  is_completed: boolean
  quiz_score: number | null
  quiz_passed: boolean
  quiz_completed_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string
  module_id: string
  title: string
  description: string | null
  passing_score: number
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  question_number: number
  options: QuizOption[]
  created_at: string
  updated_at: string
}

export interface QuizOption {
  id: string
  text: string
  is_correct: boolean
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  score: number
  passed: boolean
  answers: Record<string, string>
  completed_at: string
  created_at: string
}

export interface LearningJournal {
  id: string
  user_id: string
  module_id: string
  content: string
  reflection_type?: string
  prompts_answered?: Record<string, string>
  attachments?: Array<{ url: string; name: string; type: string }>
  created_at: string
  updated_at: string
}

export interface FinalExamSubmission {
  id: string
  user_id: string
  file_url: string
  file_name: string
  submitted_at: string
  graded: boolean
  grade: number | null
  feedback: string | null
  created_at: string
}

export interface Certificate {
  id: string
  user_id: string
  certificate_url: string
  issued_at: string
  created_at: string
}

export interface Faculty {
  id: string
  name: string
  title: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  display_order: number | null
  created_at: string
  updated_at: string
}

// UI Component Types
export interface CourseProgress {
  totalModules: number
  completedModules: number
  completionPercentage: number
  currentModule: number | null
  nextModule: number | null
}

export interface ModuleWithProgress extends Module {
  progress?: ModuleProgress
  lessons?: Lesson[]
  isUnlocked: boolean
}
