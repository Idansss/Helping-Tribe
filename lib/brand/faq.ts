import { SITE_CONFIG } from '@/lib/brand/site-config'

export type Faq = {
  question: string
  answer: string
}

/**
 * Single source of truth for the public FAQ. The landing section and the
 * FAQPage structured data are both built from this array so they can never
 * drift apart.
 */
export const FAQS: readonly Faq[] = [
  {
    question: 'Who is the programme for?',
    answer:
      'It is designed for people who want structured foundational helping skills, including community workers, educators, caregivers, health workers, ministry leaders and aspiring counsellors.',
  },
  {
    question: 'How long is the learning journey?',
    answer: `The current programme structure spans ${SITE_CONFIG.programme.durationWeeks.value} guided weeks, with modules, practice activities, reflection and peer learning.`,
  },
  {
    question: 'How does the application work?',
    answer:
      'You submit the secure application, receive an admissions decision, complete payment if approved, and then receive the setup path for learner access.',
  },
  {
    question: 'Can I save an application and return later?',
    answer:
      'Yes. The application flow supports secure saving and resuming. Use the same email address and the protected resume link sent through the application process.',
  },
  {
    question: 'How do learners sign in?',
    answer:
      'Learners use their matric number and password. Facilitators and administrators have separate email-based sign-in routes.',
  },
  {
    question: 'What do I need to study online?',
    answer:
      'A modern browser on a phone or computer and a dependable internet connection are sufficient for the core experience. Large resources are presented with download and low-data considerations where available.',
  },
] as const
