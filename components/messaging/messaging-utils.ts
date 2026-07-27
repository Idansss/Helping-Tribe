import {
  format,
  isSameDay,
  startOfDay,
  subDays,
} from 'date-fns'
import type {
  Conversation,
  ConversationFilter,
  DateGroup,
  MessageRecipientOption,
  MessageRow,
  MessagingRoleVariant,
  ThreadMessage,
} from './messaging-types'

export function displayName(fullName: string | null | undefined, fallback = 'Unknown'): string {
  const trimmed = fullName?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

export function roleLabel(role: string | null | undefined): string {
  switch ((role || '').toLowerCase()) {
    case 'student':
    case 'learner':
      return 'Learner'
    case 'mentor':
    case 'facilitator':
      return 'Facilitator'
    case 'admin':
    case 'administrator':
      return 'Admin'
    default:
      return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member'
  }
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

export function recipientDisplayLabel(option: MessageRecipientOption): string {
  if (option.label?.trim()) return option.label.trim()
  const name = displayName(option.name, 'Unnamed')
  if (option.role) return `${name} (${roleLabel(option.role)})`
  return name
}

export function canComposeForVariant(variant: MessagingRoleVariant, canCompose?: boolean): boolean {
  if (typeof canCompose === 'boolean') return canCompose
  return variant === 'admin' || variant === 'mentor'
}

export function emptyInboxCopy(variant: MessagingRoleVariant, override?: string): string {
  if (override) return override
  switch (variant) {
    case 'admin':
      return 'No conversations yet. Start a message with a learner or staff member.'
    case 'mentor':
      return 'No learner conversations yet. Start a message when support or follow-up is needed.'
    case 'learner':
    default:
      return 'No messages yet. Messages from your facilitators and permitted contacts will appear here.'
  }
}

export function aggregateConversations(
  messages: MessageRow[],
  userId: string,
  profiles: Record<string, { full_name?: string | null; role?: string | null; avatar_url?: string | null }>
): Conversation[] {
  const convMap = new Map<
    string,
    { last: MessageRow; unread: number }
  >()

  for (const message of messages) {
    const other =
      message.sender_id === userId ? message.recipient_id : message.sender_id
    const existing = convMap.get(other)
    if (!existing) {
      convMap.set(other, {
        last: message,
        unread:
          message.recipient_id === userId && !message.read_at ? 1 : 0,
      })
    } else {
      if (
        new Date(message.created_at).getTime() >
        new Date(existing.last.created_at).getTime()
      ) {
        existing.last = message
      }
      if (message.recipient_id === userId && !message.read_at) {
        existing.unread += 1
      }
    }
  }

  const conversations: Conversation[] = Array.from(convMap.entries()).map(
    ([otherId, { last, unread }]) => {
      const profile = profiles[otherId]
      return {
        otherId,
        otherName: displayName(profile?.full_name),
        otherRole: profile?.role ?? null,
        otherAvatarUrl: profile?.avatar_url?.trim() || null,
        lastMessage: last.body,
        lastAt: last.created_at,
        unreadCount: unread,
      }
    }
  )

  return sortConversations(conversations)
}

export function sortConversations(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  )
}

export function filterConversations(
  conversations: Conversation[],
  query: string,
  filter: ConversationFilter
): Conversation[] {
  const normalised = query.trim().toLowerCase()
  return conversations.filter((conversation) => {
    if (filter === 'unread' && conversation.unreadCount <= 0) return false
    if (!normalised) return true
    const role = roleLabel(conversation.otherRole).toLowerCase()
    const haystack = [
      conversation.otherName,
      role,
      conversation.otherRole ?? '',
      conversation.lastMessage,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalised)
  })
}

export function filterRecipients(
  options: MessageRecipientOption[],
  query: string
): MessageRecipientOption[] {
  const normalised = query.trim().toLowerCase()
  if (!normalised) return options
  return options.filter((option) => {
    const haystack = [
      option.name,
      option.label ?? '',
      option.role ?? '',
      roleLabel(option.role),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalised)
  })
}

export function mergeThreadMessages(
  outbound: MessageRow[],
  inbound: MessageRow[]
): MessageRow[] {
  return [...outbound, ...inbound].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

export function reconcileOptimisticMessage(
  thread: ThreadMessage[],
  clientKey: string,
  confirmed: MessageRow
): ThreadMessage[] {
  const withoutDuplicate = thread.filter(
    (message) => message.id !== confirmed.id && message.clientKey !== clientKey
  )
  const next: ThreadMessage = { ...confirmed, optimisticStatus: 'sent' }
  return [...withoutDuplicate, next].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

export function upsertRealtimeMessage(
  thread: ThreadMessage[],
  incoming: MessageRow
): ThreadMessage[] {
  if (thread.some((message) => message.id === incoming.id)) return thread
  const withoutMatchingOptimistic = thread.filter((message) => {
    if (message.optimisticStatus !== 'sending' && message.optimisticStatus !== 'failed') {
      return true
    }
    return !(
      message.sender_id === incoming.sender_id &&
      message.recipient_id === incoming.recipient_id &&
      message.body === incoming.body
    )
  })
  return [...withoutMatchingOptimistic, incoming].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

export function dateSeparatorLabel(iso: string, now = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  if (isSameDay(date, now)) return 'Today'
  if (isSameDay(date, subDays(now, 1))) return 'Yesterday'
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'EEEE, d MMMM')
  }
  return format(date, 'd MMMM yyyy')
}

export function groupMessagesByDate(
  messages: ThreadMessage[],
  now = new Date()
): DateGroup[] {
  const groups: DateGroup[] = []
  for (const message of messages) {
    const day = startOfDay(new Date(message.created_at))
    const key = Number.isNaN(day.getTime())
      ? 'unknown'
      : day.toISOString()
    const last = groups[groups.length - 1]
    if (last && last.key === key) {
      last.messages.push(message)
    } else {
      groups.push({
        key,
        label: dateSeparatorLabel(message.created_at, now),
        messages: [message],
      })
    }
  }
  return groups
}

export function shouldShowAvatar(
  messages: ThreadMessage[],
  index: number,
  userId: string
): boolean {
  const message = messages[index]
  if (!message || message.sender_id === userId) return false
  const previous = messages[index - 1]
  if (!previous) return true
  if (previous.sender_id !== message.sender_id) return true
  return !isSameDay(new Date(previous.created_at), new Date(message.created_at))
}

export function createOptimisticId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `optimistic-${crypto.randomUUID()}`
  }
  return `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function unreadCountFor(conversations: Conversation[]): number {
  return conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0)
}
