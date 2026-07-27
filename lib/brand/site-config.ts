export type ContentConfidence = 'verified-in-code' | 'existing-production' | 'client-confirmation-required'

export type SiteContentValue<T> = {
  value: T
  confidence: ContentConfidence
  source: string
}

export const SITE_CONFIG = {
  organisation: {
    name: 'The Helping Tribe',
    schoolName: 'The Helping Tribe School of Counselling & Positive Psychology',
    shortName: 'Helping Tribe Academy',
    programmeName: 'HELP Foundations',
  },
  contact: {
    email: {
      value: 'helpingtribe@blakmoh.com',
      confidence: 'existing-production',
      source: 'Existing public footer and contact routes',
    } satisfies SiteContentValue<string>,
    phone: {
      value: '+234 703 0052 021',
      confidence: 'existing-production',
      source: 'Existing public footer',
    } satisfies SiteContentValue<string>,
  },
  programme: {
    durationWeeks: {
      value: 9,
      confidence: 'verified-in-code',
      source: 'Current module journey and programme configuration',
    } satisfies SiteContentValue<number>,
    delivery: {
      value: 'Online, guided learning',
      confidence: 'verified-in-code',
      source: 'Current LMS delivery model',
    } satisfies SiteContentValue<string>,
    fee: {
      value: null,
      confidence: 'client-confirmation-required',
      source: 'Conflicting public and payment configuration values; do not publish until confirmed',
    } satisfies SiteContentValue<number | null>,
    faculty: {
      value: [],
      confidence: 'client-confirmation-required',
      source: 'Existing names and biographies have no approval evidence in the repository',
    } satisfies SiteContentValue<readonly unknown[]>,
  },
  publicNavigation: [
    { label: 'About', href: '#about' },
    { label: 'Curriculum', href: '#curriculum' },
    { label: 'Experience', href: '#experience' },
    { label: 'FAQ', href: '#faq' },
  ],
} as const

export const CURRICULUM_MODULES = [
  {
    week: 1,
    title: 'Helping Profession, Ethics & Cultural Competence',
    description: 'Foundations of the helping profession, professional ethics, and cultural competence in Nigerian contexts.',
  },
  {
    week: 2,
    title: 'Exploration & Insight Stages, Trauma-Informed Practice',
    description: 'Exploration and insight skills, trauma-informed practice, and active listening.',
  },
  {
    week: 3,
    title: 'Action Stage & Conflict Resolution',
    description: 'Supporting movement from awareness to action, coping strategies, and conflict resolution.',
  },
  {
    week: 4,
    title: 'Self-Care & Supervision',
    description: 'Burnout prevention, reflective supervision, and sustainable personal practice.',
  },
  {
    week: 5,
    title: 'Gender & Cultural Sensitivity',
    description: 'Culturally responsive support across identities, communities, disability, and lived experience.',
  },
  {
    week: 6,
    title: 'Crisis Intervention & Trauma Support',
    description: 'Crisis frameworks, trauma support principles, grounding, reassurance, and referral.',
  },
  {
    week: 7,
    title: 'Group Counselling & Peer Support',
    description: 'Group facilitation, peer support models, and collaborative practice.',
  },
  {
    week: 8,
    title: 'Practicum: Case Analysis',
    description: 'Case analysis, structured feedback, and reflective practice.',
  },
  {
    week: 9,
    title: 'Final Projects & Graduation',
    description: 'An integrated capstone, structured feedback, and programme completion.',
  },
] as const
