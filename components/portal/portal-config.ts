import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  Home,
  Layers3,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Mail,
  MessageCircle,
  MessageSquare,
  Settings,
  Settings2,
  Sparkles,
  UserCircle,
  Users,
  Video,
} from 'lucide-react'

export type PortalRole = 'admin' | 'mentor' | 'learner'

export type PortalNavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  description: string
}

export type PortalNavigationGroup = {
  label: string
  items: readonly PortalNavigationItem[]
}

export type PortalPageMeta = {
  title: string
  description: string
}

type PortalConfig = {
  workspaceLabel: string
  ariaLabel: string
  searchPlaceholder: string
  homeHref: string
  profileHref: string
  settingsHref: string
  fallbackName: string
  storageKey: string
  footer: string
  navigation: readonly PortalNavigationGroup[]
  pageMeta: Readonly<Record<string, PortalPageMeta>>
}

const adminNavigation = [
  { label: 'Operations', items: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, description: 'Admissions and learning overview' },
    { label: 'Applicants', href: '/admin/applicants', icon: ClipboardList, description: 'Review admissions decisions' },
    { label: 'Users', href: '/admin/users', icon: Users, description: 'Manage portal accounts and roles' },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3, description: 'Training and engagement reporting' },
  ] },
  { label: 'Learning', items: [
    { label: 'Courses', href: '/admin/courses', icon: BookOpen, description: 'Course and module administration' },
    { label: 'Quizzes', href: '/admin/quizzes', icon: ListChecks, description: 'Assessments and learner responses' },
    { label: 'Learning paths', href: '/admin/learning-paths', icon: Layers3, description: 'Structured learning sequences' },
    { label: 'Skills', href: '/admin/skills', icon: Sparkles, description: 'Competency framework and tracking' },
    { label: 'Course store', href: '/admin/course-store', icon: LayoutGrid, description: 'Published learning catalogue' },
    { label: 'Journals', href: '/admin/journals', icon: BookMarked, description: 'Learner reflection oversight' },
    { label: 'Case Studies', href: '/admin/case-studies', icon: Briefcase, description: 'Applied learning cases' },
    { label: 'CPD Snippets', href: '/admin/cpd-snippets', icon: GraduationCap, description: 'Short development resources' },
    { label: 'Resources', href: '/admin/resources', icon: FolderOpen, description: 'Files and supporting material' },
  ] },
  { label: 'Community', items: [
    { label: 'Messages', href: '/admin/messages', icon: MessageCircle, description: 'Portal conversations' },
    { label: 'Groups', href: '/admin/groups', icon: Users, description: 'Cohorts and peer circles' },
    { label: 'Discussions', href: '/admin/discussions', icon: MessageSquare, description: 'Learning discussions' },
    { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays, description: 'Training events and schedule' },
  ] },
  { label: 'System', items: [
    { label: 'Notifications', href: '/admin/notifications', icon: Bell, description: 'Portal alerts and updates' },
    { label: 'Newsletter', href: '/admin/newsletter', icon: Mail, description: 'Community newsletter' },
    { label: 'Outbox', href: '/admin/outbox', icon: Mail, description: 'Queued and sent email' },
    { label: 'Branches', href: '/admin/branches', icon: Layers3, description: 'Programme locations and branches' },
    { label: 'Automations', href: '/admin/automations', icon: Sparkles, description: 'Scheduled portal workflows' },
    { label: 'Subscription', href: '/admin/subscription', icon: Settings2, description: 'Plan and billing information' },
    { label: 'Settings', href: '/admin/settings', icon: Settings2, description: 'Registration and access controls' },
  ] },
] as const satisfies readonly PortalNavigationGroup[]

