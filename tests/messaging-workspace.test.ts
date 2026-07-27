import { describe, expect, it } from 'vitest'
import { isFullViewportRoute, FULL_VIEWPORT_ROUTES } from '@/lib/portal/full-viewport-routes'
import {
  aggregateConversations,
  canComposeForVariant,
  dateSeparatorLabel,
  displayName,
  emptyInboxCopy,
  filterConversations,
  filterRecipients,
  groupMessagesByDate,
  mergeThreadMessages,
  reconcileOptimisticMessage,
  roleLabel,
  sortConversations,
  upsertRealtimeMessage,
} from '@/components/messaging/messaging-utils'
import type { Conversation, MessageRow, ThreadMessage } from '@/components/messaging/messaging-types'

function msg(partial: Partial<MessageRow> & Pick<MessageRow, 'id' | 'sender_id' | 'recipient_id' | 'body'>): MessageRow {
  return {
    read_at: null,
    created_at: '2026-01-01T12:00:00.000Z',
    ...partial,
  }
}

describe('full viewport messaging routes', () => {
  it('includes portal messaging routes and practice chat only', () => {
    expect(FULL_VIEWPORT_ROUTES.has('/admin/messages')).toBe(true)
    expect(FULL_VIEWPORT_ROUTES.has('/mentor/messages')).toBe(true)
    expect(FULL_VIEWPORT_ROUTES.has('/learner/messages')).toBe(true)
    expect(FULL_VIEWPORT_ROUTES.has('/learner/practice/chat')).toBe(true)
    expect(isFullViewportRoute('/messages')).toBe(false)
    expect(isFullViewportRoute('/admin/users')).toBe(false)
  })
})

describe('messaging utilities', () => {
  it('falls back profile names safely', () => {
    expect(displayName(null)).toBe('Unknown')
    expect(displayName('  ')).toBe('Unknown')
    expect(displayName(' Ada Lovelace ')).toBe('Ada Lovelace')
  })

  it('maps roles for display and compose permissions', () => {
    expect(roleLabel('student')).toBe('Learner')
    expect(roleLabel('mentor')).toBe('Facilitator')
    expect(canComposeForVariant('admin')).toBe(true)
    expect(canComposeForVariant('mentor')).toBe(true)
    expect(canComposeForVariant('learner')).toBe(false)
    expect(canComposeForVariant('learner', true)).toBe(true)
  })

  it('aggregates conversations with unread counts and sorting', () => {
    const messages = [
      msg({
        id: '1',
        sender_id: 'a',
        recipient_id: 'me',
        body: 'Older',
        created_at: '2026-01-01T10:00:00.000Z',
        read_at: null,
      }),
      msg({
        id: '2',
        sender_id: 'a',
        recipient_id: 'me',
        body: 'Newer unread',
        created_at: '2026-01-02T10:00:00.000Z',
        read_at: null,
      }),
      msg({
        id: '3',
        sender_id: 'me',
        recipient_id: 'b',
        body: 'Latest overall',
        created_at: '2026-01-03T10:00:00.000Z',
      }),
    ]

    const conversations = aggregateConversations(messages, 'me', {
      a: { full_name: 'Alex', role: 'student', avatar_url: null },
      b: { full_name: 'Blake', role: 'admin', avatar_url: null },
    })

    expect(conversations[0]?.otherId).toBe('b')
    expect(conversations[1]?.otherId).toBe('a')
    expect(conversations[1]?.unreadCount).toBe(2)
    expect(conversations[1]?.lastMessage).toBe('Newer unread')
  })

  it('filters conversations by search and unread', () => {
    const conversations: Conversation[] = [
      {
        otherId: '1',
        otherName: 'Rahmat',
        otherRole: 'student',
        otherAvatarUrl: null,
        lastMessage: 'Good morning',
        lastAt: '2026-01-02T00:00:00.000Z',
        unreadCount: 2,
      },
      {
        otherId: '2',
        otherName: 'Obiageli',
        otherRole: 'mentor',
        otherAvatarUrl: null,
        lastMessage: 'See you soon',
        lastAt: '2026-01-01T00:00:00.000Z',
        unreadCount: 0,
      },
    ]

    expect(filterConversations(conversations, 'learner', 'all')).toHaveLength(1)
    expect(filterConversations(conversations, 'good', 'all')[0]?.otherId).toBe('1')
    expect(filterConversations(conversations, '', 'unread')).toHaveLength(1)
  })

  it('filters recipients while preserving authorised list', () => {
    const recipients = [
      { id: '1', name: 'Ada', role: 'student' },
      { id: '2', name: 'Grace', role: 'admin' },
    ]
    expect(filterRecipients(recipients, 'learner')).toEqual([recipients[0]])
    expect(filterRecipients(recipients, 'zzz')).toEqual([])
  })

  it('orders thread messages and groups by date', () => {
    const merged = mergeThreadMessages(
      [msg({ id: '2', sender_id: 'me', recipient_id: 'a', body: 'Second', created_at: '2026-01-02T12:00:00.000Z' })],
      [msg({ id: '1', sender_id: 'a', recipient_id: 'me', body: 'First', created_at: '2026-01-01T12:00:00.000Z' })]
    )
    expect(merged.map((entry) => entry.id)).toEqual(['1', '2'])

    const groups = groupMessagesByDate(merged, new Date('2026-01-02T18:00:00.000Z'))
    expect(groups).toHaveLength(2)
    expect(dateSeparatorLabel('2026-01-02T12:00:00.000Z', new Date('2026-01-02T18:00:00.000Z'))).toBe('Today')
    expect(dateSeparatorLabel('2026-01-01T12:00:00.000Z', new Date('2026-01-02T18:00:00.000Z'))).toBe('Yesterday')
  })

  it('reconciles optimistic messages and prevents realtime duplicates', () => {
    const optimistic: ThreadMessage = {
      id: 'optimistic-1',
      clientKey: 'optimistic-1',
      sender_id: 'me',
      recipient_id: 'a',
      body: 'Hello',
      read_at: null,
      created_at: '2026-01-01T12:00:00.000Z',
      optimisticStatus: 'sending',
    }
    const confirmed = msg({
      id: 'db-1',
      sender_id: 'me',
      recipient_id: 'a',
      body: 'Hello',
      created_at: '2026-01-01T12:00:01.000Z',
    })

    const reconciled = reconcileOptimisticMessage([optimistic], 'optimistic-1', confirmed)
    expect(reconciled).toHaveLength(1)
    expect(reconciled[0]?.id).toBe('db-1')

    const withDuplicate = upsertRealtimeMessage(reconciled, confirmed)
    expect(withDuplicate).toHaveLength(1)
  })

  it('sorts conversations and provides role-aware empty copy', () => {
    const sorted = sortConversations([
      {
        otherId: '1',
        otherName: 'A',
        otherRole: null,
        otherAvatarUrl: null,
        lastMessage: 'x',
        lastAt: '2026-01-01T00:00:00.000Z',
        unreadCount: 0,
      },
      {
        otherId: '2',
        otherName: 'B',
        otherRole: null,
        otherAvatarUrl: null,
        lastMessage: 'y',
        lastAt: '2026-02-01T00:00:00.000Z',
        unreadCount: 0,
      },
    ])
    expect(sorted[0]?.otherId).toBe('2')
    expect(emptyInboxCopy('admin')).toContain('learner or staff')
    expect(emptyInboxCopy('mentor')).toContain('learner conversations')
    expect(emptyInboxCopy('learner')).toContain('facilitators')
  })
})
