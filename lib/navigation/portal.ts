export type PortalIconName =
  | 'home'
  | 'course'
  | 'journal'
  | 'practice'
  | 'circles'
  | 'cases'
  | 'resources'
  | 'backpack'
  | 'calendar'
  | 'catalog'
  | 'quizzes'
  | 'skills'
  | 'discussions'
  | 'cpd'
  | 'messages'
  | 'settings'

export type PortalNavItem = {
  label: string
  href: string
  icon: PortalIconName
  description: string
}

export type PortalNavGroup = {
  label: string
  items: readonly PortalNavItem[]
}

export const LEARNER_NAV_GROUPS = [
  {
    label: 'Learn',
    items: [
      { label: 'Dashboard', href: '/learner/dashboard', icon: 'home', description: 'Your next learning action' },
      { label: 'My Course', href: '/learner/course/modules', icon: 'course', description: 'Modules and progress' },
      { label: 'Quizzes', href: '/learner/quizzes', icon: 'quizzes', description: 'Knowledge checks and results' },
      { label: 'Skills', href: '/learner/skills', icon: 'skills', description: 'Skills and development' },
      { label: 'Learning Journal', href: '/learner/journal/entries', icon: 'journal', description: 'Private reflective entries' },
      { label: 'Practice Client', href: '/learner/practice/chat', icon: 'practice', description: 'Guided practice conversations' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Peer Circles', href: '/learner/circles', icon: 'circles', description: 'Your learning circle' },
      { label: 'Discussions', href: '/learner/discussions', icon: 'discussions', description: 'Module conversations' },
      { label: 'Messages', href: '/learner/messages', icon: 'messages', description: 'Direct support and replies' },
    ],
  },
  {
    label: 'Library',
    items: [
      { label: 'Resources', href: '/learner/resources', icon: 'resources', description: 'Learning files and tools' },
      { label: 'Case Studies', href: '/learner/cases', icon: 'cases', description: 'Applied learning cases' },
      { label: 'My Backpack', href: '/learner/backpack', icon: 'backpack', description: 'Saved learning items' },
      { label: 'CPD Snippets', href: '/learner/cpd-snippets', icon: 'cpd', description: 'Short development resources' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { label: 'Calendar', href: '/learner/calendar', icon: 'calendar', description: 'Sessions and key dates' },
      { label: 'Catalogue', href: '/learner/catalog', icon: 'catalog', description: 'Available learning' },
      { label: 'Settings', href: '/learner/settings', icon: 'settings', description: 'Profile and preferences' },
    ],
  },
] as const satisfies readonly PortalNavGroup[]

export const LEARNER_PRIMARY_MOBILE_HREFS = [
  '/learner/dashboard',
  '/learner/course/modules',
  '/learner/journal/entries',
  '/learner/messages',
] as const

export function flattenNavGroups(groups: readonly PortalNavGroup[]) {
  return groups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })))
}

export function isPortalNavItemActive(pathname: string, href: string) {
  if (href === '/learner/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