const mentorNavigation = [
  { label: 'Overview', items: [
    { label: 'Home', href: '/mentor', icon: Home, description: 'Facilitation overview' },
    { label: 'Learners', href: '/mentor/students', icon: Users, description: 'Learner roster and support' },
    { label: 'Review & feedback', href: '/mentor/grading', icon: ClipboardList, description: 'Grade submissions and respond' },
    { label: 'Reports', href: '/mentor/reports', icon: BarChart3, description: 'Learner progress and outcomes' },
  ] },
  { label: 'Learning', items: [
    { label: 'Courses', href: '/mentor/courses', icon: BookOpen, description: 'Course content and delivery' },
    { label: 'Journals', href: '/mentor/journals', icon: BookMarked, description: 'Review learner reflections' },
    { label: 'Learning paths', href: '/mentor/learning-paths', icon: Layers3, description: 'Structured learning sequences' },
    { label: 'Case Studies', href: '/mentor/case-studies', icon: Briefcase, description: 'Applied learning cases' },
    { label: 'Resources', href: '/mentor/resources', icon: FolderOpen, description: 'Teaching files and resources' },
    { label: 'Catalogue', href: '/mentor/catalog', icon: LayoutGrid, description: 'Available learning' },
    { label: 'Practice Client', href: '/mentor/practice', icon: UserCircle, description: 'Guided practice conversations' },
    { label: 'Quizzes', href: '/mentor/quizzes', icon: ListChecks, description: 'Assessments and results' },
    { label: 'Skills', href: '/mentor/skills', icon: Sparkles, description: 'Competency development' },
    { label: 'CPD Snippets', href: '/mentor/cpd-snippets', icon: GraduationCap, description: 'Short development resources' },
  ] },
  { label: 'Community', items: [
    { label: 'Peer Circles', href: '/mentor/groups', icon: Users, description: 'Create and support peer circles' },
    { label: 'Conferences', href: '/mentor/conferences', icon: Video, description: 'Live learning sessions' },
    { label: 'Calendar', href: '/mentor/calendar', icon: CalendarDays, description: 'Events and facilitation schedule' },
    { label: 'Discussions', href: '/mentor/discussions', icon: MessageSquare, description: 'Module conversations' },
    { label: 'Messages', href: '/mentor/messages', icon: MessageCircle, description: 'Learner conversations' },
  ] },
  { label: 'Account', items: [
    { label: 'Settings', href: '/mentor/settings', icon: Settings, description: 'Profile and preferences' },
  ] },
] as const satisfies readonly PortalNavigationGroup[]

const learnerNavigation = [
  { label: 'Learn', items: [
    { label: 'Dashboard', href: '/learner/dashboard', icon: Home, description: 'Your next learning action' },
    { label: 'My Course', href: '/learner/course/modules', icon: BookOpen, description: 'Modules and progress' },
    { label: 'Quizzes', href: '/learner/quizzes', icon: ListChecks, description: 'Knowledge checks and results' },
    { label: 'Assessments', href: '/learner/assessments', icon: ClipboardList, description: 'Structured skills assessments' },
    { label: 'Skills', href: '/learner/skills', icon: Sparkles, description: 'Skills and development' },
    { label: 'Learning Journal', href: '/learner/journal/entries', icon: BookMarked, description: 'Private reflective entries' },
    { label: 'Practice Client', href: '/learner/practice/chat', icon: UserCircle, description: 'AI Practice Studio simulations' },
  ] },
  { label: 'Community', items: [
    { label: 'Peer Circles', href: '/learner/circles', icon: Users, description: 'Your learning circle' },
    { label: 'Discussions', href: '/learner/discussions', icon: MessageSquare, description: 'Module conversations' },
    { label: 'Messages', href: '/learner/messages', icon: Mail, description: 'Direct support and replies' },
  ] },
  { label: 'Library', items: [
    { label: 'Resources', href: '/learner/resources', icon: FolderOpen, description: 'Learning files and tools' },
    { label: 'Case Studies', href: '/learner/cases', icon: Briefcase, description: 'Applied learning cases' },
    { label: 'My Backpack', href: '/learner/backpack', icon: BookMarked, description: 'Saved learning items' },
    { label: 'Final Projects', href: '/learner/final-projects', icon: Briefcase, description: 'Capstone project work' },
    { label: 'Certificate', href: '/learner/certificate', icon: GraduationCap, description: 'Training completion record' },
    { label: 'CPD Snippets', href: '/learner/cpd-snippets', icon: GraduationCap, description: 'Short development resources' },
  ] },
  { label: 'Planning', items: [
    { label: 'Calendar', href: '/learner/calendar', icon: CalendarDays, description: 'Sessions and key dates' },
    { label: 'Catalogue', href: '/learner/catalog', icon: LayoutGrid, description: 'Available learning' },
    { label: 'Settings', href: '/learner/settings', icon: Settings, description: 'Profile and preferences' },
  ] },
] as const satisfies readonly PortalNavigationGroup[]

const genericMeta = (title: string, description: string): PortalPageMeta => ({ title, description })

export const PORTAL_CONFIG: Readonly<Record<PortalRole, PortalConfig>> = {
  admin: {
    workspaceLabel: 'Administration', ariaLabel: 'Administrator navigation', searchPlaceholder: 'Search users, applicants, courses…',
    homeHref: '/admin', profileHref: '/admin/profile', settingsHref: '/admin/settings', fallbackName: 'Administrator', storageKey: 'ht-admin-profile',
    footer: 'Helping Tribe Academy administration', navigation: adminNavigation,
    pageMeta: {
      '/admin': genericMeta('Dashboard', 'Admissions, learner progress and portal operations.'),
      '/admin/applicants': genericMeta('Applicants', 'Review applications and manage admissions decisions.'),
      '/admin/users': genericMeta('Users', 'Manage portal accounts, roles and access.'),
      '/admin/reports': genericMeta('Reports', 'Review training progress and community impact.'),
      '/admin/calendar': genericMeta('Calendar', 'Manage the shared training schedule.'),
      '/admin/courses': genericMeta('Courses', 'Manage courses, modules and delivery.'),
      '/admin/quizzes': genericMeta('Quizzes', 'Manage assessments and learner responses.'),
      '/admin/learning-paths': genericMeta('Learning paths', 'Organise structured learning sequences.'),
      '/admin/skills': genericMeta('Skills', 'Manage the competency framework.'),
      '/admin/course-store': genericMeta('Course store', 'Manage published learning offers.'),
      '/admin/journals': genericMeta('Journals', 'Review learner reflection activity.'),
      '/admin/case-studies': genericMeta('Case Studies', 'Manage applied learning scenarios.'),
      '/admin/cpd-snippets': genericMeta('CPD Snippets', 'Manage short development resources.'),
      '/admin/resources': genericMeta('Resources', 'Manage learning files and support material.'),
      '/admin/messages': genericMeta('Messages', 'Coordinate with learners and facilitators.'),
      '/admin/groups': genericMeta('Groups', 'Manage cohorts and peer circles.'),
      '/admin/discussions': genericMeta('Discussions', 'Manage learning conversations.'),
      '/admin/notifications': genericMeta('Notifications', 'Review portal alerts and activity.'),
      '/admin/newsletter': genericMeta('Newsletter', 'Prepare updates for the Helping Tribe community.'),
      '/admin/outbox': genericMeta('Outbox', 'Review queued and sent email.'),
      '/admin/branches': genericMeta('Branches', 'Manage programme locations and branches.'),
      '/admin/automations': genericMeta('Automations', 'Manage scheduled portal workflows.'),
      '/admin/subscription': genericMeta('Subscription', 'Review plan and billing information.'),
      '/admin/settings': genericMeta('Settings', 'Configure registration, access and portal preferences.'),
      '/admin/profile': genericMeta('Profile', 'Manage your administrator profile.'),
    },
  },
  mentor: {
    workspaceLabel: 'Facilitator workspace', ariaLabel: 'Facilitator navigation', searchPlaceholder: 'Search courses, learners, resources…',
    homeHref: '/mentor', profileHref: '/mentor/settings', settingsHref: '/mentor/settings', fallbackName: 'Facilitator', storageKey: 'ht-mentor-profile',
    footer: 'Facilitation workspace · Helping Tribe Academy', navigation: mentorNavigation,
    pageMeta: {
      '/mentor': genericMeta('Dashboard', 'Monitor learners, course engagement and support needs.'),
      '/mentor/students': genericMeta('Learners', 'View learner progress and provide support.'),
      '/mentor/grading': genericMeta('Review & feedback', 'Review submissions and provide constructive feedback.'),
      '/mentor/reports': genericMeta('Reports', 'Explore learner progress and outcomes.'),
      '/mentor/courses': genericMeta('Courses', 'Manage learning content and delivery.'),
      '/mentor/journals': genericMeta('Journals', 'Review learner reflections.'),
      '/mentor/learning-paths': genericMeta('Learning paths', 'Organise structured learning sequences.'),
      '/mentor/case-studies': genericMeta('Case Studies', 'Manage applied learning scenarios.'),
      '/mentor/resources': genericMeta('Resources', 'Manage teaching files and support material.'),
      '/mentor/catalog': genericMeta('Catalogue', 'Browse available learning.'),
      '/mentor/practice': genericMeta('Practice Client', 'Support guided counselling practice.'),
      '/mentor/quizzes': genericMeta('Quizzes', 'Manage assessments and results.'),
      '/mentor/skills': genericMeta('Skills', 'Track learner competency development.'),
      '/mentor/cpd-snippets': genericMeta('CPD Snippets', 'Share short development resources.'),
      '/mentor/groups': genericMeta('Peer Circles', 'Create peer circles and add learners.'),
      '/mentor/conferences': genericMeta('Conferences', 'Manage live learning sessions.'),
      '/mentor/calendar': genericMeta('Calendar', 'Manage events and facilitation sessions.'),
      '/mentor/discussions': genericMeta('Discussions', 'Support module conversations.'),
      '/mentor/messages': genericMeta('Messages', 'Coordinate directly with learners.'),
      '/mentor/settings': genericMeta('Settings', 'Manage your profile and preferences.'),
    },
  },
  learner: {
    workspaceLabel: 'Learner workspace', ariaLabel: 'Learner navigation', searchPlaceholder: 'Search courses, resources, discussions…',
    homeHref: '/learner/dashboard', profileHref: '/learner/settings', settingsHref: '/learner/settings', fallbackName: 'Learner', storageKey: 'ht-learner-profile',
    footer: 'Your HELP Foundations learning workspace', navigation: learnerNavigation,
    pageMeta: {
      '/learner/dashboard': genericMeta('Dashboard', 'See your next learning action and current progress.'),
      '/learner/course/modules': genericMeta('My Course', 'Continue through your HELP Foundations modules.'),
      '/learner/quizzes': genericMeta('Quizzes', 'Complete knowledge checks and review results.'),
      '/learner/assessments': genericMeta('Assessments', 'Complete structured skills assessments.'),
      '/learner/skills': genericMeta('Skills', 'Track the competencies developed across your training.'),
      '/learner/journal/entries': genericMeta('Learning Journal', 'Capture and revisit private reflections.'),
      '/learner/practice/chat': genericMeta('Practice Client', 'Build confidence through guided conversations with simulated clients.'),
      '/learner/circles': genericMeta('Peer Circles', 'Connect with your learning circle.'),
      '/learner/discussions': genericMeta('Discussions', 'Take part in module conversations.'),
      '/learner/messages': genericMeta('Messages', 'Read and send support messages.'),
      '/learner/resources': genericMeta('Resources', 'Find learning files and practical tools.'),
      '/learner/cases': genericMeta('Case Studies', 'Apply your learning to realistic scenarios.'),
      '/learner/backpack': genericMeta('My Backpack', 'Return to your saved learning items.'),
      '/learner/final-projects': genericMeta('Final Projects', 'Complete and submit your capstone work.'),
      '/learner/certificate': genericMeta('Certificate', 'Review your training completion record.'),
      '/learner/cpd-snippets': genericMeta('CPD Snippets', 'Explore short development resources.'),
      '/learner/calendar': genericMeta('Calendar', 'Review sessions and key dates.'),
      '/learner/catalog': genericMeta('Catalogue', 'Browse available learning.'),
      '/learner/settings': genericMeta('Settings', 'Manage your profile and preferences.'),
    },
  },
}

export function isPortalItemActive(pathname: string, href: string) {
  const exactOnly = href === '/admin' || href === '/mentor' || href === '/learner/dashboard'
  return pathname === href || (!exactOnly && pathname.startsWith(`${href}/`))
}

export function getPortalPageMeta(role: PortalRole, pathname: string): PortalPageMeta {
  const entries = Object.entries(PORTAL_CONFIG[role].pageMeta).sort(([a], [b]) => b.length - a.length)
  const match = entries.find(([href]) => pathname === href || pathname.startsWith(`${href}/`))
  return match?.[1] ?? genericMeta('Workspace', 'Helping Tribe Academy portal.')
}
